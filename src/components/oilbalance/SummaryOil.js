import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import theme from "../../theme/theme";
import {
  RateOils,
  TablecellFinancial,
  TablecellFinancialHead,
  TablecellHeader,
  TablecellInfo,
  TablecellNoData,
  TablecellPrimary,
  TablecellSelling,
  TablecellTickets,
} from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";
import TablePaginationBar from "../../theme/TablePaginationBar";

const SummaryOilBalance = ({ openNavbar }) => {
  const [date, setDate] = React.useState(false);
  const [check, setCheck] = React.useState(false);
  const [months, setMonths] = React.useState(dayjs(new Date()));
  const [years, setYears] = React.useState(dayjs(new Date()));
  const [driverDetail, setDriver] = React.useState([]);
  const [selectDriver, setSelectDriver] = React.useState(0);
  const [selectTickets, setSelectTickets] = React.useState("0:แสดงทั้งหมด");
  const [selectedDateStart, setSelectedDateStart] = useState(
    dayjs().startOf("month"),
  );
  const [selectedDateEnd, setSelectedDateEnd] = useState(
    dayjs().endOf("month"),
  );
  const [sortConfig, setSortConfig] = useState({
    key: "Date",
    direction: "asc",
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      let width = window.innerWidth;
      if (!openNavbar) {
        width += 120; // ✅ เพิ่ม 200 ถ้า openNavbar = false
      }
      setWindowWidth(width);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [openNavbar]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleChangeDriver = (event) => {
    setSelectDriver(event.target.value);
  };

  const handleChangeTickets = (event) => {
    setSelectTickets(event.target.value);
  };

  const handleDateChangeDateStart = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue);
      setSelectedDateStart(formattedDate);
    }
  };

  const handleDateChangeDateEnd = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue);
      setSelectedDateEnd(formattedDate);
    }
  };

  const {
    drivers,
    customertransports,
    customergasstations,
    customerbigtruck,
    customersmalltruck,
    customertickets,
  } = useBasicData();
  const { order, trip } = useTripData();
  const orders = Object.values(order || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });

  const trips = Object.values(trip || {}).filter((item) => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

    return (
      deliveryDate.isSameOrAfter(targetDate, "day") ||
      receiveDate.isSameOrAfter(targetDate, "day")
    );
  });

  const driver = Object.values(drivers || {});
  const ticketsT = Object.values(customertransports || {});
  const ticketsPS = Object.values(customergasstations || {});
  const ticketsB = Object.values(customerbigtruck || {});
  const ticketsS = Object.values(customersmalltruck || {});
  const ticketsA = Object.values(customertickets || {});

  const formatNumber = (value) =>
    value === 0 || value === "0"
      ? "0"
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

  const orderDetail = useMemo(() => {
    if (!selectedDateStart || !selectedDateEnd) return [];

    const productOrder = ["G95", "B95", "D", "G91", "E20", "PWD", "B20"];

    return (
      orders
        .filter((item) => {
          const itemDate = dayjs(item.Date, "DD/MM/YYYY");

          const isValidStatus =
            item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined;
          const isInDateRange = itemDate.isBetween(
            selectedDateStart,
            selectedDateEnd,
            null,
            "[]",
          );
          const matchTickets =
            selectTickets === "0:แสดงทั้งหมด" ||
            item.TicketName === selectTickets;

          const TruckType = trips.find((t) => Number(t.id) - 1 === Number(item.Trip));

          return (
            isValidStatus &&
            isInDateRange &&
            matchTickets &&
            (TruckType?.TruckType === "รถใหญ่" ||
              TruckType?.TruckType === "รถรับจ้างขนส่ง") &&
            TruckType?.Status !== "ยกเลิก"
          );
        })
        .flatMap((item) => {
          if (!item.Product) return [];

          return (
            Object.entries(item.Product)
              // ตัด product "P" ออก
              .filter(([productName]) => productName !== "P")
              .sort(([a], [b]) => {
                const indexA = productOrder.indexOf(a);
                const indexB = productOrder.indexOf(b);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              })
              .map(([productName, productData]) => ({
                ...item,
                ProductName: productName,
                VolumeProduct: productData.Volume,
                Amount: productData.Amount || 0,
                OverdueTransfer: productData.OverdueTransfer || 0,
                RateOil: productData.RateOil || 0,
              }))
          );
        })
        .sort((a, b) => {
          const dateA = dayjs(a.Date, "DD/MM/YYYY");
          const dateB = dayjs(b.Date, "DD/MM/YYYY");

          if (!dateA.isSame(dateB)) return dateA - dateB;
          return (a.DriverName || "").localeCompare(
            b.DriverName || "",
          );
        })
    );
  }, [orders, selectedDateStart, selectedDateEnd, selectTickets]);

  const totalAmount = orderDetail.reduce(
    (sum, item) => sum + Number(item.Amount || 0),
    0,
  );
  const totalVolume = orderDetail.reduce(
    (sum, item) => sum + Number(item.VolumeProduct || 0) * 1000,
    0,
  );

  const sortedOrderDetail = useMemo(() => {
    const sorted = [...orderDetail];
    const key = sortConfig.key || "Date";
    const direction = sortConfig.key ? sortConfig.direction : "asc";

    sorted.sort((a, b) => {
      let aValue, bValue;

      if (key === "Date") {
        aValue = dayjs(a.Date, "DD/MM/YYYY");
        bValue = dayjs(b.Date, "DD/MM/YYYY");
      } else if (key === "Driver") {
        aValue = a.DriverName || "";
        bValue = b.DriverName || "";
      } else if (key === "TicketName") {
        aValue = a.TicketNameName || "";
        bValue = b.TicketNameName || "";
      } else if (key === "ProductName") {
        aValue = a.ProductName || "";
        bValue = b.ProductName || "";
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [orderDetail, sortConfig]);

  const getCustomers = () => {
    const customers = [
      { id: "0", uuid: "0:แสดงทั้งหมด", Name: "แสดงทั้งหมด", CustomerType: "" },
      ...[...ticketsPS]
        .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
        .sort((a, b) =>
          a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" }),
        )
        .map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),

      ...[...ticketsT]
        .filter(
          (item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ",
        )
        .sort((a, b) =>
          a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" }),
        )
        .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),

      ...[...ticketsB]
        .filter((item) => item.Status === "ลูกค้าประจำ")
        .sort((a, b) =>
          a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" }),
        )
        .map((item) => ({ ...item, CustomerType: "ตั๋วรถใหญ่" })),
      // รถใหญ่ใช้ ticketsB
    ];

    return customers.filter((item) => item.id || item.TicketsCode);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Pagination is applied per date+driver group (not per raw row) so that
  // the rowSpan grouping in the table body never gets split across pages.
  const orderGroups = useMemo(() => {
    const groups = [];
    sortedOrderDetail.forEach((row) => {
      const dateKey = formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"));
      const driverKey = `${row.DriverName}/${row.RegistrationName}`;
      const key = `${dateKey}_${driverKey}`;
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.key === key) {
        lastGroup.rows.push(row);
      } else {
        groups.push({ key, rows: [row] });
      }
    });
    return groups;
  }, [sortedOrderDetail]);

  const orderGroupPageCount = Math.max(1, Math.ceil(orderGroups.length / rowsPerPage));
  const safePage = Math.min(page, orderGroupPageCount - 1);
  const pagedOrderDetail = orderGroups
    .slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage)
    .flatMap((g) => g.rows);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("รายงานสรุปยอดน้ำมัน");

    worksheet.columns = [
      { header: "ลำดับ", key: "no", width: 8 },
      { header: "วันที่ส่ง", key: "date", width: 15 },
      { header: "ผู้ขับ/ป้ายทะเบียน", key: "driverReg", width: 40 },
      { header: "ตั๋ว", key: "ticket", width: 45 },
      { header: "ชนิดน้ำมัน", key: "product", width: 15 },
      { header: "จำนวนลิตร", key: "volume", width: 30 },
      { header: "ราคาน้ำมัน", key: "rate", width: 25 },
      { header: "ยอดเงิน", key: "amount", width: 30 },
    ];

    worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "รายงานสรุปยอดน้ำมัน";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { size: 16, bold: true };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDEBF7" },
    };
    worksheet.getRow(1).height = 30;

    const headerRow = worksheet.addRow(worksheet.columns.map((c) => c.header));
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFBDD7EE" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    sortedOrderDetail.forEach((row, index) => {
      const dataRow = {
        no: index + 1,
        date: formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY")),
        driverReg: `${row.DriverName}/${row.RegistrationName}`,
        ticket: row.TicketNameName,
        product: row.ProductName,
        volume: Number(row.VolumeProduct) * 1000,
        rate: Number(row.RateOil),
        amount: Number(row.Amount),
      };

      const newRow = worksheet.addRow(dataRow);
      newRow.height = 20;
      newRow.alignment = { vertical: "middle", horizontal: "center" };
      newRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (worksheet.columns[colNumber - 1].key !== "no") {
          cell.numFmt = "#,##0.00";
        }
      });
    });

    const footerRow = worksheet.addRow({
      ticket: "รวม",
      volume: sortedOrderDetail.reduce(
        (acc, r) => acc + Number(r.VolumeProduct) * 1000,
        0,
      ),
      amount: sortedOrderDetail.reduce((acc, r) => acc + Number(r.Amount), 0),
    });

    footerRow.font = { bold: true };
    footerRow.alignment = { horizontal: "center", vertical: "middle" };
    footerRow.height = 25;
    footerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFE699" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if (
        worksheet.columns[colNumber - 1].key !== "no" &&
        worksheet.columns[colNumber - 1].key !== "driverReg" &&
        worksheet.columns[colNumber - 1].key !== "ticket" &&
        worksheet.columns[colNumber - 1].key !== "product"
      ) {
        cell.numFmt = "#,##0.00";
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `รายงานสรุปยอดน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
    );
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        marginTop: 13,
        marginBottom: 5,
        width:
          windowWidth <= 900 && windowWidth > 600
            ? windowWidth - 110
            : windowWidth <= 600
              ? windowWidth
              : windowWidth - 230,
      }}
    >
      <Grid container spacing={2}>
        <Grid item md={12} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            สรุปยอดน้ำมัน
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 2 }} />
      <Box sx={{ width: "100%" }}>
        {windowWidth >= 800 ? (
          <Grid container spacing={2} width="100%" marginBottom={1}>
            <Grid item sm={12} lg={5}>
              <Box
                sx={{
                  width: "100%",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 3,
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Paper sx={{ marginRight: 2 }}>
                    <DatePicker
                      openTo="day"
                      views={["year", "month", "day"]}
                      value={
                        selectedDateStart
                          ? dayjs(selectedDateStart, "DD/MM/YYYY")
                          : null
                      }
                      format="DD/MM/YYYY"
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
                              <InputAdornment
                                position="start"
                                sx={{ marginRight: 2 }}
                              >
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
                      value={
                        selectedDateEnd
                          ? dayjs(selectedDateEnd, "DD/MM/YYYY")
                          : null
                      }
                      format="DD/MM/YYYY"
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
                              <InputAdornment
                                position="start"
                                sx={{ marginRight: 2 }}
                              >
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
            <Grid item sm={12} lg={5}>
              <Paper>
                <Paper>
                  <Autocomplete
                    id="autocomplete-tickets"
                    options={getCustomers()}
                    getOptionLabel={(option) =>
                      selectTickets === "0:แสดงทั้งหมด"
                        ? option.Name
                        : `${option.Name} (${option.CustomerType})`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.uuid === value.uuid
                    }
                    value={
                      selectTickets
                        ? getCustomers().find(
                            (item) => item.uuid === selectTickets,
                          )
                        : null
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleChangeTickets({
                          target: { value: newValue.uuid },
                        });
                      } else {
                        handleChangeTickets({ target: { value: "" } });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        label=""
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{ marginRight: 1 }}
                            >
                              กรุณาเลือกตั๋ว :
                            </InputAdornment>
                          ),
                          sx: {
                            height: "40px",
                            fontSize: "18px",
                            paddingRight: "8px",
                          },
                        }}
                        InputLabelProps={{ shrink: false }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Typography fontSize="16px">
                          {selectTickets === "0:แสดงทั้งหมด"
                            ? option.Name
                            : `${option.Name} (${option.CustomerType})`}
                        </Typography>
                      </li>
                    )}
                    ListboxProps={{
                      style: {
                        maxHeight: 250,
                      },
                    }}
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item sm={12} lg={2}>
              <Button
                variant="contained"
                size="small"
                color="success"
                sx={{ marginTop: 0.5 }}
                fullWidth
                onClick={exportToExcel}
              >
                Export Excel
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2} p={1}>
            <Grid item xs={12}>
              <Box
                sx={{
                  width: "100%",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 3,
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Paper sx={{ marginRight: 2 }}>
                    <DatePicker
                      openTo="day"
                      views={["year", "month", "day"]}
                      value={
                        selectedDateStart
                          ? dayjs(selectedDateStart, "DD/MM/YYYY")
                          : null
                      }
                      format="DD/MM/YYYY"
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
                              <InputAdornment
                                position="start"
                                sx={{ marginRight: 2 }}
                              >
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
                      value={
                        selectedDateEnd
                          ? dayjs(selectedDateEnd, "DD/MM/YYYY")
                          : null
                      }
                      format="DD/MM/YYYY"
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
                              <InputAdornment
                                position="start"
                                sx={{ marginRight: 2 }}
                              >
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
            <Grid item xs={12}>
              <Paper>
                <Paper>
                  <Autocomplete
                    id="autocomplete-tickets"
                    options={getCustomers()}
                    getOptionLabel={(option) =>
                      selectTickets === "0:แสดงทั้งหมด"
                        ? option.Name
                        : `${option.Name} (${option.CustomerType})`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.uuid === value.uuid
                    }
                    value={
                      selectTickets
                        ? getCustomers().find(
                            (item) => item.uuid === selectTickets,
                          )
                        : null
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleChangeTickets({
                          target: { value: newValue.uuid },
                        });
                      } else {
                        handleChangeTickets({ target: { value: "" } });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        label=""
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{ marginRight: 1 }}
                            >
                              กรุณาเลือกตั๋ว :
                            </InputAdornment>
                          ),
                          sx: {
                            height: "40px",
                            fontSize: "18px",
                            paddingRight: "8px",
                          },
                        }}
                        InputLabelProps={{ shrink: false }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Typography fontSize="16px">
                          {selectTickets === "0:แสดงทั้งหมด"
                            ? option.Name
                            : `${option.Name} (${option.CustomerType})`}
                        </Typography>
                      </li>
                    )}
                    ListboxProps={{
                      style: {
                        maxHeight: 250,
                      },
                    }}
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                size="small"
                color="success"
                sx={{ marginTop: 1.5 }}
                fullWidth
                onClick={exportToExcel}
              >
                Export to Excel
              </Button>
            </Grid>
          </Grid>
        )}
        <Grid container spacing={2} width="100%" sx={{ marginTop: -4 }}>
          <Grid item xs={12}>
            <TableContainer
              component={Paper}
              sx={{
                height: "55vh",
              }}
            >
              <Table
                stickyHeader
                size="small"
                sx={{
                  tableLayout: "fixed",
                  "& .MuiTableCell-root": { padding: "4px" },
                  width: "100%",
                }}
              >
                <TableHead sx={{ height: "5vh" }}>
                  <TableRow>
                    <TablecellInfo
                      width={20}
                      sx={{ textAlign: "center", fontSize: 16 }}
                    >
                      ลำดับ
                    </TablecellInfo>
                    <TablecellInfo
                      onClick={() => handleSort("Date")}
                      sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        วันที่ส่ง
                        {sortConfig.key === "Date" ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowDropDownIcon />
                          ) : (
                            <ArrowDropUpIcon />
                          )
                        ) : (
                          <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                        )}
                      </Box>
                    </TablecellInfo>

                    <TablecellInfo
                      onClick={() => handleSort("Driver")}
                      sx={{ textAlign: "center", fontSize: 16, width: 150 }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        ผู้ขับ/ป้ายทะเบียน
                        {sortConfig.key === "Driver" ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowDropDownIcon />
                          ) : (
                            <ArrowDropUpIcon />
                          )
                        ) : (
                          <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                        )}
                      </Box>
                    </TablecellInfo>
                    <TablecellInfo
                      onClick={() => handleSort("TicketName")}
                      sx={{ textAlign: "center", fontSize: 16, width: 150 }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        ตั๋ว
                        {sortConfig.key === "TicketName" ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowDropDownIcon />
                          ) : (
                            <ArrowDropUpIcon />
                          )
                        ) : (
                          <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                        )}
                      </Box>
                    </TablecellInfo>
                    <TablecellInfo
                      sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                    >
                      ชนิดน้ำมัน
                    </TablecellInfo>
                    <TablecellInfo
                      sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                    >
                      จำนวนลิตร
                    </TablecellInfo>
                    <TablecellInfo
                      sx={{ textAlign: "center", fontSize: 16, width: 70 }}
                    >
                      ราคาน้ำมัน
                    </TablecellInfo>
                    <TablecellInfo
                      sx={{ textAlign: "center", fontSize: 16, width: 70 }}
                    >
                      ยอดเงิน
                    </TablecellInfo>
                    <TablecellInfo sx={{ textAlign: "center", width: 20 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderGroups.length === 0 ? (
                    <TableRow>
                      <TablecellNoData colSpan={9}>
                        <Inventory fontSize="large" />
                        <br />
                        ไม่มีข้อมูล
                      </TablecellNoData>
                    </TableRow>
                  ) : (
                  (() => {
                    // ลำดับกลุ่มต่อเนื่องข้ามหน้า (เริ่มจากจำนวนกลุ่มที่ถูกข้ามไปในหน้าก่อนหน้า)
                    let groupCounter = safePage * rowsPerPage;
                    return pagedOrderDetail.map((row, index) => {
                    const dateKey = formatThaiSlash(
                      dayjs(row.Date, "DD/MM/YYYY"),
                    );
                    const driverKey = `${row.DriverName}/${row.RegistrationName}`;
                    const ticketKey = row.TicketName;
                    const ticketLabel = row.TicketNameName;
                    const groupKey = `${dateKey}_${driverKey}`;
                    const subGroupKey = `${groupKey}_${ticketKey}`;

                    const groupIndexes = pagedOrderDetail
                      .map((r, i) => ({
                        i,
                        match:
                          formatThaiSlash(dayjs(r.Date, "DD/MM/YYYY")) ===
                            dateKey &&
                          `${r.DriverName}/${r.RegistrationName}` ===
                            driverKey,
                      }))
                      .filter((x) => x.match)
                      .map((x) => x.i);

                    const subGroupIndexes = pagedOrderDetail
                      .map((r, i) => ({
                        i,
                        match:
                          formatThaiSlash(dayjs(r.Date, "DD/MM/YYYY")) ===
                            dateKey &&
                          `${r.DriverName}/${r.RegistrationName}` ===
                            driverKey &&
                          r.TicketName === ticketKey,
                      }))
                      .filter((x) => x.match)
                      .map((x) => x.i);

                    const groupCount = groupIndexes.length;
                    const subGroupCount = subGroupIndexes.length;

                    const firstIndexOfGroup = groupIndexes[0];
                    const lastIndexOfGroup =
                      groupIndexes[groupIndexes.length - 1];
                    const firstIndexOfSubGroup = subGroupIndexes[0];
                    const lastIndexOfSubGroup =
                      subGroupIndexes[subGroupIndexes.length - 1];

                    const isFirstOfGroup = index === firstIndexOfGroup;
                    const isLastOfGroup = index === lastIndexOfGroup;
                    const isFirstOfSubGroup = index === firstIndexOfSubGroup;
                    const isLastOfSubGroup = index === lastIndexOfSubGroup;

                    if (isFirstOfGroup) groupCounter += 1;

                    const borderBottomStyle = isLastOfGroup
                      ? "1.5px solid lightgray"
                      : "1px solid lightgray";
                    const rowBackgroundColor =
                      groupCounter % 2 === 0 ? "#FFFFFF" : "#f3f6fcff";

                    return (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: rowBackgroundColor,
                        }}
                      >
                        {isFirstOfGroup && (
                          <>
                            <TableCell
                              rowSpan={groupCount}
                              sx={{
                                textAlign: "center",
                                borderBottom: borderBottomStyle,
                              }}
                            >
                              {groupCounter}
                            </TableCell>
                            <TableCell
                              rowSpan={groupCount}
                              sx={{
                                textAlign: "center",
                                verticalAlign: "middle",
                                borderBottom: "1.5px solid lightgray",
                              }}
                            >
                              {dateKey}
                            </TableCell>
                            <TableCell
                              rowSpan={groupCount}
                              sx={{
                                textAlign: "center",
                                verticalAlign: "middle",
                                borderBottom: "1.5px solid lightgray",
                              }}
                            >
                              {driverKey.split("/")[1] === "ไม่มี"
                                ? "รถรับจ้างงขนส่ง"
                                : driverKey}
                            </TableCell>
                          </>
                        )}

                        {isFirstOfSubGroup && (
                          <TableCell
                            rowSpan={subGroupCount}
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderBottom:
                                // ให้แสดงเส้นล่างเฉพาะถ้า ticket นี้เป็นกลุ่มย่อยสุดท้ายในกลุ่มใหญ่
                                subGroupIndexes[subGroupIndexes.length - 1] ===
                                groupIndexes[groupIndexes.length - 1]
                                  ? "1.5px solid lightgray"
                                  : "1px solid lightgray",
                            }}
                          >
                            {ticketLabel}
                          </TableCell>
                        )}

                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderBottom: isLastOfGroup
                              ? "2px solid white"
                              : "1px solid lightgray",
                            backgroundColor:
                              row.ProductName === "G91"
                                ? "#A3E270" // เขียวอ่อนลง 5%
                                : row.ProductName === "G95"
                                  ? "#FFD733" // เหลืองอ่อนลง 5%
                                  : row.ProductName === "B7"
                                    ? "#FFFFA3" // เหลืองจาง
                                    : row.ProductName === "B95"
                                      ? "#C2E6ED" // ฟ้าอ่อนลง
                                      : row.ProductName === "B10"
                                        ? "#38D658" // เขียวอ่อนลง
                                        : row.ProductName === "B20"
                                          ? "#269022" // เขียวเข้มจางลง
                                          : row.ProductName === "E20"
                                            ? "#D3CBA6" // ครีมอ่อนลง
                                            : row.ProductName === "E85"
                                              ? "#3333FF" // น้ำเงินจางลง
                                              : row.ProductName === "PWD"
                                                ? "#F46EDC" // ชมพูอ่อนลง
                                                : row.ProductName === "B20"
                                                  ? "#FF7F50"
                                                  : "#FFFFFF",
                          }}
                        >
                          {row.ProductName}
                        </TableCell>

                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderBottom: borderBottomStyle,
                          }}
                        >
                          {new Intl.NumberFormat("en-US").format(
                            row.VolumeProduct * 1000,
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderBottom: borderBottomStyle,
                          }}
                        >
                          {formatNumber(row.RateOil)}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderBottom: borderBottomStyle,
                          }}
                        >
                          {formatNumber(row.Amount)}
                        </TableCell>
                      </TableRow>
                    );
                  });
                  })()
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePaginationBar
              count={orderGroups.length}
              page={safePage}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />
            <Grid
              container
              spacing={1}
              marginTop={1}
              paddingBottom={1}
              sx={{ backgroundColor: theme.palette.info.main }}
            >
              <Grid item xs={3} />
              <Grid item xs={3}>
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={new Intl.NumberFormat("en-US").format(totalVolume)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "20px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                        paddingLeft: 2,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "20px", fontWeight: "bold" }}
                          >
                            รวม :
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{ fontSize: "20px", fontWeight: "bold" }}
                          >
                            ลิตร
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={new Intl.NumberFormat("en-US").format(totalAmount)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "20px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                        paddingLeft: 2,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "20px", fontWeight: "bold" }}
                          >
                            ยอดเงิน :
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{ fontSize: "20px", fontWeight: "bold" }}
                          >
                            บาท
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={3} />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SummaryOilBalance;
