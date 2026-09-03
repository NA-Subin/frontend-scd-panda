import React, { useContext, useEffect, useState } from "react";
import {
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
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellNoData, TablecellSelling, TablecellTickets } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiYear } from "../../theme/DateTH";
import { buildPeriodsForYear, findCurrentPeriod } from "../financial/Paid";
import MoneyGuarantee from "./MoneyGuarantee";
import MoneyLoan from "./MoneyLoan";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import TablePaginationBar from "../../theme/TablePaginationBar";

const DocSalary = ({ openNavbar }) => {
    // const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    // const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [search, setSearch] = useState("");
    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(1);
    const [selectedDate, setSelectedDate] = useState(dayjs()); // ✅ เป็น dayjs object
    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setSelectedDate(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    useEffect(() => {
        const year = dayjs(selectedDate).year();
        const list = buildPeriodsForYear(year);
        setPeriods(list);

        const currentNo = findCurrentPeriod(list); // ได้ค่าเป็นเลขงวดโดยตรง
        if (currentNo) {
            setPeriod(currentNo); // ✅ setPeriod เป็นเลขงวด
        }
    }, [selectedDate]);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            let width = window.innerWidth;
            if (!openNavbar) {
                width += 120; // ✅ เพิ่ม 200 ถ้า openNavbar = false
            }
            setWindowWidth(width);
        };

        // เรียกครั้งแรกตอน mount
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

    console.log("periods", periods);

    const { drivers, reghead, small } = useBasicData();
    const { reportFinancial, trip } = useTripData();
    const reports = Object.values(reportFinancial || {})
        .filter((r) => parseInt(r.Year) >= 2026)
        .sort((a, b) => {
            // Driver is a UUID FK (schema-manifest: report_financial.Driver = UUID),
            // it has no ":" separator anymore. Use the DriverName companion column
            // (the migration's TEXT display field) instead of splitting the UUID,
            // which always returned "" for both sides and silently made this sort a no-op.
            const driverA = (a.DriverName || "").trim();
            const driverB = (b.DriverName || "").trim();
            return driverA.localeCompare(driverB, 'th', { numeric: true });
        });

    const driver = Object.values(drivers || {});
    const smalls = Object.values(small || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const registrationH = Object.values(reghead || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const tripDetail = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

    const trips = periods
        .filter((p) => p.no === period)
        .flatMap((p) =>
            tripDetail.filter((item) => {
                const itemDate = dayjs(item.DateReceive, "DD/MM/YYYY");
                return (
                    itemDate.isBetween(dayjs(p.start, "DD/MM/YYYY"), dayjs(p.end, "DD/MM/YYYY"), null, "[]") &&
                    item.StatusTrip === "จบทริป" &&
                    (item.TruckType === "รถใหญ่" || item.TruckType === "รถเล็ก")
                );
            })
        );

    console.log("trips : ", trips);
    console.log("tripDetail : ", tripDetail);
    console.log("Driver : ", driver);
    console.log("Report : ", reports);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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
        //const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return (
            // itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") &&
            item.Status !== "ยกเลิก" &&
            item.Year === selectedDate.format("YYYY") &&
            item.Period === period
        );
    });

    const document = driver
        .map((item) => {
            const details = reportDetail.filter(
                (row) => row.Driver === item.uuid
            );

            let Registration = "";
            if (item.TruckType === "รถใหญ่") {
                const Registrations = registrationH.find(
                    (row) => row.uuid === item.Registration
                );
                Registration = `${Registrations?.RegHead}/${Registrations?.RegTailName || ""}`;
            } else if (item.TruckType === "รถเล็ก") {
                const Registrations = smalls.find(
                    (row) => row.uuid === item.Registration
                );
                Registration = Registrations?.RegHead;
            }

            return {
                ...item,
                document: details,
                Registration,
            };
        })
        .filter((item) => {
            if (!search) return true; // ถ้า search ว่าง ให้เอาทุกตัว
            const lowerSearch = search.toLowerCase();
            return (
                item.Name?.toLowerCase().includes(lowerSearch) ||
                item.Registration?.toLowerCase().includes(lowerSearch)
            );
        }).sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

    const excludeNames = ["เงินค้ำประกัน", "เบิกเงินกู้ยืม"];

    const uniqueNames = [
        ...new Map(
            reportDetail
                // .filter((item) => {
                //     const name = item.Name.split(":")[1];
                //     return !excludeNames.includes(name); // กรองชื่อที่ไม่ต้องการ
                // })
                .map((item) => {
                    const [id, name] = item.Name.split(":");
                    return [id, { id, name, type: item.Type }];
                })
        ).values(),
    ].sort((a, b) => {
        // จัดกลุ่ม รายได้ (id น้อย) ให้อยู่อันดับแรก
        const incomeIds = ["1", "2", "3"]; // <-- ระบุ id ที่ถือว่าเป็นรายได้
        const aIsIncome = incomeIds.includes(a.id);
        const bIsIncome = incomeIds.includes(b.id);

        if (aIsIncome && !bIsIncome) return -1;
        if (!aIsIncome && bIsIncome) return 1;

        // ถ้าอยู่กลุ่มเดียวกันให้เรียงตามเลข id
        return Number(a.id) - Number(b.id);
    });

    // คำนวณผลรวมของแต่ละคอลัมน์
    const columnTotals = uniqueNames.map((col) => {
        const total = document.reduce((acc, row) => {
            const found = row.document.find(
                (doc) => doc.Name.split(":")[0] === col.id
            );

            if (!found) return acc;

            return col.type === "รายได้"
                ? acc + Number(found.Money)
                : acc - Number(found.Money);
        }, 0);

        return {
            id: col.id,
            name: col.name,
            total,
        };
    });

    console.log("uniqueNames : ", uniqueNames);
    console.log("Report Detail : ", reportDetail);
    console.log("document : ", document);

    // ✅ กรองก่อน group
    const filteredReportDetail = reportDetail.filter((row) => {
        const driverName = row.DriverName?.trim() || "";
        const regHead = row.RegHeadName?.trim() || "";
        const regTail = row.RegTailName?.trim() || "";

        // คุณจะใช้แค่ driverName filter หรือรวมก็ได้
        return (
            driverName.includes(search) ||
            regHead.includes(search) ||
            regTail.includes(search)
        );
    });

    // ✅ Group
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

    // ✅ Sort driverName
    const sortedGroups = Object.entries(groupedData).sort(([a], [b]) =>
        a.localeCompare(b, "th")
    );

    let order = 1;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 1) เตรียมตัวแปร summary ไว้
    let summary = {
        costrip: 0,
        columns: Object.fromEntries(uniqueNames.map((c) => [c.id, 0])),
        total: 0,
        guarantee: 0,
        loan: 0,
    };

    // 2) คำนวณทั้งหมดและเก็บลง summary
    const processed = document.map((row, index) => {
        const currentPeriod = Number(row.Period || period);
        const tripsDetails = trips.filter((item) => item.TruckType === "รถใหญ่");

        // ค่าเที่ยว
        const costrip = tripsDetails
            .filter(
                (item) =>
                    item.Driver === row.uuid &&
                    item.TruckType === row.TruckType
            )
            .reduce((acc, cos) => acc + Number(cos.CostTrip || 0), 0);
        summary.costrip += costrip;

        // total ของ row
        const total = row.document.reduce((acc, doc) => {
            const [id] = doc.Name.split(":");
            const col = uniqueNames.find((c) => c.id === id);
            if (!col) return acc;
            return col.type === "รายได้"
                ? acc + Number(doc.Money)
                : acc - Number(doc.Money);
        }, 0);
        summary.total += total + costrip;

        // columns
        row.document.forEach((doc) => {
            const [id] = doc.Name.split(":");
            const col = uniqueNames.find((c) => c.id === id);
            if (!col) return;
            const value = Number(doc.Money);
            summary.columns[id] += col.type === "รายได้" ? value : -value;
        });

        // เงินค้ำประกัน
        const moneyGuarantee = reports.filter(
            (doc) =>
                (doc.Name.split(":")[1] === "เงินค้ำประกัน" || doc.Name.split(":")[1] === "คืนเงินค้ำประกัน") &&
                doc.Status !== "ยกเลิก" &&
                Number(doc.Period) <= currentPeriod &&
                doc.Driver === row.uuid
        );
        // const guaranteeTotal = moneyGuarantee.reduce(
        //     (acc, doc) => acc + Number(doc.Money),
        //     0
        // );
        const guaranteeTotal = moneyGuarantee.reduce((acc, doc) => {
            const value = Number(doc.Money) || 0;

            if (doc.Type === "รายได้") {
                return acc + value; // ✅ ถ้าเป็นรายได้ บวก
            } else if (doc.Type === "รายหัก") {
                return acc - value; // ✅ ถ้าเป็นรายหัก ลบ
            }

            return acc; // ถ้าไม่มี Type หรือไม่ตรงเงื่อนไข ก็ไม่เปลี่ยนค่า
        }, 0);
        summary.guarantee += guaranteeTotal;

        console.log("moneyGuarantee : ", moneyGuarantee);
        console.log("guaranteeTotal : ", guaranteeTotal);

        // เงินกู้ยืม
        const moneyLoan = reports.filter(
            (doc) =>
                (doc.Name.split(":")[1] === "เบิกเงินกู้ยืม" || doc.Name.split(":")[1] === "คืนเงินกู้ยืม") &&
                doc.Status !== "ยกเลิก" &&
                Number(doc.Period) <= currentPeriod &&
                doc.Driver === row.uuid
        );
        // const loanTotal = moneyLoan.reduce(
        //     (acc, doc) => acc + Number(doc.Money),
        //     0
        // );
        const loanTotal = moneyLoan.reduce((acc, doc) => {
            const value = Number(doc.Money) || 0;

            if (doc.Type === "รายได้") {
                return acc + value; // ✅ ถ้าเป็นรายได้ บวก
            } else if (doc.Type === "รายหัก") {
                return acc - value; // ✅ ถ้าเป็นรายหัก ลบ
            }

            return acc; // ถ้าไม่มี Type หรือไม่ตรงเงื่อนไข ก็ไม่เปลี่ยนค่า
        }, 0);
        summary.loan += loanTotal;

        console.log("moneyLoan : ", moneyLoan);
        console.log("loanTotal : ", loanTotal);

        // return object สำหรับ render ทีหลัง
        return {
            index,
            row,
            costrip,
            total,
            moneyGuarantee: moneyGuarantee,
            moneyLoan: moneyLoan,
        };
    })

    // ✅ Pagination is applied after `processed`/`summary` are fully computed
    // over the whole `document` array - only the on-screen rows are sliced.
    const processedPageCount = Math.max(1, Math.ceil(processed.length / rowsPerPage));
    const safePage = Math.min(page, processedPageCount - 1);
    const pagedProcessed = processed.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานเงินเดือน");

        // ✅ กำหนด column (width + header)
        worksheet.columns = [
            { header: "ลำดับ", key: "no", width: 8 },
            { header: "พนักงานขับรถ", key: "driver", width: 25 },
            { header: "ป้ายทะเบียน", key: "registration", width: 35 },
            { header: "เลขที่บัญชี", key: "bank", width: 20 },
            { header: "ค่าเที่ยว", key: "trip", width: 20 },
            ...uniqueNames.map((col) => ({
                header: col.name,
                key: col.id,
                width: 20,
            })),
            { header: "ยอดรวม", key: "total", width: 25 },
            { header: "ยอดสะสมเงินค้ำประกัน", key: "guarantee", width: 20 },
            { header: "ยอดสะสมเงินกู้ยืม", key: "loan", width: 20 },
        ];

        // Title
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "รายงานเงินเดือน";
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { size: 16, bold: true };
        titleCell.height = 40;
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDDEBF7" },
        };

        // Header row (row 2)
        const headerValues = worksheet.columns.map((col) => col.header);
        const headerRow = worksheet.addRow(headerValues); // ✅ สร้าง row header ใหม่
        headerRow.font = { bold: true };
        headerRow.height = 25;
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // ✅ Data rows
        processed.forEach(({ index, row, costrip, total, moneyGuarantee, moneyLoan }) => {
            const dataRow = {
                no: index + 1,
                driver: row.Name,
                registration: row.Registration,
                bank: row.BankID,
                trip: costrip,
                ...uniqueNames.reduce((acc, col) => {
                    const found = row.document.find(
                        (doc) => doc.Name.split(":")[0] === col.id
                    );
                    acc[col.id] = found
                        ? col.type === "รายได้"
                            ? Number(found.Money)
                            : -Number(found.Money)
                        : 0.00;
                    return acc;
                }, {}),
                total: total + costrip,
                guarantee: moneyGuarantee.reduce((acc, doc) => {
                    const value = Number(doc.Money) || 0;

                    if (doc.Type === "รายได้") {
                        return acc + value; // ✅ รายได้ = บวก
                    } else if (doc.Type === "รายหัก") {
                        return acc - value; // ✅ รายหัก = ลบ
                    }

                    return acc;
                }, 0),
                loan: moneyLoan.reduce((acc, doc) => {
                    const value = Number(doc.Money) || 0;

                    if (doc.Type === "รายได้") {
                        return acc + value; // ✅ รายได้ = บวก
                    } else if (doc.Type === "รายหัก") {
                        return acc - value; // ✅ รายหัก = ลบ
                    }

                    return acc;
                }, 0)
            };

            const newRow = worksheet.addRow(dataRow);
            newRow.alignment = { vertical: "middle", horizontal: "center" };
            newRow.height = 20;
            newRow.eachCell((cell, colNumber) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                // ยกเว้น column "no"
                if (worksheet.columns[colNumber - 1].key !== "no" && worksheet.columns[colNumber - 1].key !== "orders") {
                    cell.numFmt = "#,##0.00";
                }
            });
        });

        // ✅ รวมค่าของ dynamic columns
        const dynamicTotals = uniqueNames.reduce((acc, col) => {
            // sum เฉพาะ column นั้น ๆ
            const sumCol = processed.reduce((acc2, p) => {
                const found = p.row.document.find(
                    (doc) => doc.Name.split(":")[0] === col.id
                );
                if (!found) return acc2;
                return acc2 + (col.type === "รายได้" ? Number(found.Money) : -Number(found.Money));
            }, 0);

            acc[col.id] = sumCol; // ✅ key ต้องตรงกับ worksheet.columns ที่กำหนด
            return acc;
        }, {});

        // ✅ Footer รวม
        const footerRow = worksheet.addRow({
            bank: "รวม",
            trip: processed.reduce((acc, p) => acc + p.costrip, 0),
            ...dynamicTotals,
            total: processed.reduce((acc, p) => acc + p.total + p.costrip, 0),
            guarantee: processed.reduce(
                (acc, p) => acc + p.moneyGuarantee.reduce((acc, doc) => {
                    const value = Number(doc.Money) || 0;

                    if (doc.Type === "รายได้") {
                        return acc + value; // ✅ รายได้ = บวก
                    } else if (doc.Type === "รายหัก") {
                        return acc - value; // ✅ รายหัก = ลบ
                    }

                    return acc;
                }, 0),
                0
            ),
            loan: processed.reduce(
                (acc, p) => acc + p.moneyLoan.reduce((acc, doc) => {
                    const value = Number(doc.Money) || 0;

                    if (doc.Type === "รายได้") {
                        return acc + value; // ✅ รายได้ = บวก
                    } else if (doc.Type === "รายหัก") {
                        return acc - value; // ✅ รายหัก = ลบ
                    }

                    return acc;
                }, 0),
                0
            ),
        });

        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.height = 25;
        footerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFE699" }, // เหลือง
            };
            cell.numFmt = "#,##0.00";
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // ✅ Save File
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานเงินเดือน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Grid container sx={{ marginBottom: -2 }}>
                <Grid item md={12} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        เงินเดือน
                    </Typography>
                </Grid>
                <Grid item xl={10} xs={12} />
                <Grid item xl={2} xs={12}>
                    <Button variant="contained" color="success" sx={{ marginTop: -9 }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 1 }} />
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={2} width="100%" sx={{ marginTop: -1 }}>
                    <Grid item xl={2.5} md={4} xs={12} >
                        <Paper sx={{ marginLeft: { xl: 0, md: 1, xs: 1 }, }}>
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
                                onChange={(e) => setPeriod(Number(e.target.value))} // ✅ แปลงเป็น number
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
                                .filter((p) => p.no === period) // ✅ ใช้ filter
                                .map((p) => (
                                    <Typography key={p.id} variant="subtitle1" fontWeight="bold" color="gray" sx={{ marginTop: 0.5, marginLeft: { xl: 0, xs: 1 }, }}>
                                        {`( วันที่ ${formatThaiFull(dayjs(p.start, "DD/MM/YYYY"))} - วันที่ ${formatThaiFull(dayjs(p.end, "DD/MM/YYYY"))} )`}
                                    </Typography>
                                ))
                        }
                    </Grid>
                    <Grid item xl={4.5} xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{ marginLeft: { xl: 0, xs: 1 }, }} >
                            {/* <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 0.5 }} gutterBottom>ค้นหา</Typography> */}
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
                    <Grid item xl={12} xs={12}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "65vh",
                                display: "flex",
                                flexDirection: "column",
                                marginLeft: 1,
                                overflowX: "auto"
                            }}
                        >
                            {/* <Box sx={{ flex: "0 0 auto", width: "1600px" }}>
                                <Table
                                    size="small"
                                    sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                >
                                    <TableHead
                                        sx={{ backgroundColor: theme.palette.primary.dark, }}
                                    >
                                        <TableRow>
                                            <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                ลำดับ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white" }}>
                                                พนักงานขับรถ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                                ป้ายทะเบียน
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                เลขบัญชี
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                ค่าเที่ยว
                                            </TablecellSelling>
                                            {uniqueNames.map((col) => (
                                                <TablecellSelling key={col.id} sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                    {col.name}
                                                </TablecellSelling>
                                            ))}
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                                ยอดรวม
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                                ยอดสะสมเงินค้ำประกัน
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                                ยอดสะสมเงินกู้ยืม
                                            </TablecellSelling>
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </Box>

                            <Box sx={{ flex: "1 1 auto", width: "1600px", overflow: "auto" }}>
                                <Table
                                    size="small"
                                    sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                >
                                    <TableBody>
                                        {processed.map(({ index, row, costrip, total, moneyGuarantee, moneyLoan }) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{ textAlign: "center", width: 50 }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 200, position: "sticky", left: 0, zIndex: 5, backgroundColor: "white" }}>{row.Name}</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 250 }}>{row.Registration}</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 150 }}>{row.BankID}</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 100 }}>{new Intl.NumberFormat("en-US").format(costrip)}</TableCell>

                                                {uniqueNames.map((col) => {
                                                    const found = row.document.find(
                                                        (doc) => doc.Name.split(":")[0] === col.id
                                                    );

                                                    let displayMoney = "";
                                                    if (found) {
                                                        displayMoney = col.type === "รายได้" ? found.Money : `-${found.Money}`;
                                                    }

                                                    return (
                                                        <TableCell key={col.id} align="center" sx={{ width: 150 }}>
                                                            {new Intl.NumberFormat("en-US").format(displayMoney || 0)}
                                                        </TableCell>
                                                    );
                                                })}

                                                <TableCell align="center" sx={{ width: 120 }}>{new Intl.NumberFormat("en-US").format(total)}</TableCell>

                                                <TableCell sx={{ width: 170 }}>
                                                    <Box
                                                        display="flex"
                                                        justifyContent="space-between" // ไอคอนชิดขวา
                                                        alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                                                        width="100%"
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                lineHeight: 1,
                                                                textAlign: "center",
                                                                width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat("en-US").format(moneyGuarantee.reduce((acc, doc) => acc + Number(doc.Money), 0))}
                                                        </Typography>

                                                        <MoneyGuarantee money={moneyGuarantee} periods={periods} />
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ width: 170 }}>
                                                    <Box
                                                        display="flex"
                                                        justifyContent="space-between" // ไอคอนชิดขวา
                                                        alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                                                        width="100%"
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                lineHeight: 1,
                                                                textAlign: "center",
                                                                width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat("en-US").format(moneyLoan.reduce((acc, doc) => acc + Number(doc.Money), 0))}
                                                        </Typography>

                                                        <MoneyLoan money={moneyLoan} periods={periods} />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )
                                        )}

                                    </TableBody>
                                </Table>
                            </Box>

                            <Box sx={{ flex: "0 0 auto", width: "1600px" }}>
                                <Table
                                    size="small"
                                    sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                >
                                    <TableHead
                                        sx={{ backgroundColor: theme.palette.primary.dark, }}
                                    >
                                        <TableRow>
                                            <TablecellSelling colSpan={4} sx={{ textAlign: "center", fontSize: 16, width: 650 }}>
                                                รวม
                                            </TablecellSelling>

                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                {new Intl.NumberFormat("en-US").format(summary.costrip)}
                                            </TablecellSelling>

                                            {uniqueNames.map((col) => (
                                                <TablecellSelling key={col.id} sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                    {new Intl.NumberFormat("en-US").format(summary.columns[col.id] || 0)}
                                                </TablecellSelling>
                                            ))}

                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                                {new Intl.NumberFormat("en-US").format(summary.total)}
                                            </TablecellSelling>

                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                                {new Intl.NumberFormat("en-US").format(summary.guarantee)}
                                            </TablecellSelling>

                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                                {new Intl.NumberFormat("en-US").format(summary.loan)}
                                            </TablecellSelling>
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </Box> */}

                            <Table
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" }, width: "1600px" }}
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
                                        <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white", cursor: "pointer" }}
                                            onClick={() => handleSort("Name")}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                พนักงานขับรถ
                                                {sortConfig.key === "Name" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250, cursor: "pointer" }}
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
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            เลขบัญชี
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            ค่าเที่ยว
                                        </TablecellSelling>
                                        {uniqueNames.map((col) => (
                                            <TablecellSelling key={col.id} sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                {col.name}
                                            </TablecellSelling>
                                        ))}
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            ยอดรวม
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                            ยอดสะสมเงินค้ำประกัน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                            ยอดสะสมเงินกู้ยืม
                                        </TablecellSelling>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {processed.length === 0 ? (
                                        <TableRow>
                                            <TablecellNoData colSpan={8 + uniqueNames.length}>
                                                <Inventory fontSize="large" />
                                                <br />
                                                ไม่มีข้อมูล
                                            </TablecellNoData>
                                        </TableRow>
                                    ) : (
                                    pagedProcessed.map(({ index, row, costrip, total, moneyGuarantee, moneyLoan }) => (
                                        <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                                            <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                            <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff", fontWeight: "bold" }}>
                                                {row.Name}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Registration}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.BankID}</TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "right",
                                                    paddingLeft: "30px !important",
                                                    paddingRight: "30px !important",
                                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    color: costrip === 0 && "lightgray"
                                                }}
                                            >
                                                {new Intl.NumberFormat("en-US").format(costrip)}
                                            </TableCell>

                                            {uniqueNames.map((col) => {
                                                const found = row.document.find(
                                                    (doc) => doc.Name.split(":")[0] === col.id
                                                );

                                                let displayMoney = "";
                                                if (found) {
                                                    // Money is TEXT in schema-manifest (report_financial.Money), so it
                                                    // arrives from the API as a string. Wrap in Number() here to match
                                                    // the identical lookup in exportToExcel() above — without it,
                                                    // displayMoney was a raw/negated string, so the "===0" zero-styling
                                                    // check below never matched populated zero amounts.
                                                    displayMoney = col.type === "รายได้" ? Number(found.Money) : -Number(found.Money);
                                                }

                                                return (
                                                    <TableCell
                                                        key={col.id}
                                                        sx={{
                                                            textAlign: "right",
                                                            paddingLeft: "30px !important",
                                                            paddingRight: "30px !important",
                                                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                            color: displayMoney === 0 || displayMoney === ""
                                                                ? "lightgray"
                                                                : displayMoney < 0
                                                                    ? "red"
                                                                    : "inherit",

                                                        }}
                                                    >
                                                        {new Intl.NumberFormat("en-US").format(displayMoney || 0)}
                                                    </TableCell>
                                                );
                                            })}

                                            <TableCell
                                                sx={{
                                                    textAlign: "right",
                                                    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                                    fontWeight: "bold",
                                                    paddingLeft: "30px !important",
                                                    paddingRight: "30px !important",
                                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                }}>
                                                {new Intl.NumberFormat("en-US").format(total + costrip)}
                                            </TableCell>

                                            {/* <TableCell>
                                                <Box
                                                    display="flex"
                                                    justifyContent="space-between" // ไอคอนชิดขวา
                                                    alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                                                    width="100%"
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            lineHeight: 1,
                                                            textAlign: "center",
                                                            width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                                                        }}
                                                    >
                                                        {new Intl.NumberFormat("en-US").format(moneyGuarantee.reduce((acc, doc) => acc + Number(doc.Money), 0))}
                                                    </Typography>

                                                    <MoneyGuarantee money={moneyGuarantee} periods={periods} />
                                                </Box>
                                            </TableCell> */}
                                            {/* <TableCell>
                                                <Box
                                                    display="flex"
                                                    justifyContent="space-between" // ไอคอนชิดขวา
                                                    alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                                                    width="100%"
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            lineHeight: 1,
                                                            textAlign: "center",
                                                            width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                                                        }}
                                                    >
                                                        {new Intl.NumberFormat("en-US").format(moneyLoan.reduce((acc, doc) => acc + Number(doc.Money), 0))}
                                                    </Typography>

                                                    <MoneyLoan money={moneyLoan} periods={periods} />
                                                </Box>
                                            </TableCell> */}
                                            <MoneyGuarantee money={moneyGuarantee} periods={periods} name={`${row.Name} ${row.Registration ? row.Registration : ""}`} />
                                            <MoneyLoan money={moneyLoan} periods={periods} name={`${row.Name} ${row.Registration ? row.Registration : ""}`} />
                                        </TableRow>
                                    )
                                    )
                                    )}

                                </TableBody>
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
                                        <TablecellSelling colSpan={4}
                                            sx={{
                                                textAlign: "right",
                                                fontSize: 14,
                                                paddingLeft: "30px !important",
                                                paddingRight: "30px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                            }}
                                        >
                                            รวม
                                        </TablecellSelling>

                                        <TablecellSelling
                                            sx={{
                                                textAlign: "right",
                                                fontSize: 14,
                                                paddingLeft: "30px !important",
                                                paddingRight: "30px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                            }}
                                        >
                                            {new Intl.NumberFormat("en-US").format(summary.costrip)}
                                        </TablecellSelling>

                                        {uniqueNames.map((col) => (
                                            <TablecellSelling key={col.id}
                                                sx={{
                                                    textAlign: "right",
                                                    fontSize: 14,
                                                    paddingLeft: "30px !important",
                                                    paddingRight: "30px !important",
                                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                }}
                                            >
                                                {new Intl.NumberFormat("en-US").format(summary.columns[col.id] || 0)}
                                            </TablecellSelling>
                                        ))}

                                        <TablecellSelling
                                            sx={{
                                                textAlign: "right",
                                                fontSize: 14,
                                                paddingLeft: "30px !important",
                                                paddingRight: "30px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                            }}
                                        >
                                            {new Intl.NumberFormat("en-US").format(summary.total)}
                                        </TablecellSelling>

                                        <TablecellSelling
                                            sx={{
                                                textAlign: "right",
                                                fontSize: 14,
                                                paddingLeft: "30px !important",
                                                paddingRight: "30px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                            }}
                                        >
                                            {new Intl.NumberFormat("en-US").format(summary.guarantee)}
                                        </TablecellSelling>

                                        <TablecellSelling
                                            sx={{
                                                textAlign: "right",
                                                fontSize: 14,
                                                paddingLeft: "30px !important",
                                                paddingRight: "30px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                            }}
                                        >
                                            {new Intl.NumberFormat("en-US").format(summary.loan)}
                                        </TablecellSelling>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                        <TablePaginationBar
                            count={processed.length}
                            page={safePage}
                            rowsPerPage={rowsPerPage}
                            onPageChange={setPage}
                            onRowsPerPageChange={setRowsPerPage}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DocSalary;
