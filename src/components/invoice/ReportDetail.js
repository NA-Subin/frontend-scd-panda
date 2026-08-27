import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/th"; // โหลดภาษาไทย
import buddhistEra from 'dayjs/plugin/buddhistEra'; // ใช้ plugin Buddhist Era (พ.ศ.)
import { formatThaiFullYear, formatThaiSlash } from "../../theme/DateTH";

dayjs.locale('th');
dayjs.extend(buddhistEra);

const ReportDetail = (props) => {
    const { row, dateStart, dateEnd, orderDetail } = props;
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    console.log("orderDetail : ", orderDetail);

    const orders = orderDetail
        .filter(order => order.TicketName === row.TicketName)
        .sort((a, b) => {
            const dateA = dayjs(a.Date, "DD/MM/YYYY");
            const dateB = dayjs(b.Date, "DD/MM/YYYY");

            // เปรียบเทียบวันที่แบบ numeric difference
            const dateDiff = dateA.diff(dateB);
            if (dateDiff !== 0) return dateDiff;

            const driverA = a.Driver?.split(":")[1]?.trim() || '';
            const driverB = b.Driver?.split(":")[1]?.trim() || '';
            return driverA.localeCompare(driverB);
        });

    // 1. จัดกลุ่มตาม Date + Driver/Registration
    const grouped = orders.reduce((acc, order) => {
        const groupKey = `${order.Date}|${order.Driver}|${row.Registration}`;
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(order);
        return acc;
    }, {});

    console.log("Grouped Orders : ", grouped);
    // 2. แปลงเป็น array สำหรับแสดงผล
    const groupedOrders = Object.entries(grouped); // [ [key, [order1, order2]], ... ]

    const summary = groupedOrders.reduce(
        (acc, [, groupOrders]) => {
            const groupAmount = groupOrders.reduce((sum, o) => sum + Number(o.Amount || 0), 0);

            const groupIncoming = (groupOrders[0]?.IncomingMoneyDetail || [])
                .reduce((sum, m) => sum + Number(m.IncomingMoney || 0), 0);

            const groupVolume = groupOrders.reduce((sum, o) => sum + Number(o.VolumeProduct || 0), 0);

            acc.totalAmount += groupAmount;
            acc.totalIncomingMoney += groupIncoming;
            acc.totalVolume += groupVolume;

            return acc;
        },
        { totalAmount: 0, totalIncomingMoney: 0, totalVolume: 0 }
    );

    const totalOverdueTransfer =
        summary.totalAmount - summary.totalIncomingMoney;

    const safeOverdue =
        Math.abs(totalOverdueTransfer) < 1e-9 ? 0 : totalOverdueTransfer;

    const formatted = `${dayjs(dateStart).locale("th").format("วันที่ D เดือนMMMM พ.ศ.BBBB")} - ${dayjs(dateEnd).locale("th").format("วันที่ D เดือนMMMM พ.ศ.BBBB")}`;

    const invoiceRef = useRef(null);
    const [isGrayscale, setIsGrayscale] = useState(false);

    const toNumber = (val) => {
        if (val === null || val === undefined) return 0;

        const cleaned = String(val)
            .replace(/,/g, "")   // ลบ comma
            .trim();             // ลบช่องว่าง

        const num = Number(cleaned);
        return isNaN(num) ? 0 : num;
    };

    const parseDMYToDate = (str) => {
        if (!str) return null;

        // รองรับทั้ง ISO และ DMY
        if (str.includes("-")) return new Date(str);

        const [d, m, y] = str.split("/").map(Number);
        if (!d || !m || !y) return null;

        const year = y > 2400 ? y - 543 : y; // กันปี พ.ศ.
        return new Date(year, m - 1, d);
    };;

    const handleExportPDF = () => {
        // เปิดโหมดขาวดำก่อน export
        setIsGrayscale(true);

        // เล็กน้อยหน่วงให้สไตล์ขาวดำ apply ก่อน แล้วค่อยสร้าง pdf
        setTimeout(() => {
            const element = invoiceRef.current;
            const opt = {
                margin: 1,
                filename: `R-${row.TicketName?.split(":")[1] || "invoice"}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    onclone: (clonedDoc) => {
                        const el = clonedDoc.getElementById("invoiceContent");
                        if (el) {
                            el.style.filter = "grayscale(100%)";
                            // เพิ่มปรับสีอื่น ๆ ถ้าต้องการ
                        }
                    },
                },
                jsPDF: { unit: "cm", format: "a4", orientation: "landscape" },
            };
            html2pdf().set(opt).from(element).save()
                .finally(() => {
                    // หลังบันทึก PDF เสร็จ กลับโหมดปกติ
                    setIsGrayscale(false);
                });
        }, 300);
    };

    // 1️⃣ เตรียมยอดรวมตามวันที่ล่วงหน้า
    const outstandingByDate = {};
    const shownDateOutstanding = new Set();

    groupedOrders.forEach(([groupKey, groupOrders]) => {
        const [date] = groupKey.split("|");

        const totalAmount = groupOrders.reduce((sum, o) => sum + o.Amount, 0);
        const totalIncomingMoney = groupOrders[0].IncomingMoneyDetail?.reduce(
            (sum, o) => sum + Number(o.IncomingMoney || 0),
            0
        ) || 0;

        if (!outstandingByDate[date]) {
            outstandingByDate[date] = { amount: 0, incoming: 0 };
        }

        // ✅ รวมยอดของทุกคนในวันเดียวกัน
        outstandingByDate[date].amount += totalAmount;
        outstandingByDate[date].incoming += totalIncomingMoney;
    });

    return (
        <React.Fragment>
            <IconButton sx={{ marginTop: -0.5, marginBottom: -0.5, color: theme.palette.info.main }} onClick={() => setOpen(true)}>
                <FindInPageIcon />
            </IconButton>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="lg"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >ตรวจสอบข้อมูลรายงานการชำระค่าน้ำมัน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            mt: 1,
                            mb: 1,
                            // เพิ่ม style ขาวดำถ้า isGrayscale = true
                            filter: isGrayscale ? "grayscale(100%) contrast(90%) brightness(90%)" : "none",
                            backgroundColor: isGrayscale ? "#fff" : "inherit",
                            color: isGrayscale ? "#000" : "inherit",
                            transition: "filter 0.3s ease",
                        }}
                        ref={invoiceRef}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom><b>ชื่อตั๋วลูกค้า :</b> {row.TicketName.split(":")[1]}</Typography>
                        </Grid>
                        <Grid item xs={12} marginTop={-3}>
                            <Typography variant="h6" gutterBottom><b>ช่วงเวลา :</b> {formatted}</Typography>
                        </Grid>
                        <Grid item xs={12} marginTop={-3}>
                            <TableContainer
                                component={Paper}
                                sx={{ marginBottom: 2, borderRadius: 2, width: "100%" }}
                            >
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TablecellTickets sx={{ textAlign: "center", width: 50, fontSize: "16px" }}>ลำดับ</TablecellTickets>
                                            <TablecellTickets sx={{ textAlign: "center", width: 100, fontSize: "16px" }}>วันที่ส่ง</TablecellTickets>
                                            <TablecellTickets sx={{ textAlign: "center", width: 230, fontSize: "16px" }}>พขร.</TablecellTickets>
                                            <TablecellTickets sx={{ textAlign: "center", width: 70, fontSize: "16px" }}>ชนิดน้ำมัน</TablecellTickets>
                                            <TablecellTickets sx={{ textAlign: "center", width: 120, fontSize: "16px" }}>จำนวนลิตร</TablecellTickets>
                                            <TablecellTickets sx={{ textAlign: "center", width: 70, fontSize: "16px" }}>ราคาน้ำมัน</TablecellTickets>
                                            <TablecellTickets sx={{ textAlign: "center", width: 130, fontSize: "16px" }}>ยอดเงิน</TablecellTickets>
                                        </TableRow>
                                    </TableHead>
                                    {/* <TableBody>
                                        {
                                            orders.map((order, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{order.Date}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{`${order.Driver.split(":")[1]}/${row.Registration.split(":")[1]}`}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{order.ProductName}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(order.VolumeProduct)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(order.RateOil)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(order.Amount)}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody> */}
                                    <TableBody>
                                        {groupedOrders.map(([groupKey, groupOrders], groupIndex) => {
                                            const rowSpan = groupOrders.length;
                                            const [date, driver] = groupKey.split("|");
                                            const registration = row.Registration.split(":")[1] || "";

                                            // คำนวณรวม
                                            const totalVolume = groupOrders.reduce((sum, o) => sum + o.VolumeProduct, 0);
                                            const totalAmount = groupOrders.reduce((sum, o) => sum + o.Amount, 0);
                                            const totalIncomingMoney = groupOrders[0].IncomingMoneyDetail.reduce((sum, o) => sum + o.IncomingMoney, 0);
                                            const avgRateOil = totalAmount && totalVolume
                                                ? totalAmount / totalVolume
                                                : 0;

                                            const amount = toNumber(totalAmount);
                                            const incoming = toNumber(totalIncomingMoney);

                                            let result = amount - incoming;

                                            // กัน -0 และ floating point error
                                            if (Math.abs(result) < 1e-9) result = 0;

                                            return (
                                                <>
                                                    {groupOrders.map((order, index) => (
                                                        <TableRow key={`${groupKey}-${index}`}>
                                                            {index === 0 && (
                                                                <>
                                                                    <TableCell sx={{ textAlign: "center" }} rowSpan={rowSpan}>
                                                                        {groupIndex + 1}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }} rowSpan={rowSpan}>
                                                                        {formatThaiSlash(dayjs(date, "DD/MM/YYYY"))}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }} rowSpan={rowSpan}>
                                                                        {`${driver.split(":")[1]}/${registration}`}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            <TableCell sx={{ textAlign: "center" }}>{order.ProductName}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {new Intl.NumberFormat("en-US").format(order.VolumeProduct)}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(order.RateOil)}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {new Intl.NumberFormat("en-US").format(order.Amount)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}

                                                    {/* 🔽 แถวสรุปของกลุ่ม */}
                                                    <TableRow sx={{ backgroundColor: "#dcdcdc", fontWeight: "bold" }}>
                                                        <TableCell colSpan={4} sx={{ textAlign: "right", fontWeight: "bold" }}>
                                                            ยอดรวมของ {driver.split(":")[1]}/{registration}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                            {new Intl.NumberFormat("en-US").format(totalVolume)}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                            {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(avgRateOil)}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                            {new Intl.NumberFormat("en-US").format(totalAmount)}
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* 🔁 วนลูป IncomingMoneyDetail ถ้ามี */}
                                                    {groupOrders[0].IncomingMoneyDetail?.length > 0 && (
                                                        <React.Fragment>
                                                            {groupOrders[0].IncomingMoneyDetail.map((money, idx) => (
                                                                <TableRow
                                                                    key={`incoming-${groupKey}-${idx}`}
                                                                    sx={{ backgroundColor: "#e8f5e9", fontWeight: "bold" }}
                                                                >
                                                                    <TableCell colSpan={6} sx={{ textAlign: "right", fontWeight: "bold" }}>
                                                                        {(() => {
                                                                            const dateObj = parseDMYToDate(money.DateStart);

                                                                            const dateText = dateObj
                                                                                ? dayjs(dateObj).locale("th").format("วันที่ D เดือนMMMM พ.ศ.BBBB")
                                                                                : "-";

                                                                            const bankName = money.BankName?.split(":")[1] || "-";

                                                                            return groupOrders[0].IncomingMoneyDetail.length > 1
                                                                                ? `ชำระเงินครั้งที่ ${idx + 1} เมื่อ${dateText} ผ่านบัญชี ${bankName} เป็นจำนวนเงินดังนี้`
                                                                                : `ชำระเงินเมื่อ${dateText} ผ่านบัญชี ${bankName} เป็นจำนวนเงินดังนี้`;
                                                                        })()}
                                                                    </TableCell>

                                                                    <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                                        {new Intl.NumberFormat("en-US").format(money.IncomingMoney || 0)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                            <TableRow sx={{ backgroundColor: "#c8e6c9", fontWeight: "bold", borderBottom: "3px solid white" }}>
                                                                <TableCell colSpan={6} sx={{ textAlign: "right", fontWeight: "bold" }}>
                                                                    ยอดค้างชำระรวม
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                                    {new Intl.NumberFormat("en-US", {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }).format(result)}
                                                                </TableCell>
                                                            </TableRow>
                                                        </React.Fragment>
                                                    )}

                                                </>
                                            );
                                        })}
                                        <TableRow sx={{ backgroundColor: theme.palette.success.dark }}>
                                            <TableCell sx={{ textAlign: "right", fontWeight: "bold", fontSize: "16px", color: "white" }} colSpan={2}>ผลรวมทั้งหมด</TableCell>
                                            <TableCell sx={{ textAlign: "right", fontSize: "16px", color: "white" }}>
                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 0.5 }} >
                                                    <Typography variant="subtitle1" fontSize="16px" color="white" sx={{ marginRight: 4 }} gutterBottom><b>จำนวนลิตร : {new Intl.NumberFormat("en-US").format(summary.totalVolume)}</b></Typography>
                                                    <Typography variant="subtitle1" fontSize="16px" color="white" gutterBottom><b>ยอดเงิน : {new Intl.NumberFormat("en-US").format(summary.totalAmount)}</b></Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "right", fontWeight: "bold", fontSize: "16px", color: "white" }}>ยอดชำระ :</TableCell>
                                            <TableCell sx={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", color: "white" }}>{new Intl.NumberFormat("en-US").format(summary.totalIncomingMoney)}</TableCell>
                                            <TableCell sx={{ textAlign: "right", fontWeight: "bold", fontSize: "16px", color: "white" }}>ยอดค้างชำระ :</TableCell>
                                            <TableCell sx={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", color: "white" }}>{new Intl.NumberFormat("en-US").format(safeOverdue)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Button onClick={handleExportPDF} variant="contained" color="primary">บันทึกเป็น PDF</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default ReportDetail;
