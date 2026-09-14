import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FolderOffIcon from '@mui/icons-material/FolderOff';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellNoData, TablecellSelling, TablecellTickets } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { API_BASE, apiPost, apiPut } from "../../server/apiClient";
import InsertFinancial from "./InsertFinancial";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";
import { buildPeriodsForYear, findCurrentPeriod } from "./Paid";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import UpdateFinancial from "./UpdateFinancial";
import TablePaginationBar from "../../theme/TablePaginationBar";

const Financial = () => {
    const [search, setSearch] = useState("");
    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(null);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [group, setGroup] = useState("ทั้งหมด");
    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            setSelectedDateStart(newValue);
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            setSelectedDateEnd(newValue);
        }
    };

    const { reghead, regtail, small, companypayment, expenseitems } = useBasicData();
    const { report, refetch: refetchTripData } = useTripData();
    const reports = Object.values(report || {});
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(regtail);
    const registrationS = Object.values(small);
    const expenseitem = Object.values(expenseitems);
    const companypaymentDetail = Object.values(companypayment);

    const getRegistration = () => {
        const registartion = [
            ...registrationH.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "หัวรถใหญ่" })),
            ...registrationT.map((item) => ({ ...item, Registration: item.RegTail, TruckType: "หางรถใหญ่" })),
            ...registrationS.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "รถเล็ก" })),
        ];

        return registartion;
    };

    // report_invoice.Registration is a real UUID FK into truck_registration
    // now, not "id:PlateText" text - the plate name is already on the row as
    // RegistrationName, no lookup needed.
    const resolveRegistrationDisplay = (row) => row?.RegistrationName || "";

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/").map(Number);
        return new Date(year, month - 1, day);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            } else {
                return { key, direction: "asc" };
            }
        });
    };

    const reportDetail = reports.filter((item) => {
        const itemDate = dayjs(item.SelectedDateInvoice, "DD/MM/YYYY");
        const registrations = resolveRegistrationDisplay(item);
        const company = item?.CompanyName || item?.Company || "";
        const bank = item?.BankName || item?.Bank || "";

        return (
            itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") &&
            item.Status !== "ยกเลิก" &&
            (
                registrations.toLowerCase().includes(search.toLowerCase()) ||
                company.toLowerCase().includes(search.toLowerCase()) ||
                bank.toLowerCase().includes(search.toLowerCase())
            )
        );
    }).sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        if (
            typeof aValue === "string" &&
            typeof bValue === "string" &&
            /^\d{2}\/\d{2}\/\d{4}$/.test(aValue) &&
            /^\d{2}\/\d{2}\/\d{4}$/.test(bValue)
        ) {
            const dateA = parseDate(aValue);
            const dateB = parseDate(bValue);
            return sortConfig.direction === "asc"
                ? dateA - dateB
                : dateB - dateA;
        }

        return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue), "th")
            : String(bValue).localeCompare(String(aValue), "th");
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredData =
        group === "ทั้งหมด"
            ? reportDetail
            : reportDetail.filter(row => (row.Group ?? "เดี่ยว") === group);

    let finalData;

    const getMergeKey = (row) => {
        return [
            row.Bank ?? "",
            row.Company ?? "",
            row.Details ?? "",
            row.InvoiceID ?? "",
            row.Group ?? "เดี่ยว",
            row.SelectedDateInvoice ?? "",
            row.Note ?? "",
        ]
            .map(v => String(v).trim())
            .join("|");
    };

    const mergeGroupData = (data) =>
        Object.values(
            data.reduce((acc, row) => {

                const mergeKey = getMergeKey(row);

                if (!acc[mergeKey]) {
                    acc[mergeKey] = {
                        id: row.id,
                        Group: row.Group ?? "เดี่ยว",
                        InvoiceID: row.InvoiceID,
                        SelectedDateInvoice: row.SelectedDateInvoice,
                        SelectedDateTransfer: row.SelectedDateTransfer,
                        Company: row.Company,
                        Details: row.Details,
                        Bank: row.Bank,
                        Note: row.Note,
                        Status: row.Status,
                        Registration: "",
                        TruckType: "",
                        Price: row.Price || 0,
                        Vat: row.Vat || 0,
                        Total: row.Total || 0,

                        MergedDetails: [row],
                    };
                } else {
                    acc[mergeKey].Price += row.Price || 0;
                    acc[mergeKey].Vat += row.Vat || 0;
                    acc[mergeKey].Total += row.Total || 0;
                    acc[mergeKey].MergedDetails.push(row);
                }

                return acc;
            }, {})
        );

    if (group === "กลุ่ม") {
        finalData = mergeGroupData(filteredData);

    } else if (group === "ทั้งหมด") {

        const groupRows = filteredData.filter(r => r.Group === "กลุ่ม");
        const singleRows = filteredData.filter(r => (r.Group ?? "เดี่ยว") !== "กลุ่ม");

        finalData = [
            ...singleRows,
            ...mergeGroupData(groupRows)
        ];

    } else {
        finalData = filteredData;
    }

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานชำระค่าน้ำมัน");

        // 1️⃣ กำหนด columns
        worksheet.columns = [
            { header: "ลำดับ", key: "no", width: 8 },
            { header: "เลขที่บิล", key: "invoice", width: 15 },
            { header: "วันที่บิล", key: "dateInvoice", width: 15 },
            { header: "วันที่โอน", key: "dateTransfer", width: 15 },
            { header: "ป้ายทะเบียน", key: "registration", width: 35 },
            { header: "ชื่อบริษัท", key: "company", width: 30 },
            { header: "ชื่อบัญชี", key: "bank", width: 30 },
            { header: "ยอดก่อนVat", key: "price", width: 15 },
            { header: "ยอดVat", key: "vat", width: 15 },
            { header: "รวม", key: "total", width: 15 },
            { header: "รายละเอียด", key: "details", width: 30 },
            { header: "ลิ้ง", key: "path", width: 80 },
        ];

        // 2️⃣ Title merge
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "รายงานชำระค่าน้ำมัน";
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { size: 16, bold: true };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDEBF7" } };
        worksheet.getRow(1).height = 30;

        // 3️⃣ Header row (row 2)
        const headerRow = worksheet.addRow(worksheet.columns.map(c => c.header));
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 4️⃣ Data rows
        reportDetail.forEach((row, index) => {
            const dataRow = {
                no: index + 1,
                invoice: row.InvoiceID,
                dateInvoice: formatThaiSlash(dayjs(row.SelectedDateInvoice, "DD/MM/YYYY")),
                dateTransfer: formatThaiSlash(dayjs(row.SelectedDateTransfer, "DD/MM/YYYY")),
                registration: `${resolveRegistrationDisplay(row)} (${row.TruckType})`,
                company: row.CompanyName,
                bank: row.BankName,
                price: row.Price,
                vat: row.Vat,
                total: row.Total,
                details: row.Details,
                path: row.Path ? `https://${row.Path}` : "-"
            };
            const newRow = worksheet.addRow(dataRow);
            newRow.height = 20;
            newRow.alignment = { horizontal: "center", vertical: "middle" };
            newRow.eachCell((cell, colNumber) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                // ยกเว้น column "no"
                if (worksheet.columns[colNumber - 1].key !== "no") {
                    cell.numFmt = "#,##0.00";
                }
            });
        });

        // 5️⃣ Footer row รวมค่า
        const footerRow = worksheet.addRow({
            bank: "รวม",
            price: reportDetail.reduce((acc, r) => acc + Number(r.Price), 0),
            vat: reportDetail.reduce((acc, r) => acc + Number(r.Vat), 0),
            total: reportDetail.reduce((acc, r) => acc + Number(r.Total), 0),
        });
        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.height = 25;
        footerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE699" } }; // เหลือง
            cell.numFmt = "#,##0.00";
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 6️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานบิลค่าใช้จ่าย_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };


    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id} ใช่หรือไม่`,
            async () => {
                const targetRow = reportDetail.find((row) => row.id === id);
                if (!targetRow?.uuid) {
                    ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
                    return;
                }

                try {
                    await apiPut(`/api/report_invoice/${targetRow.uuid}`, { Status: "ยกเลิก" });
                    ShowSuccess("ลบข้อมูลสำเร็จ");
                    refetchTripData?.();
                } catch (error) {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                }
            },
            () => { }
        );
    }

    const [billID, setBillID] = useState("");
    const [invoiceID, setInvoiceID] = useState("");
    const [selectedDateInvoice, setSelectedDateInvoice] = useState(dayjs(new Date));
    const [selectedDateTransfer, setSelectedDateTransfer] = useState(dayjs(new Date));
    const [registration, setRegistration] = useState("");
    const [regID, setRegID] = useState(0);
    const [company, setCompany] = useState("");
    const [companyID, setCompanyID] = useState(0);
    const [bank, setBank] = useState("");
    const [price, setPrice] = useState("");
    const [vat, setVat] = useState("");
    const [total, setTotal] = useState("");
    const [details, setDetails] = useState("");
    const [trucktype, setTruckType] = useState("");
    const [path, setPath] = useState(null);
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [mergedDetails, setMergedDetails] = useState([]);
    const [id, setID] = useState("");
    const [finanCialCheck, setFinanCialCheck] = useState(null);

    const handleUpdateBill = (row) => {
        setBillID(row.id);
        setInvoiceID(row.InvoiceID);
        setSelectedDateInvoice(row.SelectedDateInvoice);
        setSelectedDateTransfer(row.SelectedDateTransfer);
        setRegistration(`${row.Registration}:${row.RegistrationName}`);
        setRegID(row.Registration);
        setCompany(row.Company);
        setCompanyID(row.Company);
        setBank(row.Bank);
        setPrice(row.Price);
        setVat(row.Vat);
        setTotal(row.Total);
        setDetails(row.Details)
        setTruckType(row.TruckType);
        setPath(row.Path);
        setFile(
            row.Path === "ไม่แนบไฟล์" || row.Path === undefined || row.Path === ""
                ? "ไม่แนบไฟล์"
                : null
        );
        setMergedDetails(row.MergedDetails || [row]);

        let fileType = 1; // ค่าเริ่มต้น = ไม่มีไฟล์

        if (row.Path && row.Path !== "ไม่แนบไฟล์") {
            const ext = row.Path.split(".").pop().toLowerCase();

            if (ext === "pdf") {
                fileType = 2;
            } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
                fileType = 3;
            }
        }

        setFileType(fileType);
    }

    const getMimeTypeFromExtension = (fileName) => {
        const ext = fileName.split(".").pop().toLowerCase();

        const map = {
            pdf: "application/pdf",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
        };

        return map[ext] || "application/octet-stream";
    };

    const createFileFromUrl = async (url) => {
        try {
            const fullUrl = url.startsWith("http") ? url : `https://${url}`;

            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error("Fetch failed");
            }

            const blob = await response.blob();

            const fileName = decodeURIComponent(
                fullUrl.split("/").pop().split("?")[0]
            );

            return {
                lastModified: Date.now(),
                lastModifiedDate: new Date(),
                name: fileName,
                size: blob.size,
                type: blob.type || getMimeTypeFromExtension(fileName),
                originFileObj: blob,
                url: fullUrl, // เผื่อใช้ preview
            };

        } catch (error) {

            // 🔥 fallback กรณี CORS
            const fileName = url.split("/").pop().split("?")[0];
            const ext = fileName.split(".").pop().toLowerCase();

            return {
                lastModified: Date.now(),
                lastModifiedDate: new Date(),
                name: fileName,
                size: 0,
                type: getMimeTypeFromExtension(fileName),
                originFileObj: null,
                url: url.startsWith("http") ? url : `https://${url}`,
            };
        }
    };

    const handleUpdateFinancial = async (row) => {
        setFinanCialCheck(row);
        setID(row.id);
        let fileTypes = 1;

        if (!row.Path || row.Path.trim() === "" || row.Path.trim() === "ไม่แนบไฟล์") {
            setFile("ไม่แนบไฟล์");
            setFileType(1);
            return;
        }

        const fullPath = row.Path.startsWith("http")
            ? row.Path
            : `https://${row.Path}`;

        const fileName = row.Path.split("/").pop();
        const ext = fileName.split(".").pop().toLowerCase();

        if (ext === "pdf") {
            fileTypes = 2;
        } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
            fileTypes = 3;
        }

        const realFile = await createFileFromUrl(fullPath);

        setFile(realFile);
        setFileType(fileTypes);
    }

    const handleDateChangeDateInvoice = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue);
            setSelectedDateInvoice(formattedDate);
        }
    };

    const handleDateChangeDateTransfer = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue);
            setSelectedDateTransfer(formattedDate);
        }
    };

    const handleCloseBill = () => {
        setBillID("");
        setInvoiceID("");
        setSelectedDateInvoice("");
        setSelectedDateTransfer("");
        setRegistration("");
        setRegID(0);
        setCompany("");
        setCompanyID(0);
        setBank("");
        setPrice("");
        setVat("");
        setTotal("");
        setDetails("");
        setTruckType("");
        setPath("");
        setFile(null);
        setFileType(null);
    }

    const handleSaveBill = async () => {
        if (!file) return alert("กรุณาเลือกไฟล์ก่อน");

        let img = "ไม่แนบไฟล์"; // ตั้งค่าเริ่มต้นไว้เลย

        if (file !== "ไม่แนบไฟล์") {
            const formData = new FormData();
            formData.append("pic", file);

            try {
                const response = await fetch(`${API_BASE}/panda/uploads`, {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                img = data.file_path;
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }

        const targetRow = reportDetail.find((row) => row.id === billID);
        if (!targetRow?.uuid) {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
            return;
        }

        const companyRow = companypaymentDetail.find((row) => row.uuid === company);
        const bankRow = expenseitem.find((row) => row.uuid === bank);

        try {
            await apiPut(`/api/report_invoice/${targetRow.uuid}`, {
                InvoiceID: invoiceID,
                SelectedDateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                // report_invoice.Registration is a real UUID FK now - regID
                // already holds the clean uuid (see handleUpdateBill), and
                // this form never lets the user change it, so just resubmit
                // both parts of what was loaded.
                Registration: regID,
                RegistrationName: registration.includes(":") ? registration.split(":").slice(1).join(":") : "",
                Company: company,
                CompanyName: companyRow?.Name,
                Bank: bank,
                BankName: bankRow?.Name,
                Price: price,
                Vat: vat,
                Total: total,
                Details: details,
                Path: img || ""
            });

            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            refetchTripData?.();

            setBillID("");
            setInvoiceID("");
            setSelectedDateInvoice("");
            setSelectedDateTransfer("");
            setRegistration("");
            setRegID(0);
            setCompany("");
            setCompanyID(0);
            setBank("");
            setPrice("");
            setVat("");
            setTotal("");
            setDetails("");
            setTruckType("");
            setFile(null);
            setFileType(null);
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    }

    const summary = finalData.filter((f) => f.Status !== "ยกเลิก").reduce(
        (acc, row) => {
            acc.price += Number(row.Price || 0);
            acc.vat += Number(row.Vat || 0);
            return acc;
        },
        { price: 0, vat: 0 }
    );

    summary.total = summary.price + summary.vat;

    const activeFinalData = finalData.filter((f) => f.Status !== "ยกเลิก");
    const finalDataPageCount = Math.max(1, Math.ceil(activeFinalData.length / rowsPerPage));
    const safePage = Math.min(page, finalDataPageCount - 1);
    const pagedFinalData = activeFinalData.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
    const financialColumnCount = 11 + (group !== "กลุ่ม" ? 2 : 0) + (group === "ทั้งหมด" ? 1 : 0);

    return (
        <Grid container spacing={2} width="100%" sx={{ marginTop: -4 }}>
            <Grid item xl={9} xs={12}>
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 1, marginBottom: -1.5 }} >
                    <FormGroup row>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            textAlign="right"
                            sx={{ whiteSpace: "nowrap", marginRight: 3, marginLeft: 0.5, marginTop: 1 }}
                            gutterBottom
                        >
                            เลือกเพื่อกรองข้อมูล :
                        </Typography>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={group === "ทั้งหมด"}
                                    color="info"
                                    onChange={() => {
                                        setGroup("ทั้งหมด");
                                    }}
                                />
                            }
                            label="ทั้งหมด"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={group === "เดี่ยว"}
                                    color="info"
                                    onChange={() => {
                                        setGroup("เดี่ยว");
                                    }}
                                />
                            }
                            label="เดี่ยว"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={group === "กลุ่ม"}
                                    color="info"
                                    onChange={() => {
                                        setGroup("กลุ่ม");
                                    }}
                                />
                            }
                            label="กลุ่ม"
                        />
                    </FormGroup>
                </Box>
            </Grid>
            <Grid item xl={3} xs={12}>
                <Button variant="contained" size="small" color="success" sx={{ marginTop: 1.5, fontWeight: "bold" }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
            </Grid>
            <Grid item xl={5.5} xs={12} >
                <Box
                    sx={{
                        width: "100%",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: { xl: 0, xs: 1 },
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Paper sx={{ width: "100%" }}>
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
                                format="DD/MM/YYYY"
                                onChange={handleDateChangeDateStart}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateStart),
                                            readOnly: true,
                                        },
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>วันที่ :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                height: 35,
                                                "& .MuiInputBase-root": {
                                                    height: 35,
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "4px 8px",
                                                    fontSize: "0.85rem",
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    marginLeft: -1,
                                                    width: "100%"
                                                },
                                            }
                                        },
                                    },
                                }}
                            />
                        </Paper>
                        <Paper sx={{ width: "100%", marginLeft: 1 }}>
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
                                format="DD/MM/YYYY"
                                onChange={handleDateChangeDateEnd}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateEnd),
                                            readOnly: true,
                                        },
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>ถึงวันที่ :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                height: 35,
                                                "& .MuiInputBase-root": {
                                                    height: 35,
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "4px 8px",
                                                    fontSize: "0.85rem",
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    marginLeft: -1,
                                                    width: "100%"
                                                },
                                            }
                                        },
                                    },
                                }}
                            />
                        </Paper>
                    </LocalizationProvider>
                </Box>
            </Grid>
            <Grid item xl={4.5} xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ marginLeft: { xl: 0, xs: 1 } }} >
                    <Paper sx={{ width: "100%", marginTop: 0.5 }} >
                        <TextField
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            sx={{
                                '& .MuiInputBase-root': {
                                    height: 35, // ปรับความสูงรวม
                                },
                                '& .MuiInputBase-input': {
                                    padding: '4px 8px', // ปรับ padding ด้านใน input
                                    fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                },
                            }}
                            InputProps={{
                                sx: { height: 35 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <b>ค้นหา :</b>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Paper>
                </Box>
            </Grid>
            <Grid item xl={2} xs={12} display="flex" justifyContent="right" alignItems="center" sx={{ marginLeft: { xl: 0, xs: 1 }, }}>
                <InsertFinancial />
            </Grid>
            <Grid item xl={12} xs={12}>
                <TableContainer
                    component={Paper}
                    sx={{
                        maxWidth: "1350px",
                        height: "65vh",
                        overflowX: "auto", // แสดง scrollbar แนวนอน
                        marginLeft: { xl: 0, xs: 1 },
                    }}
                >
                    <Table
                        stickyHeader
                        size="small"
                        sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                    >
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16, position: "sticky", left: 0, zIndex: 3, cursor: "pointer" }}>
                                    ลำดับ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 180, cursor: "pointer" }}
                                    onClick={() => handleSort("InvoiceID")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        เลขที่บิล
                                        {sortConfig.key === "InvoiceID" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 130, cursor: "pointer" }}
                                    onClick={() => handleSort("SelectedDateInvoice")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        วันที่บิล
                                        {sortConfig.key === "SelectedDateInvoice" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 130, cursor: "pointer" }}
                                    onClick={() => handleSort("SelectedDateTransfer")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        วันที่โอน
                                        {sortConfig.key === "SelectedDateTransfer" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                {
                                    group !== "กลุ่ม" &&
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250, position: "sticky", left: 50, zIndex: 3, cursor: "pointer" }}
                                        onClick={() => handleSort("Registration")}
                                    >
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                            ป้ายทะเบียน
                                            {sortConfig.key === "Registration" ? (
                                                sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                            ) : (
                                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                            )}
                                        </Box>
                                    </TablecellSelling>
                                }
                                {
                                    group === "ทั้งหมด" &&
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100, position: "sticky", left: 300, zIndex: 3, cursor: "pointer" }}>
                                        Group
                                    </TablecellSelling>
                                }
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 320, cursor: "pointer" }}
                                    onClick={() => handleSort("Company")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        ชื่อบริษัท
                                        {sortConfig.key === "Company" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 320, cursor: "pointer" }}
                                    onClick={() => handleSort("Bank")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        ชื่อบัญชี
                                        {sortConfig.key === "Bank" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    ยอดก่อน Vat
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                    ยอด VAT
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                    รวม
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                    รายละเอียด
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                    ลิ้งรูปภาพ
                                </TablecellSelling>
                                {
                                    group !== "กลุ่ม" &&
                                    <TablecellSelling sx={{ textAlign: "center", width: 80, position: "sticky", right: 0 }} />
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activeFinalData.length === 0 ? (
                                <TableRow>
                                    <TablecellNoData colSpan={financialColumnCount}>
                                        <Inventory fontSize="large" />
                                        <br />
                                        ไม่มีข้อมูล
                                    </TablecellNoData>
                                </TableRow>
                            ) : (
                                pagedFinalData.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f0f1f8cd",
                                            cursor: "pointer",
                                            "&:hover": {
                                                backgroundColor: "#ffebee",
                                            },
                                        }
                                        }
                                        onClick={() => handleUpdateFinancial(row)}>
                                        <TableCell sx={{
                                            textAlign: "center", position: "sticky", left: 0, zIndex: 2, cursor: "pointer",
                                            backgroundColor: "white",
                                            "&:hover": {
                                                backgroundColor: "#ffebee",
                                            },
                                        }}>{safePage * rowsPerPage + index + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "left" }}>
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.InvoiceID}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {formatThaiSlash(dayjs(row.SelectedDateInvoice, "DD/MM/YYYY"))}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {formatThaiSlash(dayjs(row.SelectedDateTransfer, "DD/MM/YYYY"))}
                                        </TableCell>
                                        {
                                            group !== "กลุ่ม" &&
                                            <TableCell sx={{
                                                textAlign: "left", position: "sticky", left: 50, zIndex: 2,
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                                "&:hover": {
                                                    backgroundColor: "#ffebee",
                                                },
                                            }}>
                                                {
                                                    row.Group !== "กลุ่ม" &&
                                                    <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{`${resolveRegistrationDisplay(row)} (${row.TruckType})`}</Typography>
                                                }
                                            </TableCell>
                                        }
                                        {
                                            group === "ทั้งหมด" &&
                                            <TableCell sx={{
                                                textAlign: "center", position: "sticky", left: 300, zIndex: 2,
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                                "&:hover": {
                                                    backgroundColor: "#ffebee",
                                                },
                                            }}>
                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.Group !== "กลุ่ม" ? "เดี่ยว" : "กลุ่ม"}</Typography>
                                            </TableCell>
                                        }
                                        <TableCell sx={{ textAlign: "left" }}>
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.CompanyName}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "left" }}>
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.BankName}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "right" }}>
                                            <Typography variant="subtitle2"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    lineHeight: 1,
                                                    paddingLeft: "30px !important",
                                                    paddingRight: "30px !important",
                                                    fontVariantNumeric: "tabular-nums",
                                                }}
                                            >
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(row.Price)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "right" }}>
                                            <Typography variant="subtitle2"
                                                sx={{
                                                    marginLeft: 2,
                                                    whiteSpace: "nowrap",
                                                    lineHeight: 1,
                                                    paddingLeft: "15px !important",
                                                    paddingRight: "15px !important",
                                                    fontVariantNumeric: "tabular-nums",
                                                }}
                                            >
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(row.Vat)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "right", backgroundColor: "#eeeeee", fontWeight: "bold" }}>
                                            <Typography variant="subtitle2"
                                                sx={{
                                                    marginLeft: 2,
                                                    whiteSpace: "nowrap",
                                                    lineHeight: 1,
                                                    paddingLeft: "30px !important",
                                                    paddingRight: "30px !important",
                                                    fontVariantNumeric: "tabular-nums",
                                                }} >
                                                {
                                                    new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(row.Total)
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "left" }}>
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2 }} >{row.Details}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                (row.Path ? (
                                                    row.Path === "ไม่แนบไฟล์" ?
                                                        row.Path
                                                        :
                                                        <a
                                                            href={row.Path.startsWith("http") ? row.Path : `https://${row.Path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: "#1976d2", textDecoration: "underline" }}
                                                        >
                                                            {row.Path}
                                                        </a>
                                                ) : (
                                                    "-"
                                                ))
                                            }
                                        </TableCell>
                                        {
                                            group !== "กลุ่ม" &&
                                            <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                                                {
                                                    row.Group !== "กลุ่ม" ? (
                                                        <Box>
                                                            <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                                <DeleteIcon />
                                                            </IconButton>

                                                        </Box>
                                                    )
                                                        :
                                                        (
                                                            <Box>
                                                                <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)} disabled>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                        )
                                                }
                                            </TableCell>
                                        }
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        {
                            finalData.filter((f) => f.Status !== "ยกเลิก").length !== 0 &&
                            <TableFooter
                                sx={{
                                    position: "sticky",
                                    height: "5vh",
                                    bottom: 0,
                                    zIndex: 2,
                                    backgroundColor: theme.palette.primary.dark,
                                }}
                            >
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }} colSpan={group === "กลุ่ม" ? 6 : 7} >
                                        รวม
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                        {
                                            new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(summary.price)
                                        }
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        {
                                            new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(summary.vat)
                                        }
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 600 }} colSpan={2}>
                                        {
                                            new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(summary.total)
                                        }
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 50 }} />
                                    <TablecellSelling sx={{ textAlign: "center", width: 50, position: "sticky", right: 0 }} />
                                </TableRow>
                            </TableFooter>
                        }
                    </Table>
                    {finanCialCheck && (
                        <UpdateFinancial
                            row={finanCialCheck}
                            open={true}
                            FinancialID={id}
                            onClose={() => setFinanCialCheck(null)}
                        />
                    )}
                </TableContainer>
                <TablePaginationBar
                    count={activeFinalData.length}
                    page={safePage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </Grid>
        </Grid>
    );
};

export default Financial;
