import React, { useContext, useEffect, useState } from "react";
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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import theme from "../../theme/theme";
import { IconButtonError, TablecellNoData, TablecellSelling } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { formatThaiFull, formatThaiYear } from "../../theme/DateTH";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import TablePaginationBar from "../../theme/TablePaginationBar";

const MoneyGuarantee = ({ money, periods, name }) => {
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานยอดสะสมเงินค้ำประกัน");

        // ✅ กำหนด column (ตรงกับ TableHead)
        worksheet.columns = [
            { header: "งวดจ่ายปี", key: "year", width: 15 },
            { header: "ลำดับงวด", key: "period", width: 15 },
            { header: "เดือน", key: "month", width: 40 },
            { header: "หักเงินค้ำประกัน", key: "deduct", width: 20 },
            { header: "คืนเงินค้ำประกัน", key: "return", width: 20 },
            { header: "ยอดสะสม", key: "total", width: 20 },
        ];

        // ✅ Title
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "รายงานยอดสะสมเงินค้ำประกัน";
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { size: 16, bold: true };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDDEBF7" },
        };

        worksheet.mergeCells(2, 1, 2, worksheet.columns.length);
        const titleCell2 = worksheet.getCell("A2");
        titleCell2.value = `พนักงานขับรถ : ${name}`;
        titleCell2.alignment = { horizontal: "left", vertical: "middle" };
        titleCell2.font = { size: 14, bold: true };
        titleCell2.height = 30;
        titleCell2.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDDEBF7" },
        };

        // ✅ Header row (row 2)
        const headerValues = worksheet.columns.map(col => col.header);
        const headerRow = worksheet.addRow(headerValues);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 25;
        headerRow.eachCell(cell => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFBDD7EE" }
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // ✅ เติมข้อมูลแถว (ใช้ข้อมูลจาก money)
        let cumulative = 0;
        money.forEach((row, index) => {
            const periodData = periods.find(p => p.no === row.Period);

            // คำนวณยอดสะสม
            row.Type === "รายได้" ? cumulative += Number(row.Money || 0) :
            cumulative -= Number(row.Money || 0);

            const dataRow = {
                year: formatThaiYear(dayjs(row.Year, "YYYY")),
                period: row.Period,
                month: periodData
                    ? `วันที่ ${formatThaiFull(dayjs(periodData.start, "DD/MM/YYYY"))} - วันที่ ${formatThaiFull(dayjs(periodData.end, "DD/MM/YYYY"))}`
                    : "-",
                deduct: row.Type === "รายได้" ? Number(row.Money) : "-",
                return: row.Type === "รายหัก" ? Number(row.Money) : "-",
                total: cumulative
            };

            const newRow = worksheet.addRow(dataRow);
            newRow.height = 20;
            newRow.alignment = { vertical: "middle", horizontal: "center" };
            newRow.eachCell((cell, colNumber) => {
                const colKey = worksheet.columns[colNumber - 1].key;
                // จัดรูปแบบตัวเลขเฉพาะคอลัมน์ที่เป็นเงิน
                if (["deduct", "return", "total"].includes(colKey)) {
                    cell.numFmt = "#,##0.00";
                }
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });
        });

        // ✅ แถวสรุป
        const totalDeduct = money
            .filter(r => r.Type === "รายได้")
            .reduce((acc, r) => acc + Number(r.Money || 0), 0);
        const totalReturn = money
            .filter(r => r.Type === "รายหัก")
            .reduce((acc, r) => acc + Number(r.Money || 0), 0);

        const footerRow = worksheet.addRow({
            month: "รวม",
            deduct: totalDeduct,
            return: totalReturn,
            total: cumulative
        });

        footerRow.font = { bold: true };
        footerRow.alignment = { horizontal: "center", vertical: "middle" };
        footerRow.height = 25;
        footerRow.eachCell(cell => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFE699" } // เหลือง
            };
            cell.numFmt = "#,##0.00";
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // ✅ Save File
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer]),
            `รายงานยอดสะสมเงินค้ำประกัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`
        );
    };

    const totalMoney = money.reduce((acc, doc) => {
        const value = Number(doc.Money) || 0;

        if (doc.Type === "รายได้") {
            return acc + value; // ✅ รายได้ = บวก
        } else if (doc.Type === "รายหัก") {
            return acc - value; // ✅ รายหัก = ลบ
        }

        return acc;
    }, 0);

    // ✅ Compute the running balance for every row first (it depends on the
    // full, unsliced history), then paginate only the on-screen rows.
    const rowsWithCumulative = money.map((row, index) => {
        const cumulative = money
            .slice(0, index + 1)
            .reduce((acc, doc) =>
                doc.Type === "รายได้"
                    ? acc + Number(doc.Money || 0)
                    : acc - Number(doc.Money || 0)
                , 0);
        return { row, cumulative, index };
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const moneyPageCount = Math.max(1, Math.ceil(rowsWithCumulative.length / rowsPerPage));
    const safePage = Math.min(page, moneyPageCount - 1);
    const pagedRows = rowsWithCumulative.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

    return (
        <React.Fragment>
            <Tooltip title={"กดเพื่อดูรายละเอียดยอดสะสมเงินค้ำประกัน"} placement="left">
                <TableCell
                    sx={{
                        textAlign: "left",
                        cursor: "pointer",
                        "&:hover": {
                            backgroundColor: "#ebf1ffff",
                        },
                    }}
                    onClick={handleClickOpen}
                >
                    <Box
                        display="flex"
                        justifyContent="space-between" // ไอคอนชิดขวา
                        alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                        width="100%"
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{
                                lineHeight: 1,
                                textAlign: "right",
                                width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                                paddingLeft: "30px !important",
                                paddingRight: "30px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                color:
                                    totalMoney === 0
                                        ? "lightgray" // ✅ ถ้าเป็นศูนย์ ให้เทา
                                        : totalMoney < 0
                                            ? "red" // (ตัวเลือกเสริม) ถ้าติดลบให้แดง
                                            : "inherit", // ปกติ
                            }}
                        >
                            {new Intl.NumberFormat("en-US").format(totalMoney)}
                        </Typography>
                    </Box>
                </TableCell>
            </Tooltip>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleClose}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >ยอดสะสมเงินค้ำประกัน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent >
                    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: -2 }}>
                        <Grid item xs={10}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: "18px" }} >พนักงานขับรถ : {name}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Button variant="contained" color="success" size="small" onClick={() => exportToExcel()} fullWidth >Export Excel</Button>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "50vh",
                                marginTop: 2
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                            >
                                <TableHead sx={{ height: "5vh" }}>
                                    <TableRow>
                                        <TablecellSelling width={80} sx={{ textAlign: "center", fontSize: 16 }}>
                                            งวดจ่ายปี
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                            ลำดับงวด
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                            เดือน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 115 }}>
                                            หักเงินค้ำประกัน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 115 }}>
                                            คืนเงินค้ำประกัน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            ยอดสะสม
                                        </TablecellSelling>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rowsWithCumulative.length === 0 ? (
                                        <TableRow>
                                            <TablecellNoData colSpan={6}>
                                                <Inventory fontSize="large" />
                                                <br />
                                                ไม่มีข้อมูล
                                            </TablecellNoData>
                                        </TableRow>
                                    ) : (
                                    pagedRows.map(({ row, cumulative, index }) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    {formatThaiYear(dayjs(row.Year, "YYYY"))}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Period}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    {periods
                                                        .filter((p) => p.no === row.Period)
                                                        .map((p) => (
                                                            <Typography key={p.id} variant="subtitle2">
                                                                {`วันที่ ${formatThaiFull(dayjs(p.start, "DD/MM/YYYY"))} - วันที่ ${formatThaiFull(
                                                                    dayjs(p.end, "DD/MM/YYYY")
                                                                )}`}
                                                            </Typography>
                                                        ))}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Type === "รายได้" ? new Intl.NumberFormat("en-US").format(row.Money || 0) : "-"}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Type === "รายหัก" ? new Intl.NumberFormat("en-US").format(row.Money || 0) : "-"}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(cumulative || 0)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePaginationBar
                            count={rowsWithCumulative.length}
                            page={safePage}
                            rowsPerPage={rowsPerPage}
                            onPageChange={setPage}
                            onRowsPerPageChange={setRowsPerPage}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default MoneyGuarantee;
