import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
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
import {
  IconButtonError,
  IconButtonInfo,
  IconButtonSuccess,
  RateOils,
  TableCellB7,
  TableCellB95,
  TableCellE20,
  TableCellG91,
  TableCellG95,
  TablecellHeader,
  TableCellPWD,
  TablecellSelling,
} from "../../theme/style";
import InfoIcon from "@mui/icons-material/Info";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import BackspaceIcon from "@mui/icons-material/Backspace";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import EventIcon from "@mui/icons-material/Event";
import theme from "../../theme/theme";
import { apiPost, apiPut } from "../../server/apiClient";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/th";
import "../../theme/scrollbar.css";
import jsPDF from "jspdf";
import notoSansThaiRegular from "@fontsource/noto-sans-thai";
import html2canvas from "html2canvas";
import BankDetail from "./BankDetail";
import buddhistEra from "dayjs/plugin/buddhistEra"; // ใช้ plugin Buddhist Era (พ.ศ.)
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import {
  formatThaiFullYear,
  formatThaiShort,
  formatThaiSlash,
} from "../../theme/DateTH";

dayjs.locale("th");
dayjs.extend(buddhistEra);

const UpdateReport = (props) => {
  const { ticket, open, dateRanges, months } = props;
  // const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({}); // เก็บค่าฟอร์มชั่วคราว
  const [show, setShow] = useState(false);
  const [test, setTest] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // กำหนดชำระเงินบนใบวางบิล - เลือกได้ว่าจะใช้ตามที่คำนวณไว้ (วันที่วางบิล + จำนวนวันเครดิต)
  // กำหนดวันที่เองแบบ manual หรือไม่ระบุวันที่เลยก็ได้ ค่าที่เลือกจะถูกส่งไปกับ
  // invoiceData ตอนเปิดหน้าต่างพิมพ์ ("/print-report" อ่านค่านี้จาก sessionStorage)
  const [dueDateMode, setDueDateMode] = useState("fixed"); // "fixed" | "manual" | "none"
  const [manualDueDate, setManualDueDate] = useState(dayjs().format("DD/MM/YYYY"));

  // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
    };

    window.addEventListener("resize", handleResize); // เพิ่ม event listener

    // ลบ event listener เมื่อ component ถูกทำลาย
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const {
  //     tickets,
  //     customertransports,
  //     customergasstations,
  //     customertickets,
  //     trip,
  //     reghead,
  //     company,
  //     banks,
  //     transferMoney,
  //     invoiceReport
  // } = useData();

  const {
    tickets,
    customertransports,
    customergasstations,
    customertickets,
    trip,
    banks,
    transferMoney,
    invoiceReport,
    refetch: refetchTripData,
  } = useTripData();

  const { reghead, company, drivers, small } = useBasicData();

  const productOrder = ["G95", "B95", "B7", "G91", "E20", "E85", "PWD", "B20"];
  console.log("Show Data ", ticket);

  //const showTickets = Object.values(tickets || {});
  const showTickets = Object.values(tickets || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });
  const customertransport = Object.values(customertransports || {});
  const customergasstation = Object.values(customergasstations || {});
  const customerTickets = Object.values(customertickets || {});
  const driverDetail = Object.values(drivers || {});

  //const showTrips = Object.values(trip || {});
  const showTrips = Object.values(trip || {}).filter((item) => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

    return (
      (deliveryDate.isSameOrAfter(targetDate, "day") ||
        receiveDate.isSameOrAfter(targetDate, "day")) &&
      item.StatusTrip !== "ยกเลิก" &&
      item.TruckType !== "รถเล็ก"
    );
  });
  const registrationHead = Object.values(reghead || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const registrationSmall = Object.values(small || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const companies = Object.values(company || {});
  const bankDetail = Object.values(banks || {}).filter(
    (row) => row.Status !== "ยกเลิก",
  );
  const transferMoneyDetail = Object.values(transferMoney || {});
  const invoiceDetail = Object.values(invoiceReport || {});

  console.log("transferMoneyDetail : ", transferMoneyDetail);

  const transfer = transferMoneyDetail.filter(
    (row) =>
      row.TicketName === ticket.TicketName &&
      row.Status !== "ยกเลิก" &&
      row.month === months,
  );

  let CountCompany1 = 0;
  let CountCompany2 = 0;

  // Transport is now a real company uuid, not a legacy "id:Name" composite -
  // compare against the two hardcoded transport companies (id 2 and 3) by
  // uuid instead of a split numeric prefix.
  const transportCompany2Uuid = companies.find((c) => c.id === 2)?.uuid;
  const transportCompany3Uuid = companies.find((c) => c.id === 3)?.uuid;

  transfer.forEach((row) => {
    const incoming = Number(row.IncomingMoney) || 0; // แปลงเป็นตัวเลข เผื่อเจอ undefined

    if (row.Transport === transportCompany2Uuid) {
      CountCompany1 += incoming;
    } else if (row.Transport === transportCompany3Uuid) {
      CountCompany2 += incoming;
    }
  });

  console.log("ยอดบริษัท 1:", CountCompany1);
  console.log("ยอดบริษัท 2:", CountCompany2);

  const totalIncomingMoney = transferMoneyDetail
    .filter(
      (trans) =>
        trans.TicketName === ticket.TicketName &&
        trans.TicketType === "ตั๋วรับจ้างขนส่ง" &&
        trans.Status !== "ยกเลิก" &&
        trans.month === months,
    )
    .reduce((sum, trans) => {
      const value = parseFloat(trans.IncomingMoney) || 0;
      return sum + value;
    }, 0);
  const currentCode = dayjs(new Date()).format("YYYYMM");

  // ดึงรายการล่าสุด
  const lastItem = transferMoneyDetail[transferMoneyDetail.length - 1];

  // ตรวจสอบ Number และ Code
  let newNumber = 1;

  if (lastItem && lastItem.Number && lastItem.Code === currentCode) {
    newNumber = Number(lastItem.Number) + 1;
  }

  // แปลงให้เป็น string 4 หลัก เช่น "0001"
  const formattedNumber = String(newNumber).padStart(4, "0");

  const [price, setPrice] = useState({
    id: transferMoneyDetail.length,
    Code: currentCode,
    Number: formattedNumber,
    DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
    BankName: "",
    Transport: "",
    IncomingMoney: "",
    TicketName: ticket.TicketName,
    TicketNo: ticket.No,
    TicketType: ticket.CustomerType,
    Note: "",
    month: months,
    // The billing period's own date range (not to be confused with
    // DateStart above, which is the date this payment was recorded) -
    // report/Report.js matches transfers back to a group using this
    // pair instead of the fragile month/TicketNo-based lookups it used
    // to rely on.
    PeriodStart: ticket.DateStart,
    PeriodEnd: ticket.DateEnd,
  });

  // const ticketsList = showTickets.filter(item => {
  //     if (open === 1) return item.CustomerType === "ตั๋วน้ำมัน";
  //     if (open === 2) return item.CustomerType === "ตั๋วรับจ้างขนส่ง";
  //     if (open === 3) return item.CustomerType === "ตั๋วปั้ม";
  //     return true; // หรือเปลี่ยนเป็น `false` ถ้าไม่ต้องการให้แสดงกรณีอื่น
  //   });

  //const ticketsList = showTickets.filter(item => item.TicketName === ticket.TicketName && item.Trip !== "ยกเลิก");

  const startDate = dayjs(ticket.DateStart, "DD/MM/YYYY");
  const endDate = dayjs(ticket.DateEnd, "DD/MM/YYYY");

  console.log("DateStart : ", startDate);
  console.log("DateEnd ", endDate);

  const ticketsList = showTickets.filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY"); // แปลง item.Date ก่อนนะ

    return (
      item.TicketName === ticket.TicketName &&
      item.Trip !== "ยกเลิก" &&
      item.Status !== "ยกเลิก" &&
      item.CustomerType !== "ตั๋วรถเล็ก" &&
      itemDate.isBetween(startDate, endDate, "day", "[]") // [] คือรวมวันแรกกับวันสุดท้ายด้วย
      //(checkOverdueTransfer || itemDate.isBetween(startDate, endDate, null, "[]"))
    );
  });

  const [tranferID, setTranferID] = useState(null);
  const [tranferDateStart, setTranferDateStart] = useState("");
  const [tranferBankName, setTranferBankName] = useState("");
  const [transport, setTransport] = useState("");
  const [tranferIncomingMoney, setTranferIncomingMoney] = useState("");
  const [tranferNote, setTranferNote] = useState("");
  const [updateTranfer, setUpdateTranfer] = useState(false);

  console.log(
    "handleClickTranfer : ",
    tranferID,
    tranferDateStart,
    tranferBankName,
    tranferIncomingMoney,
    tranferNote,
  );

  const handleClickTranfer = (
    id,
    DateStart,
    BankName,
    Transport,
    IncomingMoney,
    Note,
  ) => {
    setUpdateTranfer(true);
    setTranferID(id);
    setTranferDateStart(DateStart);
    setTranferBankName(BankName);
    setTransport(Transport);
    setTranferIncomingMoney(IncomingMoney);
    setTranferNote(Note);
  };

  console.log(" Month : ", months);
  console.log("ticketsList: ", ticketsList);
  console.log("Show tickets List : ", ticket);
  // console.log("Id : ", ticket.TicketName.split(":")[0]);
  // console.log("Name : ", ticket.TicketName.split(":")[1]);
  // console.log("Customer Type : ", ticket.CustomerType);
  //console.log("Transport : ", customertransport.find(item => item.id === Number(ticket.TicketName.split(":")[0]) && item.Trip !== "ยกเลิก"));
  //console.log("GasStation : ", customergasstation.find(item => item.id === Number(ticket.TicketName.split(":")[0]) && item.Trip !== "ยกเลิก"));
  //console.log("Ticket : ", customerTickets.find(item => item.id === Number(ticket.TicketName.split(":")[0]) && item.Trip !== "ยกเลิก"));

  console.log("Price : ", price);

  // const calculateDueDate = (dateString, creditDays) => {
  //     if (!dateString || creditDays === null || creditDays === undefined) return "ไม่พบข้อมูลวันที่";

  //     const [day, month, year] = dateString.split("/").map(Number);
  //     const date = new Date(year, month - 1, day);

  //     date.setDate(date.getDate() + creditDays);

  //     const formattedDate = new Intl.DateTimeFormat("th-TH", {
  //         year: "numeric",
  //         month: "long",
  //         day: "numeric",
  //     }).format(date);

  //     return `กำหนดชำระเงินวันที่ ${formattedDate}`;
  // };

  const calculateDueDate = (dateString, creditDays) => {
    if (!dateString || !creditDays) return "ไม่พบข้อมูลวันที่";

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() + Number(creditDays));

    const thaiMonths = [
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

    const dueDay = date.getDate();
    const dueMonth = thaiMonths[date.getMonth()];
    const dueYear = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

    return `วันที่ ${dueDay} เดือน${dueMonth} พ.ศ.${dueYear}`;
  };

  // 🔥 ทดสอบโค้ด
  console.log("Date:", ticket.Date);
  console.log("Credit Time:", ticket.CreditTime);
  console.log(calculateDueDate(ticket.Date, ticket.CreditTime));

  console.log("ticketsList : ", ticketsList);

  // const handleClickOpen = () => {
  //     setOpen(true);
  // };

  // const handleClose = () => {
  //     setOpen(false);
  // };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [report, setReport] = useState({});

  // ฟังก์ชันคำนวณยอดเงิน
  const handlePriceChange = (
    value,
    no,
    uniqueRowId,
    ticketName,
    productName,
    date,
    driver,
    registration,
    volume,
  ) => {
    const price = parseFloat(value);

    setReport((prevReport) => {
      const newReport = { ...prevReport };

      if (value === "" || price === 0 || isNaN(price)) {
        // ถ้าค่าว่าง หรือ 0 ให้ลบออกจาก report
        delete newReport[uniqueRowId];
      } else {
        // บันทึกค่าตามปกติ
        newReport[uniqueRowId] = {
          No: no,
          TicketName: ticketName,
          ProductName: productName,
          Date: date,
          Driver: driver,
          Registration: registration,
          Price: price,
          Amount: price * volume,
        };
      }

      return newReport;
    });
  };

  const processTickets = (tickets, showTrips) => {
    const safeSplit = (value, index) => {
      if (!value || typeof value !== "string") return undefined;
      return value.split(":")[index];
    };

    const tripMap = new Map(showTrips.map((t) => [t.id - 1, t]));
    // trip.Registration is a real UUID FK into truck_registration/truck_small
    // now, not a legacy numeric id - key these maps by uuid instead.
    const regHeadMap = new Map(registrationHead.map((r) => [r.uuid, r]));
    const regSmallMap = new Map(registrationSmall.map((r) => [r.uuid, r]));
    const companyByUuid = new Map(companies.map((c) => [c.uuid, c]));

    const result = [];

    for (const row of tickets) {
      const matchedTrip = tripMap.get(Number(row.Trip));
      if (!matchedTrip || !row.Product) continue; // กันข้อมูลเสีย

      const isSmallTruck = matchedTrip?.TruckType?.trim() === "รถเล็ก";

      const regUuid = matchedTrip?.Registration;
      const companyObj = isSmallTruck
        ? regSmallMap.get(regUuid)
        : regHeadMap.get(regUuid);

      const companyAddress = companyByUuid.get(companyObj?.Company);

      const depotName = safeSplit(matchedTrip?.Depot, 1);

      let rate = 0;
      if (depotName === "ลำปาง") rate = row.Rate1 || 0;
      else if (depotName === "พิจิตร") rate = row.Rate2 || 0;
      else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName))
        rate = row.Rate3 || 0;

      for (const [productName, Volume] of Object.entries(row.Product)) {
        if (productName === "P") continue;

        result.push({
          No: row.No,
          TicketName: row.TicketName,
          Rate: rate,
          Amount: Volume?.Amount || 0,

          Depot: matchedTrip?.Depot ?? row.Depot,
          DateDelivery: matchedTrip?.DateDelivery ?? row.DateDelivery,
          DateReceive: matchedTrip?.DateReceive ?? row.DateReceive,
          Date: row.Date,

          Driver: matchedTrip?.Driver ?? row.Driver,
          Registration: matchedTrip?.Registration ?? row.Registration,
          RegistrationName: matchedTrip?.RegistrationName ?? row.RegistrationName,

          RegTail: companyObj?.RegTail,
          RegTailName: companyObj?.RegTailName,
          ProductName: productName,

          ShortName: isSmallTruck ? companyObj?.ShortName : "-",

          Volume: isSmallTruck ? Volume?.Volume : (Volume?.Volume || 0) * 1000,

          Company: companyAddress
            ? `${companyAddress.id}:${companyAddress.Name}`
            : "",

          CompanyAddress: companyAddress?.Address,
          CardID: companyAddress?.CardID,
          Phone: companyAddress?.Phone,

          uniqueRowId: `${row.No}:${productName}`,

          TruckType: matchedTrip?.TruckType,
        });
      }
    }

    // 🔽 sort เร็วขึ้น (คำนวณ key ครั้งเดียว)
    result.sort((a, b) => {
      const keyA = `${a.Date}|${a.Driver}|${a.Registration}`;
      const keyB = `${b.Date}|${b.Driver}|${b.Registration}`;

      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;

      const indexA = productOrder.indexOf(a.ProductName);
      const indexB = productOrder.indexOf(b.ProductName);

      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    return result;
  };

  const processedTickets = processTickets(ticketsList, showTrips);

  console.log("processedTickets  : ", processedTickets);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [d, m, y] = dateStr.split("/");
    return new Date(`${y}-${m}-${d}`);
  };

  const getCompanyByDate = (company, date) => {
    const start = parseDate(company?.DateStart);

    if (start && date < start && company?.History) {
      const histories = Object.values(company.History);

      const match = histories.find((h) => {
        const s = parseDate(h.DateStart);
        const e = parseDate(h.DateEnd);

        return (!s || date >= s) && (!e || date <= e);
      });

      if (match) {
        return {
          ...match,
          Name:
            company?.id === 3
              ? "หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)"
              : match.Name,
        };
      }

      // กรณีเข้าเงื่อนไข date < DateStart แต่ไม่เจอ history
      if (company?.id === 3) {
        return {
          ...company,
          Name: "บริษัท พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)",
        };
      }
    }

    // กรณีใช้ข้อมูลปัจจุบัน
    if (company?.id === 3) {
      return {
        ...company,
        Name: "บริษัท พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)",
      };
    }

    return company;
  };

  const getInvoiceDate = (t) => {
    // t.Company is a locally-reconstructed "id:Name" composite (see resetNo);
    // invoice.Transport is a real company uuid - resolve to the same uuid.
    const transportUuid = companies.find(
      (c) => c.id === Number(t.Company?.split(":")[0]),
    )?.uuid;
    const invoice = invoiceDetail.find(
      (row) =>
        String(row.TicketNo) === String(ticket?.No) &&
        String(row.TicketName) === String(ticket?.TicketName) &&
        row.Transport === transportUuid &&
        row.TicketType !== "ตั๋วรถใหญ่" &&
        row.TicketType !== "ตั๋วรถเล็ก",
    );

    return invoice?.DateStart ? parseDate(invoice.DateStart) : new Date();
  };

  // แยก processedTickets ออกเป็น 2 ส่วนตาม Company และเริ่ม No ใหม่ให้แต่ละส่วน
  const splitByCompany = (processedTickets) => {
    const company1Tickets = processedTickets.filter(
      (row) => row.Company.split(":")[0] === "2",
    );
    const company2Tickets = processedTickets.filter(
      (row) => row.Company.split(":")[0] === "3",
    );

    // รีเซ็ต No ให้กับแต่ละส่วน
    const resetNo = (tickets) => {
      return tickets.map((row, index) => {
        const companyCode = row.Company.split(":")[0];

        const company = companies.find((c) => String(c.id) === companyCode);

        const invoiceDate = getInvoiceDate(row);

        const companyData = getCompanyByDate(company, invoiceDate);

        return {
          ...row,
          No: index + 1,
          companyData: companyData,
          Company: `${company?.id}:${companyData?.Name || ""}`,
          Address: companyData?.Address || "",
          CardID: companyData?.CardID || "",
        };
      });
    };

    return {
      company1Tickets: resetNo(company1Tickets),
      company2Tickets: resetNo(company2Tickets),
    };
  };

  // แยกข้อมูลออกเป็น 2 ส่วน
  const { company1Tickets, company2Tickets } = splitByCompany(processedTickets);

  const calculateTotal = (tickets) => {
    const result = tickets.reduce(
      (acc, row) => {
        const amount = Number((row.Volume * row.Rate).toFixed(2));

        const tax = Number((amount * 0.01).toFixed(2));

        const payment = Number((amount - tax).toFixed(2));

        const totalIncomingMoney = Array.isArray(ticket.Price)
          ? ticket.Price.filter((p) => p.Transport === row.Company).reduce(
              (sum, p) => sum + (Number(p.IncomingMoney) || 0),
              0,
            )
          : 0;

        acc.totalVolume = Number((acc.totalVolume + row.Volume).toFixed(2));

        acc.transferAmount = Number(
          (acc.transferAmount + (row.TransferAmount || 0)).toFixed(2),
        );

        acc.totalAmount = Number((acc.totalAmount + amount).toFixed(2));

        acc.totalTax = Number((acc.totalTax + tax).toFixed(2));

        acc.totalPayment = Number((acc.totalPayment + payment).toFixed(2));

        acc.totalIncomingMoney = Number(totalIncomingMoney.toFixed(2));

        return acc;
      },
      {
        totalVolume: 0,
        transferAmount: 0,
        totalAmount: 0,
        totalTax: 0,
        totalPayment: 0,
        totalIncomingMoney: 0,
      },
    );

    result.totalOverdueTransfer = Number(
      (result.totalPayment - result.totalIncomingMoney).toFixed(2),
    );

    return result;
  };

  // คำนวณผลรวมสำหรับทั้งสองบริษัท
  const total1 = calculateTotal(company1Tickets);
  const total2 = calculateTotal(company2Tickets);

  console.log("บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)", company1Tickets);
  console.log("บริษัท พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)", company2Tickets);

  console.log("Total for บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)", total1);
  console.log("Total for บริษัท พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)", total2);

  console.log("invoiceDetail : ", invoiceDetail);
  console.log("ticket No : ", ticket?.No);
  console.log("ticket Name : ", ticket?.TicketName);
  console.log("Company 1 : ", company1Tickets[0]?.Company);
  console.log("Company 2 : ", company2Tickets[0]?.Company);

  const invoices = invoiceDetail.filter(
    (row) =>
      String(row.TicketNo) === String(ticket?.No) &&
      String(row.TicketName) === String(ticket?.TicketName),
  );

  // company1Tickets[0].Company / company2Tickets[0].Company are locally
  // reconstructed "id:Name" composites (see resetNo above); invoice.Transport
  // is a real company uuid - resolve both sides to the same uuid to compare.
  const company1TransportUuid = companies.find(
    (c) => c.id === Number(company1Tickets[0]?.Company?.split(":")[0]),
  )?.uuid;
  const company2TransportUuid = companies.find(
    (c) => c.id === Number(company2Tickets[0]?.Company?.split(":")[0]),
  )?.uuid;

  const invoices1 = invoices.filter(
    (row) => row.Transport === company1TransportUuid,
  );

  const invoices2 = invoices.filter(
    (row) => row.Transport === company2TransportUuid,
  );

  // const invoices1 = invoiceDetail.filter((row) =>
  //     String(row.TicketNo) === String(ticket?.No) &&
  //     String(row.TicketName) === String(ticket?.TicketName) &&
  //     String(row.Transport) === String(company1Tickets[0]?.Company)
  // );

  // const invoices2 = invoiceDetail.filter((row) =>
  //     String(row.TicketNo) === String(ticket?.No) &&
  //     String(row.TicketName) === String(ticket?.TicketName) &&
  //     String(row.Transport) === String(company2Tickets[0]?.Company)
  // );

  console.log("invoices1 : ", invoices1);
  console.log("invoices2 : ", invoices2);

  console.log("TicketName : ", ticket);

  const generatePDFCompany1 = () => {
    let Code = "";
    if (invoices1.length !== 0) {
      Code = `${invoices1[0]?.Code}-${invoices1[0]?.Number}`;
    } else {
      const lastItemInvoice = invoiceDetail[invoiceDetail.length - 1];
      let newNumberInvoice = 1;
      if (
        lastItemInvoice &&
        lastItemInvoice.Number &&
        lastItemInvoice.Code === `lV${currentCode}`
      ) {
        newNumberInvoice = Number(lastItemInvoice.Number) + 1;
      }
      const formattedNumberInvoice = String(newNumberInvoice).padStart(4, "0");

      Code = `lV${currentCode}-${formattedNumberInvoice}`;

      // company1Tickets[0].Company is a locally-reconstructed "id:Name"
      // composite (see resetNo above) - resolve it to the real company uuid
      // invoice.Transport now expects.
      const transportCompanyId1 = Number(
        company1Tickets[0]?.Company?.split(":")[0],
      );
      const transportUuid1 = companies.find(
        (c) => c.id === transportCompanyId1,
      )?.uuid;

      apiPost("/api/invoice", {
        id: invoiceDetail.length,
        Code: `lV${currentCode}`,
        Number: formattedNumberInvoice,
        DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
        Transport: transportUuid1 || null,
        TicketName: ticket.TicketName,
        TicketNo: ticket.No,
        TicketType: ticket.CustomerType,
      })
        .then(() => {
          console.log("บันทึกข้อมูลเรียบร้อย ✅");
          refetchTripData?.();
        })
        .catch((error) => {
          ShowError("ไม่สำเร็จ");
          console.error("Error updating data:", error);
        });
    }

    const invoiceData = {
      Report: company1Tickets,
      Total: total1,
      CompanyID: Number(company1Tickets[0]?.Company.split(":")[0]),
      Company: company1Tickets[0]?.Company.split(":")[1],
      Address: company1Tickets[0]?.CompanyAddress,
      CardID: company1Tickets[0]?.CardID,
      Phone: company1Tickets[0]?.Phone,
      Code: Code,
      Date: invoices1[0]?.DateStart ?? dayjs(new Date()).format("DD/MM/YYYY"),
      Transport: invoices1[0]?.Transport,
      TicketName: ticket.TicketName,
      TicketAddress: ticket.TicketAddress,
      DateStart: ticket.DateStart,
      DateEnd: ticket.DateEnd,
      CompanyName: ticket.CompanyName,
      CompanyAddress: ticket.CompanyAddress,
      CodeIDCustomer: ticket.CodeID,
      DueDateMode: dueDateMode,
      ManualDueDate: dueDateMode === "manual" ? manualDueDate : null,
      CreditTime: ticket.CreditTime,
      // DateStart: ticket.Date,
      // DateEnd: calculateDueDate(ticket.Date, ticket.CreditTime)
    };

    // บันทึกข้อมูลลง sessionStorage
    sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

    // เปิดหน้าต่างใหม่ไปที่ /print-invoice
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = 820;
    const windowHeight = 559;

    const left = (screenWidth - windowWidth) / 2;
    const top = (screenHeight - windowHeight) / 2;

    const printWindow = window.open(
      "/print-report",
      "_blank",
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`,
    );

    if (!printWindow) {
      alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
    }
  };

  const generatePDFCompany2 = () => {
    let Code = "";
    if (invoices2.length !== 0) {
      Code = `${invoices2[0]?.Code}-${invoices2[0]?.Number}`;
    } else {
      const lastItemInvoice = invoiceDetail[invoiceDetail.length - 1];
      let newNumberInvoice = 1;
      if (
        lastItemInvoice &&
        lastItemInvoice.Number &&
        lastItemInvoice.Code === `lV${currentCode}`
      ) {
        newNumberInvoice = Number(lastItemInvoice.Number) + 1;
      }
      const formattedNumberInvoice = String(newNumberInvoice).padStart(4, "0");

      Code = `lV${currentCode}-${formattedNumberInvoice}`;

      const transportCompanyId2 = Number(
        company2Tickets[0]?.Company?.split(":")[0],
      );
      const transportUuid2 = companies.find(
        (c) => c.id === transportCompanyId2,
      )?.uuid;

      apiPost("/api/invoice", {
        id: invoiceDetail.length,
        Code: `lV${currentCode}`,
        Number: formattedNumberInvoice,
        DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
        Transport: transportUuid2 || null,
        TicketName: ticket.TicketName,
        TicketNo: ticket.No,
        TicketType: ticket.CustomerType,
      })
        .then(() => {
          console.log("บันทึกข้อมูลเรียบร้อย ✅");
          refetchTripData?.();
        })
        .catch((error) => {
          ShowError("ไม่สำเร็จ");
          console.error("Error updating data:", error);
        });
    }

    const invoiceData = {
      Report: company2Tickets,
      Total: total2,
      CompanyID: Number(company2Tickets[0]?.Company.split(":")[0]),
      Company: company2Tickets[0]?.Company.split(":")[1],
      Address: company2Tickets[0]?.CompanyAddress,
      CardID: company2Tickets[0]?.CardID,
      Phone: company2Tickets[0]?.Phone,
      Code: Code,
      Date: invoices2[0]?.DateStart ?? dayjs(new Date()).format("DD/MM/YYYY"),
      Transport: invoices2[0]?.Transport,
      TicketName: ticket.TicketName,
      TicketAddress: ticket.TicketAddress,
      DateStart: ticket.DateStart,
      DateEnd: ticket.DateEnd,
      CompanyName: ticket.CompanyName,
      CompanyAddress: ticket.CompanyAddress,
      CodeIDCustomer: ticket.CodeID,
      DueDateMode: dueDateMode,
      ManualDueDate: dueDateMode === "manual" ? manualDueDate : null,
      CreditTime: ticket.CreditTime,
      // DateStart: ticket.Date,
      // DateEnd: calculateDueDate(ticket.Date, ticket.CreditTime)
    };

    // บันทึกข้อมูลลง sessionStorage
    sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

    // เปิดหน้าต่างใหม่ไปที่ /print-invoice
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = 820;
    const windowHeight = 559;

    const left = (screenWidth - windowWidth) / 2;
    const top = (screenHeight - windowHeight) / 2;

    const printWindow = window.open(
      "/print-report",
      "_blank",
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`,
    );

    if (!printWindow) {
      alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
    }
  };

  console.log("Report : ", report);
  console.log("price : ", price);
  console.log("tickets : ", ticket);

  const handleSaveTranfer = async () => {
    if (tranferID === null) {
      ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
      return;
    }

    const updatedData = {
      DateStart: tranferDateStart,
      BankName: tranferBankName,
      Transport: transport,
      IncomingMoney: tranferIncomingMoney,
      Note: tranferNote,
    };

    try {
      await apiPut(`/api/transfermoney/${tranferID}`, updatedData);
      ShowSuccess("บันทึกข้อมูลเรียบร้อย");
      refetchTripData?.();
      setUpdateTranfer(false);
      setTranferID(null);
      setTranferDateStart("");
      setTranferBankName("");
      setTransport("");
      setTranferIncomingMoney("");
      setTranferNote("");
    } catch (error) {
      ShowError("ไม่สำเร็จ");
      console.error("Error updating data:", error);
    }
  };

  const handleDeleteReport = (newID) => {
    if (newID === null) {
      ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
      return;
    }

    ShowConfirm(
      "คุณต้องการยกเลิกรายการนี้ใช่หรือไม่?",
      async () => {
        // ✅ ถ้ากดยืนยัน
        try {
          await apiPut(`/api/transfermoney/${newID}`, { Status: "ยกเลิก" });
          ShowSuccess("บันทึกข้อมูลเรียบร้อย");
          refetchTripData?.();
        } catch (error) {
          ShowError("ไม่สำเร็จ");
          console.error("Error updating data:", error);
        }
      },
      () => {
        // ❌ ถ้ากดยกเลิก
        console.log("ยกเลิกการลบข้อมูล ❌");
      },
    );
  };

  const handleSave = async () => {
    // Product is a single JSONB column, and several report rows can touch
    // different products on the SAME ticket in one save - merge all of them
    // per ticket first, then issue one PUT per ticket, so a later write in
    // this loop never clobbers an earlier one against a stale Product value.
    const mergedProductByTicketUuid = new Map();

    for (const data of Object.values(report)) {
      if (
        data.No == null ||
        data.ProductName == null ||
        data.ProductName.trim() === ""
      ) {
        console.log("ไม่พบ id หรือ ProductName");
        continue;
      }

      const ticketRow = showTickets.find((t) => t.No === data.No);
      if (!ticketRow?.uuid) {
        console.log("ไม่พบตั๋วที่ No", data.No);
        continue;
      }

      if (!mergedProductByTicketUuid.has(ticketRow.uuid)) {
        mergedProductByTicketUuid.set(
          ticketRow.uuid,
          structuredClone(ticketRow.Product || {}),
        );
      }
      const mergedProduct = mergedProductByTicketUuid.get(ticketRow.uuid);
      mergedProduct[data.ProductName] = {
        ...mergedProduct[data.ProductName],
        RateOil: data.Price,
        Amount: data.Amount,
        OverdueTransfer: data.Amount,
      };
    }

    try {
      for (const [uuid, mergedProduct] of mergedProductByTicketUuid) {
        await apiPut(`/api/tickets/${uuid}`, { Product: mergedProduct });
      }
      console.log("บันทึกข้อมูลเรียบร้อย ✅");
      refetchTripData?.();
    } catch (error) {
      ShowError("เพิ่มข้อมูลไม่สำเร็จ");
      console.error("Error pushing data:", error);
    }
  };

  const handlePost = () => {
    setPrice((prevPrice) => {
      const newIndex =
        prevPrice.length > 0
          ? Math.max(...prevPrice.map((item) => Number(item.id))) + 1
          : 0;
      const newRow = {
        id: newIndex,
        DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
        BankName: "",
        Transport: "",
        IncomingMoney: "",
        Note: "",
      };
      return [...prevPrice, newRow];
    });
  };

  const handleChange = (field, value) => {
    setPrice((prev) => ({
      ...prev,
      [field]:
        field === "DateStart" ? dayjs(value).format("DD/MM/YYYY") : value,
    }));
  };

  // ลบแถวออกจาก price
  const handleDelete = (indexToDelete) => {
    setPrice((prev) => {
      const newPrice = prev
        .filter((row) => row.id !== indexToDelete) // กรองเอาอันที่ต้องการลบออก
        .map((row, newIndex) => ({ ...row, id: newIndex })); // รีเซ็ต id ใหม่

      return newPrice;
    });
  };

  const handleNewInvoice1 = async () => {
    if (!invoices1[0]?.uuid) {
      ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
      return;
    }
    try {
      await apiPut(`/api/invoice/${invoices1[0].uuid}`, { TicketNo: "ยกเลิก" });
      ShowSuccess("บันทึกข้อมูลเรียบร้อย");
      refetchTripData?.();
    } catch (error) {
      ShowError("ไม่สำเร็จ");
      console.error("Error updating data:", error);
    }
  };

  const handleNewInvoice2 = async () => {
    if (!invoices2[0]?.uuid) {
      ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
      return;
    }
    try {
      await apiPut(`/api/invoice/${invoices2[0].uuid}`, { TicketNo: "ยกเลิก" });
      ShowSuccess("บันทึกข้อมูลเรียบร้อย");
      refetchTripData?.();
    } catch (error) {
      ShowError("ไม่สำเร็จ");
      console.error("Error updating data:", error);
    }
  };

  const handleSubmit = async () => {
    const newId = transferMoneyDetail.length;
    const total = Number(newNumber) + 1;

    const newPrice = {
      ...price,
      id: newId,
      month: months,
      Number: formattedNumber,
    };

    try {
      await apiPost("/api/transfermoney", newPrice);
      ShowSuccess("บันทึกข้อมูลเรียบร้อย");
      refetchTripData?.();

      // เตรียมค่าใหม่สำหรับ price หลังบันทึก
      const nextFormattedNumber = String(total).padStart(4, "0");
      setPrice({
        ...newPrice,
        id: newId + 1,
        Number: nextFormattedNumber,
        IncomingMoney: "",
        BankName: "",
        Transport: "",
      });
    } catch (error) {
      ShowError("ไม่สำเร็จ");
      console.error("Error updating data:", error);
    }
  };

  // const handleSubmit = () => {
  //     database
  //         .ref("transfermoney/")
  //         .child(transferMoneyDetail.length)
  //         .set(price) // ใช้ .set() แทน .update() เพื่อแทนที่ข้อมูลทั้งหมด
  //         .then(() => {
  //             let total = Number(newNumber) + 1
  //             let formattedNumber = String(total).padStart(4, "0");
  //             ShowSuccess("บันทึกข้อมูลเรียบร้อย");
  //             console.log("บันทึกข้อมูลเรียบร้อย ✅");
  //             setPrice({
  //                 id: transferMoneyDetail.length,
  //                 Code: currentCode,
  //                 Number: formattedNumber,
  //                 DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
  //                 BankName: "",
  //                 Transport: "",
  //                 IncomingMoney: "",
  //                 TicketName: ticket.TicketName,
  //                 TicketNo: ticket.No,
  //                 TicketType: ticket.CustomerType,
  //                 Note: "",
  //             })
  //         })
  //         .catch((error) => {
  //             ShowError("ไม่สำเร็จ");
  //             console.error("Error updating data:", error);
  //         });
  // }

  const rowSpanMap1 = company1Tickets.reduce((acc, row) => {
    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const rowSpanMap2 = company2Tickets.reduce((acc, row) => {
    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  let mergedCells1 = {};
  let mergedCells2 = {};
  let displayIndex1 = 0;
  let displayIndex2 = 0;
  let groupTotals1 = {};
  let groupTotals2 = {};

  const formatNumber = (value) =>
    value === 0 || value === "0"
      ? "0"
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

  console.log("Show Company 1 ", company1Tickets);
  console.log("show company 2 ", company2Tickets);
  console.log("Ticket: ", ticket);
  console.log("transfer : ", transfer);

  return (
    <React.Fragment>
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={1}>
          <Grid item md={7} xs={12}>
            <Typography
              variant="subtitle1"
              sx={{ marginBottom: -1, fontSize: "18px" }}
              fontWeight="bold"
              gutterBottom
            >
              รายละเอียด : วันที่ส่ง :{" "}
              {formatThaiFullYear(dayjs(ticket.DateStart, "DD/MM/YYYY"))} ถึง{" "}
              {formatThaiFullYear(dayjs(ticket.DateEnd, "DD/MM/YYYY"))}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ marginBottom: -2, fontSize: "18px" }}
              fontWeight="bold"
              gutterBottom
            >
              จากตั๋ว : {ticket.TicketNameName}
            </Typography>
          </Grid>
          {windowWidth >= 900 && (
            <Grid item md={5} xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  marginBottom: -3,
                  fontSize: "12px",
                  color: "red",
                  textAlign: "right",
                }}
                gutterBottom
              >
                *พิมพ์ใบวางบิลของบจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่) ตรงนี้*
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                mb: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <EventIcon color="action" fontSize="small" />
                <Typography variant="body2" fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                  กำหนดชำระเงินบนใบวางบิล :
                </Typography>
              </Box>
              <RadioGroup
                row
                value={dueDateMode}
                onChange={(e) => setDueDateMode(e.target.value)}
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
              >
                <FormControlLabel value="fixed" control={<Radio size="small" />} label={`ตามที่กำหนดไว้ (วันที่วางบิล + เครดิต ${ticket.CreditTime || 0} วัน ตามประเภทตั๋วนี้)`} />
                <FormControlLabel value="manual" control={<Radio size="small" />} label="กำหนดเอง" />
                <FormControlLabel value="none" control={<Radio size="small" />} label="ไม่ระบุวันที่" />
              </RadioGroup>
              {dueDateMode === "manual" && (
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                  <DatePicker
                    openTo="day"
                    views={["year", "month", "day"]}
                    value={dayjs(manualDueDate, "DD/MM/YYYY")}
                    onChange={(newValue) =>
                      newValue && setManualDueDate(dayjs(newValue).format("DD/MM/YYYY"))
                    }
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
                  />
                </LocalizationProvider>
              )}
            </Paper>
          </Grid>

          <Grid item md={5.5} xs={12}>
            <Typography
              variant="subtitle1"
              sx={{ marginTop: 1, fontSize: "18px" }}
              fontWeight="bold"
              gutterBottom
            >
              บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)
            </Typography>
          </Grid>
          <Grid item md={2} xs={12}>
            <Typography
              variant="subtitle2"
              color="error"
              fontWeight="bold"
              sx={{ fontSize: "12px", mt: -1 }}
              gutterBottom
            >
              *ถ้าต้องการรีเซ็ตวันที่วางบิลให้กด NEW *
            </Typography>
            <Button
              variant="contained"
              color="info"
              sx={{ height: "25px", fontWeight: "bold", mt: -2 }}
              disabled
            >
              {invoices1
                ? `วันที่วางบิล ${invoices1[0]?.DateStart === undefined ? "-" : invoices1[0]?.DateStart}`
                : ""}
            </Button>
          </Grid>
          <Grid item md={3} xs={8} textAlign="right">
            <Grid container sx={{ marginTop: 1 }}>
              <Grid item xs={3}>
                <Button
                  variant="contained"
                  color="info"
                  sx={{ height: "25px", marginRight: 1 }}
                  onClick={handleNewInvoice1}
                >
                  NEW
                </Button>
              </Grid>
              <Grid item xs={5}>
                <Paper component="form" sx={{ width: "100%" }}>
                  <TextField
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      sx: {
                        fontSize: "14px",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px", // ขนาด font เวลาพิมพ์
                        textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                        marginLeft: -1,
                      },
                    }}
                    value={invoices1[0]?.Code || `lV${currentCode}`}
                  />
                </Paper>
              </Grid>
              <Grid item xs={0.5}>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  -{" "}
                </Typography>
              </Grid>
              <Grid item xs={3.5}>
                <Paper component="form" sx={{ width: "100%" }}>
                  <TextField
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      sx: {
                        fontSize: "14px",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px", // ขนาด font เวลาพิมพ์
                        marginRight: -2,
                      },
                      marginRight: 1,
                    }}
                    value={invoices1[0]?.Number || ""}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={1.5} xs={4}>
            <Tooltip title="พิมพ์ใบวางบิล" placement="top">
              <Button
                color="primary"
                variant="contained"
                fullWidth
                sx={{
                  flexDirection: "row",
                  gap: 0.5,
                  borderRadius: 2,
                }}
                onClick={generatePDFCompany1}
              >
                <PrintIcon sx={{ color: "white" }} />
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  พิมพ์ใบวางบิล
                </Typography>
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
        <Paper
          className="custom-scrollbar"
          sx={{
            position: "relative",
            maxWidth: "100%",
            height: "300px", // ความสูงรวมของ container หลัก
            overflow: "hidden",
            marginBottom: 0.5,
            overflowX: "auto",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "35px",
              zIndex: 3,
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": { padding: "1px" },
                width: "1250px",
              }}
            >
              <TableHead>
                {/* <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ลำดับ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        วันที่
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        พขร
                                    </TablecellSelling>
                                    <TableCellG95 sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px' }}>
                                        G95
                                    </TableCellG95>
                                    <TableCellB95 sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px' }}>
                                        B95
                                    </TableCellB95>
                                    <TableCellB7 sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px' }}>
                                        B7(D)
                                    </TableCellB7>
                                    <TableCellG91 sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px' }}>
                                        G91
                                    </TableCellG91>
                                    <TableCellE20 sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px' }}>
                                        E20
                                    </TableCellE20>
                                    <TableCellPWD sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px' }}>
                                        PWD
                                    </TableCellPWD>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        จำนวนลิตร
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ค่าบรรทุก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 120, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดเงิน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 70, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        หักภาษี 1%
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดชำระ
                                    </TablecellSelling>
                                </TableRow> */}
                <TableRow>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 50,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ลำดับ
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    วันที่
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 300,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ทะเบียนรถ
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ชนิดน้ำมัน
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 150,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    จำนวนลิตร
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ค่าบรรทุก
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 150,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ยอดเงิน
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    หักภาษี 1%
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ยอดชำระ
                  </TablecellSelling>
                </TableRow>
              </TableHead>
            </Table>
          </Box>
          <Box
            className="custom-scrollbar"
            sx={{
              position: "absolute",
              top: "35px", // เริ่มจากด้านล่าง header
              bottom: "35px", // จนถึงด้านบนของ footer
              overflowY: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": { padding: "1px" },
                width: "1250px",
              }}
            >
              <TableBody>
                {/* {company1Tickets.map((row, index) => {
                                    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
                                    const rowSpan = rowSpanMap1[key] && !mergedCells1[key] ? rowSpanMap1[key] : 0;
                                    if (rowSpan) {
                                        mergedCells1[key] = true;
                                        displayIndex1++;
                                    }

                                    return (
                                        <TableRow key={`${row.TicketName}-${row.ProductName}-${index}`}>
                                            {rowSpan > 0 && (
                                                <TableCell rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 50, verticalAlign: "middle" }}>
                                                    {displayIndex1}
                                                </TableCell>
                                            )}
                                            {rowSpan > 0 && (
                                                <TableCell
                                                    rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 100, verticalAlign: "middle" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                        {row.Date}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            {rowSpan > 0 && (
                                                <TableCell
                                                    rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 150, verticalAlign: "middle" }}
                                                >
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                        {row.RegistrationName}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            <TableCell sx={{
                                                textAlign: "center", height: '30px', width: 100,
                                                backgroundColor: row.ProductName === "G91" ? "#92D050" :
                                                    row.ProductName === "G95" ? "#FFC000" :
                                                        row.ProductName === "B7" ? "#FFFF99" :
                                                            row.ProductName === "B95" ? "#B7DEE8" :
                                                                row.ProductName === "B10" ? "#32CD32" :
                                                                    row.ProductName === "B20" ? "#228B22" :
                                                                        row.ProductName === "E20" ? "#C4BD97" :
                                                                            row.ProductName === "E85" ? "#0000FF" :
                                                                                row.ProductName === "PWD" ? "#F141D8" :
                                                                                    "#FFFFFF"
                                            }}>
                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {row.ProductName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(row.Volume)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(row.Volume * row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format((row.Volume * row.Rate) * (0.01))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format((row.Volume * row.Rate) - ((row.Volume * row.Rate) * (0.01)))}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })} */}
                {company1Tickets.map((row, index) => {
                  const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
                  const rowSpan =
                    rowSpanMap1[key] && !mergedCells1[key]
                      ? rowSpanMap1[key]
                      : 0;

                  if (rowSpan) {
                    mergedCells1[key] = true;
                    displayIndex1++;
                  }

                  // รวมค่าต่อกลุ่ม
                  if (!groupTotals1[key]) {
                    groupTotals1[key] = {
                      volume: 0,
                      amount: 0,
                    };
                  }

                  const total = row.Volume * row.Rate;
                  groupTotals1[key].volume += row.Volume;
                  groupTotals1[key].amount += total;

                  // ตรวจว่าเป็นแถวสุดท้ายของกลุ่ม
                  const nextRow = company1Tickets[index + 1];
                  const nextKey = nextRow
                    ? `${nextRow.Date} : ${nextRow.Driver} : ${nextRow.Registration}`
                    : null;
                  const isLastInGroup = key !== nextKey;

                  return (
                    <React.Fragment
                      key={`${row.TicketName}-${row.ProductName}-${index}`}
                    >
                      <TableRow>
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan + 1}
                            sx={{
                              textAlign: "center",
                              height: "30px",
                              width: 50,
                              verticalAlign: "middle",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            {displayIndex1}
                          </TableCell>
                        )}
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan + 1}
                            sx={{
                              textAlign: "center",
                              height: "30px",
                              width: 100,
                              verticalAlign: "middle",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontSize="14px"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}
                            </Typography>
                          </TableCell>
                        )}
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan + 1}
                            sx={{
                              textAlign: "center",
                              height: "30px",
                              width: 300,
                              verticalAlign: "middle",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontSize="14px"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {row.TruckType === "รถใหญ่"
                                ? ` ${row.RegistrationName} / ${row.RegTailName || ""}`
                                : row.TruckType === "รถเล็ก"
                                  ? `${row.ShortName}${row.RegistrationName}`
                                  : "รถรับจ้างขนส่ง"}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 100,
                            backgroundColor:
                              row.ProductName === "G91"
                                ? "#92D050"
                                : row.ProductName === "G95"
                                  ? "#FFC000"
                                  : row.ProductName === "B7"
                                    ? "#FFFF99"
                                    : row.ProductName === "B95"
                                      ? "#B7DEE8"
                                      : row.ProductName === "B10"
                                        ? "#32CD32"
                                        : row.ProductName === "B20"
                                          ? "#228B22"
                                          : row.ProductName === "E20"
                                            ? "#C4BD97"
                                            : row.ProductName === "E85"
                                              ? "#0000FF"
                                              : row.ProductName === "PWD"
                                                ? "#F141D8"
                                                : row.ProductName === "B20"
                                                  ? "#FF7F50"
                                                  : "#FFFFFF",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            fontWeight="bold"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {row.ProductName}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 150,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(row.Volume)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 100,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {row.Rate}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 150,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(total)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 100,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(total * 0.01)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 100,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(total * 0.99)}
                          </Typography>
                        </TableCell>
                      </TableRow>

                      {isLastInGroup && (
                        <TableRow>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            รวม
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "right",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                              paddingLeft: "20px !important",
                              paddingRight: "20px !important",
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                            }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(groupTotals1[key].volume)}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                            }}
                          />
                          <TableCell
                            sx={{
                              textAlign: "right",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                              paddingLeft: "20px !important",
                              paddingRight: "20px !important",
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                            }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(groupTotals1[key].amount)}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                            }}
                          />
                          <TableCell
                            sx={{
                              textAlign: "right",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                              paddingLeft: "20px !important",
                              paddingRight: "20px !important",
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                            }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(groupTotals1[key].amount * 0.99)}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
          >
            <Grid
              container
              spacing={2}
              sx={{
                backgroundColor: "#616161",
                color: "white",
                paddingLeft: 2,
                paddingRight: 2,
                width: "1270px",
              }}
            >
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      รวมลิตร
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total1.totalVolume)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalVolume)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ยอดเงิน
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total1.totalAmount)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalAmount)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5.5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      หักภาษี 1%
                    </Typography>
                  </Grid>
                  <Grid item xs={6.5}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total1.totalTax)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalTax)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ยอดชำระ
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total1.totalPayment)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalPayment)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ยอดโอน
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(CountCompany1)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalVolume)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ค้างโอน
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(
                          Math.abs(
                            Number(total1.totalPayment) - Number(CountCompany1),
                          ) < 1e-6
                            ? 0
                            : Number(total1.totalPayment) -
                                Number(CountCompany1),
                        )}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalVolume)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 550, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={4}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            รวม
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 150, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalVolume)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 250, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalAmount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 200, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total1.totalPayment)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table> */}
          </Box>
        </Paper>
      </Box>
      <Box marginTop={3} sx={{ width: "100%" }}>
        <Grid container spacing={1}>
          {windowWidth >= 900 && (
            <Grid item md={12} xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  fontSize: "12px",
                  color: "red",
                  textAlign: "right",
                  marginBottom: -1,
                }}
                gutterBottom
              >
                *พิมพ์ใบวางบิลของบริษัท พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)
                ตรงนี้*
              </Typography>
            </Grid>
          )}
          <Grid item md={5.5} xs={12}>
            <Typography
              variant="subtitle1"
              sx={{ marginTop: 1, fontSize: "18px" }}
              fontWeight="bold"
              gutterBottom
            >
              บริษัท พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)
            </Typography>
          </Grid>
          <Grid item md={2} xs={12}>
            <Typography
              variant="subtitle2"
              color="error"
              fontWeight="bold"
              sx={{ fontSize: "12px", mt: -1 }}
              gutterBottom
            >
              *ถ้าต้องการรีเซ็ตวันที่วางบิลให้กด NEW *
            </Typography>
            <Button
              variant="contained"
              color="info"
              sx={{ height: "25px", fontWeight: "bold", mt: -2 }}
              disabled
            >
              {invoices2
                ? `วันที่วางบิล ${invoices2[0]?.DateStart === undefined ? "-" : invoices2[0]?.DateStart}`
                : ""}
            </Button>
          </Grid>
          <Grid item md={3} xs={8} textAlign="right">
            <Grid container sx={{ marginTop: 1 }}>
              <Grid item xs={3}>
                <Button
                  variant="contained"
                  color="info"
                  sx={{ height: "25px", marginRight: 1 }}
                  onClick={handleNewInvoice2}
                >
                  NEW
                </Button>
              </Grid>
              <Grid item xs={5}>
                <Paper component="form" sx={{ width: "100%" }}>
                  <TextField
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      sx: {
                        fontSize: "14px",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px", // ขนาด font เวลาพิมพ์
                        textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                        marginLeft: -1,
                      },
                    }}
                    value={invoices2[0]?.Code || `lV${currentCode}`}
                  />
                </Paper>
              </Grid>
              <Grid item xs={0.5}>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  -{" "}
                </Typography>
              </Grid>
              <Grid item xs={3.5}>
                <Paper component="form" sx={{ width: "100%" }}>
                  <TextField
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      sx: {
                        fontSize: "14px",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px", // ขนาด font เวลาพิมพ์
                        marginRight: -2,
                      },
                      marginRight: 1,
                    }}
                    value={invoices2[0]?.Number || ""}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={1.5} xs={4}>
            <Tooltip title="พิมพ์ใบวางบิล" placement="top">
              <Button
                color="primary"
                variant="contained"
                fullWidth
                sx={{
                  flexDirection: "row",
                  gap: 0.5,
                  borderRadius: 2,
                }}
                onClick={generatePDFCompany2}
              >
                <PrintIcon sx={{ color: "white" }} />
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  พิมพ์ใบวางบิล
                </Typography>
              </Button>
            </Tooltip>
          </Grid>
          {/* <Grid item xs={1.5}>
                        <Tooltip title="พิมพ์ใบวางบิล" placement="top">
                            <Button
                                color="primary"
                                variant='contained'
                                fullWidth
                                sx={{
                                    flexDirection: "row",
                                    gap: 0.5,
                                    borderRadius: 2
                                }}
                                onClick={generatePDFCompany2}
                            >
                                <PrintIcon sx={{ color: "white" }} />
                                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                    พิมพ์ใบวางบิล
                                </Typography>
                            </Button>
                        </Tooltip>
                    </Grid> */}
        </Grid>
        <Paper
          className="custom-scrollbar"
          sx={{
            position: "relative",
            maxWidth: "100%",
            height: "300px", // ความสูงรวมของ container หลัก
            overflow: "hidden",
            marginBottom: 0.5,
            overflowX: "auto",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "35px",
              zIndex: 3,
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": { padding: "1px" },
                width: "1250px",
              }}
            >
              <TableHead>
                <TableRow>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 50,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ลำดับ
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    วันที่
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 300,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ทะเบียนรถ
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ชนิดน้ำมัน
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 150,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    จำนวนลิตร
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ค่าบรรทุก
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 150,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ยอดเงิน
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    หักภาษี 1%
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "35px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ยอดชำระ
                  </TablecellSelling>
                </TableRow>
              </TableHead>
            </Table>
          </Box>
          <Box
            className="custom-scrollbar"
            sx={{
              position: "absolute",
              top: "35px", // เริ่มจากด้านล่าง header
              bottom: "35px", // จนถึงด้านบนของ footer
              overflowY: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": { padding: "1px" },
                width: "1250px",
              }}
            >
              <TableBody>
                {company2Tickets.map((row, index) => {
                  const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
                  const rowSpan =
                    rowSpanMap2[key] && !mergedCells2[key]
                      ? rowSpanMap2[key]
                      : 0;
                  if (rowSpan) {
                    mergedCells2[key] = true;
                    displayIndex2++;
                  }

                  // รวมค่าต่าง ๆ ต่อกลุ่ม
                  if (!groupTotals2[key]) {
                    groupTotals2[key] = { volume: 0, amount: 0 };
                  }
                  const total = row.Volume * row.Rate;
                  groupTotals2[key].volume += row.Volume;
                  groupTotals2[key].amount += total;

                  // คำนวณว่าเป็นแถวสุดท้ายของกลุ่มหรือไม่
                  const nextRow = company2Tickets[index + 1];
                  const nextKey = nextRow
                    ? `${nextRow.Date} : ${nextRow.Driver} : ${nextRow.Registration}`
                    : null;
                  const isLastInGroup = key !== nextKey;

                  return (
                    <React.Fragment
                      key={`${row.TicketName}-${row.ProductName}-${index}`}
                    >
                      <TableRow
                        key={`${row.TicketName}-${row.ProductName}-${index}`}
                      >
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan + 1}
                            sx={{
                              textAlign: "center",
                              height: "30px",
                              width: 50,
                              verticalAlign: "middle",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            {displayIndex2}
                          </TableCell>
                        )}
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan + 1}
                            sx={{
                              textAlign: "center",
                              height: "30px",
                              width: 100,
                              verticalAlign: "middle",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontSize="14px"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}
                            </Typography>
                          </TableCell>
                        )}
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan + 1}
                            sx={{
                              textAlign: "center",
                              height: "30px",
                              width: 300,
                              verticalAlign: "middle",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontSize="14px"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {row.TruckType === "รถใหญ่"
                                ? ` ${row.RegistrationName} / ${row.RegTailName || ""}`
                                : row.TruckType === "รถเล็ก"
                                  ? `${row.ShortName}${row.RegistrationName}`
                                  : "รถรับจ้างขนส่ง"}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 100,
                            backgroundColor:
                              row.ProductName === "G91"
                                ? "#92D050"
                                : row.ProductName === "G95"
                                  ? "#FFC000"
                                  : row.ProductName === "B7"
                                    ? "#FFFF99"
                                    : row.ProductName === "B95"
                                      ? "#B7DEE8"
                                      : row.ProductName === "B10"
                                        ? "#32CD32"
                                        : row.ProductName === "B20"
                                          ? "#228B22"
                                          : row.ProductName === "E20"
                                            ? "#C4BD97"
                                            : row.ProductName === "E85"
                                              ? "#0000FF"
                                              : row.ProductName === "PWD"
                                                ? "#F141D8"
                                                : row.ProductName === "B20"
                                                  ? "#FF7F50"
                                                  : "#FFFFFF",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            fontWeight="bold"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {row.ProductName}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 150,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(row.Volume)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 100,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {row.Rate}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 150,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(row.Volume * row.Rate)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            height: "30px",
                            width: 100,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(row.Volume * row.Rate * 0.01)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 100,
                            paddingLeft: "20px !important",
                            paddingRight: "20px !important",
                            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontSize="14px"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {formatNumber(
                              row.Volume * row.Rate -
                                row.Volume * row.Rate * 0.01,
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>

                      {isLastInGroup && (
                        <TableRow>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                            }}
                          >
                            รวม
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "right",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                              paddingLeft: "20px !important",
                              paddingRight: "20px !important",
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                            }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(groupTotals2[key].volume)}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                            }}
                          />
                          <TableCell
                            sx={{
                              textAlign: "right",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                              paddingLeft: "20px !important",
                              paddingRight: "20px !important",
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                            }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(groupTotals2[key].amount)}
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                            }}
                          />
                          <TableCell
                            sx={{
                              textAlign: "right",
                              fontWeight: "bold",
                              backgroundColor: "#e0e0e0",
                              borderBottom: "3px solid lightgray",
                              paddingLeft: "20px !important",
                              paddingRight: "20px !important",
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                            }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(groupTotals2[key].amount * 0.99)}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
          >
            <Grid
              container
              spacing={2}
              sx={{
                backgroundColor: "#616161",
                color: "white",
                paddingLeft: 2,
                paddingRight: 2,
                width: "1250px",
              }}
            >
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      รวมลิตร
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total2.totalVolume)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalVolume)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ยอดเงิน
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total2.totalAmount)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalAmount)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5.5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      หักภาษี 1%
                    </Typography>
                  </Grid>
                  <Grid item xs={6.5}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total2.totalTax)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalTax)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ยอดชำระ
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(total2.totalPayment)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalPayment)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ยอดโอน
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(CountCompany2)}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalVolume)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={2}>
                <Grid
                  container
                  spacing={2}
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  <Grid item xs={5}>
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ marginTop: -1.5 }}
                      gutterBottom
                    >
                      ค้างโอน
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -1.5 }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "22px", // ปรับความสูงของ TextField
                            display: "flex", // ใช้ flexbox
                            alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "12px", // ขนาด font เวลาพิมพ์
                            fontWeight: "bold",
                            textAlign: "center", // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                          },
                        }}
                        value={formatNumber(
                          Math.abs(
                            Number(total2.totalPayment) - Number(CountCompany2),
                          ) < 1e-6
                            ? 0
                            : Number(total2.totalPayment) -
                                Number(CountCompany2),
                        )}
                      />
                    </Paper>
                    {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalVolume)}
                                        </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 550, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={4}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            รวม
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 150, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalVolume)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 250, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalAmount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 200, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US", {  minimumFractionDigits: 2,  maximumFractionDigits: 2}).format(total2.totalPayment)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table> */}
          </Box>
        </Paper>
      </Box>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ marginTop: 5, fontSize: "18px" }}
        gutterBottom
      >
        ข้อมูลการโอน
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item md={12} xs={12}>
            <TableContainer
              component={Paper}
              sx={{ marginBottom: 2, borderRadius: 2 }}
            >
              <Box>
                <Table
                  size="small"
                  sx={{
                    tableLayout: "fixed",
                    "& .MuiTableCell-root": { padding: "1px" },
                    width: "1250px",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 50,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                        }}
                      >
                        ลำดับ
                      </TablecellSelling>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 100,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                        }}
                      >
                        Statement
                      </TablecellSelling>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 150,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                        }}
                      >
                        วันที่เงินเข้า
                      </TablecellSelling>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 250,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                        }}
                      >
                        เลขที่บัญชี
                      </TablecellSelling>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 250,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                        }}
                      >
                        บริษัทรับจ้างขนส่ง
                      </TablecellSelling>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 130,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                        }}
                      >
                        ยอดเงินเข้า
                      </TablecellSelling>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 100,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                        }}
                      >
                        หมายเหตุ
                      </TablecellSelling>
                      <TablecellSelling
                        sx={{
                          textAlign: "center",
                          fontSize: "14px",
                          width: 50,
                          height: "30px",
                          backgroundColor: theme.palette.success.main,
                          position: "sticky",
                          right: 0,
                        }}
                      />
                      {/* <TableCell sx={{ textAlign: "center", fontSize: "14px", width: 60, height: "30px", backgroundColor: "white" }}>
                                                    <Tooltip title="เพิ่มข้อมูลการโอนเงิน" placement="left">
                                                        <IconButton color="success"
                                                            size="small"
                                                            fullWidth
                                                            onClick={handlePost}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            <AddBoxIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transfer.map((row, index) => (
                      <TableRow>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 50,
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 170,
                          }}
                        >{`${row.Code} - ${row.Number}`}</TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 150,
                          }}
                        >
                          {!updateTranfer || row.uuid !== tranferID ? (
                            formatThaiSlash(dayjs(row.DateStart, "DD/MM/YYYY"))
                          ) : (
                            <LocalizationProvider
                              dateAdapter={AdapterDayjs}
                              adapterLocale="th"
                            >
                              <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={dayjs(tranferDateStart, "DD/MM/YYYY")}
                                onChange={(newValue) =>
                                  setTranferDateStart(
                                    dayjs(newValue).format("DD/MM/YYYY"),
                                  )
                                }
                                format="DD MMMM YYYY"
                                slotProps={{
                                  textField: {
                                    size: "small",
                                    fullWidth: true,
                                    inputProps: {
                                      value: formatThaiShort(
                                        dayjs(tranferDateStart, "DD/MM/YYYY"),
                                      ), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                    },
                                    sx: {
                                      "& .MuiOutlinedInput-root": {
                                        height: "30px",
                                        paddingRight: "8px",
                                      },
                                      "& .MuiInputBase-input": {
                                        fontSize: "16px",
                                        marginLeft: -1,
                                        marginRight: -1,
                                      },
                                    },
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment
                                          position="start"
                                          sx={{ marginRight: 2 }}
                                        >
                                          วันที่ :
                                        </InputAdornment>
                                      ),
                                    },
                                  },
                                }}
                              />
                            </LocalizationProvider>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 350,
                          }}
                        >
                          {!updateTranfer || row.uuid !== tranferID ? (
                            row.BankNameName
                          ) : (
                            <Paper component="form" sx={{ width: "100%" }}>
                              <FormControl
                                fullWidth
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: "30px",
                                  },
                                  "& .MuiInputBase-input": {
                                    fontSize: "16px",
                                    textAlign: "center",
                                  },
                                }}
                              >
                                <Select
                                  value={tranferBankName}
                                  onChange={(e) =>
                                    setTranferBankName(e.target.value)
                                  }
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: 200,
                                        width: 300,
                                      },
                                    },
                                    anchorOrigin: {
                                      vertical: "bottom", // dropdown จะเริ่มจากด้านล่าง select
                                      horizontal: "left",
                                    },
                                    transformOrigin: {
                                      vertical: "top",
                                      horizontal: "left",
                                    },
                                  }}
                                >
                                  <MenuItem
                                    value={tranferBankName}
                                    sx={{ fontSize: "14px" }}
                                  >
                                    {(() => {
                                      const selectedBank = bankDetail.find(
                                        (b) => b.uuid === tranferBankName,
                                      );
                                      return selectedBank
                                        ? `${selectedBank.BankName} - ${selectedBank.BankShortName}`
                                        : "";
                                    })()}
                                  </MenuItem>
                                  {bankDetail
                                    .slice() // 🔁 Clone ก่อนกัน side effect
                                    .sort((a, b) => {
                                      const aParts =
                                        a.BankShortName.split(".....");
                                      const bParts =
                                        b.BankShortName.split(".....");

                                      const aHasSplit = aParts.length > 1;
                                      const bHasSplit = bParts.length > 1;

                                      // ✅ ให้ตัวที่ไม่มี "....." อยู่ล่างสุด
                                      if (!aHasSplit && bHasSplit) return 1;
                                      if (aHasSplit && !bHasSplit) return -1;
                                      if (!aHasSplit && !bHasSplit) return 0;

                                      // ✅ ถ้ามีทั้งคู่ เปรียบเทียบส่วนที่ [1]
                                      return aParts[1].localeCompare(bParts[1]);
                                    })
                                    .map((row) => (
                                      <MenuItem
                                        key={row.id}
                                        value={row.uuid}
                                        sx={{ fontSize: "14px" }}
                                      >
                                        {`${row.BankName}....${row.BankShortName}..${row.BankID}`}
                                      </MenuItem>
                                    ))}
                                </Select>
                              </FormControl>
                            </Paper>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 250,
                          }}
                        >
                          {!updateTranfer || row.uuid !== tranferID ? (
                            row.TransportName
                          ) : (
                            <Paper component="form" sx={{ width: "100%" }}>
                              <FormControl
                                fullWidth
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: "30px",
                                  },
                                  "& .MuiInputBase-input": {
                                    fontSize: "16px",
                                    textAlign: "center",
                                  },
                                }}
                              >
                                <Select
                                  value={transport}
                                  onChange={(e) => setTransport(e.target.value)}
                                >
                                  <MenuItem
                                    value={transport}
                                    sx={{ fontSize: "14px" }}
                                  >
                                    {companies.find((c) => c.uuid === transport)
                                      ?.Name || ""}
                                  </MenuItem>
                                  {(() => {
                                    const transportCompanyA = companies.find(
                                      (c) => c.id === 2,
                                    );
                                    const transportCompanyB = companies.find(
                                      (c) => c.id === 3,
                                    );
                                    return (
                                      <>
                                        {transportCompanyA &&
                                          transportCompanyA.uuid !== transport && (
                                            <MenuItem
                                              value={transportCompanyA.uuid}
                                              sx={{ fontSize: "14px" }}
                                            >
                                              บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)
                                            </MenuItem>
                                          )}
                                        {transportCompanyB &&
                                          transportCompanyB.uuid !== transport && (
                                            <MenuItem
                                              value={transportCompanyB.uuid}
                                              sx={{ fontSize: "14px" }}
                                            >
                                              บริษัท พิชยา ทรานสปอร์ต จำกัด
                                              (สำนักงานใหญ่)
                                            </MenuItem>
                                          )}
                                      </>
                                    );
                                  })()}
                                </Select>
                              </FormControl>
                            </Paper>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 150,
                          }}
                        >
                          {!updateTranfer || row.uuid !== tranferID ? (
                            new Intl.NumberFormat("th-TH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(row.IncomingMoney)
                          ) : (
                            <Paper component="form" sx={{ width: "100%" }}>
                              <TextField
                                type="number"
                                value={tranferIncomingMoney}
                                onChange={(e) =>
                                  setTranferIncomingMoney(e.target.value)
                                }
                                size="small"
                                fullWidth
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: "30px",
                                  },
                                  "& .MuiInputBase-input": {
                                    fontSize: "16px",
                                    textAlign: "center",
                                  },
                                }}
                              />
                            </Paper>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 150,
                          }}
                        >
                          {!updateTranfer || row.uuid !== tranferID ? (
                            row.Note
                          ) : (
                            <Paper component="form" sx={{ width: "100%" }}>
                              <TextField
                                type="number"
                                value={tranferNote}
                                onChange={(e) => setTranferNote(e.target.value)}
                                size="small"
                                fullWidth
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: "30px",
                                  },
                                  "& .MuiInputBase-input": {
                                    fontSize: "16px",
                                    textAlign: "center",
                                  },
                                }}
                              />
                            </Paper>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            height: "30px",
                            width: 50,
                            position: "sticky",
                            right: 0,
                            backgroundColor: "white",
                          }}
                        >
                          {!updateTranfer || row.uuid !== tranferID ? (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <IconButton
                                color="warning"
                                size="small"
                                onClick={() =>
                                  handleClickTranfer(
                                    row.uuid,
                                    row.DateStart,
                                    row.BankName,
                                    row.Transport,
                                    row.IncomingMoney,
                                    row.Note,
                                  )
                                }
                                sx={{ marginRight: -1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteReport(row.uuid)}
                                size="small"
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <IconButton
                                color="error"
                                onClick={() => setUpdateTranfer(false)}
                                size="small"
                              >
                                <CancelIcon />
                              </IconButton>
                              <IconButton
                                color="success"
                                onClick={handleSaveTranfer}
                                size="small"
                              >
                                <SaveIcon />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  "& .MuiTableCell-root": { padding: "1px" },
                  width: "1250px",
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        height: "30px",
                        fontWeight: "bold",
                        borderLeft: "1px solid white",
                        backgroundColor: "#616161",
                        color: "white",
                        width: 770,
                      }}
                      colSpan={4}
                    >
                      <Typography
                        variant="subtitle2"
                        fontSize="14px"
                        sx={{ lineHeight: 1, margin: 0 }}
                        gutterBottom
                      >
                        รวม
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        height: "30px",
                        fontWeight: "bold",
                        borderLeft: "1px solid white",
                        width: 280,
                        backgroundColor: "#616161",
                        color: "white",
                      }}
                      colSpan={2}
                    >
                      <Typography
                        variant="subtitle2"
                        fontSize="14px"
                        sx={{ lineHeight: 1, margin: 0 }}
                        gutterBottom
                      >
                        {formatNumber(totalIncomingMoney)}
                      </Typography>
                    </TableCell>
                    {/* <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", width: 210, backgroundColor: "#616161", color: "white" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
            
                                                    </Typography>
                                                </TableCell> */}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item md={11.5} xs={12}>
            <Paper
              component="form"
              sx={{ borderRadius: 2, p: 2, backgroundColor: "#bdbdbd" }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ marginLeft: 2 }}
                gutterBottom
              >
                กรอกข้อมูลการโอนเงินตรงนี้
              </Typography>
              <Divider sx={{ marginBottom: 1, backgroundColor: "white" }} />
              <Grid container spacing={2}>
                <Grid item md={3} xs={6}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ marginRight: 1 }}
                      gutterBottom
                    >
                      Statement
                    </Typography>
                    <Grid container>
                      <Grid item xs={4.5}>
                        <Paper sx={{ height: "25px", width: "100%" }}>
                          <TextField
                            value={price.Code || ""}
                            onChange={(e) =>
                              handleChange("Code", e.target.value)
                            }
                            size="small"
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": { height: "25px" },
                              "& .MuiInputBase-input": {
                                fontSize: "14px",
                                fontWeight: "bold",
                                textAlign: "center",
                                marginLeft: -1,
                                marginRight: -1,
                              },
                              "& .MuiInputBase-input.Mui-disabled": {
                                color: "#424242", // เปลี่ยนสีตัวอักษรเมื่อ disabled
                                WebkitTextFillColor: "#424242", // สำหรับบางเบราว์เซอร์ที่ไม่อ่าน color เมื่อ disabled
                              },
                            }}
                            disabled
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={0.5}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          -
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Paper sx={{ height: "25px", width: "100%" }}>
                          <TextField
                            value={price.Number || ""}
                            onChange={(e) =>
                              handleChange("Number", e.target.value)
                            }
                            size="small"
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": { height: "25px" },
                              "& .MuiInputBase-input": {
                                fontSize: "14px",
                                fontWeight: "bold",
                                textAlign: "center",
                                marginLeft: -1,
                                marginRight: -1,
                              },
                              "& .MuiInputBase-input.Mui-disabled": {
                                color: "#424242", // เปลี่ยนสีตัวอักษรเมื่อ disabled
                                WebkitTextFillColor: "#424242", // สำหรับบางเบราว์เซอร์ที่ไม่อ่าน color เมื่อ disabled
                              },
                            }}
                            disabled
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          disableElevation
                          sx={{
                            padding: 0.5,
                            minWidth: "auto",
                            height: "25px",
                            fontSize: "0.75rem",
                            textTransform: "none",
                            marginLeft: 1,
                          }}
                          onClick={() => {
                            const code = dayjs(new Date()).format("YYYYMM");

                            // filter เอาเฉพาะ Code = เดือนปัจจุบัน
                            const filtered = transferMoneyDetail.filter(
                              (row) => row.Code === code,
                            );

                            // หา Number ล่าสุด
                            let lastNumber = 0;
                            if (filtered.length > 0) {
                              lastNumber = Math.max(
                                ...filtered.map(
                                  (row) => Number(row.Number) || 0,
                                ),
                              );
                            }

                            const nextNumber = String(lastNumber + 1).padStart(
                              4,
                              "0",
                            );

                            // reset state
                            setPrice({
                              ...price,
                              id: transferMoneyDetail.length,
                              Code: code,
                              Number: nextNumber,
                              IncomingMoney: "",
                              BankName: "",
                              Transport: "",
                            });

                            console.log(
                              "NEW → reset Number =",
                              nextNumber,
                              "Code =",
                              code,
                            );
                          }}
                        >
                          NEW
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                <Grid item md={3} xs={6}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ marginRight: 1, whiteSpace: "nowrap" }}
                      gutterBottom
                    >
                      เงินเข้า
                    </Typography>
                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -0.5 }}
                    >
                      <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="th"
                      >
                        <DatePicker
                          openTo="day"
                          views={["year", "month", "day"]}
                          value={dayjs(price.DateStart, "DD/MM/YYYY")}
                          onChange={(newValue) =>
                            handleChange("DateStart", newValue)
                          }
                          format="DD MMMM YYYY" // ใช้ BBBB แทนปี พ.ศ.
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  height: "30px",
                                  paddingRight: "8px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "16px",
                                  marginLeft: -1,
                                  marginRight: -1,
                                },
                              },
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment
                                    position="start"
                                    sx={{ marginRight: 2 }}
                                  >
                                    วันที่ :
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Paper>
                  </Box>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ marginRight: 1, whiteSpace: "nowrap" }}
                      gutterBottom
                    >
                      บริษัทรับจ้างขนส่ง
                    </Typography>

                    <Paper
                      component="form"
                      sx={{ width: "100%", marginTop: -0.5 }}
                    >
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": { height: "30px" },
                          "& .MuiInputBase-input": {
                            fontSize: "14px",
                            textAlign: "center",
                          },
                        }}
                      >
                        <Select
                          value={price.Transport || ""}
                          onChange={(e) =>
                            handleChange("Transport", e.target.value)
                          }
                        >
                          {/* {
                                                        companies.map((row) => (
                                                            row.id !== 1 &&
                                                            <MenuItem value={`${row.id}:${row.Name}`} sx={{ fontSize: "14px", }}>{row.Name}</MenuItem>
                                                        ))
                                                    } */}
                          {(() => {
                            const transportCompanyA = companies.find(
                              (c) => c.id === 2,
                            );
                            const transportCompanyB = companies.find(
                              (c) => c.id === 3,
                            );
                            return (
                              <>
                                {transportCompanyA && (
                                  <MenuItem
                                    value={transportCompanyA.uuid}
                                    sx={{ fontSize: "14px" }}
                                  >
                                    บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)
                                  </MenuItem>
                                )}
                                {transportCompanyB && (
                                  <MenuItem
                                    value={transportCompanyB.uuid}
                                    sx={{ fontSize: "14px" }}
                                  >
                                    บริษัท พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)
                                  </MenuItem>
                                )}
                              </>
                            );
                          })()}
                        </Select>
                      </FormControl>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                {windowWidth >= 900 && <Grid item md={0.5} xs={12} />}
                <Grid item md={5.5} xs={6}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ marginRight: 1, whiteSpace: "nowrap" }}
                      gutterBottom
                    >
                      บัญชี
                    </Typography>
                    <Paper component="form" sx={{ width: "100%" }}>
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": { height: "30px" },
                          "& .MuiInputBase-input": {
                            fontSize: "16px",
                            textAlign: "center",
                          },
                        }}
                      >
                        <Select
                          value={price.BankName || ""}
                          onChange={(e) =>
                            handleChange("BankName", e.target.value)
                          }
                        >
                          {bankDetail
                            .slice() // 🔁 Clone ก่อนกัน side effect
                            .sort((a, b) => {
                              const aParts = a.BankShortName.split(".....");
                              const bParts = b.BankShortName.split(".....");

                              const aHasSplit = aParts.length > 1;
                              const bHasSplit = bParts.length > 1;

                              // ✅ ให้ตัวที่ไม่มี "....." อยู่ล่างสุด
                              if (!aHasSplit && bHasSplit) return 1;
                              if (aHasSplit && !bHasSplit) return -1;
                              if (!aHasSplit && !bHasSplit) return 0;

                              // ✅ ถ้ามีทั้งคู่ เปรียบเทียบส่วนที่ [1]
                              return aParts[1].localeCompare(bParts[1]);
                            })
                            .map((row) => (
                              <MenuItem
                                key={row.id}
                                value={`${row.id}:${row.BankName} - ${row.BankShortName}`}
                                sx={{ fontSize: "14px" }}
                              >
                                {`${row.BankName}....${row.BankShortName}..${row.BankID}`}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Paper>
                  </Box>
                </Grid>
                <Grid item md={3} xs={6}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ marginRight: 1, whiteSpace: "nowrap" }}
                      gutterBottom
                    >
                      จำนวนเงิน
                    </Typography>
                    <Paper component="form" sx={{ width: "100%" }}>
                      <TextField
                        type="number"
                        value={price.IncomingMoney || ""}
                        onChange={(e) =>
                          handleChange("IncomingMoney", e.target.value)
                        }
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": { height: "30px" },
                          "& .MuiInputBase-input": {
                            fontSize: "16px",
                            textAlign: "center",
                          },
                        }}
                      />
                    </Paper>
                  </Box>
                </Grid>
                <Grid item md={3} xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ marginRight: 1, whiteSpace: "nowrap" }}
                      gutterBottom
                    >
                      หมายเหตุ
                    </Typography>
                    <Paper component="form" sx={{ width: "100%" }}>
                      <TextField
                        value={price.Note || ""}
                        onChange={(e) => handleChange("Note", e.target.value)}
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": { height: "30px" },
                          "& .MuiInputBase-input": {
                            fontSize: "16px",
                            textAlign: "center",
                          },
                        }}
                      />
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item md={0.5} xs={12} sx={{ marginTop: 0.5 }}>
            {windowWidth <= 900 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BankDetail />
                <Tooltip title="บันทึก" placement="left">
                  <Paper
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 2,
                      backgroundColor: theme.palette.success.main,
                      marginLeft: 3,
                      marginRight: -1,
                      marginTop: 1,
                    }}
                  >
                    <Button
                      color="inherit"
                      fullWidth
                      onClick={handleSubmit}
                      sx={{ flexDirection: "column", gap: 0.5 }}
                    >
                      <SaveIcon fontSize="small" sx={{ color: "white" }} />
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        บันทึก
                      </Typography>
                    </Button>
                  </Paper>
                </Tooltip>
              </Box>
            ) : (
              <>
                <BankDetail />
                <Tooltip title="บันทึก" placement="left">
                  <Paper
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 2,
                      backgroundColor: theme.palette.success.main,
                      marginLeft: -1,
                      marginRight: -1,
                      marginTop: 1,
                    }}
                  >
                    <Button
                      color="inherit"
                      fullWidth
                      onClick={handleSubmit}
                      sx={{ flexDirection: "column", gap: 0.5 }}
                    >
                      <SaveIcon fontSize="small" sx={{ color: "white" }} />
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        บันทึก
                      </Typography>
                    </Button>
                  </Paper>
                </Tooltip>
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
};

export default UpdateReport;
