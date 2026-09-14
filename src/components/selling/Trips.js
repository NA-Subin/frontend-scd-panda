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
import theme from "../../theme/theme";
import { RateOils, TablecellCustomers, TablecellHeader, TablecellNoData, TablecellTickets } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import TripsDetail from "./TripsDetail";
import InsertTrips from "./InsertTrips";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull } from "../../theme/DateTH";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import TablePaginationBar from "../../theme/TablePaginationBar";

const TripsBigTruck = ({ openNavbar }) => {
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

    const { trip, order } = useTripData();
    const { reghead } = useBasicData();
    const registrations = Object.values(reghead || {}).filter((item) => item.StatusTruck !== "ยกเลิก");

    const orderDetail = Object.values(order || {});
    console.log("orderDetail : ", orderDetail.filter((row) => row.TicketName === "35:S.NP..10 ล้อ นาครา 70-1662" && row.Status !== "ยกเลิก"));
    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" });

    console.log("registrations : ", registrations);

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

    //const tripDetail = trips.filter((item) => item.TruckType === "รถใหญ่" && item.StatusTrip !== "ยกเลิก" );
    const tripDetail = trips.filter((item) => {
        // const itemDateR = dayjs(item.DateReceive, "DD/MM/YYYY");
        // const itemDateD = dayjs(item.DateDelivery, "DD/MM/YYYY");

        const itemDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        return (
            check === 2 ?
                // A trip still in progress should always show here regardless
                // of the selected date range - matches the original app,
                // which deliberately left this date filter out.
                (item.TruckType === "รถใหญ่" || item.TruckType === "รถรับจ้างขนส่ง") &&
                item.StatusTrip === "กำลังจัดเที่ยววิ่ง"
                : check === 3 ?
                    (item.TruckType === "รถใหญ่" || item.TruckType === "รถรับจ้างขนส่ง") &&
                    item.StatusTrip === "ยกเลิก" &&
                    //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                    itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                    : check === 4 ?
                        (item.TruckType === "รถใหญ่" || item.TruckType === "รถรับจ้างขนส่ง") &&
                        item.StatusTrip === "จบทริป" &&
                        //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                        itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
                        :
                        (item.TruckType === "รถใหญ่" || item.TruckType === "รถรับจ้างขนส่ง") &&
                        //(itemDateR.isBetween(selectedDateStart, selectedDateEnd, null, "[]") || itemDateD.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
                        itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]")
        );
    })
        .map((item) => {
            // item.Registration เป็น UUID จริงหลัง migrate (schema-manifest: trip.Registration = UUID)
            // ต้อง match ด้วย uuid ไม่ใช่ row.id (NUMERIC) ซึ่งจะไม่มีทาง match กับ UUID ได้เลย
            const regHeadUuid = item.Registration;

            const regHead = registrations.find((row) => row.uuid === regHeadUuid);

            return {
                ...item,
                RegistrationHead: regHead ? regHead?.RegHead : null,
                // truck_registration.RegTail เป็น UUID เช่นกัน ต้องใช้ RegTailName (TEXT) สำหรับแสดงผล
                RegistrationTail: regHead ? regHead?.RegTailName : null,
            };
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
    const pageCount = Math.max(1, Math.ceil(tripDetail.length / rowsPerPage));
    const safePage = Math.min(page, pageCount - 1);

    const handleChangeCheck = (value) => {
        setCheck(value);
        setPage(0);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            {/* <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                เที่ยววิ่งรถใหญ่
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
                        เที่ยววิ่งรถใหญ่
                    </Typography>
                </Grid>
                <Grid item md={2} xs={12} sx={{ textAlign: { xs: "center" }, marginBottom: { xs: 2, md: 0 }, marginTop: { xs: -2, md: 0 } }}>
                    <InsertTrips />
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
                <Grid container spacing={1} width="100%">
                    <Grid item xs={12}>
                        <FormGroup row sx={{ marginBottom: -2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                            <FormControlLabel control={<Checkbox color="success" checked={check === 1 ? true : false} />} onChange={() => handleChangeCheck(1)} label="ทั้งหมด" />
                            <FormControlLabel control={<Checkbox color="success" checked={check === 2 ? true : false} />} onChange={() => handleChangeCheck(2)} label="กำลังจัดเที่ยววิ่ง" />
                            <FormControlLabel control={<Checkbox color="success" checked={check === 3 ? true : false} />} onChange={() => handleChangeCheck(3)} label="ยกเลิก" />
                            <FormControlLabel control={<Checkbox color="success" checked={check === 4 ? true : false} />} onChange={() => handleChangeCheck(4)} label="จบทริป" />
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
                                height: "70vh",
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                            >
                                <TableHead>
                                    <TableRow sx={{ height: "7vh" }}>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            ลำดับ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 120, cursor: "pointer" }}
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
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 120, cursor: "pointer" }}
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
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 200, cursor: "pointer" }}
                                            onClick={() => handleSort("Depot")}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                คลังรับน้ำมัน
                                                {sortConfig.key === "Depot" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 350, cursor: "pointer" }}
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
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 1
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 2
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 3
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 4
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 5
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 6
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 7
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 280 }}>
                                            ลำดับที่ 8
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ค่าเที่ยว
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ปริมาณน้ำมัน
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            น้ำหนักรถ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            น้ำหนักรวม
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            สถานะ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 16, width: 100, position: "sticky", right: 0 }} />
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
                                        tripDetail.length === 0 ? (
                                            <TableRow>
                                                <TablecellNoData colSpan={19}>
                                                    <Inventory fontSize="large" />
                                                    <br />
                                                    ไม่มีข้อมูล
                                                </TablecellNoData>
                                            </TableRow>
                                        ) : (
                                            tripDetail.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TripsDetail key={row.id} trips={row} windowWidth={windowWidth} index={index} />
                                            ))
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePaginationBar
                            count={tripDetail.length}
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

export default TripsBigTruck;
