import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Autocomplete,
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
    FormControl,
    FormControlLabel,
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
import { IconButtonError, IconButtonInfo, RateOils, TablecellHeader, TablecellTickets } from "../../../theme/style";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import SaveIcon from '@mui/icons-material/Save';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { formatThaiSlash } from "../../../theme/DateTH";
import Detail from "./Detail";

const UpdateGasStations = (props) => {
    const { gasStation,
        volumeData,
        products,
        selectedDate,
        isFirst,                // แถวแรกของ stock
        isFirstPump,            // ปั้มแรกของ stock
        stockCount,            // จำนวนปั้มที่ตรงกัน
        downHoleByProduct,      // มาจากหน้าหลัก
        totaldownHoleByProduct, // มาจากหน้าหลัก
        onProductChange,
        handleSave,
        stationId,
        check,
        stocks,
        onCheck
    } = props;
    const [name, setName] = useState(gasStation.Name);
    const [shortName, setShortName] = useState(gasStation.ShortName);
    const [number, setNumber] = useState(gasStation.OilWellNumber);
    const [driver1, setDriver1] = useState("");
    const [driver2, setDriver2] = useState("");
    const [focused, setFocused] = useState({}); // { [index]: { [column]: true/false } }

    const [localProducts, setLocalProducts] = useState(products?.Products || []);
    const [originalProducts, setOriginalProducts] = useState(products?.Products || []);

    const isSmallTrucksEmpty = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return true;
        if (arr.length > 1) return false;

        const t = arr[0];

        const noValue =
            String(t.Truck ?? "").trim() === "" &&
            Number(t.Price || 0) === 0 &&
            Number(t.Volume || 0) === 0;

        return noValue;
    };

    const [checkTruck, setCheckTruck] = useState(gasStation.id);
    const [showTruckFromClick, setShowTruckFromClick] = useState(false); // กดจาก onclick

    const DEFAULT_TRUCK = [{ id: 0, Truck: "", Price: "", Volume: "" }];

    const [localTruck, setLocalTruck] = useState(products?.Truck || DEFAULT_TRUCK);
    const [originalTruck, setOriginalTruck] = useState(products?.Truck || DEFAULT_TRUCK);

    useEffect(() => {
        setOriginalProducts(products?.Products || []);
        setLocalProducts(products?.Products || []);

        if (products?.Truck) {
            setOriginalTruck(products.Truck);
            setLocalTruck(products.Truck);

            if (!showTruckFromClick) {
                // ถ้าเป็นค่าเริ่มต้น ให้ตรวจสอบ row ว่างหรือไม่
                setCheckTruck(isSmallTrucksEmpty(products.Truck) ? false : gasStation.id);
            }
        }
    }, [products, showTruckFromClick, gasStation.id]);

    const reorderIds = (arr) => {
        return arr.map((item, index) => ({
            ...item,
            id: index
        }));
    };


    const handleChange = (index, field, value) => {
        setLocalTruck(prev => {
            const updated = prev.map((row, i) =>
                i === index
                    ? { ...row, [field]: value }
                    : { ...row }
            );

            const reordered = reorderIds(updated);

            onProductChange(gasStation.id, reordered, "Truck");

            return reordered;
        });
    };

    const handleAdd = () => {
        const updated = [
            ...localTruck,
            { id: 0, Truck: "", Price: "", Volume: "" }
        ];

        const reordered = reorderIds(updated);

        setLocalTruck(reordered);

        onProductChange(gasStation.id, reordered, "Truck");
    };

    const handleDelete = (index) => {
        const updated = localTruck.filter((_, i) => i !== index);

        const reordered = reorderIds(updated);

        setLocalTruck(reordered);

        onProductChange(gasStation.id, reordered, "Truck");
    };

    const handleProductChange = (index, field, value) => {
        if (index === null) {
            onProductChange(gasStation.id, value, field);
            return;
        }

        setLocalProducts(prev => {
            const updated = structuredClone(prev);

            updated[index][field] = value;

            if (stockCount === 1 && field === "FullVolume") {
                updated[index].Volume = Number(value);
            }

            updated[index].Period = calculatePeriod(updated[index]);
            updated[index].Sell = calculateSell(updated[index]);
            updated[index].TotalVolume = calculateTotalVolume(updated[index]);
            updated[index].PeriodDisplay =
                parseFloat(updated[index].Period) ||
                (parseFloat(updated[index].Volume) -
                    parseFloat(updated[index].Squeeze));

            // ส่งขึ้น parent (parent จะ sync 2 ปั้ม)
            onProductChange(gasStation.id, updated, "Products");

            return updated;
        });
    };

    const handleBlur = (index, column, e) => {
        setFocused(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [column]: false
            }
        }));

        const raw = e.target.value.replace(/,/g, "");
        const newValue = raw === "" || raw === "-" ? 0 : Number(raw);

        const updated = [...localProducts];
        updated[index][column] = newValue;
        setLocalProducts(updated);

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
        setLocalProducts(prev => {
            const updated = structuredClone(prev);

            updated[index][field] = newValue;

            if (stockCount === 2 && field === "Volume") {
                const productName = updated[index].ProductName;

                const otherIndex = updated.findIndex(
                    (p, i) => i !== index && p.ProductName === productName
                );

                if (otherIndex !== -1) {
                    const full = Number(updated[index].FullVolume || 0);
                    updated[otherIndex].Volume =
                        full - Number(updated[index].Volume || 0);
                }
            }

            updated.forEach(p => {
                p.Period = calculatePeriod(p);
                p.Sell = calculateSell(p);
                p.TotalVolume = calculateTotalVolume(p);
                p.PeriodDisplay =
                    parseFloat(p.Period) ||
                    (parseFloat(p.Volume) - parseFloat(p.Squeeze));
            });

            onProductChange(gasStation.id, updated, "Products");
            return updated;
        });
    };

    const isFieldFocused = (index, column) => focused[index]?.[column] || false;

    const { reghead } = useBasicData();

    const registration = Object.values(reghead || {});

    const filterOptions = (options, { inputValue }) => {
        return options.filter((option) =>
            (option ?? "").toLowerCase().includes((inputValue ?? "").toLowerCase())
        );
    };

    const truckDriver = registration.filter((item => item.Driver !== "0:ไม่มี" && item.StatusTruck !== "ยกเลิก"));

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

    const hasStockChanged = volumeData?.some(
        s => s.stockID === products?.stockID && s.hasChanged === true
    );

    return (
        <React.Fragment>
            <Box textAlign="center"
                sx={{
                    display: "flex",
                    justifyContent: "space-between", // ชิดซ้าย-ขวา
                    alignItems: "center",
                    backgroundColor:
                        gasStation.StockName === "แม่โจ้" ? "#92D050"
                            : gasStation.StockName === "สันกลาง" ? "#B1A0C7"
                                : gasStation.StockName === "สันทราย" ? "#B7DEE8"
                                    : gasStation.StockName === "บ้านโฮ่ง" ? "#FABF8F"
                                        : gasStation.StockName === "ป่าแดด" ? "#B1A0C7"
                                            : "lightgray"
                    ,
                    paddingLeft: 2,
                    paddingTop: 2,
                    paddingBottom: 1,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10
                }}>

                {/* ด้านซ้าย */}
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ fontSize: 18, marginBottom: -1 }}
                >
                    {`${name} / ${shortName} มีทั้งหมด ${number} หลุม ที่อยู่ ${gasStation.Address}`}
                </Typography>

                {/* ด้านขวา */}
                {/* <Button variant="contained" color="warning" size="small" sx={{ mr: -0.5, boxShadow: "1px 1px 4px gray" }} >แก้ไขข้อมูลปั้ม</Button> */}
                <Detail gasStation={gasStation} stock={stocks} onCheck={onCheck} />
            </Box>
            <TableContainer
                component={Paper}
                style={{ maxHeight: "70vh" }}
                sx={{ marginBottom: 2 }}
            >
                <Table stickyHeader size="small" sx={{ width: products?.Products?.some(p => p.Backyard === true) ? 1480 : "100%" }}>
                    <TableHead>
                        <TableRow>
                            <TablecellHeader colSpan={2} width={130} sx={{ textAlign: "center", backgroundColor: theme.palette.panda.main }}>
                                <Paper
                                    component="form"
                                    sx={{
                                        width: "100%",
                                        height: "25px"
                                    }}
                                >
                                    <Typography fontSize="18px" fontWeight="bold" gutterBottom paddingTop={-0.5}>{formatThaiSlash(dayjs(selectedDate))}</Typography>
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                ปริมาณ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 80, whiteSpace: "nowrap" }}>
                                หักบีบไม่ขึ้น
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.success.main, width: 110, whiteSpace: "nowrap", padding: 0.5 }}>
                                <Paper
                                    component="form"
                                    sx={{
                                        width: 100,
                                        height: "25px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        marginLeft: !(products?.Products?.some(p => p.Backyard === true)) ? 1 : 0,
                                        marginRight: !(products?.Products?.some(p => p.Backyard === true)) ? -0.5 : 0,
                                    }}>
                                    <Autocomplete
                                        freeSolo
                                        fullWidth
                                        options={truckDriver.map(row => row.Driver)} // เก็บเต็ม: "1:สมส่วน สุขสม"
                                        getOptionLabel={(option) => {
                                            return option?.split(":")[1]?.split(" ")[0] || "";
                                        }}
                                        isOptionEqualToValue={(option, value) => option === value} // เทียบค่าที่เก็บเต็ม
                                        value={products?.Driver0 || ""} // value เก็บเต็ม: "1:สมส่วน สุขสม"
                                        onChange={(event, newValue) => {
                                            handleProductChange(null, "Driver0", newValue || ""); // เก็บเต็ม
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                variant="standard"
                                                placeholder="กรอกชื่อ"
                                                sx={{ fontSize: "12px", fontWeight: "bold", paddingLeft: 0.5 }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                            />
                                        )}
                                        ListboxProps={{
                                            sx: { fontSize: "12px", fontWeight: "bold", maxHeight: "150px", marginLeft: -1.5 },
                                        }}
                                    />
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap", padding: 0.5 }}>
                                <Paper
                                    component="form"
                                    sx={{
                                        width: 100,
                                        height: "25px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        marginLeft: !(products?.Products?.some(p => p.Backyard === true)) ? 1 : 0,
                                        marginRight: !(products?.Products?.some(p => p.Backyard === true)) ? -0.5 : 0,
                                    }}>
                                    <Autocomplete
                                        freeSolo
                                        fullWidth
                                        options={truckDriver.map(row => row.Driver)} // เก็บเต็ม: "1:สมส่วน สุขสม"
                                        getOptionLabel={(option) => {
                                            return option?.split(":")[1]?.split(" ")[0] || "";
                                        }}
                                        isOptionEqualToValue={(option, value) => option === value} // เทียบค่าที่เก็บเต็ม
                                        value={products?.Driver1 || ""} // value เก็บเต็ม: "1:สมส่วน สุขสม"
                                        onChange={(event, newValue) => {
                                            handleProductChange(null, "Driver1", newValue || ""); // เก็บเต็ม
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                variant="standard"
                                                placeholder="กรอกชื่อ"
                                                sx={{ fontSize: "12px", fontWeight: "bold", paddingLeft: 0.5 }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                            />
                                        )}
                                        ListboxProps={{
                                            sx: { fontSize: "12px", fontWeight: "bold", maxHeight: "150px", marginLeft: -1.5 },
                                        }}
                                    />
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap", padding: 0.5 }}>
                                <Paper
                                    component="form"
                                    sx={{
                                        width: 100,
                                        height: "25px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        marginLeft: !(products?.Products?.some(p => p.Backyard === true)) ? 1 : 0,
                                        marginRight: !(products?.Products?.some(p => p.Backyard === true)) ? -0.5 : 0,
                                    }}>
                                    <Autocomplete
                                        freeSolo
                                        fullWidth
                                        options={truckDriver.map(row => row.Driver)} // เก็บเต็ม: "1:สมส่วน สุขสม"
                                        getOptionLabel={(option) => {
                                            return option?.split(":")[1]?.split(" ")[0] || "";
                                        }}
                                        isOptionEqualToValue={(option, value) => option === value} // เทียบค่าที่เก็บเต็ม
                                        value={products?.Driver2 || ""} // value เก็บเต็ม: "1:สมส่วน สุขสม"
                                        onChange={(event, newValue) => {
                                            handleProductChange(null, "Driver2", newValue || ""); // เก็บเต็ม
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                variant="standard"
                                                placeholder="กรอกชื่อ"
                                                sx={{ fontSize: "12px", fontWeight: "bold", paddingLeft: 0.5 }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    sx: { fontSize: "12px", fontWeight: "bold" },
                                                }}
                                            />
                                        )}
                                        ListboxProps={{
                                            sx: { fontSize: "12px", fontWeight: "bold", maxHeight: "150px", marginLeft: -1.5 },
                                        }}
                                    />
                                </Paper>
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                ขาย/วัน
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.primary.dark, width: 80, whiteSpace: "nowrap" }}>
                                หมด
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.success.dark, width: 100, whiteSpace: "nowrap" }}>
                                ลงหลุม
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                เมื่อวาน
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                ขายได้
                            </TablecellHeader>
                            {
                                isFirstPump ?
                                    (
                                        stockCount === 2 ? (
                                            <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: "gray", width: 100, whiteSpace: "nowrap" }}>
                                                หมดรวม
                                            </TablecellHeader>
                                        )
                                            :
                                            (
                                                !(products?.Products?.some(p => p.Backyard === true)) &&
                                                <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 100 }} rowSpan={products?.Products.filter(Boolean).length}>

                                                </TablecellHeader>
                                            )
                                    )
                                    :
                                    (
                                        !(products?.Products?.some(p => p.Backyard === true)) &&
                                        <TablecellHeader sx={{ backgroundColor: theme.palette.panda.main, width: 100 }} rowSpan={products?.Products.filter(Boolean).length}>

                                        </TablecellHeader>
                                    )
                            }
                            {products?.Products?.some(p => p.Backyard === true) && (
                                <React.Fragment>
                                    <TablecellHeader
                                        sx={{
                                            textAlign: "center",
                                            fontSize: 14,
                                            backgroundColor: theme.palette.panda.main,
                                            width: 100,
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        ยอดขายหลังบ้าน
                                    </TablecellHeader>

                                    <TablecellHeader
                                        sx={{
                                            textAlign: "center",
                                            fontSize: 14,
                                            backgroundColor: theme.palette.panda.main,
                                            width: 100,
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        สรุปยอดหน้าบ้าน
                                    </TablecellHeader>

                                    <TablecellHeader
                                        sx={{
                                            backgroundColor: theme.palette.panda.main,
                                            width: 100
                                        }}
                                        rowSpan={products?.Products.filter(Boolean).length}
                                    />
                                </React.Fragment>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            products?.Products.filter(Boolean).map((s, index) => (
                                <TableRow key={index}>
                                    <TablecellHeader
                                        sx={{
                                            backgroundColor: s.Color ?? "white",
                                            width: 50,
                                            color: "black",
                                            position: "sticky",
                                            left: 0,
                                            zIndex: 1, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                            borderBottom: "2px solid white"
                                        }}
                                    >
                                        {s.ProductName}
                                    </TablecellHeader>
                                    <TableCell sx={{
                                        textAlign: "center",
                                        backgroundColor: s.Color ? `${s.Color}4A` : `${s.Color}4A`,
                                        width: 80,
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "20px !important",
                                        paddingRight: "20px !important",
                                        fontVariantNumeric: "tabular-nums",
                                    }}>
                                        {isFirst ? new Intl.NumberFormat("en-US").format(s.Capacity) : "\u00A0"}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A`
                                            : `${s.Color}4A`, color: s.Volume < 0 ? "#d50000" : "black",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        padding: 0.5,
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Volume") ? "text" : "text"}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "Volume")
                                                        ? ((s.Volume === 0 || s.Volume === undefined) ? "" : s.Volume)
                                                        : Number(s.Volume || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Volume")}
                                                onBlur={(e) => handleBlur(index, "Volume", e)}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Volume", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Volume", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Volume).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Volume", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Volume", current - 1000);
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
                                                            marginLeft: isFieldFocused(index, "Volume") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        textAlign: "right",
                                                        mr: -0.5,
                                                        ml: -0.5,
                                                        pr: 0.5,
                                                        paddingLeft: -3,
                                                        paddingRight: 2,
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A`
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5,
                                    }}>
                                        <TextField
                                            style={{ display: 'none' }}
                                            inputProps={{ readOnly: true }}
                                            value={s.Volume || 0}
                                        />
                                        <TextField
                                            style={{ display: 'none' }}
                                            inputProps={{ readOnly: true }}
                                            value={s.Color || ""}
                                        />
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Squeeze") ? "text" : "text"}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                style={{ display: isFirst ? "" : "none" }}
                                                value={
                                                    isFieldFocused(index, "Squeeze")
                                                        ? ((s.Squeeze === 0 || s.Squeeze === undefined) ? "" : s.Squeeze)
                                                        : Number(s.Squeeze || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Squeeze")}
                                                onBlur={(e) => handleBlur(index, "Squeeze", e)}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Squeeze", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Squeeze", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Squeeze).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Squeeze", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Squeeze", current - 1000);
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
                                                            marginLeft: isFieldFocused(index, "Squeeze") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        textAlign: "right",
                                                        mr: -0.5,
                                                        ml: -0.5,
                                                        pr: 0.5,
                                                        paddingLeft: -3,
                                                        paddingRight: 2,
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: "#a5d6a7",
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending3") ? "text" : "text"}
                                                label={products.Driver0 ? products.Driver0.split(":")[1]?.split(" ")[0] : ""}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold", mt: 0.5 } }}
                                                value={
                                                    isFieldFocused(index, "Pending3")
                                                        ? ((s.Pending3 === 0 || s.Pending3 === undefined) ? "" : s.Pending3)
                                                        : Number(s.Pending3 || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Pending3")}
                                                onBlur={(e) => handleBlur(index, "Pending3", e)}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Pending3", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Pending3", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Pending3).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending3", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending3", current - 1000);
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
                                                            marginLeft: isFieldFocused(index, "Pending3") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',
                                                                    width: 5,
                                                                    height: 18,
                                                                    ml: -1,
                                                                    opacity: 0.6
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending3).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) - 1000;

                                                                    handleChangeWithCheck(index, "Pending3", newValue);
                                                                }}
                                                            >
                                                                <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',
                                                                    width: 5,
                                                                    height: 18,
                                                                    mr: -1.5,
                                                                    opacity: 0.6
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending3).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) + 1000;

                                                                    handleChangeWithCheck(index, "Pending3", newValue);
                                                                }}
                                                            >
                                                                <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        textAlign: "right",
                                                        mr: -0.5,
                                                        ml: -0.5,
                                                        pr: 0.5,
                                                        paddingLeft: -3,
                                                        paddingRight: 1,
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A`
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending1") ? "text" : "text"}
                                                label={products.Driver1 ? products.Driver1.split(":")[1]?.split(" ")[0] : ""}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold", mt: 0.5 } }}
                                                value={
                                                    isFieldFocused(index, "Pending1")
                                                        ? ((s.Pending1 === 0 || s.Pending1 === undefined) ? "" : s.Pending1)
                                                        : Number(s.Pending1 || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Pending1")}
                                                onBlur={(e) => handleBlur(index, "Pending1", e)}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Pending1", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Pending1", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Pending1).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending1", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending1", current - 1000);
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
                                                            marginLeft: isFieldFocused(index, "Pending1") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',
                                                                    width: 5,
                                                                    height: 18,
                                                                    ml: -1,
                                                                    opacity: 0.6
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending1).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) - 1000;

                                                                    handleChangeWithCheck(index, "Pending1", newValue);
                                                                }}
                                                            >
                                                                <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',
                                                                    width: 5,
                                                                    height: 18,
                                                                    mr: -1.5,
                                                                    opacity: 0.6
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending1).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) + 1000;

                                                                    handleChangeWithCheck(index, "Pending1", newValue);
                                                                }}
                                                            >
                                                                <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        textAlign: "right",
                                                        mr: -0.5,
                                                        ml: -0.5,
                                                        pr: 0.5,
                                                        paddingLeft: -3,
                                                        paddingRight: 1,
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A`
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "Pending2") ? "text" : "text"}
                                                label={products.Driver2 ? products.Driver2.split(":")[1]?.split(" ")[0] : ""}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold", mt: 0.5 } }}
                                                value={
                                                    isFieldFocused(index, "Pending2")
                                                        ? ((s.Pending2 === 0 || s.Pending2 === undefined) ? "" : s.Pending2)
                                                        : Number(s.Pending2 || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "Pending2")}
                                                onBlur={(e) => handleBlur(index, "Pending2", e)}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "Pending2", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "Pending2", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.Pending2).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending2", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "Pending2", current - 1000);
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
                                                            marginLeft: isFieldFocused(index, "Pending2") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',
                                                                    width: 5,
                                                                    height: 18,
                                                                    ml: -1,
                                                                    opacity: 0.6
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending2).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) - 1000;

                                                                    handleChangeWithCheck(index, "Pending2", newValue);
                                                                }}
                                                            >
                                                                <ArrowLeftIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    p: '0px',
                                                                    width: 5,
                                                                    height: 18,
                                                                    mr: -1.5,
                                                                    opacity: 0.6
                                                                }}
                                                                onClick={() => {
                                                                    let raw = String(s.Pending2).replace(/,/g, "");
                                                                    if (raw === "" || raw === "-") raw = "0";

                                                                    const newValue = Number(raw) + 1000;

                                                                    handleChangeWithCheck(index, "Pending2", newValue);
                                                                }}
                                                            >
                                                                <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        textAlign: "right",
                                                        mr: -0.5,
                                                        ml: -0.5,
                                                        pr: 0.5,
                                                        paddingLeft: -3,
                                                        paddingRight: 1,
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "center", backgroundColor: s.Color
                                            ? `${s.Color}4A`
                                            : `${s.Color}4A`,
                                        borderBottom: "2px solid white",
                                        padding: 0.5
                                    }}>
                                        <Paper sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type={isFieldFocused(index, "EstimateSell") ? "text" : "text"}
                                                // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                value={
                                                    isFieldFocused(index, "EstimateSell")
                                                        ? ((s.EstimateSell === 0 || s.EstimateSell === undefined) ? "" : s.EstimateSell)
                                                        : Number(s.EstimateSell || 0).toLocaleString()
                                                }
                                                onFocus={() => handleFocus(index, "EstimateSell")}
                                                onBlur={(e) => handleBlur(index, "EstimateSell", e)}
                                                onChange={(e) => {
                                                    let raw = e.target.value.replace(/,/g, "");

                                                    // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                    if (raw === "-" || raw === "") {
                                                        handleProductChange(index, "EstimateSell", raw);
                                                        return;
                                                    }

                                                    // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                    if (/^-?\d+$/.test(raw)) {
                                                        handleProductChange(index, "EstimateSell", Number(raw));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    let raw = String(s.EstimateSell).replace(/,/g, "");

                                                    // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                    if (raw === "" || raw === "-") raw = "0";

                                                    let current = Number(raw);

                                                    if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "EstimateSell", current + 1000);
                                                    }

                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        handleProductChange(index, "EstimateSell", current - 1000);
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
                                                            marginLeft: isFieldFocused(index, "EstimateSell") ? 1 : 0,
                                                            marginRight: -0.5
                                                        }
                                                    },
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: 25 },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        textAlign: "right",
                                                        mr: -0.5,
                                                        ml: -0.5,
                                                        pr: 0.5,
                                                        paddingLeft: -3,
                                                        paddingRight: 2,
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            textAlign: "right",
                                            borderBottom: "2px solid white",
                                            backgroundColor: "#92CDDC",
                                            color: s.PeriodDisplay < 0 ? "#d50000" : "black",
                                            fontWeight: "bold",
                                            paddingLeft: "30px !important",
                                            paddingRight: "30px !important",
                                            fontVariantNumeric: "tabular-nums"
                                        }}
                                    >
                                        {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(s.PeriodDisplay)}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            textAlign: "right",
                                            borderBottom: "2px solid white",
                                            backgroundColor: "#a5d6a7",
                                            color: Number(downHoleByProduct[s.ProductName]) < 0 ? "#d50000" : "black",
                                            fontWeight: "bold",
                                            paddingLeft: "30px !important",
                                            paddingRight: "30px !important",
                                            fontVariantNumeric: "tabular-nums"
                                        }}
                                    >
                                        {isFirst ? new Intl.NumberFormat("en-US").format(downHoleByProduct[s.ProductName]) ?? "" : ""}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "right",
                                        backgroundColor: s.Color
                                            ? `${s.Color}4A`
                                            : `${s.Color}4A`, color: s.YesterDay < 0 ? "#d50000" : "black",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "30px !important",
                                        paddingRight: "30px !important",
                                        fontVariantNumeric: "tabular-nums"
                                    }}>
                                        {new Intl.NumberFormat("en-US").format(Math.round(s.YesterDay || 0))}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "right",
                                        backgroundColor: s.Color
                                            ? `${s.Color}4A`
                                            : `${s.Color}4A`, color: s.Sell < 0 ? "#d50000" : "black",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "30px !important",
                                        paddingRight: "30px !important",
                                        fontVariantNumeric: "tabular-nums"
                                    }}>
                                        {new Intl.NumberFormat("en-US").format(Math.round(s.Sell || 0))}
                                    </TableCell>
                                    {
                                        products?.Products?.some(p => p.Backyard === true) &&
                                        <React.Fragment>
                                            <TableCell sx={{
                                                textAlign: "center",
                                                backgroundColor:
                                                    s.Backyard === false ? "gray" :
                                                        (s.Color
                                                            ? `${s.Color}4A`
                                                            : `${s.Color}4A`
                                                        ),
                                                borderBottom: "2px solid white",
                                                padding: 0.5,
                                            }}>
                                                {
                                                    s.Backyard === true &&
                                                    <Paper sx={{ width: "100%" }}>
                                                        <TextField
                                                            size="small"
                                                            type={isFieldFocused(index, "BackyardSales") ? "text" : "text"}
                                                            // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                            InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                            style={{ display: isFirst ? "" : "none" }}
                                                            value={
                                                                isFieldFocused(index, "BackyardSales")
                                                                    ? ((s.BackyardSales === 0 || s.BackyardSales === undefined) ? "" : s.BackyardSales)
                                                                    : Number(s.BackyardSales || 0).toLocaleString()
                                                            }
                                                            onFocus={() => handleFocus(index, "BackyardSales")}
                                                            onBlur={(e) => handleBlur(index, "BackyardSales", e)}
                                                            onChange={(e) => {
                                                                let raw = e.target.value.replace(/,/g, "");

                                                                // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                                if (raw === "-" || raw === "") {
                                                                    handleProductChange(index, "BackyardSales", raw);
                                                                    return;
                                                                }

                                                                // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                                if (/^-?\d+$/.test(raw)) {
                                                                    handleProductChange(index, "BackyardSales", Number(raw));
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                let raw = String(s.BackyardSales).replace(/,/g, "");

                                                                // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                                if (raw === "" || raw === "-") raw = "0";

                                                                let current = Number(raw);

                                                                if (e.key === "ArrowUp") {
                                                                    e.preventDefault();
                                                                    handleProductChange(index, "BackyardSales", current + 1000);
                                                                }

                                                                if (e.key === "ArrowDown") {
                                                                    e.preventDefault();
                                                                    handleProductChange(index, "BackyardSales", current - 1000);
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
                                                                        marginLeft: isFieldFocused(index, "BackyardSales") ? 1 : 0,
                                                                        marginRight: -0.5
                                                                    }
                                                                },
                                                            }}
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: 25 },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: 12,
                                                                    fontWeight: "bold",
                                                                    textAlign: "right",
                                                                    mr: -0.5,
                                                                    ml: -0.5,
                                                                    pr: 0.5,
                                                                    paddingLeft: -3,
                                                                    paddingRight: 2,
                                                                },
                                                            }}
                                                        />
                                                    </Paper>
                                                }
                                            </TableCell>
                                            <TableCell sx={{
                                                textAlign: "right",
                                                backgroundColor:
                                                    (s.Color
                                                        ? `${s.Color}4A`
                                                        : `${s.Color}4A`
                                                    ),
                                                color: s.Sell < 0 ? "#d50000" : "black",
                                                fontWeight: "bold",
                                                borderBottom: "2px solid white",
                                                paddingLeft: "30px !important",
                                                paddingRight: "30px !important",
                                                fontVariantNumeric: "tabular-nums"
                                            }}>
                                                {
                                                    new Intl.NumberFormat("en-US").format(
                                                        (Number(s.Sell ?? 0) - Number(s.BackyardSales ?? 0))
                                                    )
                                                }
                                            </TableCell>
                                        </React.Fragment>
                                    }
                                    {
                                        (() => {
                                            const stockHasChanged =
                                                check ||
                                                volumeData?.some(
                                                    v => v.stockID === products?.stockID && v.hasChanged
                                                );

                                            if (stockCount === 2) {
                                                if (!isFirstPump && index === 1 && stockHasChanged) {
                                                    return (
                                                        <TableCell rowSpan={products?.Products.filter(Boolean).length}>
                                                            <Paper
                                                                sx={{
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    borderRadius: 2,
                                                                    backgroundColor: theme.palette.success.main
                                                                }}
                                                            >
                                                                <Button
                                                                    color="inherit"
                                                                    fullWidth
                                                                    onClick={() => {
                                                                        const stockProducts = volumeData.filter(
                                                                            v => v.stockID === products?.stockID
                                                                        );
                                                                        handleSave(stockProducts);
                                                                    }}
                                                                    sx={{ flexDirection: "column", gap: 0.5 }}
                                                                >
                                                                    <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                                                    <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                                        บันทึก
                                                                    </Typography>
                                                                </Button>
                                                            </Paper>
                                                        </TableCell>
                                                    );
                                                }

                                                // แสดงยอดรวมเฉพาะแถวแรก
                                                if (isFirstPump) {
                                                    return (
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "right",
                                                                borderBottom: "2px solid white",
                                                                backgroundColor: "#e1eaf0ff",
                                                                color:
                                                                    totaldownHoleByProduct[s.ProductName] < 0
                                                                        ? "#d50000"
                                                                        : "black",
                                                                fontWeight: "bold",
                                                                paddingLeft: "30px !important",
                                                                paddingRight: "30px !important",
                                                                fontVariantNumeric: "tabular-nums"
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            }).format(totaldownHoleByProduct[s.ProductName])}
                                                        </TableCell>
                                                    );
                                                }

                                                return null;
                                            }

                                            if (isFirstPump && index === 0) {
                                                if (stockHasChanged) {
                                                    return (
                                                        <TableCell rowSpan={products?.Products.filter(Boolean).length}>
                                                            <Paper
                                                                sx={{
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    borderRadius: 2,
                                                                    backgroundColor: theme.palette.success.main
                                                                }}
                                                            >
                                                                <Button
                                                                    color="inherit"
                                                                    fullWidth
                                                                    onClick={() => {
                                                                        const stockProducts = volumeData.filter(
                                                                            v => v.stockID === products?.stockID
                                                                        );
                                                                        handleSave(stockProducts);
                                                                    }}
                                                                    sx={{ flexDirection: "column", gap: 0.5 }}
                                                                >
                                                                    <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                                                    <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                                        บันทึก
                                                                    </Typography>
                                                                </Button>
                                                            </Paper>
                                                        </TableCell>
                                                    );
                                                }

                                                return null;
                                            }

                                            return null;
                                        })()
                                    }
                                </TableRow>
                            ))
                        }
                        <TableRow>
                            <TableCell colSpan={11} sx={{ textAlign: "right", backgroundColor: "#eeeeee" }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>รวม</Typography>
                            </TableCell>
                            <TableCell sx={{
                                textAlign: "right",
                                fontWeight: "bold",
                                borderBottom: "2px solid white",
                                paddingLeft: "30px !important",
                                paddingRight: "30px !important",
                                fontVariantNumeric: "tabular-nums",
                                backgroundColor: "#eeeeee"
                            }}>
                                {
                                    new Intl.NumberFormat("en-US").format(Math.round(
                                        products?.Products?.reduce((sum, item) => {
                                            return sum + Number(item.Sell ?? 0);
                                        }, 0)
                                    ))
                                }
                            </TableCell>
                            {
                                products?.Products?.some(p => p.Backyard === true) &&
                                <React.Fragment>
                                    <TableCell
                                        sx={{
                                            textAlign: "right",
                                            fontWeight: "bold",
                                            borderBottom: "2px solid white",
                                            paddingLeft: "30px !important",
                                            paddingRight: "30px !important",
                                            fontVariantNumeric: "tabular-nums",
                                            backgroundColor: "#eeeeee"
                                        }}>
                                        {
                                            new Intl.NumberFormat("en-US").format(Math.round(
                                                products?.Products?.reduce((sum, item) => {
                                                    return sum + Number(item.BackyardSales ?? 0);
                                                }, 0)
                                            ))
                                        }
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        borderBottom: "2px solid white",
                                        paddingLeft: "30px !important",
                                        paddingRight: "30px !important",
                                        fontVariantNumeric: "tabular-nums",
                                        backgroundColor: "#eeeeee"
                                    }}>
                                        {new Intl.NumberFormat("en-US").format(
                                            Math.round(products?.Products?.reduce((sum, s) =>
                                                sum + ((Number(s.Sell) || 0) - (Number(s.BackyardSales) || 0)), 0))
                                        )}
                                    </TableCell>
                                </React.Fragment>
                            }
                            {
                                isFirstPump &&
                                (
                                    stockCount === 2 && (
                                        <TableCell sx={{
                                            textAlign: "right",
                                            fontWeight: "bold",
                                            borderBottom: "2px solid white",
                                            paddingLeft: "30px !important",
                                            paddingRight: "30px !important",
                                            fontVariantNumeric: "tabular-nums",
                                            backgroundColor: "#eeeeee"
                                        }}>
                                        </TableCell>
                                    )
                                )
                            }
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {
                gasStation?.CheckTruck &&
                <Box sx={{ display: "flex", justifyContent: "left", alignItems: "start", marginTop: -2, marginBottom: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                onClick={() => {
                                    const trucksAtDate = [{ id: 0, Truck: "", Price: "", Volume: "" }];

                                    if (checkTruck === gasStation?.id) {
                                        setCheckTruck(false);
                                        setShowTruckFromClick(false); // กลับไปเป็นค่าเริ่มต้น
                                        setLocalTruck([]);
                                        onProductChange(gasStation.id, [], "Truck");
                                    } else {
                                        setCheckTruck(gasStation?.id);
                                        setShowTruckFromClick(true); // บอกว่า toggle จาก onclick
                                        setLocalTruck(trucksAtDate);
                                        onProductChange(gasStation.id, trucksAtDate, "Truck");
                                    }
                                }}
                                checked={checkTruck === gasStation?.id}
                            />
                        }
                        label="เพิ่มทะเบียนรถ"
                    />

                    {checkTruck === gasStation?.id && (
                        <TableContainer
                            component={Paper}
                            style={{ maxHeight: "30vh" }}
                            sx={{ width: "70%", marginTop: 1.5 }}
                        >
                            <Table stickyHeader size="small" sx={{ width: "100%" }}>
                                <TableHead>
                                    <TableRow>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 14, width: 60, whiteSpace: "nowrap" }}>
                                            ลำดับ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 14, width: 350, whiteSpace: "nowrap" }}>
                                            รถเล็ก
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 14, width: 150, whiteSpace: "nowrap" }}>
                                            คงเหลือบนรถ
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 14, width: 150, whiteSpace: "nowrap" }}>
                                            รับเพิ่ม
                                        </TablecellTickets>
                                        <TablecellTickets sx={{ textAlign: "center", fontSize: 14, width: 150, whiteSpace: "nowrap" }}>
                                            รวม
                                        </TablecellTickets>
                                        <TableCell sx={{ textAlign: "center", fontSize: 14, width: 80, whiteSpace: "nowrap" }}>

                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {localTruck &&
                                        localTruck.map((tr, index) => (
                                            <TableRow key={tr.id} sx={{ height: "20px" }}>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: "bold",
                                                        borderBottom: "2px solid white",
                                                    }}
                                                >
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: "bold",
                                                        borderBottom: "2px solid white",
                                                        paddingLeft: 0.5,
                                                        paddingRight: 0.5,
                                                    }}
                                                >
                                                    <Paper sx={{ width: "100%" }}>
                                                        <TextField
                                                            size="small"
                                                            type={"text"}
                                                            value={tr.Truck}
                                                            // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                            InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                            onChange={(e) => handleChange(index, "Truck", e.target.value)}
                                                            fullWidth
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: 25 },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: 12,
                                                                    fontWeight: "bold",
                                                                    textAlign: "center",
                                                                    mr: -0.5,
                                                                    ml: -0.5,
                                                                    pr: 0.5,
                                                                    paddingLeft: -3,
                                                                    paddingRight: 1,
                                                                },
                                                            }}
                                                        />
                                                    </Paper>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: "bold",
                                                        borderBottom: "2px solid white",
                                                        paddingLeft: 0.5,
                                                        paddingRight: 0.5,
                                                    }}
                                                >
                                                    <Paper sx={{ width: "100%" }}>
                                                        <TextField
                                                            size="small"
                                                            type={"number"}
                                                            value={tr.Price}
                                                            onChange={(e) => handleChange(index, "Price", e.target.value)}
                                                            InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                            fullWidth
                                                            InputProps={{
                                                                inputProps: {
                                                                    min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                                    step: 1000,
                                                                },
                                                            }}
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: 25 },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: 12,
                                                                    fontWeight: "bold",
                                                                    textAlign: "right",
                                                                    mr: -0.5,
                                                                    ml: -0.5,
                                                                    pr: 0.5,
                                                                    paddingLeft: -3,
                                                                    paddingRight: 1,
                                                                },
                                                            }}
                                                        />
                                                    </Paper>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: "bold",
                                                        borderBottom: "2px solid white",
                                                        paddingLeft: 0.5,
                                                        paddingRight: 0.5,
                                                    }}
                                                >
                                                    <Paper sx={{ width: "100%" }}>
                                                        <TextField
                                                            size="small"
                                                            type={"number"}
                                                            value={tr.Volume}
                                                            onChange={(e) => handleChange(index, "Volume", e.target.value)}
                                                            InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                            fullWidth
                                                            InputProps={{
                                                                inputProps: {
                                                                    min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                                    step: 1000,
                                                                },
                                                            }}
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: 25 },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: 12,
                                                                    fontWeight: "bold",
                                                                    textAlign: "right",
                                                                    mr: -0.5,
                                                                    ml: -0.5,
                                                                    pr: 0.5,
                                                                    paddingLeft: -3,
                                                                    paddingRight: 1,
                                                                },
                                                            }}
                                                        />
                                                    </Paper>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: "bold",
                                                        borderBottom: "2px solid white",
                                                    }}
                                                >
                                                    {Number(tr.Price) + Number(tr.Volume)}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        fontWeight: "bold",
                                                        borderBottom: "2px solid white",
                                                    }}
                                                >
                                                    <Box display="flex" justifyContent="right" alignItems="center" marginTop={-1} marginBottom={-1}>
                                                        {
                                                            localTruck.length === (index + 1) && (
                                                                <IconButton color="success" onClick={handleAdd}>
                                                                    <AddCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            )
                                                        }
                                                        {localTruck.length > 1 && (
                                                            <IconButton color="error" onClick={() => handleDelete(index)}>
                                                                <CancelIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            }
        </React.Fragment>

    );
};

export default UpdateGasStations;
