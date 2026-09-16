import React, { useEffect, useMemo, useState } from "react";
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
import theme from "../../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../../sweetalert/sweetalert";
import Logo from "../../../theme/img/logoPanda.jpg";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import SettingsIcon from '@mui/icons-material/Settings';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import GasStationDetail from "./GasStationDetail";
import { formatThaiSlash } from "../../../theme/DateTH";
import { useGasStationData } from "../../../server/provider/GasStationProvider";

const GasStationAdmin = () => {

    const navigate = useNavigate();
    const { gasstationDetail, stockDetail } = useGasStationData();
    // Object.values() built a fresh array every render, which made the
    // useEffect below (depending on gasstations/stocks) fire on every
    // render and re-set state each time - an infinite render loop. Memoize
    // so the array reference only changes when the underlying data does.
    const gasstations = useMemo(() => Object.values(gasstationDetail || {}), [gasstationDetail]);
    const stocks = useMemo(() => Object.values(stockDetail || {}), [stockDetail]);
    const [open, setOpen] = React.useState(true);
    const [openOil, setOpenOil] = React.useState(true);
    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = useState([]);
    const [statusSave, setStatusSave] = useState(true);
    const [newVolume, setNewVolume] = React.useState(0);
    const [gasStation, setGasStation] = React.useState(0);
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

    const handleDateChange = (newValue) => {
        if (newValue) {
            setSelectedDate(dayjs(newValue));
        }
    };

    // gasstationDetail/stockDetail already come from useGasStationData(), and
    // each gas station row carries its own Report JSONB - no separate fetch
    // per selected station/date is needed, just derive from context.
    useEffect(() => {
        if (!gasStation || gasStation === 0) {
            setGasStationsOil([]);
            setStock([]);
            setGasStationID(0);
            setStatusSave(false);
            return;
        }

        const matchedStation = gasstations.find((gas) => gas.Name === gasStation);

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
    }, [gasStation, gasstations, stocks]);

    const handleBack = () => {
        navigate("/choose");
    }

    const handleGasStationChange = (e) => {
        setGasStation(e.target.value);
    };

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
                        {
                            isMobile ?
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} onClick={handleBack}><ReplyAllIcon fontSize="small" /></Button>
                                </>

                                :
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<ReplyAllIcon fontSize="small" />} onClick={handleBack}>กลับหน้าแรก</Button>
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
                    <Grid container spacing={5} marginTop={-5} component="form">
                        <Grid item xs={12} md={3} lg={3} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap', mt: 1 }} gutterBottom>วันที่</Typography>
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
                                                value: formatThaiSlash(selectedDate), // ✅ แสดงเป็น 05/11/2568
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
                                                    },
                                                },
                                            },
                                            sx: {
                                                "& .MuiInput-underline:before": {
                                                    borderBottom: "1px solid gray",
                                                },
                                                "& .MuiInput-underline:after": {
                                                    borderBottom: "1px solid gray",
                                                },
                                                marginLeft: 2,
                                            },
                                        },
                                    }}
                                    sx={{ marginLeft: 2 }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={9} lg={9} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap', mt: 1 }} gutterBottom>ชื่อปั้ม</Typography>
                            <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
                                <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={gasStation}
                                    onChange={handleGasStationChange}
                                    sx={{ fontWeight: "bold" }}
                                    fullWidth
                                >
                                    <MenuItem value={0}>กรุณาเลือกปั้ม</MenuItem>
                                    {
                                        [...new Set(gasstations.map(row => row.Name))].map((name) => (
                                            <MenuItem key={name} value={name}>{name}</MenuItem>
                                        ))
                                    }

                                </Select>
                            </FormControl>
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

export default GasStationAdmin;
