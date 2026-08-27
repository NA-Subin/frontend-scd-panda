import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/th";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { formatThaiFull } from "../../theme/DateTH";
import { IconButtonError, IconButtonSuccess, TablecellPink, TablecellSelling } from "../../theme/style";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import theme from "../../theme/theme";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const ProfitSmallTruck = ({ openNavbar }) => {
    const [open, setOpen] = useState(true);
    const [check, setCheck] = React.useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [checkStatusCompany, setCheckStatusCompany] = useState(true);
    const [selectedRow, setSelectedRow] = useState(0);
    const [indexes, setIndex] = useState(0);

    const handleChangeCheck = () => {
        setCheckStatusCompany(!checkStatusCompany);
        setSelectedRow(0)
        setIndex(0)
    }

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                // ✅ ถ้าคลิกซ้ำ -> สลับ asc/desc
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            } else {
                // ✅ คลิกใหม่ -> asc ก่อน
                return { key, direction: "asc" };
            }
        });
    };

    const { drivers, customertransports, customergasstations, customerbigtruck, customersmalltruck, customertickets } = useBasicData();
    const { order, transferMoney, trip } = useTripData();
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    });

    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });
    const driver = Object.values(drivers || {});
    const ticketsT = Object.values(customertransports || {});
    const ticketsPS = Object.values(customergasstations || {});
    const ticketsB = Object.values(customerbigtruck || {});
    const ticketsS = Object.values(customersmalltruck || {});
    const ticketsA = Object.values(customertickets || {});
    const transferMoneyDetail = Object.values(transferMoney || {});

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

    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateStart(formattedDate);
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateEnd(formattedDate);
        }
    };

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

    const [checkCostPrice, setCheckCostPrice] = useState(false);
    const [costIndex, setCostIndex] = useState(null);
    const [costNo, setCostNo] = useState(null);
    const [costProductName, setCostProductName] = useState(null);
    const [costPrice, setCostPrice] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    console.log(`(${costNo})${costProductName} : ${costPrice}`);

    const result = useMemo(() => {
        return orders
            .filter(
                (tk) =>
                    tk.CustomerType === "ตั๋วรถเล็ก" &&
                    tk.Status !== "ยกเลิก" &&
                    tk.Trip !== "ยกเลิก"
            )
            .flatMap((tk) => {
                const customer = ticketsS.find(
                    (c) => c.id === Number(tk.TicketName.split(":")[0])
                );

                const trip = trips.find((t) => t.id === tk.Trip + 1);
                let Rate = tk.Rate;

                // if (trip?.Depot.split(":")[1] === "ลำปาง") Rate = tk.Rate1;
                // else if (trip?.Depot.split(":")[1] === "พิจิตร") Rate = tk.Rate2;
                // else if (["สระบุรี", "บางปะอิน", "IR"].includes(trip?.Depot.split(":")[1]))
                //     Rate = tk.Rate3;

                return Object.entries(tk.Product)
                    .filter(([key]) => key !== "P")
                    .map(([ProductName, productData]) => ({
                        No: tk.No,
                        Trip: tk.Trip,
                        Date: trip?.DateDelivery,
                        Address: customer?.Address,
                        Registration: tk.Registration,
                        TicketName: tk.TicketName,
                        CustomerType: tk.CustomerType,
                        CreditTime: customer?.CreditTime,
                        Status: tk.Status,
                        StatusCompany: customer?.StatusCompany,
                        ProductName,
                        Rate: parseFloat(Rate) ?? 0,
                        Amount: productData?.Amount ?? 0,
                        RateOil: productData?.RateOil ?? 0,
                        Volume: (Number(productData?.Volume) ?? 0),
                        OverdueTransfer: productData?.OverdueTransfer ?? 0,
                        CostPrice: productData?.CostPrice ?? 0,
                    }));
            })
            // ✅ ฟิลเตอร์เฉพาะข้อมูลในช่วงวันที่ที่เลือก
            .filter((row) => {
                if (!row.Date) return false;

                // แปลงจาก "DD/MM/YYYY" → dayjs object
                const deliveryDate = dayjs(row.Date, "DD/MM/YYYY");

                const isAfterStart =
                    !selectedDateStart || deliveryDate.isSameOrAfter(selectedDateStart, "day");
                const isBeforeEnd =
                    !selectedDateEnd || deliveryDate.isSameOrBefore(selectedDateEnd, "day");

                const companystatus = !checkStatusCompany ? (row.StatusCompany === "อยู่บริษัทในเครือ" || row.TicketName.split(":")[1] === "ต่อภาษี") : row.StatusCompany === "ไม่อยู่บริษัทในเครือ";
                
                const checkTicket = !checkStatusCompany ? (row.TicketName.split(":")[1] === "ต่อภาษี") : (row.TicketName.split(":")[1] !== "ต่อภาษี");

                return isAfterStart && isBeforeEnd && companystatus && checkTicket;
            }).sort((a, b) => {
                const key = sortConfig.key || 'Date';
                const direction = sortConfig.key ? sortConfig.direction : 'asc';
                let aValue, bValue;

                if (key === 'Date') {
                    aValue = dayjs(a.Date, "DD/MM/YYYY");
                    bValue = dayjs(b.Date, "DD/MM/YYYY");
                } else if (key === 'Customer') {
                    aValue = a.TicketName?.split(":")[1] || '';
                    bValue = b.TicketName?.split(":")[1] || '';
                }

                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                return 0;
            });
    }, [sortConfig, orders, ticketsS, trips, selectedDateStart, selectedDateEnd]);

    console.log("Orders : ", orders
        .filter(
            (tk) =>
                tk.CustomerType === "ตั๋วรถเล็ก" &&
                tk.Status !== "ยกเลิก" &&
                tk.Trip !== "ยกเลิก"
        ))
    console.log("trips : ", trips.filter((row) => row.TruckType === "รถเล็ก"));
    console.log("result : ", result);

    // 💡 คำนวณผลรวมก่อน render
    const total = result.reduce(
        (acc, row) => {
            const rateOil = check ? row.RateOil : row.RateOil * row.Volume;
            const rate = check ? row.Rate : row.Rate * row.Volume;
            const costPrice = check ? row.CostPrice : row.CostPrice * row.Volume;
            const diff = rateOil - costPrice - rate;

            return {
                volume: acc.volume + (row.Volume ?? 0),
                rateOil: acc.rateOil + rateOil,
                rate: acc.rate + rate,
                costPrice: parseFloat(acc.costPrice) + costPrice,
                diff: acc.diff + diff,
            };
        },
        { volume: 0, rateOil: 0, rate: 0, costPrice: 0, diff: 0 }
    );

    const totals = result.reduce(
        (acc, row) => {
            const rateOil = row.RateOil * row.Volume;
            const rate = row.Rate * row.Volume;
            const costPrice = row.CostPrice * row.Volume;
            const diff = rateOil - costPrice - rate;

            return {
                volume: acc.volume + (row.Volume ?? 0),
                rateOil: acc.rateOil + rateOil,
                rate: acc.rate + rate,
                costPrice: acc.costPrice + costPrice,
                diff: acc.diff + diff,
            };
        },
        { volume: 0, rateOil: 0, rate: 0, costPrice: 0, diff: 0 }
    );

    // ✅ หาค่าเฉลี่ย
    const avg =
        result.length > 0
            ? {
                volume: check ? totals.volume : totals.volume,
                rateOil: check ? totals.rateOil / totals.volume : totals.rateOil,
                rate: check ? totals.rate / totals.volume : totals.rate,
                costPrice: check ? totals.costPrice / totals.volume : totals.costPrice,
                diff: check ? totals.diff / totals.volume : totals.diff,
            }
            : { volume: 0, rateOil: 0, rate: 0, costPrice: 0, diff: 0 };

    console.log("totals:", totals);
    console.log("avg:", avg);


    const handleCheckUpdate = (row, index) => {
        console.log(`order/${row.No}/Product/${row.ProductName}/`);
        setCostIndex(index);
        setCostNo(row.No);
        setCostProductName(row.ProductName);
        setCostPrice(row.CostPrice);
        setCheckCostPrice(true); // ต้องปิดการแสดงผล
    }

    const handleSave = () => {
        database
            .ref(`order/${costNo}/Product/`)
            .child(costProductName)
            .update({
                CostPrice: costPrice,
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                setCostIndex(null);
                setCostNo(null);
                setCostProductName(null);
                setCheckCostPrice(false);
                setCostPrice("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    const handleCancel = () => {
        setCostIndex(null);
        setCostNo(null);
        setCostProductName(null);
        setCheckCostPrice(false);
        setCostPrice("");
    }

    const exportResultToExcel = async (result, total, check) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานน้ำมัน");

        // 1️⃣ กำหนด columns
        worksheet.columns = [
            { header: "ลำดับ", key: "no", width: 8 },
            { header: "วันที่ส่ง", key: "date", width: 15 },
            { header: "ชื่อตั๋ว/ลูกค้า", key: "ticketName", width: 40 },
            { header: "ชนิดน้ำมัน", key: "product", width: 15 },
            { header: "จำนวนลิตร", key: "volume", width: 20 },
            { header: check ? "ราคาขาย/ลิตร" : "ยอดขาย", key: "rateOil", width: 15 },
            { header: check ? "ราคาทุน/ลิตร" : "ราคาทุน", key: "costPrice", width: 15 },
            { header: check ? "ราคาขนส่ง/ลิตร" : "ค่าขนส่ง", key: "rate", width: 15 },
            { header: check ? "กำไรขาดทุน/ลิตร" : "กำไรขาดทุน", key: "diff", width: 15 },
        ];

        // 2️⃣ Title merge
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "รายงานน้ำมัน";
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { size: 16, bold: true };
        worksheet.getRow(1).height = 30;

        // 3️⃣ Header row
        const headerRow = worksheet.addRow(worksheet.columns.map(c => c.header));
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 4️⃣ Data rows
        result.forEach((row, index) => {
            const dataRow = {
                no: index + 1,
                date: row.Date,
                ticketName: row.TicketName ? row.TicketName.split(":")[1] : "",
                product: row.ProductName,
                volume: row.Volume,
                rateOil: check ? row.RateOil : row.RateOil * row.Volume,
                costPrice: check ? row.CostPrice : row.CostPrice * row.Volume,
                rate: check ? row.Rate : row.Rate * row.Volume,
                diff: (check ? row.RateOil : row.RateOil * row.Volume)
                    - (check ? row.CostPrice : row.CostPrice * row.Volume)
                    - (check ? row.Rate : row.Rate * row.Volume),
            };
            const newRow = worksheet.addRow(dataRow);
            newRow.alignment = { horizontal: "center", vertical: "middle" };
            newRow.height = 20;
            newRow.eachCell((cell, colNumber) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                // ยกเว้น column ลำดับ
                // กำหนด alignment: ชิดซ้ายเฉพาะ ticketName
                if (worksheet.columns[colNumber - 1].key === "ticketName") {
                    cell.alignment = { horizontal: "left", vertical: "middle" };
                } else {
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                }

                // ยกเว้น column ลำดับ ให้ใส่ number format
                if (worksheet.columns[colNumber - 1].key !== "no" && worksheet.columns[colNumber - 1].key !== "ticketName") {
                    cell.numFmt = "#,##0.00";
                }
            });
        });

        // 5️⃣ Footer row รวมค่า
        const footerRow = worksheet.addRow({
            product: check ? "ค่าเฉลี่ยราคา/ลิตร" : "จำนวนเงินรวม",
            volume: avg.volume,
            rateOil: avg.rateOil,
            costPrice: avg.costPrice,
            rate: avg.rate,
            diff: avg.diff,
        });
        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE699" } };
            cell.numFmt = "#,##0.00";
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 6️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `กำไรขายส่งน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    console.log("orders : ", orders);
    console.log("result : ", result);

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Grid container>
                <Grid item md={12} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                            textAlign: "center",
                        }}
                        gutterBottom
                    >
                        กำไรขายส่งน้ำมัน / รถเล็ก
                    </Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 1, marginTop: 2 }} />
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={2} width="100%" marginTop={1} >
                    <Grid item xs={12} sm={9} lg={5}>
                        <Box
                            sx={{
                                width: "100%", // กำหนดความกว้างของ Paper
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 3
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Paper sx={{ marginRight: 2 }}>
                                    <DatePicker
                                        openTo="day"
                                        views={["year", "month", "day"]}
                                        value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
                                        format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                        onChange={handleDateChangeDateStart}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                inputProps: {
                                                    value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                },
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                            <b>วันที่ :</b>
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
                                </Paper>
                                <Paper>
                                    <DatePicker
                                        openTo="day"
                                        views={["year", "month", "day"]}
                                        value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
                                        format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                        onChange={handleDateChangeDateEnd}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                inputProps: {
                                                    value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                },
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                            <b>ถึงวันที่ :</b>
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
                                </Paper>
                            </LocalizationProvider>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={5} sx={{ marginTop: { xs: -4, sm: -4, lg: 0 }, marginBottom: { xs: -1, sm: -1, lg: 0 } }} >
                        <FormGroup row sx={{ marginBottom: -1.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>สถานะ : </Typography>
                            <FormControlLabel control={<Checkbox checked={check ? true : false} color="pink" />} onChange={() => setCheck(true)} label="ราคา/ลิตร" />
                            <FormControlLabel control={<Checkbox checked={!check ? true : false} color="pink" />} onChange={() => setCheck(false)} label="จำนวนเงิน" />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12} sm={3} lg={2} textAlign="right" sx={{ marginTop: { xs: 0, sm: -6, lg: -2 }, marginBottom: { xs: -1, sm: -2, lg: -1 } }} >
                        <Button variant="contained" color="success" size="small" sx={{ marginTop: { xs: -3, sm: -2, lg: 0 }, marginRight: { xs: 2, sm: 0, lg: 0 } }} onClick={() => exportResultToExcel(result, total, check)} gutterBottom>Export Excel</Button>
                        <FormControlLabel
                            sx={{ marginBottom: 3 }}
                            control={
                                <Checkbox
                                    color="pink"
                                    value={checkStatusCompany}
                                    //onChange={() => setCheckStatusCompany(!checkStatusCompany)}
                                    onChange={handleChangeCheck}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                    บริษัทในเครือ
                                </Typography>
                            } />
                    </Grid>
                </Grid>
                <Grid container spacing={2} width="100%" marginTop={-4} >
                    <Grid item xs={12}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "70vh",
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                            >
                                <TableHead sx={{ height: "5vh" }}>
                                    <TableRow>
                                        <TablecellPink width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100, cursor: "pointer" }}
                                            onClick={() => handleSort("Date")}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                วันที่ส่ง
                                                {sortConfig.key === "Date" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 300, cursor: "pointer" }}
                                            onClick={() => handleSort("Customer")}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                ชื่อตั๋ว/ลูกค้า
                                                {sortConfig.key === "Customer" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ชนิดน้ำมัน
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            จำนวนลิตร
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            {check ? "ราคาขาย/ลิตร" : "ยอดขาย"}
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {check ? "ราคาทุน/ลิตร" : "ราคาทุน"}
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {check ? "ราคาขนส่ง/ลิตร" : "ค่าขนส่ง"}
                                        </TablecellPink>
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {check ? "กำไรขาดทุน/ลิตร" : "กำไรขาดทุน"}
                                        </TablecellPink>
                                        {/* <TablecellPink sx={{ textAlign: "center", width: 50 }} /> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        result.map((row, index) =>
                                            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }} >
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Date}</TableCell>
                                                <TableCell sx={{ textAlign: "left" }}>
                                                    <Typography variant="subtitle2" sx={{ marginLeft: 2 }} >
                                                        {row.TicketName ? row.TicketName.split(":")[1] : ""}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.ProductName}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume)}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Typography variant="subtitle2" color={(check ? row.RateOil : (row.RateOil * row.Volume)) === 0 && "lightgray"} gutterBottom>
                                                        {new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }).format(check ? row.RateOil : (row.RateOil * row.Volume))}
                                                    </Typography>
                                                </TableCell>
                                                {
                                                    check ?
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                cursor: "pointer",
                                                                ":hover": {
                                                                    backgroundColor: "#e8eaf6"
                                                                }
                                                            }}
                                                            onClick={() => handleCheckUpdate(row, index)}
                                                        >
                                                            {
                                                                checkCostPrice && costIndex === index ?
                                                                    <Paper sx={{ width: '100%', height: 25, display: "flex", alignItems: "center" }}>
                                                                        <TextField
                                                                            size="small"
                                                                            type={isFocused ? "number" : "text"} // ✅ เปลี่ยน type ตามโหมด focus
                                                                            value={
                                                                                isFocused
                                                                                    ? costPrice === 0
                                                                                        ? "" // ✅ ถ้าเป็น 0 และกำลัง focus → แสดงค่าว่าง
                                                                                        : costPrice
                                                                                    : new Intl.NumberFormat("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    }).format(costPrice || 0) // ✅ แสดงเลขพร้อม format ตอนไม่ได้ focus
                                                                            }
                                                                            variant="outlined"
                                                                            sx={{
                                                                                width: "100%",
                                                                                "& .MuiInputBase-root": {
                                                                                    height: 25,
                                                                                    fontSize: 13,
                                                                                    paddingRight: 0, // เอา padding ด้านขวาออกเพื่อให้ icon ชิดพอดี
                                                                                },
                                                                                "& .MuiOutlinedInput-input": {
                                                                                    paddingLeft: 1,
                                                                                    height: "100%",
                                                                                    fontSize: "16px"
                                                                                },
                                                                            }}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                if (val === "") {
                                                                                    setCostPrice(""); // ✅ ถ้าพิมพ์ว่าง ให้เก็บเป็น string ว่าง
                                                                                } else if (/^\d*\.?\d*$/.test(val)) {
                                                                                    setCostPrice(val); // ✅ เก็บค่าที่พิมพ์อยู่
                                                                                }
                                                                            }}
                                                                            onFocus={() => setIsFocused(true)} // ✅ เข้าสู่โหมดแก้ไข
                                                                            onBlur={(e) => {
                                                                                setIsFocused(false); // ✅ กลับไปโหมดแสดงผล
                                                                                const val = parseFloat(e.target.value);
                                                                                setCostPrice(isNaN(val) ? 0 : val); // ✅ ถ้าไม่พิมพ์อะไร ให้กลับเป็น 0
                                                                            }}
                                                                            InputProps={{
                                                                                endAdornment: (
                                                                                    <Box sx={{ backgroundColor: "#e8eaf6", display: "flex", alignItems: "center", justifyContent: "right" }}>
                                                                                        <Tooltip title="ยกเลิก">
                                                                                            <IconButton
                                                                                                size="small"
                                                                                                color="error"
                                                                                                sx={{ p: 0.3 }}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation(); // 💥 ป้องกันไม่ให้ไป trigger onClick ของ TableCell
                                                                                                    handleCancel();
                                                                                                }}
                                                                                            >
                                                                                                <CancelIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                        <Tooltip title="บันทึก">
                                                                                            <IconButton
                                                                                                size="small"
                                                                                                color="success"
                                                                                                sx={{ p: 0.3 }}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation(); // 💥 ป้องกันไม่ให้ไป trigger onClick ของ TableCell
                                                                                                    handleSave();
                                                                                                }}
                                                                                            >
                                                                                                <SaveIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                    </Box>
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </Paper>
                                                                    :
                                                                    <Tooltip title={row.CostPrice === 0 ? "กดเพื่อเพิ่มราคาทุน/ลิตร" : "กดเพื่อแก้ไขราคาทุน/ลิตร"} placement="right" >
                                                                        <Typography variant="subtitle2" color={row.CostPrice === 0 && "lightgray"} gutterBottom>
                                                                            {
                                                                                new Intl.NumberFormat("en-US", {
                                                                                    minimumFractionDigits: 2,
                                                                                    maximumFractionDigits: 2
                                                                                }).format(check ? row.CostPrice : (row.CostPrice * row.Volume))
                                                                            }
                                                                        </Typography>
                                                                    </Tooltip>
                                                            }
                                                        </TableCell>
                                                        :
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            <Typography variant="subtitle2" color={(row.CostPrice * row.Volume) === 0 && "lightgray"} gutterBottom>
                                                                {new Intl.NumberFormat("en-US", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                }).format((row.CostPrice * row.Volume))}
                                                            </Typography>
                                                        </TableCell>
                                                }
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Typography variant="subtitle2" color={(check ? row.Rate : (row.Rate * row.Volume)) === 0 && "lightgray"} gutterBottom>
                                                        {new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }).format(check ? row.Rate : (row.Rate * row.Volume))}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Typography variant="subtitle2"
                                                        color={((check ? row.RateOil : (row.RateOil * row.Volume)) - (check ? row.CostPrice : (row.CostPrice * row.Volume)) - (check ? row.Rate : (row.Rate * row.Volume))) < 0 && theme.palette.error.dark} gutterBottom>
                                                        {new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }).format((check ? row.RateOil : (row.RateOil * row.Volume)) - (check ? row.CostPrice : (row.CostPrice * row.Volume)) - (check ? row.Rate : (row.Rate * row.Volume)))}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                                {
                                    result.length !== 0 &&
                                    <TableFooter
                                        sx={{
                                            position: "sticky",
                                            height: "5vh",
                                            bottom: 0,
                                            zIndex: 2,
                                            backgroundColor: theme.palette.panda.dark,
                                        }}
                                    >
                                        <TableRow>
                                            <TablecellPink sx={{ textAlign: "right", fontSize: 16 }} colSpan={4}>
                                                <Box sx={{ pr: 2 }}>{check ? "ค่าเฉลี่ยราคา/ลิตร" : "จำนวนเงินรวม"}</Box>
                                            </TablecellPink>
                                            <TablecellPink sx={{ textAlign: "center", fontSize: 16 }}>
                                                {new Intl.NumberFormat("en-US").format(avg.volume)}
                                            </TablecellPink>
                                            <TablecellPink sx={{ textAlign: "center", fontSize: 16 }}>
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(avg.rateOil)}
                                            </TablecellPink>
                                            <TablecellPink sx={{ textAlign: "center", fontSize: 16 }}>
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(avg.costPrice)}
                                            </TablecellPink>
                                            <TablecellPink sx={{ textAlign: "center", fontSize: 16 }}>
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(avg.rate)}
                                            </TablecellPink>
                                            <TablecellPink sx={{ textAlign: "center", fontSize: 16 }}>
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(avg.diff)}
                                            </TablecellPink>
                                        </TableRow>
                                    </TableFooter>
                                }
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Box>
        </Container>

    );
};

export default ProfitSmallTruck;
