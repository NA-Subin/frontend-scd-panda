import React, { useContext, useEffect, useMemo, useState } from "react";
import {
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
} from "@mui/material";
import { IconButtonError, RateOils, TablecellHeader, TablecellNoData, TablecellPink } from "../../theme/style";
import TablePaginationBar from "../../theme/TablePaginationBar";
import { Inventory } from "@mui/icons-material";
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import UpdateInvoice from "./UpdateInvoice";
import theme from "../../theme/theme";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";

const InvoiceSmallTruck = ({ openNavbar }) => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(1);

  const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
  const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
  const [checkOverdueTransfer, setCheckOverdueTransfer] = useState(true);
  const [check, setCheck] = useState(3); // 1 = ทั้งหมด, 2 = กำลังจัดเที่ยววิ่ง, 3 = ยกเลิก, 4 = จบทริป
  const [ticketNo, setTicketNo] = useState("");
  const [newDate, setDate] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: 'Date',
    direction: 'asc',
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDateChangeDateStart = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
      setSelectedDateStart(formattedDate);
      setCheckOverdueTransfer(false); // เลือกวันที่แล้วต้องใช้ตัวกรองวันที่ทันที ไม่ใช่ถูกข้ามเพราะ "ค้างโอน" ยังติ๊กอยู่
    }
  };

  const handleDateChangeDateEnd = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
      setSelectedDateEnd(formattedDate);
      setCheckOverdueTransfer(false);
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

  const formatBalanceOrOverdue = (totalAmount, totalOverdue) => {
    const toNumber = (val) => {
      if (val === null || val === undefined || val === "") return 0;

      const cleaned = String(val).replace(/,/g, "");
      const num = Number(cleaned);

      return isNaN(num) ? 0 : num;
    };

    const amount = toNumber(totalAmount);
    const overdue = toNumber(totalOverdue);

    // ✅ คำนวณผลต่างจริง
    let balance = amount - overdue;

    // ✅ กัน floating error เช่น 0.0000000002
    balance = Math.round(balance * 100) / 100;

    // ✅ กัน -0.00
    if (Math.abs(balance) < 0.005) {
      balance = 0;
    }

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  const [selectedRow, setSelectedRow] = useState(0);
  const [indexes, setIndex] = useState(0);

  const handleChangeCheck = () => {
    setCheckOverdueTransfer(!checkOverdueTransfer);
    setSelectedRow(0)
    setIndex(0)
    setPage(0)
  }

  const handleRowClick = (row, index, newTicketName, newDate) => {
    setSelectedRow(row);
    setIndex(index);
    setTicketNo(Number(newTicketName.split(":")[0]));
    setDate(newDate);
  };

  const { customersmalltruck } = useBasicData();
  const { order, transferMoney, trip } = useTripData();
  const orders = Object.values(order || {}).filter(item => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
  });
  const customerS = Object.values(customersmalltruck || {});
  const trips = Object.values(trip || {}).filter(item => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

    return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
  });
  const transferMoneyDetail = Object.values(transferMoney || {}).filter((row) => row.Status !== "ยกเลิก");

  const orderDetail = orders
    .map((item) => {
      const tripsDate = trips.find((row) => Number(row.id) - 1 === Number(item.Trip)); // หา tripsDate ก่อน
      return { ...item, tripsDate };
    })
    .filter((item) => {
      const itemDate = dayjs(item.tripsDate?.DateDelivery, "DD/MM/YYYY"); // ใช้ DateDelivery
      const customerId = item.TicketName;

      let isInCompany =
        check === 1
          ? customerS.find((customer) => customer.uuid === customerId)
          : check === 2
            ? customerS.find(
              (customer) =>
                customer.uuid === customerId &&
                customer.StatusCompany === "อยู่บริษัทในเครือ"
            )
            : customerS.find(
              (customer) =>
                customer.uuid === customerId &&
                customer.StatusCompany === "ไม่อยู่บริษัทในเครือ"
            );

      return (
        isInCompany &&
        item.CustomerType === "ตั๋วรถเล็ก" &&
        item.Trip !== "ยกเลิก" &&
        item.Status !== "ยกเลิก" &&
        (checkOverdueTransfer ||
          itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
      );
    })
    .map((item) => {
      let totalVolume = 0;
      let totalAmount = 0;

      const totalIncomingMoney = transferMoneyDetail
        .filter((trans) => trans.TicketNo === item.No)
        .reduce((sum, trans) => sum + (parseFloat(trans.IncomingMoney) || 0), 0);

      Object.entries(item.Product || {}).forEach(([key, value]) => {
        if (key !== "P") {
          totalVolume += parseFloat(value.Volume || 0);
          totalAmount += parseFloat(value.Amount || 0);
        }
      });

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalAmount: totalAmount,
        TotalOverdue: totalIncomingMoney,
        DateReceive: item.tripsDate?.DateReceive,
        DateDelivery: item.tripsDate?.DateDelivery,
      };
    })
    // 🔽 รวมรายการซ้ำกันตรงนี้
    .reduce((acc, curr) => {
      const key = `${curr.tripsDate?.DateDelivery}_${curr.TicketName}`; // ใช้ DateDelivery เป็น key
      const existing = acc.find(
        (item) => `${item.tripsDate?.DateDelivery}_${item.TicketName}` === key
      );

      if (existing) {
        existing.TotalVolume += curr.TotalVolume;
        existing.TotalAmount += curr.TotalAmount;
        existing.TotalOverdue += curr.TotalOverdue;
      } else {
        acc.push({ ...curr });
      }

      return acc;
    }, [])
    .sort((a, b) => (a.TicketNameName || "").localeCompare(b.TicketNameName || ""));

  const sortedOrderDetail = useMemo(() => {
    const sorted = [...orderDetail];
    const key = sortConfig.key || 'Date';
    const direction = sortConfig.key ? sortConfig.direction : 'asc';

    sorted.sort((a, b) => {
      let aValue, bValue;

      if (key === 'Date') {
        aValue = dayjs(a.DateDelivery, "DD/MM/YYYY");
        bValue = dayjs(b.DateDelivery, "DD/MM/YYYY");
      } else if (key === 'TicketName') {
        aValue = a.TicketNameName || '';
        bValue = b.TicketNameName || '';
      } else if (key === 'DueDate') {
        aValue = dayjs(a.DateDelivery, "DD/MM/YYYY").add((a.CreditTime === "-" || a.CreditTime === "0") ? 0 : Number(a.CreditTime), "day");
        bValue = dayjs(b.DateDelivery, "DD/MM/YYYY").add((b.CreditTime === "-" || b.CreditTime === "0") ? 0 : Number(b.CreditTime), "day");
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [orderDetail, sortConfig]);

  const displayRows = sortedOrderDetail.filter((row) => {
    const amount = Number(String(row.TotalAmount).replace(/,/g, "")) || 0;
    const overdue = Number(String(row.TotalOverdue).replace(/,/g, "")) || 0;

    let result = amount - overdue;

    // ✅ กัน floating error เช่น -0.0000001
    if (Math.abs(result) < 1e-9) result = 0;

    // ✅ แสดงเฉพาะรายการที่ "ไม่ใช่ 0"
    return result !== 0 || (amount === 0 && overdue === 0);
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const activeRows = checkOverdueTransfer ? displayRows : sortedOrderDetail;
  const pageCount = Math.max(1, Math.ceil(activeRows.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);
  const pagedActiveRows = activeRows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
      <Grid container>
        <Grid item md={3} xs={12}>

        </Grid>
        <Grid item md={9} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            ชำระค่าน้ำมัน / รถเล็ก
          </Typography>
        </Grid>
        <Grid item md={5} xs={12}>
          <Box
            sx={{
              width: "100%", // กำหนดความกว้างของ Paper
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: { md: -8, xs: 2 },
              marginBottom: 3
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
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
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 1 }} />
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2} marginTop={3}>
          <Grid item xs={12}>
            <FormGroup row sx={{ marginBottom: -1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
              <FormControlLabel control={<Checkbox color="pink" checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
              <FormControlLabel control={<Checkbox color="pink" checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="อยู่บริษัทในเครือ" />
              <FormControlLabel control={<Checkbox color="pink" checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="ไม่อยู่บริษัทในเครือ" />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            {
              <Grid container spacing={2} sx={{ marginTop: -5, }}>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    {
                      windowWidth <= 900 ?
                        <Grid item xs={12} display="flex" justifyContent="right" alignItems="center">
                          <FormControlLabel control={
                            <Checkbox
                              color="pink"
                              checked={checkOverdueTransfer}
                              onChange={handleChangeCheck}
                            />
                          }
                            label={
                              <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                ค้างโอน
                              </Typography>
                            } />
                        </Grid>
                        :
                        <>
                          <Grid item xs={6}>
                            <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginTop: 2, marginBottom: -1 }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
                          </Grid>
                          <Grid item xs={6} display="flex" justifyContent="right" alignItems="center">
                            <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginBottom: -1, marginRight: 1 }} gutterBottom>*เลือกดูเฉพาะค้างโอนหรือดูทั้งหมด กดตรงนี้*</Typography>
                            <FormControlLabel control={
                              <Checkbox
                                color="pink"
                                checked={checkOverdueTransfer}
                                onChange={handleChangeCheck}
                              />
                            }
                              label={
                                <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                  ค้างโอน
                                </Typography>
                              } />
                          </Grid>
                        </>
                    }
                  </Grid>
                  <TableContainer
                    component={Paper}
                    sx={{ marginBottom: 2, height: "250px" }}
                  >
                    <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
                      <TableHead sx={{ height: "5vh" }}>
                        <TableRow>
                          <TablecellPink width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                            ลำดับ
                          </TablecellPink>
                          <TablecellPink
                            onClick={() => handleSort("Date")}
                            sx={{ textAlign: "center", fontSize: 16, width: 120 }}
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
                          <TablecellPink
                            onClick={() => handleSort("DueDate")}
                            sx={{ textAlign: "center", fontSize: 16, width: 120 }}
                          >
                            <Box display="flex" alignItems="center" justifyContent="center">
                              กำหนดชำระเงิน
                              {sortConfig.key === "DueDate" ? (
                                sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </Box>
                          </TablecellPink>
                          <TablecellPink
                            onClick={() => handleSort("TicketName")}
                            sx={{ textAlign: "center", fontSize: 16, width: 350 }}
                          >
                            <Box display="flex" alignItems="center" justifyContent="center">
                              ชื่อตั๋ว
                              {sortConfig.key === "TicketName" ? (
                                sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </Box>
                          </TablecellPink>
                          <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                            จำนวนลิตร
                          </TablecellPink>
                          <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                            ยอดเงิน
                          </TablecellPink>
                          <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                            ยอดโอน
                          </TablecellPink>
                          <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                            ค้างโอน
                          </TablecellPink>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          activeRows.length === 0 ? (
                            <TableRow>
                              <TablecellNoData colSpan={8}>
                                <Inventory fontSize="large" />
                                <br />
                                ไม่มีข้อมูล
                              </TablecellNoData>
                            </TableRow>
                          ) : checkOverdueTransfer ?
                            pagedActiveRows.map((row, index) => {
                              return (
                                <TableRow key={row.No} onClick={() => handleRowClick(row.No, index, row.TicketName, row.DateDelivery)}
                                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow === row.No) || (indexes === index) ? "#fff59d" : "" }}
                                >
                                  <TableCell sx={{ textAlign: "center", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                    {safePage * rowsPerPage + index + 1}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                    {formatThaiSlash(dayjs(row.DateDelivery, "DD/MM/YYYY"))}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                    {formatThaiSlash(
                                      dayjs(row.DateDelivery, "DD/MM/YYYY")
                                        .add((row.CreditTime === "-" || row.CreditTime === "0") ? 0 : Number(row.CreditTime), "day")
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "left", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                    <Box sx={{ marginLeft: 4, }}>
                                      {row.TicketNameName}
                                    </Box>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      textAlign: "right",
                                      fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                      paddingLeft: "10px !important",
                                      paddingRight: "10px !important",
                                      fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                    }}>
                                    {new Intl.NumberFormat("en-US").format(row.TotalVolume)}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      textAlign: "right",
                                      fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                      paddingLeft: "10px !important",
                                      paddingRight: "10px !important",
                                      fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}>
                                    {new Intl.NumberFormat("en-US").format(row.TotalAmount)}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      textAlign: "right",
                                      fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                      paddingLeft: "10px !important",
                                      paddingRight: "10px !important",
                                      fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}>
                                    {new Intl.NumberFormat("en-US").format(row.TotalOverdue)}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      textAlign: "right",
                                      fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                      paddingLeft: "10px !important",
                                      paddingRight: "10px !important",
                                      fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                    }}>
                                    {
                                      (() => {
                                        const amount = Number(String(row.TotalAmount).replace(/,/g, "")) || 0;
                                        const overdue = Number(String(row.TotalOverdue).replace(/,/g, "")) || 0;

                                        let result = amount - overdue;

                                        // ✅ กัน floating error + ลบ -0
                                        if (Math.abs(result) < 1e-9) result = 0;

                                        return new Intl.NumberFormat("en-US").format(result);
                                      })()
                                    }
                                  </TableCell>
                                </TableRow>
                              )
                            }
                            )
                            :
                            pagedActiveRows.map((row, index) => (
                              <TableRow key={row.No} onClick={() => handleRowClick(row.No, index, row.TicketName, row.DateDelivery)}
                                sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow === row.No) || (indexes === index) ? "#fff59d" : "" }}
                              >
                                <TableCell sx={{ textAlign: "center", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                  {safePage * rowsPerPage + index + 1}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                  {row.DateDelivery}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                  {dayjs(row.DateDelivery, "DD/MM/YYYY")
                                    .add(row.CreditTime === "-" ? 0 : row.CreditTime, "day")
                                    .format("DD/MM/YYYY")}
                                </TableCell>
                                <TableCell sx={{ textAlign: "left", fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold" }}>
                                  <Box sx={{ marginLeft: 4, }}>
                                    {row.TicketNameName}
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "right",
                                    fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                    paddingLeft: "30px !important",
                                    paddingRight: "30px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                  }}>
                                  {new Intl.NumberFormat("en-US").format(row.TotalVolume)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "right",
                                    fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                    paddingLeft: "10px !important",
                                    paddingRight: "10px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                  }}>
                                  {new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(row.TotalAmount)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "right",
                                    fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                    paddingLeft: "10px !important",
                                    paddingRight: "10px !important",
                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                  }}>
                                  {new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(row.TotalOverdue)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "right",
                                    fontWeight: ((selectedRow === row.No) || (indexes === index)) && "bold",
                                    paddingLeft: "10px !important",
                                    paddingRight: "10px !important",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {formatBalanceOrOverdue(row.TotalAmount, row.TotalOverdue)}
                                </TableCell>
                              </TableRow>
                            ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePaginationBar
                    count={activeRows.length}
                    page={safePage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                  />
                </Grid>
                <Grid item xs={12}>
                  {
                    pagedActiveRows.map((row, index) => (
                      (selectedRow && selectedRow === row.No) || indexes === index ?
                        <UpdateInvoice key={row.No} ticket={row} ticketNo={ticketNo} date={newDate} openNavbar={openNavbar} />
                        : ""
                    ))
                  }
                </Grid>
              </Grid>
            }
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default InvoiceSmallTruck;
