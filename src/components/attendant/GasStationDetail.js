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
import { auth, database, googleProvider } from "../../server/firebase";
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
    // const [selectedDates, setSelectedDates] = React.useState(dayjs(selectedDate));
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

    console.log("วันก่อนหน้า : ", yesterday);
    console.log("2 วันก่อนหน้า : ", twoDayAgo);
    console.log("3 วันก่อนหน้า : ", threeDayAgo);
    console.log("4 วันก่อนหน้า : ", fourDayAgo);
    console.log("5 วันก่อนหน้า : ", fiveDayAgo);
    console.log("6 วันก่อนหน้า : ", sixDayAgo);
    console.log("7 วันก่อนหน้า : ", sevenDayAgo);
    console.log("8 วันก่อนหน้า : ", eightDayAgo);
    console.log("9 วันก่อนหน้า : ", nineDayAgo);
    console.log("10 วันก่อนหน้า : ", tenDayAgo);

    console.log("Status : ", save);

    const getGasStations = async () => {
        database.ref("/depot/gasStations/" + (gas.id - 1)).on("value", (snapshot) => {
            const datas = snapshot.val();
            setProduct(datas.Products);
            if (datas && datas.Products) {
                const sortedProducts = Object.entries(datas.Products)
                    .map(([key, value]) => ({
                        ProductName: key,
                        Volume: value
                    }))
                    .sort((a, b) => {
                        return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
                    });

                setNotReport(sortedProducts);
            } else {
                setNotReport([]);
            }
        });

        database.ref("/depot/gasStations/" + (gas.id - 1) + "/Report/" + dayjs(selectedDate).format('DD-MM-YYYY')).on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataReport = [];

            for (let id in datas) {
                dataReport.push({ id, ...datas[id] });
            }

            setReports(dataReport);
        });


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
        // setSelectedDates(dayjs(selectedDate));
        getGasStations();
        setVolumes({}); // รีเซ็ตค่า Volume เป็นค่าเริ่มต้น
        setStocks({});
    }, [selectedDate, gas.id, gas.Report, status]);

    console.log("Date : ", dayjs(selectedDate).format('DD-MM-YYYY'));
    console.log("Name : ", gas.ShortName);
    console.log("ShowProduct : ", product);
    console.log("ShowReport : ", reports);
    console.log("reportOilBalance: ", gasID === 1 && reportOilBalance);

    const [volumes, setVolumes] = useState({});
    const [stocks, setStocks] = useState({});
    const [difference, setDifference] = useState({});
    const [setting, setSetting] = React.useState(true);
    let showSingleButton = true;

    console.log("Update Volume : ", volumes);
    console.log("Update Stock : ", stocks);

    // ฟังก์ชันอัปเดตค่า newVolume
    const handleNewVolumeChange = (key, value) => {
        setVolumes((prev) => ({
            ...prev,
            [key]: value, // อัปเดตเฉพาะ ProductName ที่เปลี่ยน
        }));
    };

    const handleNewStockChange = (key, value) => {
        setStocks((prev) => ({
            ...prev,
            [key]: value, // อัปเดตเฉพาะ ProductName ที่เปลี่ยน
        }));
    };

    const [updateVolumes, setUpdateVolumes] = useState({}); // สำหรับเก็บข้อมูล NewVolume ที่ถูกแก้ไข
    const [updateStocks, setUpdateStocks] = useState({}); // สำหรับเก็บข้อมูล NewVolume ที่ถูกแก้ไข

    const handleUpdateVolumeChange = (productName, newVolume) => {
        // อัปเดตค่าใหม่ใน state
        setUpdateVolumes((prevVolumes) => ({
            ...prevVolumes,
            [productName]: newVolume, // เก็บค่าใหม่สำหรับแต่ละ productName
        }));
    };

    const handleUpdateStockChange = (productName, newStock) => {
        // อัปเดตค่าใหม่ใน state
        setUpdateStocks((prevStocks) => ({
            ...prevStocks,
            [productName]: newStock, // เก็บค่าใหม่สำหรับแต่ละ productName
        }));
    };

    // console.log("show :", stock);
    // console.log("gasStation :", gasStationID);
    // console.log("Report: ", report);
    // console.log("gasStationOil::: :", gasStationOil);
    // console.log("gas ::: :", gas);
    // console.log("shortName: ", gas.ShortName);
    // console.log("product: ", gas.Products);
    // const formattedDate = dayjs(selectedDates).format('DD-MM-YYYY');
    // const dataReport = gas.Report ? gas.Report[formattedDate] : [];
    // console.log("report: ", dataReport);

    const saveProduct = () => {
        const updatedProducts = notReport
            .map(({ ProductName, Volume }) => { // ✅ ใช้ destructuring ถูกต้อง
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

                console.log("Squeeze วันก่อน : ", yesterdayEntry?.Squeeze)
                console.log("EstimateSell วันก่อน : ", yesterdayEntry?.EstimateSell)
                console.log("Squeeze 2 วันก่อน : ", twoDaysAgoEntry?.Squeeze)
                console.log("EstimateSell 2 วันก่อน : ", twoDaysAgoEntry?.EstimateSell)

                if (!matchingStock) return null; // ถ้าไม่มีข้อมูล ให้ return null (แต่ filter ทิ้งภายหลัง)
                console.log("differenceAdd : ", (difference[ProductName] ?? 0))
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
            .filter(Boolean); // กรองค่าที่เป็น null ออกไป

        const updatedVolume = notReport.reduce((acc, { ProductName, Volume }) => { // ✅ ใช้ destructuring ถูกต้อง
            const matchingStock = stock.find((s) => s.ProductName === ProductName);
            if (matchingStock) {
                acc[ProductName] = Number(matchingStock.Volume || 0);
            }
            return acc;
        }, {}); // เริ่มต้นเป็น object ว่าง

        console.log("Update : ", updatedProducts)

        setSave(true);

        //อัปเดตข้อมูลในฐานข้อมูล
        database
            .ref("/depot/gasStations/" + (gas.id - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedProducts)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        database
            .ref("/depot/gasStations/" + (gas.id - 1))
            .child("/Products")
            .update(updatedVolume)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        console.log("Update Difference : ", difference);
    };

    const updateProduct = () => {
        const updatedProducts =
            reports.length !== 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
                ? reports.map((row) => {
                    console.log("differenceUpdates : ", (difference[row.ProductName] ?? 0))
                    return {
                        ProductName: row.ProductName,
                        Capacity: row.Capacity,
                        Color: row.Color,
                        Volume: row.Volume,
                        Squeeze: row.Squeeze || 0, // ใช้ค่าจาก state ถ้ามี
                        Delivered: Number(updateVolumes[row.ProductName] || row.Delivered),
                        Pending1: row.Pending1 || 0,
                        Pending2: row.Pending2 || 0,
                        Pending3: row.Pending3 || 0,
                        Driver1: row.Driver1 || "",
                        Driver2: row.Driver2 || "",
                        EstimateSell: row.EstimateSell || 0, // ใช้ค่าจาก state ถ้ามี
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

        const updatedVolumes =
            reports.length !== 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
                ? reports.reduce((acc, row) => {
                    const updatedVolume =
                        Number(updateStocks[row.ProductName] || row.OilBalance);

                    acc[row.ProductName] = updatedVolume; // เก็บค่าใน key ที่ตรงกับ ProductName
                    return acc;
                }, {})
                : []

        // อัปเดตข้อมูลในฐานข้อมูล Firebase
        database
            .ref("/depot/gasStations/" + (gas.id - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedProducts)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        database
            .ref("/depot/gasStations/" + (gas.id - 1))
            .child("/Products")
            .update(updatedVolumes)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        setSetting(true);
        setSave(true);
    };

    const handleSave = () => {
        console.log("latestGas ::::::: ", first.id);
        console.log("✅ reportOilBalance " + `${gasID}:`, oilBalance);
        database
            .ref("/depot/gasStations/" + (first.id - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(oilBalance)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setSave(false);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

    }

    // สร้าง `gasStationNotReports` โดยใช้ `ProductName`
    const gasStationNotReports = Object.entries(product).map(([key, value]) => ({
        ProductName: key,  // ใช้ key เป็นชื่อของสินค้า
        Volume: value      // ใช้ value เป็นค่าของสินค้า
    }));

    // ✅ เรียงลำดับ `gasStationNotReports` ตาม `customOrder`
    const sortedNotReport = gasStationNotReports.sort((a, b) => {
        return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
    });

    const sortedReport = reports.length !== 0
        ? reports.sort((a, b) => customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName))
        : [];


    const sortedOilBalance = reportOilBalance.sort((a, b) => {
        return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
    });

    console.log("reports : ", reports);
    console.log("sortReport : ", sortedReport);
    console.log("not report : ", notReport);

    console.log("stock : ", stocks);
    console.log("volume : ", volumes);
    console.log("update stock : ", updateStocks);
    console.log("update volume : ", updateVolumes);

    // useEffect(() => {
    //     const newDifference = sortedOilBalance.reduce((acc, item) => {
    //         acc[item.ProductName] = item.prevOilBalance - item.latestOilBalance;
    //         return acc;
    //     }, {});
    //     setDifference(newDifference); // ✅ อัปเดตค่าทันทีหลังโหลด
    // }, [sortedOilBalance]); // ✅ อัปเดตเมื่อ `sortedOilBalance` เปลี่ยน

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
                                            value={volumes[row.ProductName] === "" ? "" : volumes[row.ProductName] || 0} // ถ้าค่าว่างให้แสดง 0
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                if (newValue === "") {
                                                    handleNewVolumeChange(row.ProductName, ""); // ให้เป็นค่าว่างชั่วคราว
                                                } else {
                                                    handleNewVolumeChange(row.ProductName, newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleNewVolumeChange(row.ProductName, ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleNewVolumeChange(row.ProductName, 0); // ถ้าค่าว่างให้เป็น 0
                                                }
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom >ปิดยอดสต็อก</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField size="small" type="number" fullWidth
                                            value={stocks[row.ProductName] === "" ? "" : stocks[row.ProductName] || 0} // ถ้าค่าว่างให้แสดง 0
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                if (newValue === "") {
                                                    handleNewStockChange(row.ProductName, ""); // ให้เป็นค่าว่างชั่วคราว
                                                } else {
                                                    handleNewStockChange(row.ProductName, newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleNewStockChange(row.ProductName, ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleNewStockChange(row.ProductName, 0); // ถ้าค่าว่างให้เป็น 0
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
                                {/* {row.Difference === 0 || row.Difference === undefined && setSave(false)} */}
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
                                            value={updateVolumes[row.ProductName] ?? row.Delivered} // ใช้ ?? ป้องกัน undefined
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                // ลบ 0 ที่นำหน้าทันที และป้องกันการกรอก "0" ต่อท้าย
                                                newValue = newValue.replace(/^0+(?=\d)/, "");

                                                // ถ้าค่าเป็น "" หรือ "0" ให้แสดงเป็น ""
                                                if (newValue === "" || newValue === "0") {
                                                    handleUpdateVolumeChange(row.ProductName, "");
                                                } else {
                                                    handleUpdateVolumeChange(row.ProductName, newValue);
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleUpdateVolumeChange(row.ProductName, ""); // ล้างค่า 0 ออก
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleUpdateVolumeChange(row.ProductName, 0); // ถ้าค่าว่างให้เป็น 0
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
                                            value={updateStocks[row.ProductName] ?? row.OilBalance} // ใช้ ?? ป้องกัน undefined
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                // ลบ 0 ที่นำหน้าทันที และป้องกันการกรอก "0" ต่อท้าย
                                                newValue = newValue.replace(/^0+(?=\d)/, "");

                                                // ถ้าค่าเป็น "" หรือ "0" ให้แสดงเป็น ""
                                                if (newValue === "" || newValue === "0") {
                                                    handleUpdateStockChange(row.ProductName, "");
                                                } else {
                                                    handleUpdateStockChange(row.ProductName, newValue);
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleUpdateStockChange(row.ProductName, ""); // ล้างค่า 0 ออก
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleUpdateStockChange(row.ProductName, 0); // ถ้าค่าว่างให้เป็น 0
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
                        {/* <Button variant="contained" color="success" onClick={saveProduct}>
                                        บันทึก
                                    </Button> */}
                        {/* {
                    isToday &&
                    (
                        <Button variant="contained" color="success" onClick={updateProduct}>
                                        บันทึก
                                    </Button>
                */}{
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
                            //)
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
            {gasID === 1 && ( // แสดง <Box> เมื่อถึงข้อมูลลำดับที่ 2
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
                                        //disabled
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
                                            //disabled={save ? false : true}
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
                                            //disabled={save ? false : true}
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
                                            //disabled={save ? false : true}
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
