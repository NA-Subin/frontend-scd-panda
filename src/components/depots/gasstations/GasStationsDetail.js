import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
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
import { database } from "../../../server/firebase";
import UpdateGasStations from "./UpdateGasStations";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import { formatThaiSlash } from "../../../theme/DateTH";

const GasStationsDetail = (props) => {
    const { gasStation } = props;
    const [open, setOpen] = useState("แม่โจ้");
    const [openTab, setOpenTab] = React.useState(true);
    const [checkStock, setCheckStock] = useState("ทั้งหมด");

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };

    const [downHole, setDownHole] = React.useState([]);
    const total = downHole.reduce((sum, value) => sum + value.DownHole, 0); // บวกค่า DownHole จากทุก item ใน array

    const [volume, setVolume] = React.useState(total);

    console.log(downHole); // แสดงข้อมูล downHole ที่เก็บ
    console.log("แสดงค่ารวม " + total); // แสดงผลรวมที่ได้จากการคำนวณ
    console.log(volume);

    const [values, setValues] = React.useState([]);

    const handleSendBack = (newData) => {
        setValues(prevValues => {
            // ค้นหา index ของ Stock ที่มีอยู่แล้ว
            const stockIndex = prevValues.findIndex(item => (item.Stock === newData.Stock) && (item.GasStaionName === newData.GasStaionName));

            if (stockIndex !== -1) {
                // ถ้ามี Stock อยู่แล้ว
                let updatedValues = [...prevValues]; // Clone ข้อมูลเดิม
                let existingReport = updatedValues[stockIndex].Report;

                // ดึงวันที่จาก newData
                let newDateKey = Object.keys(newData.Report)[0]; // วันที่ใหม่
                let newReportData = newData.Report[newDateKey]; // ข้อมูลใหม่ของวันนั้น

                if (existingReport[newDateKey]) {
                    // ถ้าวันที่ตรงกัน อัปเดตข้อมูลของวันนั้น
                    existingReport[newDateKey] = { ...newReportData };
                } else {
                    // ถ้าเป็นวันใหม่ เพิ่มข้อมูลเข้าไป
                    existingReport[newDateKey] = newReportData;
                }

                console.log("✅ Updated Values before return:", updatedValues); // ตรวจสอบค่าก่อน return

                return updatedValues;
            } else {
                // ถ้าเป็น Stock ใหม่ ให้เพิ่มเข้าไปใน Array
                return [...prevValues, newData];
            }
        });
    };

    useEffect(() => {
        console.log("🔥 Updated Values:", values);
    }, [values]); // ทำงานทุกครั้งที่ `values` เปลี่ยนแปลง


    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [name, setName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [road, setRoad] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");

    // const [gasStationOil, setGasStationsOil] = useState([]);
    // const [stock, setStock] = React.useState([]);
    // const [stocks, setStocks] = React.useState([]);

    const { gasstationDetail, stockDetail } = useGasStationData();
    const gasStationOil = Object.values(gasstationDetail || {});
    const stocks = Object.values(stockDetail || {});

    const stock = stocks.filter((stock) =>
        gasStationOil.some((station) => station.Stock === stock.Name)
    );
    const [isDataUpdated, setIsDataUpdated] = useState(false);

    // ฟังก์ชันรวมค่าของ DownHole
    const calculateDownHole = (list, targetStock, day) => {
        const result = {};
        list.forEach(row => {
            if (targetStock === "ทั้งหมด" || row.Stock === targetStock) {
                const currentReport = row.Report?.[day];
                if (currentReport) {
                    Object.values(currentReport).forEach(reportItem => {
                        const name = reportItem?.ProductName || "";
                        const downHole = parseFloat(reportItem?.DownHole || 0);
                        result[name] = (result[name] || 0) + downHole;
                    });
                }
            }
        });
        return result;
    };

    useEffect(() => {
        const day = dayjs(selectedDate).format("DD-MM-YYYY");

        const valuesDownHole = calculateDownHole(values, checkStock, day);
        const gasStationDownHole = calculateDownHole(gasStationOil, checkStock, day);

        const sum = obj => Object.values(obj).reduce((total, val) => total + val, 0);

        const totalValues = sum(valuesDownHole);
        const totalGas = sum(gasStationDownHole);

        console.log("1.show Down Hole :", valuesDownHole);
        console.log("2.show Down Hole :", gasStationDownHole);
        console.log("1.Total Down Hole :", totalValues);
        console.log("2.Total Down Hole :", totalGas);

        setIsDataUpdated(totalValues !== totalGas && totalGas !== 0);
    }, [values, gasStationOil, selectedDate, checkStock]);

    const getDownHoleByStock = (stockName) => {
        let downHole = {};
        let day = dayjs(selectedDate).format("DD-MM-YYYY");

        values.forEach((row) => {
            if (stockName === "ทั้งหมด" || row.Stock === stockName) {
                const currentReport = row.Report?.[day];
                if (currentReport) {
                    Object.values(currentReport).forEach(reportItem => {
                        const productName = reportItem?.ProductName || "";
                        const downHoleValue = parseFloat(reportItem?.DownHole) || 0;
                        downHole[productName] = (downHole[productName] || 0) + downHoleValue;
                    });
                }
            }
        });

        return downHole;
    };


    // const getStockOil = async () => {
    //     const gasStation = [];
    //     database.ref("/depot/gasStations").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         const dataList = [];
    //         for (let id in datas) {
    //             dataList.push({ id, ...datas[id] });
    //             gasStation.push({ id, ...datas[id] });
    //         }
    //         setGasStationsOil(dataList);
    //     });

    //     database.ref("/depot/stock").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         const dataList = [];
    //         for (let id in datas) {
    //             dataList.push({ id, ...datas[id] });
    //         }
    //         setStocks(dataList);

    //         const matchedStocks = dataList.filter((stock) =>
    //             gasStation.some((station) => station.Stock === stock.Name)
    //         );
    //         setStock(matchedStocks);
    //     });
    // };

    // useEffect(() => {
    //     getStockOil();
    // }, []);

    // const matchCount = stocks.reduce((count, stock) => {
    //     return count + gasStationOil.filter((row) => stock.Name === row.Stock && row.Stock === open).length;
    // }, 0);

    // console.log("ปั้มทั้งหมด" + matchCount);

    // console.log(" Gas Station Oil : ", gasStationOil);
    // console.log(" Gas Station Oil edit : ", values);

    // const [isDataUpdated, setIsDataUpdated] = useState(false);
    // const [downHoles, setDownHoles] = useState(0);

    // React.useEffect(() => {
    //     if (checkStock === "ทั้งหมด") {
    //         let total = 0;
    //         let downHoleValues = {}; // ตัวแปรเก็บค่ารวมของ DownHole
    //         let downHoleGas = {}; // ตัวแปรเก็บค่ารวมของ DownHole
    //         stocks.map((stock, index) => {
    //             let day = dayjs(selectedDate).format("DD-MM-YYYY");
    //             console.log("Show Values : ", values);

    //             values.forEach((row) => {
    //                 if (stock.Name === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
    //                     const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
    //                     const yesterdayData = row?.Report?.[yesterdayDate];

    //                     let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
    //                     if (currentReport) {
    //                         Object.values(currentReport).forEach(reportItem => {
    //                             // const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };

    //                             let productName = reportItem?.ProductName || "";
    //                             console.log("DownHole : ", parseFloat(reportItem?.DownHole));

    //                             if (!downHoleValues[productName]) {
    //                                 downHoleValues[productName] = 0;
    //                             }
    //                             downHoleValues[productName] += parseFloat(reportItem?.DownHole);
    //                         });
    //                     }
    //                 }
    //             });

    //             gasStationOil.forEach((row) => {
    //                 if (stock.Name === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
    //                     const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
    //                     const yesterdayData = row?.Report?.[yesterdayDate];

    //                     let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
    //                     if (currentReport) {
    //                         Object.values(currentReport).forEach(reportItem => {
    //                             // const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };

    //                             let productName = reportItem?.ProductName || "";
    //                             console.log("DownHole : ", parseFloat(reportItem?.DownHole));

    //                             if (!downHoleGas[productName]) {
    //                                 downHoleGas[productName] = 0;
    //                             }
    //                             downHoleGas[productName] += (parseFloat(reportItem?.DownHole) || 0);
    //                         });
    //                     }
    //                 }
    //             });

    //         })

    //         const totalDownHoleValues = Object.values(downHoleValues).reduce((total, value) => total + value, 0);
    //         const totalDownHoleGas = Object.values(downHoleGas).reduce((total, value) => total + value, 0);

    //         console.log("1.show Down Hole : ", downHoleValues);
    //         console.log("2.show Down Hole : ", downHoleGas);
    //         console.log("1.Total Down Hole : ", totalDownHoleValues);
    //         console.log("2.Total Down Hole : ", totalDownHoleGas);

    //         //ถ้ามีการเปลี่ยนแปลง อัปเดตสถานะ
    //         if (totalDownHoleValues !== totalDownHoleGas && totalDownHoleGas !== 0) {
    //             setIsDataUpdated(true);
    //         } else {
    //             setIsDataUpdated(false);
    //         }

    //     } else {
    //         let total = 0;
    //         let downHoleValues = {}; // ตัวแปรเก็บค่ารวมของ DownHole
    //         let downHoleGas = {}; // ตัวแปรเก็บค่ารวมของ DownHole
    //         let matchCount = 0; // ตัวแปรนับจำนวน match
    //         let isUpdated = false; // ตัวแปรเก็บสถานะการเปลี่ยนแปลง
    //         let day = dayjs(selectedDate).format("DD-MM-YYYY");
    //         console.log("Show Values : ", values);

    //         values.forEach((row) => {
    //             if (checkStock === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
    //                 const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
    //                 const yesterdayData = row?.Report?.[yesterdayDate];

    //                 let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
    //                 if (currentReport) {
    //                     Object.values(currentReport).forEach(reportItem => {
    //                         // const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };

    //                         let productName = reportItem?.ProductName || "";
    //                         console.log("DownHole : ", parseFloat(reportItem?.DownHole));

    //                         if (!downHoleValues[productName]) {
    //                             downHoleValues[productName] = 0;
    //                         }
    //                         downHoleValues[productName] += parseFloat(reportItem?.DownHole);
    //                     });
    //                 }
    //             }
    //         });

    //         gasStationOil.forEach((row) => {
    //             if (checkStock === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
    //                 const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
    //                 const yesterdayData = row?.Report?.[yesterdayDate];

    //                 let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
    //                 if (currentReport) {
    //                     Object.values(currentReport).forEach(reportItem => {
    //                         // const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };

    //                         let productName = reportItem?.ProductName || "";
    //                         console.log("DownHole : ", parseFloat(reportItem?.DownHole));

    //                         if (!downHoleGas[productName]) {
    //                             downHoleGas[productName] = 0;
    //                         }
    //                         downHoleGas[productName] += (parseFloat(reportItem?.DownHole) || 0);
    //                     });
    //                 }
    //             }
    //         });

    //         const totalDownHoleValues = Object.values(downHoleValues).reduce((total, value) => total + value, 0);
    //         const totalDownHoleGas = Object.values(downHoleGas).reduce((total, value) => total + value, 0);

    //         console.log("1.show Down Hole : ", downHoleValues);
    //         console.log("2.show Down Hole : ", downHoleGas);
    //         console.log("1.Total Down Hole : ", totalDownHoleValues);
    //         console.log("2.Total Down Hole : ", totalDownHoleGas);

    //         //ถ้ามีการเปลี่ยนแปลง อัปเดตสถานะ
    //         if (totalDownHoleValues !== totalDownHoleGas && totalDownHoleGas !== 0) {
    //             setIsDataUpdated(true);
    //         } else {
    //             setIsDataUpdated(false);
    //         }
    //     }
    // }, [values, gasStationOil, selectedDate, checkStock, stocks]);

    // ใช้ useEffect เพื่อตรวจสอบค่า values และอัปเดต isDataUpdated
    // React.useEffect(() => {
    //     if (!values.length || !gasStationOil) return;

    //     let date = dayjs(selectedDate).format("DD-MM-YYYY");

    //     // 🔍 ดึงข้อมูลของวันนั้นจาก values และ gasStationOil ด้วย optional chaining
    //     let reportData = values.find(item => item.Stock === checkStock && item.Report?.[date])?.Report[date] || null;
    //     let gasStationData = gasStationOil.find(item => item.Stock === checkStock && item.Report?.[date])?.Report[date] || null;

    //     console.log("📅 Date:", date);
    //     console.log("📦 reportData จาก values:", reportData);
    //     console.log("🛢️ gasStationData จาก gasStationOil:", gasStationData);

    //     // ถ้าไม่มีข้อมูลใน reportData หรือ gasStationData สำหรับวันที่นั้น ให้ตั้งค่า isDataUpdated เป็น false
    //     if (!reportData || !gasStationData) {
    //         setIsDataUpdated(false);
    //         return;
    //     }

    //     // 🔍 ตรวจสอบค่าต่าง ๆ ใน reportData และ gasStationData
    //     const isUpdated = Object.keys(reportData).some(index => {
    //         const reportItem = reportData[index];
    //         const gasStationItem = gasStationData[index];

    //         if (reportItem) {
    //             // ตรวจสอบว่ามีค่าที่ไม่ตรงกันหรือไม่
    //             return (
    //                 reportItem.Period !== gasStationItem.Period
    //             );
    //         }

    //         // ถ้าไม่มีข้อมูลใน gasStationData ถือว่าไม่มีการเปลี่ยนแปลง
    //         return false;
    //     });

    //     // กำหนดค่า isDataUpdated: ถ้ามีการเปลี่ยนแปลง จะเป็น true
    //     setIsDataUpdated(isUpdated);

    //     console.log("🔄 ค่า isDataUpdated:", isUpdated);
    // }, [values, gasStationOil, selectedDate]);

    return (
        <React.Fragment>
            <Box
                sx={{
                    p: 1,
                    // height: "70vh"
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={4}>
                        <Paper
                            component="form"
                            sx={{
                                width: "100%", // กำหนดความกว้างของ Paper
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
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
                                            inputProps: {
                                                value: selectedDate
                                                    ? formatThaiSlash(selectedDate) // ✅ แสดงเป็น 05/11/2568
                                                    : "",
                                                readOnly: true,
                                            },
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        กรุณาเลือกวันที่ :
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
                        </Paper>
                    </Grid>
                    <Grid item sm={6} lg={8}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkStock === "ทั้งหมด"}
                                        onChange={() => setCheckStock("ทั้งหมด")}
                                        disabled={isDataUpdated} // 🔹 ปิดการเลือกถ้ามีการเปลี่ยนแปลง
                                    />
                                }
                                label="ทั้งหมด"
                            />
                            {stocks.map((row) => (
                                <FormControlLabel
                                    key={row.Name}
                                    control={
                                        <Checkbox
                                            checked={checkStock === row.Name}
                                            onChange={() => setCheckStock(row.Name)}
                                            disabled={isDataUpdated} // 🔹 ปิดการเลือกถ้ามีการเปลี่ยนแปลง
                                        />
                                    }
                                    label={row.Name}
                                />
                            ))}
                            {isDataUpdated && (
                                <Typography color="error" sx={{ mt: 1 }}>
                                    ⚠️ กรุณาบันทึกข้อมูลก่อนเปลี่ยนสาขา
                                </Typography>
                            )}
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                        {(checkStock === "ทั้งหมด" ? stocks : [stocks.find(s => s.Name === checkStock)]).map((stock, index) => {
                            if (!stock) return null;

                            const downHole = getDownHoleByStock(stock.Name);
                            let matchCount = 0;

                            return (
                                <Paper
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        border: '2px solid lightgray',
                                        borderRadius: 3,
                                        boxShadow: 1,
                                        width:
                                            windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 125) :
                                                windowWidth <= 600 ? (windowWidth - 65) : (windowWidth - 275),
                                        overflowY: 'auto',
                                    }}
                                    key={stock.id || index}
                                >
                                    {gasStationOil.map((row) => {
                                        if (row.Stock === stock.Name) {
                                            matchCount++;
                                            return (
                                                <UpdateGasStations
                                                    key={row.id}
                                                    gasStation={row}
                                                    gasStationOil={gasStationOil}
                                                    selectedDate={selectedDate}
                                                    count={matchCount}
                                                    checkStock={checkStock}
                                                    Squeeze={matchCount === 1 ? 800 : 0}
                                                    currentReport={row.Report}
                                                    valueDownHole={downHole}
                                                    onSendBack={handleSendBack}
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </Paper>
                            );
                        })}

                        {/* {
                            checkStock === "ทั้งหมด" ?
                                stocks.map((stock, index) => {
                                    let downHole = {}; // ตัวแปรเก็บค่ารวมของ DownHole
                                    let matchCount = 0; // ตัวแปรนับจำนวน match
                                    let day = dayjs(selectedDate).format("DD-MM-YYYY");

                                    console.log(`1.Final DownHole for Stock: ${stock.Name}`, downHole);
                                    console.log("Show Values : ", values);

                                    values.forEach((row) => {
                                        if (stock.Name === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
                                            const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
                                            const yesterdayData = row?.Report?.[yesterdayDate];

                                            let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
                                            if (currentReport) {
                                                Object.values(currentReport).forEach(reportItem => {
                                                    // const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };

                                                    let productName = reportItem?.ProductName || "";

                                                    // let volumeValue = Number(yesterdayEntry?.Difference) || Number(yesterdayEntry?.OilBalance) || 0;
                                                    // let deliveredValue = Number(reportItem?.Delivered) || 0;
                                                    // let pending1Value = Number(reportItem?.Pending1) || 0;
                                                    // let pending2Value = Number(reportItem?.Pending2) || 0;

                                                    // console.log("Volume : ",volumeValue);
                                                    // console.log("DeliveredValue : ",deliveredValue);
                                                    // console.log("Pending1 : ",pending1Value);
                                                    // console.log("Pending2 : ",pending2Value);

                                                    // let total = (volumeValue+(deliveredValue+pending1Value+pending2Value));

                                                    console.log("DownHole : ", parseFloat(reportItem?.DownHole));

                                                    if (!downHole[productName]) {
                                                        downHole[productName] = 0;
                                                    }
                                                    downHole[productName] += parseFloat(reportItem?.DownHole);
                                                });
                                            }
                                        }
                                    });

                                    console.log(`2.Final DownHole for Stock: ${stock.Name}`, downHole);

                                    return (
                                        <Paper
                                            sx={{
                                                p: 2,
                                                marginBottom: 2,
                                                border: '2px solid lightgray',
                                                borderRadius: 3,
                                                boxShadow: 1,
                                                width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 125) : windowWidth <= 600 ? (windowWidth - 65) : (windowWidth - 275),
                                                overflowY: 'auto'
                                            }}
                                            key={stock.id || index}
                                        >
                                            {gasStationOil.map((row) => {
                                                if (stock.Name === row.Stock) { // แสดงเฉพาะแถวที่ตรงกับ StockName
                                                    matchCount++;
                                                    return (
                                                        <UpdateGasStations
                                                            key={row.id}
                                                            gasStation={row}
                                                            gasStationOil={gasStationOil}
                                                            selectedDate={selectedDate}
                                                            count={matchCount}
                                                            checkStock={checkStock}
                                                            Squeeze={matchCount === 1 ? 800 : 0} // กำหนดค่า Squeeze
                                                            currentReport={row.Report} // ส่ง Report ตามวัน
                                                            valueDownHole={downHole} // ส่งข้อมูลที่รวมแล้ว
                                                            onSendBack={handleSendBack}
                                                        />
                                                    );
                                                }
                                                return null;
                                            })}
                                        </Paper>
                                    );
                                })
                                :
                                <Paper
                                    sx={{
                                        p: 2,
                                        marginBottom: 2,
                                        border: '2px solid lightgray', // เพิ่มขอบเข้ม
                                        borderRadius: 3, // เพิ่มความมน (ค่าในหน่วย px)
                                        boxShadow: 1, // เพิ่มเงาเพื่อความสวยงาม
                                        width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 125) : windowWidth <= 600 ? (windowWidth - 65) : (windowWidth - 275), overflowY: 'auto'
                                    }}
                                >
                                    {(() => {
                                        let downHole = {}; // ตัวแปรเก็บค่ารวมของ DownHole
                                        let matchCount = 0; // ตัวแปรนับจำนวน match
                                        let day = dayjs(selectedDate).format("DD-MM-YYYY");
                                        console.log("Show Values : ", values);

                                        values.forEach((row) => {
                                            if (checkStock === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
                                                const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
                                                const yesterdayData = row?.Report?.[yesterdayDate];

                                                let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
                                                if (currentReport) {
                                                    Object.values(currentReport).forEach(reportItem => {
                                                        // const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };

                                                        let productName = reportItem?.ProductName || "";
                                                        // let volumeValue = Number(yesterdayEntry?.Difference) || Number(yesterdayEntry?.OilBalance) || 0;
                                                        // let deliveredValue = Number(reportItem?.Delivered) || 0;
                                                        // let pending1Value = Number(reportItem?.Pending1) || 0;
                                                        // let pending2Value = Number(reportItem?.Pending2) || 0;

                                                        // let total = (volumeValue+(deliveredValue+pending1Value+pending2Value));

                                                        // console.log("Total : ",total);

                                                        // if (!downHole[productName]) {
                                                        //     downHole[productName] = 0;
                                                        // }
                                                        // downHole[productName] += total;
                                                        console.log("DownHole : ", parseFloat(reportItem?.DownHole));

                                                        if (!downHole[productName]) {
                                                            downHole[productName] = 0;
                                                        }
                                                        downHole[productName] += parseFloat(reportItem?.DownHole);
                                                    });
                                                }
                                            }
                                        });

                                        console.log(`2.Final DownHole for Stock: ${stock.Name}`, downHole);

                                        return gasStationOil.map((row, rowIndex) => {
                                            if (checkStock === row.Stock) {
                                                matchCount++; // เพิ่มตัวนับเมื่อเงื่อนไขเป็นจริง
                                                console.log(`Stock : ${checkStock}, row.Stock : ${row.Stock}`);
                                                return (
                                                    <UpdateGasStations
                                                        key={row.id}
                                                        gasStation={row}
                                                        gasStationOil={gasStationOil}
                                                        selectedDate={selectedDate}
                                                        count={matchCount}
                                                        checkStock={checkStock}
                                                        Squeeze={matchCount === 1 ? 800 : 0} // กำหนดค่า Squeeze
                                                        currentReport={row.Report} // ส่ง Report ตามวัน
                                                        valueDownHole={downHole} // ส่งข้อมูลที่รวมแล้ว
                                                        onSendBack={handleSendBack}
                                                    />
                                                );
                                            }
                                            return null; // ไม่แสดงอะไรถ้าเงื่อนไขไม่ตรง
                                        })
                                    }
                                    )()}
                                </Paper>
                        } */}
                    </Grid>
                </Grid>
            </Box>
            {/* <Grid container spacing={3} marginTop={1} marginLeft={-7}>
                <Grid item xs={openTab ? 1.5 : 0.7}>
                    <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        fullWidth
                        sx={{ marginBottom: 1.3, fontWeight: "bold", marginBottom: 1, marginTop: -3 }}
                        onClick={toggleDrawer(!openTab)}
                    >

                        <Grid container spacing={2}>
                            {
                                openTab ?
                                    <Grid item xs={12} textAlign="center">
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประเภท</Typography>
                                    </Grid>
                                    :
                                    ""
                            }
                            <Grid item xs={12} marginTop={openTab ? -6 : 0} textAlign="right">
                                <ArrowCircleLeftIcon />
                            </Grid>
                        </Grid>
                    </Button>
                    {
                        stock.map((row) => (
                            <Button
                                variant="contained"
                                color={row.Name === open ? "info" : "inherit"}
                                size="small"
                                fullWidth
                                sx={{ marginBottom: 1.3 }}
                                onClick={(e) => setOpen(row.Name)}
                            >
                                {
                                    openTab ? row.Name : ("PS" + Number(row.id))
                                }
                            </Button>
                        ))
                    }

                </Grid>
                <Grid item xs={openTab ? 10.5 : 11.3}>
                    <Paper
                        sx={{
                            p: 2,
                            // height: "70vh"
                        }}
                    >
                        {
                            stocks.map((stock) => (
                                gasStationOil.map((row) => (
                                    stock.Name === row.Stock && row.Stock === open && (
                                    <UpdateGasStations key={row.id} gasStation={row} gasStationOil={gasStationOil}
                                    onSendBack={handleSendBack}
                                    />
                                    )
                                ))
                            ))
                        }
                    </Paper>
                </Grid>
            </Grid> */}

        </React.Fragment>

    );
};

export default GasStationsDetail;
