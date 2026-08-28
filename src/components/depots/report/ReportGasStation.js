import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Drawer,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Popover,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import SaveIcon from '@mui/icons-material/Save';
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { useGasStationData } from "../../../server/provider/GasStationProvider";
import theme from "../../../theme/theme";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ShowError, ShowSuccess, ShowWarning } from "../../sweetalert/sweetalert";
import { formatThaiMonth, formatThaiSlash } from "../../../theme/DateTH";
import { TablecellHeader } from "../../../theme/style";
import FullPageLoading from "../../navbar/Loading";
import { database } from "../../../server/firebase";
import ReportDetail from "./ReportDetail";
import ReportBackyard from "./ReportBackyard";

const ReportGasStation = ({ openNavbar }) => {
    const [openMenu, setOpenMenu] = React.useState(1);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const { depots } = useBasicData();
    const { gasstationDetail, stockDetail } = useGasStationData();

    const gasStationOil = Object.values(gasstationDetail || {});
    const stocks = Object.values(stockDetail || {});
    const depot = Object.values(depots || {});
    const [cbpData, setCbpData] = useState({});
    const [backyardData, setBackyardData] = useState({});

    const [selectedDate, setSelectedDate] = useState(dayjs()); // ใช้วันปัจจุบัน
    const [checkStock, setCheckStock] = useState("ทั้งหมด");

    const handleDateChange = (newValue) => {
        if (newValue) {
            setSelectedDate(dayjs(newValue));
        }
    };

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

    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const monthKey = `${year}-${month}`;

    const toNumber = (v) => {
        if (v === "" || v === null || v === undefined) return 0;
        const n = Number(String(v).replace(/,/g, ""));
        return isNaN(n) ? 0 : n;
    };

    const getSourceDate = (year, month, day, daysInMonthLength) => {
        // วันที่ 2 → 30
        if (day > 1) {
            return { y: year, m: month, d: day - 1 };
        }

        // วันที่ 1 → ไม่มีวันก่อนหน้า (จะ return null)
        return null;
    };

    const getNextDate = (year, month, day, daysInMonthLength) => {
        // ถ้าไม่ใช่วันสุดท้าย → วันถัดไปในเดือนเดียวกัน
        if (day < daysInMonthLength) {
            return { y: year, m: month, d: day + 1 };
        }

        // ถ้าเป็นวันสุดท้าย → วันที่ 1 ของเดือนถัดไป
        if (month === 12) {
            return { y: year + 1, m: 1, d: 1 };
        }

        return { y: year, m: month + 1, d: 1 };
    };

    const getOrCreateCBP = (
        row,
        product,
        index,
        y,
        m,
        total
    ) => {
        const existing = row.CBP?.[y]?.[m]?.[index];

        if (existing) {
            return {
                ...existing,
                Total: total,
                Diff: toNumber(existing.CBP) - total
            };
        }

        return {
            ProductName: product.Name,
            CBP: 0,
            Total: total,
            Diff: 0 - total,
            Color: product.Color
        };
    };

    const customOrder = ["G95", "B95", "B7", "B7(1)", "B7(2)", "G91", "E20", "PWD"];
    const stationSummary = {};
    const stationSummaryBackyard = {};

    const y = selectedDate ? selectedDate.year() : null;
    const m = selectedDate ? selectedDate.month() + 1 : null; // month เริ่มต้นที่ 0

    const to2Decimal = v => Number(Number(v ?? 0).toFixed(2));

    const getDaysInMonth = (date) => {
        if (!date) return [];
        const d = dayjs(date);
        const days = d.daysInMonth(); // 28–31
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const lightenColor = (hex, amount = 0.85) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const lr = Math.round(r + (255 - r) * amount);
        const lg = Math.round(g + (255 - g) * amount);
        const lb = Math.round(b + (255 - b) * amount);

        return `rgb(${lr}, ${lg}, ${lb})`; // ✅ สีทึบ
    };

    const daysInMonth = getDaysInMonth(selectedDate);

    const summary = {
        total: 0,
        cbp: 0,
        diff: 0
    };

    const stockSummary = {
        total: 0,
        cbp: 0,
        diff: 0,
        carry: 0,
        accumulate: 0
    };

    // const dailySummary = {};
    // daysInMonth.forEach(d => {
    //     dailySummary[d] = 0;
    // });

    const calculateDailyByProduct = (
        report,
        productName,
        y,
        m,
        daysInMonth,
        field
    ) => {
        const result = {};
        daysInMonth.forEach(d => (result[d] = 0));

        daysInMonth.forEach(d => {
            const source = getNextDate(y, m, d, daysInMonth.length);

            const p =
                report?.[source.y]?.[source.m]?.[source.d]?.Products?.find(
                    x => x.ProductName === productName
                );

            if (!p) return;

            result[d] += Number(p[field] ?? 0);
        });

        return result;
    };

    const normalizeName = (name) =>
        name.replace(/\(\d+\)/g, "").trim();

    const calculateDailySellAndBackyard = (
        report,
        productName,
        y,
        m,
        daysInMonth
    ) => {
        const result = {};
        daysInMonth.forEach(d => {
            result[d] = { sell: 0, backyard: 0 };
        });

        daysInMonth.forEach(d => {
            const source = getNextDate(y, m, d, daysInMonth.length);

            const list =
                report?.[source.y]?.[source.m]?.[source.d]?.Products
                    ?.filter(x =>
                        normalizeName(x.ProductName) === normalizeName(productName)
                    ) ?? [];

            result[d].sell += list.reduce(
                (acc, p) => acc + (Number(p.Sell ?? 0) - Number(p.BackyardSales ?? 0)),
                0
            );

            result[d].backyard += list.reduce(
                (acc, p) => acc + Number(p.BackyardSales ?? 0),
                0
            );
        });

        return result;
    };

    const dailySummaryBackyard = useMemo(() => {
        const summary = {};
        daysInMonth.forEach(d => (summary[d] = 0));

        gasStationOil.forEach(row => {
            row.Products.forEach(product => {
                daysInMonth.forEach(d => {
                    const source = getNextDate(y, m, d, daysInMonth.length);

                    const p =
                        row.Report?.[source.y]?.[source.m]?.[source.d]?.Products?.find(
                            x => x.ProductName === product.Name
                        );

                    if (p?.BackyardSales) {
                        summary[d] += toNumber(p.BackyardSales);
                    }
                });
            });
        });

        return summary;
    }, [gasStationOil, daysInMonth, y, m]);

    const calculateMonthlyTotal = (
        report,
        productName,
        y,
        m,
        daysInMonth
    ) => {
        return daysInMonth.reduce((sum, d) => {
            const source = getNextDate(y, m, d, daysInMonth.length);

            const product =
                report?.[source.y]?.[source.m]?.[source.d]?.Products?.find(
                    x => x.ProductName === productName
                );

            if (!product) return sum;

            const sell = to2Decimal(product.Sell ?? 0);
            const backyard = to2Decimal(product.BackyardSales ?? 0);

            const value = product.Backyard === true
                ? sell - backyard
                : sell;

            return sum + (isNaN(value) ? 0 : value);
        }, 0);
    };

    const calculateBackyardMonthlyTotal = (
        report,
        productName,
        y,
        m,
        daysInMonthBackyard
    ) => {
        return daysInMonthBackyard.reduce((sum, d) => {
            const source = getNextDate(y, m, d, daysInMonth.length);

            const product =
                report?.[source.y]?.[source.m]?.[source.d]?.Products?.find(
                    x => x.ProductName === productName
                );

            if (!product?.BackyardSales) return sum;

            // return sum + toNumber(product.BackyardSales);
            const backyard = to2Decimal(product.BackyardSales ?? 0);
            const value = product.Backyard === true
                ? backyard
                : 0;

            return sum + (isNaN(value) ? 0 : value);
        }, 0);
    };

    const getCarryFromHistory = (
        stationId,
        productIndex,
        year,
        month,
        cbpData
    ) => {
        const { py, pm } = getPrevYearMonth(year, month);

        return (
            cbpData?.[stationId]?.[py]?.[pm]?.[productIndex]?.Accumulate ??
            0
        );
    };

    const getPrevYearMonth = (year, month) => {
        if (month === 1) {
            return {
                py: year - 1,
                pm: 12
            };
        }

        return {
            py: year,
            pm: month - 1
        };
    };

    const ensurePrevMonthComputed = (
        stationId,
        productIdx,
        year,
        month,
        cbpData,
        row
    ) => {
        const { py, pm } = getPrevYearMonth(year, month);

        if (cbpData?.[stationId]?.[py]?.[pm]?.[productIdx]) {
            return cbpData[stationId][py][pm][productIdx].Accumulate;
        }

        const Accumulate = row?.[py]?.[pm]?.[productIdx]?.Accumulate ?? 0;

        return Accumulate; // เดือนแรก Carry = 0
    };


    useEffect(() => {
        if (!selectedDate) return;

        const year = selectedDate.year();
        const month = selectedDate.month() + 1;

        setCbpData(prev => {
            const updated = { ...prev };

            Object.keys(updated).forEach(stationId => {
                if (updated?.[stationId]?.[year]?.[month]) {
                    delete updated[stationId][year][month];
                }
            });

            return updated;
        });

        setBackyardData(prev => {
            const updated = { ...prev };

            Object.keys(updated).forEach(stationId => {
                if (updated?.[stationId]?.[year]?.[month]) {
                    delete updated[stationId][year][month];
                }
            });

            return updated;
        });

    }, [selectedDate]);


    useEffect(() => {
        if (!selectedDate || !gasStationOil?.length) return;

        const year = selectedDate.year();
        const month = selectedDate.month() + 1;

        let hasChanged = false;

        setCbpData(prev => {
            const updated = { ...prev };

            gasStationOil.forEach(row => {
                const stationId = row.id;

                if (updated?.[stationId]?.[year]?.[month]) return;

                hasChanged = true;

                updated[stationId] ??= {};
                updated[stationId][year] ??= {};

                const cbpOfMonth = row.CBP?.[year]?.[month] ?? {};
                const productMap = {};

                row.Products.sort((a, b) => {
                    const ai = customOrder.indexOf(a.Name);
                    const bi = customOrder.indexOf(b.Name);
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                }).forEach((p, idx) => {
                    const total = calculateMonthlyTotal(
                        row.Report,
                        p.Name,
                        year,
                        month,
                        daysInMonth,
                        row.Backyard
                    );

                    const { py, pm } = getPrevYearMonth(year, month);

                    // const prevAcc = getCarryFromHistory(
                    //     stationId,
                    //     idx,
                    //     year,
                    //     month,
                    //     prev
                    // );

                    const prevAcc = ensurePrevMonthComputed(
                        stationId,
                        idx,
                        year,
                        month,
                        prev,
                        row.CBP
                    );

                    const diff = (cbpOfMonth[idx]?.CBP ?? 0) - total;

                    productMap[idx] = {
                        ProductName: p.Name,
                        Color: p.Color,
                        CBP: cbpOfMonth[idx]?.CBP ?? 0,
                        Total: total,
                        Diff: (cbpOfMonth[idx]?.CBP ?? 0) - total,
                        Carry: prevAcc,
                        Accumulate: prevAcc + diff
                    };
                });

                updated[stationId][year][month] = productMap;
            });

            return hasChanged ? updated : prev;
        });

        setBackyardData(prev => {
            const updated = { ...prev };
            let changed = false;

            gasStationOil.forEach(row => {
                const stationId = row.id;

                if (updated?.[stationId]?.[year]?.[month]) return;

                changed = true;

                updated[stationId] ??= {};
                updated[stationId][year] ??= {};

                const cbpOfMonth = row.Backyard?.[year]?.[month] ?? {};
                const productMap = {};

                row.Products.sort((a, b) => {
                    const ai = customOrder.indexOf(a.Name);
                    const bi = customOrder.indexOf(b.Name);
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                }).forEach((p, idx) => {
                    const total = calculateBackyardMonthlyTotal(
                        row.Report,
                        p.Name,
                        year,
                        month,
                        daysInMonth
                    );

                    const { py, pm } = getPrevYearMonth(year, month);

                    // const prevAcc = getCarryFromHistory(
                    //     stationId,
                    //     idx,
                    //     year,
                    //     month,
                    //     prev
                    // );
                    const prevAcc = ensurePrevMonthComputed(
                        stationId,
                        idx,
                        year,
                        month,
                        prev,
                        row.Backyard
                    );

                    const cbpValue =
                        cbpOfMonth?.[p.Name]?.CBP ?? 0;

                    const diff = (cbpValue || 0) - total;

                    productMap[idx] = {
                        ProductName: p.Name,
                        Color: p.Color,
                        CBP: cbpOfMonth[idx]?.CBP ?? 0,
                        Total: total,
                        Diff: (cbpOfMonth[idx]?.CBP ?? 0) - total,
                        Carry: prevAcc,
                        Accumulate: prevAcc + diff
                    };
                });

                updated[stationId][year][month] = productMap;
            });

            return changed ? updated : prev;
        });

    }, [selectedDate, gasStationOil, daysInMonth]);

    console.log("cbpData", cbpData);

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                รายงานสต๊อกหน้าลาน
            </Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={2} lg={1}>
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
                            <TextField
                                type="number"
                                size="small"
                                fullWidth
                                value={selectedDate.year() + 543}   // 👈 แสดง พ.ศ.
                                onChange={(e) => {
                                    const beYear = Number(e.target.value);
                                    const adYear = beYear - 543;
                                    setSelectedDate(prev => prev.year(adYear));
                                }}
                                onWheel={(e) => {
                                    e.preventDefault();
                                    const delta = e.deltaY < 0 ? 1 : -1;
                                    setSelectedDate(prev =>
                                        prev.year(prev.year() + delta)
                                    );
                                }}
                                InputProps={{                         // ✅ ใส่ตรงนี้
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ marginLeft: 1 }}>
                                            ปี :
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        fontSize: "16px",
                                        height: "40px",
                                        fontWeight: "bold",
                                        padding: 0,
                                    },
                                }}
                                inputProps={{
                                    min: 2500,
                                    max: 2600,
                                    step: 1,
                                    style: { textAlign: "center", fontWeight: "bold", marginRight: -5 }
                                }}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4} lg={3}>
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
                                    openTo="month"
                                    views={["year", "month"]}
                                    value={selectedDate ? dayjs(selectedDate, "MMMM") : null}
                                    format="MMMM"
                                    onChange={(newValue) => {
                                        // ตรวจสอบว่ามีการแก้ไขค้างอยู่หรือไม่
                                        // const hasUnsaved = stationReports.some(st => st.hasChanged);
                                        // if (hasUnsaved) {
                                        //     ShowWarning("กรุณาบันทึกการแก้ไขข้อมูลก่อนเปลี่ยนวันที่!");
                                        //     return; // ❌ หยุดไม่ให้เปลี่ยนค่า
                                        // }

                                        // ถ้าไม่มีการแก้ไขค้าง ให้เปลี่ยน selectedDate ตรง ๆ
                                        if (newValue) {
                                            setSelectedDate(dayjs(newValue, "MMMM"));
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            inputProps: {
                                                value: selectedDate
                                                    ? formatThaiMonth(selectedDate) // ✅ แสดงเป็น 05/11/2568
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
                                                // const hasUnsaved = stationReports.some(st => st.hasChanged);
                                                // if (hasUnsaved) {
                                                //     ShowWarning("กรุณาบันทึกการแก้ไขข้อมูลก่อนเปลี่ยน Stock!");
                                                //     return; // ❌ หยุดไม่ให้เปลี่ยนค่า
                                                // }

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
                </Grid>
                {(checkStock === "ทั้งหมด" ? stocks : [stocks.find(s => s.Name === checkStock)]).map((stock, idx) => {
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
                            {gasStationOil.map((row, index) => {
                                if (row.Stock === stock.uuid) {
                                    const filteredStocks = gasStationOil.filter(r => r.Stock === stock.uuid);
                                    const stockCount = filteredStocks.length;  // จำนวนปั้มที่ตรงกัน
                                    // ✔ หาลำดับปั้ม (0,1)
                                    const pumpOrder = filteredStocks.findIndex(p => p.id === row.id);

                                    const year = selectedDate.year();
                                    const month = selectedDate.month() + 1;

                                    const pumpsInStock = gasStationOil.filter(
                                        r => r.Stock === stock.uuid
                                    );

                                    const stockSummary = pumpsInStock.reduce(
                                        (acc, row) => {
                                            row.Products.forEach((_, idx) => {
                                                const item = cbpData?.[row.id]?.[year]?.[month]?.[idx];
                                                acc.total += to2Decimal(item?.Total ?? 0);
                                                acc.cbp += to2Decimal(item?.CBP ?? 0);
                                                acc.diff += to2Decimal(item?.Diff ?? 0);
                                                acc.carry += to2Decimal(item?.Carry ?? 0);
                                                acc.accumulate += to2Decimal(item?.Accumulate ?? 0);
                                            });
                                            return acc;
                                        },
                                        { total: 0, cbp: 0, diff: 0, carry: 0, accumulate: 0 }
                                    );

                                    const dailySummaryByStock = {};
                                    const dailySummaryByStockBackyard = {};

                                    daysInMonth.forEach(d => {
                                        dailySummaryByStock[d] = 0;
                                        dailySummaryByStockBackyard[d] = 0;
                                    });

                                    pumpsInStock.forEach(pumpRow => {

                                        const uniqueProducts = [
                                            ...new Map(
                                                pumpRow.Products.map(p => [normalizeName(p.Name), p])
                                            ).values()
                                        ];

                                        uniqueProducts.forEach(product => {

                                            const cleanName = normalizeName(product.Name);

                                            const daily = calculateDailySellAndBackyard(
                                                pumpRow.Report,
                                                cleanName,
                                                y,
                                                m,
                                                daysInMonth
                                            );

                                            daysInMonth.forEach(d => {
                                                dailySummaryByStock[d] += daily[d].sell;
                                                dailySummaryByStockBackyard[d] += daily[d].backyard;
                                            });
                                        });
                                    });

                                    const dailySummaryByStation = {};
                                    const dailySummaryByStationBackyard = {};

                                    daysInMonth.forEach(d => {
                                        dailySummaryByStation[d] = 0;
                                        dailySummaryByStationBackyard[d] = 0;
                                    });

                                    const uniqueProducts = [
                                        ...new Map(
                                            row.Products.map(p => [normalizeName(p.Name), p])
                                        ).values()
                                    ];

                                    uniqueProducts.forEach(product => {
                                        const cleanName = normalizeName(product.Name);

                                        const daily = calculateDailySellAndBackyard(
                                            row.Report,
                                            cleanName,
                                            y,
                                            m,
                                            daysInMonth
                                        );

                                        daysInMonth.forEach(d => {
                                            dailySummaryByStation[d] += daily[d].sell;
                                            dailySummaryByStationBackyard[d] += daily[d].backyard;
                                        });
                                    });


                                    // const dailySummaryByStock = {};

                                    // daysInMonth.forEach(d => (dailySummaryByStock[d] = 0));

                                    // pumpsInStock.forEach(row => {
                                    //     row.Products.forEach(product => {
                                    //         // if (product.Backyard) return;

                                    //         const dailyByProduct = calculateDailyByProduct(
                                    //             row.Report,
                                    //             product.Name,
                                    //             y,
                                    //             m,
                                    //             daysInMonth,
                                    //             "Sell"
                                    //         );

                                    //         const hasSell = Object.values(dailyByProduct).some(v => v > 0);
                                    //         if (!hasSell) return;

                                    //         daysInMonth.forEach(d => {
                                    //             dailySummaryByStock[d] += to2Decimal(dailyByProduct[d] ?? 0);
                                    //         });
                                    //     });
                                    // });

                                    // const dailySummaryByStation = {};
                                    // daysInMonth.forEach(d => (dailySummaryByStation[d] = 0));

                                    // row.Products.forEach(product => {
                                    //     // if (product.Backyard) return;

                                    //     const dailyByProduct = calculateDailyByProduct(
                                    //         row.Report,
                                    //         product.Name,
                                    //         y,
                                    //         m,
                                    //         daysInMonth,
                                    //         "Sell"
                                    //     );

                                    //     // ✅ ถ้าไม่มี BackyardSales เลย → ข้าม
                                    //     const hasSell = Object.values(dailyByProduct).some(v => v > 0);
                                    //     if (!hasSell) return;

                                    //     daysInMonth.forEach(d => {
                                    //         dailySummaryByStation[d] += dailyByProduct[d];
                                    //     });
                                    // });

                                    // const dailySummaryByStationBackyard = {};
                                    // daysInMonth.forEach(d => (dailySummaryByStationBackyard[d] = 0));

                                    // row.Products.forEach(product => {
                                    //     // if (!product.Backyard) return;

                                    //     const dailyByProductBackyard = calculateDailyByProduct(
                                    //         row.Report,
                                    //         product.Name,
                                    //         y,
                                    //         m,
                                    //         daysInMonth,
                                    //         "BackyardSales"
                                    //     );

                                    //     const hasBackyard = Object.values(dailyByProductBackyard).some(v => v > 0);
                                    //     if (!hasBackyard) return;

                                    //     daysInMonth.forEach(d => {
                                    //         dailySummaryByStationBackyard[d] += dailyByProductBackyard[d];
                                    //     });
                                    // });

                                    // 🔹 เอาค่าปั้มนี้ไปรวมใน stock
                                    // stockSummary.total += pumpSummary.total;
                                    // stockSummary.cbp += pumpSummary.cbp;
                                    // stockSummary.diff += pumpSummary.diff;
                                    // stockSummary.carry += pumpSummary.carry;
                                    // stockSummary.accumulate += pumpSummary.accumulate;

                                    matchCount++;
                                    return (
                                        <React.Fragment key={row.id || index}>
                                            <Box textAlign="center"
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between", // ชิดซ้าย-ขวา
                                                    alignItems: "center",
                                                    backgroundColor:
                                                        row.StockName === "แม่โจ้" ? "#92D050"
                                                            : row.StockName === "สันกลาง" ? "#B1A0C7"
                                                                : row.StockName === "สันทราย" ? "#B7DEE8"
                                                                    : row.StockName === "บ้านโฮ่ง" ? "#FABF8F"
                                                                        : row.StockName === "ป่าแดด" ? "#B1A0C7"
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
                                                    {`${row.Name} / ${row.ShortName} มีทั้งหมด ${row.OilWellNumber} หลุม ที่อยู่ ${row.Address}`}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <TableContainer
                                                    component={Paper}
                                                    style={{ maxHeight: "70vh" }}
                                                    sx={{ marginBottom: 2 }}
                                                >
                                                    <Table stickyHeader size="small" sx={{ width: "100%" }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 140,
                                                                    position: "sticky",
                                                                    left: 0,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    <Paper
                                                                        component="form"
                                                                        sx={{
                                                                            width: "100%", // กำหนดความกว้างของ Paper
                                                                            height: "25px"
                                                                        }}
                                                                    >
                                                                        <Typography fontSize="18px" fontWeight="bold" gutterBottom paddingTop={-0.5}>{formatThaiMonth(dayjs(selectedDate))}</Typography>
                                                                    </Paper>
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 120,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    left: 140,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    ส่วนต่าง
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 120,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    left: 260,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    ยอด CBP
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 120,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    left: 380,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    รวม
                                                                </TablecellHeader>
                                                                {daysInMonth.map(day => (
                                                                    <TablecellHeader
                                                                        key={day}
                                                                        sx={{
                                                                            textAlign: "center",
                                                                            fontSize: 13,
                                                                            backgroundColor: theme.palette.panda.main,

                                                                            minWidth: 120,   // ⭐ ใช้ minWidth ดีกว่า width
                                                                            whiteSpace: "nowrap"
                                                                        }}
                                                                    >
                                                                        {`วันที่ ${day}`}
                                                                    </TablecellHeader>
                                                                ))}
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 120,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    right: 220,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    ยอดยกมา
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 120,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    right: 100,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>
                                                                    ยอดสะสม
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{
                                                                    textAlign: "center",
                                                                    fontSize: 14,
                                                                    backgroundColor: theme.palette.panda.main,
                                                                    minWidth: 100,
                                                                    whiteSpace: "nowrap",
                                                                    position: "sticky",
                                                                    right: 0,
                                                                    zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                }}>

                                                                </TablecellHeader>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {
                                                                row.Products.sort((a, b) => {
                                                                    const ai = customOrder.indexOf(a.Name);
                                                                    const bi = customOrder.indexOf(b.Name);
                                                                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                                                                }).map((product, index) => {
                                                                    const y = selectedDate.year();
                                                                    const m = selectedDate.month() + 1;

                                                                    const total = calculateMonthlyTotal(
                                                                        row.Report,
                                                                        product.Name,
                                                                        y,
                                                                        m,
                                                                        daysInMonth,
                                                                        row.Backyard
                                                                    );

                                                                    const year = selectedDate.year();
                                                                    const month = selectedDate.month() + 1;

                                                                    const cbpItem =
                                                                        cbpData?.[row.id]?.[year]?.[month]?.[index] ?? {
                                                                            ProductName: product.Name,
                                                                            Color: product.Color,
                                                                            CBP: 0,
                                                                            Total: total,
                                                                            Diff: -total,
                                                                            Carry: 0,
                                                                            Accumulate: -total
                                                                        };

                                                                    // ✅ สร้าง summary ของปั้มนี้ ถ้ายังไม่มี
                                                                    if (!stationSummary[row.id]) {
                                                                        stationSummary[row.id] = {
                                                                            total: 0,
                                                                            cbp: 0,
                                                                            diff: 0,
                                                                            carry: 0,
                                                                            accumulate: 0
                                                                        };
                                                                    }

                                                                    stationSummary[row.id].total += to2Decimal(cbpItem?.Total ?? 0);
                                                                    stationSummary[row.id].cbp += to2Decimal(cbpItem?.CBP ?? 0);
                                                                    stationSummary[row.id].diff += to2Decimal(cbpItem?.Diff ?? 0);
                                                                    stationSummary[row.id].carry += to2Decimal(cbpItem?.Carry ?? 0);
                                                                    stationSummary[row.id].accumulate += to2Decimal(cbpItem?.Accumulate ?? 0);

                                                                    const summary = stationSummary[row.id] ?? {
                                                                        total: 0,
                                                                        cbp: 0,
                                                                        diff: 0,
                                                                        carry: 0,
                                                                        accumulate: 0
                                                                    };

                                                                    return (
                                                                        <React.Fragment key={index}>
                                                                            <ReportDetail
                                                                                total={total}
                                                                                row={row}
                                                                                product={product}
                                                                                index={index}
                                                                                cbpItem={cbpItem}
                                                                                setCbpData={setCbpData}
                                                                                selectedDate={selectedDate}
                                                                                lightenColor={lightenColor}
                                                                                summary={summary}
                                                                                stockSummary={stockSummary}
                                                                                pumpOrder={pumpOrder}
                                                                                stockCount={stockCount}
                                                                                daysInMonth={daysInMonth}
                                                                                cbpData={cbpData}
                                                                                dailySummary={dailySummaryByStation}
                                                                                dailySummaryByStock={dailySummaryByStock}
                                                                            />
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                                {/* <TableContainer
                                                    component={Paper}
                                                    style={{ maxHeight: "70vh" }}
                                                    sx={{ marginBottom: 2, marginLeft: 5 }}
                                                >
                                                    <Table stickyHeader size="small" sx={{ width: "100%" }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TablecellHeader colSpan={2} width={130} sx={{ textAlign: "center", backgroundColor: theme.palette.panda.main }}>
                                                                    <Paper
                                                                        component="form"
                                                                        sx={{
                                                                            width: "100%", // กำหนดความกว้างของ Paper
                                                                            height: "25px"
                                                                        }}
                                                                    >
                                                                        <Typography fontSize="18px" fontWeight="bold" gutterBottom paddingTop={-0.5}>{formatThaiSlash(dayjs(selectedDate))}</Typography>
                                                                    </Paper>
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 110, whiteSpace: "nowrap" }}>
                                                                    ส่วนต่าง
                                                                </TablecellHeader>
                                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.main, width: 80, whiteSpace: "nowrap" }}>
                                                                    ยอด CBP
                                                                </TablecellHeader>
                                                            </TableRow>
                                                        </TableHead>
                                                    </Table>
                                                </TableContainer> */}
                                            </Box>
                                            {
                                                Object.values(row.Products || {}).some(
                                                    p => p?.Backyard === true
                                                ) && (
                                                    <React.Fragment>
                                                        <Box textAlign="center"
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "space-between", // ชิดซ้าย-ขวา
                                                                alignItems: "center",
                                                                backgroundColor:
                                                                    row.StockName === "แม่โจ้" ? "#92D050"
                                                                        : row.StockName === "สันกลาง" ? "#B1A0C7"
                                                                            : row.StockName === "สันทราย" ? "#B7DEE8"
                                                                                : row.StockName === "บ้านโฮ่ง" ? "#FABF8F"
                                                                                    : row.StockName === "ป่าแดด" ? "#B1A0C7"
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
                                                                {`ยอดขายหลังบ้าน`}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <TableContainer
                                                                component={Paper}
                                                                style={{ maxHeight: "70vh" }}
                                                                sx={{ marginBottom: 2 }}
                                                            >
                                                                <Table stickyHeader size="small" sx={{ width: "100%" }}>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TablecellHeader sx={{
                                                                                textAlign: "center",
                                                                                backgroundColor: theme.palette.panda.main,
                                                                                minWidth: 140,
                                                                                position: "sticky",
                                                                                left: 0,
                                                                                zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                            }}>
                                                                                <Paper
                                                                                    component="form"
                                                                                    sx={{
                                                                                        width: "100%", // กำหนดความกว้างของ Paper
                                                                                        height: "25px"
                                                                                    }}
                                                                                >
                                                                                    <Typography fontSize="18px" fontWeight="bold" gutterBottom paddingTop={-0.5}>{formatThaiMonth(dayjs(selectedDate))}</Typography>
                                                                                </Paper>
                                                                            </TablecellHeader>
                                                                            <TablecellHeader sx={{
                                                                                textAlign: "center",
                                                                                fontSize: 14,
                                                                                backgroundColor: theme.palette.panda.main,
                                                                                minWidth: 120,
                                                                                whiteSpace: "nowrap",
                                                                                position: "sticky",
                                                                                left: 140,
                                                                                zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                            }}>
                                                                                ส่วนต่าง
                                                                            </TablecellHeader>
                                                                            <TablecellHeader sx={{
                                                                                textAlign: "center",
                                                                                fontSize: 14,
                                                                                backgroundColor: theme.palette.panda.main,
                                                                                minWidth: 120,
                                                                                whiteSpace: "nowrap",
                                                                                position: "sticky",
                                                                                left: 260,
                                                                                zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                            }}>
                                                                                ยอด CBP
                                                                            </TablecellHeader>
                                                                            <TablecellHeader sx={{
                                                                                textAlign: "center",
                                                                                fontSize: 14,
                                                                                backgroundColor: theme.palette.panda.main,
                                                                                minWidth: 120,
                                                                                whiteSpace: "nowrap",
                                                                                position: "sticky",
                                                                                left: 380,
                                                                                zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                            }}>
                                                                                รวม
                                                                            </TablecellHeader>
                                                                            {daysInMonth.map(day => (
                                                                                <TablecellHeader
                                                                                    key={day}
                                                                                    sx={{
                                                                                        textAlign: "center",
                                                                                        fontSize: 13,
                                                                                        backgroundColor: theme.palette.panda.main,

                                                                                        minWidth: 120,   // ⭐ ใช้ minWidth ดีกว่า width
                                                                                        whiteSpace: "nowrap"
                                                                                    }}
                                                                                >
                                                                                    {`วันที่ ${day}`}
                                                                                </TablecellHeader>
                                                                            ))}
                                                                            <TablecellHeader sx={{
                                                                                textAlign: "center",
                                                                                fontSize: 14,
                                                                                backgroundColor: theme.palette.panda.main,
                                                                                minWidth: 120,
                                                                                whiteSpace: "nowrap",
                                                                                position: "sticky",
                                                                                right: 220,
                                                                                zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                            }}>
                                                                                ยอดยกมา
                                                                            </TablecellHeader>
                                                                            <TablecellHeader sx={{
                                                                                textAlign: "center",
                                                                                fontSize: 14,
                                                                                backgroundColor: theme.palette.panda.main,
                                                                                minWidth: 120,
                                                                                whiteSpace: "nowrap",
                                                                                position: "sticky",
                                                                                right: 100,
                                                                                zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                            }}>
                                                                                ยอดสะสม
                                                                            </TablecellHeader>
                                                                            <TablecellHeader sx={{
                                                                                textAlign: "center",
                                                                                fontSize: 14,
                                                                                backgroundColor: theme.palette.panda.main,
                                                                                minWidth: 100,
                                                                                whiteSpace: "nowrap",
                                                                                position: "sticky",
                                                                                right: 0,
                                                                                zIndex: 5, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                                                            }}>

                                                                            </TablecellHeader>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {
                                                                            row.Products
                                                                                .sort((a, b) => {
                                                                                    const ai = customOrder.indexOf(a.Name);
                                                                                    const bi = customOrder.indexOf(b.Name);
                                                                                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                                                                                }).map((product, index) => {
                                                                                    const y = selectedDate.year();
                                                                                    const m = selectedDate.month() + 1;

                                                                                    const total = calculateBackyardMonthlyTotal(
                                                                                        row.Report,
                                                                                        product.Name,
                                                                                        y,
                                                                                        m,
                                                                                        daysInMonth
                                                                                    );

                                                                                    console.log("total backyard", row.id, total);

                                                                                    const year = selectedDate.year();
                                                                                    const month = selectedDate.month() + 1;

                                                                                    const backyardItem =
                                                                                        backyardData?.[row.id]?.[year]?.[month]?.[index] ?? {
                                                                                            ProductName: product.Name,
                                                                                            Color: product.Color,
                                                                                            CBP: 0,
                                                                                            Total: total,
                                                                                            Diff: -total,
                                                                                            Carry: 0,
                                                                                            Accumulate: -total
                                                                                        };

                                                                                    // ✅ สร้าง summary ของปั้มนี้ ถ้ายังไม่มี
                                                                                    if (!stationSummaryBackyard[row.id]) {
                                                                                        stationSummaryBackyard[row.id] = {
                                                                                            total: 0,
                                                                                            cbp: 0,
                                                                                            diff: 0,
                                                                                            carry: 0,
                                                                                            accumulate: 0
                                                                                        };
                                                                                    }

                                                                                    stationSummaryBackyard[row.id].total += to2Decimal(backyardItem?.Total ?? 0);
                                                                                    stationSummaryBackyard[row.id].cbp += to2Decimal(backyardItem?.CBP ?? 0);
                                                                                    stationSummaryBackyard[row.id].diff += to2Decimal(backyardItem?.Diff ?? 0);
                                                                                    stationSummaryBackyard[row.id].carry += to2Decimal(backyardItem?.Carry ?? 0);
                                                                                    stationSummaryBackyard[row.id].accumulate += to2Decimal(backyardItem?.Accumulate ?? 0);

                                                                                    const summary = stationSummaryBackyard[row.id] ?? {
                                                                                        total: 0,
                                                                                        cbp: 0,
                                                                                        diff: 0,
                                                                                        carry: 0,
                                                                                        accumulate: 0
                                                                                    };

                                                                                    return (
                                                                                        <React.Fragment key={index}>
                                                                                            <ReportBackyard
                                                                                                total={total}
                                                                                                row={row}
                                                                                                product={product}
                                                                                                index={index}
                                                                                                backyardItem={backyardItem}
                                                                                                setBackyardData={setBackyardData}
                                                                                                selectedDate={selectedDate}
                                                                                                lightenColor={lightenColor}
                                                                                                summary={summary}
                                                                                                pumpOrder={pumpOrder}
                                                                                                stockCount={stockCount}
                                                                                                daysInMonth={daysInMonth}
                                                                                                backyardData={backyardData}
                                                                                                dailySummaryBackyard={dailySummaryByStationBackyard}
                                                                                                stockSummary={stockSummary}
                                                                                                dailySummaryByStock={dailySummaryByStock}
                                                                                            />
                                                                                        </React.Fragment>
                                                                                    );
                                                                                })}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Box>
                                                    </React.Fragment>
                                                )
                                            }
                                        </React.Fragment>
                                    )
                                }
                            }
                            )}
                        </Paper>
                    )
                })}
            </Box>
        </Container>
    );
};

export default ReportGasStation;
