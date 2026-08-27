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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellPink, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";

const SummaryOilBalanceSmallTruck = ({ openNavbar }) => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(false);
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

    console.log("sortConfig : ", sortConfig);

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
    const { order, trip } = useTripData();
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    });

    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

    const driver = Object.values(drivers || {});
    const ticketsT = Object.values(customertransports || {});
    const ticketsPS = Object.values(customergasstations || {});
    const ticketsB = Object.values(customerbigtruck || {});
    const ticketsS = Object.values(customersmalltruck || {});
    const ticketsA = Object.values(customertickets || {});

    console.log("Select Driver ID : ", selectDriver);

    const orderDetail = useMemo(() => {
        if (!selectedDateStart || !selectedDateEnd) return [];

        return orders
            .filter((item) => {
                const itemDate = dayjs(item.Date, "DD/MM/YYYY");

                // ตรวจสอบว่าเป็นสถานะที่ต้องการ และอยู่ในช่วงวัน
                const isValidStatus = item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined;
                const isInDateRange = itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");

                // ตรวจสอบเงื่อนไขของ driver ตาม selectDriver
                const matchTickets = selectTickets === "0:แสดงทั้งหมด" || item.TicketName === selectTickets;

                const TruckType = trips.find((t) => (Number(t.id) - 1) === item.Trip)

                return isValidStatus && isInDateRange && matchTickets && TruckType?.TruckType === "รถเล็ก" && TruckType?.Status !== "ยกเลิก";
            })
            .flatMap((item) => {
                if (!item.Product) return [];

                return Object.entries(item.Product)
                    .filter(([productName]) => productName !== "P")
                    .map(([productName, productData]) => ({
                        ...item,
                        ProductName: productName,
                        VolumeProduct: productData.Volume,
                        Amount: productData.Amount || 0,
                        OverdueTransfer: productData.OverdueTransfer || 0,
                        RateOil: productData.RateOil || 0,
                    }));
            })
            .sort((a, b) => {
                const dateA = dayjs(a.Date, "DD/MM/YYYY");
                const dateB = dayjs(b.Date, "DD/MM/YYYY");
                if (!dateA.isSame(dateB)) {
                    return dateA - dateB;
                }
                return (a.driver?.split(":")[1] || '').localeCompare(b.driver?.split(":")[1] || '');
            });
    }, [orders, selectedDateStart, selectedDateEnd]);

    const totalAmount = orderDetail.reduce((sum, item) => sum + Number(item.Amount || 0), 0);
    const totalVolume = orderDetail.reduce((sum, item) => sum + (Number(item.VolumeProduct || 0)), 0);

    const sortedOrderDetail = useMemo(() => {
        const sorted = [...orderDetail];
        const key = sortConfig.key || 'Date';
        const direction = sortConfig.key ? sortConfig.direction : 'asc';

        sorted.sort((a, b) => {
            let aValue, bValue;

            if (key === 'Date') {
                aValue = dayjs(a.Date, "DD/MM/YYYY");
                bValue = dayjs(b.Date, "DD/MM/YYYY");
            } else if (key === 'Driver') {
                aValue = a.Driver?.split(":")[1] || '';
                bValue = b.Driver?.split(":")[1] || '';
            } else if (key === 'TicketName') {
                aValue = a.TicketName?.split(":")[1] || '';
                bValue = b.TicketName?.split(":")[1] || '';
            } else if (key === 'ProductName') {
                aValue = a.ProductName || '';
                bValue = b.ProductName || '';
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
            // ...[...ticketsPS]
            //     .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
            //     .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
            //     .map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),

            // ...[...ticketsT]
            //     .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
            //     .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
            //     .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),

            // ...[...ticketsB].filter((item) => item.Status === "ลูกค้าประจำ")
            //     .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
            //     .map((item) => ({ ...item, CustomerType: "ตั๋วรถใหญ่" })),
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
        const worksheet = workbook.addWorksheet("รายงานสรุปยอดน้ำมัน");

        // 1️⃣ กำหนด columns
        worksheet.columns = [
            { header: "ลำดับ", key: "no", width: 8 },
            { header: "วันที่ส่ง", key: "date", width: 15 },
            { header: "ผู้ขับ/ป้ายทะเบียน", key: "driverReg", width: 40 },
            { header: "ตั๋ว", key: "ticket", width: 45 },
            { header: "ชนิดน้ำมัน", key: "product", width: 15 },
            { header: "จำนวนลิตร", key: "volume", width: 30 },
            { header: "ราคาน้ำมัน", key: "rate", width: 25 },
            { header: "ยอดเงิน", key: "amount", width: 30 },
        ];

        // 2️⃣ Title merge
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "รายงานสรุปยอดน้ำมัน";
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
                date: formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY")),
                driverReg: `${row.Driver.split(":")[1]}/${row.Registration.split(":")[1]}`,
                ticket: row.TicketName.split(":")[1],
                product: row.ProductName,
                volume: Number(row.VolumeProduct),
                rate: Number(row.RateOil),
                amount: Number(row.Amount),
            };

            const newRow = worksheet.addRow(dataRow);
            newRow.height = 20;
            newRow.alignment = { vertical: "middle", horizontal: "center" };
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
            ticket: "รวม",
            volume: sortedOrderDetail.reduce((acc, r) => acc + Number(r.VolumeProduct), 0),
            amount: sortedOrderDetail.reduce((acc, r) => acc + Number(r.Amount), 0),
        });

        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.height = 25;
        footerRow.eachCell((cell, colNumber) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE699" } }; // สีเหลือง
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            if (worksheet.columns[colNumber - 1].key !== "no" && worksheet.columns[colNumber - 1].key !== "driverReg" && worksheet.columns[colNumber - 1].key !== "ticket" && worksheet.columns[colNumber - 1].key !== "product") {
                cell.numFmt = "#,##0.00";
            }
        });

        // 6️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานสรุปยอดน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Grid container spacing={2}>
                <Grid item md={12} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        สรุปยอดน้ำมัน / รถเล็ก
                    </Typography>
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
                                        marginBottom: 3
                                    }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Paper sx={{ marginRight: 2 }}>
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
                                                                fontSize: "16px",
                                                                height: "40px",
                                                                padding: "10px",
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
                                                                fontSize: "16px",
                                                                height: "40px",
                                                                padding: "10px",
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
                            <Grid item sm={12} lg={5}>
                                {/* <Paper>
                            <FormControl size="small" fullWidth>
                                <Select
                                    value={selectDriver}
                                    onChange={handleChangeDriver}
                                    input={
                                        <OutlinedInput
                                            startAdornment={
                                                <InputAdornment position="start" sx={{ marginRight: 1 }}>
                                                    กรุณาเลือกผู้ขับ/ป้ายทะเบียน :
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 250, // ความสูงสูงสุดที่จะแสดงก่อนมี scroll
                                                width: 300,     // ปรับความกว้างตามต้องการ
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value={0}>แสดงทั้งหมด</MenuItem>
                                    {[...driver]
                                        .sort((a, b) => {
                                            // รถใหญ่ต้องมาก่อน
                                            if (a.TruckType === "รถใหญ่" && b.TruckType !== "รถใหญ่") return -1;
                                            if (a.TruckType !== "รถใหญ่" && b.TruckType === "รถใหญ่") return 1;

                                            // ถ้า TruckType เหมือนกัน ให้เรียงตามชื่อ
                                            return a.Name.localeCompare(b.Name);
                                        })
                                        .map((row) => (
                                            <MenuItem key={row.id} value={row.id}>
                                                {`${row.Name}/${row.Registration.split(":")[1]} (${row.TruckType})`}
                                            </MenuItem>
                                        ))}

                                </Select>
                            </FormControl> */}
                                <Paper>
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

                                    {/* <FormControl size="small" fullWidth>
                                <Select
                                    value={selectTickets}
                                    onChange={handleChangeTickets}
                                    input={
                                        <OutlinedInput
                                            startAdornment={
                                                <InputAdornment position="start" sx={{ marginRight: 1 }}>
                                                    กรุณาเลือกผู้ขับ/ป้ายทะเบียน :
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 250, // ความสูงสูงสุดที่จะแสดงก่อนมี scroll
                                                width: 300,     // ปรับความกว้างตามต้องการ
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value={0}>แสดงทั้งหมด</MenuItem>
                                    {getCustomers().map((row) => (
                                        <MenuItem key={row.id} value={`${row.id}:${row.Name}`}>
                                            {`${row.Name} (${row.CustomerType})`}
                                        </MenuItem>
                                    ))}

                                </Select>
                            </FormControl> */}
                                </Paper>
                            </Grid>
                            <Grid item sm={12} lg={2}>
                                <Button variant="contained" size="small" color="success" sx={{ marginTop: 0.5 }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
                            </Grid>
                        </Grid>
                        :
                        <Grid container spacing={2} width="100%">
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        width: "100%", // กำหนดความกว้างของ Paper
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 3
                                    }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Paper sx={{ marginRight: 2 }}>
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
                                                                fontSize: "16px",
                                                                height: "40px",
                                                                padding: "10px",
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
                                                                fontSize: "16px",
                                                                height: "40px",
                                                                padding: "10px",
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
                            <FormControl size="small" fullWidth>
                                <Select
                                    value={selectDriver}
                                    onChange={handleChangeDriver}
                                    input={
                                        <OutlinedInput
                                            startAdornment={
                                                <InputAdornment position="start" sx={{ marginRight: 1 }}>
                                                    กรุณาเลือกผู้ขับ/ป้ายทะเบียน :
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 250, // ความสูงสูงสุดที่จะแสดงก่อนมี scroll
                                                width: 300,     // ปรับความกว้างตามต้องการ
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value={0}>แสดงทั้งหมด</MenuItem>
                                    {[...driver]
                                        .sort((a, b) => {
                                            // รถใหญ่ต้องมาก่อน
                                            if (a.TruckType === "รถใหญ่" && b.TruckType !== "รถใหญ่") return -1;
                                            if (a.TruckType !== "รถใหญ่" && b.TruckType === "รถใหญ่") return 1;

                                            // ถ้า TruckType เหมือนกัน ให้เรียงตามชื่อ
                                            return a.Name.localeCompare(b.Name);
                                        })
                                        .map((row) => (
                                            <MenuItem key={row.id} value={row.id}>
                                                {`${row.Name}/${row.Registration.split(":")[1]} (${row.TruckType})`}
                                            </MenuItem>
                                        ))}

                                </Select>
                            </FormControl> */}
                                <Paper>
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

                                    {/* <FormControl size="small" fullWidth>
                                <Select
                                    value={selectTickets}
                                    onChange={handleChangeTickets}
                                    input={
                                        <OutlinedInput
                                            startAdornment={
                                                <InputAdornment position="start" sx={{ marginRight: 1 }}>
                                                    กรุณาเลือกผู้ขับ/ป้ายทะเบียน :
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 250, // ความสูงสูงสุดที่จะแสดงก่อนมี scroll
                                                width: 300,     // ปรับความกว้างตามต้องการ
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value={0}>แสดงทั้งหมด</MenuItem>
                                    {getCustomers().map((row) => (
                                        <MenuItem key={row.id} value={`${row.id}:${row.Name}`}>
                                            {`${row.Name} (${row.CustomerType})`}
                                        </MenuItem>
                                    ))}

                                </Select>
                            </FormControl> */}
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" size="small" color="success" sx={{ marginTop: 0.5 }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
                            </Grid>
                        </Grid>
                }
                <Grid container spacing={2} width="100%" sx={{ marginTop: { lg: -4, xs: -1 } }}>
                    <Grid item xs={12}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "55vh",
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
                                            onClick={() => handleSort("Date")}
                                            sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                วันที่ส่ง
                                                {sortConfig.key === "Date" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>

                                        <TablecellPink
                                            onClick={() => handleSort("Driver")}
                                            sx={{ textAlign: "center", fontSize: 16, width: 150 }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                ผู้ขับ/ป้ายทะเบียน
                                                {sortConfig.key === "Driver" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
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
                                        <TablecellPink
                                            onClick={() => handleSort("ProductName")}
                                            sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                ชนิดน้ำมัน
                                                {sortConfig.key === "ProductName" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            จำนวนลิตร
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ราคาน้ำมัน
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ยอดเงิน
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", width: 20 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        sortedOrderDetail.map((row, index) => (
                                            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f8f0f7fa" }} >
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{`${row.Driver.split(":")[1]}/${row.Registration.split(":")[1]}`}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.TicketName.split(":")[1]}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.ProductName}</TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "30px !important",
                                                        paddingRight: "30px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US").format(Number(row.VolumeProduct))}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "30px !important",
                                                        paddingRight: "30px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {
                                                        new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2, // แสดงทศนิยมอย่างน้อย 2 ตำแหน่ง
                                                            maximumFractionDigits: 2  // แสดงทศนิยมไม่เกิน 2 ตำแหน่ง
                                                        }).format(Number(row.RateOil))
                                                    }
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "30px !important",
                                                        paddingRight: "30px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                                    }}
                                                >
                                                    {
                                                        new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2, // แสดงทศนิยมอย่างน้อย 2 ตำแหน่ง
                                                            maximumFractionDigits: 2  // แสดงทศนิยมไม่เกิน 2 ตำแหน่ง
                                                        }).format(Number(row.Amount))
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Grid container spacing={1} marginTop={1} paddingBottom={1} sx={{ backgroundColor: theme.palette.pink.dark }}>
                            <Grid item xs={3} />
                            <Grid item xs={3}>
                                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right", marginRight: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>รวมลิตร</Typography> */}
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
                                {/* </Box> */}
                            </Grid>
                            <Grid item xs={3}>
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
                                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", marginLeft: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>ยอดเงิน</Typography>
                                    <Paper>
                                        <TextField fullWidth size="small" value={new Intl.NumberFormat("en-US").format(totalAmount)} />
                                    </Paper>
                                </Box> */}
                            </Grid>
                            <Grid item xs={3} />
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Container>

    );
};

export default SummaryOilBalanceSmallTruck;
