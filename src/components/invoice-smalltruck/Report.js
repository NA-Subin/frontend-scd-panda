import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
    OutlinedInput,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellPink, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import ReportDetail from "./ReportDetail";

const ReportPaymentSmallTruck = ({ openNavbar }) => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(3);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [driverDetail, setDriver] = React.useState([]);
    const [selectDriver, setSelectDriver] = React.useState(0);
    const [selectTickets, setSelectTickets] = React.useState("0:แสดงทั้งหมด");
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [sortConfig, setSortConfig] = useState({
        key: 'Date',
        direction: 'asc',
    });

    const flattenedRef = useRef([]);
    const filteredItemsRef = useRef([]);
    const incomingMoneyRef = useRef([]);

    console.log("sortConfig : ", sortConfig);
    console.log("filteredItem รายการย่อย:", filteredItemsRef.current);
    console.log("flattened รายการย่อย:", flattenedRef.current);
    console.log("IncomingMoney รายการย่อย:", incomingMoneyRef.current);

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

    const formatBalanceOrOverdue = (totalAmount, totalOverdue) => {
        const toNumber = (val) => {
            if (val === null || val === undefined || val === "") return 0;
            const cleaned = String(val).replace(/,/g, "");
            const num = Number(cleaned);
            return isNaN(num) ? 0 : num;
        };

        const amount = toNumber(totalAmount);
        const overdue = toNumber(totalOverdue);

        // ✅ คำนวณแบบกัน floating error
        let balance = Math.round((amount - overdue) * 100) / 100;

        // ✅ ถ้าใกล้ศูนย์มาก ให้ถือว่าเป็น 0 ไปเลย
        if (Math.abs(balance) < 0.005) {
            balance = 0;
        }

        const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        if (balance !== 0) {
            return formatter.format(overdue);
        }

        return formatter.format(balance);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleChangeDriver = (event) => {
        setSelectDriver(event.target.value);
    };

    const handleChangeTickets = (event) => {
        setSelectTickets(event.target.value);
    };

    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateStart(formattedDate);
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateEnd(formattedDate);
        }
    };

    // const { reportFinancial, drivers } = useData();
    const { drivers, customertransports, customergasstations, customerbigtruck, customersmalltruck, customertickets } = useBasicData();
    const { order, transferMoney } = useTripData();
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    });
    const driver = Object.values(drivers || {});
    const ticketsT = Object.values(customertransports || {});
    const ticketsPS = Object.values(customergasstations || {});
    const ticketsB = Object.values(customerbigtruck || {});
    const ticketsS = Object.values(customersmalltruck || {});
    const ticketsA = Object.values(customertickets || {});
    const transferMoneyDetail = Object.values(transferMoney || {});

    console.log("Select Driver ID : ", selectDriver);
    // const orderDetail = orders
    //     .filter((item) => {
    //         const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    //         const customerId = Number(item.TicketName.split(":")[0]);
    //         console.log("checks : ", check);
    //         let isInCompany =
    //             check === 1 ?
    //                 ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]))
    //                 : check === 2 ?
    //                     ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]) && customer.StatusCompany === "อยู่บริษัทในเครือ")
    //                     : ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]) && customer.StatusCompany === "ไม่อยู่บริษัทในเครือ");

    //         return (
    //             isInCompany && // <--- ป้องกัน error
    //             isInCompany.id === customerId &&
    //             item.CustomerType === "ตั๋วรถใหญ่" &&
    //             item.Trip !== "ยกเลิก" &&
    //             itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") // "[]" คือรวมวันที่ปลายทางด้วย
    //         );
    //     })
    //     .map((item) => {
    //         let totalVolume = 0;
    //         let totalAmount = 0;
    //         let totalOverdue = 0;

    //         const totalIncomingMoney = transferMoneyDetail
    //             .filter(trans => trans.TicketNo === item.No)
    //             .reduce((sum, trans) => {
    //                 const value = parseFloat(trans.IncomingMoney) || 0;
    //                 return sum + value;
    //             }, 0);

    //         Object.entries(item.Product).forEach(([key, value]) => {
    //             if (key !== "P") {
    //                 totalVolume += parseFloat(value.Volume || 0);
    //                 totalAmount += parseFloat(value.Amount || 0);
    //             }
    //         });
    //         return {
    //             ...item,
    //             TotalVolume: totalVolume,
    //             TotalAmount: totalAmount,
    //             TotalOverdue: totalIncomingMoney,
    //         };
    //     }).sort((a, b) => a.TicketName.localeCompare(b.TicketName));

    console.log("transfer : ", transferMoneyDetail
        .filter(trans => trans.TicketName === "15:C.สหพานิช"));

    console.log("orders : ", orders.filter((t) => t.TicketName === "15:C.สหพานิช"));

    const orderDetail = useMemo(() => {
        if (!selectedDateStart || !selectedDateEnd) return [];

        // 1. กรอง order เฉพาะที่สถานะถูกต้องและอยู่ในช่วงวันที่
        const filteredItems = orders.filter((item) => {
            const itemDate = dayjs(item.Date, "DD/MM/YYYY");
            const isValidStatus = item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined;
            const isInDateRange = itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");
            const matchTickets = selectTickets === "0:แสดงทั้งหมด" || item.TicketName === selectTickets;

            // หาค่า customerId จาก TicketName
            const customerId = Number(item.TicketName.split(":")[0]);

            // ตรวจสอบเงื่อนไข check กับ customerB
            let isInCompany = false;

            if (check === 1) {
                isInCompany = ticketsS.some(customer => customer.id === customerId);
            } else if (check === 2) {
                isInCompany = ticketsS.some(customer => customer.id === customerId && customer.StatusCompany === "อยู่บริษัทในเครือ");
            } else if (check === 3) {
                isInCompany = ticketsS.some(customer => customer.id === customerId && customer.StatusCompany === "ไม่อยู่บริษัทในเครือ");
            }

            return isValidStatus && isInDateRange && matchTickets && isInCompany && item.CustomerType === "ตั๋วรถเล็ก";
        });

        filteredItemsRef.current = filteredItems.filter((t) => t.Trip !== "ยกเลิก");

        // 2. แตก Product รายการย่อยออกมา
        const flattened = filteredItems.flatMap((item) => {
            if (!item.Product) return [];

            const totalIncomingMoney = transferMoneyDetail
                .filter(trans => trans.TicketNo === item.No && trans.Status !== "ยกเลิก")
                .reduce((sum, trans) => {
                    const value = parseFloat(trans.IncomingMoney) || 0;
                    return sum + value;
                }, 0);

            const incomingMoneyDetail = transferMoneyDetail
                .filter(trans => trans.TicketNo === item.No)

            console.log("show incoming : ", incomingMoneyDetail);

            return Object.entries(item.Product)
                .filter(([productName]) => productName !== "P")
                .map(([productName, productData]) => ({
                    ...item,
                    IncomingMoneyDetail: incomingMoneyDetail,
                    ProductName: productName,
                    VolumeProduct: Number(productData.Volume),
                    Amount: productData.Amount || 0,
                    IncomingMoney: totalIncomingMoney || 0,
                    OverdueTransfer: 0,
                    RateOil: productData.RateOil || 0,
                }));
        });

        flattenedRef.current = flattened;

        // 3. รวมข้อมูลที่มี TicketName เดียวกัน (เฉพาะที่อยู่ในช่วงวันที่ที่เลือกแล้วเท่านั้น)
        const countedTicketNo = new Set();

        const merged = Object.values(
            flattened.reduce((acc, curr) => {
                const key = curr.TicketName;
                const ticketNo = curr.No;

                if (!acc[key]) {
                    acc[key] = {
                        ...curr,
                        VolumeProduct: 0,
                        Amount: 0,
                        IncomingMoney: 0,
                    };
                }

                // รวมสินค้า (ถูกแล้ว)
                acc[key].VolumeProduct += Number(curr.VolumeProduct) || 0;
                acc[key].Amount += Number(curr.Amount) || 0;

                // เงินโอนคิดครั้งเดียวต่อ Ticket (ถูกแล้ว)
                if (!countedTicketNo.has(ticketNo)) {
                    acc[key].IncomingMoney += Number(curr.IncomingMoney) || 0;
                    countedTicketNo.add(ticketNo);
                }

                return acc;
            }, {})
        );

        const finalData = merged.map(row => {
            const amount = Number(row.Amount) || 0;
            const incoming = Number(row.IncomingMoney) || 0;

            let overdue = amount - incoming;

            // กัน floating และ -0
            if (Math.abs(overdue) < 0.01) overdue = 0;

            return {
                ...row,
                OverdueTransfer: overdue
            };
        });

        // 4. เรียงตามวันที่ และชื่อคนขับ
        return finalData.sort((a, b) => {
            const dateA = dayjs(a.Date, "DD/MM/YYYY");
            const dateB = dayjs(b.Date, "DD/MM/YYYY");
            if (!dateA.isSame(dateB)) {
                return dateA - dateB;
            }
            return (a.driver?.split(":")[1] || '').localeCompare(b.driver?.split(":")[1] || '');
        });

    }, [orders, selectedDateStart, selectedDateEnd, selectTickets, transferMoneyDetail]);

    const totalAmount = orderDetail.reduce((sum, item) => sum + Number(item.Amount || 0), 0);
    const totalOverdueTransfer = orderDetail.reduce((sum, item) => sum + Number(item.OverdueTransfer || 0), 0);
    const totalIncomingMoney = orderDetail.reduce((sum, item) => sum + Number(item.IncomingMoney || 0), 0);
    const totalVolume = orderDetail.reduce((sum, item) => sum + (Number(item.VolumeProduct || 0)), 0);

    const sortedOrderDetail = useMemo(() => {
        const sorted = [...orderDetail];
        const key = sortConfig.key || 'Date';
        const direction = sortConfig.key ? sortConfig.direction : 'asc';

        sorted.sort((a, b) => {
            let aValue, bValue;

            if (key === 'TicketName') {
                aValue = a.TicketName?.split(":")[1] || '';
                bValue = b.TicketName?.split(":")[1] || '';
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [orderDetail, sortConfig]);

    const getCustomers = () => {
        const customers = [
            { id: "0", Name: "แสดงทั้งหมด", CustomerType: "" },
            ...[...ticketsPS]
                .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),

            ...[...ticketsT]
                .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),

            ...[...ticketsB].filter((item) => item.Status === "ลูกค้าประจำ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรถใหญ่" })),
            // รถใหญ่ใช้ ticketsB
            ...[...ticketsS].filter((item) => item.Status === "ลูกค้าประจำ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรถเล็ก" })) // รถเล็กใช้ ticketsS
        ];

        return customers.filter((item) => item.id || item.TicketsCode);
    };


    console.log("Order Detail : ", orderDetail);
    console.log("Select Tickets : ", selectTickets);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานชำระค่าน้ำมัน");

        // 1️⃣ กำหนด columns
        worksheet.columns = [
            { header: "ลำดับ", key: "no", width: 8 },
            { header: "ตั๋ว", key: "ticket", width: 55 },
            { header: "ยอดลิตร", key: "volume", width: 25 },
            { header: "ยอดเงิน", key: "amount", width: 25 },
            { header: "ยอดโอน", key: "incoming", width: 25 },
            { header: "ค้างโอน", key: "overdue", width: 25 },
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
        sortedOrderDetail.forEach((row, index) => {
            const dataRow = {
                no: index + 1,
                ticket: row.TicketName.split(":")[1] !== "" ? row.TicketName.split(":")[1] : row.TicketName,
                volume: Number(row.VolumeProduct),
                amount: Number(row.Amount),
                incoming: Number(row.IncomingMoney),
                overdue: Number(row.OverdueTransfer),
            };

            const newRow = worksheet.addRow(dataRow);
            newRow.height = 20;
            newRow.alignment = { horizontal: "center", vertical: "middle" };
            newRow.eachCell((cell, colNumber) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                if (worksheet.columns[colNumber - 1].key !== "no") {
                    cell.numFmt = "#,##0.00";
                }
            });
        });

        // 5️⃣ Footer row รวมค่า
        const footerRow = worksheet.addRow({
            ticket: "รวม",
            volume: sortedOrderDetail.reduce((acc, r) => acc + Number(r.VolumeProduct), 0),
            amount: sortedOrderDetail.reduce((acc, r) => acc + Number(r.Amount), 0),
            incoming: sortedOrderDetail.reduce((acc, r) => acc + Number(r.IncomingMoney), 0),
            overdue: sortedOrderDetail.reduce((acc, r) => acc + Number(r.OverdueTransfer), 0),
        });

        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.height = 25;
        footerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE699" } }; // สีเหลือง
            cell.numFmt = "#,##0.00"; // format ตัวเลข
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 6️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานชำระค่าน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };


    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Grid container spacing={2} sx={{ marginBottom: -5 }}>
                <Grid item md={12} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        รายงานชำระค่าน้ำมัน / รถเล็ก
                    </Typography>
                </Grid>
                <Grid item sm={12} lg={10}></Grid>
                <Grid item sm={12} lg={2}>
                    <Button variant="contained" size="small" color="success" sx={{ marginTop: { lg: -17, xs: -10 } }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ width: "100%" }}>
                {
                    windowWidth >= 800 ?
                        <Grid container spacing={2} width="100%">
                            <Grid item sm={12} lg={5}>
                                <Box
                                    sx={{
                                        width: "100%", // กำหนดความกว้างของ Paper
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: { lg: 3, xs: -1 }
                                    }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Paper sx={{ marginRight: 2 }}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDateStart)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChangeDateStart}
                                                sx={{ marginRight: 2, }}
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        fullWidth: true,
                                                        InputProps: {
                                                            startAdornment: (
                                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                    วันที่เริ่มต้น :
                                                                </InputAdornment>
                                                            ),
                                                            sx: {
                                                                fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                                height: "40px",  // ความสูงของ Input
                                                                padding: "10px", // Padding ภายใน Input
                                                                fontWeight: "bold",
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </Paper>
                                        <Paper>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDateEnd)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChangeDateEnd}
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        fullWidth: true,
                                                        InputProps: {
                                                            startAdornment: (
                                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                    วันที่สิ้นสุด :
                                                                </InputAdornment>
                                                            ),
                                                            sx: {
                                                                fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                                height: "40px",  // ความสูงของ Input
                                                                padding: "10px", // Padding ภายใน Input
                                                                fontWeight: "bold",
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </LocalizationProvider>
                                </Box>
                            </Grid>
                            <Grid item sm={12} lg={7}>
                                {/* <Paper>
                            <Paper>
                                <Autocomplete
                                    id="autocomplete-tickets"
                                    options={getCustomers()}
                                    getOptionLabel={(option) => selectTickets === "0:แสดงทั้งหมด" ? option.Name : `${option.Name} (${option.CustomerType})`}
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id && option.Name === value.Name
                                    }
                                    value={
                                        selectTickets
                                            ? getCustomers().find(item => `${item.id}:${item.Name}` === selectTickets)
                                            : null
                                    }
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            handleChangeTickets({ target: { value: `${newValue.id}:${newValue.Name}` } });
                                        } else {
                                            handleChangeTickets({ target: { value: "" } });
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            label=""
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 1 }}>
                                                        กรุณาเลือกตั๋ว :
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    height: "40px",
                                                    fontSize: "18px",
                                                    paddingRight: "8px",
                                                },
                                            }}
                                            InputLabelProps={{ shrink: false }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="16px">
                                                {selectTickets === "0:แสดงทั้งหมด" ? option.Name : `${option.Name} (${option.CustomerType})`}
                                            </Typography>
                                        </li>
                                    )}
                                    ListboxProps={{
                                        style: {
                                            maxHeight: 250,
                                        },
                                    }}
                                />
                            </Paper>
                        </Paper> */}
                                <FormGroup row sx={{ marginBottom: -1.5 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                                    <FormControlLabel control={<Checkbox color="pink" checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
                                    <FormControlLabel control={<Checkbox color="pink" checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="อยู่บริษัทในเครือ" />
                                    <FormControlLabel control={<Checkbox color="pink" checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="ไม่อยู่บริษัทในเครือ" />
                                </FormGroup>
                            </Grid>
                        </Grid>
                        :
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        width: "100%", // กำหนดความกว้างของ Paper
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: { lg: 3, xs: -1 }
                                    }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Paper sx={{ marginRight: 2 }}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDateStart)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChangeDateStart}
                                                sx={{ marginRight: 2, }}
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        fullWidth: true,
                                                        InputProps: {
                                                            startAdornment: (
                                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                    วันที่เริ่มต้น :
                                                                </InputAdornment>
                                                            ),
                                                            sx: {
                                                                fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                                height: "40px",  // ความสูงของ Input
                                                                padding: "10px", // Padding ภายใน Input
                                                                fontWeight: "bold",
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </Paper>
                                        <Paper>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDateEnd)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChangeDateEnd}
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        fullWidth: true,
                                                        InputProps: {
                                                            startAdornment: (
                                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                    วันที่สิ้นสุด :
                                                                </InputAdornment>
                                                            ),
                                                            sx: {
                                                                fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                                height: "40px",  // ความสูงของ Input
                                                                padding: "10px", // Padding ภายใน Input
                                                                fontWeight: "bold",
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </LocalizationProvider>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                {/* <Paper>
                            <Paper>
                                <Autocomplete
                                    id="autocomplete-tickets"
                                    options={getCustomers()}
                                    getOptionLabel={(option) => selectTickets === "0:แสดงทั้งหมด" ? option.Name : `${option.Name} (${option.CustomerType})`}
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id && option.Name === value.Name
                                    }
                                    value={
                                        selectTickets
                                            ? getCustomers().find(item => `${item.id}:${item.Name}` === selectTickets)
                                            : null
                                    }
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            handleChangeTickets({ target: { value: `${newValue.id}:${newValue.Name}` } });
                                        } else {
                                            handleChangeTickets({ target: { value: "" } });
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            label=""
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 1 }}>
                                                        กรุณาเลือกตั๋ว :
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    height: "40px",
                                                    fontSize: "18px",
                                                    paddingRight: "8px",
                                                },
                                            }}
                                            InputLabelProps={{ shrink: false }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="16px">
                                                {selectTickets === "0:แสดงทั้งหมด" ? option.Name : `${option.Name} (${option.CustomerType})`}
                                            </Typography>
                                        </li>
                                    )}
                                    ListboxProps={{
                                        style: {
                                            maxHeight: 250,
                                        },
                                    }}
                                />
                            </Paper>
                        </Paper> */}
                                <FormGroup row sx={{ marginBottom: -1.5 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                                    <FormControlLabel control={<Checkbox color="pink" checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
                                    <FormControlLabel control={<Checkbox color="pink" checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="อยู่บริษัทในเครือ" />
                                    <FormControlLabel control={<Checkbox color="pink" checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="ไม่อยู่บริษัทในเครือ" />
                                </FormGroup>
                            </Grid>
                        </Grid>
                }
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "55vh",
                                mt: 1
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                            >
                                <TableHead sx={{ height: "5vh" }}>
                                    <TableRow>
                                        <TablecellPink width={20} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellPink>
                                        <TablecellPink
                                            onClick={() => handleSort("TicketName")}
                                            sx={{ textAlign: "center", fontSize: 16, width: 150 }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                ตั๋ว
                                                {sortConfig.key === "TicketName" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            ยอดลิตร
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ยอดเงิน
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ยอดโอน
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ค้างโอน
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", width: 20 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        sortedOrderDetail.map((row, index) => (
                                            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f8f0f7fa" }} >
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.TicketName.split(":")[1] !== "" ? row.TicketName.split(":")[1] : row.TicketName}</TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "40px !important",
                                                        paddingRight: "40px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US").format(row.VolumeProduct)}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "40px !important",
                                                        paddingRight: "40px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2, // แสดงทศนิยมอย่างน้อย 2 ตำแหน่ง
                                                        maximumFractionDigits: 2  // แสดงทศนิยมไม่เกิน 2 ตำแหน่ง
                                                    }).format(Number(row.Amount))}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "40px !important",
                                                        paddingRight: "40px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2, // แสดงทศนิยมอย่างน้อย 2 ตำแหน่ง
                                                        maximumFractionDigits: 2  // แสดงทศนิยมไม่เกิน 2 ตำแหน่ง
                                                    }).format(Number(row.IncomingMoney))}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "40px !important",
                                                        paddingRight: "40px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2, // แสดงทศนิยมอย่างน้อย 2 ตำแหน่ง
                                                        maximumFractionDigits: 2  // แสดงทศนิยมไม่เกิน 2 ตำแหน่ง
                                                    }).format(Number(row.OverdueTransfer))}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <ReportDetail key={row.id} row={row} dateStart={selectedDateStart} dateEnd={selectedDateEnd} orderDetail={flattenedRef.current} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Grid container spacing={1} marginTop={1} paddingBottom={1} sx={{ backgroundColor: theme.palette.pink.dark }}>
                            <Grid item xs={3}>
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalVolume)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        รวม :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ลิตร
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                            </Grid>
                            <Grid item xs={3}>
                                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right", marginRight: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>รวมลิตร</Typography> */}
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalAmount)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ยอดเงิน :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        บาท
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                                {/* </Box> */}
                            </Grid>
                            <Grid item xs={3}>
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ยอดโอน :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        บาท
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", marginLeft: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>ยอดเงิน</Typography>
                                    <Paper>
                                        <TextField fullWidth size="small" value={new Intl.NumberFormat("en-US").format(totalAmount)} />
                                    </Paper>
                                </Box> */}
                            </Grid>
                            <Grid item xs={3}>
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalOverdueTransfer)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ค้างโอน :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        บาท
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Container >

    );
};

export default ReportPaymentSmallTruck;
