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
    TablePagination,
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
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
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

const Financial = () => {
    const [search, setSearch] = useState("");
    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(null);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [group, setGroup] = useState("ทั้งหมด");
    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            setSelectedDateStart(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            setSelectedDateEnd(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    // const { report } = useData();
    const { reghead, regtail, small, companypayment, expenseitems } = useBasicData();
    const { report } = useTripData();
    const reports = Object.values(report || {});
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(regtail);
    const registrationS = Object.values(small);
    const expenseitem = Object.values(expenseitems);
    const companypaymentDetail = Object.values(companypayment);
    // const reportDetail = reports.filter((row) => row.Status !== "ยกเลิก")

    console.log("Company Detail : ", companypaymentDetail);

    const getRegistration = () => {
        const registartion = [
            ...registrationH.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "หัวรถใหญ่" })),
            ...registrationT.map((item) => ({ ...item, Registration: item.RegTail, TruckType: "หางรถใหญ่" })),
            ...registrationS.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "รถเล็ก" })),
        ];

        return registartion;
    };

    console.log("getRegistration : ", getRegistration());

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/").map(Number);
        return new Date(year, month - 1, day);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                // ✅ ถ้าคลิกซ้ำ -> สลับ asc/desc
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            } else {
                // ✅ คลิกใหม่ -> asc ก่อน
                return { key, direction: "asc" };
            }
        });
    };

    const reportDetail = reports.filter((item) => {
        const itemDate = dayjs(item.SelectedDateInvoice, "DD/MM/YYYY");
        const registrations = item?.Registration?.includes(":")
            ? item.Registration.split(":")[1]
            : item?.Registration || "";
        const company = item?.Company?.includes(":")
            ? item.Company.split(":")[1]
            : item?.Company || "";
        const bank = item?.Bank || "";

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

        // ถ้าเป็น number
        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        // ถ้าเป็นวันที่
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

        // ถ้าเป็น string (ตัวหนังสือ)
        return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue), "th")
            : String(bValue).localeCompare(String(aValue), "th");
    });

    console.log("Report : ", reports);
    console.log("Report Detail : ", reportDetail);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredData =
        group === "ทั้งหมด"
            ? reportDetail
            : reportDetail.filter(row => (row.Group ?? "เดี่ยว") === group);

    // 🔥 สร้าง finalData ใหม่
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

                const mergeKey = getMergeKey(row); // 🔥 ใช้ key ใหม่

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

    console.log("Final Data : ", finalData);

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
                registration: `${row.Registration.split(":")[1]} (${row.TruckType})`,
                company: row.Company.split(":")[1],
                bank: row.Bank.split(":")[1],
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
            () => {
                database
                    .ref("report/invoice")
                    .child(id)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ลบข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
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
        console.log("ROW : ", row);
        setBillID(row.id);
        setInvoiceID(row.InvoiceID);
        setSelectedDateInvoice(row.SelectedDateInvoice);
        setSelectedDateTransfer(row.SelectedDateTransfer);
        setRegistration(`${row.Registration.split(":")[0]}:${row.Registration.split(":")[1]}`);
        setRegID(Number(row.Registration.split(":")[0]));
        setCompany(row.Company);
        setCompanyID(Number(row.Company.split(":")[0]));
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
            const ext = row.Path.split(".").pop().toLowerCase(); // หานามสกุลไฟล์

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

            console.warn("Fetch file failed, fallback to mock object:", error);

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
    console.log("Registration show : ", registration);

    const handleDateChangeDateInvoice = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateInvoice(formattedDate);
        }
    };

    const handleDateChangeDateTransfer = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
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

        // ✅ ตรวจสอบก่อนว่า file เป็น "ไม่แนบไฟล์" หรือไม่
        if (file !== "ไม่แนบไฟล์") {
            const formData = new FormData();
            formData.append("pic", file);

            try {
                const response = await fetch("https://upload.happysoftth.com/panda/uploads", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                img = data.file_path;
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }

        database.ref("report/invoice")
            .child(billID)
            .update({
                InvoiceID: invoiceID,
                SelectedDateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                Registration: registration,
                Company: company,
                Bank: bank,
                Price: price,
                Vat: vat,
                Total: total,
                Details: details,
                Path: img || ""
            }).then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");

                // reset state
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
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
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

    console.log("Registration : ", registration);

    return (
        // <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
        //     <Grid container>
        //         <Grid item xl={3.5} xs={12}>

        //         </Grid>
        //         <Grid item xl={6.5} xs={12}>
        //             <Typography
        //                 variant="h3"
        //                 fontWeight="bold"
        //                 textAlign="center"
        //                 gutterBottom
        //             >
        //                 บิลค่าใช้จ่าย
        //             </Typography>
        //         </Grid>
        //         <Grid item xl={2} xs={12} display="flex" justifyContent="center" alignItems="center">
        //             <Box width="200px">
        //                 <InsertFinancial />
        //             </Box>
        //         </Grid>
        //         <Grid item xl={5} xs={12}>
        //             <Box
        //                 sx={{
        //                     width: "100%", // กำหนดความกว้างของ Paper
        //                     height: "40px",
        //                     display: "flex",
        //                     alignItems: "center",
        //                     justifyContent: "center",
        //                     marginTop: { xl: -8, xs: 2 },
        //                     marginBottom: 3
        //                 }}
        //             >
        //                 <LocalizationProvider dateAdapter={AdapterDayjs}>
        //                     <DatePicker
        //                         openTo="day"
        //                         views={["year", "month", "day"]}
        //                         value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
        //                         format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
        //                         onChange={handleDateChangeDateStart}
        //                         slotProps={{
        //                             textField: {
        //                                 size: "small",
        //                                 fullWidth: true,
        //                                 inputProps: {
        //                                     value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
        //                                     readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
        //                                 },
        //                                 InputProps: {
        //                                     startAdornment: (
        //                                         <InputAdornment position="start" sx={{ marginRight: 2 }}>
        //                                             <b>วันที่ :</b>
        //                                         </InputAdornment>
        //                                     ),
        //                                     sx: {
        //                                         fontSize: "16px",
        //                                         height: "40px",
        //                                         padding: "10px",
        //                                         fontWeight: "bold",
        //                                     },
        //                                 },
        //                             },
        //                         }}
        //                     />
        //                     <DatePicker
        //                         openTo="day"
        //                         views={["year", "month", "day"]}
        //                         value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
        //                         format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
        //                         onChange={handleDateChangeDateEnd}
        //                         slotProps={{
        //                             textField: {
        //                                 size: "small",
        //                                 fullWidth: true,
        //                                 inputProps: {
        //                                     value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
        //                                     readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
        //                                 },
        //                                 InputProps: {
        //                                     startAdornment: (
        //                                         <InputAdornment position="start" sx={{ marginRight: 2 }}>
        //                                             <b>ถึงวันที่ :</b>
        //                                         </InputAdornment>
        //                                     ),
        //                                     sx: {
        //                                         fontSize: "16px",
        //                                         height: "40px",
        //                                         padding: "10px",
        //                                         fontWeight: "bold",
        //                                     },
        //                                 },
        //                             },
        //                         }}
        //                     />
        //                 </LocalizationProvider>
        //             </Box>
        //         </Grid>
        //     </Grid>
        //     <Divider sx={{ marginBottom: 1 }} />
        //     <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
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
                        width: "100%", // กำหนดความกว้างของ Paper
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
                                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                onChange={handleDateChangeDateStart}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                            readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
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
                                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                onChange={handleDateChangeDateEnd}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                            readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
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
                    {/* <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 0.5 }} gutterBottom>ค้นหา</Typography> */}
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
                            {
                                finalData.filter((f) => f.Status !== "ยกเลิก").map((row, index) => (
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
                                        }}>{index + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "left" }}>
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.InvoiceID}</Typography>
                                            {/* {
                                                billID !== row.id ?
                                                    <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.InvoiceID}</Typography>
                                                    :
                                                    <Paper sx={{ width: "100%" }}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            value={invoiceID}
                                                            sx={{
                                                                "& .MuiInputBase-root": {
                                                                    height: 30,
                                                                },
                                                                "& .MuiInputBase-input": {
                                                                    padding: "4px 8px",
                                                                    marginLeft: -0.5,
                                                                    width: "100%"
                                                                },
                                                            }}
                                                            onChange={(e) => { setInvoiceID(e.target.value); }}
                                                        />
                                                    </Paper>
                                            } */}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                formatThaiSlash(dayjs(row.SelectedDateInvoice, "DD/MM/YYYY"))
                                                // billID !== row.id ?
                                                //     formatThaiSlash(dayjs(row.SelectedDateInvoice, "DD/MM/YYYY"))
                                                //     :
                                                //     <Paper sx={{ width: "100%" }}>
                                                //         <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                //             <DatePicker
                                                //                 openTo="day"
                                                //                 views={["year", "month", "day"]}
                                                //                 value={dayjs(selectedDateInvoice, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                                //                 format="DD/MM/YYYY"
                                                //                 onChange={handleDateChangeDateInvoice}
                                                //                 sx={{ marginRight: 2, }}
                                                //                 slotProps={{
                                                //                     textField: {
                                                //                         size: "small",
                                                //                         fullWidth: true,
                                                //                         inputProps: {
                                                //                             value: formatThaiSlash(dayjs(selectedDateInvoice, "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                //                             readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                //                         },
                                                //                         sx: {
                                                //                             "& .MuiInputBase-root": {
                                                //                                 height: 30,
                                                //                             },
                                                //                             "& .MuiInputBase-input": {
                                                //                                 padding: "4px 8px",
                                                //                                 marginLeft: -0.5,
                                                //                                 width: "100%"
                                                //                             },
                                                //                         }
                                                //                     },
                                                //                 }}
                                                //             />
                                                //         </LocalizationProvider>
                                                //     </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                formatThaiSlash(dayjs(row.SelectedDateTransfer, "DD/MM/YYYY"))
                                                // billID !== row.id ?
                                                //     formatThaiSlash(dayjs(row.SelectedDateTransfer, "DD/MM/YYYY"))
                                                //     :
                                                //     <Paper sx={{ width: "100%" }}>
                                                //         <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                //             <DatePicker
                                                //                 openTo="day"
                                                //                 views={["year", "month", "day"]}
                                                //                 value={dayjs(selectedDateTransfer, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                                //                 format="DD/MM/YYYY"
                                                //                 onChange={handleDateChangeDateTransfer}
                                                //                 sx={{ marginRight: 2, }}
                                                //                 slotProps={{
                                                //                     textField: {
                                                //                         size: "small",
                                                //                         fullWidth: true,
                                                //                         inputProps: {
                                                //                             value: formatThaiSlash(dayjs(selectedDateTransfer, "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                //                             readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                //                         },
                                                //                         sx: {
                                                //                             "& .MuiInputBase-root": {
                                                //                                 height: 30,
                                                //                             },
                                                //                             "& .MuiInputBase-input": {
                                                //                                 padding: "4px 8px",
                                                //                                 marginLeft: -0.5,
                                                //                                 width: "100%"
                                                //                             },
                                                //                         }
                                                //                     },
                                                //                 }}
                                                //             />
                                                //         </LocalizationProvider>
                                                //     </Paper>
                                            }
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
                                                    <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{`${row.Registration.split(":")[1]} (${row.TruckType})`}</Typography>
                                                    // (billID !== row.id ?
                                                    //     <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{`${row.Registration.split(":")[1]} (${row.TruckType})`}</Typography>
                                                    //     :
                                                    //     <Paper sx={{ width: "100%" }}>
                                                    //         <Autocomplete
                                                    //             options={(getRegistration() || []).filter((row) => row.TruckType === trucktype)
                                                    //             }
                                                    //             getOptionLabel={(option) => { return `${option?.Registration} (${option?.TruckType})`; }}
                                                    //             value={
                                                    //                 (getRegistration() || []).filter((row) => row.TruckType === trucktype).find(
                                                    //                     //(opt) => `${opt.id}:${opt.Registration}` === registration
                                                    //                     (opt) => opt.id === regID) || null
                                                    //             }
                                                    //             onChange={(e, newValue) => {
                                                    //                 if (newValue) {
                                                    //                     const registrations = `${newValue.id}:${newValue.Registration}`;
                                                    //                     setRegistration(registrations);
                                                    //                 } else {
                                                    //                     setRegistration("");
                                                    //                 }
                                                    //             }}
                                                    //             renderInput={(params) => (
                                                    //                 <TextField
                                                    //                     {...params}
                                                    //                     variant="outlined"
                                                    //                     size="small"
                                                    //                     sx={{
                                                    //                         "& .MuiInputBase-root": { height: 30 },
                                                    //                         "& .MuiInputBase-input": {
                                                    //                             padding: "4px 8px",
                                                    //                             marginLeft: -0.5,
                                                    //                             width: "100%",
                                                    //                         },
                                                    //                     }}
                                                    //                 />
                                                    //             )}
                                                    //         />
                                                    //     </Paper>
                                                    // )
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
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.Company.split(":")[1]}</Typography>
                                            {/* {
                                                billID !== row.id ?
                                                    <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.Company.split(":")[1]}</Typography>
                                                    :
                                                    <Paper sx={{ width: "100%" }}>
                                                        <Autocomplete
                                                            options={companypaymentDetail.filter((item) => item.Status === "อยู่ในระบบ").sort((a, b) => (a?.Name || "").localeCompare(b?.Name || "", "th"))
                                                            }
                                                            getOptionLabel={(option) => option?.Name || ""}
                                                            value={
                                                                companypaymentDetail.filter((item) => item.Status === "อยู่ในระบบ").sort((a, b) => (a?.Name || "").localeCompare(b?.Name || "", "th")).find(
                                                                    //(opt) => `${opt.id}:${opt.Name}` === company
                                                                    (opt) => opt.id === companyID
                                                                ) || null
                                                            }
                                                            onChange={(e, newValue) => {
                                                                if (newValue) {
                                                                    const companies = `${newValue.id}:${newValue.Name}`;
                                                                    setCompany(companies);
                                                                } else {
                                                                    setCompany("");
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiInputBase-root": { height: 30 },
                                                                        "& .MuiInputBase-input": {
                                                                            padding: "4px 8px",
                                                                            marginLeft: -0.5,
                                                                            width: "100%",
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Paper>
                                            } */}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "left" }}>
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.Bank.split(":")[1]}</Typography>
                                            {/* {
                                                billID !== row.id ?
                                                    <Typography variant="subtitle2" sx={{ marginLeft: 2, whiteSpace: "nowrap", lineHeight: 1 }} >{row.Bank.split(":")[1]}</Typography>
                                                    :
                                                    <Paper sx={{ width: "100%" }}>
                                                        <Autocomplete
                                                            options={expenseitem.filter((item) => item.Status === "อยู่ในระบบ") // ✅ filter ตาม Status
                                                                .sort((a, b) => a.Name.localeCompare(b.Name))}
                                                            getOptionLabel={(option) => option?.Name || ""}
                                                            value={
                                                                expenseitem.filter((item) => item.Status === "อยู่ในระบบ").find(
                                                                    (opt) => `${opt.id}:${opt.Name}` === bank
                                                                ) || null
                                                            }
                                                            onChange={(e, newValue) => {
                                                                if (newValue) {
                                                                    const banks = `${newValue.id}:${newValue.Name}`;
                                                                    setBank(banks);
                                                                } else {
                                                                    setBank("");
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiInputBase-root": { height: 30 },
                                                                        "& .MuiInputBase-input": {
                                                                            padding: "4px 8px",
                                                                            marginLeft: -0.5,
                                                                            width: "100%",
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Paper>
                                            } */}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "right" }}>
                                            {
                                                <Typography variant="subtitle2"
                                                    sx={{
                                                        whiteSpace: "nowrap",
                                                        lineHeight: 1,
                                                        paddingLeft: "30px !important",
                                                        paddingRight: "30px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(row.Price)}
                                                </Typography>
                                                // billID !== row.id ?
                                                //     <Typography variant="subtitle2"
                                                //         sx={{
                                                //             whiteSpace: "nowrap",
                                                //             lineHeight: 1,
                                                //             paddingLeft: "30px !important",
                                                //             paddingRight: "30px !important",
                                                //             fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                //         }}
                                                //     >
                                                //         {new Intl.NumberFormat("en-US", {
                                                //             minimumFractionDigits: 2,
                                                //             maximumFractionDigits: 2
                                                //         }).format(row.Price)}
                                                //     </Typography>
                                                //     :
                                                //     <Paper sx={{ width: "100%" }}>
                                                //         <TextField
                                                //             size="small"
                                                //             fullWidth
                                                //             type="number"
                                                //             value={price}
                                                //             sx={{
                                                //                 "& .MuiInputBase-root": {
                                                //                     height: 30,
                                                //                 },
                                                //                 "& .MuiInputBase-input": {
                                                //                     padding: "4px 8px",
                                                //                     marginLeft: -0.5,
                                                //                     width: "100%"
                                                //                 },
                                                //             }}
                                                //             onChange={(e) => {
                                                //                 setPrice(e.target.value);
                                                //                 setTotal(Number(e.target.value) + Number(vat));
                                                //             }}
                                                //         />
                                                //     </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "right" }}>
                                            {
                                                <Typography variant="subtitle2"
                                                    sx={{
                                                        marginLeft: 2,
                                                        whiteSpace: "nowrap",
                                                        lineHeight: 1,
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(row.Vat)}
                                                </Typography>
                                                // billID !== row.id ?
                                                //     <Typography variant="subtitle2"
                                                //         sx={{
                                                //             marginLeft: 2,
                                                //             whiteSpace: "nowrap",
                                                //             lineHeight: 1,
                                                //             paddingLeft: "15px !important",
                                                //             paddingRight: "15px !important",
                                                //             fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                //         }}
                                                //     >
                                                //         {new Intl.NumberFormat("en-US", {
                                                //             minimumFractionDigits: 2,
                                                //             maximumFractionDigits: 2
                                                //         }).format(row.Vat)}
                                                //     </Typography>

                                                //     :
                                                //     <Paper sx={{ width: "100%" }}>
                                                //         <TextField
                                                //             size="small"
                                                //             fullWidth
                                                //             type="number"
                                                //             value={vat}
                                                //             sx={{
                                                //                 "& .MuiInputBase-root": {
                                                //                     height: 30,
                                                //                 },
                                                //                 "& .MuiInputBase-input": {
                                                //                     padding: "4px 8px",
                                                //                     marginLeft: -0.5,
                                                //                     width: "100%"
                                                //                 },
                                                //             }}
                                                //             onChange={(e) => {
                                                //                 setVat(e.target.value);
                                                //                 setTotal(Number(e.target.value) + Number(price));
                                                //             }}
                                                //         />
                                                //     </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "right", backgroundColor: "#eeeeee", fontWeight: "bold" }}>
                                            <Typography variant="subtitle2"
                                                sx={{
                                                    marginLeft: 2,
                                                    whiteSpace: "nowrap",
                                                    lineHeight: 1,
                                                    paddingLeft: "30px !important",
                                                    paddingRight: "30px !important",
                                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                }} >
                                                {
                                                    new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(row.Total)
                                                    // billID !== row.id ?
                                                    //     new Intl.NumberFormat("en-US", {
                                                    //         minimumFractionDigits: 2,
                                                    //         maximumFractionDigits: 2
                                                    //     }).format(row.Total)
                                                    //     :
                                                    //     new Intl.NumberFormat("en-US", {
                                                    //         minimumFractionDigits: 2,
                                                    //         maximumFractionDigits: 2
                                                    //     }).format(total)
                                                    // <TextField
                                                    //     size="small"
                                                    //     fullWidth
                                                    //     type="number"
                                                    //     value={total}
                                                    //     sx={{
                                                    //         "& .MuiInputBase-root": {
                                                    //             height: 30,
                                                    //         },
                                                    //         "& .MuiInputBase-input": {
                                                    //             padding: "4px 8px",
                                                    //             marginLeft: -0.5,
                                                    //             width: "100%"
                                                    //         },
                                                    //     }}
                                                    //     onChange={(e) => { setTotal(e.target.value); }}
                                                    // />
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "left" }}>
                                            {
                                                <Typography variant="subtitle2" sx={{ marginLeft: 2 }} >{row.Details}</Typography>
                                                // billID !== row.id ?
                                                //     <Typography variant="subtitle2" sx={{ marginLeft: 2 }} >{row.Details}</Typography>
                                                //     :
                                                //     <Paper sx={{ width: "100%" }}>
                                                //         <TextField
                                                //             size="small"
                                                //             fullWidth
                                                //             value={details}
                                                //             sx={{
                                                //                 "& .MuiInputBase-root": {
                                                //                     height: 30,
                                                //                 },
                                                //                 "& .MuiInputBase-input": {
                                                //                     padding: "4px 8px",
                                                //                     marginLeft: -0.5,
                                                //                     width: "100%"
                                                //                 },
                                                //             }}
                                                //             onChange={(e) => { setDetails(e.target.value); }}
                                                //         />
                                                //     </Paper>
                                            }
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
                                                // billID !== row.id ?
                                                //     (row.Path ? (
                                                //         row.Path === "ไม่แนบไฟล์" ?
                                                //             row.Path
                                                //             :
                                                //             <a
                                                //                 href={row.Path.startsWith("http") ? row.Path : `https://${row.Path}`}
                                                //                 target="_blank"
                                                //                 rel="noopener noreferrer"
                                                //                 style={{ color: "#1976d2", textDecoration: "underline" }}
                                                //             >
                                                //                 {row.Path}
                                                //             </a>
                                                //     ) : (
                                                //         "-"
                                                //     ))
                                                //     :
                                                //     (
                                                //         file === null || file === "ไม่แนบไฟล์" ?
                                                //             <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingLeft: 3, paddingRight: 3 }}>
                                                //                 <Button
                                                //                     variant="contained"
                                                //                     component="label"
                                                //                     size="small"
                                                //                     fullWidth
                                                //                     sx={{
                                                //                         height: "30px",
                                                //                         backgroundColor: fileType === 1 ? "#5552ffff" : "#eeeeee",
                                                //                         borderRadius: 2,
                                                //                         display: "flex",
                                                //                         justifyContent: "center",
                                                //                         alignItems: "center",
                                                //                     }}
                                                //                     onClick={() => { setFileType(1); setFile("ไม่แนบไฟล์"); }}
                                                //                 >
                                                //                     <Typography
                                                //                         variant="subtitle2"
                                                //                         fontWeight="bold"
                                                //                         color={fileType === 1 ? "white" : "lightgray"}
                                                //                         sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                                                //                         gutterBottom
                                                //                     >
                                                //                         ไม่แนบไฟล์
                                                //                     </Typography>
                                                //                     {/* <FolderOffIcon
                                                //                         sx={{
                                                //                             fontSize: 20,
                                                //                             color: fileType === 1 ? "white" : "lightgray",
                                                //                             marginLeft: 2,
                                                //                         }}
                                                //                     /> */}
                                                //                 </Button>
                                                //                 {/* <Chip label="หรือ" size="small" sx={{ marginLeft: 3, marginRight: 3 }} /> */}
                                                //                 <Typography variant="subtitle2" fontWeight="bold" sx={{ marginLeft: 1, marginRight: 1, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                                //                 <Button
                                                //                     variant="contained"
                                                //                     component="label"
                                                //                     size="small"
                                                //                     fullWidth
                                                //                     sx={{
                                                //                         height: "30px",
                                                //                         backgroundColor: fileType === 2 ? "#ff5252" : "#eeeeee",
                                                //                         borderRadius: 2,
                                                //                         display: "flex",
                                                //                         justifyContent: "center",
                                                //                         alignItems: "center",
                                                //                     }}
                                                //                     onClick={() => setFileType(2)}
                                                //                 >
                                                //                     <Typography
                                                //                         variant="subtitle2"
                                                //                         fontWeight="bold"
                                                //                         color={fileType === 2 ? "white" : "lightgray"}
                                                //                         gutterBottom
                                                //                     >
                                                //                         PDF
                                                //                     </Typography>
                                                //                     <PictureAsPdfIcon
                                                //                         sx={{
                                                //                             fontSize: 20,
                                                //                             color: fileType === 2 ? "white" : "lightgray",
                                                //                             marginLeft: 0.5,
                                                //                         }}
                                                //                     />
                                                //                     <input
                                                //                         type="file"
                                                //                         hidden
                                                //                         accept="application/pdf"
                                                //                         onChange={(e) => {
                                                //                             const file = e.target.files?.[0];
                                                //                             if (file) setFile(file);
                                                //                         }}
                                                //                     />
                                                //                 </Button>
                                                //                 <Typography variant="subtitle2" fontWeight="bold" sx={{ marginLeft: 1, marginRight: 1, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                                //                 <Button
                                                //                     variant="contained"
                                                //                     component="label"
                                                //                     size="small"
                                                //                     fullWidth
                                                //                     sx={{
                                                //                         height: "30px",
                                                //                         backgroundColor: fileType === 3 ? "#29b6f6" : "#eeeeee",
                                                //                         borderRadius: 2,
                                                //                         display: "flex",
                                                //                         justifyContent: "center",
                                                //                         alignItems: "center",
                                                //                     }}
                                                //                     onClick={() => setFileType(3)}
                                                //                 >
                                                //                     <Typography
                                                //                         variant="subtitle2"
                                                //                         fontWeight="bold"
                                                //                         color={fileType === 3 ? "white" : "lightgray"}
                                                //                         gutterBottom
                                                //                     >
                                                //                         รูปภาพ
                                                //                     </Typography>
                                                //                     <ImageIcon
                                                //                         sx={{
                                                //                             fontSize: 20,
                                                //                             color: fileType === 3 ? "white" : "lightgray",
                                                //                             marginLeft: 0.5,
                                                //                         }}
                                                //                     />
                                                //                     <input
                                                //                         type="file"
                                                //                         hidden
                                                //                         accept="image/*"
                                                //                         onChange={(e) => {
                                                //                             const file = e.target.files?.[0];
                                                //                             if (file) setFile(file);
                                                //                         }}
                                                //                     />
                                                //                 </Button>
                                                //             </Box>
                                                //             :
                                                //             <Box display="flex" justifyContent="center" alignItems="center">
                                                //                 <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 7.5 }} gutterBottom>File</Typography>
                                                //                 <Box component="form" sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                //                     <TextField
                                                //                         size="small"
                                                //                         type="text"
                                                //                         fullWidth
                                                //                         value={file.name}
                                                //                         sx={{
                                                //                             "& .MuiInputBase-root": {
                                                //                                 height: 30,
                                                //                             },
                                                //                             "& .MuiInputBase-input": {
                                                //                                 padding: "4px 8px",
                                                //                                 marginLeft: -0.5,
                                                //                                 width: "100%"
                                                //                             },
                                                //                             marginRight: 2
                                                //                         }}
                                                //                     />
                                                //                     <Button variant="outlined" color="error" size="small" sx={{ marginRight: 2 }} onClick={() => { setFile(null); setFileType(null); }}>
                                                //                         ลบไฟล์
                                                //                     </Button>
                                                //                 </Box>
                                                //             </Box>
                                                //     )
                                            }
                                        </TableCell>
                                        {
                                            group !== "กลุ่ม" &&
                                            <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                                                {/* <Box display="flex" alignItems="center" justifyContent="center">
                                                    <Tooltip title="แก้ไขข้อมูล" placement="left" sx={{ marginRight: 1 }}>
                                                        <IconButton size="small" color="warning">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="ลบข้อมูล" placement="right">
                                                        <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                </Box> */}
                                                {
                                                    row.Group !== "กลุ่ม" ? (
                                                        <Box>
                                                            {/* <IconButton size="small" color="warning" onClick={() => handleUpdateBill(row)}>
                                                                <DriveFileRenameOutlineIcon />
                                                            </IconButton> */}

                                                            <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                                <DeleteIcon />
                                                            </IconButton>

                                                        </Box>
                                                        // billID !== row.id ?
                                                        //     <Box>
                                                        //         <IconButton size="small" color="warning" onClick={() => handleUpdateBill(row)}>
                                                        //             <DriveFileRenameOutlineIcon />
                                                        //         </IconButton>

                                                        //         <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                        //             <DeleteIcon />
                                                        //         </IconButton>

                                                        //     </Box>
                                                        //     :
                                                        //     <Box>
                                                        //         <IconButton
                                                        //             size="small"
                                                        //             color="error"
                                                        //             onClick={handleCloseBill}
                                                        //             sx={{ marginRight: -0.5 }}
                                                        //         >
                                                        //             <CloseIcon />
                                                        //         </IconButton>

                                                        //         <IconButton
                                                        //             size="small"
                                                        //             color="success"
                                                        //             onClick={() => handleSaveBill()}
                                                        //         >
                                                        //             <SaveIcon />
                                                        //         </IconButton>
                                                        //     </Box>
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
                                                {/* <Button variant="contained" size="small" color="error" fullWidth onClick={() => handleChangDelete(row.id)}>ลบ</Button> */}
                                            </TableCell>
                                        }
                                        {/* {
                                            finanCialCheck && <UpdateFinancial FinancialID={id} row={row} files={file} fileTypes={fileType} />
                                        } */}
                                    </TableRow>
                                ))
                            }
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
                    {/* {
                        reportDetail.length <= 10 ? null :
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 30]}
                                component="div"
                                count={reportDetail.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                                }
                                sx={{
                                    overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                                    borderBottomLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    '& .MuiTablePagination-toolbar': {
                                        backgroundColor: "lightgray",
                                        height: "20px", // กำหนดความสูงของ toolbar
                                        alignItems: "center",
                                        paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                                        overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                                        fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-select': {
                                        paddingY: 0,
                                        fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-actions': {
                                        '& button': {
                                            paddingY: 0,
                                            fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                                        },
                                    },
                                    '& .MuiTablePagination-displayedRows': {
                                        fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-selectLabel': {
                                        fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                                    }
                                }}
                            />
                    } */}
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default Financial;
