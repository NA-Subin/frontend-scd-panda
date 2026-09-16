import React, { useContext, useEffect, useMemo, useState } from "react";
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
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellNoData, TablecellSelling, TablecellTickets } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { apiPut } from "../../server/apiClient";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertDeducetionIncome from "./InsertDeductionIncome";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiYear } from "../../theme/DateTH";
import { buildPeriodsForYear, findCurrentPeriod } from "./Paid";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import TablePaginationBar from "../../theme/TablePaginationBar";

const DeductionOfIncome = (props) => {
    const { selectedDateStart, selectedDateEnd } = props;
    const [search, setSearch] = useState("");
    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(1);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setSelectedDate(newValue);
        }
    };

    useEffect(() => {
        const year = dayjs(selectedDate).year();
        const list = buildPeriodsForYear(year);
        setPeriods(list);

        const currentNo = findCurrentPeriod(list);
        if (currentNo) {
            setPeriod(currentNo);
        }
    }, [selectedDate]);

    const { drivers, deductibleincome } = useBasicData();
    const { reportFinancial, refetch: refetchTripData } = useTripData();
    const reports = Object.values(reportFinancial || {})
        .sort((a, b) => {
            const driverA = (a.DriverName || "").trim();
            const driverB = (b.DriverName || "").trim();
            return driverA.localeCompare(driverB, 'th', { numeric: true });
        });

    const driver = Object.values(drivers || {});
    const deductibleincomeDetail = Object.values(deductibleincome).filter((item) => item.StatusData === "อยู่ในระบบ");

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            } else {
                return { key, direction: "asc" };
            }
        });
    };

    const reportDetail = reports
        .filter((item) => {
            return (
                item.Status !== "ยกเลิก" &&
                item.Year === selectedDate.format("YYYY") &&
                item.Period === period
            );
        });

    let table = [];

    driver.forEach((driver) => {
        table.push({
            name: driver.Name,
            item: "เงินเดือน",
            income: driver.Salary !== "-" ? driver.Salary : "-",
            expense: "-",
        });
        table.push({
            name: driver.Name,
            item: "ค่าโทรศัพท์",
            income: driver.TelephoneBill !== "-" ? driver.TelephoneBill : "-",
            expense: "-",
        });
        table.push({
            name: driver.Name,
            item: "ประกันสังคม",
            income: "-",
            expense: driver.Security !== "-" ? driver.Security : "-",
        });
    });

    // ฟังก์ชันจับชื่อจริงจาก report.Driver
    const extractName = (full) => full.split(":")[1]?.trim() ?? full;

    // ฟังก์ชันจับชื่อ item จาก report.Name
    const extractItem = (full) => full.split(":")[1]?.trim() ?? full;

    // อัปเดตหรือเพิ่มข้อมูลจาก report
    reportDetail.forEach((report) => {
        const name = extractName(report.Driver);
        const item = extractItem(report.Name);

        const index = table.findIndex(
            (row) => row.name === name && row.item === item
        );

        const value = report.Money;
        const isIncome = report.Type === "รายได้";

        if (index >= 0) {
            if (isIncome) table[index].income = value;
            else table[index].expense = value;
        } else {
            table.push({
                name,
                item,
                income: isIncome ? value : "",
                expense: isIncome ? "" : value,
            });
        }
    });

    const filteredReportDetail = reportDetail.filter((row) => {
        const driverName = row.DriverName?.trim() || "";
        const regHead = row.RegHeadName?.trim() || "";
        const regTail = row.RegTailName?.trim() || "";

        return (
            driverName.includes(search) ||
            regHead.includes(search) ||
            regTail.includes(search)
        );
    });

    const groupedData = filteredReportDetail.reduce((acc, row) => {
        const driverName = row.DriverName?.trim() || "";
        const regHead = row.RegHeadName?.trim() || "";
        const regTail = row.RegTailName?.trim() || "";
        const shortName = row.ShortName || "";

        // ✅ รวมเป็น key เดียว เช่น "ชื่อนามสกุล | หัว | หาง"
        const key = row.VehicleType === "รถใหญ่" ? `${driverName} | ${regHead} | ${regTail}` : `${driverName} | ${shortName}`;

        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
    }, {});

    const sortedGroups = Object.entries(groupedData).sort(([a], [b]) =>
        a.localeCompare(b, "th")
    );

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const exportToExcel = async () => {
        let order = 1;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานชำระค่าน้ำมัน");

        // 1️⃣ กำหนด columns
        worksheet.columns = [
            { header: "ลำดับ", key: "no", width: 8 },
            { header: "พนักงานขับรถ", key: "driver", width: 60 },
            { header: "รหัส", key: "code", width: 10 },
            { header: "ชื่อรายการที่หัก", key: "name", width: 25 },
            { header: "รายได้", key: "income", width: 15 },
            { header: "รายหัก", key: "expense", width: 15 },
            { header: "รายละเอียด", key: "note", width: 30 },
        ];

        // 2️⃣ Title merge
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `รายงานรายได้รายหักงวดที่${period}`;
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
        processedGroups.forEach(({ driverName, sortedRows }) => {
            sortedRows.forEach((row) => {
                const dataRow = {
                    no: order++,
                    driver: driverName,
                    code: row.Code,
                    name: row.NameName,
                    income: row.Type === "รายได้" ? Number(row.Money) : 0,
                    expense: row.Type === "รายหัก" ? Number(row.Money) : 0,
                    note: row.Note || "",
                };

                const newRow = worksheet.addRow({
                    ...dataRow,
                    income: dataRow.income === 0 ? "-" : dataRow.income,
                    expense: dataRow.expense === 0 ? "-" : dataRow.expense,
                });

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
        });

        // 5️⃣ Footer row รวม
        const footerRow = worksheet.addRow({
            name: "รวม",
            income: processedGroups.flatMap(g => g.sortedRows).reduce((acc, r) => r.Type === "รายได้" ? acc + Number(r.Money) : acc, 0),
            expense: processedGroups.flatMap(g => g.sortedRows).reduce((acc, r) => r.Type === "รายหัก" ? acc + Number(r.Money) : acc, 0),
            note: processedGroups.flatMap(g => g.sortedRows).reduce((acc, r) => r.Type === "รายได้" ? acc + Number(r.Money) : acc, 0) - processedGroups.flatMap(g => g.sortedRows).reduce((acc, r) => r.Type === "รายหัก" ? acc + Number(r.Money) : acc, 0)
        });

        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.height = 25;
        footerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE699" } }; // สีเหลือง
            cell.numFmt = "#,##0.00";
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 6️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานรายได้รายหักงวดที่${period}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            async () => {
                const targetRow = reports.find((row) => row.id === id);
                if (!targetRow?.uuid) {
                    ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
                    return;
                }

                try {
                    await apiPut(`/api/report_financial/${targetRow.uuid}`, { Status: "ยกเลิก" });
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

    const { processedGroups, totalIncome, totalExpense } = useMemo(() => {
        let income = 0;
        let expense = 0;

        const processed = sortedGroups.map(([driverName, rows]) => {
            const sortedRows = [...rows].sort((a, b) => {
                const codeA = a.Code;
                const codeB = b.Code;

                if (codeA[0] !== codeB[0]) {
                    if (codeA[0] === "R") return -1;
                    if (codeB[0] === "R") return 1;
                }

                const numA = parseInt(codeA.slice(1), 10);
                const numB = parseInt(codeB.slice(1), 10);
                return numA - numB;
            }).sort((a, b) => {
                if (!sortConfig.key) return 0;
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });

            sortedRows.forEach((row) => {
                if (row.Type === "รายได้") {
                    income += Number(row.Money);
                } else if (row.Type === "รายหัก") {
                    expense += Number(row.Money);
                }
            });

            return { driverName, sortedRows };
        })

        return {
            processedGroups: processed,
            totalIncome: income,
            totalExpense: expense,
        };
    }, [sortedGroups]);

    // ✅ Pagination is applied per driver-group (not per raw row) so that the
    // rowSpan grouping in the table body never gets split across pages.
    const groupPageCount = Math.max(1, Math.ceil(processedGroups.length / rowsPerPage));
    const safePage = Math.min(page, groupPageCount - 1);
    const pagedGroups = processedGroups.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
    let order = safePage * rowsPerPage + 1;

    const [deductionID, setDeductionID] = useState("");
    const [deductionCode, setDeductionCode] = useState("");
    const [deductionName, setDeductionName] = useState("");
    const [deductionNameText, setDeductionNameText] = useState("");
    const [deductionMoney, setDeductionMoney] = useState("");
    const [deductionNote, setDeductionNote] = useState("");
    const [deductionType, setDeductionType] = useState("");

    const handleUpdateDeduction = (row) => {
        setDeductionCode(row.Code);
        setDeductionID(row.id);
        setDeductionName(row.Name);
        setDeductionNameText(row.NameName);
        setDeductionMoney(row.Money);
        setDeductionNote(row.Note);
        setDeductionType(row.Type);
    }

    const handleCloseDeduction = () => {
        setDeductionID("");
        setDeductionCode("");
        setDeductionName("");
        setDeductionNameText("");
        setDeductionMoney("");
        setDeductionNote("");
        setDeductionType("");
    }

    const handleSaveDeduction = async () => {
        const targetRow = reports.find((row) => row.id === deductionID);
        if (!targetRow?.uuid) {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
            return;
        }

        try {
            await apiPut(`/api/report_financial/${targetRow.uuid}`, {
                Code: deductionCode,
                Name: deductionName,
                NameName: deductionNameText,
                Money: deductionMoney,
                Note: deductionNote,
            });

            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            refetchTripData?.();

            setDeductionID("");
            setDeductionCode("");
            setDeductionName("");
            setDeductionNameText("");
            setDeductionMoney("");
            setDeductionNote("");
            setDeductionType("");
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    }

    return (
        <Grid container spacing={2} width="100%" sx={{ marginTop: -4 }}>
            <Grid item xl={9} xs={12} />
            <Grid item xl={3} xs={12}>
                <Button variant="contained" size="small" color="success" sx={{ marginTop: 1.5, fontWeight: "bold" }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
            </Grid>
            <Grid item xl={2.5} md={4} xs={12} >
                <Paper sx={{ marginLeft: { xl: 1, md: 1, xs: 1 }, }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                        <DatePicker
                            openTo="year"
                            views={["year"]}
                            value={selectedDate}
                            format="YYYY"
                            onChange={handleDateChangeDate}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    inputProps: {
                                        value: selectedDate ? formatThaiYear(selectedDate.format("YYYY")) : "",
                                        readOnly: true,
                                    },
                                    InputProps: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <b>งวดการจ่ายปี :</b>
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
                    </LocalizationProvider>
                </Paper>
            </Grid>
            <Grid item xl={1.5} md={2.5} xs={12}>
                <Paper sx={{ marginLeft: { xl: 0, xs: 1 }, }}>
                    <TextField
                        fullWidth
                        type="number"
                        value={period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                        size="small"
                        sx={{
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
                        }}
                        InputProps={{
                            sx: { height: 35 },
                            startAdornment: (
                                <InputAdornment position="start">
                                    <b>ลำดับงวด :</b>
                                </InputAdornment>
                            )
                        }}
                    />
                </Paper>
            </Grid>
            <Grid item xl={3.5} md={5.5} xs={12} >
                {
                    periods
                        .filter((p) => p.no === period)
                        .map((p) => (
                            <Typography key={p.id} variant="subtitle1" fontWeight="bold" color="gray" sx={{ marginTop: 0.5, marginLeft: { xl: 0, xs: 1 }, }}>
                                {`( วันที่ ${formatThaiFull(dayjs(p.start, "DD/MM/YYYY"))} - วันที่ ${formatThaiFull(dayjs(p.end, "DD/MM/YYYY"))} )`}
                            </Typography>
                        ))
                }
            </Grid>
            <Grid item xl={3} xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ marginLeft: { xl: 0, xs: 1 }, }} >
                    <Paper sx={{ width: "100%" }} >
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
            <Grid item xl={1.5} xs={12} display="flex" justifyContent="right" alignItems="center">
                <InsertDeducetionIncome year={selectedDate} periods={periods} periodData={period} />
            </Grid>
            <Grid item xl={12} xs={12}>
                <TableContainer
                    component={Paper}
                    sx={{
                        height: "65vh",
                        marginLeft: 1
                    }}
                >
                    <Table
                        size="small"
                        sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                    >
                        <TableHead
                            sx={{
                                position: "sticky",
                                height: "5vh",
                                top: 0,
                                zIndex: 2,
                                backgroundColor: theme.palette.primary.dark,
                            }}
                        >
                            <TableRow>
                                <TablecellSelling width={30} sx={{ textAlign: "center", fontSize: 16 }}>
                                    ลำดับ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white", cursor: "pointer" }}
                                    onClick={() => handleSort("driverName")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        พนักงานขับรถ
                                        {sortConfig.key === "driverName" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 50, cursor: "pointer" }}
                                    onClick={() => handleSort("Code")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        รหัส
                                        {sortConfig.key === "Code" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120, cursor: "pointer" }}
                                    onClick={() => handleSort("Name")}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        ชื่อรายการที่หัก
                                        {sortConfig.key === "Name" ? (
                                            sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                        ) : (
                                            <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                        )}
                                    </Box>
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                    รายได้
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                    รายหัก
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                    รายละเอียด
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", width: 50, position: "sticky", right: 0, }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {processedGroups.length === 0 ? (
                                <TableRow>
                                    <TablecellNoData colSpan={8}>
                                        <Inventory fontSize="large" />
                                        <br />
                                        ไม่มีข้อมูล
                                    </TablecellNoData>
                                </TableRow>
                            ) : (
                                pagedGroups.map(({ driverName, sortedRows }) =>
                                sortedRows.map((row, rowIndex) => (
                                    <TableRow key={row.id} sx={{ backgroundColor: rowIndex % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                                        {/* ✅ ลำดับแสดงเฉพาะแถวแรกของ driver */}
                                        {rowIndex === 0 && (
                                            <TableCell
                                                rowSpan={sortedRows.length}
                                                sx={{ textAlign: "center", borderBottom: "2px solid lightgray" }}
                                            >
                                                {order++}
                                            </TableCell>
                                        )}

                                        {/* ✅ Driver แสดงเฉพาะแถวแรกของ group */}
                                        {rowIndex === 0 && (
                                            <TableCell
                                                rowSpan={sortedRows.length}
                                                sx={{
                                                    textAlign: "left",
                                                    position: "sticky",
                                                    left: 0,
                                                    backgroundColor: "white",
                                                    borderRight: "2px solid white",
                                                    borderBottom: "2px solid lightgray",
                                                }}
                                            >
                                                {driverName}
                                            </TableCell>
                                        )}

                                        <TableCell sx={{ textAlign: "center", borderBottom: (sortedRows.length - 1) === rowIndex && "2px solid lightgray" }}>
                                            {
                                                deductionID !== row.id ?
                                                    row.Code
                                                    :
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={deductionCode}
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
                                                        disabled
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", borderBottom: (sortedRows.length - 1) === rowIndex && "2px solid lightgray" }}>
                                            {
                                                deductionID !== row.id ?
                                                    row.NameName
                                                    :
                                                    <Autocomplete
                                                        options={deductibleincomeDetail
                                                            .filter((row) => row.Type === deductionType)
                                                            .sort((a, b) => (a?.Name || "").localeCompare(b?.Name || "", "th"))
                                                        }
                                                        getOptionLabel={(option) => option?.Name || ""}
                                                        value={
                                                            deductibleincomeDetail.find(
                                                                (opt) => opt.uuid === deductionName
                                                            ) || null
                                                        }
                                                        onChange={(e, newValue) => {
                                                            if (newValue) {
                                                                setDeductionName(newValue.uuid);
                                                                setDeductionNameText(newValue.Name);
                                                                setDeductionCode(newValue.Code);
                                                            } else {
                                                                setDeductionName("");
                                                                setDeductionNameText("");
                                                                setDeductionCode("");
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
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", borderBottom: (sortedRows.length - 1) === rowIndex && "2px solid lightgray" }}>
                                            {
                                                deductionID !== row.id ?
                                                    (
                                                        row.Type === "รายได้"
                                                            ? new Intl.NumberFormat("en-US").format(row.Money)
                                                            : "-"
                                                    )
                                                    :
                                                    (
                                                        deductionType === "รายได้"
                                                            ?
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                type="number"
                                                                value={deductionMoney}
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
                                                                onChange={(e) => { setDeductionMoney(e.target.value); }}
                                                                onFocus={(e) => {
                                                                    if (e.target.value === "0") {
                                                                        setDeductionMoney(e.target.value);
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === "") {
                                                                        setDeductionMoney(e.target.value);
                                                                    }
                                                                }}
                                                            />
                                                            : "-"
                                                    )
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", borderBottom: (sortedRows.length - 1) === rowIndex && "2px solid lightgray" }}>
                                            {
                                                deductionID !== row.id ?
                                                    (
                                                        row.Type === "รายหัก"
                                                            ? new Intl.NumberFormat("en-US").format(row.Money)
                                                            : "-")
                                                    :
                                                    (
                                                        deductionType === "รายหัก"
                                                            ?
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                type="number"
                                                                value={deductionMoney}
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
                                                                onChange={(e) => { setDeductionMoney(e.target.value); }}
                                                                onFocus={(e) => {
                                                                    if (e.target.value === "0") {
                                                                        setDeductionMoney(e.target.value);
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === "") {
                                                                        setDeductionMoney(e.target.value);
                                                                    }
                                                                }}
                                                            />
                                                            : "-"
                                                    )
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", borderBottom: (sortedRows.length - 1) === rowIndex && "2px solid lightgray" }}>
                                            {
                                                deductionID !== row.id ?
                                                    row.Note
                                                    :
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={deductionNote}
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
                                                        onChange={(e) => { setDeductionNote(e.target.value); }}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell
                                            sx={{ textAlign: "center", position: "sticky", right: 0, borderBottom: (sortedRows.length - 1) === rowIndex && "2px solid lightgray" }}
                                        >
                                            {
                                                deductionID !== row.id ?
                                                    <Box display="flex" alignItems="center" justifyContent="center" >

                                                        <IconButton
                                                            size="small"
                                                            color="warning"
                                                            onClick={() => handleUpdateDeduction(row)}
                                                            sx={{ marginRight: -0.5 }}
                                                        >
                                                            <DriveFileRenameOutlineIcon />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleChangDelete(row.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>

                                                    </Box>
                                                    :
                                                    <Box display="flex" alignItems="center" justifyContent="center" >

                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={handleCloseDeduction}
                                                            sx={{ marginRight: -0.5 }}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleSaveDeduction()}
                                                        >
                                                            <SaveIcon />
                                                        </IconButton>

                                                    </Box>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))
                                )
                            )}
                        </TableBody>
                        {
                            sortedGroups.length !== 0 &&
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
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }} colSpan={4}>
                                        รวม
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                        {new Intl.NumberFormat("en-US").format(totalIncome)}
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                        {new Intl.NumberFormat("en-US").format(totalExpense)}
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                        {new Intl.NumberFormat("en-US").format(totalIncome - totalExpense)}
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 20, position: "sticky", right: 0, }} />
                                </TableRow>
                            </TableFooter>
                        }
                    </Table>
                </TableContainer>
                <TablePaginationBar
                    count={processedGroups.length}
                    page={safePage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </Grid>
        </Grid>

    );
};

export default DeductionOfIncome;
