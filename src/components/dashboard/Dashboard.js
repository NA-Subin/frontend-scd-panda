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
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import Logo from "../../theme/img/logoPanda.jpg";
import { borderRadius, width } from "@mui/system";
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

// A key-metric tile: number + what it means + where to go to see the
// underlying records, so the dashboard doubles as a jumping-off point
// instead of just a wall of numbers.
const StatCard = ({ icon, label, value, description, color, onClick }) => (
  <Paper
    onClick={onClick}
    elevation={2}
    sx={{
      height: "100%",
      minHeight: 168,
      borderRadius: 5,
      p: 2.5,
      backgroundColor: color,
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
      "&:hover": onClick ? { transform: "translateY(-4px)", boxShadow: 6 } : {},
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="subtitle1" fontWeight="bold">
        {label}
      </Typography>
      {icon}
    </Stack>
    <Typography variant="h3" fontWeight="bold">
      {Number(value || 0).toLocaleString()}
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.85 }}>
      {description}
    </Typography>
  </Paper>
);

// Shared frame for every chart card - colored title bar (with an optional
// one-line explanation of what the chart shows) over a white plot area.
// Replaces several near-identical Paper/Box blocks that used to repeat
// this structure by hand, a couple of them with an empty title bar.
const ChartPanel = ({ title, description, height = "60vh", children }) => (
  <Paper
    sx={{
      height,
      backgroundColor: theme.palette.panda.contrastText,
      borderRadius: 5,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    <Box sx={{ backgroundColor: theme.palette.panda.main, color: "white", px: 2.5, py: 1.2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" sx={{ opacity: 0.85, display: "block" }}>
          {description}
        </Typography>
      )}
    </Box>
    <Box sx={{ backgroundColor: "white", flex: 1, p: 2, overflow: "auto" }}>{children}</Box>
  </Paper>
);

const Dashboard = () => {
  const navigate = useNavigate();

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
  const creditor = Object.values(creditors || {});
  const driver = Object.values(drivers || {});
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
  const [date, setDate] = useState(dayjs(new Date()));
  const [volumeAll, setVolumeAll] = useState([]);
  const [checkDate, setCheckDate] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState([
    "รถใหญ่",
    "รถเล็ก",
    "รถรับจ้างขนส่ง",
  ]);
  const [selectedMonth, setSelectedMonth] = useState(
    dayjs().format("MM/YYYY").toString(),
  );
  const [selectedFlow, setSelectedFlow] = useState(["in", "out"]);

  const handleDateChangeDate = (newValue) => {
    const monthName = newValue.format("MMMM");
    const monthOrders = {};
    const monthTickets = {};
    const monthTrips = {};
    const monthOrderCancel = {};
    const monthTicketCancel = {};
    const monthStats = {};

    const startOfMonth = newValue.startOf("month");
    const endOfMonth = newValue.endOf("month");

    const allDatesInMonth = [];
    let currentDate = startOfMonth;

    while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth)) {
      allDatesInMonth.push(currentDate.format("DD/MM/YYYY"));
      currentDate = currentDate.add(1, "day");
    }

    orders.forEach((o) => {
      const [day, monthStr] = o.Date.split("/");
      const monthIndex = parseInt(monthStr, 10) - 1;
      const monthName = months[monthIndex];
      const orderDate = dayjs(o.Date, "DD/MM/YYYY");

      if (allDatesInMonth.includes(orderDate.format("DD/MM/YYYY"))) {
        const dayOnly = orderDate.format("DD");
        if (!monthOrders[dayOnly]) {
          monthOrders[dayOnly] = { date: dayOnly, orders: 0 };
        }
        monthOrders[dayOnly].orders += 1;
      }
    });

    ticket.forEach((t) => {
      const orderDate = dayjs(t.Date, "DD/MM/YYYY");

      if (allDatesInMonth.includes(orderDate.format("DD/MM/YYYY"))) {
        const dayOnly = orderDate.format("DD");
        if (!monthTickets[dayOnly]) {
          monthTickets[dayOnly] = { date: dayOnly, ticket: 0 };
        }
        monthTickets[dayOnly].ticket += 1;
      }
    });

    orders.forEach((o) => {
      if (o.Trip === "ยกเลิก") {
        const ordersDate = dayjs(o.Date, "DD/MM/YYYY");

        if (allDatesInMonth.includes(ordersDate.format("DD/MM/YYYY"))) {
          const dayOnly = ordersDate.format("DD");
          if (!monthOrderCancel[dayOnly]) {
            monthOrderCancel[dayOnly] = { date: dayOnly, ordersCancel: 0 };
          }
          monthOrderCancel[dayOnly].ordersCancel += 1;
        }
      }
    });

    ticket.forEach((t) => {
      if (t.Trip === "ยกเลิก") {
        const ticketDate = dayjs(t.Date, "DD/MM/YYYY");

        if (allDatesInMonth.includes(ticketDate.format("DD/MM/YYYY"))) {
          const dayOnly = ticketDate.format("DD");
          if (!monthTicketCancel[dayOnly]) {
            monthTicketCancel[dayOnly] = { date: dayOnly, ticketCancel: 0 };
          }
          monthTicketCancel[dayOnly].ticketCancel += 1;
        }
      }
    });

    trips.forEach((r) => {
      const tripDate = dayjs(r.DateStart, "DD/MM/YYYY");

      if (allDatesInMonth.includes(tripDate.format("DD/MM/YYYY"))) {
        const dayOnly = tripDate.format("DD");
        if (!monthTrips[dayOnly]) {
          monthTrips[dayOnly] = { date: dayOnly, trips: 0 };
        }
        monthTrips[dayOnly].trips += 1;
      }
    });

    const fullOrders = allDatesInMonth.map((date) => {
      const day = dayjs(date, "DD/MM/YYYY").format("DD");
      return {
        date: day,
        orders: monthOrders[day]?.orders || 0,
        ticket: monthTickets[day]?.ticket || 0,
        trips: monthTrips[day]?.trips || 0,
        ordersCancel: monthOrderCancel[day]?.ordersCancel || 0,
        ticketCancel: monthTicketCancel[day]?.ticketCancel || 0,
      };
    });

    setDate(newValue);
    setVolumeAll(fullOrders);
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
        flowType: "in",
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
        flowType: "out",
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

      const trip = tripMap[Number(o.Trip) + 1];
      if (!trip) return;

      const truckType = trip.TruckType;

      const date = dayjs(trip.DateDelivery, "DD/MM/YYYY", true);
      if (!date.isValid()) return;

      const monthKey = date.format("MM/YYYY");

      const driver = getDriverName(o.DriverName ?? o.Driver);
      const registration = getRegistration(o.RegistrationName ?? o.Registration);

      const totalVolume = getTotalVolumePerRow(o);

      const key = `${driver}|${registration}`;

      if (!driverMonthVolumes[monthKey]) {
        driverMonthVolumes[monthKey] = {};
      }

      if (!driverMonthVolumes[monthKey][key]) {
        driverMonthVolumes[monthKey][key] = {
          driver,
          registration,
          truckType,
          volume: 0,
        };
      }

      driverMonthVolumes[monthKey][key].volume += totalVolume;
    });

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
      map[key] = (map[key] || 0) + 1;
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

  const monthOrders = {};
  const monthTickets = {};
  const monthTrips = {};
  const monthStats = {};
  const monthOrderCancel = {};
  const monthTicketCancel = {};

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

  ticket.forEach((t) => {
    if (
      t.Trip === "ยกเลิก" &&
      typeof t.Date === "string" &&
      t.Date.includes("/")
    ) {
      const [day, monthStr] = t.Date.split("/");
      const monthIndex = parseInt(monthStr, 10) - 1;

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

  return (
    <Container maxWidth="xl" sx={{ marginTop: 10, marginBottom: 5 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <Box
          component="img"
          src={Logo}
          alt="PandaStar Oil"
          sx={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${theme.palette.panda.main}` }}
        />
        <Box>
          <Typography variant="h4" fontWeight="bold" color={theme.palette.panda.main}>
            แดชบอร์ดภาพรวม
          </Typography>
          <Typography variant="body2" color="text.secondary">
            สรุปข้อมูลรถ ลูกค้า เที่ยววิ่ง และตั๋วทั้งหมดในระบบ ณ {dayjs().format("D MMMM YYYY")}
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ mb: 3 }} />
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
              <StatCard
                icon={<LocalShippingIcon sx={{ fontSize: 34, opacity: 0.85 }} />}
                label="จำนวนรถ"
                value={regheads.length + regtails.length + smalls.length}
                description="รถใหญ่ หัวลาก และรถเล็กที่ยังใช้งานอยู่ - คลิกดูรายการรถทั้งหมด"
                color={theme.palette.info.main}
                onClick={() => navigate("/trucks")}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <StatCard
                icon={<PeopleAltIcon sx={{ fontSize: 34, opacity: 0.85 }} />}
                label="จำนวนลูกค้า"
                value={
                  Ctransport.length +
                  Cgasstations.length +
                  Cbigtruck.length +
                  Csmalltruck.length +
                  Ctickets.length
                }
                description="รวมลูกค้าทุกประเภท (ขนส่ง ปั้ม รถใหญ่ รถเล็ก ตั๋วน้ำมัน) - คลิกดูทะเบียนลูกค้า"
                color={theme.palette.success.dark}
                onClick={() => navigate("/customer")}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <StatCard
                icon={<LocalGasStationIcon sx={{ fontSize: 34, opacity: 0.85 }} />}
                label="จำนวนปั้ม"
                value={gasstations.length}
                description="สถานีบริการน้ำมันในระบบทั้งหมด - คลิกดูรายชื่อปั้ม"
                color={theme.palette.error.main}
                onClick={() => navigate("/gasstations")}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <StatCard
                icon={<AltRouteIcon sx={{ fontSize: 34, opacity: 0.85 }} />}
                label="จำนวนเที่ยววิ่ง"
                value={trips.length}
                description="เที่ยววิ่งขนส่งน้ำมันตั้งแต่ 1 ม.ค. 2569 - คลิกดูรายการเที่ยววิ่ง"
                color={theme.palette.panda.main}
                onClick={() => navigate("/trips-bigtruck")}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <StatCard
                icon={<Inventory2Icon sx={{ fontSize: 34, opacity: 0.85 }} />}
                label="จำนวนรายการสินค้า"
                value={orders.length}
                description="รายการสั่งซื้อ/ส่งน้ำมันทั้งหมด - คลิกดูใบแจ้งหนี้"
                color={theme.palette.secondary.main}
                onClick={() => navigate("/invoice")}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <StatCard
                icon={<ConfirmationNumberIcon sx={{ fontSize: 34, opacity: 0.85 }} />}
                label="จำนวนรายการตั๋วสินค้า"
                value={ticket.length}
                description="ตั๋วน้ำมันที่ออกตั้งแต่ 1 ม.ค. 2569 - คลิกดูรายการตั๋ว"
                color={theme.palette.warning.dark}
                onClick={() => navigate("/ticket")}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} lg={2.5}>
          <ChartPanel
            title="จำนวนพนักงาน"
            description="แยกตามประเภท - คลิกส่วนไหนก็ได้เพื่อไปหน้ารายชื่อพนักงาน"
            height="60vh"
          >
            <Box
              onClick={() => navigate("/employee")}
              sx={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}
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
          </ChartPanel>
        </Grid>
        <Grid item xs={12} sm={12} lg={12}>
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              backgroundColor: theme.palette.primary.contrastText,
              padding: 1.5,
              flexWrap: "wrap",
              borderRadius: 4,
            }}
          >
            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ width: "100%" }}>
              ตัวกรองสำหรับกราฟด้านล่าง - เลือกเดือน ประเภทงาน และประเภทรถที่ต้องการดู
            </Typography>
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
                        disabled={selectedFlow.length === 0}
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
          <ChartPanel
            title={`จำนวนลิตร (${selectedTruck.join(", ")})`}
            description="ปริมาณน้ำมันรวมตามตัวกรองด้านบน แยกตามคนขับและทะเบียนรถ"
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%" }}>
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
          </ChartPanel>
        </Grid>
        <Grid item xs={12} sm={12} lg={4}>
          <ChartPanel
            title="จำนวนลิตรรวม"
            description="ผลรวมของกราฟด้านซ้ายในรูปเดียว แยกตามประเภทรถ"
          >
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
          </ChartPanel>
        </Grid>
        <Grid item xs={12} sm={12} lg={8}>
          <ChartPanel
            title={`จำนวนเที่ยววิ่ง (${selectedTruck.join(", ")})`}
            description="จำนวนเที่ยววิ่งตามตัวกรองด้านบน แยกตามคนขับและทะเบียนรถ"
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%" }}>
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
          </ChartPanel>
        </Grid>
        <Grid item xs={12} sm={12} lg={4}>
          <ChartPanel
            title="จำนวนเที่ยวรวม"
            description="ผลรวมของกราฟด้านซ้ายในรูปเดียว แยกตามประเภทรถ"
          >
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
          </ChartPanel>
        </Grid>
        <Grid item xs={12} sm={12} lg={8}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1}
              sx={{ backgroundColor: theme.palette.panda.main, color: "white", px: 2.5, py: 1.2 }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  แนวโน้มรายเดือน / รายวัน
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ออร์เดอร์ ตั๋วน้ำมัน เที่ยววิ่ง และรายการที่ยกเลิก - เลือกเดือนเพื่อดูแยกรายวัน
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    openTo="month"
                    views={["month"]}
                    value={dayjs(date)}
                    onChange={handleDateChangeDate}
                    format="MMMM"
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          backgroundColor: "white",
                          borderRadius: 1,
                          minWidth: 160,
                          "& .MuiOutlinedInput-root": { height: "36px" },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
                {checkDate && (
                  <IconButton onClick={handleClearDate} size="small" sx={{ color: "white" }} title="ล้างตัวกรองเดือน">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Stack>
            <Box sx={{ backgroundColor: "white", flex: 1, p: 2 }}>
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
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={4}>
          <ChartPanel
            title="จำนวนตั๋ว"
            description="สัดส่วนตั๋วแต่ละประเภท - ตัวเลขกลางวงคือยอดรวมทั้งหมด คลิกเพื่อไปหน้ารายการตั๋ว"
          >
            <Box
              onClick={() => navigate("/ticket")}
              sx={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}
            >
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {Ctransport.length +
                      Cgasstations.length +
                      Ctickets.length +
                      Cbigtruck1.length +
                      Cbigtruck2.length +
                      Csmalltruck1.length +
                      Csmalltruck2.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ตั๋วทั้งหมด
                  </Typography>
                </Box>
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
              </Box>
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
          </ChartPanel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
