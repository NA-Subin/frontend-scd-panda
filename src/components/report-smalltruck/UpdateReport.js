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
import { IconButtonError, IconButtonInfo, IconButtonSuccess, RateOils, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD, TablecellSelling } from "../../theme/style";
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BackspaceIcon from '@mui/icons-material/Backspace';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import EventIcon from '@mui/icons-material/Event';
import theme from "../../theme/theme";
import { apiPost, apiPut } from "../../server/apiClient";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/th";
import "../../theme/scrollbar.css"
import jsPDF from "jspdf";
import notoSansThaiRegular from "@fontsource/noto-sans-thai";
import html2canvas from "html2canvas";
import BankDetail from "./BankDetail";
import buddhistEra from 'dayjs/plugin/buddhistEra'; // ใช้ plugin Buddhist Era (พ.ศ.)
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";

dayjs.locale('th');
dayjs.extend(buddhistEra);

const UpdateReport = (props) => {
    const { ticket, open, dateRanges, months } = props;
    const [formData, setFormData] = useState({}); // เก็บค่าฟอร์มชั่วคราว
    const [show, setShow] = useState(false);
    const [test, setTest] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // กำหนดชำระเงินบนใบวางบิล - เลือกได้ว่าจะใช้ตามที่คำนวณไว้ (วันที่วางบิล + ระยะเวลาเครดิตของตั๋วนี้)
    // กำหนดวันที่เองแบบ manual หรือไม่ระบุวันที่เลยก็ได้
    const [dueDateMode, setDueDateMode] = useState("fixed"); // "fixed" | "manual" | "none"
    const [manualDueDate, setManualDueDate] = useState(dayjs().format("DD/MM/YYYY"));

    // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    const { reghead, company } = useBasicData();

    const showTickets = Object.values(tickets || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    });
    const customertransport = Object.values(customertransports || {});
    const customergasstation = Object.values(customergasstations || {});
    const customerTickets = Object.values(customertickets || {});
    const showTrips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });
    const registrationHead = Object.values(reghead || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const companies = Object.values(company || {});
    const bankDetail = Object.values(banks || {}).filter((row) => row.Status !== "ยกเลิก");
    const transferMoneyDetail = Object.values(transferMoney || {});
    const invoiceDetail = Object.values(invoiceReport || {});

    const transfer = transferMoneyDetail.filter((row) => row.TicketNo === ticket.No && row.TicketName === ticket.TicketName && row.Status !== "ยกเลิก");

    let CountCompany1 = 0;
    let CountCompany2 = 0;

    // Transport is now a real company uuid, not a legacy "id:Name" composite -
    // compare against the two hardcoded transport companies (id 2 and 3) by
    // uuid instead of a split numeric prefix.
    const transportCompany2Uuid = companies.find((c) => c.id === 2)?.uuid;
    const transportCompany3Uuid = companies.find((c) => c.id === 3)?.uuid;

    transfer.forEach(row => {
        const incoming = Number(row.IncomingMoney) || 0; // แปลงเป็นตัวเลข เผื่อเจอ undefined

        if (row.Transport === transportCompany2Uuid) {
            CountCompany1 += incoming;
        } else if (row.Transport === transportCompany3Uuid) {
            CountCompany2 += incoming;
        }
    });

    const totalIncomingMoney = transferMoneyDetail
        .filter(trans => trans.TicketName === ticket.TicketName && trans.Status !== "ยกเลิก")
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
    });

    const startDate = dayjs(ticket.DateStart, "DD/MM/YYYY");
    const endDate = dayjs(ticket.DateEnd, "DD/MM/YYYY");

    const ticketsList = showTickets.filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY"); // แปลง item.Date ก่อนนะ

        return (
            item.TicketName === ticket.TicketName &&
            item.Trip !== "ยกเลิก" &&
            itemDate.isBetween(startDate, endDate, "day", "[]") // [] คือรวมวันแรกกับวันสุดท้ายด้วย
        );
    });

    const calculateDueDate = (dateString, creditDays) => {
        if (!dateString || creditDays === null || creditDays === undefined) return "ไม่พบข้อมูลวันที่";

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day);

        date.setDate(date.getDate() + creditDays);

        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);

        return `กำหนดชำระเงินวันที่ ${formattedDate}`;
    };

    // เลือกได้ 3 แบบจากปุ่มด้านบน: "fixed" ใช้สูตรเดิม (วันที่ตั๋ว + เครดิตของตั๋วนี้),
    // "manual" ใช้วันที่ที่กำหนดเอง, "none" ไม่ระบุวันที่กำหนดชำระเลย
    const resolveDueDateText = () => {
        if (dueDateMode === "none") return "ไม่ระบุกำหนดชำระเงิน";
        if (dueDateMode === "manual") {
            const formattedDate = new Intl.DateTimeFormat("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(dayjs(manualDueDate, "DD/MM/YYYY").toDate());
            return `กำหนดชำระเงินวันที่ ${formattedDate}`;
        }
        return calculateDueDate(ticket.Date, ticket.CreditTime);
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
    const handlePriceChange = (value, no, uniqueRowId, ticketName, productName, date, driver, registration, volume) => {

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
        return tickets.flatMap((row) => {
            const matchedTrip = showTrips.find(trip => trip.id === row.Trip + 1);

            const company = registrationHead.find(trip => trip.uuid === matchedTrip.Registration);

            const companyAddress = companies.find(com => com.uuid === company.Company);

            return Object.entries(row.Product)
                .filter(([productName]) => productName !== "P")
                .map(([productName, Volume], index) => ({
                    No: row.No,
                    TicketName: row.TicketName,
                    Rate: matchedTrip.Depot.split(":")[1] === "ลำปาง" ? (row.Rate1 || 0)
                        : matchedTrip.Depot.split(":")[1] === "พิจิตร" ? (row.Rate2 || 0)
                            : matchedTrip.Depot.split(":")[1] === "สระบุรี" || matchedTrip.Depot.split(":")[1] === "บางปะอิน" || matchedTrip.Depot.split(":")[1] === "IR" ? (row.Rate3 || 0)
                                : 0,
                    Amount: Volume.Amount || 0,
                    Depot: matchedTrip ? matchedTrip.Depot : row.Depot,
                    Date: row.Date,
                    Driver: matchedTrip ? matchedTrip.Driver : row.Driver,
                    Registration: matchedTrip ? matchedTrip.Registration : row.Registration,
                    ProductName: productName,
                    Volume: Volume.Volume * 1000,
                    Company: `${companyAddress.id}:${companyAddress.Name}`,
                    CompanyAddress: companyAddress.Address,
                    CardID: companyAddress.CardID,
                    Phone: companyAddress.Phone,
                    uniqueRowId: `${index}:${productName}:${row.No}`,
                }));
        });
    };

    const processedTickets = processTickets(
        ticketsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        showTrips
    );

    // แยก processedTickets ออกเป็น 2 ส่วนตาม Company และเริ่ม No ใหม่ให้แต่ละส่วน
    const splitByCompany = (processedTickets) => {
        const company1Tickets = processedTickets.filter(row => row.Company.split(":")[0] === "2");
        const company2Tickets = processedTickets.filter(row => row.Company.split(":")[0] === "3");

        // รีเซ็ต No ให้กับแต่ละส่วน
        const resetNo = (tickets) => {
            return tickets.map((row, index) => ({
                ...row,
                No: index + 1, // เริ่ม No ใหม่ตามลำดับ
            }));
        };

        return {
            company1Tickets: resetNo(company1Tickets),
            company2Tickets: resetNo(company2Tickets),
        };
    };

    // แยกข้อมูลออกเป็น 2 ส่วน
    const { company1Tickets, company2Tickets } = splitByCompany(processedTickets);

    // ฟังก์ชันคำนวณผลรวม
    const calculateTotal = (tickets) => {
        // ใช้ reduce เพื่อคำนวณค่าทั้งหมด
        const result = tickets.reduce(
            (acc, row) => {
                const amount = row.Volume * row.Rate;

                // คำนวณยอดโอนจาก Price ที่ตรงกับ Company
                const totalIncomingMoney = Array.isArray(ticket.Price)
                    ? ticket.Price
                        .filter(p => p.Transport === row.Company)
                        .reduce((sum, p) => sum + (Number(p.IncomingMoney) || 0), 0)
                    : 0;

                acc.totalVolume += row.Volume;
                acc.transferAmount += (row.TransferAmount || 0);
                acc.totalAmount += amount;
                acc.totalTax += amount * 0.01;
                acc.totalPayment += amount - (amount * 0.01);
                acc.totalIncomingMoney = totalIncomingMoney; // รวมยอดโอนทั้งหมดในแต่ละรอบ

                return acc;
            },
            { totalVolume: 0, transferAmount: 0, totalAmount: 0, totalTax: 0, totalPayment: 0, totalIncomingMoney: 0 }
        );

        // คำนวณ totalOverdueTransfer หลังจาก reduce เสร็จ
        result.totalOverdueTransfer = result.totalPayment - result.totalIncomingMoney;

        return result;
    };

    // คำนวณผลรวมสำหรับทั้งสองบริษัท
    const total1 = calculateTotal(company1Tickets);
    const total2 = calculateTotal(company2Tickets);

    // company1Tickets[0].Company / company2Tickets[0].Company are locally
    // reconstructed "id:Name" composites; invoice.Transport is a real company
    // uuid - resolve both sides to the same uuid to compare.
    const company1TransportUuid = companies.find((c) => c.id === Number(company1Tickets[0]?.Company?.split(":")[0]))?.uuid;
    const company2TransportUuid = companies.find((c) => c.id === Number(company2Tickets[0]?.Company?.split(":")[0]))?.uuid;

    const invoices1 = invoiceDetail.filter((row) => row.TicketNo === ticket.No && row.TicketName === ticket.TicketName && row.Transport === company1TransportUuid);
    const invoices2 = invoiceDetail.filter((row) => row.TicketNo === ticket.No && row.TicketName === ticket.TicketName && row.Transport === company2TransportUuid);

    const generatePDFCompany1 = () => {
        let Code = ""
        if (invoices1.length !== 0) {
            Code = `${invoices1[0].Code}-${invoices1[0].Number}`
        } else {
            const lastItemInvoice = invoiceDetail[invoiceDetail.length - 1];
            let newNumberInvoice = 1;
            if (lastItemInvoice && lastItemInvoice.Number && lastItemInvoice.Code === `lV${currentCode}`) {
                newNumberInvoice = Number(lastItemInvoice.Number) + 1;
            }
            const formattedNumberInvoice = String(newNumberInvoice).padStart(4, "0");

            Code = `lV${currentCode}-${formattedNumberInvoice}`;

            apiPost("/api/invoice", {
                id: invoiceDetail.length,
                Code: `lV${currentCode}`,
                Number: formattedNumberInvoice,
                DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
                Transport: company1TransportUuid || null,
                TicketName: ticket.TicketName,
                TicketNo: ticket.No,
                TicketType: ticket.CustomerType,
            })
                .then(() => {
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
            Company: company1Tickets[0].Company.split(":")[1],
            Address: company1Tickets[0].CompanyAddress,
            CardID: company1Tickets[0].CardID,
            Phone: company1Tickets[0].Phone,
            Code: Code,
            Date: invoices1[0].DateStart,
            DateStart: ticket.Date,
            DateEnd: resolveDueDateText()
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
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        );

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    const generatePDFCompany2 = () => {
        let Code = ""
        if (invoices2.length !== 0) {
            Code = `${invoices2[0].Code}-${invoices2[0].Number}`
        } else {
            const lastItemInvoice = invoiceDetail[invoiceDetail.length - 1];
            let newNumberInvoice = 1;
            if (lastItemInvoice && lastItemInvoice.Number && lastItemInvoice.Code === `lV${currentCode}`) {
                newNumberInvoice = Number(lastItemInvoice.Number) + 1;
            }
            const formattedNumberInvoice = String(newNumberInvoice).padStart(4, "0");

            Code = `lV${currentCode}-${formattedNumberInvoice}`;

            // NOTE: previously wrote company1Tickets[0].Company here (a
            // copy-paste bug) - a company-2 invoice would silently persist
            // company 1's transport company. Fixed to use company2.
            apiPost("/api/invoice", {
                id: invoiceDetail.length,
                Code: `lV${currentCode}`,
                Number: formattedNumberInvoice,
                DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
                Transport: company2TransportUuid || null,
                TicketName: ticket.TicketName,
                TicketNo: ticket.No,
                TicketType: ticket.CustomerType,
            })
                .then(() => {
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
            Company: company2Tickets[0].Company.split(":")[1],
            Address: company2Tickets[0].CompanyAddress,
            CardID: company2Tickets[0].CardID,
            Phone: company2Tickets[0].Phone,
            Code: Code,
            Date: invoices2[0].DateStart,
            DateStart: ticket.Date,
            DateEnd: resolveDueDateText()
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
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        );

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    const handleSave = () => {
        (async () => {
            // Product is a single JSONB column, and several report rows can
            // touch different products on the SAME ticket in one save -
            // merge all of them per ticket first, then issue one PUT per
            // ticket, so a later write in this loop never clobbers an
            // earlier one against a stale Product value.
            const mergedProductByTicketUuid = new Map();

            for (const data of Object.values(report)) {
                if (data.No == null || data.ProductName == null || data.ProductName.trim() === "") {
                    continue;
                }

                const ticketRow = showTickets.find((t) => t.No === data.No);
                if (!ticketRow?.uuid) {
                    continue;
                }

                if (!mergedProductByTicketUuid.has(ticketRow.uuid)) {
                    mergedProductByTicketUuid.set(ticketRow.uuid, structuredClone(ticketRow.Product || {}));
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
                refetchTripData?.();
            } catch (error) {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            }
        })();
    };

    const handlePost = () => {
        setPrice(prevPrice => {
            const newIndex = prevPrice.length > 0 ? Math.max(...prevPrice.map(item => Number(item.id))) + 1 : 0;
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
        setPrice(prev => ({
            ...prev,
            [field]: field === "DateStart" ? dayjs(value).format("DD/MM/YYYY") : value
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

    const handleNewInvoice1 = () => {
        if (!invoices1[0]?.uuid) {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
            return;
        }
        apiPut(`/api/invoice/${invoices1[0].uuid}`, { TicketNo: "ยกเลิก" })
            .then(() => {
                ShowSuccess("บันทึกข้อมูลเรียบร้อย");
                refetchTripData?.();
            })
            .catch((error) => {
                ShowError("ไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    }

    const handleNewInvoice2 = () => {
        if (!invoices2[0]?.uuid) {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
            return;
        }
        apiPut(`/api/invoice/${invoices2[0].uuid}`, { TicketNo: "ยกเลิก" })
            .then(() => {
                ShowSuccess("บันทึกข้อมูลเรียบร้อย");
                refetchTripData?.();
            })
            .catch((error) => {
                ShowError("ไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    }

    const handleSubmit = () => {
        const newId = transferMoneyDetail.length;
        const total = Number(newNumber) + 1;

        const newPrice = {
            ...price,
            id: newId,
        };

        apiPost("/api/transfermoney", newPrice)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลเรียบร้อย");
                refetchTripData?.();

                // เตรียมค่าใหม่สำหรับ price หลังบันทึก
                const nextFormattedNumber = String(total).padStart(4, "0");
                setPrice({
                    ...newPrice,
                    id: newId + 1,
                    Number: nextFormattedNumber,
                });
            })
            .catch((error) => {
                ShowError("ไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

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

    return (
        <React.Fragment>
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={1}>
                    <Grid item md={7} xs={12}>
                        <Typography variant="subtitle1" sx={{ marginBottom: -2, fontSize: "18px" }} fontWeight="bold" gutterBottom>
                            รายละเอียด : วันที่ส่ง : {ticket.Date} จากตั๋ว : {ticket.TicketNameName}
                        </Typography>
                    </Grid>
                    {
                        windowWidth >= 900 &&
                        <Grid item md={5} xs={12}>
                            <Typography variant='subtitle1' fontWeight="bold" sx={{ marginBottom: -3, fontSize: "12px", color: "red", textAlign: "right" }} gutterBottom>*พิมพ์ใบวางบิลของบจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่) ตรงนี้*</Typography>
                        </Grid>
                    }

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
                                <FormControlLabel value="fixed" control={<Radio size="small" />} label="ตามที่กำหนดไว้" />
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

                    <Grid item md={7.5} xs={12}>
                        <Typography variant="subtitle1" sx={{ marginTop: 1, fontSize: "18px" }} fontWeight="bold" gutterBottom>
                            บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)
                        </Typography>
                    </Grid>
                    <Grid item md={3} xs={8} textAlign="right">
                        <Grid container sx={{ marginTop: 1 }}>
                            <Grid item xs={3}>
                                <Button variant="contained" color="info" sx={{ height: "25px", marginRight: 1 }} onClick={handleNewInvoice1}>
                                    NEW
                                </Button>
                            </Grid>
                            <Grid item xs={5}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small"
                                        fullWidth
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
                                                marginLeft: -1
                                            },
                                        }}
                                        value={invoices1[0]?.Code || `lV${currentCode}`}
                                    />
                                </Paper>
                            </Grid>
                            <Grid item xs={0.5}>
                                <Typography variant="subtitle1" textAlign="center" fontWeight="bold" gutterBottom>- </Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small"
                                        fullWidth
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
                                                marginRight: -2
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
                                variant='contained'
                                fullWidth
                                sx={{
                                    flexDirection: "row",
                                    gap: 0.5,
                                    borderRadius: 2
                                }}
                                onClick={generatePDFCompany1}
                            >
                                <PrintIcon sx={{ color: "white" }} />
                                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
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
                        height: "200px", // ความสูงรวมของ container หลัก
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
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, width: "1250px" }}>
                            <TableHead>
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ลำดับ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        วันที่
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 300, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ผู้ขับ/ป้ายทะเบียน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ชนิดน้ำมัน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        จำนวนลิตร
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ค่าบรรทุก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดเงิน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        หักภาษี 1%
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
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
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, width: "1250px" }}>
                            <TableBody>
                                {company1Tickets.map((row, index) => {
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
                                                    sx={{ textAlign: "center", height: '30px', width: 300, verticalAlign: "middle" }}
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
                                                    {new Intl.NumberFormat("en-US").format(row.Volume)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume * row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) * (0.01))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) - ((row.Volume * row.Rate) * (0.01)))}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
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
                        <Grid container spacing={2} sx={{ backgroundColor: "#616161", color: "white", paddingLeft: 2, paddingRight: 2, width: "1270px" }}>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            รวมลิตร
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalVolume)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดเงิน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalAmount)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5.5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            หักภาษี 1%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6.5}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalTax)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดชำระ
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalPayment)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(CountCompany1)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ค้างโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(Number(total1.totalPayment) - Number(CountCompany1))}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
            <Box marginTop={3} sx={{ width: "100%" }}>
                <Grid container spacing={1}>
                    {
                        windowWidth >= 900 &&
                        <Grid item md={12} xs={12}>
                            <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "right", marginBottom: -1 }} gutterBottom>*พิมพ์ใบวางบิลของหจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่) ตรงนี้*</Typography>
                        </Grid>
                    }
                    <Grid item md={7.5} xs={12}>
                        <Typography variant="subtitle1" sx={{ marginTop: 1, fontSize: "18px" }} fontWeight="bold" gutterBottom>
                            หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)
                        </Typography>
                    </Grid>
                    <Grid item md={3} xs={8} textAlign="right">
                        <Grid container sx={{ marginTop: 1 }}>
                            <Grid item xs={3}>
                                <Button variant="contained" color="info" sx={{ height: "25px", marginRight: 1 }} onClick={handleNewInvoice2}>
                                    NEW
                                </Button>
                            </Grid>
                            <Grid item xs={5}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small"
                                        fullWidth
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
                                                marginLeft: -1
                                            },
                                        }}
                                        value={invoices2[0]?.Code || `lV${currentCode}`}
                                    />
                                </Paper>
                            </Grid>
                            <Grid item xs={0.5}>
                                <Typography variant="subtitle1" textAlign="center" fontWeight="bold" gutterBottom>- </Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small"
                                        fullWidth
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
                                                marginRight: -2
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
                    </Grid>
                </Grid>
                <Paper
                    className="custom-scrollbar"
                    sx={{
                        position: "relative",
                        maxWidth: "100%",
                        height: "200px", // ความสูงรวมของ container หลัก
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
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, width: "1250px" }}>
                            <TableHead>
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ลำดับ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        วันที่
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 300, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ผู้ขับ/ป้ายทะเบียน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ชนิดน้ำมัน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        จำนวนลิตร
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ค่าบรรทุก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดเงิน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        หักภาษี 1%
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
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
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px", width: "1250px" } }}>
                            <TableBody>
                                {company2Tickets.map((row, index) => {
                                    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
                                    const rowSpan = rowSpanMap2[key] && !mergedCells2[key] ? rowSpanMap2[key] : 0;
                                    if (rowSpan) {
                                        mergedCells2[key] = true;
                                        displayIndex2++;
                                    }

                                    return (
                                        <TableRow key={`${row.TicketName}-${row.ProductName}-${index}`}>
                                            {rowSpan > 0 && (
                                                <TableCell rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 50, verticalAlign: "middle" }}>
                                                    {displayIndex2}
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
                                                    sx={{ textAlign: "center", height: '30px', width: 300, verticalAlign: "middle" }}
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
                                                    {new Intl.NumberFormat("en-US").format(row.Volume)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume * row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) * (0.01))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) - ((row.Volume * row.Rate) * (0.01)))}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
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
                        <Grid container spacing={2} sx={{ backgroundColor: "#616161", color: "white", paddingLeft: 2, paddingRight: 2, width: "1270px" }}>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            รวมลิตร
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalVolume)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดเงิน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalAmount)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5.5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            หักภาษี 1%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6.5}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalTax)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดชำระ
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalPayment)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(CountCompany2)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ค้างโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(Number(total2.totalPayment) - Number(CountCompany2))}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box >
            <Typography variant='subtitle1' fontWeight="bold" sx={{ marginTop: 5, fontSize: "18px" }} gutterBottom>ข้อมูลการโอน</Typography>
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={2}>
                    <Grid item md={12} xs={12}>
                        <TableContainer
                            component={Paper}
                            sx={{ marginBottom: 2, borderRadius: 2 }}
                        >
                            <Box>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, width: "1250px" }}>
                                    <TableHead>
                                        <TableRow>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: "30px", backgroundColor: theme.palette.success.main }}>ลำดับ</TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 120, height: "30px", backgroundColor: theme.palette.success.main }}>Statement</TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: "30px", backgroundColor: theme.palette.success.main }}>วันที่เงินเข้า</TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 250, height: "30px", backgroundColor: theme.palette.success.main }}>เลขที่บัญชี</TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 250, height: "30px", backgroundColor: theme.palette.success.main }}>บริษัทรับจ้างขนส่ง</TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 130, height: "30px", backgroundColor: theme.palette.success.main }}>ยอดเงินเข้า</TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: "30px", backgroundColor: theme.palette.success.main }}>หมายเหตุ</TablecellSelling>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            transfer.map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 50 }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 120 }}>{`${row.Code} - ${row.Number}`}</TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>{row.DateStart}</TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 250 }}>{row.BankNameName}</TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 250 }}>{companies.find((c) => c.uuid === row.Transport)?.Name || ""}</TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 130 }}>{new Intl.NumberFormat("en-US").format(row.IncomingMoney)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>{row.Note}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </Box>
                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, width: "1250px" }}>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white", width: 770 }} colSpan={4}>
                                            <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                รวม
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", width: 280, backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                            <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                {new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid item md={11.5} xs={12}>
                        <Paper component="form" sx={{ borderRadius: 2, p: 2, backgroundColor: "#bdbdbd" }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ marginLeft: 2 }} gutterBottom>กรอกข้อมูลการโอนเงินตรงนี้</Typography>
                            <Divider sx={{ marginBottom: 1, backgroundColor: "white" }} />
                            <Grid container spacing={2}>
                                <Grid item md={3} xs={6}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>Statement</Typography>
                                        <Grid container>
                                            <Grid item xs={4.5}>
                                                <Paper sx={{ height: "25px", width: "100%" }}>
                                                    <TextField
                                                        value={price.Code || ""}
                                                        onChange={(e) => handleChange("Code", e.target.value)}
                                                        size="small"
                                                        fullWidth
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': { height: '25px' },
                                                            '& .MuiInputBase-input': { fontSize: "14px", fontWeight: "bold", textAlign: 'center', marginLeft: -1, marginRight: -1 },
                                                            '& .MuiInputBase-input.Mui-disabled': {
                                                                color: "#424242", // เปลี่ยนสีตัวอักษรเมื่อ disabled
                                                                WebkitTextFillColor: "#424242", // สำหรับบางเบราว์เซอร์ที่ไม่อ่าน color เมื่อ disabled 
                                                            }
                                                        }}
                                                        disabled
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={0.5}>
                                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>-</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Paper sx={{ height: "25px", width: "100%" }}>
                                                    <TextField
                                                        value={price.Number || ""}
                                                        onChange={(e) => handleChange("Number", e.target.value)}
                                                        size="small"
                                                        fullWidth
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': { height: '25px' },
                                                            '& .MuiInputBase-input': { fontSize: "14px", fontWeight: "bold", textAlign: 'center', marginLeft: -1, marginRight: -1 },
                                                            '& .MuiInputBase-input.Mui-disabled': {
                                                                color: "#424242", // เปลี่ยนสีตัวอักษรเมื่อ disabled
                                                                WebkitTextFillColor: "#424242", // สำหรับบางเบราว์เซอร์ที่ไม่อ่าน color เมื่อ disabled 
                                                            }
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
                                                        minWidth: 'auto',
                                                        height: "25px",
                                                        fontSize: '0.75rem',
                                                        textTransform: 'none',
                                                        marginLeft: 1
                                                    }}
                                                >
                                                    NEW
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                                <Grid item md={3} xs={6}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginRight: 1, whiteSpace: "nowrap" }} gutterBottom>เงินเข้า</Typography>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -0.5 }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                                <DatePicker
                                                    openTo="day"
                                                    views={["year", "month", "day"]}
                                                    value={dayjs(price.DateStart, "DD/MM/YYYY")}
                                                    onChange={(newValue) => handleChange("DateStart", newValue)}
                                                    format="DD MMMM YYYY" // ใช้ BBBB แทนปี พ.ศ.
                                                    slotProps={{
                                                        textField: {
                                                            size: "small",
                                                            fullWidth: true,
                                                            sx: {
                                                                "& .MuiOutlinedInput-root": { height: "30px", paddingRight: "8px" },
                                                                "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1, marginRight: -1 },
                                                            },
                                                            InputProps: {
                                                                startAdornment: (
                                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                        วันที่ :
                                                                    </InputAdornment>
                                                                ),
                                                            }
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Paper>
                                    </Box>
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginRight: 1, whiteSpace: "nowrap" }} gutterBottom>บริษัทรับจ้างขนส่ง</Typography>

                                        <Paper component="form" sx={{ width: "100%", marginTop: -0.5 }}>
                                            <FormControl
                                                fullWidth
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': { height: '30px' },
                                                    '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center' },
                                                }}
                                            >
                                                <Select
                                                    value={price.Transport || ""}
                                                    onChange={(e) => handleChange("Transport", e.target.value)}
                                                >
                                                    {
                                                        companies.map((row) => (
                                                            row.id !== 1 &&
                                                            <MenuItem key={row.uuid} value={row.uuid} sx={{ fontSize: "14px", }}>{row.Name}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </Paper>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                {
                                    windowWidth >= 900 && <Grid item md={0.5} xs={12} />
                                }
                                <Grid item md={5.5} xs={6}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginRight: 1, whiteSpace: "nowrap" }} gutterBottom>บัญชี</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <FormControl
                                                fullWidth
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': { height: '30px' },
                                                    '& .MuiInputBase-input': { fontSize: "16px", textAlign: 'center' },
                                                }}
                                            >
                                                <Select
                                                    value={price.BankName || ""}
                                                    onChange={(e) => handleChange("BankName", e.target.value)}
                                                >
                                                    {
                                                        bankDetail
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
                                                                    value={row.uuid}
                                                                    sx={{ fontSize: "14px" }}
                                                                >
                                                                    {`${row.BankName}....${row.BankShortName}..${row.BankID}`}
                                                                </MenuItem>
                                                            ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </Paper>
                                    </Box>
                                </Grid>
                                <Grid item md={3} xs={6}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginRight: 1, whiteSpace: "nowrap" }} gutterBottom>จำนวนเงิน</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField
                                                type="number"
                                                value={price.IncomingMoney || ""}
                                                onChange={(e) => handleChange("IncomingMoney", e.target.value)}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': { height: '30px' },
                                                    '& .MuiInputBase-input': { fontSize: "16px", textAlign: 'center' },
                                                }}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginRight: 1, whiteSpace: "nowrap" }} gutterBottom>หมายเหตุ</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField
                                                value={price.Note || ""}
                                                onChange={(e) => handleChange("Note", e.target.value)}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': { height: '30px' },
                                                    '& .MuiInputBase-input': { fontSize: "16px", textAlign: 'center' },
                                                }}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item md={0.5} xs={12} sx={{ marginTop: 0.5 }}>
                        {
                            windowWidth <= 900 ?
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <BankDetail />
                                    <Tooltip title="บันทึก" placement="left">
                                        <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main, marginLeft: 3, marginRight: -1, marginTop: 1 }}>
                                            <Button
                                                color="inherit"
                                                fullWidth
                                                onClick={handleSubmit}
                                                sx={{ flexDirection: "column", gap: 0.5 }}
                                            >
                                                <SaveIcon fontSize="small" sx={{ color: "white" }} />
                                                <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                    บันทึก
                                                </Typography>
                                            </Button>
                                        </Paper>
                                    </Tooltip>
                                </Box>
                                :
                                <>
                                    <BankDetail />
                                    <Tooltip title="บันทึก" placement="left">
                                        <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main, marginLeft: -1, marginRight: -1, marginTop: 1 }}>
                                            <Button
                                                color="inherit"
                                                fullWidth
                                                onClick={handleSubmit}
                                                sx={{ flexDirection: "column", gap: 0.5 }}
                                            >
                                                <SaveIcon fontSize="small" sx={{ color: "white" }} />
                                                <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                    บันทึก
                                                </Typography>
                                            </Button>
                                        </Paper>
                                    </Tooltip>
                                </>
                        }
                    </Grid>
                </Grid>
            </Box>
        </React.Fragment >
    );
};

export default UpdateReport;
