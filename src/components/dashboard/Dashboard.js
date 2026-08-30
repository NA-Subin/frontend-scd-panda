import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import Cookies from "js-cookie";
import Logo from "../../theme/img/logoPanda.jpg";
import { borderRadius, keyframes, width } from "@mui/system";
import { BarChart, PieChart, SparkLineChart } from "@mui/x-charts";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/th"; // เพิ่มการใช้งาน locale ภาษาไทย
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useGasStationData } from "../../server/provider/GasStationProvider";
import JsonUploader from "../../server/UploadJson";
//import DriverTable from "./ProviderTest";

dayjs.locale("th"); // ตั้งค่าให้ dayjs ใช้ภาษาไทย

const slideOutRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  80% {
    transform: translateX(-20%);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [slideOut, setSlideOut] = useState(true);

  // const { officers,
  //   drivers,
  //   creditors,
  //   order,
  //   trip,
  //   tickets,
  //   gasstation,
  //   reghead,
  //   regtail,
  //   small,
  //   depots,
  //   customertransports,
  //   customergasstations,
  //   customerbigtruck,
  //   customersmalltruck,
  //   customertickets
  // } = useData();

  const { order, trip, tickets, reportFinancial, report } = useTripData();

  const {
    officers,
    drivers,
    creditors,
    reghead,
    regtail,
    small,
    depots,
    customertransports,
    customergasstations,
    customerbigtruck,
    customersmalltruck,
    customertickets,
    deductibleincome,
    companypayment,
    expenseitems,
  } = useBasicData();

  const { gasstationDetail } = useGasStationData();

  // const orders = Object.values(order || {});
  const orders = Object.values(order || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });

  console.log(
    "show Orders : ",
    orders.filter((item) => item.file_path !== undefined),
  );
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
  const creditor = Object.values(creditors || {});
  const driver = Object.values(drivers || {});
  //const ticket = Object.values(tickets || {});
  const ticket = Object.values(tickets || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });
  const officer = Object.values(officers || {});
  const gasstations = Object.values(gasstationDetail || {});
  const regheads = Object.values(reghead || {}).filter(
    (r) => r.StatusTruck !== "ยกเลิก",
  );
  const regtails = Object.values(regtail || {}).filter(
    (r) => r.StatusTruck !== "ยกเลิก",
  );
  const smalls = Object.values(small || {}).filter(
    (s) => s.StatusTruck !== "ยกเลิก",
  );
  const depot = Object.values(depots || {});
  const Ctransport = Object.values(customertransports || {});
  const Cgasstations = Object.values(customergasstations || {});
  const Cbigtruck = Object.values(customerbigtruck || {});
  const Csmalltruck = Object.values(customersmalltruck || {});
  const Ctickets = Object.values(customertickets || {});

  const reports_F = Object.values(reportFinancial || {}).sort((a, b) => {
    const driverA = a.DriverName || "";
    const driverB = b.DriverName || "";
    return driverA.localeCompare(driverB, "th", { numeric: true });
  });
  const deductibleincomeDetail = Object.values(deductibleincome).filter(
    (item) => item.StatusData === "อยู่ในระบบ",
  );
  const reports = Object.values(report || {});
  const expenseitem = Object.values(expenseitems);
  const companypaymentDetail = Object.values(companypayment);

  const Cbigtruck1 = Cbigtruck.filter((row) => row.Type === "เชียงใหม่");
  const Cbigtruck2 = Cbigtruck.filter((row) => row.Type === "เชียงราย");
  const Csmalltruck1 = Csmalltruck.filter((row) => row.Type === "เชียงใหม่");
  const Csmalltruck2 = Csmalltruck.filter((row) => row.Type === "บ้านโฮ่ง");
  const [date, setDate] = useState(dayjs(new Date())); // เก็บชื่อเดือน
  const [volumeAll, setVolumeAll] = useState([]); // เก็บข้อมูลทั้งหมด
  const [checkDate, setCheckDate] = useState(false); // เก็บข้อมูลทั้งหมด
  const [selectedTruck, setSelectedTruck] = useState([
    "รถใหญ่",
    "รถเล็ก",
    "รถรับจ้างขนส่ง",
  ]);
  const [selectedMonth, setSelectedMonth] = useState(
    dayjs().format("MM/YYYY").toString(),
  );
  const [selectedFlow, setSelectedFlow] = useState(["in", "out"]);

  console.log("selectedMonth : ", selectedMonth);

  const handleDateChangeDate = (newValue) => {
    const monthName = newValue.format("MMMM"); // แปลงเป็นชื่อเดือนที่เลือก
    // เตรียมโครงสร้างเก็บผลรวม
    const monthOrders = {};
    const monthTickets = {};
    const monthTrips = {};
    const monthOrderCancel = {};
    const monthTicketCancel = {};
    const monthStats = {};

    const startOfMonth = newValue.startOf("month"); // วันเริ่มต้นของเดือนที่เลือก
    const endOfMonth = newValue.endOf("month"); // วันสิ้นสุดของเดือนที่เลือก

    // สร้างวันที่ทั้งหมดในเดือนที่เลือก
    const allDatesInMonth = [];
    let currentDate = startOfMonth;

    // Loop สร้างวันที่ทั้งหมดจากวันที่เริ่มต้นถึงสิ้นเดือน
    while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth)) {
      allDatesInMonth.push(currentDate.format("DD/MM/YYYY")); // เก็บวันที่ในรูปแบบ 'DD/MM/YYYY'
      currentDate = currentDate.add(1, "day"); // เพิ่มวันไปทีละวัน
    }

    // Orders
    orders.forEach((o) => {
      const [day, monthStr] = o.Date.split("/");
      const monthIndex = parseInt(monthStr, 10) - 1;
      const monthName = months[monthIndex];
      const orderDate = dayjs(o.Date, "DD/MM/YYYY"); // แปลงวันที่เป็น dayjs object

      // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
      if (allDatesInMonth.includes(orderDate.format("DD/MM/YYYY"))) {
        const dayOnly = orderDate.format("DD"); // ใช้เพียงแค่วันที่
        if (!monthOrders[dayOnly]) {
          monthOrders[dayOnly] = { date: dayOnly, orders: 0 };
        }
        monthOrders[dayOnly].orders += 1;
      }
    });

    ticket.forEach((t) => {
      // const [day, monthStr] = t.Date.split('/');
      // const monthIndex = parseInt(monthStr, 10) - 1;
      // const monthName = months[monthIndex];
      const orderDate = dayjs(t.Date, "DD/MM/YYYY"); // แปลงวันที่เป็น dayjs object

      // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
      if (allDatesInMonth.includes(orderDate.format("DD/MM/YYYY"))) {
        const dayOnly = orderDate.format("DD"); // ใช้เพียงแค่วันที่
        if (!monthTickets[dayOnly]) {
          monthTickets[dayOnly] = { date: dayOnly, ticket: 0 };
        }
        monthTickets[dayOnly].ticket += 1;
      }
    });

    orders.forEach((o) => {
      if (o.Trip === "ยกเลิก") {
        // const [day, monthStr] = o.Date.split('/');
        // const monthIndex = parseInt(monthStr, 10) - 1;
        // const monthName = months[monthIndex];
        const ordersDate = dayjs(o.Date, "DD/MM/YYYY"); // แปลงวันที่เป็น dayjs object

        // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
        if (allDatesInMonth.includes(ordersDate.format("DD/MM/YYYY"))) {
          const dayOnly = ordersDate.format("DD"); // ใช้เพียงแค่วันที่
          if (!monthOrderCancel[dayOnly]) {
            monthOrderCancel[dayOnly] = { date: dayOnly, ordersCancel: 0 };
          }
          monthOrderCancel[dayOnly].ordersCancel += 1;
        }
      }
    });

    // Tickets
    ticket.forEach((t) => {
      if (t.Trip === "ยกเลิก") {
        // const [day, monthStr] = t.Date.split('/');
        // const monthIndex = parseInt(monthStr, 10) - 1;
        // const monthName = months[monthIndex];
        const ticketDate = dayjs(t.Date, "DD/MM/YYYY"); // แปลงวันที่เป็น dayjs object

        // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
        if (allDatesInMonth.includes(ticketDate.format("DD/MM/YYYY"))) {
          const dayOnly = ticketDate.format("DD"); // ใช้เพียงแค่วันที่
          if (!monthTicketCancel[dayOnly]) {
            monthTicketCancel[dayOnly] = { date: dayOnly, ticketCancel: 0 };
          }
          monthTicketCancel[dayOnly].ticketCancel += 1;
        }
      }
    });

    // Trips
    trips.forEach((r) => {
      // const [day, monthStr] = r.DateStart.split('/');
      // const monthIndex = parseInt(monthStr, 10) - 1;
      // const monthName = months[monthIndex];
      const tripDate = dayjs(r.DateStart, "DD/MM/YYYY"); // แปลงวันที่เป็น dayjs object

      // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
      if (allDatesInMonth.includes(tripDate.format("DD/MM/YYYY"))) {
        const dayOnly = tripDate.format("DD"); // ใช้เพียงแค่วันที่
        if (!monthTrips[dayOnly]) {
          monthTrips[dayOnly] = { date: dayOnly, trips: 0 };
        }
        monthTrips[dayOnly].trips += 1;
      }
    });

    // สร้าง array สำหรับ BarChart ตามวันที่ที่เลือก
    const fullOrders = allDatesInMonth.map((date) => {
      const day = dayjs(date, "DD/MM/YYYY").format("DD"); // แสดงแค่วันที่
      return {
        date: day, // แสดงแค่วัน
        orders: monthOrders[day]?.orders || 0,
        ticket: monthTickets[day]?.ticket || 0,
        trips: monthTrips[day]?.trips || 0,
        ordersCancel: monthOrderCancel[day]?.ordersCancel || 0,
        ticketCancel: monthTicketCancel[day]?.ticketCancel || 0,
      };
    });

    setDate(newValue); // ตั้งค่าชื่อเดือนที่เลือก
    setVolumeAll(fullOrders); // ตั้งค่าข้อมูลที่ใช้แสดง
    setCheckDate(true);
  };

  let totalVolume = 0;

  const getTotalVolumePerRow = (o) => {
    let total = 0;

    const truckType = trips.find((r) => r.id === Number(o.Trip) + 1)?.TruckType;

    // กำหนด multiplier
    const multiplier =
      truckType === "รถใหญ่" || truckType === "รถรับจ้างขนส่ง" ? 1000 : 1;

    if (o.Product && typeof o.Product === "object") {
      Object.entries(o.Product).forEach(([key, value]) => {
        if (key === "p") return; // กัน key แปลก

        const volume = Number(value?.Volume) || 0;
        total += volume * multiplier;
      });
    }

    return total;
  };

  const getTruckKey = (type) => {
    if (type === "รถใหญ่") return "big";
    if (type === "รถเล็ก") return "small";
    if (type === "รถรับจ้างขนส่ง") return "outsource";
    return "other";
  };

  const tripMap = Object.fromEntries(
    trips.filter((item) => item.StatusTrip === "จบทริป").map((t) => [t.id, t]),
  );
  console.log(
    "show Trips : ",
    trips.filter((item) => item.StatusTrip !== "จบทริป"),
  );

  const monthVolumes = {};

  const ticketData = ticket
    .filter(
      (item) =>
        !["ตั๋วรถใหญ่", "ตั๋วรถเล็ก"].includes(item.CustomerType) &&
        item.Status === "จัดส่งสำเร็จ" &&
        item.Trip !== "ยกเลิก",
    )
    .map((t) => {
      const trip = tripMap[Number(t.Trip) + 1];
      if (!trip) return null;

      const date = dayjs(trip.DateReceive, "DD/MM/YYYY", true);
      if (!date.isValid()) return null;

      let registration = "";
      if (trip?.TruckType === "รถใหญ่") {
        const reghead = regheads.find(
          (r) => r.uuid === t.Registration,
        );
        if (reghead) {
          registration = `${reghead.id}: ${reghead.RegHead}`;
        } else {
          return null; // ถ้าไม่พบข้อมูลใน regheads ให้ข้ามรายการนี้
        }
      } else if (trip?.TruckType === "รถเล็ก") {
        const reghead = smalls.find(
          (r) => r.uuid === t.Registration,
        );
        if (reghead) {
          registration = `${reghead.id}: ${reghead.RegHead}`;
        } else {
          return null; // ถ้าไม่พบข้อมูลใน regheads ให้ข้ามรายการนี้
        }
      } else if (trip?.TruckType === "รถรับจ้างขนส่ง") {
        registration = trip?.Registration; // ใช้ Registration ตรงๆ สำหรับรถรับจ้างขนส่ง
      }

      return {
        flowType: "in", // 🔥 สำคัญ
        tripId: t.Trip,
        truckType: trip.TruckType,
        driver: trip.DriverName ?? trip.Driver,
        registration: registration,
        month: date.format("MM/YYYY"),
        volume: getTotalVolumePerRow(t),
      };
    })
    .filter(Boolean);

  const orderData = orders
    .filter(
      (item) =>
        item.status !== "ยกเลิก" &&
        Number(item.Trip) &&
        item.Status === "จัดส่งสำเร็จ" &&
        item.Trip !== "ยกเลิก",
    )
    .map((o) => {
      const trip = tripMap[Number(o.Trip) + 1];
      if (!trip) return null;

      const date = dayjs(trip.DateDelivery, "DD/MM/YYYY", true);
      if (!date.isValid()) return null;

      let registration = "";
      if (trip?.TruckType === "รถใหญ่") {
        const reghead = regheads.find(
          (r) => r.uuid === o.Registration,
        );
        if (reghead) {
          registration = `${reghead.id}: ${reghead.RegHead}`;
        } else {
          return null; // ถ้าไม่พบข้อมูลใน regheads ให้ข้ามรายการนี้
        }
      } else if (trip?.TruckType === "รถเล็ก") {
        const reghead = smalls.find(
          (r) => r.uuid === o.Registration,
        );
        if (reghead) {
          registration = `${reghead.id}: ${reghead.RegHead}`;
        } else {
          return null; // ถ้าไม่พบข้อมูลใน regheads ให้ข้ามรายการนี้
        }
      } else if (trip?.TruckType === "รถรับจ้างขนส่ง") {
        registration = trip?.Registration; // ใช้ Registration ตรงๆ สำหรับรถรับจ้างขนส่ง
      }

      return {
        flowType: "out", // 🔥 สำคัญ
        tripId: o.Trip,
        truckType: trip.TruckType,
        driver: trip.DriverName ?? trip.Driver,
        registration: registration,
        month: date.format("MM/YYYY"),
        volume: getTotalVolumePerRow(o),
      };
    })
    .filter(Boolean);

  const allData = [...ticketData, ...orderData];

  console.log("monthVolumes : ", monthVolumes);

  const getDriverName = (driverStr = "") => {
    const str = String(driverStr ?? "");
    return str.includes(":") ? str.split(":")[1]?.trim() || str : str;
  };

  const getRegistration = (regStr = "") => {
    const str = String(regStr ?? "");
    return str.includes(":") ? str.split(":")[1]?.trim().split(" ")[0] || str : str;
  };

  const driverMonthVolumes = {};

  orders
    .filter((item) => item.status !== "ยกเลิก" && Number(item.Trip))
    .forEach((o) => {
      if (!o.Date) return;

      // const date = dayjs(o.Date, 'DD/MM/YYYY');
      // const monthKey = date.format('MM/YYYY');

      const trip = tripMap[Number(o.Trip) + 1];
      if (!trip) return;

      const truckType = trip.TruckType;

      const date = dayjs(trip.DateDelivery, "DD/MM/YYYY", true);
      if (!date.isValid()) return;

      const monthKey = date.format("MM/YYYY");

      const driver = getDriverName(o.DriverName ?? o.Driver);
      const registration = getRegistration(o.RegistrationName ?? o.Registration);

      const totalVolume = getTotalVolumePerRow(o);

      // ✅ ใช้ key เดียวทุกประเภท
      const key = `${driver}|${registration}`;

      // init เดือน
      if (!driverMonthVolumes[monthKey]) {
        driverMonthVolumes[monthKey] = {};
      }

      // init group
      if (!driverMonthVolumes[monthKey][key]) {
        driverMonthVolumes[monthKey][key] = {
          driver,
          registration,
          truckType,
          volume: 0,
        };
      }

      // sum
      driverMonthVolumes[monthKey][key].volume += totalVolume;
    });

  console.log("driverMonthVolumes : ", driverMonthVolumes);

  const driverChartData = [];

  Object.values(driverMonthVolumes).forEach((monthData) => {
    Object.values(monthData).forEach((d) => {
      const name = `${d.driver} ${d.registration}`;

      driverChartData.push({
        name,
        volume: d.volume,
      });
    });
  });

  const flatDriverData = [];

  Object.entries(driverMonthVolumes).forEach(([month, monthData]) => {
    Object.values(monthData).forEach((d) => {
      const driveName = getDriverName(d.driver);
      const regName = getRegistration(d.registration);

      flatDriverData.push({
        month,
        driver: driveName,
        registration: regName,
        truckType: d.truckType,
        volume: d.volume,
      });
    });
  });

  const big = flatDriverData.filter((d) => d.truckType === "รถใหญ่");
  const smalled = flatDriverData.filter((d) => d.truckType === "รถเล็ก");
  const outsource = flatDriverData.filter(
    (d) => d.truckType === "รถรับจ้างขนส่ง",
  );

  const getFilteredData = (truckTypes) => {
    return flatDriverData.filter((d) => truckTypes.includes(d.truckType));
  };

  const buildDriverChart = (data) => {
    const map = {};

    data.forEach((d) => {
      const driveName = getDriverName(d.driver);
      const regName = getRegistration(d.registration);
      const key = `${driveName} ${regName}`;
      map[key] = (map[key] || 0) + d.volume;
    });

    return Object.entries(map).map(([name, volume]) => ({ name, volume }));
  };

  const buildRegChart = (data) => {
    const map = {};

    data.forEach((d) => {
      const regName = getRegistration(d.registration);
      const key = regName;
      map[key] = (map[key] || 0) + d.volume;
    });

    return Object.entries(map).map(([name, volume]) => ({ name, volume }));
  };

  const buildTotalChart = (data) => {
    const map = {
      รถใหญ่: 0,
      รถเล็ก: 0,
      รถรับจ้างขนส่ง: 0,
    };

    data.forEach((d) => {
      if (map[d.truckType] !== undefined) {
        map[d.truckType] += d.volume;
      }
    });

    return Object.entries(map).map(([name, volume]) => ({
      name,
      volume,
    }));
  };

  const monthOptions = useMemo(() => {
    const months = new Set();

    flatDriverData.forEach((d) => {
      if (d.month) {
        months.add(d.month);
      }
    });

    return Array.from(months).sort(); // ["01/2026", "02/2026"]
  }, [flatDriverData]);

  console.log("monthOptions : ", monthOptions);

  const filtered = useMemo(() => {
    return allData.filter((d) => {
      const matchTruck = selectedTruck.includes(d.truckType);
      const matchMonth = selectedMonth ? d.month === selectedMonth : true;
      const matchFlow = selectedFlow.includes(d.flowType);

      return matchTruck && matchMonth && matchFlow;
    });
  }, [allData, selectedTruck, selectedMonth, selectedFlow]);

  const chartType1 = useMemo(() => buildDriverChart(filtered), [filtered]);
  const chartType2 = useMemo(() => buildRegChart(filtered), [filtered]);
  const chartType3 = useMemo(() => buildTotalChart(filtered), [filtered]);

  const buildDriverTripChart = (data) => {
    const map = {};

    data.forEach((d) => {
      const driveName = getDriverName(d.driver);
      const regName = getRegistration(d.registration);
      const key = `${driveName} ${regName}`;
      map[key] = (map[key] || 0) + 1; // 🔥 นับแทน volume
    });

    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
    }));
  };

  const buildRegTripChart = (data) => {
    const map = {};

    data.forEach((d) => {
      const regName = getRegistration(d.registration);
      const key = regName;
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
    }));
  };

  const buildTotalTripChart = (data, selectedTruck) => {
    const map = {};

    selectedTruck.forEach((type) => {
      map[type] = 0;
    });

    data.forEach((d) => {
      if (map[d.truckType] !== undefined) {
        map[d.truckType] += 1;
      }
    });

    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
    }));
  };

  const tripChartType1 = useMemo(
    () => buildDriverTripChart(filtered),
    [filtered],
  );

  const tripChartType2 = useMemo(() => buildRegTripChart(filtered), [filtered]);

  const tripChartType3 = useMemo(
    () => buildTotalTripChart(filtered, selectedTruck),
    [filtered, selectedTruck],
  );

  const handleClearDate = () => {
    setCheckDate(false);
  };

  console.log("trip : ", trips.length);
  console.log("orders : ", orders);
  console.log("date : ", date);

  const pieParams = {
    width: 290,
    height: 160,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  };

  const pieParamsNewSize = {
    width: 250,
    height: 250,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  };

  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  // เตรียมโครงสร้างเก็บผลรวม
  const monthOrders = {};
  const monthTickets = {};
  const monthTrips = {};
  const monthStats = {};
  const monthOrderCancel = {};
  const monthTicketCancel = {};

  // Orders
  // orders.forEach((o) => {
  //   const [day, monthStr] = o.Date.split('/');
  //   const monthIndex = parseInt(monthStr, 10) - 1;
  //   const monthName = months[monthIndex];

  //   if (!monthOrders[monthName]) {
  //     monthOrders[monthName] = { month: monthName, orders: 0 };
  //   }

  //   monthOrders[monthName].orders += 1;
  // });

  orders.forEach((o) => {
    if (o.Trip === "ยกเลิก") {
      const [day, monthStr] = o.Date.split("/");
      const monthIndex = parseInt(monthStr, 10) - 1;
      const monthName = months[monthIndex];

      if (!monthOrderCancel[monthName]) {
        monthOrderCancel[monthName] = { month: monthName, ordersCancel: 0 };
      }

      monthOrderCancel[monthName].ordersCancel += 1;
    }
  });

  // Tickets
  // ticket.forEach((t) => {
  //   const [day, monthStr] = t.Date.split('/');
  //   const monthIndex = parseInt(monthStr, 10) - 1;
  //   const monthName = months[monthIndex];

  //   if (!monthTickets[monthName]) {
  //     monthTickets[monthName] = { month: monthName, ticket: 0 };
  //   }

  //   monthTickets[monthName].ticket += 1;
  // });

  ticket.forEach((t) => {
    if (
      t.Trip === "ยกเลิก" &&
      typeof t.Date === "string" &&
      t.Date.includes("/")
    ) {
      const [day, monthStr] = t.Date.split("/");
      const monthIndex = parseInt(monthStr, 10) - 1;

      // ตรวจสอบว่า monthIndex อยู่ในช่วง 0-11 และ months มีข้อมูล
      if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
        const monthName = months[monthIndex];

        if (!monthTicketCancel[monthName]) {
          monthTicketCancel[monthName] = { month: monthName, ticketCancel: 0 };
        }

        monthTicketCancel[monthName].ticketCancel += 1;
      }
    }
  });

  trips.forEach((r) => {
    const [day, monthStr] = r.DateStart.split("/");
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];

    if (!monthTrips[monthName]) {
      monthTrips[monthName] = { month: monthName, trips: 0 };
    }

    monthTrips[monthName].trips += 1;
  });

  // สร้าง array สำหรับ BarChart ครบ 12 เดือน
  const fullOrders = months.map((month) => {
    return {
      month,
      orders: monthOrders[month]?.orders || 0,
      ticket: monthTickets[month]?.ticket || 0,
      trips: monthTrips[month]?.trips || 0,
      ordersCancel: monthOrderCancel[month]?.ordersCancel || 0,
      ticketCancel: monthTicketCancel[month]?.ticketCancel || 0,
    };
  });

  const valueFormatter = (v) => `${v?.toLocaleString?.() ?? "-"} รายการ`;

  console.log("monthStats : ", monthStats);
  console.log("monthOrders : ", monthOrders);
  console.log("monthTickets : ", monthTickets);
  console.log("monthTrips : ", monthTrips);
  console.log("fullOrders : ", fullOrders);
  console.log("volumeAll : ", volumeAll);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 10, marginBottom: 5 }}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          animation: slideOut ? `${slideOutRight} 0.8s forwards` : "none",
          position: "relative",
        }}
      >
        <img src={Logo} width="200" />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginLeft={-6}
          marginTop={5}
        >
          <Typography
            variant="h1"
            color={theme.palette.error.main}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            S
          </Typography>
          <Typography
            variant="h1"
            color={theme.palette.warning.light}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            C
          </Typography>
          <Typography
            variant="h1"
            color={theme.palette.info.dark}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            D
          </Typography>
          <Typography
            variant="h2"
            color={theme.palette.panda.dark}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          ></Typography>
          <Typography
            variant="h2"
            color={theme.palette.panda.light}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          ></Typography>
        </Box>
      </Box>
      <Divider />
      {/* <JsonUploader /> */}
      <Grid
        container
        spacing={4}
        marginTop={2}
        sx={{
          flexDirection: {
            xs: "column", // หน้าจอเล็ก (<=599px) จะแสดงเป็นคอลัมน์
            sm: "row", // หน้าจอขนาด 600px ขึ้นไปจะแสดงเป็นแถว
            lg: "row", // หน้าจอขนาด 900px ขึ้นไปกลับด้านแถว
          },
        }}
      >
        <Grid item xs={12} sm={12} lg={9.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                sx={{
                  height: "29vh",
                  borderRadius: 5,
                  backgroundColor: theme.palette.info.main,
                  color: "white",
                  paddingTop: 5,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนรถ
                  </Typography>
                  <Divider
                    sx={{ marginBottom: 1, border: "1px solid white" }}
                  />
                  <Typography variant="h2" gutterBottom>
                    {regheads.length + regtails.length + smalls.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                sx={{
                  height: "29vh",
                  backgroundColor: theme.palette.success.dark,
                  borderRadius: 5,
                  color: "white",
                  paddingTop: 5,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนลูกค้า
                  </Typography>
                  <Divider
                    sx={{ marginBottom: 1, border: "1px solid white" }}
                  />
                  <Typography variant="h2" gutterBottom>
                    {Ctransport.length +
                      Cgasstations.length +
                      Cbigtruck.length +
                      Csmalltruck.length +
                      Ctickets.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                sx={{
                  height: "29vh",
                  backgroundColor: theme.palette.error.main,
                  borderRadius: 5,
                  color: "white",
                  paddingTop: 5,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนปั้ม
                  </Typography>
                  <Divider
                    sx={{ marginBottom: 1, border: "1px solid white" }}
                  />
                  <Typography variant="h2" gutterBottom>
                    {gasstations.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                sx={{
                  height: "29vh",
                  borderRadius: 5,
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  paddingTop: 5,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนเที่ยววิ่ง
                  </Typography>
                  <Divider
                    sx={{ marginBottom: 1, border: "1px solid white" }}
                  />
                  <Typography variant="h2" gutterBottom>
                    {trips.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                sx={{
                  height: "29vh",
                  backgroundColor: theme.palette.secondary.main,
                  borderRadius: 5,
                  color: "white",
                  paddingTop: 5,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนรายการสินค้า
                  </Typography>
                  <Divider
                    sx={{ marginBottom: 1, border: "1px solid white" }}
                  />
                  <Typography variant="h2" gutterBottom>
                    {orders.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                sx={{
                  height: "29vh",
                  backgroundColor: theme.palette.warning.dark,
                  borderRadius: 5,
                  color: "white",
                  paddingTop: 5,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนรายการตั๋วสินค้า
                  </Typography>
                  <Divider
                    sx={{ marginBottom: 1, border: "1px solid white" }}
                  />
                  <Typography variant="h2" gutterBottom>
                    {ticket.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} lg={2.5}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h6"
                textAlign="center"
                fontWeight="bold"
                gutterBottom
              >
                จำนวนพนักงาน
              </Typography>
            </Box>

            {/* Middle Content */}
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
              >
                ทั้งหมด {officer.length + driver.length + creditor.length} คน
              </Typography>
              <PieChart
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: officer.length,
                        label: "พนักงานบริษัท",
                        color: theme.palette.success.main,
                      },
                      {
                        id: 1,
                        value: driver.length,
                        label: "พนักงานขับรถ",
                        color: theme.palette.primary.main,
                      },
                      {
                        id: 2,
                        value: creditor.length,
                        label: "เจ้าหนี้การค้า",
                        color: theme.palette.warning.main,
                      },
                    ],
                    innerRadius: 30,
                  },
                ]}
                {...pieParams}
              />

              {/* Legend */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    height: 15,
                    width: 15,
                    border: "2px solid white",
                    mr: 0.5,
                  }}
                />
                <Typography fontSize="12px" fontWeight="bold" mr={1}>
                  พนักงานบริษัท
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    height: 15,
                    width: 15,
                    border: "2px solid white",
                    mr: 0.5,
                  }}
                />
                <Typography fontSize="12px" fontWeight="bold" mr={1}>
                  พนักงานขับรถ
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.warning.main,
                    height: 15,
                    width: 15,
                    border: "2px solid white",
                    mr: 0.5,
                  }}
                />
                <Typography fontSize="12px" fontWeight="bold">
                  เจ้าหนี้การค้า
                </Typography>
              </Box>
            </Box>

            {/* Bottom Footer */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                color: "white",
                height: "5vh",
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={12}>
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              backgroundColor: theme.palette.primary.contrastText,
              padding: 1,
              flexWrap: "wrap",
            }}
          >
            {/* เดือน */}
            <TextField
              select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              sx={{ minWidth: 180, backgroundColor: "white" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">เดือน :</InputAdornment>
                ),
              }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {monthOptions.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            {/* 🔵 กลุ่ม 1: Flow */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography fontWeight="bold">ประเภทงาน :</Typography>

              <FormGroup row>
                {/* ทั้งหมด */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFlow.length === 2}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFlow(["in", "out"]);
                        } else {
                          setSelectedFlow([]);
                        }
                      }}
                    />
                  }
                  label="ทั้งหมด"
                />

                {/* รับเข้า */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFlow.includes("in")}
                      onChange={(e) => {
                        setSelectedFlow((prev) =>
                          e.target.checked
                            ? ["in"]
                            : prev.filter((f) => f !== "in"),
                        );
                      }}
                    />
                  }
                  label="รับเข้า"
                />

                {/* ส่งออก */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFlow.includes("out")}
                      onChange={(e) => {
                        setSelectedFlow((prev) =>
                          e.target.checked
                            ? ["out"]
                            : prev.filter((f) => f !== "out"),
                        );
                      }}
                    />
                  }
                  label="ส่งออก"
                />
              </FormGroup>
            </Box>

            {/* 🔶 กลุ่ม 2: Truck */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography fontWeight="bold">ประเภทรถ :</Typography>

              <FormGroup row>
                {["รถใหญ่", "รถเล็ก", "รถรับจ้างขนส่ง"].map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        disabled={selectedFlow.length === 0} // 🔥 ยังไม่เลือก flow → ห้ามเลือก
                        checked={selectedTruck.includes(type)}
                        onChange={(e) => {
                          setSelectedTruck((prev) =>
                            e.target.checked
                              ? [...prev, type]
                              : prev.filter((t) => t !== type),
                          );
                        }}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={8}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {`จำนวนลิตร (${selectedTruck.join(", ")})`}
            </Box>

            {/* Middle Content */}
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                height: "50vh",
                p: 2,
              }}
            >
              <BarChart
                dataset={chartType1}
                xAxis={[{ scaleType: "band", dataKey: "name" }]}
                series={[
                  {
                    dataKey: "volume",
                    label: `จำนวนลิตร (พนักงานขับรถ)`,
                    color: theme.palette.success.main,
                  },
                ]}
              />
              <BarChart
                dataset={chartType2}
                xAxis={[{ scaleType: "band", dataKey: "name" }]}
                series={[
                  {
                    dataKey: "volume",
                    label: `จำนวนลิตร (ทะเบียนรถ)`,
                    color: theme.palette.warning.main,
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={4}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>

            {/* Middle Content */}
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                height: "50vh",
                p: 2,
              }}
            >
              {/* <BarChart
                dataset={chartType2}
                xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                series={[
                  {
                    dataKey: 'volume',
                    label: `จำนวนลิตร (ทะเบียน)`
                  }
                ]}
              /> */}

              <BarChart
                dataset={chartType3}
                xAxis={[{ scaleType: "band", dataKey: "name" }]}
                series={[
                  {
                    dataKey: "volume",
                    label: `จำนวนลิตร (รวมปริมาณ)`,
                    color: theme.palette.primary.main,
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={8}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {`จำนวนเที่ยววิ่ง (${selectedTruck.join(", ")})`}
            </Box>

            {/* Middle Content */}
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                height: "50vh",
                p: 2,
              }}
            >
              <BarChart
                dataset={tripChartType1}
                xAxis={[{ scaleType: "band", dataKey: "name" }]}
                series={[
                  {
                    dataKey: "count",
                    label: "จำนวนเที่ยว (พนักงานขับรถ)",
                    color: theme.palette.success.main,
                  },
                ]}
              />
              <BarChart
                dataset={tripChartType2}
                xAxis={[{ scaleType: "band", dataKey: "name" }]}
                series={[
                  {
                    dataKey: "count",
                    label: "จำนวนเที่ยว (ทะเบียน)",
                    color: theme.palette.warning.main,
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={4}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Box>

            {/* Middle Content */}
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                height: "50vh",
                p: 2,
              }}
            >
              {/* <BarChart
                dataset={chartType2}
                xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                series={[
                  {
                    dataKey: 'volume',
                    label: `${selectedTruck.join(", ")} (ทะเบียน)`
                  }
                ]}
              /> */}

              <BarChart
                dataset={tripChartType3}
                xAxis={[{ scaleType: "band", dataKey: "name" }]}
                series={[
                  {
                    dataKey: "count",
                    label: "จำนวนเที่ยวรวม",
                    color: theme.palette.primary.main,
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={8}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={1.5} sm={2.5} lg={3.5} />
                <Grid item xs={9} sm={7} lg={5}>
                  <Paper
                    component="form"
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: theme.palette.error.main,
                    }}
                  >
                    <Paper component="form">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          openTo="month" // เปิดเฉพาะเดือน
                          views={["month"]} // เลือกเดือนเท่านั้น
                          value={dayjs(date)} // แสดงเดือนปัจจุบัน
                          onChange={handleDateChangeDate} // ตั้งค่าเมื่อเลือกเดือน
                          format="MMMM" // รูปแบบเป็นชื่อเดือนเต็ม
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  height: "30px",
                                  paddingRight: "8px", // ลดพื้นที่ไอคอนให้แคบลง
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "14px", // ปรับขนาดตัวอักษรภายใน Input
                                },
                                "& .MuiInputAdornment-root": {
                                  marginLeft: "0px", // ลดช่องว่างด้านซ้ายของไอคอน
                                  paddingLeft: "0px", // เอาพื้นที่ด้านซ้ายของไอคอนออก
                                },
                              },
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment
                                    position="start"
                                    sx={{ marginRight: 2 }}
                                  >
                                    กรุณาเลือกเดือน :
                                  </InputAdornment>
                                ),
                                sx: {
                                  fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                  height: "40px", // ความสูงของ Input
                                  padding: "10px", // Padding ภายใน Input
                                  fontWeight: "bold", // น้ำหนักตัวอักษร
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Paper>
                    {checkDate && (
                      <IconButton
                        onClick={handleClearDate}
                        size="small"
                        sx={{ color: "white" }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={1.5} sm={2.5} lg={3.5} />
              </Grid>
            </Box>
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                height: "50vh",
              }}
            >
              <BarChart
                dataset={checkDate ? volumeAll : fullOrders}
                xAxis={[
                  { scaleType: "band", dataKey: checkDate ? "date" : "month" },
                ]}
                series={[
                  {
                    dataKey: "orders",
                    label: "จำนวนออร์เดอร์",
                    valueFormatter,
                    color: "#1976d2",
                  },
                  {
                    dataKey: "ticket",
                    label: "จำนวนตั๋วน้ำมัน",
                    valueFormatter,
                    color: "#2e7d32",
                  },
                  {
                    dataKey: "trips",
                    label: "จำนวนเที่ยววิ่ง",
                    valueFormatter,
                    color: "#ff9800",
                  },
                  {
                    dataKey: "ordersCancel",
                    label: "จำนวนออเดอร์ที่ยกเลิก",
                    valueFormatter,
                    color: "#d32f2f",
                  },
                  {
                    dataKey: "ticketCancel",
                    label: "จำนวนตั๋วที่ยกเลิก",
                    valueFormatter,
                    color: "#f44336",
                  },
                ]}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                color: "white",
                height: "5vh",
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={4}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h6"
                textAlign="center"
                fontWeight="bold"
                gutterBottom
              >
                จำนวนตั๋ว
              </Typography>
            </Box>

            {/* Middle Content */}
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                height: "50vh",
              }}
            >
              <PieChart
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: Ctransport.length,
                        label: "ตั๋วรับจ้างขนส่ง",
                        color: theme.palette.secondary.main,
                      },
                      {
                        id: 1,
                        value: Cgasstations.length,
                        label: "ตั๋วปั้มน้ำมัน",
                        color: theme.palette.warning.light,
                      },
                      {
                        id: 2,
                        value: Ctickets.length,
                        label: "ตั๋วน้ำมัน",
                        color: theme.palette.error.dark,
                      },
                      {
                        id: 3,
                        value: Cbigtruck1.length,
                        label: "ตั๋วรถใหญ่ เชียงใหม่",
                        color: theme.palette.primary.dark,
                      },
                      {
                        id: 4,
                        value: Cbigtruck2.length,
                        label: "ตั๋วรถใหญ่ เชียงราย",
                        color: theme.palette.primary.light,
                      },
                      {
                        id: 5,
                        value: Csmalltruck1.length,
                        label: "ตั๋วรถเล็ก เชียงใหม่",
                        color: theme.palette.success.dark,
                      },
                      {
                        id: 6,
                        value: Csmalltruck2.length,
                        label: "ตั๋วรถเล็ก บ้านโฮ่ง",
                        color: theme.palette.success.light,
                      },
                    ],
                    innerRadius: 70,
                  },
                ]}
                {...pieParamsNewSize}
              />
              {/* Legend */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.secondary.main,
                      height: 15,
                      width: 15,
                      border: "2px solid white",
                      mr: 0.5,
                    }}
                  />
                  <Typography fontSize="12px" fontWeight="bold" mr={1}>
                    ตั๋วรับจ้างขนส่ง
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.warning.light,
                      height: 15,
                      width: 15,
                      border: "2px solid white",
                      mr: 0.5,
                    }}
                  />
                  <Typography fontSize="12px" fontWeight="bold" mr={1}>
                    ตั๋วปั้มน้ำมัน
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", marginRight: 2 }}
                >
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.dark,
                      height: 15,
                      width: 15,
                      border: "2px solid white",
                      mr: 0.5,
                    }}
                  />
                  <Typography fontSize="12px" fontWeight="bold">
                    ตั๋วรถใหญ่ เชียงใหม่
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.light,
                      height: 15,
                      width: 15,
                      border: "2px solid white",
                      mr: 0.5,
                    }}
                  />
                  <Typography fontSize="12px" fontWeight="bold">
                    ตั๋วรถใหญ่ เชียงราย
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", marginRight: 2 }}
                >
                  <Box
                    sx={{
                      backgroundColor: theme.palette.success.dark,
                      height: 15,
                      width: 15,
                      border: "2px solid white",
                      mr: 0.5,
                    }}
                  />
                  <Typography fontSize="12px" fontWeight="bold">
                    ตั๋วรถเล็ก เชียงใหม่
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.success.light,
                      height: 15,
                      width: 15,
                      border: "2px solid white",
                      mr: 0.5,
                    }}
                  />
                  <Typography fontSize="12px" fontWeight="bold">
                    ตั๋วรถเล็ก บ้านโฮ่ง
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.error.dark,
                    height: 15,
                    width: 15,
                    border: "2px solid white",
                    mr: 0.5,
                  }}
                />
                <Typography fontSize="12px" fontWeight="bold">
                  ตั๋วน้ำมัน
                </Typography>
              </Box>
            </Box>

            {/* Bottom Footer */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                color: "white",
                height: "5vh",
              }}
            />
            <Typography
              variant="h2"
              fontWeight="bold"
              textAlign="center"
              sx={{ marginTop: -39 }}
              gutterBottom
            >
              {Ctransport.length +
                Cgasstations.length +
                Ctickets.length +
                Cbigtruck1.length +
                Cbigtruck2.length +
                Csmalltruck1.length +
                Csmalltruck2.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {/* <DriverTable /> */}
    </Container>
  );
};

export default Dashboard;
