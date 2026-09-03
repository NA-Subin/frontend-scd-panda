import React, { useContext, useEffect, useState } from "react";
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
import { IconButtonError, RateOils, TablecellNoData, TablecellYellow } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InfoIcon from "@mui/icons-material/Info";
import UpdateReport from "./UpdateReport";
import TablePaginationBar from "../../theme/TablePaginationBar";
import theme from "../../theme/theme";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";
import { useBasicData } from "../../server/provider/BasicDataProvider";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Report = ({ openNavbar }) => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(1);

  const [selectedDateStart, setSelectedDateStart] = useState(
    dayjs().startOf("month"),
  );
  const [selectedDateEnd, setSelectedDateEnd] = useState(
    dayjs().endOf("month"),
  );
  const [checkOverdueTransfer, setCheckOverdueTransfer] = useState(true);

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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

  const [selectedRow, setSelectedRow] = useState([]);
  const [indexes, setIndex] = useState(0);
  const [month, setMonth] = useState("");

  console.log("Show Month of click ", month);

  const handleRowClick = (row, index, newMonth) => {
    setMonth(newMonth);
    setSelectedRow(row);
    setIndex(index);
  };

  console.log("selectedRow : ", selectedRow);
  console.log("index : ", indexes);

  const { customertransports, customergasstations, customertickets, drivers } =
    useBasicData();
  const { tickets, trip, transferMoney } = useTripData();
  //const ticket = Object.values(tickets || {});
  const ticket = Object.values(tickets || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });
  const transports = Object.values(customertransports || {});
  const gasstations = Object.values(customergasstations || {});
  const ticketsOrder = Object.values(customertickets || {});
  const driverDetail = Object.values(drivers || {});
  // Legacy Firebase data used numeric driver id 1 as the sentinel for
  // "รถรับจ้างขนส่ง" (contract-transport, no real driver assigned).
  // Resolve it to that driver's real uuid once here, since every
  // ticket's Driver field is a uuid now, not the old numeric id.
  const contractTransportDriverUuid = driverDetail.find(
    (driver) => driver.id === 1,
  )?.uuid;
  // const trips = Object.values(trip || {});
  const trips = Object.values(trip || {}).filter((item) => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

    return (
      deliveryDate.isSameOrAfter(targetDate, "day") ||
      receiveDate.isSameOrAfter(targetDate, "day")
    );
  });

  const transferMoneyDetail = Object.values(transferMoney || {}).filter(
    (row) => row.Status !== "ยกเลิก",
  );
  const [dateRangesA, setDateRangesA] = useState({});
  const [dateRangesT, setDateRangesT] = useState({});
  const [dateRangesG, setDateRangesG] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  console.log(
    "transferMoneyDetailss : ",
    transferMoneyDetail.filter(
      (row) => row.TicketType === "ตั๋วรับจ้างขนส่ง" && row.Status !== "ยกเลิก",
    ),
  );
  console.log("Ticket : ", ticket);
  console.log(
    "Ticket A : ",
    ticket.filter(
      (item) => item.CustomerType === "ตั๋วน้ำมัน" && item.Trip !== "ยกเลิก",
    ),
  );
  console.log(
    "Ticket T : ",
    ticket.filter(
      (item) =>
        item.CustomerType === "ตั๋วรับจ้างขนส่ง" && item.Trip !== "ยกเลิก",
    ),
  );
  console.log(
    "Ticket G : ",
    ticket.filter(
      (item) => item.CustomerType === "ตั๋วปั้ม" && item.Trip !== "ยกเลิก",
    ),
  );

  const resultTransport = ticket
    .filter((item) => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY");
      return (
        item.CustomerType === "ตั๋วรับจ้างขนส่ง" &&
        item.Trip !== "ยกเลิก" &&
        item.Status !== "ยกเลิก" &&
        (checkOverdueTransfer ||
          itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
      );
    })
    .map((item) => {
      let totalVolume = 0;
      // let totalAmount = 0;
      let totalOverdue = 0;

      // แยก driverId ออกมาก่อน
      const driverId = item.Driver;

      const TruckType =
        driverDetail.find((driver) => driver.uuid === driverId)?.TruckType || "";

      // ✅ flag สำหรับรถรับจ้างขนส่ง
      const isContractTransport = driverId === contractTransportDriverUuid;

      // ✅ flag สำหรับรถใหญ่ปกติ
      const isBigTruck = TruckType?.trim() === "รถใหญ่";

      Object.entries(item.Product).forEach(([key, value]) => {
        if (key !== "P") {
          let volume = parseFloat(value.Volume || 0);

          // ✅ คูณ 1000 กรณี:
          // 1. เป็นรถใหญ่
          // 2. เป็น 1:รับจ้างขนส่ง (ให้ถือเป็นรถใหญ่เสมอ)
          if (isBigTruck || isContractTransport) {
            volume *= 1000;
          }

          totalVolume += volume;
          // totalAmount += parseFloat(value.Amount || 0);
        }
      });

      if (item.Price === undefined) {
        totalOverdue = 0;
      } else {
        Object.entries(item.Price).forEach(([key, value]) => {
          totalOverdue += parseFloat(value.IncomingMoney || 0);
        });
      }
      const tripdetail = trips.find((trip) => trip.id - 1 === Number(item.Trip));
      const depotName = tripdetail?.Depot?.split(":")[1] || "";
      let Rate = "";

      if (depotName === "ลำปาง") {
        Rate = item.Rate1;
      } else if (depotName === "พิจิตร") {
        Rate = item.Rate2;
      } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
        Rate = item.Rate3;
      }

      console.log("Rate : ", Rate);

      // ✅ เพิ่มตรงนี้: หา transport ที่ตรงกับ TicketName
      const Match = transports.find((t) => t.uuid === item.TicketName);

      const totalPrice = Number((totalVolume * Rate).toFixed(2));

      const vatOnePercent = Number((totalPrice * 0.01).toFixed(2));

      const totalAmount = Number(totalPrice - vatOnePercent)

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalPrice,
        VatOnePercent: vatOnePercent,
        TotalAmount: totalAmount,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || 0,
        CreditTime: Match?.CreditTime || 0,
        CompanyName: Match?.CompanyName || "-",
        CompanyAddress: Match?.Address || "-",
        CodeID: Match?.CodeID || "-",
        TruckType: isContractTransport ? "รถรับจ้างขนส่ง" : TruckType,
      };
    });

  console.log(" Resualt transports : ", resultTransport);

  const resultGasStation = ticket
    .filter((item) => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY");
      return (
        item.CustomerType === "ตั๋วปั้ม" &&
        item.Trip !== "ยกเลิก" &&
        item.Status !== "ยกเลิก" &&
        (checkOverdueTransfer ||
          itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
      );
    })
    .map((item) => {
      let totalVolume = 0;
      // let totalAmount = 0;
      let totalOverdue = 0;

      // แยก driverId ออกมาก่อน
      const driverId = item.Driver;

      const TruckType =
        driverDetail.find((driver) => driver.uuid === driverId)?.TruckType || "";

      // ✅ flag สำหรับรถรับจ้างขนส่ง
      const isContractTransport = driverId === contractTransportDriverUuid;

      // ✅ flag สำหรับรถใหญ่ปกติ
      const isBigTruck = TruckType?.trim() === "รถใหญ่";

      Object.entries(item.Product).forEach(([key, value]) => {
        if (key !== "P") {
          let volume = parseFloat(value.Volume || 0);

          // ✅ คูณ 1000 กรณี:
          // 1. เป็นรถใหญ่
          // 2. เป็น 1:รับจ้างขนส่ง (ให้ถือเป็นรถใหญ่เสมอ)
          if (isBigTruck || isContractTransport) {
            volume *= 1000;
          }

          totalVolume += volume;
          // totalAmount += parseFloat(value.Amount || 0);
        }
      });

      if (item.Price !== undefined) {
        Object.entries(item.Price).forEach(([key, value]) => {
          totalOverdue += parseFloat(value.IncomingMoney || 0);
        });
      }

      const tripdetail = trips.find((trip) => trip.id - 1 === Number(item.Trip));
      const depotName = tripdetail?.Depot?.split(":")[1] || "";
      let Rate = "";

      if (depotName === "ลำปาง") {
        Rate = item.Rate1;
      } else if (depotName === "พิจิตร") {
        Rate = item.Rate2;
      } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
        Rate = item.Rate3;
      }

      // ✅ เพิ่มตรงนี้: หา transport ที่ตรงกับ TicketName
      const Match = gasstations.find((t) => t.uuid === item.TicketName);

      const totalPrice = Number((totalVolume * Rate).toFixed(2));

      const vatOnePercent = Number((totalPrice * 0.01).toFixed(2));

      const totalAmount = Number(totalPrice - vatOnePercent)

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalPrice,
        VatOnePercent: vatOnePercent,
        TotalAmount: totalAmount,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || 0,
        CreditTime: Match?.CreditTime || 0,
        CompanyName: Match?.CompanyName || "-",
        CompanyAddress: Match?.Address || "-",
        CodeID: Match?.CodeID || "-",
        TruckType: isContractTransport ? "รถรับจ้างขนส่ง" : TruckType,
      };
    });

  console.log(
    "resultGasStation : ",
    resultGasStation.filter(
      (t) => t.TicketName.split(":")[1] === "NP..บฮ(นางจาก)...D1",
    ),
  );

  const resultTickets = ticket
    .filter((item) => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY");
      return (
        item.CustomerType === "ตั๋วน้ำมัน" &&
        item.Trip !== "ยกเลิก" &&
        item.Status !== "ยกเลิก" &&
        (checkOverdueTransfer ||
          itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
      );
    })
    .map((item) => {
      let totalVolume = 0;
      // let totalAmount = 0;
      let totalOverdue = 0;

      // แยก driverId ออกมาก่อน
      const driverId = item.Driver;

      const TruckType =
        driverDetail.find((driver) => driver.uuid === driverId)?.TruckType || "";

      // ✅ flag สำหรับรถรับจ้างขนส่ง
      const isContractTransport = driverId === contractTransportDriverUuid;

      // ✅ flag สำหรับรถใหญ่ปกติ
      const isBigTruck = TruckType?.trim() === "รถใหญ่";

      Object.entries(item.Product).forEach(([key, value]) => {
        if (key !== "P") {
          let volume = parseFloat(value.Volume || 0);

          // ✅ คูณ 1000 กรณี:
          // 1. เป็นรถใหญ่
          // 2. เป็น 1:รับจ้างขนส่ง (ให้ถือเป็นรถใหญ่เสมอ)
          if (isBigTruck || isContractTransport) {
            volume *= 1000;
          }

          totalVolume += volume;
          // totalAmount += parseFloat(value.Amount || 0);
        }
      });

      if (item.Price !== undefined) {
        Object.entries(item.Price).forEach(([key, value]) => {
          totalOverdue += parseFloat(value.IncomingMoney || 0);
        });
      }

      const tripdetail = trips.find((trip) => trip.id - 1 === Number(item.Trip));
      const depotName = tripdetail?.Depot?.split(":")[1] || "";
      let Rate = "";

      if (depotName === "ลำปาง") {
        Rate = item.Rate1;
      } else if (depotName === "พิจิตร") {
        Rate = item.Rate2;
      } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
        Rate = item.Rate3;
      }

      // ✅ เพิ่มตรงนี้: หา transport ที่ตรงกับ TicketName
      const Match = ticketsOrder.find((t) => t.uuid === item.TicketName);
      const totalPrice = Number((totalVolume * Rate).toFixed(2));

      const vatOnePercent = Number((totalPrice * 0.01).toFixed(2));

      const totalAmount = Number(totalPrice - vatOnePercent)

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalPrice,
        VatOnePercent: vatOnePercent,
        TotalAmount: totalAmount,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || 0,
        CreditTime: Match?.CreditTime || 0,
        CompanyName: Match?.CompanyName || "-",
        CompanyAddress: Match?.Address || "-",
        CodeID: Match?.CodeID || "-",
        TruckType: isContractTransport ? "รถรับจ้างขนส่ง" : TruckType,
      };
    });

  console.log("resultTickets : ", resultTickets);

  const groupedByPeriodTickets = resultTickets.reduce((groups, item) => {
    const date = dayjs(item.Date, "DD/MM/YYYY");
    const day = date.date(); // วันที่ในเดือน เช่น 5, 12, 25
    const monthKey = date.format("YYYY-MM");

    // กำหนดช่วงที่ 1-3
    // let period = "";
    // if (day >= 1 && day <= 10) {
    //   period = "ช่วงที่ 1"; // 1-10
    // } else if (day >= 11 && day <= 20) {
    //   period = "ช่วงที่ 2"; // 11-20
    // } else {
    //   period = "ช่วงที่ 3"; // 21 ถึงวันสุดท้ายของเดือน
    // }
    const creditTime = Number(item.CreditTime) || 0;
    let period = "";

    if (creditTime === 10) {
      if (day <= 10) period = "ช่วงที่ 1";
      else if (day <= 20) period = "ช่วงที่ 2";
      else period = "ช่วงที่ 3";
    } else if (creditTime === 15) {
      if (day <= 15) period = "ช่วงที่ 1";
      else period = "ช่วงที่ 2";
    } else if (creditTime === 30 || creditTime === 0) {
      period = "ช่วงที่ 1";
    } else {
      period = `ไม่ระบุช่วง_${creditTime}_${item.No}_${day}`; // fallback เผื่อไม่มี CreditTime
    }

    // สร้าง key เช่น "2025-04_ช่วงที่ 1"
    const groupKey = `${monthKey}_${period}`;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  console.log("groupedByPeriodTickets ", groupedByPeriodTickets);

  // 1. Group by year-month ก่อน
  const groupedByMonthTickets = resultTickets.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  console.log("groupedByMonthTickets ", groupedByMonthTickets);

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayTickets = Object.entries(groupedByPeriodTickets)
    .flatMap(([month, items]) => {
      const [monthKey, period] = month.split("_"); // เช่น ["2025-04", "ช่วงที่ 1"]

      // สร้างช่วงเวลา DateStart และ DateEnd ตามช่วงที่กำหนด
      // let DateStart, DateEnd;
      // if (period === "ช่วงที่ 1") {
      //   DateStart = dayjs(monthKey + "-01", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey + "-10", "YYYY-MM-DD").format("DD/MM/YYYY");
      // } else if (period === "ช่วงที่ 2") {
      //   DateStart = dayjs(monthKey + "-11", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey + "-20", "YYYY-MM-DD").format("DD/MM/YYYY");
      // } else if (period === "ช่วงที่ 3") {
      //   DateStart = dayjs(monthKey + "-21", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey, "YYYY-MM").endOf("month").format("DD/MM/YYYY");
      // }

      // const grouped = items.reduce((acc, item) => {
      //   let totalVolume = parseFloat(item.TotalVolume || 0);
      //   let totalAmount = parseFloat(item.TotalAmount || 0);
      //   let totalOverdue = parseFloat(item.TotalOverdue || 0);
      //   let totalPrice = parseFloat(item.TotalPrice || 0);
      //   let vatOnePercent = parseFloat(item.VatOnePercent || 0);

      //   const key = item.TicketName;

      //   if (!acc[key]) {
      //     acc[key] = {
      //       TicketName: item.TicketName,
      //       DateStart: DateStart,
      //       DateEnd: DateEnd,
      //       Date: item.Date,
      //       Month: month,
      //       CustomerType: item.CustomerType,
      //       CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
      //       TotalVolume: 0,
      //       TotalAmount: 0,
      //       TotalOverdue: 0,
      //       TotalPrice: 0,
      //       VatOnePercent: 0
      //     };
      //   }

      //   acc[key].TotalVolume += totalVolume;
      //   acc[key].TotalAmount += totalAmount;
      //   acc[key].TotalOverdue += totalOverdue;
      //   acc[key].TotalPrice += totalPrice;
      //   acc[key].VatOnePercent += vatOnePercent;

      //   return acc;
      // }, {});
      const grouped = items.reduce((acc, item) => {
        const creditTime = Number(item.CreditTime) || 0;

        // คำนวณ DateStart / DateEnd ตามแต่ละรายการ
        let DateStart = "",
          DateEnd = "";
        if (creditTime === 10) {
          if (period === "ช่วงที่ 1") {
            DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-10`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 2") {
            DateStart = dayjs(`${monthKey}-11`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-20`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 3") {
            DateStart = dayjs(`${monthKey}-21`).format("DD/MM/YYYY");
            DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
          }
        } else if (creditTime === 15) {
          if (period === "ช่วงที่ 1") {
            DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-15`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 2") {
            DateStart = dayjs(`${monthKey}-16`).format("DD/MM/YYYY");
            DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
          }
        } else if (creditTime === 30 || creditTime === 0) {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        } else {
          // ✅ ใช้ item.Date เป็นวันเริ่มต้น
          const start = dayjs(item.Date, "DD/MM/YYYY");

          DateStart = start.format("DD/MM/YYYY");

          // ✅ บวกตาม creditTime (จำนวนวันเครดิต)
          const endDate = start.add(creditTime, "day");

          DateEnd = endDate.format("DD/MM/YYYY");
        }

        const key = item.TicketName;

        if (!acc[key]) {
          acc[key] = {
            CodeID: item.CodeID,
            CompanyName: item.CompanyName,
            CompanyAddress: item.CompanyAddress,
            TicketAddress: item.Address,
            TicketName: item.TicketName,
            TicketNameName: item.TicketNameName,
            DateStart,
            DateEnd,
            Date: item.Date,
            Month: month,
            CustomerType: item.CustomerType,
            CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
            TotalVolume: 0,
            TotalAmount: 0,
            TotalOverdue: 0,
            TotalPrice: 0,
            VatOnePercent: 0,
          };
        }

        acc[key].TotalVolume += parseFloat(item.TotalVolume || 0);
        acc[key].TotalAmount += parseFloat(item.TotalAmount || 0);
        acc[key].TotalOverdue += parseFloat(item.TotalOverdue || 0);
        acc[key].TotalPrice += parseFloat(item.TotalPrice || 0);
        acc[key].VatOnePercent += parseFloat(item.VatOnePercent || 0);

        return acc;
      }, {});

      return Object.values(grouped);
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "DateStart":
          aValue = dayjs(a.DateStart, "DD/MM/YYYY").toDate();
          bValue = dayjs(b.DateStart, "DD/MM/YYYY").toDate();
          break;
        case "DateEnd":
          aValue = dayjs(a.DateEnd, "DD/MM/YYYY").toDate();
          bValue = dayjs(b.DateEnd, "DD/MM/YYYY").toDate();
          break;
        case "TicketName":
          aValue = a.TicketNameName || "";
          bValue = b.TicketNameName || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  // ⭐ ใส่ No ตอนสุดท้าย
  resultArrayTickets = resultArrayTickets.map((item, idx) => ({
    No: idx + 1,
    ...item,
  }));

  // แปลงจาก object เป็น array ถ้าจะใช้กับ .map() แสดงผลในตาราง
  //const [TicketsDetail,setTicketsDetail] = useState(Object.values(resultArrayTickets));
  const TicketsDetail = Object.values(resultArrayTickets);

  const groupedByPeriodGasStation = resultGasStation.reduce((groups, item) => {
    const date = dayjs(item.Date, "DD/MM/YYYY");
    const day = date.date(); // วันที่ในเดือน เช่น 5, 12, 25
    const monthKey = date.format("YYYY-MM");

    // กำหนดช่วงที่ 1-3
    // let period = "";
    // if (day >= 1 && day <= 10) {
    //   period = "ช่วงที่ 1"; // 1-10
    // } else if (day >= 11 && day <= 20) {
    //   period = "ช่วงที่ 2"; // 11-20
    // } else {
    //   period = "ช่วงที่ 3"; // 21 ถึงวันสุดท้ายของเดือน
    // }
    const creditTime = Number(item.CreditTime) || 0;
    let period = "";

    if (creditTime === 10) {
      if (day <= 10) period = "ช่วงที่ 1";
      else if (day <= 20) period = "ช่วงที่ 2";
      else period = "ช่วงที่ 3";
    } else if (creditTime === 15) {
      if (day <= 15) period = "ช่วงที่ 1";
      else period = "ช่วงที่ 2";
    } else if (creditTime === 30 || creditTime === 0) {
      period = "ช่วงที่ 1";
    } else {
      period = `ไม่ระบุช่วง_${creditTime}_${item.No}_${day}`; // fallback เผื่อไม่มี CreditTime
    }

    // สร้าง key เช่น "2025-04_ช่วงที่ 1"
    const groupKey = `${monthKey}_${period}`;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  console.log("groupedByPeriodGasStation ", groupedByPeriodGasStation);

  // 1. Group by year-month ก่อน
  const groupedByMonthGasStation = resultGasStation.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  console.log("groupedByMonthGasStation ", groupedByMonthGasStation);

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayGasStation = Object.entries(groupedByPeriodGasStation)
    .flatMap(([month, items]) => {
      const [monthKey, period] = month.split("_"); // เช่น ["2025-04", "ช่วงที่ 1"]

      // สร้างช่วงเวลา DateStart และ DateEnd ตามช่วงที่กำหนด
      // let DateStart, DateEnd;
      // if (period === "ช่วงที่ 1") {
      //   DateStart = dayjs(monthKey + "-01", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey + "-10", "YYYY-MM-DD").format("DD/MM/YYYY");
      // } else if (period === "ช่วงที่ 2") {
      //   DateStart = dayjs(monthKey + "-11", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey + "-20", "YYYY-MM-DD").format("DD/MM/YYYY");
      // } else if (period === "ช่วงที่ 3") {
      //   DateStart = dayjs(monthKey + "-21", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey, "YYYY-MM").endOf("month").format("DD/MM/YYYY");
      // }

      // const grouped = items.reduce((acc, item) => {
      //   let totalVolume = parseFloat(item.TotalVolume || 0);
      //   let totalAmount = parseFloat(item.TotalAmount || 0);
      //   let totalOverdue = parseFloat(item.TotalOverdue || 0);
      //   let totalPrice = parseFloat(item.TotalPrice || 0);
      //   let vatOnePercent = parseFloat(item.VatOnePercent || 0);

      //   const key = item.TicketName;

      //   if (!acc[key]) {
      //     acc[key] = {
      //       TicketName: item.TicketName,
      //       DateStart: DateStart,
      //       DateEnd: DateEnd,
      //       Date: item.Date,
      //       Month: month,
      //       CustomerType: item.CustomerType,
      //       CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
      //       TotalVolume: 0,
      //       TotalAmount: 0,
      //       TotalOverdue: 0,
      //       TotalPrice: 0,
      //       VatOnePercent: 0
      //     };
      //   }

      //   acc[key].TotalVolume += totalVolume;
      //   acc[key].TotalAmount += totalAmount;
      //   acc[key].TotalOverdue += totalOverdue;
      //   acc[key].TotalPrice += totalPrice;
      //   acc[key].VatOnePercent += vatOnePercent;

      //   return acc;
      // }, {});
      const grouped = items.reduce((acc, item) => {
        const creditTime = Number(item.CreditTime) || 0;

        // คำนวณ DateStart / DateEnd ตามแต่ละรายการ
        let DateStart = "",
          DateEnd = "";
        if (creditTime === 10) {
          if (period === "ช่วงที่ 1") {
            DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-10`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 2") {
            DateStart = dayjs(`${monthKey}-11`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-20`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 3") {
            DateStart = dayjs(`${monthKey}-21`).format("DD/MM/YYYY");
            DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
          }
        } else if (creditTime === 15) {
          if (period === "ช่วงที่ 1") {
            DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-15`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 2") {
            DateStart = dayjs(`${monthKey}-16`).format("DD/MM/YYYY");
            DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
          }
        } else if (creditTime === 30 || creditTime === 0) {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        } else {
          // ✅ ใช้ item.Date เป็นวันเริ่มต้น
          const start = dayjs(item.Date, "DD/MM/YYYY");

          DateStart = start.format("DD/MM/YYYY");

          // ✅ บวกตาม creditTime (จำนวนวันเครดิต)
          const endDate = start.add(creditTime, "day");

          DateEnd = endDate.format("DD/MM/YYYY");
        }

        const key = item.TicketName;

        if (!acc[key]) {
          acc[key] = {
            CodeID: item.CodeID,
            CompanyName: item.CompanyName,
            CompanyAddress: item.CompanyAddress,
            TicketAddress: item.Address,
            TicketName: item.TicketName,
            TicketNameName: item.TicketNameName,
            DateStart,
            DateEnd,
            Date: item.Date,
            Month: month,
            CustomerType: item.CustomerType,
            CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
            TotalVolume: 0,
            TotalAmount: 0,
            TotalOverdue: 0,
            TotalPrice: 0,
            VatOnePercent: 0,
          };
        }

        acc[key].TotalVolume += parseFloat(item.TotalVolume || 0);
        acc[key].TotalAmount += parseFloat(item.TotalAmount || 0);
        acc[key].TotalOverdue += parseFloat(item.TotalOverdue || 0);
        acc[key].TotalPrice += parseFloat(item.TotalPrice || 0);
        acc[key].VatOnePercent += parseFloat(item.VatOnePercent || 0);

        return acc;
      }, {});

      return Object.values(grouped);
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "DateStart":
          aValue = dayjs(a.DateStart, "DD/MM/YYYY").toDate();
          bValue = dayjs(b.DateStart, "DD/MM/YYYY").toDate();
          break;
        case "DateEnd":
          aValue = dayjs(a.DateEnd, "DD/MM/YYYY").toDate();
          bValue = dayjs(b.DateEnd, "DD/MM/YYYY").toDate();
          break;
        case "TicketName":
          aValue = a.TicketNameName || "";
          bValue = b.TicketNameName || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  console.log("resultArrayGasStation : ", resultArrayGasStation);

  // ⭐ ใส่ No ตอนสุดท้าย
  resultArrayGasStation = resultArrayGasStation.map((item, idx) => ({
    No: idx + 1,
    ...item,
  }));

  // const resultArrayGasStation = resultGasStation.reduce((acc, item, index) => {
  //   let totalVolume = 0;
  //   let totalAmount = 0;
  //   let totalOverdue = 0;
  //   let totalPrice = 0;
  //   let vatOnePercent = 0;

  //   totalVolume += parseFloat(item.TotalVolume || 0);
  //   totalAmount += parseFloat(item.TotalAmount || 0);
  //   totalOverdue += parseFloat(item.TotalOverdue || 0);
  //   totalPrice += parseFloat(item.TotalPrice || 0);
  //   vatOnePercent += parseFloat(item.VatOnePercent || 0);

  //   const key = item.TicketName;

  //   if (!acc[key]) {
  //     acc[key] = {
  //       No: index + 1, // <--- เพิ่ม No (index เริ่มจาก 1)
  //       TicketName: key,
  //       Date: item.Date,
  //       TotalVolume: 0,
  //       TotalAmount: 0,
  //       TotalOverdue: 0,
  //       TotalPrice: 0,
  //       VatOnePercent: 0
  //     };
  //   }

  //   // dateRangesG[index + 1] = {
  //   //   dateStart: dayjs().startOf("month").format("DD/MM/YYYY"),
  //   //   dateEnd: dayjs().endOf("month").format("DD/MM/YYYY"),
  //   // }

  //   acc[key].TotalVolume += totalVolume;
  //   acc[key].TotalAmount += totalAmount;
  //   acc[key].TotalOverdue += totalOverdue;
  //   acc[key].TotalPrice += totalPrice;
  //   acc[key].VatOnePercent += vatOnePercent;

  //   return acc;
  // }, {});

  // แปลงจาก object เป็น array ถ้าจะใช้กับ .map() แสดงผลในตาราง
  //const [GasStationDetail,setGasStationDetail] = useState(Object.values(resultArrayGasStation));
  const GasStationDetail = Object.values(resultArrayGasStation);

  const groupedByPeriodTransport = resultTransport.reduce((groups, item) => {
    const date = dayjs(item.Date, "DD/MM/YYYY");
    const day = date.date(); // วันที่ในเดือน เช่น 5, 12, 25
    const monthKey = date.format("YYYY-MM");

    // กำหนดช่วงที่ 1-3
    // let period = "";
    // if (day >= 1 && day <= 10) {
    //   period = "ช่วงที่ 1"; // 1-10
    // } else if (day >= 11 && day <= 20) {
    //   period = "ช่วงที่ 2"; // 11-20
    // } else {
    //   period = "ช่วงที่ 3"; // 21 ถึงวันสุดท้ายของเดือน
    // }
    const creditTime = Number(item.CreditTime) || 0;
    let period = "";

    if (creditTime === 10) {
      if (day <= 10) period = "ช่วงที่ 1";
      else if (day <= 20) period = "ช่วงที่ 2";
      else period = "ช่วงที่ 3";
    } else if (creditTime === 15) {
      if (day <= 15) period = "ช่วงที่ 1";
      else period = "ช่วงที่ 2";
    } else if (creditTime === 30 || creditTime === 0) {
      period = "ช่วงที่ 1";
    } else {
      period = `ไม่ระบุช่วง_${creditTime}_${item.No}_${day}`; // fallback เผื่อไม่มี CreditTime
    }

    // สร้าง key เช่น "2025-04_ช่วงที่ 1"
    const groupKey = `${monthKey}_${period}`;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  console.log("groupedByPeriodTransport ", groupedByPeriodTransport);

  // 1. Group by year-month ก่อน
  const groupedByMonthTransport = resultTransport.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  console.log("groupedByMonthTransport ", groupedByMonthTransport);

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayTransport = Object.entries(groupedByPeriodTransport)
    .flatMap(([month, items]) => {
      const [monthKey, period] = month.split("_"); // เช่น ["2025-04", "ช่วงที่ 1"]

      // สร้างช่วงเวลา DateStart และ DateEnd ตามช่วงที่กำหนด
      // let DateStart, DateEnd;
      // if (period === "ช่วงที่ 1") {
      //   DateStart = dayjs(monthKey + "-01", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey + "-10", "YYYY-MM-DD").format("DD/MM/YYYY");
      // } else if (period === "ช่วงที่ 2") {
      //   DateStart = dayjs(monthKey + "-11", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey + "-20", "YYYY-MM-DD").format("DD/MM/YYYY");
      // } else if (period === "ช่วงที่ 3") {
      //   DateStart = dayjs(monthKey + "-21", "YYYY-MM-DD").format("DD/MM/YYYY");
      //   DateEnd = dayjs(monthKey, "YYYY-MM").endOf("month").format("DD/MM/YYYY");
      // }

      // const grouped = items.reduce((acc, item) => {
      //   let totalVolume = parseFloat(item.TotalVolume || 0);
      //   let totalAmount = parseFloat(item.TotalAmount || 0);
      //   let totalOverdue = parseFloat(item.TotalOverdue || 0);
      //   let totalPrice = parseFloat(item.TotalPrice || 0);
      //   let vatOnePercent = parseFloat(item.VatOnePercent || 0);

      //   const key = item.TicketName;

      //   if (!acc[key]) {
      //     acc[key] = {
      //       TicketName: item.TicketName,
      //       DateStart: DateStart,
      //       DateEnd: DateEnd,
      //       Date: item.Date,
      //       Month: month,
      //       CustomerType: item.CustomerType,
      //       CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
      //       TotalVolume: 0,
      //       TotalAmount: 0,
      //       TotalOverdue: 0,
      //       TotalPrice: 0,
      //       VatOnePercent: 0
      //     };
      //   }

      //   acc[key].TotalVolume += totalVolume;
      //   acc[key].TotalAmount += totalAmount;
      //   acc[key].TotalOverdue += totalOverdue;
      //   acc[key].TotalPrice += totalPrice;
      //   acc[key].VatOnePercent += vatOnePercent;

      //   return acc;
      // }, {});
      const grouped = items.reduce((acc, item) => {
        const creditTime = Number(item.CreditTime) || 0;

        // คำนวณ DateStart / DateEnd ตามแต่ละรายการ
        let DateStart = "",
          DateEnd = "";
        if (creditTime === 10) {
          if (period === "ช่วงที่ 1") {
            DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-10`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 2") {
            DateStart = dayjs(`${monthKey}-11`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-20`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 3") {
            DateStart = dayjs(`${monthKey}-21`).format("DD/MM/YYYY");
            DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
          }
        } else if (creditTime === 15) {
          if (period === "ช่วงที่ 1") {
            DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
            DateEnd = dayjs(`${monthKey}-15`).format("DD/MM/YYYY");
          } else if (period === "ช่วงที่ 2") {
            DateStart = dayjs(`${monthKey}-16`).format("DD/MM/YYYY");
            DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
          }
        } else if (creditTime === 30 || creditTime === 0) {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        } else {
          // ✅ ใช้ item.Date เป็นวันเริ่มต้น
          const start = dayjs(item.Date, "DD/MM/YYYY");

          DateStart = start.format("DD/MM/YYYY");

          // ✅ บวกตาม creditTime (จำนวนวันเครดิต)
          const endDate = start.add(creditTime, "day");

          DateEnd = endDate.format("DD/MM/YYYY");
        }

        const key = `${item.TicketName}_${DateStart}_${DateEnd}`; // ใช้ key ที่รวมชื่อกับช่วงเวลา เพื่อแยกกรณีที่มีชื่อเดียวกันแต่ช่วงต่างกัน

        if (!acc[key]) {
          acc[key] = {
            CodeID: item.CodeID,
            CompanyName: item.CompanyName,
            CompanyAddress: item.CompanyAddress,
            TicketAddress: item.Address,
            TicketName: item.TicketName,
            TicketNameName: item.TicketNameName,
            DateStart,
            DateEnd,
            Date: item.Date,
            Month: month,
            CustomerType: item.CustomerType,
            CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
            TotalVolume: 0,
            TotalAmount: 0,
            TotalOverdue: 0,
            TotalPrice: 0,
            VatOnePercent: 0,
          };
        }

        acc[key].TotalVolume += parseFloat(item.TotalVolume || 0);
        acc[key].TotalAmount += parseFloat(item.TotalAmount || 0);
        acc[key].TotalOverdue += parseFloat(item.TotalOverdue || 0);
        acc[key].TotalPrice += parseFloat(item.TotalPrice || 0);
        acc[key].VatOnePercent += parseFloat(item.VatOnePercent || 0);

        return acc;
      }, {});

      return Object.values(grouped);
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "DateStart":
          aValue = dayjs(a.DateStart, "DD/MM/YYYY").toDate();
          bValue = dayjs(b.DateStart, "DD/MM/YYYY").toDate();
          break;
        case "DateEnd":
          aValue = dayjs(a.DateEnd, "DD/MM/YYYY").toDate();
          bValue = dayjs(b.DateEnd, "DD/MM/YYYY").toDate();
          break;
        case "TicketName":
          aValue = a.TicketNameName || "";
          bValue = b.TicketNameName || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  console.log("resultArrayTransport : ", resultArrayTransport);
  // ⭐ ใส่ No ตอนสุดท้าย
  resultArrayTransport = resultArrayTransport.map((item, idx) => ({
    No: idx + 1,
    ...item,
  }));

  // const resultArrayTransport = resultTransport.reduce((acc, item, index) => {
  //   let totalVolume = 0;
  //   let totalAmount = 0;
  //   let totalOverdue = 0;
  //   let totalPrice = 0;
  //   let vatOnePercent = 0;

  //   totalVolume += parseFloat(item.TotalVolume || 0);
  //   totalAmount += parseFloat(item.TotalAmount || 0);
  //   totalOverdue += parseFloat(item.TotalOverdue || 0);
  //   totalPrice += parseFloat(item.TotalPrice || 0);
  //   vatOnePercent += parseFloat(item.VatOnePercent || 0);

  //   const key = item.TicketName;

  //   if (!acc[key]) {
  //     acc[key] = {
  //       No: index + 1, // <--- เพิ่ม No (index เริ่มจาก 1)
  //       TicketName: key,
  //       Date: item.Date,
  //       TotalVolume: 0,
  //       TotalAmount: 0,
  //       TotalOverdue: 0,
  //       TotalPrice: 0,
  //       VatOnePercent: 0,
  //     };
  //   }

  //   acc[key].TotalVolume += totalVolume;
  //   acc[key].TotalAmount += totalAmount;
  //   acc[key].TotalOverdue += totalOverdue;
  //   acc[key].TotalPrice += totalPrice;
  //   acc[key].VatOnePercent += vatOnePercent;

  //   // dateRangesT[index + 1] = {
  //   //   dateStart: dayjs().startOf("month").format("DD/MM/YYYY"),
  //   //   dateEnd: dayjs().endOf("month").format("DD/MM/YYYY"),
  //   // }

  //   return acc;
  // }, {});

  // แปลงจาก object เป็น array ถ้าจะใช้กับ .map() แสดงผลในตาราง
  //const [TransportDetail,setTransportDetail] = useState(Object.values(resultArrayTransport))
  const TransportDetail = Object.values(resultArrayTransport);
  console.log("Transport Detail : ", TransportDetail);

  const handleDateAChange = (index, type, value) => {
    console.log("Show Index ", index);
    console.log("Show Type ", type);
    console.log("Show Value ", value);
    setDateRangesA((prev) => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  const handleDateTChange = (index, type, value) => {
    console.log("Show Index ", index);
    console.log("Show Type ", type);
    console.log("Show Value ", value);
    setDateRangesT((prev) => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  const handleDateGChange = (index, type, value) => {
    console.log("Show Index ", index);
    console.log("Show Type ", type);
    console.log("Show Value ", value);
    setDateRangesG((prev) => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  const formatNumber = (value) =>
    value === 0 || value === "0"
      ? "0"
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

  console.log("dateRanges A : ", dateRangesA);
  console.log("dateRanges T : ", dateRangesT);
  console.log("dateRanges G : ", dateRangesG);
  console.log("TicketsDetail : ", TicketsDetail);
  console.log("GasStationDetail : ", GasStationDetail);
  console.log("TransportDetail : ", TransportDetail);
  console.log("resultTickets : ", resultTickets);
  console.log("resultTransport : ", resultTransport);
  console.log("resultGasStation : ", resultGasStation);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSetOpen = (tab) => {
    setOpen(tab);
    setPage(0);
  };

  const handleToggleOverdue = () => {
    setCheckOverdueTransfer((prev) => !prev);
    setPage(0);
  };

  const filteredTicketsDetail = checkOverdueTransfer
    ? TicketsDetail.filter((row) => Number(row.TotalAmount) - Number(row.TotalOverdue) !== 0)
    : TicketsDetail;
  const filteredTransportDetail = checkOverdueTransfer
    ? TransportDetail.filter((row) => Number(row.TotalAmount) - Number(row.TotalOverdue) !== 0)
    : TransportDetail;
  const filteredGasStationDetail = GasStationDetail;

  const activeReportRows =
    open === 1 ? filteredTicketsDetail : open === 2 ? filteredTransportDetail : filteredGasStationDetail;
  const pageCount = Math.max(1, Math.ceil(activeReportRows.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);
  const pagedTicketsDetail = filteredTicketsDetail.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  const pagedTransportDetail = filteredTransportDetail.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  const pagedGasStationDetail = filteredGasStationDetail.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

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
        <Grid item md={3} xs={12}></Grid>
        <Grid item md={9} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            ชำระค่าขนส่ง
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
              marginTop: { md: -10, xs: 2 },
              marginBottom: 3,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                openTo="day"
                views={["year", "month", "day"]}
                value={
                  selectedDateStart
                    ? dayjs(selectedDateStart, "DD/MM/YYYY")
                    : null
                }
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
              <DatePicker
                openTo="day"
                views={["year", "month", "day"]}
                value={
                  selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null
                }
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
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 1 }} />
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2} marginTop={1}>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color={open === 1 ? "yellow" : "inherit"}
              sx={{
                height: "10vh",
                fontSize: "22px",
                fontWeight: "bold",
                borderRadius: 3,
                borderBottom:
                  open === 1 && "5px solid" + theme.palette.warning.dark,
              }}
              fullWidth
              onClick={() => handleSetOpen(1)}
            >
              ตั๋วน้ำมัน
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color={open === 2 ? "yellow" : "inherit"}
              sx={{
                height: "10vh",
                fontSize: "22px",
                fontWeight: "bold",
                borderRadius: 3,
                borderBottom:
                  open === 2 && "5px solid" + theme.palette.warning.dark,
              }}
              fullWidth
              onClick={() => handleSetOpen(2)}
            >
              ตั๋วรับจ้างขนส่ง
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color={open === 3 ? "yellow" : "inherit"}
              sx={{
                height: "10vh",
                fontSize: "22px",
                fontWeight: "bold",
                borderRadius: 3,
                borderBottom:
                  open === 3 && "5px solid" + theme.palette.warning.dark,
              }}
              fullWidth
              onClick={() => handleSetOpen(3)}
            >
              ตั๋วปั้ม
            </Button>
          </Grid>
          <Grid item xs={4} sx={{ marginTop: -3 }}>
            {open === 1 && (
              <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                color={theme.palette.warning.dark}
                gutterBottom
              >
                ||
              </Typography>
            )}
          </Grid>
          <Grid item xs={4} sx={{ marginTop: -3 }}>
            {open === 2 && (
              <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                color={theme.palette.warning.dark}
                gutterBottom
              >
                ||
              </Typography>
            )}
          </Grid>
          <Grid item xs={4} sx={{ marginTop: -3 }}>
            {open === 3 && (
              <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                color={theme.palette.warning.dark}
                gutterBottom
              >
                ||
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Paper
              sx={{
                backgroundColor: "#fafafa",
                borderRadius: 3,
                p: 5,
                borderTop: "5px solid" + theme.palette.warning.dark,
                marginTop: -5,
                width: "100%",
              }}
            >
              {open === 1 ? (
                <Grid container spacing={2} sx={{ marginTop: -5 }}>
                  <Grid item xs={12}>
                    {windowWidth <= 900 ? (
                      <Grid container spacing={2} textAlign="right">
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="warning"
                                checked={checkOverdueTransfer}
                                onChange={() =>
                                  handleToggleOverdue()
                                }
                              />
                            }
                            label={
                              <Typography
                                sx={{ fontSize: "16px", fontWeight: "bold" }}
                              >
                                ค้างโอน
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                              fontSize: "12px",
                              color: "red",
                              marginTop: 2,
                              marginBottom: -1,
                            }}
                            gutterBottom
                          >
                            *กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          display="flex"
                          justifyContent="right"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                              fontSize: "12px",
                              color: "red",
                              marginBottom: -1,
                              marginRight: 1,
                            }}
                            gutterBottom
                          >
                            *เลือกดูเฉพาะค้างโอนหรือดูทั้งหมด กดตรงนี้*
                          </Typography>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="warning"
                                checked={checkOverdueTransfer}
                                onChange={() =>
                                  handleToggleOverdue()
                                }
                              />
                            }
                            label={
                              <Typography
                                sx={{ fontSize: "16px", fontWeight: "bold" }}
                              >
                                ค้างโอน
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    )}
                    <TableContainer
                      component={Paper}
                      sx={{ marginBottom: 2, height: "250px" }}
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
                            <TablecellYellow
                              width={50}
                              sx={{ textAlign: "center", fontSize: 16 }}
                            >
                              ลำดับ
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("DateStart")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              วันที่รับ
                              {sortConfig.key === "DateStart" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("DateEnd")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              จนถึง
                              {sortConfig.key === "DateEnd" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("TicketName")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 300,
                              }}
                            >
                              ชื่อตั๋ว
                              {sortConfig.key === "TicketName" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดเงิน
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              หักภาษี 1%
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดชำระ
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดโอน
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ค้างโอน
                            </TablecellYellow>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredTicketsDetail.length === 0 ? (
                            <TableRow>
                              <TablecellNoData colSpan={9}>
                                <Inventory fontSize="large" />
                                <br />
                                ไม่มีข้อมูล
                              </TablecellNoData>
                            </TableRow>
                          ) : checkOverdueTransfer
                            ? pagedTicketsDetail.map((row, index) => {
                                // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter(
                                  (transferRow) =>
                                    transferRow.TicketName === row.TicketName &&
                                    transferRow.PeriodStart === row.DateStart &&
                                    transferRow.PeriodEnd === row.DateEnd,
                                );

                                console.log("Tranfer Detail : ", transfer);
                                console.log("month Detail : ", row.Month);

                                const round2 = (num) =>
                                  Math.round(
                                    (Number(num) + Number.EPSILON) * 100,
                                  ) / 100;

                                const totalIncomingMoney = round2(
                                  transfer.reduce(
                                    (sum, row) =>
                                      sum + (Number(row.IncomingMoney) || 0),
                                    0,
                                  ),
                                );

                                const totalAmounts = round2(
                                  Number(row.TotalAmount) - totalIncomingMoney,
                                );

                                // const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                //   return sum + (Number(transferRow.IncomingMoney) || 0);
                                // }, 0);
                                // <<<<<<

                                return (
                                  totalAmounts !== 0 && (
                                    <TableRow
                                      key={row.No}
                                      onClick={() =>
                                        handleRowClick(row, index, row.Month)
                                      }
                                      sx={{
                                        cursor: "pointer",
                                        "&:hover": {
                                          backgroundColor: "#e0e0e0",
                                        },
                                        backgroundColor:
                                          selectedRow.No === row.No ||
                                          indexes === index
                                            ? "#fff9c4"
                                            : "",
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {safePage * rowsPerPage + index + 1}
                                      </TableCell>
                                      {/* วันที่เริ่มต้น */}
                                      {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateAChange(row.No, "dateStart", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    sx: {
                                                      "& .MuiOutlinedInput-root": {
                                                        height: "30px",
                                                        paddingRight: "8px",
                                                      },
                                                      "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        marginLeft: -1,
                                                      },
                                                      "& .MuiInputAdornment-root": {
                                                        marginLeft: -2,
                                                        paddingLeft: "0px"
                                                      }
                                                    },
                                                  },
                                                }}
                                                disabled
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {formatThaiSlash(
                                          dayjs(
                                            dateRangesA[row.No]?.dateStart ||
                                              dayjs(
                                                row.DateStart,
                                                "DD/MM/YYYY",
                                              ),
                                            "DD/MM/YYYY",
                                          ),
                                        )}
                                      </TableCell>

                                      {/* วันที่สิ้นสุด */}
                                      {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateAChange(row.No, "dateEnd", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    sx: {
                                                      "& .MuiOutlinedInput-root": {
                                                        height: "30px",
                                                        paddingRight: "8px",
                                                      },
                                                      "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        marginLeft: -1,
                                                      },
                                                      "& .MuiInputAdornment-root": {
                                                        marginLeft: -2,
                                                        paddingLeft: "0px"
                                                      }
                                                    },
                                                  },
                                                }}
                                                disabled
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {formatThaiSlash(
                                          dayjs(
                                            dateRangesA[row.No]?.dateEnd ||
                                              dayjs(row.DateEnd, "DD/MM/YYYY"),
                                            "DD/MM/YYYY",
                                          ),
                                        )}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {row.TicketNameName}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(row.TotalPrice)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(row.VatOnePercent)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(row.TotalAmount)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(totalIncomingMoney)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(
                                          Math.abs(
                                            Number(row.TotalAmount) -
                                              totalIncomingMoney,
                                          ) < 1e-6
                                            ? 0
                                            : Number(row.TotalAmount) -
                                                totalIncomingMoney,
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                );
                              })
                            : pagedTicketsDetail.map((row, index) => {
                                // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter(
                                  (transferRow) =>
                                    transferRow.TicketName === row.TicketName &&
                                    transferRow.PeriodStart === row.DateStart &&
                                    transferRow.PeriodEnd === row.DateEnd,
                                );

                                console.log("Tranfer Detail : ", transfer);
                                console.log("month Detail : ", row.Month);

                                const totalIncomingMoney = transfer.reduce(
                                  (sum, transferRow) => {
                                    return (
                                      sum +
                                      (Number(transferRow.IncomingMoney) || 0)
                                    );
                                  },
                                  0,
                                );
                                // <<<<<<

                                return (
                                  <TableRow
                                    key={row.No}
                                    onClick={() =>
                                      handleRowClick(row, index, row.Month)
                                    }
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": { backgroundColor: "#e0e0e0" },
                                      backgroundColor:
                                        selectedRow.No === row.No ||
                                        indexes === index
                                          ? "#fff9c4"
                                          : "",
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {safePage * rowsPerPage + index + 1}
                                    </TableCell>
                                    {/* วันที่เริ่มต้น */}
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateAChange(row.No, "dateStart", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  inputProps: {
                                                    value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                  },
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "14px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                              disabled
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateStart ||
                                            dayjs(row.DateStart, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    {/* วันที่สิ้นสุด */}
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateAChange(row.No, "dateEnd", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  inputProps: {
                                                    value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                  },
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "14px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                              disabled
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateEnd ||
                                            dayjs(row.DateEnd, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {row.TicketNameName}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalPrice)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.VatOnePercent)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalAmount)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(totalIncomingMoney)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(
                                        Math.abs(
                                          Number(row.TotalAmount) -
                                            totalIncomingMoney,
                                        ) < 1e-6
                                          ? 0
                                          : Number(row.TotalAmount) -
                                              totalIncomingMoney,
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePaginationBar
                      count={filteredTicketsDetail.length}
                      page={safePage}
                      rowsPerPage={rowsPerPage}
                      onPageChange={setPage}
                      onRowsPerPageChange={setRowsPerPage}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {/* {
                      selectedRow && <UpdateReport ticket={selectedRow} open={open} dateRanges={dateRangesA} months={month} />
                    } */}
                    {pagedTicketsDetail.map((row, index) =>
                      (selectedRow && selectedRow.No === row.No) ||
                      indexes === index ? (
                        <UpdateReport
                          key={row.No}
                          ticket={row}
                          open={open}
                          dateRanges={dateRangesA}
                          months={month}
                        />
                      ) : (
                        ""
                      ),
                    )}
                  </Grid>
                </Grid>
              ) : open === 2 ? (
                <Grid container spacing={2} sx={{ marginTop: -5 }}>
                  <Grid item xs={12}>
                    {windowWidth <= 900 ? (
                      <Grid container spacing={2} textAlign="right">
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="warning"
                                checked={checkOverdueTransfer}
                                onChange={() =>
                                  handleToggleOverdue()
                                }
                              />
                            }
                            label={
                              <Typography
                                sx={{ fontSize: "16px", fontWeight: "bold" }}
                              >
                                ค้างโอน
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                              fontSize: "12px",
                              color: "red",
                              marginTop: 2,
                              marginBottom: -1,
                            }}
                            gutterBottom
                          >
                            *กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          display="flex"
                          justifyContent="right"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                              fontSize: "12px",
                              color: "red",
                              marginBottom: -1,
                              marginRight: 1,
                            }}
                            gutterBottom
                          >
                            *เลือกดูเฉพาะค้างโอนหรือดูทั้งหมด กดตรงนี้*
                          </Typography>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="warning"
                                checked={checkOverdueTransfer}
                                onChange={() =>
                                  handleToggleOverdue()
                                }
                              />
                            }
                            label={
                              <Typography
                                sx={{ fontSize: "16px", fontWeight: "bold" }}
                              >
                                ค้างโอน
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    )}
                    <TableContainer
                      component={Paper}
                      sx={{ marginBottom: 2, height: "250px" }}
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
                            <TablecellYellow
                              width={50}
                              sx={{ textAlign: "center", fontSize: 16 }}
                            >
                              ลำดับ
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("DateStart")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              วันที่รับ
                              {sortConfig.key === "DateStart" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("DateEnd")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              จนถึง
                              {sortConfig.key === "DateEnd" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("TicketName")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 300,
                              }}
                            >
                              ชื่อตั๋ว
                              {sortConfig.key === "TicketName" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดเงิน
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              หักภาษี 1%
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดชำระ
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดโอน
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ค้างโอน
                            </TablecellYellow>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredTransportDetail.length === 0 ? (
                            <TableRow>
                              <TablecellNoData colSpan={9}>
                                <Inventory fontSize="large" />
                                <br />
                                ไม่มีข้อมูล
                              </TablecellNoData>
                            </TableRow>
                          ) : checkOverdueTransfer
                            ? pagedTransportDetail.map((row, index) => {
                                // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter(
                                  (transferRow) =>
                                    transferRow.TicketName === row.TicketName &&
                                    transferRow.PeriodStart === row.DateStart &&
                                    transferRow.PeriodEnd === row.DateEnd,
                                );

                                console.log("Tranfer Detail : ", transfer);
                                console.log("month Detail : ", row.Month);

                                const round2 = (num) =>
                                  Math.round(
                                    (Number(num) + Number.EPSILON) * 100,
                                  ) / 100;

                                const totalIncomingMoney = round2(
                                  transfer.reduce(
                                    (sum, row) =>
                                      sum + (Number(row.IncomingMoney) || 0),
                                    0,
                                  ),
                                );

                                const totalAmounts = round2(
                                  Number(row.TotalAmount) - totalIncomingMoney,
                                );

                                // const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                //   return sum + (Number(transferRow.IncomingMoney) || 0);
                                // }, 0);
                                // <<<<<<

                                return (
                                  totalAmounts !== 0 && (
                                    <TableRow
                                      key={row.No}
                                      onClick={() =>
                                        handleRowClick(row, index, row.Month)
                                      }
                                      sx={{
                                        cursor: "pointer",
                                        "&:hover": {
                                          backgroundColor: "#e0e0e0",
                                        },
                                        backgroundColor:
                                          selectedRow.No === row.No ||
                                          indexes === index
                                            ? "#fff9c4"
                                            : "",
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {safePage * rowsPerPage + index + 1}
                                      </TableCell>
                                      {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesT[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateTChange(row.No, "dateStart", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
                                                        },
                                                        "& .MuiInputAdornment-root": {
                                                          marginLeft: -2,
                                                          paddingLeft: "0px"
                                                        }
                                                      },
                                                    },
                                                  }}
                                                  disabled
                                                />
                                              </LocalizationProvider>
                                            </Paper>
                                          </TableCell> */}
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {formatThaiSlash(
                                          dayjs(
                                            dateRangesA[row.No]?.dateStart ||
                                              dayjs(
                                                row.DateStart,
                                                "DD/MM/YYYY",
                                              ),
                                            "DD/MM/YYYY",
                                          ),
                                        )}
                                      </TableCell>

                                      {/* วันที่สิ้นสุด */}
                                      {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesT[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateTChange(row.No, "dateEnd", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
                                                        },
                                                        "& .MuiInputAdornment-root": {
                                                          marginLeft: -2,
                                                          paddingLeft: "0px"
                                                        },
                                                      },
                                                    },
                                                  }}
                                                  disabled
                                                />
                                              </LocalizationProvider>
                                            </Paper>
                                          </TableCell> */}
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {formatThaiSlash(
                                          dayjs(
                                            dateRangesA[row.No]?.dateEnd ||
                                              dayjs(row.DateEnd, "DD/MM/YYYY"),
                                            "DD/MM/YYYY",
                                          ),
                                        )}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                        }}
                                      >
                                        {row.TicketNameName}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(row.TotalPrice)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(row.VatOnePercent)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(row.TotalAmount)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(totalIncomingMoney)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "right",
                                          fontWeight:
                                            (selectedRow.No === row.No ||
                                              indexes === index) &&
                                            "bold",
                                          paddingLeft: "10px !important",
                                          paddingRight: "10px !important",
                                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                        }}
                                      >
                                        {formatNumber(
                                          Math.abs(
                                            Number(row.TotalAmount) -
                                              totalIncomingMoney,
                                          ) < 1e-6
                                            ? 0
                                            : Number(row.TotalAmount) -
                                                totalIncomingMoney,
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                );
                              })
                            : pagedTransportDetail.map((row, index) => {
                                // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter(
                                  (transferRow) =>
                                    transferRow.TicketName === row.TicketName &&
                                    transferRow.PeriodStart === row.DateStart &&
                                    transferRow.PeriodEnd === row.DateEnd,
                                );

                                console.log("Tranfer Detail : ", transfer);
                                console.log("month Detail : ", row.Month);

                                const totalIncomingMoney = transfer.reduce(
                                  (sum, transferRow) => {
                                    return (
                                      sum +
                                      (Number(transferRow.IncomingMoney) || 0)
                                    );
                                  },
                                  0,
                                );
                                // <<<<<<

                                return (
                                  <TableRow
                                    key={row.No}
                                    onClick={() =>
                                      handleRowClick(row, index, row.Month)
                                    }
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": { backgroundColor: "#e0e0e0" },
                                      backgroundColor:
                                        selectedRow.No === row.No ||
                                        indexes === index
                                          ? "#fff9c4"
                                          : "",
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {safePage * rowsPerPage + index + 1}
                                    </TableCell>
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesT[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateTChange(row.No, "dateStart", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    sx: {
                                                      "& .MuiOutlinedInput-root": {
                                                        height: "30px",
                                                        paddingRight: "8px",
                                                      },
                                                      "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        marginLeft: -1,
                                                      },
                                                      "& .MuiInputAdornment-root": {
                                                        marginLeft: -2,
                                                        paddingLeft: "0px"
                                                      }
                                                    },
                                                  },
                                                }}
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateStart ||
                                            dayjs(row.DateStart, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    {/* วันที่สิ้นสุด */}
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesT[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateTChange(row.No, "dateEnd", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    sx: {
                                                      "& .MuiOutlinedInput-root": {
                                                        height: "30px",
                                                        paddingRight: "8px",
                                                      },
                                                      "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        marginLeft: -1,
                                                      },
                                                      "& .MuiInputAdornment-root": {
                                                        marginLeft: -2,
                                                        paddingLeft: "0px"
                                                      }
                                                    },
                                                  },
                                                }}
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateEnd ||
                                            dayjs(row.DateEnd, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {row.TicketNameName}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalPrice)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.VatOnePercent)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalAmount)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(totalIncomingMoney)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(
                                        Math.abs(
                                          Number(row.TotalAmount) -
                                            totalIncomingMoney,
                                        ) < 1e-6
                                          ? 0
                                          : Number(row.TotalAmount) -
                                              totalIncomingMoney,
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePaginationBar
                      count={filteredTransportDetail.length}
                      page={safePage}
                      rowsPerPage={rowsPerPage}
                      onPageChange={setPage}
                      onRowsPerPageChange={setRowsPerPage}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item xs={12}>
                      {/* {
                        selectedRow && <UpdateReport ticket={selectedRow} open={open} dateRanges={dateRangesG} months={month} />
                      } */}
                      {pagedTransportDetail.map((row, index) =>
                        (selectedRow && selectedRow.No === row.No) ||
                        indexes === index ? (
                          <UpdateReport
                            key={row.No}
                            ticket={row}
                            open={open}
                            dateRanges={dateRangesG}
                            months={month}
                          />
                        ) : (
                          ""
                        ),
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2} sx={{ marginTop: -5 }}>
                  <Grid item xs={12}>
                    {windowWidth <= 900 ? (
                      <Grid container spacing={2} textAlign="right">
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="warning"
                                checked={checkOverdueTransfer}
                                onChange={() =>
                                  handleToggleOverdue()
                                }
                              />
                            }
                            label={
                              <Typography
                                sx={{ fontSize: "16px", fontWeight: "bold" }}
                              >
                                ค้างโอน
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                              fontSize: "12px",
                              color: "red",
                              marginTop: 2,
                              marginBottom: -1,
                            }}
                            gutterBottom
                          >
                            *กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          display="flex"
                          justifyContent="right"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                              fontSize: "12px",
                              color: "red",
                              marginBottom: -1,
                              marginRight: 1,
                            }}
                            gutterBottom
                          >
                            *เลือกดูเฉพาะค้างโอนหรือดูทั้งหมด กดตรงนี้*
                          </Typography>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="warning"
                                checked={checkOverdueTransfer}
                                onChange={() =>
                                  handleToggleOverdue()
                                }
                              />
                            }
                            label={
                              <Typography
                                sx={{ fontSize: "16px", fontWeight: "bold" }}
                              >
                                ค้างโอน
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    )}
                    <TableContainer
                      component={Paper}
                      sx={{ marginBottom: 2, height: "250px" }}
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
                            <TablecellYellow
                              width={50}
                              sx={{ textAlign: "center", fontSize: 16 }}
                            >
                              ลำดับ
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("DateStart")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              วันที่รับ
                              {sortConfig.key === "DateStart" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("DateEnd")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              จนถึง
                              {sortConfig.key === "DateEnd" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              onClick={() => handleSort("TicketName")}
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 300,
                              }}
                            >
                              ชื่อตั๋ว
                              {sortConfig.key === "TicketName" ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowDropDownIcon />
                                ) : (
                                  <ArrowDropUpIcon />
                                )
                              ) : (
                                <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                              )}
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดเงิน
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              หักภาษี 1%
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดชำระ
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ยอดโอน
                            </TablecellYellow>
                            <TablecellYellow
                              sx={{
                                textAlign: "center",
                                fontSize: 16,
                                width: 120,
                              }}
                            >
                              ค้างโอน
                            </TablecellYellow>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredGasStationDetail.length === 0 ? (
                            <TableRow>
                              <TablecellNoData colSpan={9}>
                                <Inventory fontSize="large" />
                                <br />
                                ไม่มีข้อมูล
                              </TablecellNoData>
                            </TableRow>
                          ) : checkOverdueTransfer
                            ? pagedGasStationDetail.map((row, index) => {
                                // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter(
                                  (transferRow) =>
                                    transferRow.TicketName === row.TicketName &&
                                    transferRow.PeriodStart === row.DateStart &&
                                    transferRow.PeriodEnd === row.DateEnd,
                                );

                                console.log("Tranfer Detail : ", transfer);
                                console.log("month Detail : ", row.Month);

                                const round2 = (num) =>
                                  Math.round(
                                    (Number(num) + Number.EPSILON) * 100,
                                  ) / 100;

                                const totalIncomingMoney = round2(
                                  transfer.reduce(
                                    (sum, row) =>
                                      sum + (Number(row.IncomingMoney) || 0),
                                    0,
                                  ),
                                );

                                const totalAmounts = round2(
                                  Number(row.TotalAmount) - totalIncomingMoney,
                                );

                                // const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                //   return sum + (Number(transferRow.IncomingMoney) || 0);
                                // }, 0);
                                // <<<<<<

                                return (
                                  <TableRow
                                    key={row.No}
                                    onClick={() =>
                                      handleRowClick(row, index, row.Month)
                                    }
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": { backgroundColor: "#e0e0e0" },
                                      backgroundColor:
                                        selectedRow.No === row.No ||
                                        indexes === index
                                          ? "#fff9c4"
                                          : "",
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {safePage * rowsPerPage + index + 1}
                                    </TableCell>
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesG[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateGChange(row.No, "dateStart", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
                                                        },
                                                        "& .MuiInputAdornment-root": {
                                                          marginLeft: -2,
                                                          paddingLeft: "0px"
                                                        }
                                                      },
                                                    },
                                                  }}
                                                />
                                              </LocalizationProvider>
                                            </Paper>
                                          </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateStart ||
                                            dayjs(row.DateStart, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    {/* วันที่สิ้นสุด */}
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesG[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateGChange(row.No, "dateEnd", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
                                                        },
                                                        "& .MuiInputAdornment-root": {
                                                          marginLeft: -2,
                                                          paddingLeft: "0px"
                                                        }
                                                      },
                                                    },
                                                  }}
                                                />
                                              </LocalizationProvider>
                                            </Paper>
                                          </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateEnd ||
                                            dayjs(row.DateEnd, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {row.TicketNameName}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalPrice)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.VatOnePercent)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalAmount)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(totalIncomingMoney)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(
                                        Math.abs(
                                          Number(row.TotalAmount) -
                                            totalIncomingMoney,
                                        ) < 1e-6
                                          ? 0
                                          : Number(row.TotalAmount) -
                                              totalIncomingMoney,
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            : pagedGasStationDetail.map((row, index) => {
                                // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter(
                                  (transferRow) =>
                                    transferRow.TicketName === row.TicketName &&
                                    transferRow.PeriodStart === row.DateStart &&
                                    transferRow.PeriodEnd === row.DateEnd,
                                );

                                console.log("Tranfer Detail : ", transfer);
                                console.log("month Detail : ", row.Month);

                                const totalIncomingMoney = transfer.reduce(
                                  (sum, transferRow) => {
                                    return (
                                      sum +
                                      (Number(transferRow.IncomingMoney) || 0)
                                    );
                                  },
                                  0,
                                );
                                // <<<<<<

                                return (
                                  <TableRow
                                    key={row.No}
                                    onClick={() =>
                                      handleRowClick(row, index, row.Month)
                                    }
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": { backgroundColor: "#e0e0e0" },
                                      backgroundColor:
                                        selectedRow.No === row.No ||
                                        indexes === index
                                          ? "#fff9c4"
                                          : "",
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {safePage * rowsPerPage + index + 1}
                                    </TableCell>
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesG[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateGChange(row.No, "dateStart", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    sx: {
                                                      "& .MuiOutlinedInput-root": {
                                                        height: "30px",
                                                        paddingRight: "8px",
                                                      },
                                                      "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        marginLeft: -1,
                                                      },
                                                      "& .MuiInputAdornment-root": {
                                                        marginLeft: -2,
                                                        paddingLeft: "0px"
                                                      }
                                                    },
                                                  },
                                                }}
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateStart ||
                                            dayjs(row.DateStart, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    {/* วันที่สิ้นสุด */}
                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesG[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateGChange(row.No, "dateEnd", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                    sx: {
                                                      "& .MuiOutlinedInput-root": {
                                                        height: "30px",
                                                        paddingRight: "8px",
                                                      },
                                                      "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        marginLeft: -1,
                                                      },
                                                      "& .MuiInputAdornment-root": {
                                                        marginLeft: -2,
                                                        paddingLeft: "0px"
                                                      }
                                                    },
                                                  },
                                                }}
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {formatThaiSlash(
                                        dayjs(
                                          dateRangesA[row.No]?.dateEnd ||
                                            dayjs(row.DateEnd, "DD/MM/YYYY"),
                                          "DD/MM/YYYY",
                                        ),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "center",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                      }}
                                    >
                                      {row.TicketNameName}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalPrice)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.VatOnePercent)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(row.TotalAmount)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(totalIncomingMoney)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        textAlign: "right",
                                        fontWeight:
                                          (selectedRow.No === row.No ||
                                            indexes === index) &&
                                          "bold",
                                        paddingLeft: "10px !important",
                                        paddingRight: "10px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                                      }}
                                    >
                                      {formatNumber(
                                        Math.abs(
                                          Number(row.TotalAmount) -
                                            totalIncomingMoney,
                                        ) < 1e-6
                                          ? 0
                                          : Number(row.TotalAmount) -
                                              totalIncomingMoney,
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePaginationBar
                      count={filteredGasStationDetail.length}
                      page={safePage}
                      rowsPerPage={rowsPerPage}
                      onPageChange={setPage}
                      onRowsPerPageChange={setRowsPerPage}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {/* {
                        selectedRow && <UpdateReport ticket={selectedRow} open={open} dateRanges={dateRangesG} months={month} />
                      } */}
                    {pagedGasStationDetail.map((row, index) =>
                      selectedRow && selectedRow.No === row.No ? (
                        <UpdateReport
                          key={row.No}
                          ticket={row}
                          open={open}
                          dateRanges={dateRangesG}
                          months={month}
                        />
                      ) : (
                        ""
                      ),
                    )}
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Report;
