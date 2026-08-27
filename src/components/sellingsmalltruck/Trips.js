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
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { RateOils, TablecellHeader, TablecellPink, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TripsDetail from "./TripsDetail";
import InsertTrips from "./InsertTrips";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull } from "../../theme/DateTH";

const TripsSmallTruck = ({ openNavbar }) => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [approve, setApprove] = React.useState(false);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [check, setCheck] = useState(2);

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // const { trip } = useData();
    const { trip, tickets } = useTripData();
    // const trips = Object.values(trip || {});
    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

    const ticketsdetail = Object.values(tickets || {})
    console.log("ticketsdetail : ", ticketsdetail.filter((row) => row.CustomerType === "ตั๋วรถเล็ก"))
    console.log("ticketsdetails : ", ticketsdetail.filter((row) => row.TicketName === "35:S.NP..10 ล้อ นาครา 70-1662"));
    console.log("1.tickets : ", ticketsdetail);
    console.log("2.Trips : ", trips.filter((item) => item.TruckType === "รถเล็ก"));
    const result = trips.filter(item =>
        item.TruckType === "รถเล็ก" &&
        item.StatusTrip !== "ยกเลิก" &&
        [item.Ticket1, item.Ticket2, item.Ticket3].some(
            t => t !== undefined && t !== null && t !== ""
        )
    );

    console.log("trips :", result);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" });

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

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/").map(Number);
        return new Date(year, month - 1, day);
    };

    //const tripDetail = trips.filter((item) => item.TruckType === "รถเล็ก" && item.StatusTrip !== "ยกเลิก" );
    const tripDetail = trips.filter((item) => {
        // const itemDateR = dayjs(item.DateReceive, "DD/MM/YYYY");
        // const itemDateD = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const itemDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        return (
            check === 2 ?
                item.TruckType === "รถเล็ก" &&
                item.StatusTrip === "กำลังจัดเที่ยววิ่ง"
                //&&
                //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                //itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                : check === 3 ?
                    item.TruckType === "รถเล็ก" &&
                    item.StatusTrip === "ยกเลิก" &&
                    //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                    itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                    : check === 4 ?
                        item.TruckType === "รถเล็ก" &&
                        item.StatusTrip === "จบทริป" &&
                        //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                        itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                        :
                        item.TruckType === "รถเล็ก" &&
                        //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                        itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
        );
    })
        .sort((a, b) => {
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

    console.log("Trip Detail : ", tripDetail);

    console.log("Trip : ", tripDetail);
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

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeCheck = (value) => {
        setCheck(value);
        setPage(0);
    };

    const maxOrder = tripDetail.length > 0
        ? Math.max(
            ...tripDetail.map(row =>
                Object.keys(row)
                    .filter(k => k.startsWith("Order"))
                    .map(k => Number(k.replace("Order", "")))
            ).flat()
        )
        : 0;

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            {/* <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                เที่ยววิ่งรถเล็ก
            </Typography>
            <Box textAlign="right" marginTop={-8} marginBottom={4} marginRight={5}>
                <InsertTrips />
            </Box> */}
            <Grid container spacing={2}>
                <Grid item md={4} xs={12}>

                </Grid>
                <Grid item md={6} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        จัดเที่ยววิ่ง / รถเล็ก
                    </Typography>
                </Grid>
                <Grid item md={2} xs={12}>
                    <Box sx={{ textAlign: { xs: "center" }, marginTop: { xs: -2, md: 0 } }}>
                        <InsertTrips />
                    </Box>
                </Grid>
                <Grid item md={5} xs={12}>
                    <Box
                        sx={{
                            width: "100%", // กำหนดความกว้างของ Paper
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: { md: -10, xs: 2 },
                            marginBottom: 3
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                        </LocalizationProvider>
                    </Box>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={2} width="100%">
                    <Grid item xs={12}>
                        <FormGroup row sx={{ marginBottom: -2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                            <FormControlLabel control={<Checkbox color="pink" checked={check === 1 ? true : false} />} onChange={() => handleChangeCheck(1)} label="ทั้งหมด" />
                            <FormControlLabel control={<Checkbox color="pink" checked={check === 2 ? true : false} />} onChange={() => handleChangeCheck(2)} label="กำลังจัดเที่ยววิ่ง" />
                            <FormControlLabel control={<Checkbox color="pink" checked={check === 3 ? true : false} />} onChange={() => handleChangeCheck(3)} label="ยกเลิก" />
                            <FormControlLabel control={<Checkbox color="pink" checked={check === 4 ? true : false} />} onChange={() => handleChangeCheck(4)} label="จบทริป" />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ marginBottom: -2, fontSize: "12px", color: "red", textAlign: "right", marginRight: 7 }} gutterBottom>*ดูรายละเอียด/แก้ไขการจัดเที่ยววิ่ง/กดจบทริปตรงนี้*</Typography>
                        <TableContainer
                            component={Paper}
                            sx={{
                                maxWidth: "100%",
                                overflowX: "auto", // แสดง scrollbar แนวนอน
                                marginTop: 2,
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                            >
                                <TableHead>
                                    <TableRow sx={{ height: "7vh" }}>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 60 }}>
                                            ลำดับ
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120, cursor: "pointer" }}
                                            onClick={() => handleSort("DateReceive")}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                วันที่รับ
                                                {sortConfig.key === "DateReceive" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120, cursor: "pointer" }}
                                            onClick={() => handleSort("DateDelivery")}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                วันที่ส่ง
                                                {sortConfig.key === "DateDelivery" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 350, cursor: "pointer" }}
                                            onClick={() => handleSort("Driver")}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                ชื่อ/ทะเบียนรถ
                                                {sortConfig.key === "Driver" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>
                                        {(() => {
                                            // หา key ที่เป็น Order*
                                            const maxOrder = tripDetail.length > 0
                                                ? Math.max(
                                                    ...tripDetail.map(row =>
                                                        Object.keys(row)
                                                            .filter(k => k.startsWith("Order"))
                                                            .map(k => Number(k.replace("Order", "")))
                                                    ).flat()
                                                )
                                                : 0;

                                            return Array.from({ length: maxOrder }, (_, i) => (
                                                <TablecellPink
                                                    key={`order-${i + 1}`}
                                                    sx={{ textAlign: "center", fontSize: 16, width: 250 }}
                                                >
                                                    {`รายการที่ ${i + 1}`}
                                                </TablecellPink>
                                            ));
                                        })()}
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ค่าเที่ยว
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ปริมาณน้ำมัน
                                        </TablecellPink>
                                        {/* <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            น้ำหนักรถ
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 130 }}>
                                            น้ำหนักรวม
                                        </TablecellPink> */}
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            สถานะ
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100, position: "sticky", right: 0 }} />
                                        {/* <TablecellHeader sx={{
                                                    textAlign: "center", fontSize: 16, width: 100, position: "sticky",
                                                    right: windowWidth <= 900 ? 0 : "200px", // ติดซ้ายสุด
                                                    zIndex: windowWidth <= 900 ? 2 : 4,
                                                }}>
                                                    สถานะ
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                                    เพิ่มเที่ยววิ่งโดย
                                                </TablecellHeader>
                                                <TablecellHeader sx={
                                                    windowWidth <= 900 ?
                                                        {
                                                            width: 200,
                                                        }
                                                        :
                                                        {
                                                            width: 200, position: "sticky",
                                                            right: 0, // ระยะที่ชิดซ้ายต่อจากเซลล์ก่อนหน้า
                                                            backgroundColor: theme.palette.panda.light, // ใส่พื้นหลังเพื่อไม่ให้โปร่งใส
                                                            zIndex: 2,
                                                        }
                                                } /> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        tripDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                            <TripsDetail key={row.id} trips={row} index={index} windowWidth={windowWidth} maxOrder={maxOrder} />
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {
                            tripDetail.length < 10 ? null :
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 30]}
                                    component="div"
                                    count={tripDetail.length}
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
                        }
                    </Grid>
                </Grid>
            </Box>
        </Container>

    );
};

export default TripsSmallTruck;
