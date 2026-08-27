import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Backdrop,
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
    LinearProgress,
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
import Logo from "../../../theme/img/logoPanda.jpg"
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import { formatThaiSlash } from "../../../theme/DateTH";
import { ShowError, ShowSuccess, ShowWarning } from "../../sweetalert/sweetalert";
import FullPageLoading from "../../navbar/Loading";
import GasStationVolume from "./GasStationVolume";
import theme from "../../../theme/theme";
import { TablecellHeader } from "../../../theme/style";

const GasStationsDetail = (props) => {
    const { gasStation } = props;
    const [open, setOpen] = useState("แม่โจ้");
    const [openTab, setOpenTab] = React.useState(true);
    const [checkStock, setCheckStock] = useState("ทั้งหมด");
    const [check, setCheck] = useState(false);
    const [saving, setSaving] = useState(false);

    const onCheck = (newvalue) => {
        setCheck(newvalue);
    }

    const [selectedDate, setSelectedDate] = useState(dayjs()); // ใช้วันปัจจุบัน

    const handleDateChange = (newValue) => {
        if (newValue) {
            setSelectedDate(dayjs(newValue));
        }
    };

    const [downHole, setDownHole] = React.useState([]);
    const total = downHole.reduce((sum, value) => sum + value.DownHole, 0); // บวกค่า DownHole จากทุก item ใน array

    const { gasstationDetail, stockDetail } = useGasStationData();
    const gasStationOil = Object.values(gasstationDetail || {});
    const stocks = Object.values(stockDetail || {});
    console.log("gasstation Oil : ", gasStationOil);

    const customOrder = ["G95", "B95", "B7", "B7(1)", "B7(2)", "G91", "E20", "PWD"];

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

    // const recomputeProduct = (p) => {
    //     const Period = calculatePeriod(p);
    //     const Sell = calculateSell(p);
    //     const TotalVolume = calculateTotalVolume(p);

    //     return {
    //         ...p,
    //         Period,
    //         Sell,
    //         TotalVolume,
    //         PeriodDisplay:
    //             parseFloat(Period) ||
    //             (parseFloat(p.Volume) - parseFloat(p.Squeeze)),
    //     };
    // };

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

    const calculateDownHole = (row) => {
        const Pending3 = parseFloat(row.Pending3) || 0;
        const Pending1 = parseFloat(row.Pending1) || 0;
        const Pending2 = parseFloat(row.Pending2) || 0;
        const downHole = parseFloat(row.DownHole) || 0;
        const volume = parseFloat(row.Volume) || 0;

        return ((volume + Pending3 + Pending1 + Pending2)).toFixed(2);
    };

    const calculateStockDownHole = (stockId) => {
        const stations = gasStationOil.filter(r => Number(r.Stock.split(":")[0]) === stockId);
        const grouped = {};

        stations.forEach(station => {
            // ✅ ดึง products ให้ถูกต้อง และแปลงเป็น array จริง
            const data = stationReports.find((r) => r.stationId === station.id);

            let products = [];

            if (Array.isArray(data)) {
                products = data;
            } else if (data?.Products) {
                products = Array.isArray(data.Products)
                    ? data.Products
                    : Object.values(data.Products);
            } else if (typeof data === "object" && data !== null) {
                products = Object.values(data); // เผื่อเป็น object index
            }

            if (!Array.isArray(products)) return; // กันพลาด

            products.forEach(p => {
                const total = (parseFloat(p.Volume) || 0) +
                    (parseFloat(p.Pending1) || 0) +
                    (parseFloat(p.Pending2) || 0) +
                    (parseFloat(p.Pending3) || 0);

                if (!grouped[p.ProductName]) {
                    grouped[p.ProductName] = {
                        sum: 0,
                        capacity: parseFloat(p.Capacity) || 0
                    };
                }
                grouped[p.ProductName].sum += total;
            });
        });

        const result = {};
        Object.keys(grouped).forEach(name => {
            result[name] = grouped[name].capacity - grouped[name].sum;
        });

        return result;
    };

    const calculateTotalDownHole = (stockId) => {
        const stations = gasStationOil.filter(r => Number(r.Stock.split(":")[0]) === stockId);

        const grouped = {};

        stations.forEach((station, stationIndex) => {
            const data = stationReports.find(r => r.stationId === station.id);

            let products = [];

            if (Array.isArray(data)) {
                products = data;
            } else if (data?.Products) {
                products = Array.isArray(data.Products)
                    ? data.Products
                    : Object.values(data.Products);
            } else if (typeof data === "object" && data !== null) {
                products = Object.values(data);
            }

            if (!Array.isArray(products)) return;

            products.forEach(p => {
                const name = p.ProductName;

                const volume = parseFloat(p.Volume) || 0;
                const pending = (parseFloat(p.Pending1) || 0) +
                    (parseFloat(p.Pending2) || 0) +
                    (parseFloat(p.Pending3) || 0);
                const estimateSell = parseFloat(p.EstimateSell) || 0;
                const squeeze = parseFloat(p.Squeeze) || 0;

                // เตรียมช่องเก็บข้อมูลของ Product นั้นๆ
                if (!grouped[name]) {
                    grouped[name] = {
                        totalVolume: 0,
                        totalPending: 0,
                        totalEstimateSell: 0,
                        squeeze: 0, // squeeze ใช้เฉพาะของปั๊มแรก
                        squeezeSet: false
                    };
                }

                grouped[name].totalVolume += volume;
                grouped[name].totalPending += pending;
                grouped[name].totalEstimateSell += estimateSell;

                // ใส่ squeeze จากปั๊มแรกเท่านั้น
                if (!grouped[name].squeezeSet && stationIndex === 0) {
                    grouped[name].squeeze = squeeze;
                    grouped[name].squeezeSet = true;
                }
            });
        });

        // สร้างผลลัพธ์ตาม ProductName
        const result = {};

        Object.keys(grouped).forEach(name => {
            const g = grouped[name];

            if (g.totalEstimateSell === 0) {
                result[name] = 0; // กันหาร 0
            } else {
                result[name] = ((g.totalVolume - g.squeeze) + g.totalPending) / g.totalEstimateSell;
            }
        });

        return result;
    };

    // ปลอดภัย: wrapper สำหรับเรียกฟังก์ชันคำนวณ ไม่ให้ throw
    const safeCall = (fn, arg, name) => {
        try {
            return fn(arg);
        } catch (e) {
            console.error(`Error in ${name}:`, e, "arg:", arg);
            return 0;
        }
    };

    const getStationReportsArray = (stocks, gasStationOil, selectedDate, Squeeze = 800) => {
        // console.log("getStationReportsArray start", {
        //     stocksLen: stocks?.length,
        //     gasStationOilLen: gasStationOil?.length,
        //     selectedDate,
        // });

        if (!Array.isArray(gasStationOil) || !gasStationOil.length) {
            console.warn("gasStationOil empty or not array");
            return [];
        }

        const selected = dayjs(selectedDate);

        // ✅ Function หา last report date ของ station
        const getLastReportDate = (reportObj) => {
            if (!reportObj) return null;
            const dates = [];

            Object.keys(reportObj).forEach((y) =>
                Object.keys(reportObj[y]).forEach((m) =>
                    Object.keys(reportObj[y][m]).forEach((d) =>
                        dates.push(dayjs(`${y}-${m}-${d}`, "YYYY-M-D"))
                    )
                )
            );

            // ✅ fix no plugin error
            return dates.length ? dayjs(Math.max(...dates.map(d => d.valueOf()))) : null;
        };

        // ✅ Pre-compute lastDate ของทุก station
        const lastDateMap = new Map();
        gasStationOil.forEach((st) => {
            lastDateMap.set(st.id, getLastReportDate(st.Report));
        });

        const firstStationOfStock = new Set();

        return gasStationOil.map((station, stationIndex) => {
            // console.log(`--- stationIndex ${stationIndex} id:${station?.id} Stock:${station?.Stock}`);

            const stockId = Number((station?.Stock || "").toString().split(":")[0]);
            const stock = stocks.find((s) => s.id === stockId);

            const isFirst = !firstStationOfStock.has(stockId);
            if (isFirst) firstStationOfStock.add(stockId);

            // ✅ LastDate ของ station นี้
            const lastDate = lastDateMap.get(station.id);

            // ✅ RefDate สำหรับ Squeeze/EstimateSell
            // ถ้า selected > lastDate → ใช้ lastDate
            // else → ใช้เมื่อวาน
            const squeezeRefDate =
                lastDate && selected.isAfter(lastDate)
                    ? lastDate
                    : selected.subtract(1, "day");

            // ✅ Volume ต้องใช้ "เมื่อวาน" เสมอ
            const volumeRefDate = selected.subtract(1, "day");

            const vY = volumeRefDate.format("YYYY");
            const vM = volumeRefDate.format("M");
            const vD = volumeRefDate.format("D");
            const reportForVolume = station?.Report?.[vY]?.[vM]?.[vD];

            const rY = squeezeRefDate.format("YYYY");
            const rM = squeezeRefDate.format("M");
            const rD = squeezeRefDate.format("D");
            const reportForRef = station?.Report?.[rY]?.[rM]?.[rD];

            const y = selected.format("YYYY");
            const m = selected.format("M");
            const d = selected.format("D");
            const reportForDate = station?.Report?.[y]?.[m]?.[d];

            // ✅ ถ้ามี report ของวันที่เลือก
            if (reportForDate) {
                if (reportForVolume && Array.isArray(reportForDate.Products)) {
                    reportForDate.Products = reportForDate.Products.map((todayItem) => {
                        const yesterdayItem = reportForVolume.Products?.find(
                            (p) => p.ProductName === todayItem.ProductName
                        );

                        const parseNum = (val) =>
                            Number(String(val || 0).replace(/,/g, "").trim()) || 0;

                        if (yesterdayItem) {
                            const prevVol = parseNum(yesterdayItem.Volume + yesterdayItem.Pending3);
                            const todayVol = parseNum(todayItem.Volume);
                            const todayYsd = parseNum(todayItem.YesterDay);

                            let newYesterDay = todayYsd;
                            let newSell = parseNum(todayItem.Sell);

                            if (todayYsd !== prevVol) {
                                newYesterDay = prevVol;
                                newSell = prevVol - todayVol;
                            }

                            return {
                                ...todayItem,
                                YesterDay: newYesterDay,
                                Sell: newSell,
                            };
                        }
                        return todayItem;
                    });
                }

                // ✅ เพิ่ม Backyard ให้ทุก Product จาก station.Products
                reportForDate.Products = reportForDate.Products.map((prod) => {
                    const base = station?.Products?.find(
                        (p) => p.Name === prod.ProductName
                    );

                    return {
                        ...prod,
                        Backyard: base?.Backyard ?? false, // 👈 เพิ่มที่นี่
                    };
                });

                return reportForDate;
            }

            // ✅ fallback products
            let fallbackProducts = [];
            if (Array.isArray(station?.Products) && station.Products.length)
                fallbackProducts = station.Products;
            else if (Array.isArray(stock?.Products) && stock.Products.length)
                fallbackProducts = stock.Products;
            else if (station?.Products && typeof station.Products === "object")
                fallbackProducts = Object.values(station.Products);
            else if (stock?.Products && typeof stock.Products === "object")
                fallbackProducts = Object.values(stock.Products);

            if (!Array.isArray(fallbackProducts))
                fallbackProducts = Array.from(fallbackProducts || []);

            if (!fallbackProducts.length) {
                return {
                    Date: selected.format("DD/MM/YYYY"),
                    Products: [],
                    Driver1: "",
                    Driver2: "",
                    stationId: station.id,
                };
            }

            console.log("stock.Products : ", stock.Products);
            console.log("station.Products : ", station.Products);
            console.log("fallbackProducts : ", fallbackProducts);

            const defaultProducts = fallbackProducts
                .map((p) => {
                    let volYesterday = 0;
                    let prevSqueeze = 0;
                    let prevEstimateSell = 0;

                    // ✅ ดึง Volume จากเมื่อวานเสมอ
                    if (reportForVolume?.Products) {
                        const v = reportForVolume.Products.find(
                            (item) => item.ProductName === p?.Name
                        );
                        volYesterday = Number(v?.Volume ?? 0) + Number(v?.Pending3 ?? 0);
                    }

                    // ✅ ดึง Squeeze, EstimateSell จาก ref (ล่าสุด หรือ เมื่อวาน)
                    if (reportForRef?.Products) {
                        const r = reportForRef.Products.find(
                            (item) => item.ProductName === p?.Name
                        );
                        prevSqueeze = Number(r?.Squeeze ?? 0);
                        prevEstimateSell = Number(r?.EstimateSell ?? 0);
                    }

                    const row = {
                        ProductName: (p?.Name ?? "").toString(),
                        Capacity: Number(p?.Capacity) || 0,
                        Color: p?.Color ?? "",
                        FullVolume: Number(p?.FullVolume) || 0,
                        Volume: Number(p?.Volume) || 0,

                        // ✅ Logic ใหม่
                        Squeeze: isFirst ? (prevSqueeze || Squeeze || 0) : 0,
                        EstimateSell: prevEstimateSell || 0,

                        Delivered: Number(p?.Delivered) || 0,
                        Pending1: Number(p?.Pending1) || 0,
                        Pending2: Number(p?.Pending2) || 0,
                        Pending3: Number(p?.Pending3) || 0,
                        Period: 0,
                        DownHole: Number(p?.DownHole) || 0,

                        Backyard: p?.Backyard ?? false,   // 👈 เพิ่มตรงนี้

                        // ✅ Volume ของเมื่อวาน
                        YesterDay: volYesterday,
                        Sell: volYesterday - Number(p?.Volume),
                        TotalVolume: 0,
                        OilBalance: 0,
                        Difference: 0,
                    };

                    const Period = safeCall(calculatePeriod, row, "calculatePeriod");
                    const TotalVolume = safeCall(calculateTotalVolume, row, "calculateTotalVolume");

                    return {
                        ...row,
                        Period,
                        TotalVolume,
                        PeriodDisplay: Period || row.Volume - row.Squeeze,
                        DownHoleDisplay: row.Capacity - Math.round(row.DownHole || 0),
                    };
                })
                .sort((a, b) => {
                    const ai = customOrder.indexOf(a.ProductName);
                    const bi = customOrder.indexOf(b.ProductName);
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                });

            return {
                Date: selected.format("DD/MM/YYYY"),
                Products: defaultProducts,
                Driver1: "",
                Driver2: "",
                stockID: stock?.id,
                stockName: stock?.Name,
                stationId: station.id,
            };
        });
    };

    const STORAGE_KEY = "stationReports";
    const [stationReports, setStationReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // ใช้ useMemo ให้ reference ของ stocks/gasStationOil คงที่
    const memoStocks = useMemo(() => stocks, [JSON.stringify(stocks)]);
    const memoGasStationOil = useMemo(() => gasStationOil, [JSON.stringify(gasStationOil)]);

    // --- ฟังก์ชันเตรียมข้อมูล ---
    const DEFAULT_TRUCK = [{ id: 0, Truck: "", Price: "", Volume: "" }];

    const prepareData = (data) => {
        return data.map(st => ({
            ...st,
            Products: st.Products || [],
            Truck: st.Truck && st.Truck.length > 0
                ? st.Truck.map(t => ({
                    id: t.id ?? 0,
                    Truck: t.Truck ?? "",
                    Price: t.Price ?? "",
                    Volume: t.Volume ?? "",
                }))
                : DEFAULT_TRUCK,
            // ⭐ ให้ค่าเริ่มต้นตรงนี้
            originalProducts: JSON.parse(JSON.stringify(st.Products || [])),
            originalTruck: JSON.parse(JSON.stringify(
                st.Truck && st.Truck.length > 0
                    ? st.Truck.map(t => ({
                        id: t.id ?? 0,
                        Truck: t.Truck ?? "",
                        Price: t.Price ?? "",
                        Volume: t.Volume ?? "",
                    }))
                    : DEFAULT_TRUCK
            )),
            hasChanged: false,
        }));
    };

    const findYesterdayTruck = (report, selectedDate) => {
        const prev = dayjs(selectedDate).subtract(1, "day");

        const y = prev.year();
        const m = prev.month() + 1;
        const d = prev.date();

        return report?.[y]?.[m]?.[d]?.Truck ?? [];
    };

    const getYesterdayTotal = (todayTruck, yesterdayTruck) => {
        if (!Array.isArray(yesterdayTruck)) return 0;

        const match = yesterdayTruck.find(
            yt => yt.Truck === todayTruck.Truck
        );

        if (!match) return 0;

        return Number(match.Price || 0) + Number(match.Volume || 0);
    };

    const isEmptyValue = v =>
        v === undefined || v === null || Number(v) === 0;

    // --- โหลดข้อมูลเมื่อ selectedDate หรือ stocks/gasStationOil พร้อม ---
    useEffect(() => {
        if (!Array.isArray(memoStocks) || memoStocks.length === 0) return;
        if (!Array.isArray(memoGasStationOil) || memoGasStationOil.length === 0) return;

        setLoading(true);

        const formattedDate = selectedDate.format("DD/MM/YYYY");

        // ดึงข้อมูลเก่าจาก localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        let oldData = null;
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === formattedDate) oldData = parsed.data;
        }

        const rawData = getStationReportsArray(
            memoStocks,
            memoGasStationOil,
            selectedDate,
            800
        );

        const prepared = prepareData(rawData);

        const y = selectedDate.year();
        const m = selectedDate.month() + 1;
        const d = selectedDate.date();

        const hasValidTruck = (truckArray) => {
            if (!Array.isArray(truckArray) || truckArray.length === 0) return false;

            return truckArray.some(t =>
                typeof t?.Truck === "string" && t.Truck.trim() !== ""
            );
        };

        // หาค่า Truck ล่าสุดที่มีข้อมูลจริงก่อน selectedDate
        const findLatestValidTruck = (report, selectedDate) => {
            if (!report) return [];

            let latest = [];

            for (const yr of Object.keys(report).sort((a, b) => b - a)) {
                for (const mon of Object.keys(report[yr]).sort((a, b) => b - a)) {
                    for (const day of Object.keys(report[yr][mon]).sort((a, b) => b - a)) {

                        const currDate = dayjs(`${day}/${mon}/${yr}`, "D/M/YYYY");
                        if (currDate.isSameOrAfter(selectedDate, "day")) continue;

                        const truckArray = report[yr][mon][day]?.Truck ?? [];
                        if (!hasValidTruck(truckArray)) continue;

                        // ✅ ใช้ Price + Volume ของวันล่าสุดจริง
                        latest = truckArray.map((t, idx) => ({
                            id: idx,
                            Truck: t.Truck ?? "",
                            Price: Number(t.Price || 0) + Number(t.Volume || 0),
                            Volume: 0
                        }));

                        return latest; // 👈 เจอวันล่าสุดแล้ว หยุดทันที
                    }
                }
            }

            return [];
        };

        const merged = prepared.map((station, index) => {
            const st = memoGasStationOil[index];

            const reportToday = st?.Report?.[y]?.[m]?.[d];
            const todayTruck = reportToday?.Truck ?? [];

            let finalTruck = [];

            console.log("todayTruck : ", todayTruck);
            console.log("hasValidTruck(todayTruck) : ", hasValidTruck(todayTruck));

            if (hasValidTruck(todayTruck)) {
                const yesterdayTruck = findYesterdayTruck(st?.Report, selectedDate);

                finalTruck = todayTruck.map((t, idx) => {
                    const yesterdayTotal = getYesterdayTotal(t, yesterdayTruck);

                    return {
                        id: idx,
                        Truck: t.Truck ?? "",
                        Price: isEmptyValue(t.Price) ? yesterdayTotal : Number(t.Price),
                        Volume: Number(t.Volume) || 0
                    };
                });
            } else {
                const latestTruck = findLatestValidTruck(st?.Report, selectedDate);

                finalTruck = latestTruck.length > 0
                    ? latestTruck
                    : DEFAULT_TRUCK.map((t, idx) => ({
                        ...t,
                        id: idx,
                        Price: 0,
                        Volume: 0
                    }));
            }

            // 🔥 สำคัญที่สุดตรงนี้
            const cleanProducts = structuredClone(station.Products ?? []);
            const cleanTruck = structuredClone(finalTruck);

            return {
                ...station,

                Products: cleanProducts,
                originalProducts: structuredClone(cleanProducts),

                Truck: cleanTruck,
                originalTruck: structuredClone(cleanTruck),

                hasChanged: false
            };
        });


        setStationReports(merged);

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date: formattedDate,
            data: merged
        }));

        setLoading(false);

    }, [selectedDate, memoStocks, memoGasStationOil]);

    console.log("station report : ", stationReports);

    // field ที่ถือว่ามีผลต่อการเปลี่ยนแปลง
    // เทียบ product ทุก field ที่สำคัญ

    // เทียบ Truck แบบไม่ใช้ JSON.stringify

    const PRODUCT_FIELDS = [
        "FullVolume",
        "Volume",
        "Squeeze",
        "Pending1",
        "Pending2",
        "Pending3",
        "EstimateSell",
        "BackyardSales"
    ];

    // ตรวจว่า product เปลี่ยนจริงไหม (เทียบกับ original)
    const isProductChanged = (original, current) => {
        return PRODUCT_FIELDS.some(f =>
            String(original?.[f] ?? "") !== String(current?.[f] ?? "")
        );
    };

    const isTruckChanged = (orig = [], curr = []) => {
        if (orig.length !== curr.length) return true;

        return curr.some((t, i) =>
            ["Truck", "Price", "Volume"].some(
                f => String(orig[i]?.[f] ?? "") !== String(t[f] ?? "")
            )
        );
    };

    // recompute ทุกค่าที่คำนวณ
    const recomputeProduct = (p) => {
        const cloned = structuredClone(p);

        cloned.Period = calculatePeriod(cloned);
        cloned.Sell = calculateSell(cloned);
        cloned.TotalVolume = calculateTotalVolume(cloned);
        cloned.PeriodDisplay =
            parseFloat(cloned.Period) ||
            (parseFloat(cloned.Volume) - parseFloat(cloned.Squeeze));

        return cloned;
    };

    // --- ฟังก์ชันแก้ไขข้อมูลแต่ละ station ---
    const handleProductChange = (stationId, products, fieldOrType) => {
        setStationReports(prev => {
            const target = prev.find(s => s.stationId === stationId);
            if (!target) return prev;

            const stockID = target.stockID;

            // ---------------------------------------------------
            // 1️⃣ update station ที่ถูกแก้
            // ---------------------------------------------------
            let updated = prev.map(s => {
                if (s.stationId !== stationId) return s;

                if (fieldOrType === "Driver0" || fieldOrType === "Driver1" || fieldOrType === "Driver2") {
                    return { ...s, [fieldOrType]: products };
                }

                if (fieldOrType === "Products") {
                    return { ...s, Products: products };
                }

                if (fieldOrType === "Truck") {
                    return { ...s, Truck: products };
                }

                return s;
            });

            // ---------------------------------------------------
            // 2️⃣ sync Volume + recompute (เฉพาะ stock ที่มี 2 ปั้ม)
            // ---------------------------------------------------
            const sameStock = updated.filter(s => s.stockID === stockID);

            if (sameStock.length === 2) {
                const [a, b] = sameStock;

                const editedIsA = a.stationId === stationId;
                const editedIsB = b.stationId === stationId;

                const syncedA = structuredClone(a.Products);
                const syncedB = structuredClone(b.Products);

                syncedA.forEach((pA, idx) => {
                    const bIdx = syncedB.findIndex(
                        p => p.ProductName === pA.ProductName
                    );
                    if (bIdx === -1) return;

                    const pB = syncedB[bIdx];

                    const full = Number(pA.FullVolume ?? pB.FullVolume ?? 0);

                    // ✅ ถ้าแก้ปั้ม A → คำนวณ B
                    if (editedIsA) {
                        pB.Volume = full - Number(pA.Volume || 0);
                    }

                    // ✅ ถ้าแก้ปั้ม B → คำนวณ A
                    if (editedIsB) {
                        pA.Volume = full - Number(pB.Volume || 0);
                    }

                    // 🔄 recompute หลัง Volume ถูก sync
                    syncedA[idx] = recomputeProduct(pA);
                    syncedB[bIdx] = recomputeProduct(pB);
                });

                updated = updated.map(s => {
                    if (s.stationId === a.stationId) {
                        return { ...s, Products: syncedA };
                    }
                    if (s.stationId === b.stationId) {
                        return { ...s, Products: syncedB };
                    }
                    return s;
                });
            }

            // ---------------------------------------------------
            // 3️⃣ ⭐ คำนวณ hasChanged (รองรับทั้ง 1 และ 2 ปั้ม)
            // ---------------------------------------------------
            const stationsInStock = updated.filter(s => s.stockID === stockID);

            // ====== stock มี 1 ปั้ม ======
            if (stationsInStock.length === 1) {
                const s = stationsInStock[0];
                const original = prev.find(p => p.stationId === s.stationId);
                if (!original) return updated;

                const changed =
                    s.Products.some((p, i) =>
                        isProductChanged(original.originalProducts?.[i], p)
                    ) ||
                    isTruckChanged(original.originalTruck, s.Truck);

                updated = updated.map(st =>
                    st.stationId === s.stationId
                        ? { ...st, hasChanged: changed }
                        : st
                );
            }

            // ====== stock มี 2 ปั้ม ======
            if (stationsInStock.length === 2) {
                const [sa, sb] = stationsInStock;

                const originalA = prev.find(p => p.stationId === sa.stationId);
                const originalB = prev.find(p => p.stationId === sb.stationId);
                if (!originalA || !originalB) return updated;

                const changed =
                    sa.Products.some((p, i) =>
                        isProductChanged(originalA.originalProducts?.[i], p)
                    ) ||
                    sb.Products.some((p, i) =>
                        isProductChanged(originalB.originalProducts?.[i], p)
                    ) ||
                    isTruckChanged(originalA.originalTruck, sa.Truck) ||
                    isTruckChanged(originalB.originalTruck, sb.Truck);

                updated = updated.map(s =>
                    s.stockID === stockID
                        ? { ...s, hasChanged: changed }
                        : s
                );
            }

            return updated;
        });
    };

    if (loading) return <FullPageLoading />;

    // ✅ เมื่อกด Save
    // const handleSave = async (stationId, gasStation, products) => {
    //     const year = dayjs(selectedDate).format("YYYY");
    //     const month = dayjs(selectedDate).format("M");
    //     const day = dayjs(selectedDate).format("D");

    //     try {
    //         // 1️⃣ อัปเดตไป Firebase
    //         await database
    //             .ref(`/depot/gasStations/${gasStation.id - 1}/Report/${year}/${month}`)
    //             .child(day)
    //             .update(products);

    //         ShowSuccess("บันทึกข้อมูลสำเร็จ");
    //         console.log("✅ Updated success");

    //         // 2️⃣ รีเซ็ต hasChanged + original ให้ UI update
    //         setStationReports(prev =>
    //             prev.map(s =>
    //                 s.stationId === stationId
    //                     ? {
    //                         ...s,
    //                         hasChanged: false,
    //                         original: JSON.parse(JSON.stringify(s.Products)),
    //                     }
    //                     : s
    //             )
    //         );
    //     } catch (error) {
    //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
    //         console.error("Error updating data:", error);
    //     }
    // };

    const handleSave = async (stockProducts) => {
        const year = dayjs(selectedDate).format("YYYY");
        const month = dayjs(selectedDate).format("M");
        const day = dayjs(selectedDate).format("D");

        setSaving(true);

        try {
            for (const sp of stockProducts) {
                if (!sp.stationId) continue;

                await database
                    .ref(`/depot/gasStations/${Number(sp.stationId) - 1}/Report/${year}/${month}/${day}`)
                    .set(sp);
            }

            ShowSuccess("บันทึกข้อมูลสำเร็จ");

            // ---------------------------------------------------
            // ⭐ reset state หลัง save (สำคัญมาก)
            // ---------------------------------------------------
            setStationReports(prev => {
                const savedStocks = new Set(stockProducts.map(sp => sp.stockID));

                return prev.map(s => {
                    if (!savedStocks.has(s.stockID)) return s;

                    const saved = stockProducts.find(
                        sp => sp.stationId === s.stationId
                    );

                    if (!saved) {
                        return { ...s, hasChanged: false };
                    }

                    const cleanProducts = structuredClone(saved.Products).map(p => {
                        const cp = { ...p };
                        delete cp.hasChanged;
                        return cp;
                    });

                    return {
                        ...s,
                        hasChanged: false,

                        Products: cleanProducts,
                        originalProducts: structuredClone(cleanProducts),

                        Truck: structuredClone(saved.Truck ?? []),
                        originalTruck: structuredClone(saved.Truck ?? []),
                    };
                });
            });

        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // console.log("stocks : ", stocks);
    // console.log("gasStationOil : ", gasStationOil);
    // console.log("stationReports : ", stationReports);

    // console.log("TotaldownHoleByProduct :", calculateTotalDownHole(stocks[0]?.id));

    return (
        <React.Fragment>
            {saving && (
                <Backdrop
                    open={true}
                    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 9999 }}
                >
                    <Box
                        sx={{
                            backgroundColor: "rgba(255, 255, 255, 1)",
                            p: 4,
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2
                        }}
                    >
                        {/* โลโก้อยู่ตรงกลางบน */}
                        <img src={Logo} width="400" style={{ marginBottom: 24 }} />

                        {/* แถบโหลดอยู่ด้านล่างโลโก้ */}
                        <Box sx={{ width: "50%" }}>
                            <LinearProgress
                                variant="indeterminate"
                                sx={{
                                    height: 15,
                                    borderRadius: 5,
                                    backgroundColor: "#eee",
                                    "& .MuiLinearProgress-bar": {
                                        background: `linear-gradient(90deg, black, ${theme.palette.error.main})`,
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Backdrop>
            )}

            <Box
                sx={{
                    p: 1,
                    width: "100%"
                    // height: "70vh"
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={4}>
                        <Paper
                            component="form"
                            sx={{
                                //width: "100%", // กำหนดความกว้างของ Paper
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
                                    onChange={(newValue) => {
                                        // ตรวจสอบว่ามีการแก้ไขค้างอยู่หรือไม่
                                        const hasUnsaved = stationReports.some(st => st.hasChanged);
                                        if (hasUnsaved) {
                                            ShowWarning("กรุณาบันทึกการแก้ไขข้อมูลก่อนเปลี่ยนวันที่!");
                                            return; // ❌ หยุดไม่ให้เปลี่ยนค่า
                                        }

                                        // ถ้าไม่มีการแก้ไขค้าง ให้เปลี่ยน selectedDate ตรง ๆ
                                        if (newValue) {
                                            setSelectedDate(dayjs(newValue, "DD/MM/YYYY"));
                                        }
                                    }}
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
                                    //disabled={isDataUpdated} // 🔹 ปิดการเลือกถ้ามีการเปลี่ยนแปลง
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
                                            onChange={() => {
                                                // ✅ เช็คว่ามี station ไหนถูกแก้
                                                const hasUnsaved = stationReports.some(st => st.hasChanged);
                                                if (hasUnsaved) {
                                                    ShowWarning("กรุณาบันทึกการแก้ไขข้อมูลก่อนเปลี่ยน Stock!");
                                                    return; // ❌ หยุดไม่ให้เปลี่ยนค่า
                                                }

                                                setCheckStock(row.Name); // ✅ ถ้าไม่มี unsaved จะเปลี่ยนค่าได้
                                            }}
                                        //disabled={isDataUpdated} // 🔹 ปิดการเลือกถ้ามีการเปลี่ยนแปลง
                                        />
                                    }
                                    label={row.Name}
                                />
                            ))}
                            {/* {isDataUpdated && (
                                <Typography color="error" sx={{ mt: 1 }}>
                                    ⚠️ กรุณาบันทึกข้อมูลก่อนเปลี่ยนสาขา
                                </Typography>
                            )} */}
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                        {(checkStock === "ทั้งหมด" ? stocks : [stocks.find(s => s.Name === checkStock)]).map((stock, idx) => {
                            const downHoleByProduct = calculateStockDownHole(stock.id);
                            const totalDownHoleByProduct = calculateTotalDownHole(stock.id);
                            let matchCount = 0;

                            return (
                                <Paper
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        border: '2px solid lightgray',
                                        borderRadius: 3,
                                        boxShadow: 1,
                                        //width: "100%",
                                        overflowY: 'auto',
                                    }}
                                    key={stock.id || idx}
                                >
                                    {/* {
                                        gasStationOil.filter((g) => Number(g.Stock.split(":")[0]) === stock.id).length > 1 && (
                                            <Grid container spacing={1} marginBottom={1} pr={1} pl={1}>
                                                <Grid item xl={1.5} md={2} sm={3} xs={4}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontsize: "18px", mt: 1 }}>
                                                        กรอกปริมาณน้ำมัน :
                                                    </Typography>
                                                </Grid>
                                                {
                                                    stock.Products && Array.isArray(stock.Products) && stock.Products.map((product, index) => (
                                                        <Grid item xl={1.5} md={2} sm={3} xs={4}>
                                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", backgroundColor: product.Color, p: 0.5, borderRadius: 1 }}>
                                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ fontWeight: 'bold', mr: 1, fontSize: "18px" }}>{product.ProductName}</Typography>
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        size="small"
                                                                        type={"text"}
                                                                        // type={isFieldFocused(index, "Volume") ? "text" : "text"}
                                                                        // แนะนำใช้ text ตลอด เพราะจัดการ input เอง
                                                                        InputLabelProps={{ sx: { fontSize: 12, fontWeight: "bold" } }}
                                                                        // value={
                                                                        //     isFieldFocused(index, "Volume")
                                                                        //         ? (s.Volume === 0 ? "" : s.Volume)
                                                                        //         : Number(s.Volume || 0).toLocaleString()
                                                                        // }
                                                                        // onFocus={() => handleFocus(index, "Volume")}
                                                                        // onBlur={(e) => handleBlur(index, "Volume", e)} // ส่ง event
                                                                        // onChange={(e) => {
                                                                        //     let raw = e.target.value.replace(/,/g, "");

                                                                        //     // ⭐ อนุญาตให้เริ่มด้วย "-"
                                                                        //     if (raw === "-" || raw === "") {
                                                                        //         handleProductChange(index, "Volume", raw);
                                                                        //         return;
                                                                        //     }

                                                                        //     // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                                                        //     if (/^-?\d+$/.test(raw)) {
                                                                        //         handleProductChange(index, "Volume", Number(raw));
                                                                        //     }
                                                                        // }}
                                                                        // onKeyDown={(e) => {
                                                                        //     let raw = String(s.Volume).replace(/,/g, "");

                                                                        //     // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                                                        //     if (raw === "" || raw === "-") raw = "0";

                                                                        //     let current = Number(raw);

                                                                        //     if (e.key === "ArrowUp") {
                                                                        //         e.preventDefault();
                                                                        //         handleProductChange(index, "Volume", current + 1000);
                                                                        //     }

                                                                        //     if (e.key === "ArrowDown") {
                                                                        //         e.preventDefault();
                                                                        //         handleProductChange(index, "Volume", current - 1000);
                                                                        //     }
                                                                        // }}
                                                                        fullWidth
                                                                        InputProps={{
                                                                            inputProps: {
                                                                                min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                                                                step: 1000,
                                                                            },
                                                                            sx: {
                                                                                "& input::-webkit-inner-spin-button": {
                                                                                    // marginLeft: isFieldFocused(index, "Volume") ? 1 : 0,
                                                                                    marginRight: -0.5
                                                                                }
                                                                            },
                                                                            startAdornment: (
                                                                                <InputAdornment position="start">
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        sx={{
                                                                                            p: '0px',        // 🔹 ตัด padding IconButton
                                                                                            width: 5,
                                                                                            height: 18,
                                                                                            ml: -1,
                                                                                            opacity: 0.6      // 🔹 ลดระยะชิดซ้าย
                                                                                        }}
                                                                                    // onClick={() => {
                                                                                    //     let raw = String(s.Volume).replace(/,/g, "");
                                                                                    //     if (raw === "" || raw === "-") raw = "0";

                                                                                    //     const newValue = Number(raw) - 1000;

                                                                                    //     handleChangeWithCheck(index, "Volume", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                                    // }}
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
                                                                                            p: '0px',        // 🔹 ตัด padding IconButton
                                                                                            width: 5,
                                                                                            height: 18,
                                                                                            mr: -1.5,
                                                                                            opacity: 0.6       // 🔹 ลดระยะชิดซ้าย
                                                                                        }}
                                                                                    // onClick={() => {
                                                                                    //     let raw = String(s.Volume).replace(/,/g, "");
                                                                                    //     if (raw === "" || raw === "-") raw = "0";

                                                                                    //     const newValue = Number(raw) + 1000;

                                                                                    //     handleChangeWithCheck(index, "Volume", newValue); // ✅ ใช้ฟังก์ชันใหม่
                                                                                    // }}
                                                                                    >
                                                                                        <ArrowRightIcon sx={{ fontSize: "25px" }} />
                                                                                    </IconButton>
                                                                                </InputAdornment>
                                                                            ),
                                                                        }}
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": { height: 30 },
                                                                            "& .MuiInputBase-input": {
                                                                                fontSize: 12,
                                                                                fontWeight: "bold",
                                                                                textAlign: "right",
                                                                                mr: -0.5,
                                                                                ml: -0.5,
                                                                                pr: 0.5,
                                                                                paddingLeft: -3, // เพิ่มพื้นที่ให้ endAdornment
                                                                                paddingRight: 1, // เพิ่มพื้นที่ให้ endAdornment
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
                                    } */}
                                    {gasStationOil.map((row, index) => {
                                        if (Number(row.Stock.split(":")[0]) === stock.id) {
                                            const filteredStocks = gasStationOil.filter(r => Number(r.Stock.split(":")[0]) === stock.id);
                                            const stockCount = filteredStocks.length;  // จำนวนปั้มที่ตรงกัน
                                            // ✔ หาลำดับปั้ม (0,1)
                                            const pumpOrder = filteredStocks.findIndex(p => p.id === row.id);
                                            matchCount++;
                                            return (
                                                <React.Fragment key={row.id || index}>
                                                    <GasStationVolume
                                                        key={row.id}
                                                        gasStation={row}
                                                        volumeData={stationReports}
                                                        products={stationReports[index]}
                                                        selectedDate={selectedDate}
                                                        onProductChange={handleProductChange}
                                                        isFirst={matchCount === 1}
                                                        stockCount={stockCount}
                                                    />
                                                    <UpdateGasStations
                                                        key={row.id}
                                                        gasStation={row}
                                                        volumeData={stationReports}
                                                        products={stationReports[index]}
                                                        selectedDate={selectedDate}
                                                        onProductChange={handleProductChange}
                                                        downHoleByProduct={downHoleByProduct}
                                                        totaldownHoleByProduct={totalDownHoleByProduct}
                                                        isFirst={matchCount === 1}
                                                        isFirstPump={pumpOrder === 0}
                                                        stockCount={stockCount}
                                                        handleSave={handleSave}           // 👈 เพิ่มตรงนี้
                                                        check={stationReports[index]?.hasChanged}  // ✅ ใช้ optional chaining
                                                        stationId={stationReports[index]?.stationId}   // ✅ ส่ง stationId มาด้วย
                                                        stocks={stocks}
                                                        onCheck={onCheck}
                                                    />
                                                </React.Fragment>
                                            );
                                        }
                                        return null;
                                    })}
                                </Paper>
                            );
                        })}

                    </Grid>
                </Grid>
            </Box>

        </React.Fragment>

    );
};

export default GasStationsDetail;
