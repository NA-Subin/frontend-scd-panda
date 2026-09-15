import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import Swal from "sweetalert2";
import theme from "../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import Logo from "../../theme/img/logoPanda.jpg";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import GasStationDetail from "./GasStationDetail";
import withReactContent from "sweetalert2-react-content";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useGasStationData } from "../../server/provider/GasStationProvider";
import { formatThaiSlash } from "../../theme/DateTH";

const GasStationA = () => {
    const userId = Cookies.get("sessionToken");
    const navigate = useNavigate();
    const { officers } = useBasicData();
    const { gasstationDetail, stockDetail, refetch: refetchGasStationData } = useGasStationData();
    const stocks = Object.values(stockDetail || {});
    const employee = Object.values(officers || {});
    const gasstations = Object.values(gasstationDetail || {});
    const employeeDetail = employee.find((emp) => (emp.id === Number(userId.split("$")[1])));
    // employee_officers.GasStation is a real UUID FK into depot_gas_stations
    // now, not "id:name" text - match on uuid directly.
    const gasStationsDetail = gasstations.find((gas) => gas.uuid === employeeDetail?.GasStation);

    const [open, setOpen] = React.useState(true);
    const [openOil, setOpenOil] = React.useState(true);
    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = useState([]);
    const [statusSave, setStatusSave] = useState(true);
    const [newVolume, setNewVolume] = React.useState(0);
    const [gasStation, setGasStation] = React.useState(0);
    const [gasStations, setGasStations] = React.useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const today = dayjs(new Date());
    const isToday = selectedDate.isSame(today, "day"); // เปรียบเทียบเฉพาะวันที่

    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const [gasStationID, setGasStationID] = React.useState(0);
    const [newVolumes, setNewVolumes] = useState({});
    const [products, setProducts] = useState([]);
    const [report, setReport] = React.useState([]);
    const [setting, setSetting] = React.useState(true);
    const [gasStationReport, setGasStationReport] = React.useState([]);
    const gasstationDetails = employeeDetail?.GasStation;

    const PREFIXES = ["นาย", "นาง", "นางสาว", "เด็กชาย", "เด็กหญิง", "ด.ช.", "ด.ญ."];

    const splitThaiName = (fullName) => {
        if (!fullName) return { prefix: "", firstName: "", lastName: "" };

        const prefix = PREFIXES.find(p => fullName.startsWith(p));
        if (!prefix) return { prefix: "", firstName: "", lastName: "" };

        // ตัดคำนำหน้าออกจากชื่อเต็ม
        const rest = fullName.slice(prefix.length).trim();
        const nameParts = rest.split(" ");

        return {
            prefix,
            firstName: nameParts[0] || "",
            lastName: nameParts[1] || "",
        };
    };

    const { prefix, firstName, lastName } = splitThaiName(employeeDetail?.Name);

    const handleDateChange = (newValue) => {
        if (newValue) {
            setSelectedDate(dayjs(newValue));
        }
    };

    const handleBack = () => {
        withReactContent(Swal)
            .fire({
                title: "ต้องการออกจากระบบใช่หรือไม่",
                icon: "error",
                confirmButtonText: "ตกลง",
                cancelButtonText: "ยกเลิก",
                showCancelButton: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    Cookies.remove('user');
                    Cookies.remove('sessionToken');
                    Cookies.remove('token');
                    navigate("/");
                    Swal.fire("ออกจากระบบเรียบร้อย", "", "success");
                } else if (result.isDenied) {
                    Swal.fire("ออกจากระบบล้มเหลว", "", "error");
                }
            });
    }

    useEffect(() => {
        if (!gasstationDetails) {
            setGasStationsOil([]);
            setStock([]);
            setGasStationID(0);
            setStatusSave(false);
            return;
        }

        // gasstationDetails (employee_officers.GasStation) is a real UUID FK
        // into depot_gas_stations now, not "id:name" text - match on uuid.
        const matchedStation = gasstations.find((gas) => gas.uuid === gasstationDetails);

        if (!matchedStation) {
            setGasStationsOil([]);
            setStock([]);
            setGasStationID(0);
            setStatusSave(false);
            return;
        }

        setGasStationID(matchedStation.id);
        setGasStationsOil([matchedStation]);

        // depot_gas_stations.Stock is a real UUID FK into depot_stock now,
        // not the stock's Name - match on uuid.
        const matchedStock = stocks.find((s) => s.uuid === matchedStation.Stock);
        setStock(Array.isArray(matchedStock?.Products) ? matchedStock.Products.filter(Boolean) : []);

        setStatusSave(false);
    }, [gasstationDetails, gasstations, stocks]);

    return (
        <Container sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: { xs: "lg", sm: "lg", md: "lg" } }}>
            <Paper
                sx={{
                    borderRadius: 5,
                    boxShadow: "1px 1px 2px 2px rgba(0, 0, 0, 0.5)",
                }}
            >
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.main,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                />
                <Box sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    marginTop: { xs: -2, sm: -3, md: -4 },
                    marginBottom: { xs: -1, sm: -2, md: -3 },
                }}>
                    <Box textAlign="right" marginTop={-6.5} marginBottom={4} sx={{ marginRight: { xs: -2, sm: -3, md: -4 } }}>
                        <Button variant="contained" color="warning" sx={{ border: "3px solid white" }} endIcon={<SettingsIcon fontSize="small" />} onClick={handleBack}>ตั้งค่า</Button>
                        {
                            isMobile ?
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} onClick={handleBack}><ReplyAllIcon fontSize="small" /></Button>
                                </>

                                :
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<ReplyAllIcon fontSize="small" />} onClick={handleBack}>ออกจากระบบ</Button>
                                </>

                        }
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="left"
                        alignItems="center"
                        marginTop={-3}
                    >
                        <img src={Logo} width="150" />
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            marginLeft={-4.7}
                            marginTop={3.7}
                        >
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.error.main}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                S
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.warning.light}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                C
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.info.dark}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                D
                            </Typography>
                        </Box>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            textAlign="center"
                            color={theme.palette.panda.main}
                            sx={{ marginTop: 5, marginLeft: 1 }}
                            gutterBottom
                        >
                            ยินดีต้อนรับเข้าสู่หน้าลงข้อมูลน้ำมัน
                        </Typography>
                    </Box>
                    <Divider />
                    <Grid container spacing={2} marginTop={-1} component="form">
                        <Grid item xs={6} md={2} lg={2}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>คำนำหน้า : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={prefix}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray",
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray",
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3} lg={3}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>ชื่อ : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={firstName}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray",
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray",
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3} lg={3}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>สกุล : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={lastName}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray",
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray",
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4} lg={4}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>ตำแหน่ง : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={employeeDetail?.Position.split(":")[1]}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray",
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray",
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4} lg={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="h6" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>เลือกวันที่</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    openTo="day"
                                    views={["year", "month", "day"]}
                                    value={selectedDate ? dayjs(selectedDate, "DD/MM/YYYY") : null}
                                    format="DD/MM/YYYY"
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            variant: "standard",
                                            inputProps: {
                                                value: formatThaiSlash(selectedDate),
                                                readOnly: true,
                                            },
                                            InputProps: {
                                                disableUnderline: false,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '25px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        padding: '2px 6px',
                                                        textAlign: 'center',
                                                        color: "#616161",
                                                    },
                                                },
                                            },
                                            sx: {
                                                "& .MuiInput-underline:before": {
                                                    borderBottom: "1px dashed gray",
                                                },
                                                "& .MuiInput-underline:after": {
                                                    borderBottom: "1px dashed gray",
                                                },
                                                marginLeft: 2,
                                            },
                                        },
                                    }}
                                    sx={{ marginLeft: 2 }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={8} lg={8}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>ชื่อปั้ม : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={gasStationsDetail?.Name}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray",
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray",
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    {gasStationOil.map((row, index) => {
                        const prevIndex = index - 1;
                        const prevGas = gasStationOil[prevIndex] || {};
                        const latestGas = gasStationOil[index] || {};

                        const selectedDateKey = dayjs(selectedDate).format("DD-MM-YYYY");

                        const prevReport = Array.isArray(prevGas.Report?.[selectedDateKey]) ? [...prevGas.Report[selectedDateKey]] : [];
                        const latestReport = Array.isArray(latestGas.Report?.[selectedDateKey]) ? [...latestGas.Report[selectedDateKey]] : [];

                        const reportOilBalance = prevReport.map((prevItem) => {
                            const matchingLatestItem = latestReport.find(
                                (latestItem) => latestItem.ProductName === prevItem.ProductName
                            );

                            return {
                                ProductName: prevItem.ProductName,
                                Color: prevItem.Color,
                                PrevOilBalance: prevItem.OilBalance,
                                LatestOilBalance: matchingLatestItem ? matchingLatestItem.OilBalance : 0,
                                Difference: Number(prevItem.OilBalance) - Number(matchingLatestItem ? matchingLatestItem.OilBalance : 0)
                            };
                        });

                        const oilBalance = prevReport.map((prevItem) => {
                            const matchingLatestItem = latestReport.find(
                                (latestItem) => latestItem.ProductName === prevItem.ProductName
                            );

                            return {
                                ProductName: prevItem.ProductName || "",
                                Capacity: prevItem.Capacity || 0,
                                Color: prevItem.Color || "",
                                Volume: prevItem.Volume || 0,
                                Squeeze: prevItem.Squeeze || 0,
                                Delivered: prevItem.Delivered || 0,
                                Pending1: prevItem.Pending1 || 0,
                                Pending2: prevItem.Pending2 || 0,
                                Pending3: prevItem.Pending3 || 0,
                                Driver1: prevItem.Driver1 || 0,
                                Driver2: prevItem.Driver2 || 0,
                                EstimateSell: prevItem.EstimateSell || 0,
                                Period: prevItem.Period || 0,
                                DownHole: prevItem.DownHole || 0,
                                YesterDay: prevItem.YesterDay || 0,
                                Sell: prevItem.Sell || 0,
                                TotalVolume: prevItem.TotalVolume || 0,
                                OilBalance: prevItem.OilBalance || 0,
                                Difference: Number(prevItem.OilBalance) - Number(matchingLatestItem ? matchingLatestItem.OilBalance : 0)
                            };
                        });

                        return (
                            <React.Fragment key={index}>
                                <GasStationDetail
                                    stock={stock}
                                    gasStationID={gasStationID}
                                    selectedDate={selectedDate}
                                    isToday={isToday}
                                    gas={row}
                                    gasID={index}
                                    first={prevGas}
                                    last={latestGas}
                                    reportOilBalance={reportOilBalance}
                                    oilBalance={oilBalance}
                                    status={statusSave}
                                />
                            </React.Fragment>
                        );
                    })}
                </Box>
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.light,
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                    }}
                />
            </Paper>
        </Container>
    );
};

export default GasStationA;
