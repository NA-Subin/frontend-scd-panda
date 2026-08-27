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
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellInfo, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";

const ReportTrip = ({ openNavbar }) => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(false);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [driverDetail, setDriver] = React.useState([]);
    const [selectDriver, setSelectDriver] = React.useState(null);
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

    // const trips = Object.values(trip || {});
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
    console.log("orders : ", orders);

    const TripDetail = useMemo(() => {
        if (!selectedDateStart || !selectedDateEnd) return [];

        // 1. กรอง orders ที่อยู่ในช่วงวันที่และมี Product
        // const filteredOrders = orders.filter((order) => {
        //     if (!order.Product || !order.Date) return false;

        //     const orderDate = dayjs(order.Date, "DD/MM/YYYY");
        //     return orderDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");
        // });

        // 2. สร้าง Map: tripId → totalVolumeProduct
        const volumeByTripId = orders.reduce((acc, order) => {
            const totalVolume = Object.entries(order.Product)
                .filter(([productName]) => productName !== "P")
                .reduce((sum, [, productData]) => sum + ((Number(productData.Volume) * 1000) || 0), 0);

            acc[order.Trip] = (acc[order.Trip] || 0) + totalVolume;
            return acc;
        }, {});

        // 3. กรอง trips แล้วรวม totalVolumeProduct เข้าไป
        return trips
            .filter((item) => {
                const itemDate = dayjs(item.DateReceive, "DD/MM/YYYY");
                const isValidStatus = item.StatusTrip === "จบทริป";
                const isTruckType = item.TruckType === "รถใหญ่";
                const isInDateRange = itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");
                const matchDrivers = Number(item.Driver.split(":")[0]) === selectDriver?.id;
                return isValidStatus && isInDateRange && matchDrivers && isTruckType;
            })
            .sort((a, b) => {
                const dateA = dayjs(a.DateReceive, "DD/MM/YYYY");
                const dateB = dayjs(b.DateReceive, "DD/MM/YYYY");
                if (!dateA.isSame(dateB)) {
                    return dateA - dateB;
                }
                return (a.Driver?.split(":")[1] || '').localeCompare(b.Driver?.split(":")[1] || '');
            })
            .map((trip) => ({
                ...trip,
                totalVolumeProduct: volumeByTripId[trip.id - 1] || 0,
            }));
    }, [trips, selectedDateStart, selectedDateEnd, orders, selectDriver]);


    const totalCostTrip = TripDetail.reduce((sum, item) => sum + Number(item.CostTrip || 0), 0);
    const totalVolume = TripDetail.reduce((sum, item) => sum + Number(item.totalVolumeProduct || 0), 0);
    //const totalVolume = TripDetail.reduce((sum, item) => sum + (Number(item.WeightHigh) + Number(item.WeightLow)), 0);

    const sortedDrivers = [...driver].sort((a, b) => {
        // จัดกลุ่มรถใหญ่ไว้ก่อน
        if (a.TruckType === "รถใหญ่" && b.TruckType !== "รถใหญ่") return -1;
        if (a.TruckType !== "รถใหญ่" && b.TruckType === "รถใหญ่") return 1;

        // ถ้าเป็นประเภทเดียวกัน ให้เปรียบเทียบ TicketName.split(":")[1]
        const ticketA = a.Name?.trim() || "";
        const ticketB = b.Name?.trim() || "";
        return ticketA.localeCompare(ticketB, "th"); // ใช้ "th" สำหรับเรียงตามพจนานุกรมไทย
    });

    console.log("Driver : ", sortedDrivers);

    useEffect(() => {
        if (sortedDrivers.length > 0 && !selectDriver) {
            setSelectDriver(sortedDrivers[0]);
        }
    }, [sortedDrivers, selectDriver]);

    console.log("Trip Detail : ", TripDetail);
    console.log("Select Driver : ", selectDriver);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    console.log(sortedDrivers.find(item => item.id === 1));

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานสรุปค่าเที่ยว");

        // 1️⃣ กำหนด columns
        worksheet.columns = [
            { header: "ลำดับ", key: "no", width: 8 },
            { header: "วันที่รับ", key: "date", width: 15 },
            { header: "ไป", key: "orders", width: 50 },
            { header: "ค่าเที่ยว", key: "cost", width: 20 },
            { header: "คลัง", key: "depot", width: 30 },
            { header: "จำนวนลิตร", key: "volume", width: 30 },
        ];

        // 2️⃣ Title merge
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "รายงานสรุปค่าเที่ยว";
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
        TripDetail.forEach((row, index) => {
            const ordersText = Object.entries(row)
                .filter(([key]) => key.startsWith("Order"))
                .sort((a, b) => parseInt(a[0].replace("Order", "")) - parseInt(b[0].replace("Order", "")))
                .map(([_, value], idx) => `[${idx + 1}] : ${value.split(":")[1]}`)
                .join("\n");

            const dataRow = {
                no: index + 1,
                date: formatThaiSlash(dayjs(row.DateReceive, "DD/MM/YYYY")),
                orders: ordersText,
                cost: Number(row.CostTrip),
                depot: row.Depot.split(":")[0],
                volume: Number(row.totalVolumeProduct),
            };

            const newRow = worksheet.addRow(dataRow);
            newRow.height = 100;
            newRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            newRow.eachCell((cell, colNumber) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                // ยกเว้น column "no"
                if (worksheet.columns[colNumber - 1].key !== "no" && worksheet.columns[colNumber - 1].key !== "orders") {
                    cell.numFmt = "#,##0.00";
                }
            });
        });

        // 5️⃣ Footer row รวมค่า
        const footerRow = worksheet.addRow({
            orders: "รวม",
            cost: TripDetail.reduce((acc, r) => acc + Number(r.CostTrip), 0),
            volume: TripDetail.reduce((acc, r) => acc + Number(r.totalVolumeProduct), 0),
        });

        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.height = 25;
        footerRow.eachCell((cell, colNumber) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE699" } }; // สีเหลือง
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            if (worksheet.columns[colNumber - 1].key !== "no" && worksheet.columns[colNumber - 1].key !== "orders") {
                cell.numFmt = "#,##0.00";
            }
        });

        // 6️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานสรุปค่าเที่ยว_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
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
                        สรุปค่าเที่ยว
                    </Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ width: "100%" }}>
                {
                    windowWidth >= 800 ?
                        <Grid container spacing={2} width="100%" marginBottom={1} >
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
                                            options={sortedDrivers}
                                            getOptionLabel={(option) => `${option.Name} (${option.TruckType})`}
                                            isOptionEqualToValue={(option, value) =>
                                                option.id === value.id
                                            }
                                            value={selectDriver}
                                            onChange={(event, newValue) => {
                                                setSelectDriver(newValue);
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
                                                                พนักงานขับรถ/ทะเบียน :
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
                                                        {`${option.Name} (${option.TruckType})`}
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
                            <Grid item sm={3} lg={2}>
                                <Button variant="contained" size="small" color="success" sx={{ marginTop: 0.5 }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
                            </Grid>
                        </Grid>
                        :
                        <Grid container spacing={2} p={1}>
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
                                <Paper>
                                    <Paper>
                                        <Autocomplete
                                            id="autocomplete-tickets"
                                            options={sortedDrivers}
                                            getOptionLabel={(option) => `${option.Name} (${option.TruckType})`}
                                            isOptionEqualToValue={(option, value) =>
                                                option.id === value.id
                                            }
                                            value={selectDriver}
                                            onChange={(event, newValue) => {
                                                setSelectDriver(newValue);
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
                                                                พนักงานขับรถ/ทะเบียน :
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
                                                        {`${option.Name} (${option.TruckType})`}
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
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sx={{ textAlign: "center" }}>
                                <Button variant="contained" size="small" color="success" sx={{ marginTop: 1.5 }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
                            </Grid>
                        </Grid>
                }
                <Grid container spacing={2} width="100%" sx={{ marginTop: -4 }}>
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
                                        <TablecellInfo width={20} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellInfo>
                                        <TablecellInfo sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            วันที่รับ
                                        </TablecellInfo>
                                        <TablecellInfo sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                            ไป
                                        </TablecellInfo>
                                        <TablecellInfo sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ค่าเที่ยว
                                        </TablecellInfo>
                                        <TablecellInfo sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            คลัง
                                        </TablecellInfo>
                                        <TablecellInfo sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            จำนวนลิตร
                                        </TablecellInfo>
                                        <TablecellInfo sx={{ textAlign: "center", width: 20 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        TripDetail.map((row, index) => (
                                            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{formatThaiSlash(dayjs(row.DateReceive, "DD/MM/YYYY"))}</TableCell>
                                                <TableCell>
                                                    {
                                                        Object.entries(row)
                                                            .filter(([key]) => key.startsWith("Order"))
                                                            .sort((a, b) => parseInt(a[0].replace("Order", "")) - parseInt(b[0].replace("Order", "")))
                                                            .map(([_, value], idx) => (
                                                                <div key={idx}>{`[${idx + 1}] : ${value.split(":")[1]}`}</div>
                                                            ))
                                                    }
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.CostTrip)}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Depot.split(":")[0]}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(Number(row.totalVolumeProduct))}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Grid container spacing={1} marginTop={1} paddingBottom={1} sx={{ backgroundColor: theme.palette.info.main }}>
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
                                        value={new Intl.NumberFormat("en-US").format(totalCostTrip)}
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
                                        <TextField fullWidth size="small" value={new Intl.NumberFormat("en-US").format(totalCostTrip)} />
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

export default ReportTrip;
