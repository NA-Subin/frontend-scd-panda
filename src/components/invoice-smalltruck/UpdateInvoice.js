import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
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
  IconButtonWarning,
  RateOils,
  TablecellHeader,
  TablecellSelling,
} from "../../theme/style";
import InfoIcon from "@mui/icons-material/Info";
import CancelIcon from "@mui/icons-material/Cancel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import BackspaceIcon from "@mui/icons-material/Backspace";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddIcon from "@mui/icons-material/Add";
import NoteIcon from "@mui/icons-material/Note";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import theme from "../../theme/theme";
import { ref, update } from "firebase/database";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import jsPDF from "jspdf";
import notoSansThaiRegular from "@fontsource/noto-sans-thai";
import html2canvas from "html2canvas";
import BankDetail from "./BankDetail";
import "dayjs/locale/th"; // โหลดภาษาไทย
import buddhistEra from "dayjs/plugin/buddhistEra"; // ใช้ plugin Buddhist Era (พ.ศ.)
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";

dayjs.locale("th");
dayjs.extend(buddhistEra);

const UpdateInvoice = (props) => {
  const { ticket, ticketNo, date, openNavbar } = props;
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({}); // เก็บค่าฟอร์มชั่วคราว
  const [show, setShow] = useState(false);
  const [test, setTest] = useState([]);
  const [paperSize, setPaperSize] = useState("แนวตั้ง");
  const numberFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [windowWidths, setWindowWidths] = useState(window.innerWidth);

  // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidths(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
    };

    window.addEventListener("resize", handleResize); // เพิ่ม event listener

    // ลบ event listener เมื่อ component ถูกทำลาย
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const {
  //     order,
  //     company,
  //     banks,
  //     transferMoney,
  //     invoiceReport
  // } = useData();

  const { order, banks, transferMoney, invoiceReport } = useTripData();

  const { company, small, customersmalltruck } = useBasicData();
  const companies = Object.values(company || {});
  const customerS = Object.values(customersmalltruck || {}).map((cust) => {
    const compId = cust.Company; // เป็น id อยู่แล้ว
    const company = companies.find((c) => String(c.id) === String(compId));

    return {
      ...cust,
      CompanyAddress: company?.Address, // inject Address ของ company เข้าไปใน customer
      CompanyCardID: company?.CardID,
      CompanyPhone: company?.Phone,
    };
  });

  // const orders = Object.values(order || {});
  const orders = Object.values(order || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });
  const smalls = Object.values(small || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const bankDetail = Object.values(banks || {}).filter(
    (row) => row.Status !== "ยกเลิก",
  );
  const transferMoneyDetail = Object.values(transferMoney || {});
  const invoiceDetail = Object.values(invoiceReport || {});

  const transfer = transferMoneyDetail.filter(
    (row) =>
      row.TicketNo === ticket.No &&
      row.TicketName === ticket.TicketName &&
      ticket.Status !== "ยกเลิก",
  );
  const invoices = invoiceDetail.filter(
    (row) => row.TicketNo === ticket.No && row.TicketName === ticket.TicketName,
  );

  console.log("invoice : ", invoices);

  const totalIncomingMoney = transferMoneyDetail
    .filter(
      (trans) =>
        trans.TicketNo === ticket.No &&
        trans.TicketType === "ตั๋วรถเล็ก" &&
        trans.Status !== "ยกเลิก",
    )
    .reduce((sum, trans) => {
      const value = parseFloat(trans.IncomingMoney) || 0;
      return sum + value;
    }, 0);

  console.log("Money : ", transfer);
  console.log("totalIncomingMoney : ", totalIncomingMoney);

  const companyName = companies.find((item) => item.id === 1);
  console.log("companyName : ", companyName);
  //const orderList = orders.filter(item => item.Date === ticket.Date && item.TicketName.split(":")[0] === ticket.TicketName.split(":")[0] && item.CustomerType === ticket.CustomerType && item.Trip !== "ยกเลิก");
  const orderList = orders
    .filter(
      (item) =>
        item.Date === ticket.Date &&
        item.TicketName.split(":")[0] === ticket.TicketName.split(":")[0] &&
        item.CustomerType === ticket.CustomerType &&
        item.Trip !== "ยกเลิก" &&
        item.Status !== "ยกเลิก",
    )
    .map((item) => {
      const matchedSmall = smalls.find(
        (s) => s.id === Number(item.Registration),
      );

      const company = customerS.find(
        (row) => row.id === Number(item.TicketName.split(":")[0]),
      );

      return {
        ...item,
        CompanyNameNew: company?.CompanyName,
        AddressNew: company?.Address,
        CodeIDNew: company?.CodeID,
        DateReceive: ticket.DateReceive,
        DateDelivery: ticket.DateDelivery,
        ShortName: matchedSmall?.ShortName,
      };
    });
  const [code, setCode] = React.useState(
    `lV${dayjs(new Date()).format("YYYYMM")}`,
  );

  console.log("transferMoneyDetail : ", transferMoneyDetail.length);
  console.log("code : ", code);
  console.log("orderList : ", orderList);
  console.log("ticket : ", ticket);

  const formatThaiDate = (date) => {
    const d = dayjs(date);
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
    const day = d.date();
    const month = thaiMonths[d.month()];
    const year = d.year() + 543; // บวกเป็น พ.ศ.

    return `${day} ${month} ${year}`;
  };

  const trimShortName = (text) => {
    if (!text) return "";

    return text
      .replace(/^\d+\.{1,}/, "") // ลบเลข + จุด เช่น 3..., 2.., 1.
      .trim(); // ตัด space ซ้ำ
  };

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
    Transport: `${companyName?.id}:${companyName?.Name}`,
    IncomingMoney: "",
    TicketName: ticket.TicketName,
    TicketNo: ticket.No,
    TicketType: ticket.CustomerType,
    Note: "",
  });

  const customer = customerS.find(
    (row, index) => row.id === Number(ticket.TicketName.split(":")[0]),
  );
  const invoiceC = companies.find((row) => {
    if (!customer?.Company) return false;
    return row.id === Number(customer.Company);
  });

  console.log("customer : ", customer);

  const [invoice, setInvoice] = React.useState({});

  // const getPrice = () => {
  //     let foundItem;
  //     let refPath = "";
  //     let initialPrice = [];

  //     if (ticket.CustomerType === "ตั๋วรถใหญ่") {
  //         console.log("Customer Type : ", ticket.CustomerType);
  //         foundItem = orders.find(item => item.No === ticket.No && item.Trip !== "ยกเลิก");
  //         console.log("🔍 Found Item:", foundItem);
  //         if (foundItem) {
  //             refPath = `/order/${foundItem.No}/Price`;
  //             initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [{
  //                 id: transferMoneyDetail.length,
  //                 Code: dayjs(new Date).format("YYYYMM"),
  //                 Number: "",
  //                 DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
  //                 BankName: "",
  //                 Transport: `${companyName.id}:${companyName.Name}`,
  //                 IncomingMoney: "",
  //                 TicketName: ticket.TicketName,
  //                 TicketNo: ticket.No,
  //                 TicketType: ticket.CustomerType,
  //                 Note: "",
  //             }];
  //         }
  //     } else {
  //         ShowError("Ticket Name ไม่ถูกต้อง");
  //         return;
  //     }

  //     // if (ticket?.TicketName) {
  //     //     foundItem = customertransport.find(item => item.TicketsName === ticket.TicketName);
  //     //     if (foundItem) {
  //     //         refPath = `/customers/transports/${foundItem.id - 1}/Price`;
  //     //         initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
  //     //     }

  //     //     if (!foundItem) {
  //     //         foundItem = customergasstation.find(item => item.TicketsName === ticket.TicketName);
  //     //         if (foundItem) {
  //     //             refPath = `/customers/gasstations/${foundItem.id - 1}/Price`;
  //     //             initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
  //     //         }
  //     //     }

  //     //     if (!foundItem) {
  //     //         foundItem = customerbigtrucks.find(item => item.TicketsName === ticket.TicketName);
  //     //         if (foundItem) {
  //     //             refPath = `/customers/bigtruck/${foundItem.id - 1}/Price`;
  //     //             initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
  //     //         }
  //     //     }

  //     //     if (!foundItem) {
  //     //         foundItem = customersmalltrucks.find(item => item.TicketsName === ticket.TicketName);
  //     //         if (foundItem) {
  //     //             refPath = `/customers/smalltruck/${foundItem.id - 1}/Price`;
  //     //             initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
  //     //         }
  //     //     }
  //     // } else {
  //     //     ShowError("Ticket Name ไม่ถูกต้อง");
  //     //     return;
  //     // }

  //     console.log("🔍 Found Item:", foundItem);
  //     console.log("📌 Ref Path:", refPath);
  //     console.log("📊 Initial Price Data:", initialPrice);

  //     setPrice(initialPrice);
  // };

  // useEffect(() => {
  //     getPrice();
  // }, [ticket]);

  // const calculateDueDate = (dateString, creditDays) => {
  //     if (!dateString || !creditDays) return "ไม่พบข้อมูลวันที่"; // ตรวจสอบค่าว่าง

  //     const [day, month, year] = dateString.split("/").map(Number);
  //     const date = new Date(year, month - 1, day); // สร้าง Date object (month - 1 เพราะเริ่มที่ 0-11)

  //     date.setDate(date.getDate() + Number(creditDays)); // เพิ่มจำนวนวัน

  //     // แปลงเป็นวันที่ภาษาไทย
  //     const formattedDate = new Intl.DateTimeFormat("th-TH", {
  //         year: "numeric",
  //         month: "long",
  //         day: "numeric",
  //     }).format(date);

  //     return `กำหนดชำระเงิน: ${formattedDate}`;
  // };

  // const calculateDueDate = (dateString, creditDays) => {
  //     if (!dateString || !creditDays) return "ไม่พบข้อมูลวันที่";

  //     const [day, month, year] = dateString.split("/").map(Number);
  //     const date = new Date(year, month - 1, day);

  //     date.setDate(date.getDate() + Number(creditDays));

  //     const thaiMonths = [
  //         "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  //         "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  //     ];

  //     const dueDay = date.getDate();
  //     const dueMonth = String(date.getMonth() + 1).padStart(2, "0");
  //     // const dueDay = date.getDate();
  //     // const dueMonth = thaiMonths[date.getMonth()];
  //     const dueYear = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

  //     return `${dueDay}/${dueMonth}/${dueYear}`;
  //     //return `วันที่ ${dueDay} เดือน${dueMonth} พ.ศ.${dueYear}`;
  // };

  const calculateDueDate = (dateString, creditDays) => {
    if (!dateString) return "ไม่พบข้อมูลวันที่";

    // แปลง creditDays เป็นเลข (ถ้าไม่ใช่ตัวเลขให้เป็น 0)
    const days = Number(creditDays);
    const safeCreditDays = isNaN(days) ? 0 : days;

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() + safeCreditDays);

    const dueDay = date.getDate();
    const dueMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dueYear = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

    return `${dueDay}/${dueMonth}/${dueYear}`;
  };

  // 🔥 ทดสอบโค้ด
  console.log("Date:", ticket.Date);
  console.log("Credit Time:", ticket.CreditTime);
  console.log(
    calculateDueDate(
      ticket.Date,
      Number(ticket.CreditTime) > 0 ? ticket.CreditTime : 0,
    ),
  );

  console.log("orderList : ", orderList);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
    const rateOil = parseFloat(value);

    setReport((prevReport) => {
      const newReport = { ...prevReport };

      if (value === "" || rateOil === 0 || isNaN(rateOil)) {
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
          RateOil: rateOil,
          Amount: rateOil * volume,
        };
      }

      return newReport;
    });
  };

  console.log("orderList : ", orderList);

  const generatePDF = () => {
    let Code = "";
    if (invoices.length !== 0) {
      Code = `${invoices[0]?.Code}-${invoices[0]?.Number}`;
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

      database
        .ref("invoice/")
        .child(invoiceDetail.length)
        .update({
          id: invoiceDetail.length,
          Code: `lV${currentCode}`,
          Number: formattedNumberInvoice,
          DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
          Transport: `${companyName?.id}:${companyName?.Name}`,
          TicketName: ticket.TicketName,
          TicketNo: ticket.No,
          TicketType: ticket.CustomerType,
        }) // ใช้ .set() แทน .update() เพื่อแทนที่ข้อมูลทั้งหมด
        .then(() => {
          console.log("บันทึกข้อมูลเรียบร้อย ✅");
        })
        .catch((error) => {
          ShowError("ไม่สำเร็จ");
          console.error("Error updating data:", error);
        });
    }

    const invoiceData = {
      Report: orderList.flatMap((row, rowIndex) =>
        Object.entries(row.Product)
          .filter(([productName]) => productName !== "P")
          .map(([productName, Volume], index) => ({
            No: row.No,
            TicketName: row.TicketName,
            ShortName: trimShortName(row.ShortName),
            RateOil: isNaN(Volume.RateOil)
              ? 0
              : numberFormat.format(Volume.RateOil),
            Amount: Volume.Amount || 0,
            Date: row.Date,
            Driver: row.DriverName,
            Registration: row.RegistrationName,
            ProductName: productName,
            Volume: Volume.Volume,
            uniqueRowId: `${index}:${productName}`, // 🟢 สร้าง ID ที่ไม่ซ้ำกัน
          })),
      ),
      Order: orders.reduce((acc, current) => {
        // ✅ ตรวจสอบว่าค่า TicketName ซ้ำหรือไม่ และต้องตรงกับ ticket.TicketName
        if (
          !acc.some((item) => item.TicketName === current.TicketName) &&
          current.TicketName === ticket.TicketName
        ) {
          acc.push(current);
        }
        return acc;
      }, []), // ✅ ต้องมีค่าเริ่มต้นเป็น []
      CustomerAddress: customer?.Address || "",
      BankCompany: invoiceC?.Name || "",
      Volume: ticket.TotalVolume || 0,
      Amount: ticket.TotalAmount || 0,
      Date: invoices[0]?.DateStart,
      DateEnd: calculateDueDate(
        ticket.Date,
        Number(ticket.CreditTime) > 0 ? ticket.CreditTime : 0,
      ),
      Company:
        customer?.Company
          ? (customer.CompanyRefName ?? companyName?.Name)
          : companyName?.Name,
      Address:
        customer?.Company && customer?.Company !== "ไม่มี"
          ? customer?.CompanyAddress
          : companyName?.Address,
      CardID:
        customer?.Company && customer?.Company !== "ไม่มี"
          ? customer?.CompanyCardID
          : companyName?.CardID,
      Phone:
        customer?.Company && customer?.Company !== "ไม่มี"
          ? customer?.CompanyPhone
          : companyName?.Phone,
      Code: Code,
      PaperSize: paperSize,
    };

    // บันทึกข้อมูลลง sessionStorage
    sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = 820;
    const windowHeight = 559;

    const left = (screenWidth - windowWidth) / 2;
    const top = (screenHeight - windowHeight) / 2;

    const printWindow = window.open(
      "/print-invoice-small",
      "_blank",
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`,
    );

    if (!printWindow) {
      alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
    }
  };

  console.log("Report : ", report);
  console.log("price : ", price);

  const handleSave = () => {
    Object.entries(report).forEach(([uniqueRowId, data]) => {
      // ตรวจสอบว่า data.id และ data.ProductName ไม่ใช่ null หรือ undefined
      if (
        data.No == null ||
        data.ProductName == null ||
        data.ProductName.trim() === ""
      ) {
        console.log("ไม่พบ id หรือ ProductName");
        return;
      }

      const path = `order/${data.No}/Product/${data.ProductName}`;
      update(ref(database, path), {
        RateOil: data.RateOil,
        Amount: data.Amount,
        OverdueTransfer: data.Amount,
      })
        .then(() => {
          console.log("บันทึกข้อมูลเรียบร้อย ✅");
        })
        .catch((error) => {
          ShowError("เพิ่มข้อมูลไม่สำเร็จ");
          console.error("Error pushing data:", error);
        });
    });
  };

  const [tranferID, setTranferID] = useState(null);
  const [tranferDateStart, setTranferDateStart] = useState("");
  const [tranferBankName, setTranferBankName] = useState("");
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

  const handleClickTranfer = (id, DateStart, BankName, IncomingMoney, Note) => {
    setUpdateTranfer(true);
    setTranferID(id);
    setTranferDateStart(DateStart);
    setTranferBankName(BankName);
    setTranferIncomingMoney(IncomingMoney);
    setTranferNote(Note);
  };

  const handleSaveTranfer = () => {
    if (tranferID === null) {
      ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
      return;
    }

    const updatedData = {
      DateStart: tranferDateStart,
      BankName: tranferBankName,
      IncomingMoney: tranferIncomingMoney,
      Note: tranferNote,
    };

    database
      .ref("transfermoney/")
      .child(tranferID)
      .update(updatedData)
      .then(() => {
        ShowSuccess("บันทึกข้อมูลเรียบร้อย");
        console.log("บันทึกข้อมูลเรียบร้อย ✅");
        setUpdateTranfer(false);
        setTranferID(null);
        setTranferDateStart("");
        setTranferBankName("");
        setTranferIncomingMoney("");
        setTranferNote("");
      })
      .catch((error) => {
        ShowError("ไม่สำเร็จ");
        console.error("Error updating data:", error);
      });
  };

  const handleDeleteReport = (newID) => {
    if (newID === null) {
      ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
      return;
    }

    ShowConfirm(
      "คุณต้องการยกเลิกรายการนี้ใช่หรือไม่?",
      () => {
        // ✅ ถ้ากดยืนยัน
        database
          .ref("transfermoney/")
          .child(newID)
          .update({ Status: "ยกเลิก" })
          .then(() => {
            ShowSuccess("บันทึกข้อมูลเรียบร้อย");
            console.log("บันทึกข้อมูลเรียบร้อย ✅");
          })
          .catch((error) => {
            ShowError("ไม่สำเร็จ");
            console.error("Error updating data:", error);
          });
      },
      () => {
        // ❌ ถ้ากดยกเลิก
        console.log("ยกเลิกการลบข้อมูล ❌");
      },
    );
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
        Code: dayjs(new Date()).format("YYYYMM"),
        Number: "",
        BankName: "",
        Transport: `${companyName.id}:${companyName.Name}`,
        IncomingMoney: "",
        Note: "",
      };
      return [...prevPrice, newRow];
    });
  };

  // const handleChange = (id, field, value) => {
  //     setPrice(prevPrice =>
  //         prevPrice.map(row =>
  //             row.id === id ? {
  //                 ...row,
  //                 [field]: field === "DateStart" ? dayjs(value).format("DD/MM/YYYY") : value
  //             } : row
  //         )
  //     );
  // };

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

  const handleNewInvoice = () => {
    database
      .ref("invoice/")
      .child(invoices[0].id)
      .update({
        TicketNo: "ยกเลิก",
      })
      .then(() => {
        ShowSuccess("บันทึกข้อมูลเรียบร้อย");
        console.log("บันทึกข้อมูลเรียบร้อย ✅");
      })
      .catch((error) => {
        ShowError("ไม่สำเร็จ");
        console.error("Error updating data:", error);
      });
  };

  const handleSubmit = () => {
    const newId = transferMoneyDetail.length;
    const total = Number(newNumber) + 1;
    //const formattedNumber = String(total).padStart(4, "0");

    const newPrice = {
      ...price,
      id: newId,
      //Number: formattedNumber,
    };

    database
      .ref("transfermoney/")
      .child(newId)
      .set(newPrice)
      .then(() => {
        ShowSuccess("บันทึกข้อมูลเรียบร้อย");
        console.log("บันทึกข้อมูลเรียบร้อย ✅");

        // เตรียมค่าใหม่สำหรับ price หลังบันทึก
        const nextFormattedNumber = String(total).padStart(4, "0");
        setPrice({
          ...newPrice,
          id: newId + 1,
          Number: nextFormattedNumber,
          IncomingMoney: "",
          BankName: "",
        });
      })
      .catch((error) => {
        ShowError("ไม่สำเร็จ");
        console.error("Error updating data:", error);
      });
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
  //                 Transport: `${companyName.id}:${companyName.Name}`,
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
  // };

  console.log("ticket : ", ticket);
  console.log("customer : ", customer);
  console.log("invoiceC : ", invoiceC);
  console.log("customer?.Company : ", customer?.Company);
  console.log("companyName?.Name : ", companyName?.Name);
  console.log("companyName : ", companyName);

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        {/* <Grid item md={12}>
                    <Typography variant="subtitle1" sx={{ fontSize: "18px", marginBottom: -2 }} fontWeight="bold" gutterBottom>
                        รายละเอียด : วันที่ส่ง : {dayjs(ticket.Date, "DD/MM/YYYY").format("D เดือนMMMM พ.ศ.BBBB")} / ตั๋ว : {ticket.TicketName.split(":")[1]}
                    </Typography>
                </Grid> */}
        <Grid item md={5.5} xs={12}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: "18px",
              marginBottom: -2,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.2, // 🔽 ลดช่องว่างระหว่าง block
              lineHeight: 1.2, // 🔽 ลดความสูงบรรทัด
            }}
          >
            รายละเอียด {"=>"} ส่งวันที่ :
            <Box component="span" sx={{ ml: 0.3, mb: -0.5 }}>
              {" "}
              {/* 🔽 ลด margin-left และ bottom */}
              {dayjs(ticket.Date, "DD/MM/YYYY").format("D เดือนMMMM พ.ศ.BBBB")}
            </Box>
            <Box
              component="span"
              sx={{
                ml: 0.5, // 🔽 ลดช่องว่างด้านซ้าย
                whiteSpace: "nowrap",
              }}
            >
              ตั๋ว : {ticket.TicketName.split(":")[1]}
            </Box>
          </Typography>
        </Grid>
        <Grid item md={5.5} xs={7} textAlign="right">
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 0.5,
            }}
          >
            <Button
              variant="contained"
              color="info"
              sx={{ height: "25px", marginRight: 1 }}
              onClick={handleNewInvoice}
            >
              NEW
            </Button>
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
                width: "250px",
              }}
              value={invoices[0]?.Code || `lV${currentCode}`}
            />
            <Typography
              variant="subtitle1"
              sx={{ marginLeft: 1, marginRight: 1 }}
              fontWeight="bold"
              gutterBottom
            >
              -
            </Typography>
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
                width: "250px",
              }}
              value={invoices[0]?.Number || ""}
            />
            <Tooltip
              title={
                !customer?.Company
                  ? companyName.Name
                  : customer?.CompanyRefName
              }
              placement="top"
            >
              <TextField
                size="small"
                disabled
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
                  },
                  width: "1000px",
                }}
                value={
                  !customer?.Company
                    ? companyName.Name
                    : customer?.CompanyRefName
                }
              />
            </Tooltip>
          </Box>
        </Grid>
        <Grid item md={1} xs={1}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {/* ปุ่มแนวตั้ง */}
            <Box
              onClick={() => setPaperSize("แนวตั้ง")}
              sx={{
                p: 0.5,
                borderRadius: 2,
                cursor: "pointer",
                border:
                  paperSize === "แนวตั้ง"
                    ? "2px solid #1976d2"
                    : "1px solid lightgray",
                backgroundColor:
                  paperSize === "แนวตั้ง" ? "#E3F2FD" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NoteIcon sx={{ transform: "rotate(270deg)" }} />
            </Box>

            {/* ปุ่มแนวนอน */}
            <Box
              onClick={() => setPaperSize("แนวนอน")}
              sx={{
                p: 0.5,
                borderRadius: 2,
                cursor: "pointer",
                border:
                  paperSize === "แนวนอน"
                    ? "2px solid #1976d2"
                    : "1px solid lightgray",
                backgroundColor:
                  paperSize === "แนวนอน" ? "#E3F2FD" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NoteIcon sx={{ transform: "rotate(0deg)" }} />
            </Box>
          </Box>
          {/* <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            InputLabelProps={{
                                sx: {
                                    fontSize: '14px',
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '25px', // ปรับความสูงของ TextField
                                    display: 'flex', // ใช้ flexbox
                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                },
                            }}
                            value={paperSize}
                            onChange={(e) => setPaperSize(e.target.value)}
                        >
                            <MenuItem value="แนวตั้ง"><NoteIcon sx={{ transform: "rotate(270deg)" }} /></MenuItem>
                            <MenuItem value="แนวนอน"><NoteIcon sx={{ transform: "rotate(0deg)", aspectRatio: "21/29.7" }} /></MenuItem>
                        </TextField>
                    </Box> */}
        </Grid>
        {/* <Grid item xs={1}>
                    <Tooltip title="บันทึกข้อมูล" placement="top">
                        <Button
                            color="success"
                            variant='contained'
                            fullWidth
                            onClick={handleSave}
                            sx={{
                                flexDirection: "row",
                                gap: 0.5,
                                borderRadius: 2
                            }}
                        >
                            <SaveIcon sx={{ color: "white" }} />
                            <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                บันทึก
                            </Typography>
                        </Button>
                    </Tooltip>
                </Grid> */}
        <Grid item md={9.5} xs={12}>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": { padding: "1px" },
                width: openNavbar ? "1020px" : "1110px",
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
                      height: "30px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    วันที่รับ
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 400,
                      height: "30px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ผู้ขับ/ป้ายทะเบียน
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 100,
                      height: "30px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ชนิดน้ำมัน
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 120,
                      height: "30px",
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
                      height: "30px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ราคาน้ำมัน
                  </TablecellSelling>
                  <TablecellSelling
                    sx={{
                      textAlign: "center",
                      fontSize: "14px",
                      width: 130,
                      height: "30px",
                      backgroundColor: theme.palette.primary.dark,
                    }}
                  >
                    ยอดเงิน
                  </TablecellSelling>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderList
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .flatMap((row, rowIndex) =>
                    Object.entries(row.Product)
                      .filter(([productName]) => productName !== "P") // กรองก่อน map
                      .map(([productName, Volume], index) => ({
                        No: row.No,
                        TicketName: row.TicketName,
                        RateOil: isNaN(Volume.RateOil)
                          ? 0
                          : numberFormat.format(Volume.RateOil),
                        Amount: Volume.Amount || 0,
                        Date: row.Date,
                        Driver: row.Driver,
                        Registration: row.Registration,
                        ShortName: trimShortName(row.ShortName),
                        ProductName: productName,
                        Volume: Volume.Volume,
                        DateDelivery: row.DateDelivery,
                        DateReceive: row.DateReceive,
                        uniqueRowId: `${index}:${productName}:${row.No}`,
                      })),
                  )
                  .map((row, index) => (
                    <TableRow
                      key={`${row.TicketName}-${row.ProductName}-${index}`}
                    >
                      <TableCell sx={{ textAlign: "center", height: "30px" }}>
                        <Typography
                          variant="subtitle2"
                          fontSize="14px"
                          sx={{ lineHeight: 1, margin: 0 }}
                          gutterBottom
                        >
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", height: "30px" }}>
                        <Typography
                          variant="subtitle2"
                          fontSize="14px"
                          sx={{ lineHeight: 1, margin: 0 }}
                          gutterBottom
                        >
                          {formatThaiSlash(
                            dayjs(
                              report[row.uniqueRowId]?.Date || row.Date,
                              "DD/MM/YYYY",
                            ),
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "left", height: "30px" }}>
                        <Typography
                          variant="subtitle2"
                          fontSize="14px"
                          sx={{ lineHeight: 1, margin: 0, marginLeft: 4 }}
                          gutterBottom
                        >
                          {report[row.uniqueRowId]?.Driver ||
                            row.DriverName}{" "}
                          : {trimShortName(row.ShortName)}{" "}
                          {report[row.uniqueRowId]?.Registration ||
                            row.RegistrationName}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          height: "30px",
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
                          {report[row.uniqueRowId]?.ProductName ||
                            row.ProductName}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          height: "30px",
                          paddingLeft: "40px !important",
                          paddingRight: "40px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontSize="14px"
                          sx={{ lineHeight: 1, margin: 0 }}
                          gutterBottom
                        >
                          {new Intl.NumberFormat("en-US").format(row.Volume)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", fontSize: "14px" }}>
                        <Paper
                          component="form"
                          sx={{ marginTop: -1, marginBottom: -1 }}
                        >
                          <Paper component="form" sx={{ width: "100%" }}>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  height: "22px",
                                  display: "flex",
                                  alignItems: "center",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "14px",
                                  padding: "1px 4px",
                                  textAlign: "center",
                                },
                                borderRadius: 10,
                              }}
                              value={
                                report[row.uniqueRowId]?.RateOil ||
                                row.RateOil ||
                                ""
                              }
                              onChange={(e) => {
                                let newValue = e.target.value.replace(
                                  /^0+(?=\d)/,
                                  "",
                                ); // ลบเลข 0 ข้างหน้า
                                if (newValue === "") newValue = ""; // ถ้าว่างให้แสดงค่าว่าง
                                handlePriceChange(
                                  newValue, // ใช้ค่าใหม่ที่ไม่มี 0 ข้างหน้า
                                  row.No,
                                  row.uniqueRowId,
                                  row.TicketName,
                                  row.ProductName,
                                  row.Date,
                                  row.Driver,
                                  row.Registration,
                                  row.Volume,
                                );
                              }}
                              onFocus={(e) => {
                                if (e.target.value === "0") {
                                  // ถ้าเป็น "0" ให้เคลียร์
                                  handlePriceChange(
                                    "",
                                    row.No,
                                    row.uniqueRowId,
                                    row.TicketName,
                                    row.ProductName,
                                    row.Date,
                                    row.Driver,
                                    row.Registration,
                                    row.Volume,
                                  );
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  // ถ้าว่างให้ตั้งค่าเป็น "0"
                                  handlePriceChange(
                                    "0",
                                    row.No,
                                    row.uniqueRowId,
                                    row.TicketName,
                                    row.ProductName,
                                    row.Date,
                                    row.Driver,
                                    row.Registration,
                                    row.Volume,
                                  );
                                }
                              }}
                            />
                          </Paper>
                        </Paper>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          height: "30px",
                          paddingLeft: "10px !important",
                          paddingRight: "10px !important",
                          fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontSize="14px"
                          sx={{ lineHeight: 1, margin: 0 }}
                          gutterBottom
                        >
                          {new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(
                            report[row.uniqueRowId]?.Amount || row.Amount,
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": { padding: "1px" },
                width: openNavbar ? "1020px" : "1110px",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      height: "30px",
                      fontWeight: "bold",
                      borderLeft: "1px solid white",
                      backgroundColor: "#616161",
                      color: "white",
                      width: 650,
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
                      textAlign: "right",
                      height: "30px",
                      fontWeight: "bold",
                      borderLeft: "1px solid white",
                      width: 120,
                      backgroundColor: "#616161",
                      color: "white",
                      paddingLeft: "40px !important",
                      paddingRight: "40px !important",
                      fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ lineHeight: 1, margin: 0 }}
                      gutterBottom
                    >
                      {new Intl.NumberFormat("en-US").format(
                        ticket.TotalVolume,
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "right",
                      height: "30px",
                      fontWeight: "bold",
                      borderLeft: "1px solid white",
                      width: 100,
                      backgroundColor: "#616161",
                      color: "white",
                      paddingLeft: "40px !important",
                      paddingRight: "40px !important",
                      fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ lineHeight: 1, margin: 0 }}
                      gutterBottom
                    ></Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "right",
                      height: "30px",
                      fontWeight: "bold",
                      borderLeft: "1px solid white",
                      width: 130,
                      backgroundColor: "#616161",
                      color: "white",
                      paddingLeft: "10px !important",
                      paddingRight: "10px !important",
                      fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontSize="14px"
                      sx={{ lineHeight: 1, margin: 0 }}
                      gutterBottom
                    >
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(ticket.TotalAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item md={2.5} xs={12}>
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
              onClick={generatePDF}
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
          <Tooltip title="บันทึกข้อมูล" placement="top">
            <Paper
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 2,
                backgroundColor: theme.palette.success.main,
                marginRight: 7,
                marginTop: 1,
                width: { md: "100%", xs: "100px" },
              }}
            >
              <Button
                color="inherit"
                fullWidth
                onClick={handleSave}
                sx={{ flexDirection: "row", gap: 0.5 }}
              >
                <SaveIcon fontSize="small" sx={{ color: "white" }} />
                <Typography
                  sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}
                >
                  บันทึก
                </Typography>
              </Button>
            </Paper>
          </Tooltip>
        </Grid>
      </Grid>
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
              sx={{ marginBottom: 2, borderRadius: 2, width: "100%" }}
            >
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  "& .MuiTableCell-root": { padding: "1px" },
                  width: openNavbar ? "1330px" : "1440px",
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
                        width: 150,
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
                        width: 350,
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
                        width: 150,
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
                        width: 150,
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
                  {transfer
                    .filter((t) => t.Status !== "ยกเลิก")
                    .map((row, index) => (
                      <TableRow>
                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", height: "30px" }}
                        >{`${row.Code} - ${row.Number}`}</TableCell>
                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
                          {!updateTranfer || row.id !== tranferID ? (
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
                                      value: formatThaiFull(
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
                        <TableCell sx={{ textAlign: "left", height: "30px" }}>
                          {!updateTranfer || row.id !== tranferID ? (
                            <Box sx={{ marginLeft: 2 }}>
                              {row.BankNameName}
                            </Box>
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
                                >
                                  <MenuItem
                                    value={tranferBankName}
                                    sx={{ fontSize: "14px" }}
                                  >
                                    {tranferBankName.split(":")[1]}
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
                                        value={`${row.id}:${row.BankName} - ${row.BankShortName}`}
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
                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
                          {!updateTranfer || row.id !== tranferID ? (
                            new Intl.NumberFormat("en-US", {
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
                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
                          {!updateTranfer || row.id !== tranferID ? (
                            row.Note
                          ) : (
                            <Paper component="form" sx={{ width: "100%" }}>
                              <TextField
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
                            position: "sticky",
                            right: 0,
                            backgroundColor: "white",
                          }}
                        >
                          {!updateTranfer || row.id !== tranferID ? (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <IconButton
                                color="warning"
                                onClick={() =>
                                  handleClickTranfer(
                                    row.id,
                                    row.DateStart,
                                    row.BankName,
                                    row.IncomingMoney,
                                    row.Note,
                                  )
                                }
                                size="small"
                                sx={{ borderRadius: 2 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteReport(row.id)}
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
                                sx={{ borderRadius: 2 }}
                              >
                                <CancelIcon />
                              </IconButton>
                              <IconButton
                                color="success"
                                onClick={handleSaveTranfer}
                                size="small"
                                sx={{ borderRadius: 2 }}
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
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  "& .MuiTableCell-root": { padding: "1px" },
                  width: openNavbar ? "1330px" : "1440px",
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
                        width: 700,
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
                        width: 350,
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
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(totalIncomingMoney)}
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
          <Grid item md={11} xs={12}>
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
                              (row) =>
                                row.Code === code && row.Status !== "ยกเลิก",
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
                    {/* <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "25px" }}>
                                <Paper sx={{ height: "25px" }}>
                                    <TextField
                                        value={price.Code || ""}
                                        onChange={(e) => handleChange("Code", e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '25px' },
                                            '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center', marginLeft: -1, marginRight: -1 },
                                        }}
                                    />
                                    </Paper>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1, marginRight: 1 }} gutterBottom>-</Typography>
                                    <Paper sx={{ height: "25px" }}>
                                    <TextField
                                        value={price.Number || ""}
                                        onChange={(e) => handleChange("Number", e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '25px' },
                                            '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center', marginLeft: -1, marginRight: -1 },
                                            width: "100px"
                                        }}
                                    />
                                    </Paper>
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        sx={{
                                            padding: 0.5,
                                            minWidth: 'auto',
                                            height: "25px",
                                            fontSize: '0.75rem',
                                            textTransform: 'none',
                                            marginLeft: 1
                                        }}
                                    >
                                        NEW
                                    </Button>
                                </Box> */}
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
                              inputProps: {
                                value: formatThaiFull(
                                  dayjs(price.DateStart, "DD/MM/YYYY"),
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
                    </Paper>
                  </Box>
                </Grid>
                <Grid item md={6} xs={12}></Grid>
              </Grid>
              <Grid container spacing={2}>
                {windowWidths >= 900 && <Grid item md={0.5} xs={12} />}
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
            {/* <TableContainer component={Paper}
                        sx={{ borderRadius: 2, height: "10vh" }}>
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                            <TableBody>
                                <TableRow sx={{ backgroundColor: "#bdbdbd" }}>
                                    <TableCell colSpan={6} width={1020}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 2 }} gutterBottom>กรอกข้อมูลการโอนเงินตรงนี้</Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow sx={{ backgroundColor: "#bdbdbd" }}>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 220 }} colSpan={2}>
                                        <Paper component="form" sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "25px" }}>
                                            <TextField
                                                value={price.Code || ""}
                                                onChange={(e) => handleChange("Code", e.target.value)}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': { height: '25px' },
                                                    '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center', marginLeft: -1, marginRight: -1 },
                                                }}
                                            />
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1, marginRight: 1 }} gutterBottom>-</Typography>
                                            <TextField
                                                value={price.Number || ""}
                                                onChange={(e) => handleChange("Number", e.target.value)}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': { height: '25px' },
                                                    '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center', marginLeft: -1, marginRight: -1 },
                                                    width: "100px"
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                disableElevation
                                                sx={{
                                                    padding: 0.5,
                                                    minWidth: 'auto',
                                                    height: "25px",
                                                    fontSize: '0.75rem',
                                                    textTransform: 'none',
                                                    marginLeft: 1
                                                }}
                                            >
                                                NEW
                                            </Button>
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                                {row.DateStart ? dayjs(row.DateStart).format("DD/MM/YYYY") : "-"}
                                                            </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 150 }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    openTo="day"
                                                    views={["year", "month", "day"]}
                                                    value={dayjs(price.DateStart, "DD/MM/YYYY")}  // กำหนดรูปแบบที่ต้องการ
                                                    format="DD/MM/YYYY"
                                                    onChange={(newValue) => handleChange("DateStart", newValue)}
                                                    slotProps={{
                                                        textField: {
                                                            size: "small",
                                                            fullWidth: true,
                                                            sx: {
                                                                "& .MuiOutlinedInput-root": {
                                                                    height: "25px",
                                                                    paddingRight: "8px",
                                                                },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: "14px",
                                                                    marginLeft: -1,
                                                                    marginRight: -1
                                                                },
                                                            },
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Paper>
                                    </TableCell>

                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 350 }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <FormControl
                                                fullWidth
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': { height: '25px' },
                                                    '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center' },
                                                }}
                                            >
                                                <Select
                                                    value={price.BankName || ""}
                                                    onChange={(e) => handleChange("BankName", e.target.value)}
                                                >
                                                    {
                                                        bankDetail.map((row) => (
                                                            <MenuItem value={`${row.BankName} - ${row.BankShortName}`} sx={{ fontSize: "14px", }}>{`${row.BankName} - ${row.BankShortName}`}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </Paper>
                                    </TableCell>

                                    {["IncomingMoney", "Note"].map((field) => (
                                        <TableCell key={field} sx={{ textAlign: "center", height: '35px', width: 150 }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                                <TextField
                                                    value={price[field] || ""}
                                                    onChange={(e) => handleChange(field, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': { height: '25px' },
                                                        '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center' },
                                                    }}
                                                />
                                            </Paper>
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ textAlign: "center", width: 60, height: "30px" }}>
                                            <Tooltip title="ยกเลิก" placement="left">
                                                <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}>
                                                    <BackspaceIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer> */}
          </Grid>
          <Grid item md={1} xs={12} sx={{ marginTop: 0.5 }}>
            {windowWidths <= 900 ? (
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

export default UpdateInvoice;
