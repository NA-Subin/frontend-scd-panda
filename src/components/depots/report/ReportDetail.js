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
import { apiPut } from "../../../server/apiClient";

const ReportDetail = (props) => {
    const {
        total,
        row,
        product,
        index,
        cbpItem,
        setCbpData,
        selectedDate,
        lightenColor,
        summary,
        stockSummary,
        pumpOrder,
        stockCount,
        daysInMonth,
        cbpData,
        dailySummary,
        dailySummaryByStock
    } = props;
    const [openMenu, setOpenMenu] = React.useState(1);

    console.log("🚀 ~ file: ReportDetail.js:55 ~ ReportDetail ~ cbpItem:", cbpItem);

    const { depots } = useBasicData();
    const { gasstationDetail, stockDetail, refetch: refetchGasStationData } = useGasStationData();
    const [isEditingCBP, setIsEditingCBP] = useState(false);

    const to2Decimal = v => Number(Number(v ?? 0).toFixed(2));

    const formatNumber = (value) => {
        if (value === null || value === undefined) return "";
        if (isNaN(value)) return "0";
        return to2Decimal(value).toLocaleString("en-US");
    };

    const gasStationOil = Object.values(gasstationDetail || {});
    const stocks = Object.values(stockDetail || {});
    const depot = Object.values(depots || {});

    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const monthKey = `${year}-${month}`;

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

    const y = selectedDate ? selectedDate.year() : null;
    const m = selectedDate ? selectedDate.month() + 1 : null; // month เริ่มต้นที่ 0

    const handleSaveCBP = async (row) => {
        if (!selectedDate || !row?.uuid) return;

        const year = selectedDate.year();
        const month = selectedDate.month() + 1;

        const payload = cbpData?.[row.id]?.[year]?.[month] ?? {};

        // CBP is a plain JSONB column, not a real nested Firebase path - read,
        // merge the year/month entry, and write the whole column back.
        const mergedCBP = structuredClone(row.CBP || {});
        mergedCBP[year] = mergedCBP[year] || {};
        mergedCBP[year][month] = payload;

        try {
            await apiPut(`/api/depot_gas_stations/${row.uuid}`, { CBP: mergedCBP });
            ShowSuccess("✅ บันทึก CBP สำเร็จ", payload);
            refetchGasStationData?.();
        } catch (err) {
            ShowError("❌ บันทึก CBP ล้มเหลว", err);
        }
    };

    return (
        <React.Fragment>
            <TableRow>
                <TablecellHeader
                    sx={{
                        backgroundColor: product.Color ?? "white",
                        width: 120,
                        color: "black",
                        position: "sticky",
                        left: 0,
                        zIndex: 1, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                        borderBottom: "2px solid white"
                    }}
                >
                    {product.Name}
                </TablecellHeader>
                <TableCell sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    position: "sticky",
                    left: 140,
                    color: cbpItem.Diff < 0 ? "#d50000" : "black",
                    backgroundColor: lightenColor(product.Color, 0.6),
                    paddingLeft: "30px !important",
                    paddingRight: "30px !important",
                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                }}>
                    {(cbpItem.Diff ?? 0).toLocaleString()}
                </TableCell>
                <TableCell sx={{
                    position: "sticky",
                    left: 260,
                    backgroundColor: lightenColor(product.Color, 0.6),
                }}>
                    {
                        pumpOrder === 0 ? (
                            <Paper sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    type="text"
                                    value={
                                        isEditingCBP && (cbpItem.CBP ?? 0) === 0
                                            ? ""
                                            : formatNumber(cbpItem.CBP ?? 0)
                                    }
                                    onChange={(e) => {
                                        let raw = e.target.value.replace(/,/g, "");

                                        // ⭐ ลบหมด → ถือว่าเป็น 0 ทันที
                                        if (raw === "" || raw === "-") {
                                            const cbp = 0;
                                            const diff = cbp - (cbpItem.Total ?? total);
                                            const carry = (cbpItem.Carry ?? 0);

                                            setCbpData(prev => ({
                                                ...prev,
                                                [row.id]: {
                                                    ...prev[row.id],
                                                    [year]: {
                                                        ...prev[row.id]?.[year],
                                                        [month]: {
                                                            ...prev[row.id]?.[year]?.[month],
                                                            [index]: {
                                                                ...prev[row.id]?.[year]?.[month]?.[index],
                                                                ProductName: product.Name,
                                                                Color: product.Color,
                                                                CBP: 0,
                                                                Total: (cbpItem.Total ?? total),
                                                                Diff: diff,
                                                                Carry: carry,
                                                                Accumulate: carry + diff
                                                            }
                                                        }
                                                    }
                                                }
                                            }));
                                            return;
                                        }

                                        // รับเฉพาะตัวเลข (รวมติดลบ)
                                        if (!/^-?\d+$/.test(raw)) return;

                                        const cbp = Number(raw);
                                        const diff = cbp - (cbpItem.Total ?? total);
                                        const carry = (cbpItem.Carry ?? 0);

                                        setCbpData(prev => ({
                                            ...prev,
                                            [row.id]: {
                                                ...prev[row.id],
                                                [year]: {
                                                    ...prev[row.id]?.[year],
                                                    [month]: {
                                                        ...prev[row.id]?.[year]?.[month],
                                                        [index]: {
                                                            ...prev[row.id]?.[year]?.[month]?.[index],
                                                            ProductName: product.Name,
                                                            Color: product.Color,
                                                            CBP: cbp,        // ✅ เก็บเป็น number เสมอ
                                                            Total: (cbpItem.Total ?? total),
                                                            Diff: diff,
                                                            Carry: carry,
                                                            Accumulate: carry + diff
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    onFocus={() => {
                                        setIsEditingCBP(true);
                                    }}
                                    onBlur={() => {
                                        setIsEditingCBP(false);

                                        // ป้องกันกรณี user ลบหมดแล้วออก
                                        if ((cbpItem.CBP ?? 0) === 0) {
                                            setCbpData(prev => ({
                                                ...prev,
                                                [row.id]: {
                                                    ...prev[row.id],
                                                    [year]: {
                                                        ...prev[row.id]?.[year],
                                                        [month]: {
                                                            ...prev[row.id]?.[year]?.[month],
                                                            [index]: {
                                                                ...prev[row.id]?.[year]?.[month]?.[index],
                                                                CBP: 0
                                                            }
                                                        }
                                                    }
                                                }
                                            }));
                                        }
                                    }}

                                    // onFocus={() => handleFocus(index, "EstimateSell")}
                                    // onBlur={(e) => handleBlur(index, "EstimateSell", e)} // ส่ง event
                                    // onChange={(e) => {
                                    //     let raw = e.target.value.replace(/,/g, "");

                                    //     // ⭐ อนุญาตให้เริ่มด้วย "-"
                                    //     if (raw === "-" || raw === "") {
                                    //         handleProductChange(index, "EstimateSell", raw);
                                    //         return;
                                    //     }

                                    //     // ⭐ อนุญาตเลขติดลบ เช่น "-1000"
                                    //     if (/^-?\d+$/.test(raw)) {
                                    //         handleProductChange(index, "EstimateSell", Number(raw));
                                    //     }
                                    // }}
                                    // onKeyDown={(e) => {
                                    //     let raw = String(s.EstimateSell).replace(/,/g, "");

                                    //     // รองรับค่าที่เป็น "-" หรือค่าว่าง
                                    //     if (raw === "" || raw === "-") raw = "0";

                                    //     let current = Number(raw);

                                    //     if (e.key === "ArrowUp") {
                                    //         e.preventDefault();
                                    //         handleProductChange(index, "EstimateSell", current + 1000);
                                    //     }

                                    //     if (e.key === "ArrowDown") {
                                    //         e.preventDefault();
                                    //         handleProductChange(index, "EstimateSell", current - 1000);
                                    //     }
                                    // }}
                                    fullWidth
                                    // InputProps={{
                                    //     inputProps: {
                                    //         min: undefined, // ❗ เอาออกเพื่อรองรับค่าติดลบ
                                    //         step: 1000,
                                    //     },
                                    //     sx: {
                                    //         "& input::-webkit-inner-spin-button": {
                                    //             marginLeft: isFieldFocused(index, "EstimateSell") ? 1 : 0,
                                    //             marginRight: -0.5
                                    //         }
                                    //     },
                                    // }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": { height: 25 },
                                        "& .MuiInputBase-input": {
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            textAlign: "right",
                                            mr: -0.5,
                                            ml: -0.5,
                                            pr: 0.5,
                                            paddingLeft: -3, // เพิ่มพื้นที่ให้ endAdornment
                                            paddingRight: 2, // เพิ่มพื้นที่ให้ endAdornment
                                        },
                                    }}
                                />
                            </Paper>
                        ) : <Box sx={{ textAlign: "center" }}>
                            -
                        </Box>
                    }
                </TableCell>
                <TableCell sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    position: "sticky",
                    left: 380,
                    color: cbpItem.Total < 0 ? "#d50000" : "black",
                    backgroundColor: lightenColor(product.Color, 0.4),
                    paddingLeft: "30px !important",
                    paddingRight: "30px !important",
                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                }}>
                    {(cbpItem.Total ?? total).toLocaleString()}
                </TableCell>

                {/* วันที่ เรียงตาม daysInMonth */}
                {daysInMonth.map((d) => {
                    const source = getNextDate(
                        y,
                        m,
                        d,
                        daysInMonth.length
                    );

                    const productOfDay =
                        row.Report?.[source.y]?.[source.m]?.[source.d]?.Products
                            ?.find(p => p.ProductName === product.Name);

                    const rawSell = productOfDay
                        ? product.Backyard
                            ? to2Decimal(productOfDay.Sell ?? 0) - to2Decimal(productOfDay.BackyardSales ?? 0)
                            : to2Decimal(productOfDay.Sell ?? 0)
                        : 0;

                    const sell = rawSell === 0 ? "-" : rawSell;


                    // ✅ เก็บ daily summary แยกตามวันในตาราง
                    // if (sell !== "-" && !isNaN(sell)) {
                    //     dailySummary[d] += Number(sell);
                    // }

                    return (
                        <TableCell
                            key={d}
                            sx={{
                                width: 50,
                                textAlign: "right",
                                color: sell !== "-" && (sell < 0 ? "#d50000" : "black"),
                                backgroundColor: lightenColor(product.Color, 0.75),
                                paddingLeft: "35px !important",
                                paddingRight: "35px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                            }}
                        >
                            {sell === "-" ? "-" : new Intl.NumberFormat("en-US").format(Math.round(sell))}
                        </TableCell>
                    );
                })}
                <TableCell sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    position: "sticky",
                    right: 220,
                    color: cbpItem.Carry < 0 ? "#d50000" : "black",
                    backgroundColor: lightenColor(product.Color, 0.4),
                    paddingLeft: "10px !important",
                    paddingRight: "10px !important",
                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                }}>
                    {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format((cbpItem.Carry))}
                </TableCell>
                <TableCell sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    position: "sticky",
                    right: 100,
                    color: cbpItem.Accumulate < 0 ? "#d50000" : "black",
                    backgroundColor: lightenColor(product.Color, 0.4),
                    paddingLeft: "10px !important",
                    paddingRight: "10px !important",
                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                }}>
                    {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format((cbpItem.Accumulate))}
                </TableCell>
                {
                    index === 0 &&
                    <TableCell rowSpan={row.Products.length + 1}
                        sx={{
                            right: 0,
                            position: "sticky",
                            zIndex: 5,
                            backgroundColor: "white"
                        }}>
                        {
                            pumpOrder === 0 ? (
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
                                        sx={{ flexDirection: "column", gap: 0.5 }}
                                        onClick={() => handleSaveCBP(row)}   // ⭐ เพิ่มตรงนี้
                                    >
                                        <SaveIcon fontSize="large" sx={{ color: "white" }} />
                                        <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                            บันทึก
                                        </Typography>
                                    </Button>
                                </Paper>
                            ) : null
                        }

                    </TableCell>
                }
            </TableRow>
            {
                index === row.Products.length - 1 && (
                    <React.Fragment>
                        <TableRow>
                            <TablecellHeader
                                sx={{
                                    backgroundColor: "#bdbdbd",
                                    width: 140,
                                    color: "black",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 1, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                    borderBottom: "2px solid white"
                                }}
                            >
                                {/* {`รวม${row.ShortName}`} */}
                                ผลรวม
                            </TablecellHeader>
                            <TableCell sx={{
                                textAlign: "right",
                                fontWeight: "bold",
                                position: "sticky",
                                left: 140,
                                color: summary.diff < 0 ? "#d50000" : "black",
                                backgroundColor: lightenColor("#bdbdbd", 0.6),
                                paddingLeft: "30px !important",
                                paddingRight: "30px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                            }}>
                                {summary.diff.toLocaleString()}
                            </TableCell>
                            <TableCell sx={{
                                textAlign: "right",
                                fontWeight: "bold",
                                position: "sticky",
                                left: 260,
                                color: summary.cbp < 0 ? "#d50000" : "black",
                                backgroundColor: lightenColor("#bdbdbd", 0.6),
                                paddingLeft: "20px !important",
                                paddingRight: "20px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                            }}>
                                {summary.cbp.toLocaleString()}
                            </TableCell>
                            <TableCell sx={{
                                textAlign: "right",
                                fontWeight: "bold",
                                position: "sticky",
                                left: 380,
                                color: summary.total < 0 ? "#d50000" : "black",
                                backgroundColor: lightenColor("#bdbdbd", 0.4),
                                paddingLeft: "30px !important",
                                paddingRight: "30px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                            }}>
                                {summary.total.toLocaleString()}
                            </TableCell>
                            {daysInMonth.map((d) => (
                                <TableCell
                                    key={d}
                                    sx={{
                                        width: 50,
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        color: dailySummary[d] < 0 ? "#d50000" : "black",
                                        backgroundColor: lightenColor("#bdbdbd", 0.6),
                                        paddingLeft: "35px !important",
                                        paddingRight: "35px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}
                                >
                                    {dailySummary[d] === 0
                                        ? "-"
                                        : new Intl.NumberFormat("en-US").format(Math.round(dailySummary[d]))}
                                </TableCell>
                            ))}
                            <TableCell sx={{
                                textAlign: "right",
                                fontWeight: "bold",
                                position: "sticky",
                                right: 220,
                                color: summary.carry < 0 ? "#d50000" : "black",
                                backgroundColor: lightenColor("#bdbdbd", 0.4),
                                paddingLeft: "10px !important",
                                paddingRight: "10px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                            }}>
                                {new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format((summary.carry))}
                            </TableCell>
                            <TableCell sx={{
                                textAlign: "right",
                                fontWeight: "bold",
                                position: "sticky",
                                right: 100,
                                color: summary.accumulate < 0 ? "#d50000" : "black",
                                backgroundColor: lightenColor("#bdbdbd", 0.4),
                                paddingLeft: "10px !important",
                                paddingRight: "10px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                            }}>
                                {new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format((summary.accumulate))}
                            </TableCell>
                        </TableRow>
                        {
                            pumpOrder === stockCount - 1 && stockCount > 1 &&
                            <TableRow>
                                <TablecellHeader
                                    sx={{
                                        backgroundColor: "#929292ff",
                                        width: 140,
                                        color: "black",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 1, // กำหนด z-indexProduct เพื่อให้อยู่ด้านบน
                                        borderBottom: "2px solid white"
                                    }}
                                >
                                    {/* {`รวม${row.ShortName}`} */}
                                    ผลรวมทั้งหมด
                                </TablecellHeader>
                                <TableCell sx={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    position: "sticky",
                                    left: 140,
                                    color: stockSummary.diff < 0 ? "#d50000" : "black",
                                    backgroundColor: lightenColor("#929292ff", 0.6),
                                    paddingLeft: "30px !important",
                                    paddingRight: "30px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                }}>
                                    {stockSummary.diff.toLocaleString()}
                                </TableCell>
                                <TableCell sx={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    position: "sticky",
                                    left: 260,
                                    color: stockSummary.cbp < 0 ? "#d50000" : "black",
                                    backgroundColor: lightenColor("#929292ff", 0.6),
                                    paddingLeft: "20px !important",
                                    paddingRight: "20px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                }}>
                                    {stockSummary.cbp.toLocaleString()}
                                </TableCell>
                                <TableCell sx={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    position: "sticky",
                                    left: 380,
                                    color: stockSummary.total < 0 ? "#d50000" : "black",
                                    backgroundColor: lightenColor("#929292ff", 0.4),
                                    paddingLeft: "30px !important",
                                    paddingRight: "30px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                }}>
                                    {stockSummary.total.toLocaleString()}
                                </TableCell>
                                {daysInMonth.map((d) => (
                                    <TableCell
                                        key={d}
                                        sx={{
                                            width: 50,
                                            textAlign: "right",
                                            fontWeight: "bold",
                                            color: dailySummaryByStock[d] < 0 ? "#d50000" : "black",
                                            backgroundColor: lightenColor("#929292ff", 0.6),
                                            paddingLeft: "35px !important",
                                            paddingRight: "35px !important",
                                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                        }}
                                    >
                                        {dailySummaryByStock[d] === 0
                                            ? "-"
                                            : new Intl.NumberFormat("en-US").format(Math.round(dailySummaryByStock[d]))}
                                    </TableCell>
                                ))}
                                <TableCell sx={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    position: "sticky",
                                    right: 220,
                                    color: stockSummary.carry < 0 ? "#d50000" : "black",
                                    backgroundColor: lightenColor("#929292ff", 0.4),
                                    paddingLeft: "10px !important",
                                    paddingRight: "10px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                }}>
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }).format((stockSummary.carry))}
                                </TableCell>
                                <TableCell sx={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                    position: "sticky",
                                    right: 100,
                                    color: stockSummary.accumulate < 0 ? "#d50000" : "black",
                                    backgroundColor: lightenColor("#929292ff", 0.4),
                                    paddingLeft: "10px !important",
                                    paddingRight: "10px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                }}>
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }).format((stockSummary.accumulate))}
                                </TableCell>
                            </TableRow>
                        }
                    </React.Fragment>
                )
            }
        </React.Fragment>
    );
};

export default ReportDetail;
