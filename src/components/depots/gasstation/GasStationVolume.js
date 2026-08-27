import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
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
import dayjs from "dayjs";
import "dayjs/locale/th";
import theme from "../../../theme/theme";
import { IconButtonError, IconButtonInfo, RateOils, TablecellHeader } from "../../../theme/style";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import SaveIcon from '@mui/icons-material/Save';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { formatThaiSlash } from "../../../theme/DateTH";
import Detail from "./Detail";

const GasStationVolume = (props) => {
    const { gasStation,
        volumeData,
        products,
        selectedDate,
        isFirst,                // แถวแรกของ stock
        stockCount,           // จำนวนปั้มที่ใช้ stock นี้
        onProductChange,
    } = props;
    const [name, setName] = useState(gasStation.Name);
    const [shortName, setShortName] = useState(gasStation.ShortName);
    const [number, setNumber] = useState(gasStation.OilWellNumber);
    const [driver1, setDriver1] = useState("");
    const [driver2, setDriver2] = useState("");
    const [focused, setFocused] = useState({}); // { [index]: { [column]: true/false } }
    const [localProducts, setLocalProducts] = useState(products?.Products || []);
    const [originalProducts, setOriginalProducts] = useState(products?.Products || []);

    // 2️⃣ Sync ค่าเริ่มต้นเมื่อ parent เปลี่ยน
    useEffect(() => {
        setOriginalProducts(products?.Products || []);
        setLocalProducts(products?.Products || []);
    }, [products]);

    // console.log("products : ", products);

    const updateVolumeBoth = (index, value) => {
        handleProductChange(index, "FullVolume", value);
        handleProductChange(index, "Volume", value);
    };

    const handleProductChange = (index, field, value) => {
        if (index === null) {
            onProductChange(gasStation.id, value, field);
            return;
        }

        const updated = [...localProducts];
        updated[index][field] = value;

        if (field === "FullVolume") {
            if (stockCount === 2) {
                // ดึงรายการปั้มของ stock เดียวกัน
                const sameStock = volumeData.filter(p => p.stockID === products?.stockID);

                if (sameStock.length === 2) {
                    const pump1 = sameStock[0].Products;
                    const pump2 = sameStock[1].Products;

                    // หา Product เดียวกันตาม ProductName
                    const pump1Product = pump1.find(p => p.ProductName === updated[index].ProductName);
                    const pump2Product = pump2.find(p => p.ProductName === updated[index].ProductName);

                    if (pump1Product) {
                        if (pump2Product) {
                            // ปรับ Volume ปั้มแรก = FullVolume – ปั้มสอง
                            pump1Product.Volume = Number(value) - Number(pump2Product.Volume || 0);
                        } else {
                            // pump2 ไม่มี product → Volume = FullVolume
                            pump1Product.Volume = Number(value);
                        }
                    }
                }
            }

            // กรณีมีแค่ 1 ปั้ม
            if (stockCount === 1) {
                updated[index].Volume = Number(value);
            }
        }

        // คำนวณค่าต่าง ๆ
        updated[index].Period = calculatePeriod(updated[index]);
        updated[index].Sell = calculateSell(updated[index]);
        updated[index].TotalVolume = calculateTotalVolume(updated[index]);
        updated[index].PeriodDisplay =
            parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

        setLocalProducts(updated);
    };

    const handleBlur = (index, column, e) => {
        setFocused(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [column]: false
            }
        }));

        // อัปเดตค่าใน local state
        const raw = e.target.value.replace(/,/g, "");
        const newValue = raw === "" || raw === "-" ? 0 : Number(raw);

        const updated = [...localProducts];
        updated[index][column] = newValue;
        setLocalProducts(updated);

        // ส่งไป parent
        onProductChange(gasStation.id, updated, "Products");
    };

    const handleFocus = (index, column) => {
        setFocused(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [column]: true
            }
        }));
    };

    const handleChangeWithCheck = (index, field, newValue) => {
        const updated = [...localProducts];
        updated[index][field] = newValue;

        // ⭐ ถ้าแก้ FullVolume
        if (field === "FullVolume") {
            if (stockCount === 2) {
                // ดึงรายการปั้มของ stock เดียวกัน
                const sameStock = volumeData.filter(p => p.stockID === products?.stockID);

                if (sameStock.length === 2) {
                    // หา Product เดียวกันใน pump1 และ pump2 ตาม ProductName
                    const pump1Product = sameStock[0].Products.find(p => p.ProductName === updated[index].ProductName);
                    const pump2Product = sameStock[1].Products.find(p => p.ProductName === updated[index].ProductName);

                    if (pump1Product) {
                        if (pump2Product) {
                            // ปรับ Volume ปั้มแรก = FullVolume – ปั้มสอง
                            pump1Product.Volume = Number(newValue) - Number(pump2Product.Volume || 0);
                        } else {
                            // pump2 ไม่มี product → Volume = FullVolume
                            pump1Product.Volume = Number(newValue);
                        }
                    }
                }
            }

            // กรณีมีแค่ 1 ปั้ม
            if (stockCount === 1) {
                updated[index].Volume = Number(newValue);
            }
        }

        // 2️⃣ คำนวณค่าที่ต้องการ
        updated[index].Period = calculatePeriod(updated[index]);
        updated[index].Sell = calculateSell(updated[index]);
        updated[index].TotalVolume = calculateTotalVolume(updated[index]);
        updated[index].PeriodDisplay =
            parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

        setLocalProducts(updated);

        // 3️⃣ ตรวจสอบ hasChanged
        const originalValue = originalProducts[index][field];
        updated[index].hasChanged = originalValue !== newValue;

        // 4️⃣ ส่ง parent
        onProductChange(gasStation.id, updated, "Products");
    };

    // const handleBlur = (index, column) => {
    //     setFocused(prev => ({
    //         ...prev,
    //         [index]: {
    //             ...prev[index],
    //             [column]: false
    //         }
    //     }));
    // };

    // ตรวจสอบว่า field นั้น focus อยู่ไหม
    const isFieldFocused = (index, column) => focused[index]?.[column] || false;

    const { reghead } = useBasicData();

    const registration = Object.values(reghead || {});

    const filterOptions = (options, { inputValue }) => {
        return options.filter((option) =>
            (option ?? "").toLowerCase().includes((inputValue ?? "").toLowerCase())
        );
    };

    const truckDriver = registration.filter((item => item.RegTail !== "0:ไม่มี" && item.Driver !== "0:ไม่มี"));
    // console.log("1.truckDriver : ", truckDriver);
    // console.log("2.truckDriver : ", truckDriver.map((row) => row.Driver.split(":")[1]?.split(" ")[0]));

    const calculatePeriod = (row) => {
        const estimateSell = parseFloat(row.EstimateSell) || 0;
        const Pending3 = parseFloat(row.Pending3) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const squeezeoil = parseFloat(row.Squeeze) || 0;
        const volume = parseFloat(row.Volume) || 0;

        if (estimateSell === 0) {
            return ((volume + Pending3 + Pending1 + Pending2) - squeezeoil).toFixed(2);
        } else {
            return (((volume + Pending3 + Pending1 + Pending2) - squeezeoil) / estimateSell).toFixed(2);
        }
    };

    const calculateDownHole = (row) => {
        const Pending3 = parseFloat(row.Pending3) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const downHole = parseFloat(row.DownHole) || 0;
        const volume = parseFloat(row.Volume) || 0;

        if (downHole !== 0) {
            return ((volume + Pending3 + Pending1 + Pending2)).toFixed(2);
        } else {
            return ((volume + Pending3 + Pending1 + Pending2 + downHole)).toFixed(2);
        }
    };

    const calculateSell = (row) => {
        const yesterDay = parseFloat(row.YesterDay) || 0;
        const volume = parseFloat(row.Volume) || 0;
        return (yesterDay - volume).toFixed(2);
    };

    const calculateTotalVolume = (row) => {
        const downHole = parseFloat(row.DownHole) || 0;
        const estimateSell = parseFloat(row.EstimateSell) || 0;
        return (downHole - estimateSell).toFixed(2);
    };

    // const handleProductChange = (index, field, value) => {
    //     const updated = [...products?.Products];
    //     updated[index][field] = value;

    //     updated[index].Period = calculatePeriod(updated[index]);
    //     updated[index].Sell = calculateSell(updated[index]);
    //     updated[index].TotalVolume = calculateTotalVolume(updated[index]);
    //     updated[index].PeriodDisplay = parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

    //     onProductChange(gasStation.id, updated);
    // };

    // const handleProductChange = (index, field, value) => {
    //     // ตรวจสอบว่ากำลังแก้ไข field ของ Products หรือ Driver
    //     if (index !== null) {
    //         // อัปเดต Products
    //         const updated = [...products?.Products];
    //         updated[index][field] = value;

    //         // คำนวณค่าต่างๆ ของ Products
    //         updated[index].Period = calculatePeriod(updated[index]);
    //         updated[index].Sell = calculateSell(updated[index]);
    //         updated[index].TotalVolume = calculateTotalVolume(updated[index]);
    //         updated[index].PeriodDisplay = parseFloat(updated[index].Period) || (parseFloat(updated[index].Volume) - parseFloat(updated[index].Squeeze));

    //         // ส่งกลับไปยัง parent
    //         onProductChange(gasStation.id, updated, "Products"); // ✅ เพิ่ม type
    //     } else {
    //         // อัปเดต Driver1 / Driver2 ของ station
    //         onProductChange(gasStation.id, value, field); // ส่ง value + field name
    //     }
    // };

    const handleUpdate = () => {
        const year = dayjs(selectedDate).format("YYYY");
        const month = dayjs(selectedDate).format("M");
        const day = dayjs(selectedDate).format("D");

        database
            .ref(`/depot/gasStations/${gasStation.id - 1}/Report/${year}/${month}`)
            .child(day)
            .update(products)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("✅ Updated success");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

    // console.log("products length : ", products?.Products.length);
    return (
        <React.Fragment>
            {
                (isFirst && stockCount === 2) && (
                    <Grid container spacing={1} marginBottom={1} pr={1} pl={1}>
                        <Grid item xl={1.5} md={2} sm={3} xs={4}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontsize: "18px", mt: 1 }}>
                                กรอกปริมาณน้ำมัน :
                            </Typography>
                        </Grid>
                        {
                            products?.Products.map((s, index) => (
                                <Grid item xl={1.5} md={2} sm={3} xs={4}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", backgroundColor: s.Color, p: 0.5, borderRadius: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontWeight: 'bold', mr: 1, fontSize: "18px" }}>{s.ProductName}</Typography>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "FullVolume") ? "text" : "text"}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "FullVolume")
                                                        ? ((s.FullVolume === 0 || s.FullVolume === undefined) ? "" : s.FullVolume)
                                                        : Number(s.FullVolume || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "FullVolume")}
                                                onBlur={(e) => handleBlur(index, "FullVolume", e)} // ส่ง event
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        updateVolumeBoth(index, raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        updateVolumeBoth(index, Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.FullVolume).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        updateVolumeBoth(index, current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        updateVolumeBoth(index, current - 1000);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    inputProps: {
                                                        min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                        step: 1000,
                                                    },
                                                    sx: {
                                                        "& input::-webkit-inner-spin-button": {
                                                            // marginLeft: isFieldFocused(index, "FullVolume") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    // startAdornment: (
                                                    //     <InputAdornment position="start">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 ml: -1,
                                                    //                 opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.FullVolume).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) - 1000;

                                                    //                 handleChangeWithCheck(index, "FullVolume", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                    // endAdornment: (
                                                    //     <InputAdornment position="end">
                                                    //         <IconButton
                                                    //             size="small"
                                                    //             sx={{
                                                    //                 p: '0px',        // 🔹 ตัด padding IconButton
                                                    //                 width: 5,
                                                    //                 height: 18,
                                                    //                 mr: -1.5,
                                                    //                 opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                    //             }}
                                                    //             onClick={() => {
                                                    //                 let raw = String(s.FullVolume).replace(/,/g, "");
                                                    //                 if (raw === "" || raw === "-") raw = "0";

                                                    //                 const newValue = Number(raw) + 1000;

                                                    //                 handleChangeWithCheck(index, "FullVolume", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                    //             }}
                                                    //         >
                                                    //             <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                    //         </IconButton>
                                                    //     </InputAdornment>
                                                    // ),
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 30 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "16px",
                                                        fontWeight: "bold",
                                                        textAlign: "right",
                                                        mr: -0.5,
                                                        ml: -0.5,
                                                        pr: 0.5,
                                                        paddingLeft: -3, // เพิ่มพื้นที่ให้ endAdornment
                                                        paddingRight: 1.5, // เพิ่มพื้นที่ให้ endAdornment
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>
                            ))
                        }
                    </Grid>
                )
            }
        </React.Fragment>
    );

};

export default GasStationVolume;
