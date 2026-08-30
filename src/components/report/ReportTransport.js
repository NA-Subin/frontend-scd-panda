import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
  TablePagination,
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
import FindInPageIcon from "@mui/icons-material/FindInPage";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import theme from "../../theme/theme";
import {
  RateOils,
  TablecellFinancial,
  TablecellFinancialHead,
  TablecellHeader,
  TablecellSelling,
  TablecellTickets,
} from "../../theme/style";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import ReportDetail from "./ReportDetail";
import { formatThaiFull } from "../../theme/DateTH";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const ReportTransports = ({ openNavbar }) => {
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const [date, setDate] = React.useState(false);
  const [check, setCheck] = React.useState("0:ทั้งหมด");
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
  const [ticketO, setTicketO] = useState(true);
  const [ticketG, setTicketG] = useState(true);
  const [ticketT, setTicketT] = useState(true);
  const [year, setYear] = useState(
    Number(dayjs(new Date()).format("YYYY")) + 543,
  );
  const [month, setMonth] = useState(Number(dayjs(new Date()).format("M")) - 1); // เก็บเป็น index 0–11

  const handleIncrement = () => {
    setMonth((prev) => (prev + 1) % 12);
  };

  const handleDecrement = () => {
    setMonth((prev) => (prev - 1 + 12) % 12);
  };

  const [sortConfig, setSortConfig] = useState({
    key: "TicketName",
    direction: "asc",
  });

  const companies = [
    { value: "0:ทั้งหมด", label: "ทั้งหมด" },
    {
      value: "2:บริษัท นาคราปิโตรเลียม2016 จำกัด (สำนักงานใหญ่)",
      label: "บริษัท นาคราปิโตรเลียม2016 จำกัด (สำนักงานใหญ่)",
    },
    {
      value: "3:บริษัท พิชยาทรานสปอร์ต จำกัด (สำนักงานใหญ่)",
      label: "บริษัท พิชยาทรานสปอร์ต จำกัด (สำนักงานใหญ่)",
    },
    { value: "4:รถรับจ้างขนส่ง", label: "รถรับจ้างขนส่ง" },
  ];

  const flattenedRef = useRef([]);
  const filteredItemsRef = useRef([]);
  const incomingMoneyRef = useRef([]);

  console.log("sortConfig : ", sortConfig);
  console.log("filteredItem รายการย่อย:", filteredItemsRef.current);
  console.log("flattened รายการย่อย:", flattenedRef.current);
  console.log("IncomingMoney รายการย่อย:", incomingMoneyRef.current);

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

  // const { reportFinancial, drivers } = useData();
  const { drivers, customertransports, reghead, regtail, small, transport, company } =
    useBasicData();
  const dataCompany = Object.values(company || {});
  const { tickets, transferMoney, trip } = useTripData();

  const registrationH = Object.values(reghead).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const registrationT = Object.values(transport).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const registrationS = Object.values(regtail).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const registrationSm = Object.values(small).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  // const ticket = Object.values(tickets || {});
  const trips = Object.values(trip || {}).filter((item) => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

    return (
      deliveryDate.isSameOrAfter(targetDate, "day") ||
      receiveDate.isSameOrAfter(targetDate, "day")
    );
  });

  const ticketWithTrip = Object.values(tickets || {}).map((curr) => {
    const trip = trips.find((t) => Number(t.id) - 1 === Number(curr.Trip));

    return {
      ...curr,
      TripDetail: trip,
      TripDate: trip?.DateReceive || null,
    };
  });
  const ticket = ticketWithTrip.filter((item) => {
    if (!item.TripDate) return false; // หรือ true ถ้าไม่อยากตัดทิ้ง

    const d = dayjs(item.TripDate, "DD/MM/YYYY");
    if (!d.isValid()) return false;

    return d.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });
  // const ticket = Object.values(tickets || {}).filter(item => {
  //     const itemDate = dayjs(item.Date, "DD/MM/YYYY");
  //     return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
  // });
  const driver = Object.values(drivers || {});
  const ticketsT = Object.values(customertransports || {});
  // const trips = Object.values(trip || {});
  const registration = Object.values(reghead || {});
  const transferMoneyDetail = Object.values(transferMoney || {}).filter(
    (t) => t.Status !== "ยกเลิก",
  );

  console.log(
    "1.Orders : ",
    Object.values(tickets || {}).filter((t) => t.CustomerType === "-"),
  );
  // const orderDetail = ticket
  //     .filter((item) => {
  //         const itemDate = dayjs(item.Date, "DD/MM/YYYY");
  //         const customerId = Number(item.TicketName.split(":")[0]);
  //         console.log("checks : ", check);
  //         let isInCompany =
  //             check === 1 ?
  //                 ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]))
  //                 : check === 2 ?
  //                     ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]) && customer.StatusCompany === "อยู่บริษัทในเครือ")
  //                     : ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]) && customer.StatusCompany === "ไม่อยู่บริษัทในเครือ");

  //         return (
  //             isInCompany && // <--- ป้องกัน error
  //             isInCompany.id === customerId &&
  //             item.CustomerType === "ตั๋วรถใหญ่" &&
  //             item.Trip !== "ยกเลิก" &&
  //             itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") // "[]" คือรวมวันที่ปลายทางด้วย
  //         );
  //     })
  //     .map((item) => {
  //         let totalVolume = 0;
  //         let totalAmount = 0;
  //         let totalOverdue = 0;

  //         const totalIncomingMoney = transferMoneyDetail
  //             .filter(trans => trans.TicketNo === item.No)
  //             .reduce((sum, trans) => {
  //                 const value = parseFloat(trans.IncomingMoney) || 0;
  //                 return sum + value;
  //             }, 0);

  //         Object.entries(item.Product).forEach(([key, value]) => {
  //             if (key !== "P") {
  //                 totalVolume += parseFloat(value.Volume || 0) * 1000;
  //                 totalAmount += parseFloat(value.Amount || 0);
  //             }
  //         });
  //         return {
  //             ...item,
  //             TotalVolume: totalVolume,
  //             TotalAmount: totalAmount,
  //             TotalOverdue: totalIncomingMoney,
  //         };
  //     }).sort((a, b) => a.TicketName.localeCompare(b.TicketName));
  const normalizeDepotName = (depotName = "") => {
    // เอาข้อความหลัง :
    const name = depotName.split(":").pop().trim();
    return name;
  };

  const calcProductTotal = (products = {}, rateOil = 0) => {
    return Object.entries(products)
      .filter(([key, val]) => key !== "P" && val?.Volume > 0)
      .reduce((sum, [, val]) => {
        return sum + val.Volume * 1000 * rateOil;
      }, 0);
  };

  const calcProductVolume = (products = {}, rateOil = 0) => {
    return Object.entries(products)
      .filter(([key, val]) => key !== "P" && val?.Volume > 0)
      .reduce((sum, [, val]) => {
        return sum + val.Volume * 1000;
      }, 0);
  };

  const filteredOrders = useMemo(() => {
    if (!ticket || !trips) return [];

    const psOrder = ["PSสันทราย", "PS1", "PS2", "NP", "PS3", "PS4"];

    return ticket
      .filter(
        (item) =>
          !["ตั๋วรถใหญ่", "ตั๋วรถเล็ก"].includes(item.CustomerType) &&
          item.Status !== "ยกเลิก" &&
          item.Status !== undefined &&
          item.Trip !== "ยกเลิก",
      )
      .map((curr) => {
        const tripDetail = trips.find(
          (trip) => Number(trip.id) - 1 === Number(curr.Trip),
        );

        let registrationTail = "";
        let truckCompany = "";
        if (tripDetail?.TruckType === "รถใหญ่") {
          // trip.Registration is now a real UUID FK into truck_registration,
          // not a "id:Name" composite string - match on uuid.
          const reg = registrationH.find(
            (h) => h.uuid === tripDetail?.Registration,
          );
          registrationTail = reg?.RegTailName || "";
          truckCompany = reg?.CompanyName || "";
        } else if (tripDetail?.TruckType === "รถเล็ก") {
          const reg = registrationSm.find(
            (h) => h.uuid === tripDetail?.Registration,
          );
          registrationTail = reg?.RegHead || "";
          truckCompany = reg?.CompanyName || "";
        }

        const depot = normalizeDepotName(tripDetail?.Depot);

        let Rate = 0;
        if (depot === "ลำปาง") Rate = parseFloat(curr.Rate1) || 0;
        else if (depot === "พิจิตร") Rate = parseFloat(curr.Rate2) || 0;
        else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot))
          Rate = parseFloat(curr.Rate3) || 0;

        // 🔥 คำนวณยอดจาก Product
        const totalProductCost = calcProductTotal(curr.Product, Rate);

        return {
          ...curr,
          DateReceive: tripDetail?.DateReceive,
          DateDelivery: tripDetail?.DateDelivery,
          TruckType: tripDetail?.TruckType,
          Driver: tripDetail?.Driver,
          RateOil: Rate,
          ProductTotal: totalProductCost, // ✅ ยอดรวม Volume * 1000 * Rate
          ProductVolume: calcProductVolume(curr.Product, Rate), // ✅ ยอดรวม Volume * 1000
          Registration: tripDetail?.Registration,
          RegistrationTail: registrationTail,
          TruckCompany: truckCompany,
        };
      })
      .sort((a, b) => {
        // 🧩 ขั้นแรก: เรียงตามประเภท CustomerType
        const typeOrder = ["ตั๋วน้ำมัน", "ตั๋วรับจ้างขนส่ง", "ตั๋วปั้ม"];
        const aNamePart = (a.TicketNameName || "").trim();
        const bNamePart = (b.TicketNameName || "").trim();

        const typeA =
          typeOrder.indexOf(a.CustomerType) !== -1
            ? typeOrder.indexOf(a.CustomerType)
            : 999;
        const typeB =
          typeOrder.indexOf(b.CustomerType) !== -1
            ? typeOrder.indexOf(b.CustomerType)
            : 999;

        if (typeA !== typeB) return typeA - typeB;

        // 🧩 ขั้นสอง: สำหรับ "ตั๋วปั้ม"
        if (a.CustomerType === "ตั๋วปั้ม" && b.CustomerType === "ตั๋วปั้ม") {
          const getPSKey = (name) => {
            // ลบจุดออกก่อน แล้วดึงเฉพาะตัวหน้าชื่อ เช่น PSสันทราย, PS1, NP
            const cleanName = name.replace(/\./g, "").replace(/\s+/g, "");
            const match = psOrder.find((key) => cleanName.startsWith(key));
            return match || "ZZ";
          };

          const aKey = getPSKey(aNamePart);
          const bKey = getPSKey(bNamePart);

          const orderA = psOrder.indexOf(aKey);
          const orderB = psOrder.indexOf(bKey);

          if (orderA !== orderB) return orderA - orderB;
        }

        // 🧩 ขั้นสุดท้าย: เรียงตามชื่อปกติ
        return aNamePart.localeCompare(bNamePart, "th");
      });
  }, [ticket, trips, registrationH, registrationT, date, months, years]);
  console.log("filteredOrders truck : ", filteredOrders);

  const orderDetail = useMemo(() => {
    if (!selectedDateStart || !selectedDateEnd) return [];

    // 1. กรอง order เฉพาะที่สถานะถูกต้องและอยู่ในช่วงวันที่
    // const filteredItems = ticket.filter((item) => {
    //     const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    //     const isValidStatus = item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined;
    //     const isInDateRange = itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");

    //     let isRegistration = false;

    //     if (check === "0:ทั้งหมด") {
    //         isRegistration = true;
    //     } else {
    //         // รถต้องอยู่ในเครือบริษัทที่เลือก
    //         isRegistration = registration.some(
    //             (customer) =>
    //                 customer.Company.split(":")[0] === check.split(":")[0] &&
    //                 customer.id === Number(item.Registration || 0)
    //         );
    //     }

    //     // ✅ ไม่เอาตั๋วรถใหญ่และตั๋วรถเล็ก
    //     const isValidCustomerType =
    //         item.CustomerType !== "ตั๋วรถใหญ่" &&
    //         item.CustomerType !== "ตั๋วรถเล็ก";

    //     return isValidStatus && isInDateRange && isRegistration && isValidCustomerType;
    // });

    const filteredItems = ticket.filter((item) => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY", true); // ตัวสุดท้าย true = strict
      if (!itemDate.isValid()) {
        console.log("❌ Parse date fail:", item.Date);
      }

      const isValidStatus =
        item.Status !== "ยกเลิก" &&
        item.Status !== undefined &&
        item.Trip !== "ยกเลิก";

      let isRegistration = false;
      if (check === "0:ทั้งหมด") {
        isRegistration = true;
      } else if (check === "4:รถรับจ้างขนส่ง") {
        isRegistration = item.RegistrationName === "ไม่มี";
      } else {
        const checkCompanyUuid = dataCompany.find(
          (c) => c.id === Number(check.split(":")[0]),
        )?.uuid;
        isRegistration =
          registration.some(
            (customer) =>
              customer.Company === checkCompanyUuid &&
              customer.id === Number(item.Registration || 0),
          ) && item.RegistrationName !== "ไม่มี";
      }

      const isValidCustomerType =
        item.CustomerType !== "ตั๋วรถใหญ่" &&
        item.CustomerType !== "ตั๋วรถเล็ก";

      const itemYear = itemDate.year(); // ค.ศ.
      const itemMonth = itemDate.month(); // index 0–11

      const isInSelectedYearMonth =
        itemYear === year - 543 && // เทียบให้ตรง พ.ศ./ค.ศ.
        itemMonth === month;

      return (
        isValidStatus &&
        isRegistration &&
        isValidCustomerType &&
        isInSelectedYearMonth
      );
    });

    filteredItemsRef.current = filteredItems;

    // 2. แตก Product รายการย่อยออกมา

    const processedTickets = new Set();

    const flattened = filteredItems
      .map((item) => {
        if (!item.Product) return null;

        // tickets.Registration is now a real UUID FK into truck_registration,
        // not a legacy numeric id - match on uuid.
        const company = registration.find(
          (com) => com.uuid === item.Registration,
        );

        const tripdetail = trips.find((trip) => trip.id - 1 === Number(item.Trip));

        if (!tripdetail) return null; // ไม่ใช่รถใหญ่ → ตัดทิ้ง

        const depotName = tripdetail?.Depot?.split(":")[1] || "";

        let Rate = 0;
        if (depotName === "ลำปาง") Rate = parseFloat(item.Rate1) || 0;
        else if (depotName === "พิจิตร") Rate = parseFloat(item.Rate2) || 0;
        else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName))
          Rate = parseFloat(item.Rate3) || 0;

        // ✅ รวม amount จากทุก product
        const { volumeSum, amountSum } = Object.entries(item.Product)
          .filter(([productName]) => productName !== "P")
          .reduce(
            (acc, [, productData]) => {
              const volumeProduct = parseFloat(productData.Volume) * 1000;
              const amount = volumeProduct * parseFloat(Rate);
              acc.volumeSum += volumeProduct;
              acc.amountSum += amount;
              return acc;
            },
            { volumeSum: 0, amountSum: 0 },
          );

        // ✅ คำนวณ VAT และ TotalAmount ของบิลนี้
        const vatOnePercent = amountSum * 0.01;
        const totalAmount = amountSum - vatOnePercent;
        let totalIncomingMoney = 0;
        const processedKey = `${item.TicketName}_${item.CustomerType}`;

        if (!processedTickets.has(processedKey)) {
          const matchedTrans = transferMoneyDetail.filter((t) => {
            if (!t.month) return false;

            const [monthPart] = t.month.split("_"); // "2026-03"
            const [tYear, tMonth] = monthPart.split("-").map(Number); // [2026, 3]

            // if (t.TicketName === "26:T...JKR  สบปราบ/ลำปาง +ส่งรูป") {
            //   console.log(
            //     `Checking transfer: ${t.TicketName} (${t.CustomerType}) - month: ${t.month}, parsed: ${tYear}-${tMonth}, against filter month: ${month + 1}, year: ${year - 543}`,
            //   );
            // }

            // ✅ เช็คทั้งปี ค.ศ. และเดือน
            const isMatchMonth =
              tYear === year - 543 && tMonth === Number(month) + 1;
            if (!isMatchMonth) return false;

            const baseCondition =
              t.TicketName === item.TicketName &&
              t.TicketType === item.CustomerType &&
              t.Status !== "ยกเลิก";

            if (check === "0:ทั้งหมด") return baseCondition;
            if (check === "4:รถรับจ้างขนส่ง")
              return baseCondition && item.RegistrationName === "ไม่มี";
            return (
              baseCondition && t.Transport.split(":")[0] === check.split(":")[0]
            );
          });

          console.log(
            `Matched transfer for ${item.TicketName} (${item.CustomerType}):`,
            matchedTrans,
          );

          totalIncomingMoney = matchedTrans.reduce((sum, t) => {
            const money = parseFloat(
              (t.IncomingMoney || "0").toString().replace(/,/g, "").trim(),
            );
            return sum + (isNaN(money) ? 0 : money);
          }, 0);

          processedTickets.add(processedKey);
        }

        const incomingMoneyDetail = transferMoneyDetail.filter(
          (trans) => trans.TicketNo === item.No,
        );

        return {
          ...item,
          IncomingMoneyDetail: incomingMoneyDetail,
          VolumeProduct: volumeSum,
          Amount: amountSum,
          IncomingMoney: totalIncomingMoney,
          OverdueTransfer: totalAmount - totalIncomingMoney,
          VatOnePercent: vatOnePercent,
          TotalAmount: totalAmount,
          RateOil: parseFloat(Rate),
          Company:
            item.RegistrationName !== "ไม่มี"
              ? company?.Company
              : "4:รถรับจ้างขนส่ง",
          CompanyName:
            item.RegistrationName !== "ไม่มี"
              ? company?.CompanyName
              : "รถรับจ้างขนส่ง",
          RegistrationHead: company?.RegHead,
          RegistrationTail: company?.RegTailName,
          TruckType: tripdetail?.TruckType || "",
        };
      })
      .filter(Boolean);

    flattenedRef.current = flattened;

    console.log(
      "registraion : ",
      registration.filter(
        (row) => row.Company.split(":")[0] === check.split(":")[0],
      ),
    );
    console.log(
      "flattened : ",
      flattened.filter(
        (row) =>
          row.CustomerType === "ตั๋วรับจ้างขนส่ง" &&
          row.TicketName === "26:T...JKR  สบปราบ/ลำปาง +ส่งรูป",
      ),
    );
    console.log(
      "transferMoneyDetail.filter((t) => ",
      transferMoneyDetail.filter(
        (t) =>
          t.Status !== "ยกเลิก" &&
          t.TicketName === "26:T...JKR  สบปราบ/ลำปาง +ส่งรูป",
      ),
    );

    // 3. รวมข้อมูลที่มี TicketName เดียวกัน (เฉพาะที่อยู่ในช่วงวันที่ที่เลือกแล้วเท่านั้น)
    const merged = Object.values(
      flattened.reduce((acc, curr) => {
        const key = `${curr.TicketName}_${curr.CustomerType}`; // รวม TicketName, CustomerType และ Date เพื่อแยกกรณีที่มีหลายบิลในวันเดียวกัน

        if (!acc[key]) {
          acc[key] = { ...curr };
        } else {
          acc[key].VolumeProduct += curr.VolumeProduct;
          acc[key].Amount += curr.Amount;
          acc[key].IncomingMoney += curr.IncomingMoney;
          acc[key].OverdueTransfer += curr.OverdueTransfer;
          acc[key].VatOnePercent += curr.VatOnePercent;
          acc[key].TotalAmount += curr.TotalAmount;
          // acc[key].VatOnePercent += ((curr.Amount) * 0.01);
          // acc[key].TotalAmount += (curr.Amount) - ((curr.Amount) * 0.01);

          // กรณีข้อมูลรวมอ้างอิงวันเดียว: ให้เลือกวันล่าสุดหรือแรกสุดก็ได้ (ตัวอย่างใช้วันล่าสุด)
          // const dateA = dayjs(acc[key].Date, "DD/MM/YYYY");
          // const dateB = dayjs(curr.Date, "DD/MM/YYYY");
          // acc[key].Date = dateA.isAfter(dateB) ? acc[key].Date : curr.Date;
        }

        return acc;
      }, {}),
    );

    // 4. เรียงตามวันที่ และชื่อคนขับ
    const filtered = merged.filter((row) => {
      if (ticketO && row.CustomerType === "ตั๋วน้ำมัน") return true;
      if (ticketG && row.CustomerType === "ตั๋วปั้ม") return true;
      if (ticketT && row.CustomerType === "ตั๋วรับจ้างขนส่ง") return true;

      // ถ้าไม่เลือก checkbox เลย ให้แสดงทั้งหมด
      if (!ticketO && !ticketG && !ticketT) return true;

      return false;
    });

    return filtered.sort((a, b) => {
      const dateA = dayjs(a.Date, "DD/MM/YYYY");
      const dateB = dayjs(b.Date, "DD/MM/YYYY");
      if (!dateA.isSame(dateB)) {
        return dateA - dateB;
      }
      return (a.TicketNameName || "").localeCompare(
        b.TicketNameName || "",
      );
    });
    // return merged.sort((a, b) => {
    //     const dateA = dayjs(a.Date, "DD/MM/YYYY");
    //     const dateB = dayjs(b.Date, "DD/MM/YYYY");
    //     if (!dateA.isSame(dateB)) {
    //         return dateA - dateB;
    //     }
    //     return (a.driver?.split(":")[1] || '').localeCompare(b.driver?.split(":")[1] || '');
    // });
  }, [
    ticket,
    selectedDateStart,
    selectedDateEnd,
    selectTickets,
    transferMoneyDetail,
    check,
    registration,
  ]);

  console.log("orderDetail ss : ", orderDetail);

  const totalAmount = orderDetail.reduce(
    (sum, item) => sum + Number(item.Amount || 0),
    0,
  );
  const totalOverdueTransfer = orderDetail.reduce(
    (sum, item) => sum + Number(item.OverdueTransfer || 0),
    0,
  );
  const totalVatOnePercent = orderDetail.reduce(
    (sum, item) => sum + Number(item.VatOnePercent || 0),
    0,
  );
  const totalTotalAmount = orderDetail.reduce(
    (sum, item) => sum + Number(item.TotalAmount || 0),
    0,
  );
  const totalIncomingMoney = orderDetail.reduce(
    (sum, item) => sum + Number(item.IncomingMoney || 0),
    0,
  );
  const totalVolume = orderDetail.reduce(
    (sum, item) => sum + Number(item.VolumeProduct || 0),
    0,
  );

  const sortedOrderDetail = useMemo(() => {
    const sorted = [...orderDetail];
    const key = sortConfig.key || "TicketName";
    const direction = sortConfig.key ? sortConfig.direction : "asc";

    sorted.sort((a, b) => {
      let aValue, bValue;

      if (key === "TicketName") {
        aValue = a.TicketNameName || "";
        bValue = b.TicketNameName || "";
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [orderDetail, sortConfig]);

  console.log("Order Detail : ", orderDetail);
  console.log("Select Tickets : ", selectTickets);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatNumber = (value) => {
    // แปลงเป็นเลขก่อน ถ้าแปลงไม่ได้ให้เป็น 0
    let num = parseFloat(value);

    if (isNaN(num)) return "0";

    // ปัดเป็น 2 ตำแหน่ง
    num = Number(num.toFixed(2));

    // จัดการกรณี -0, 00.00, -00.00
    if (num === 0 || Object.is(num, -0)) return "0";

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("รายงานชำระค่าขนส่ง");

    // 1️⃣ กำหนด columns
    worksheet.columns = [
      { header: "ลำดับ", key: "no", width: 8 },
      { header: "ตั๋ว", key: "ticket", width: 55 },
      { header: "ยอดลิตร", key: "volume", width: 25 },
      { header: "ยอดเงิน", key: "amount", width: 25 },
      { header: "หักภาษี1%", key: "vat", width: 25 },
      { header: "ยอดชำระ", key: "total", width: 25 },
      { header: "ยอดโอน", key: "incoming", width: 25 },
      { header: "ค้างโอน", key: "overdue", width: 25 },
    ];

    // 2️⃣ Title merge
    worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "รายงานชำระค่าขนส่ง";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { size: 16, bold: true };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDEBF7" },
    };
    worksheet.getRow(1).height = 30;

    // 3️⃣ Header row (row 2)
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

    // 4️⃣ Data rows
    sortedOrderDetail.forEach((row, index) => {
      const dataRow = {
        no: index + 1,
        ticket: row.TicketNameName || row.TicketName,
        volume: Number(row.VolumeProduct),
        amount: Number(row.Amount),
        vat: Number(row.VatOnePercent),
        total: Number(row.TotalAmount),
        incoming: Number(row.IncomingMoney),
        overdue: Number(row.OverdueTransfer),
      };

      const newRow = worksheet.addRow(dataRow);
      newRow.height = 20;
      newRow.alignment = { horizontal: "center", vertical: "middle" };
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

    // 5️⃣ Footer row รวมค่า
    const footerRow = worksheet.addRow({
      ticket: "รวม",
      volume: sortedOrderDetail.reduce(
        (acc, r) => acc + Number(r.VolumeProduct),
        0,
      ),
      amount: sortedOrderDetail.reduce((acc, r) => acc + Number(r.Amount), 0),
      vat: sortedOrderDetail.reduce(
        (acc, r) => acc + Number(r.VatOnePercent),
        0,
      ),
      total: sortedOrderDetail.reduce(
        (acc, r) => acc + Number(r.TotalAmount),
        0,
      ),
      incoming: sortedOrderDetail.reduce(
        (acc, r) => acc + Number(r.IncomingMoney),
        0,
      ),
      overdue: sortedOrderDetail.reduce(
        (acc, r) => acc + Number(r.OverdueTransfer),
        0,
      ),
    });

    footerRow.font = { bold: true };
    footerRow.alignment = { horizontal: "center", vertical: "middle" };
    footerRow.height = 25;
    footerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFE699" },
      }; // สีเหลือง
      cell.numFmt = "#,##0.00"; // format ตัวเลข
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 6️⃣ Save
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `รายงานชำระค่าขนส่ง_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
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
      <Grid container spacing={2} sx={{ marginBottom: -5 }}>
        <Grid item sm={12} lg={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            รายงานชำระค่าขนส่ง
          </Typography>
        </Grid>
        <Grid item sm={12} lg={10}></Grid>
        <Grid item sm={12} lg={2}>
          <Button
            variant="contained"
            size="small"
            color="success"
            sx={{ marginTop: -17 }}
            fullWidth
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
        </Grid>
        {/* <Grid item md={5} xs={12}>
                    <Box
                        sx={{
                            width: "100%", // กำหนดความกว้างของ Paper
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // marginTop: { md: -8, xs: 2 },
                            marginBottom: 3
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                </Grid> */}
      </Grid>
      <Divider sx={{ marginBottom: 2 }} />
      <Box sx={{ width: "100%" }}>
        {windowWidth >= 800 ? (
          <Grid container spacing={2} width="100%">
            <Grid item sm={6} lg={2}>
              <Box
                sx={{
                  width: "100%", // กำหนดความกว้างของ Paper
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
              >
                <TextField
                  size="small"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ marginRight: 2 }}>
                        <b>งวดการจ่ายปี :</b>
                      </InputAdornment>
                    ),
                    sx: {
                      fontSize: "16px",
                      height: "40px",
                      padding: "10px",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item sm={6} lg={2}>
              <Box
                sx={{
                  width: "100%", // กำหนดความกว้างของ Paper
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                  marginBottom: 3,
                }}
              >
                <TextField
                  size="small"
                  value={monthNames[month]}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start" sx={{ marginRight: 2 }}>
                        <b>เดือน :</b>
                      </InputAdornment>
                    ),
                    sx: {
                      fontSize: "16px",
                      height: "40px",
                      padding: "10px",
                      fontWeight: "bold",
                    },
                    endAdornment: (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          ml: 0.5,
                        }}
                      >
                        <IconButton
                          onClick={handleIncrement}
                          size="small"
                          sx={{ p: 0, flex: 1, minHeight: 0 }} // ปรับให้เต็มแต่ละครึ่ง
                        >
                          <ArrowDropUp fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={handleDecrement}
                          size="small"
                          sx={{ p: 0, flex: 1, minHeight: 0 }}
                        >
                          <ArrowDropDown fontSize="small" />
                        </IconButton>
                      </Box>
                    ),
                  }}
                />
              </Box>
            </Grid>
            <Grid item sm={12} lg={3.5}>
              <Paper>
                {/* <TextField
                                        select
                                        value={check}
                                        onChange={(e) => setCheck(e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{
                                            '& .MuiInputBase-input': { fontSize: "16px", textAlign: 'center' },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>กรุณาเลือกบริษัท :</b>
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        <MenuItem value="0:ทั้งหมด" sx={{ fontSize: "16px" }}>
                                            ทั้งหมด
                                        </MenuItem>
                                        <MenuItem value="2:บริษัท นาคราปิโตรเลียม2016 จำกัด (สำนักงานใหญ่)" sx={{ fontSize: "16px" }}>
                                            บริษัท นาคราปิโตรเลียม2016 จำกัด (สำนักงานใหญ่)
                                        </MenuItem>
                                        <MenuItem value="3:บริษัท พิชยาทรานสปอร์ต จำกัด (สำนักงานใหญ่)" sx={{ fontSize: "16px" }}>
                                            บริษัท พิชยาทรานสปอร์ต จำกัด (สำนักงานใหญ่)
                                        </MenuItem>
                                    </TextField> */}
                <Autocomplete
                  options={companies}
                  getOptionLabel={(option) => option.label}
                  value={
                    companies.find(
                      (opt) => opt.value.split(":")[0] === check.split(":")[0],
                    ) || null
                  }
                  onChange={(event, newValue) =>
                    setCheck(newValue ? newValue.value : "")
                  }
                  size="small"
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{
                        "& .MuiInputBase-input": { fontSize: "16px" },
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{ marginRight: 2 }}
                          >
                            <b>กรุณาเลือกบริษัท :</b>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Paper>
              {/* <FormGroup row sx={{ marginBottom: -1.5 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                                    <FormControlLabel control={<Checkbox checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
                                    <FormControlLabel control={<Checkbox checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="อยู่บริษัทในเครือ" />
                                    <FormControlLabel control={<Checkbox checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="ไม่อยู่บริษัทในเครือ" />
                                </FormGroup> */}
            </Grid>
            <Grid item sm={12} lg={4.5}>
              <FormGroup row sx={{ marginBottom: -1.5 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ marginTop: 1, marginRight: 2 }}
                  gutterBottom
                >
                  เลือกตั๋ว :{" "}
                </Typography>
                <FormControlLabel
                  control={<Checkbox checked={ticketO} />}
                  onChange={() => setTicketO(!ticketO)}
                  label="ตั๋วน้ำมัน"
                />
                <FormControlLabel
                  control={<Checkbox checked={ticketG} />}
                  onChange={() => setTicketG(!ticketG)}
                  label="ตั๋วปั้ม"
                />
                <FormControlLabel
                  control={<Checkbox checked={ticketT} />}
                  onChange={() => setTicketT(!ticketT)}
                  label="ตั๋วรับจ้างขนส่ง"
                />
              </FormGroup>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2} p={1}>
            <Grid item xs={6}>
              <Box
                sx={{
                  width: "100%", // กำหนดความกว้างของ Paper
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
              >
                <TextField
                  size="small"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ marginRight: 2 }}>
                        <b>งวดการจ่ายปี :</b>
                      </InputAdornment>
                    ),
                    sx: {
                      fontSize: "16px",
                      height: "40px",
                      padding: "10px",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  width: "100%", // กำหนดความกว้างของ Paper
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
              >
                <TextField
                  size="small"
                  value={monthNames[month]}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start" sx={{ marginRight: 2 }}>
                        <b>เดือน :</b>
                      </InputAdornment>
                    ),
                    sx: {
                      fontSize: "16px",
                      height: "40px",
                      padding: "10px",
                      fontWeight: "bold",
                    },
                    endAdornment: (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          ml: 0.5,
                        }}
                      >
                        <IconButton
                          onClick={handleIncrement}
                          size="small"
                          sx={{ p: 0, flex: 1, minHeight: 0 }} // ปรับให้เต็มแต่ละครึ่ง
                        >
                          <ArrowDropUp fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={handleDecrement}
                          size="small"
                          sx={{ p: 0, flex: 1, minHeight: 0 }}
                        >
                          <ArrowDropDown fontSize="small" />
                        </IconButton>
                      </Box>
                    ),
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Paper>
                <TextField
                  select
                  value={check}
                  onChange={(e) => setCheck(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "16px",
                      textAlign: "center",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ marginRight: 2 }}>
                        <b>กรุณาเลือกบริษัท :</b>
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="0:ทั้งหมด" sx={{ fontSize: "16px" }}>
                    ทั้งหมด
                  </MenuItem>
                  <MenuItem
                    value="2:บริษัท นาคราปิโตรเลียม2016 จำกัด (สำนักงานใหญ่)"
                    sx={{ fontSize: "16px" }}
                  >
                    บริษัท นาคราปิโตรเลียม2016 จำกัด (สำนักงานใหญ่)
                  </MenuItem>
                  <MenuItem
                    value="3:บริษัท พิชยาทรานสปอร์ต จำกัด (สำนักงานใหญ่)"
                    sx={{ fontSize: "16px" }}
                  >
                    บริษัท พิชยาทรานสปอร์ต จำกัด (สำนักงานใหญ่)
                  </MenuItem>
                  <MenuItem value="4:รถรับจ้างขนส่ง" sx={{ fontSize: "16px" }}>
                    รถรับจ้างขนส่ง
                  </MenuItem>
                </TextField>
              </Paper>
              {/* <FormGroup row sx={{ marginBottom: -1.5 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                                    <FormControlLabel control={<Checkbox checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
                                    <FormControlLabel control={<Checkbox checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="อยู่บริษัทในเครือ" />
                                    <FormControlLabel control={<Checkbox checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="ไม่อยู่บริษัทในเครือ" />
                                </FormGroup> */}
            </Grid>
            <Grid item xs={12}>
              s
              <FormGroup row sx={{ marginBottom: -1.5 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ marginTop: 1, marginRight: 2 }}
                  gutterBottom
                >
                  เลือกตั๋ว :{" "}
                </Typography>
                <FormControlLabel
                  control={<Checkbox checked={ticketO} />}
                  onChange={() => setTicketO(!ticketO)}
                  label="ตั๋วน้ำมัน"
                />
                <FormControlLabel
                  control={<Checkbox checked={ticketG} />}
                  onChange={() => setTicketG(!ticketG)}
                  label="ตั๋วปั้ม"
                />
                <FormControlLabel
                  control={<Checkbox checked={ticketT} />}
                  onChange={() => setTicketT(!ticketT)}
                  label="ตั๋วรับจ้างขนส่ง"
                />
              </FormGroup>
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
        <Grid container spacing={2} width="100%" sx={{ marginTop: -3 }}>
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
                    <TablecellSelling
                      width={20}
                      sx={{ textAlign: "center", fontSize: 16 }}
                    >
                      ลำดับ
                    </TablecellSelling>
                    <TablecellSelling
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
                    </TablecellSelling>
                    <TablecellSelling
                      sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                    >
                      ยอดลิตร
                    </TablecellSelling>
                    <TablecellSelling
                      sx={{ textAlign: "center", fontSize: 16, width: 70 }}
                    >
                      ยอดเงิน
                    </TablecellSelling>
                    <TablecellSelling
                      sx={{ textAlign: "center", fontSize: 16, width: 70 }}
                    >
                      หักภาษี1%
                    </TablecellSelling>
                    <TablecellSelling
                      sx={{ textAlign: "center", fontSize: 16, width: 70 }}
                    >
                      ยอดชำระ
                    </TablecellSelling>
                    <TablecellSelling
                      sx={{ textAlign: "center", fontSize: 16, width: 70 }}
                    >
                      ยอดโอน
                    </TablecellSelling>
                    <TablecellSelling
                      sx={{ textAlign: "center", fontSize: 16, width: 70 }}
                    >
                      ค้างโอน
                    </TablecellSelling>
                    <TablecellSelling sx={{ textAlign: "center", width: 20 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedOrderDetail.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? "#FFFFFF" : "#f0f1f8cd",
                      }}
                    >
                      <TableCell sx={{ textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {`${row.TicketNameName || row.TicketName} (${row.CustomerType})`}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          paddingLeft: "20px !important",
                          paddingRight: "20px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        {new Intl.NumberFormat("en-US").format(
                          row.VolumeProduct,
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          paddingLeft: "20px !important",
                          paddingRight: "20px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        {formatNumber(row.Amount)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          paddingLeft: "20px !important",
                          paddingRight: "20px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        {formatNumber(row.VatOnePercent)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          paddingLeft: "20px !important",
                          paddingRight: "20px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        {formatNumber(row.TotalAmount)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          paddingLeft: "20px !important",
                          paddingRight: "20px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        {formatNumber(row.IncomingMoney)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          paddingLeft: "20px !important",
                          paddingRight: "20px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        {formatNumber(row.OverdueTransfer)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {check !== "0:ทั้งหมด" && (
                          <ReportDetail
                            key={row.id}
                            row={row}
                            dateStart={selectedDateStart}
                            dateEnd={selectedDateEnd}
                            orderDetail={flattenedRef.current}
                            year={year}
                            month={monthNames[month]}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Grid
              container
              spacing={1}
              marginTop={1}
              paddingBottom={1}
              sx={{ backgroundColor: theme.palette.info.dark }}
            >
              <Grid item xs={3}>
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formatNumber(totalVolume)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            รวม :
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
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
                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right", marginRight: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>รวมลิตร</Typography> */}
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formatNumber(totalAmount)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            ยอดเงิน :
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            บาท
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>
                {/* </Box> */}
              </Grid>
              <Grid item xs={3}>
                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right", marginRight: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>รวมลิตร</Typography> */}
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formatNumber(totalVatOnePercent)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            หักภาษี1% :
                          </Typography>
                        </InputAdornment>
                      ),
                      // endAdornment: (
                      //     <InputAdornment position="end">
                      //         <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                      //             บาท
                      //         </Typography>
                      //     </InputAdornment>
                      // ),
                    }}
                  />
                </Paper>
                {/* </Box> */}
              </Grid>
              <Grid item xs={3}>
                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right", marginRight: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>รวมลิตร</Typography> */}
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formatNumber(totalTotalAmount)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            ยอดชำระ :
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            บาท
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>
                {/* </Box> */}
              </Grid>
              <Grid item xs={3}></Grid>
              <Grid item xs={3}></Grid>
              <Grid item xs={3}>
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formatNumber(totalIncomingMoney)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            ยอดโอน :
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            บาท
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>
                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", marginLeft: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>ยอดเงิน</Typography>
                                    <Paper>
                                        <TextField fullWidth size="small" value={new Intl.NumberFormat("en-US").format(totalAmount)} />
                                    </Paper>
                                </Box> */}
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ backgroundColor: "white" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formatNumber(totalOverdueTransfer)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        textAlign: "center",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            ค้างโอน :
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            sx={{ fontSize: "18px", fontWeight: "bold" }}
                          >
                            บาท
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ReportTransports;
