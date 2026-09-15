import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../sweetalert/sweetalert";
import { apiPut } from "../../server/apiClient";
import { useGasStationData } from "../../server/provider/GasStationProvider";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const customOrder = ["G95", "B95", "B7", "B7(1)", "B7(2)", "G91", "E20", "PWD"];

const GasStationDetail = (props) => {
    const { stock, gasStationID, selectedDate, gas, gasID, first, last, reportOilBalance, oilBalance, status } = props;
    const { refetch: refetchGasStationData } = useGasStationData();
    const [product, setProduct] = React.useState([]);
    const [notReport, setNotReport] = React.useState([]);
    const [reports, setReports] = React.useState([]);
    const [save, setSave] = React.useState(false);
    const [yesterday, setYesterdayData] = React.useState("");
    const [twoDayAgo, setTwoDaysAgoData] = React.useState("");
    const [threeDayAgo, setThreeDaysAgoData] = React.useState("");
    const [fourDayAgo, setFourDaysAgoData] = React.useState("");
    const [fiveDayAgo, setFiveDaysAgoData] = React.useState("");
    const [sixDayAgo, setSixDaysAgoData] = React.useState("");
    const [sevenDayAgo, setSevenDaysAgoData] = React.useState("");
    const [eightDayAgo, setEightDaysAgoData] = React.useState("");
    const [nineDayAgo, setNineDaysAgoData] = React.useState("");
    const [tenDayAgo, setTenDaysAgoData] = React.useState("");

    const getGasStations = async () => {
        // gas.Products is a JSONB array of {Name, Color, Capacity, Volume,
        // CheckBox} (same shape every other module reads it as) - no separate
        // fetch needed, the prop already has it.
        const productsArray = Array.isArray(gas?.Products) ? gas.Products.filter(Boolean) : [];
        setProduct(productsArray);

        const sortedProducts = productsArray
            .map((p) => ({
                ProductName: p.Name,
                Volume: p.Volume,
            }))
            .sort((a, b) => customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName));
        setNotReport(sortedProducts);

        // Report is a plain JSONB object keyed by date string - read it
        // directly off the prop instead of a separate Firebase listener.
        const reportForDate = gas?.Report?.[dayjs(selectedDate).format('DD-MM-YYYY')];
        setReports(Array.isArray(reportForDate) ? reportForDate : Object.values(reportForDate || {}));

        const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
        const twoDaysAgoDate = dayjs(selectedDate).subtract(2, "day").format("DD-MM-YYYY");
        const threeDaysAgoDate = dayjs(selectedDate).subtract(3, "day").format("DD-MM-YYYY");
        const fourDaysAgoDate = dayjs(selectedDate).subtract(4, "day").format("DD-MM-YYYY");
        const fiveDaysAgoDate = dayjs(selectedDate).subtract(5, "day").format("DD-MM-YYYY");
        const sixDaysAgoDate = dayjs(selectedDate).subtract(6, "day").format("DD-MM-YYYY");
        const sevenDaysAgoDate = dayjs(selectedDate).subtract(7, "day").format("DD-MM-YYYY");
        const eightDaysAgoDate = dayjs(selectedDate).subtract(8, "day").format("DD-MM-YYYY");
        const nineDaysAgoDate = dayjs(selectedDate).subtract(9, "day").format("DD-MM-YYYY");
        const tenDaysAgoDate = dayjs(selectedDate).subtract(10, "day").format("DD-MM-YYYY");

        const yesterdayData = gas?.Report?.[yesterdayDate];
        const twoDaysAgoData = gas?.Report?.[twoDaysAgoDate];
        const threeDaysAgoData = gas?.Report?.[threeDaysAgoDate];
        const fourDaysAgoData = gas?.Report?.[fourDaysAgoDate];
        const fiveDaysAgoData = gas?.Report?.[fiveDaysAgoDate];
        const sixDaysAgoData = gas?.Report?.[sixDaysAgoDate];
        const sevenDaysAgoData = gas?.Report?.[sevenDaysAgoDate];
        const eightDaysAgoData = gas?.Report?.[eightDaysAgoDate];
        const nineDaysAgoData = gas?.Report?.[nineDaysAgoDate];
        const tenDaysAgoData = gas?.Report?.[tenDaysAgoDate];

        setYesterdayData(yesterdayData);
        setTwoDaysAgoData(twoDaysAgoData);
        setThreeDaysAgoData(threeDaysAgoData);
        setFourDaysAgoData(fourDaysAgoData);
        setFiveDaysAgoData(fiveDaysAgoData);
        setSixDaysAgoData(sixDaysAgoData);
        setSevenDaysAgoData(sevenDaysAgoData);
        setEightDaysAgoData(eightDaysAgoData);
        setNineDaysAgoData(nineDaysAgoData);
        setTenDaysAgoData(tenDaysAgoData);

        setSave(status)
    };

    useEffect(() => {
        getGasStations();
        setVolumes({});
        setStocks({});
    }, [selectedDate, gas.id, gas.Report, status]);

    const [volumes, setVolumes] = useState({});
    const [stocks, setStocks] = useState({});
    const [difference, setDifference] = useState({});
    const [setting, setSetting] = React.useState(true);
    let showSingleButton = true;

    const handleNewVolumeChange = (key, value) => {
        setVolumes((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleNewStockChange = (key, value) => {
        setStocks((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const [updateVolumes, setUpdateVolumes] = useState({});
    const [updateStocks, setUpdateStocks] = useState({});

    const handleUpdateVolumeChange = (productName, newVolume) => {
        setUpdateVolumes((prevVolumes) => ({
            ...prevVolumes,
            [productName]: newVolume,
        }));
    };

    const handleUpdateStockChange = (productName, newStock) => {
        setUpdateStocks((prevStocks) => ({
            ...prevStocks,
            [productName]: newStock,
        }));
    };

    const saveProduct = async () => {
        const updatedProducts = notReport
            .map(({ ProductName, Volume }) => {
                const matchingStock = stock.find((s) => s.ProductName === ProductName);
                const yesterdayEntry = Object.values(yesterday || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const twoDaysAgoEntry = Object.values(twoDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const threeDaysAgoEntry = Object.values(threeDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const fourDaysAgoEntry = Object.values(fourDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const fiveDaysAgoEntry = Object.values(fiveDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const sixDaysAgoEntry = Object.values(sixDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const sevenDaysAgoEntry = Object.values(sevenDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const eightDaysAgoEntry = Object.values(eightDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const nineDaysAgoEntry = Object.values(nineDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };
                const tenDaysAgoEntry = Object.values(tenDayAgo || {}).find(entry => entry?.ProductName === ProductName) || { OilBalance: 0 };

                if (!matchingStock) return null;
                return {
                    ProductName,
                    Capacity: matchingStock.Capacity ?? 0,
                    Color: matchingStock.Color ?? "",
                    TotalVolume: Number(Volume ?? 0),
                    Volume: Number(Volume ?? 0),
                    Delivered: Number(volumes?.[ProductName] ?? 0),
                    OilBalance: Number(stocks?.[ProductName] ?? 0),
                    Squeeze: yesterdayEntry?.Squeeze || twoDaysAgoEntry?.Squeeze || threeDaysAgoEntry?.Squeeze || fourDaysAgoEntry?.Squeeze || fiveDaysAgoEntry?.Squeeze || sixDaysAgoEntry?.Squeeze || sevenDaysAgoEntry?.Squeeze || eightDaysAgoEntry?.Squeeze || nineDaysAgoEntry?.Squeeze || tenDaysAgoEntry?.Squeeze || 0,
                    EstimateSell: yesterdayEntry?.EstimateSell || twoDaysAgoEntry?.EstimateSell || threeDaysAgoEntry?.EstimateSell || fourDaysAgoEntry?.EstimateSell || fiveDaysAgoEntry?.EstimateSell || sixDaysAgoEntry?.EstimateSell || sevenDaysAgoEntry?.EstimateSell || eightDaysAgoEntry?.EstimateSell || nineDaysAgoEntry?.EstimateSell || tenDaysAgoEntry?.EstimateSell
                };
            })
            .filter(Boolean);

        // Products is a JSONB array of {Name, Color, Capacity, Volume,
        // CheckBox}, not a plain {ProductName: number} map - update Volume in
        // place on each matching entry so the shape every other consumer
        // expects (InsertGasStations.js, Detail.js, etc.) doesn't break.
        const updatedProductsArray = (Array.isArray(gas?.Products) ? gas.Products : []).map((p) => {
            const matchingStock = stock.find((s) => s.ProductName === p.Name);
            return matchingStock ? { ...p, Volume: Number(matchingStock.Volume || 0) } : p;
        });

        setSave(true);

        if (!gas?.uuid) {
            ShowError("ไม่พบข้อมูลปั้ม");
            return;
        }

        // Report is a plain JSONB column, not a real nested Firebase path -
        // read, merge in just this date's entry, and write the whole column
        // back so other dates already saved aren't lost.
        const mergedReport = structuredClone(gas.Report || {});
        mergedReport[dayjs(selectedDate).format("DD-MM-YYYY")] = updatedProducts;

        try {
            await apiPut(`/api/depot_gas_stations/${gas.uuid}`, {
                Report: mergedReport,
                Products: updatedProductsArray,
            });
            ShowSuccess("บันทึกข้อมูลสำเร็จ");
            refetchGasStationData?.();
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    const updateProduct = async () => {
        const updatedProducts =
            reports.length !== 0
                ? reports.map((row) => {
                    return {
                        ProductName: row.ProductName,
                        Capacity: row.Capacity,
                        Color: row.Color,
                        Volume: row.Volume,
                        Squeeze: row.Squeeze || 0,
                        Delivered: Number(updateVolumes[row.ProductName] || row.Delivered),
                        Pending1: row.Pending1 || 0,
                        Pending2: row.Pending2 || 0,
                        Pending3: row.Pending3 || 0,
                        Driver1: row.Driver1 || "",
                        Driver2: row.Driver2 || "",
                        EstimateSell: row.EstimateSell || 0,
                        Period: row.Period || 0,
                        DownHole: row.DownHole || 0,
                        YesterDay: row.YesterDay || 0,
                        Sell: row.Sell || 0,
                        TotalVolume: row.TotalVolume || 0,
                        OilBalance: Number(updateStocks[row.ProductName] || row.OilBalance),
                        Difference: row.Difference || 0,
                    };

                })
                : []

        // Products is a JSONB array, not a plain {ProductName: number} map -
        // update Volume in place on each matching entry.
        const updatedProductsArray = (Array.isArray(gas?.Products) ? gas.Products : []).map((p) => {
            const row = reports.find((r) => r.ProductName === p.Name);
            if (!row) return p;
            return { ...p, Volume: Number(updateStocks[row.ProductName] || row.OilBalance) };
        });

        if (!gas?.uuid) {
            ShowError("ไม่พบข้อมูลปั้ม");
            return;
        }

        // Report is a plain JSONB column - read, merge in this date's entry,
        // and write the whole column back.
        const mergedReport = structuredClone(gas.Report || {});
        mergedReport[dayjs(selectedDate).format("DD-MM-YYYY")] = updatedProducts;

        try {
            await apiPut(`/api/depot_gas_stations/${gas.uuid}`, {
                Report: mergedReport,
                Products: updatedProductsArray,
            });
            ShowSuccess("บันทึกข้อมูลสำเร็จ");
            refetchGasStationData?.();
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }

        setSetting(true);
        setSave(true);
    };

    const handleSave = async () => {
        if (!first?.uuid) {
            ShowError("ไม่พบข้อมูลปั้ม");
            return;
        }

        const mergedReport = structuredClone(first.Report || {});
        mergedReport[dayjs(selectedDate).format("DD-MM-YYYY")] = oilBalance;

        try {
            await apiPut(`/api/depot_gas_stations/${first.uuid}`, { Report: mergedReport });
            ShowSuccess("บันทึกข้อมูลสำเร็จ");
            refetchGasStationData?.();
            setSave(false);
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    }

    const gasStationNotReports = (Array.isArray(product) ? product : []).map((p) => ({
        ProductName: p.Name,
        Volume: p.Volume
    }));

    const sortedNotReport = gasStationNotReports.sort((a, b) => {
        return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
    });

    const sortedReport = reports.length !== 0
        ? reports.sort((a, b) => customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName))
        : [];


    const sortedOilBalance = reportOilBalance.sort((a, b) => {
        return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
    });

    return (
        <React.Fragment>
            <Box sx={{
                backgroundColor:
                    gas.Stock === "แม่โจ้" ? "#92D050"
                        : gas.Stock === "สันกลาง" ? "#B1A0C7"
                            : gas.Stock === "สันทราย" ? "#B7DEE8"
                                : gas.Stock === "บ้านโฮ่ง" ? "#FABF8F"
                                    : gas.Stock === "ป่าแดด" ? "#B1A0C7"
                                        : "", marginTop: 2, p: 2, borderRadius: 5, marginLeft: -2, marginBottom: -5
            }}>
                <Typography variant="subtitle1" textAlign="center" fontWeight="bold" fontSize="24px" >{gas.ShortName}</Typography>
            </Box>
            <Grid container spacing={2} sx={{ backgroundColor: "#eeeeee", marginTop: 2, p: 3 }}>
                <Grid item xs={12} marginBottom={-2} marginTop={-3}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ผลิตภัณฑ์</Typography>
                </Grid>
                {
                    reports.length === 0 ?
                        notReport.map((row, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={5} md={2} lg={1}>
                                    <Box
                                        sx={{
                                            backgroundColor: (row.ProductName === "G91" ? "#92D050" :
                                                row.ProductName === "G95" ? "#FFC000" :
                                                    row.ProductName === "B7" ? "#FFFF99" :
                                                        row.ProductName === "B95" ? "#B7DEE8" :
                                                            row.ProductName === "B10" ? "#32CD32" :
                                                                row.ProductName === "B20" ? "#228B22" :
                                                                    row.ProductName === "E20" ? "#C4BD97" :
                                                                        row.ProductName === "E85" ? "#0000FF" :
                                                                            row.ProductName === "PWD" ? "#F141D8" :
                                                                                "#FFFF99"),
                                            borderRadius: 3,
                                            textAlign: "center",
                                            paddingTop: 2,
                                            paddingBottom: 1
                                        }}
                                        disabled
                                    >
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>{row.ProductName}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom >รับเข้า</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={volumes[row.ProductName] === "" ? "" : volumes[row.ProductName] || 0}
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                if (newValue === "") {
                                                    handleNewVolumeChange(row.ProductName, "");
                                                } else {
                                                    handleNewVolumeChange(row.ProductName, newValue.replace(/^0+(?=\d)/, ""));
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleNewVolumeChange(row.ProductName, "");
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleNewVolumeChange(row.ProductName, 0);
                                                }
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom >ปิดยอดสต็อก</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField size="small" type="number" fullWidth
                                            value={stocks[row.ProductName] === "" ? "" : stocks[row.ProductName] || 0}
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                if (newValue === "") {
                                                    handleNewStockChange(row.ProductName, "");
                                                } else {
                                                    handleNewStockChange(row.ProductName, newValue.replace(/^0+(?=\d)/, ""));
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleNewStockChange(row.ProductName, "");
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleNewStockChange(row.ProductName, 0);
                                                }
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))
                        :
                        sortedReport.map((row) => (
                            <React.Fragment>
                                <Grid item xs={5} md={2} lg={1}>
                                    <Box
                                        sx={{
                                            backgroundColor: row.Color,
                                            borderRadius: 3,
                                            textAlign: "center",
                                            paddingTop: 2,
                                            paddingBottom: 1
                                        }}
                                        disabled
                                    >
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>{row.ProductName}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" color={setting && "textDisabled"} gutterBottom>รับเข้า</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={updateVolumes[row.ProductName] ?? row.Delivered}
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                newValue = newValue.replace(/^0+(?=\d)/, "");

                                                if (newValue === "" || newValue === "0") {
                                                    handleUpdateVolumeChange(row.ProductName, "");
                                                } else {
                                                    handleUpdateVolumeChange(row.ProductName, newValue);
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleUpdateVolumeChange(row.ProductName, "");
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleUpdateVolumeChange(row.ProductName, 0);
                                                }
                                            }}
                                            disabled={setting ? true : false}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" color={setting && "textDisabled"} gutterBottom>ปิดยอดสต็อก</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={updateStocks[row.ProductName] ?? row.OilBalance}
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                newValue = newValue.replace(/^0+(?=\d)/, "");

                                                if (newValue === "" || newValue === "0") {
                                                    handleUpdateStockChange(row.ProductName, "");
                                                } else {
                                                    handleUpdateStockChange(row.ProductName, newValue);
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleUpdateStockChange(row.ProductName, "");
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleUpdateStockChange(row.ProductName, 0);
                                                }
                                            }}
                                            disabled={setting ? true : false}
                                        />
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))
                }
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
                        {
                            reports.length === 0 ?
                                <Button variant="contained" color="success" onClick={saveProduct}>
                                    บันทึก
                                </Button>
                                :
                                (
                                    setting ?
                                        <Button variant="contained" color="warning" sx={{ marginRight: 3 }} onClick={() => setSetting(false)}>
                                            แก้ไข
                                        </Button>
                                        :
                                        <>
                                            <Button variant="contained" color="error" sx={{ marginRight: 3 }} onClick={() => setSetting(true)}>
                                                ยกเลิก
                                            </Button>
                                            <Button variant="contained" color="success" onClick={updateProduct}>
                                                บันทึก
                                            </Button>
                                        </>
                                )
                        }
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{
                backgroundColor:
                    gas.Stock === "แม่โจ้" ? "#92D050"
                        : gas.Stock === "สันกลาง" ? "#B1A0C7"
                            : gas.Stock === "สันทราย" ? "#B7DEE8"
                                : gas.Stock === "บ้านโฮ่ง" ? "#FABF8F"
                                    : gas.Stock === "ป่าแดด" ? "#B1A0C7"
                                        : "", marginTop: -1, p: 2, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginLeft: -2
            }}></Box>
            {gasID === 1 && (
                <React.Fragment>
                    <Box sx={{
                        backgroundColor:
                            first.Stock === "แม่โจ้" ? "#92D050"
                                : first.Stock === "สันกลาง" ? "#B1A0C7"
                                    : first.Stock === "สันทราย" ? "#B7DEE8"
                                        : first.Stock === "บ้านโฮ่ง" ? "#FABF8F"
                                            : first.Stock === "ป่าแดด" ? "#B1A0C7"
                                                : "", marginTop: 2, p: 2, borderRadius: 5, marginLeft: -2, marginBottom: -5
                    }}>
                        <Typography variant="subtitle1" textAlign="center" fontWeight="bold" fontSize="24px" >คำนวณ</Typography>
                    </Box>
                    <Grid container spacing={2} sx={{ backgroundColor: "#eeeeee", marginTop: 2, p: 3 }}>
                        {sortedOilBalance.map((item, i) => (
                            <React.Fragment key={i}>
                                <Grid item xs={3} md={1.5}>
                                    <Box
                                        sx={{
                                            backgroundColor: item.Color,
                                            borderRadius: 3,
                                            textAlign: "center",
                                            paddingTop: 2,
                                            paddingBottom: 1
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {item.ProductName}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3} md={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold"  gutterBottom>
                                        {first.ShortName || "N/A"}
                                    </Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="text"
                                            fullWidth
                                            value={new Intl.NumberFormat("en-US").format(item.PrevOilBalance)}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3} md={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold"  gutterBottom>
                                        {last.ShortName || "N/A"}
                                    </Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="text"
                                            fullWidth
                                            value={new Intl.NumberFormat("en-US").format(item.LatestOilBalance)}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3} md={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold"  gutterBottom>
                                        ผลลัพธ์
                                    </Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="text"
                                            fullWidth
                                            value={new Intl.NumberFormat("en-US").format(item.Difference)}
                                        />
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))}
                            <Grid item xs={12} textAlign="center">
                                <Button variant="contained" color="success" onClick={handleSave}>
                                    บันทึก
                                </Button>
                            </Grid>
                    </Grid>
                    <Box sx={{
                        backgroundColor:
                            first.Stock === "แม่โจ้" ? "#92D050"
                                : first.Stock === "สันกลาง" ? "#B1A0C7"
                                    : first.Stock === "สันทราย" ? "#B7DEE8"
                                        : first.Stock === "บ้านโฮ่ง" ? "#FABF8F"
                                            : first.Stock === "ป่าแดด" ? "#B1A0C7"
                                                : "", marginTop: -1, p: 2, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginLeft: -2
                    }}></Box>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default GasStationDetail;
