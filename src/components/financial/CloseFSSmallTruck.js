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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { buildPeriodsForYear, findCurrentPeriod } from "./Paid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellPink, TablecellTickets } from "../../theme/style";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const CloseFSSmallTruck = ({ openNavbar }) => {
    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(true);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [firstDay, setFirstDay] = React.useState(dayjs(new Date).startOf("month"));
    const [lastDay, setLastDay] = React.useState(dayjs(new Date).startOf("month"));
    const [driverDetail, setDriver] = React.useState([]);
    const [companyName, setCompanyName] = React.useState("0:ทั้งหมด");
    const seenDrivers = new Set();

    const companyDetail = [
        {
            id: 0,
            Name: "ทั้งหมด"
        },
        {
            id: 1,
            Name: "บริษัท แพนด้า สตาร์ ออยล์  จำกัด  (สำนักงานใหญ่)"
        },
        {
            id: 2,
            Name: "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)"
        },
        {
            id: 3,
            Name: "หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)"
        },
        {
            id: 4,
            Name: "บริษัท แพนด้า สตาร์ ออยล์ จำกัด ( สาขาที่ 00002)"
        }
    ]

    const DRIVER_ONLY_BANKS = ["เงินเดือน", "ประกันสังคม", "ค่าโทรศัพท์"];

    const getKey = (r, bankName) => {
        const isDriverOnly = DRIVER_ONLY_BANKS.includes(bankName);

        const driverKey = normalizeReg(r.Driver);
        const regKey = normalizeReg(r.Registration);

        // 🔥 กลุ่มพิเศษ → map ไปหา registration
        if (isDriverOnly) {
            return driverToRegMap[driverKey] || driverKey;
        }

        // 🔥 ปกติ
        return regKey || driverKey;
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            let width = window.innerWidth;
            if (!openNavbar) {
                width += 120;
            }
            setWindowWidth(width);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openNavbar]);

    const handleMonth = (newValue) => {
        if (newValue) {
            const month = driverData.filter((row) =>
                formatmonth(row.Date) === dayjs(newValue).format("MMMM")
            )

            const notCancel = driverDataNotCancel.filter((row) =>
                formatmonth(row.Date) === dayjs(newValue).format("MMMM")
            )

            setData(month)
            setMonths(dayjs(newValue))
            setFirstDay(dayjs(newValue).startOf("month"));
            setLastDay(dayjs(newValue).endOf("month"));
            setDataNotCancel(notCancel)
        }
    };

    const handleYear = (newValue) => {
        if (newValue) {
            const year = driverData.filter((row) =>
                formatyear(row.Date).toString() === dayjs(newValue).format("YYYY")
            )

            const notCancel = driverDataNotCancel.filter((row) =>
                formatyear(row.Date).toString() === dayjs(newValue).format("YYYY")
            )
            setData(year)
            setYears(dayjs(newValue))
            setFirstDay(dayjs(newValue).startOf("year"));
            setLastDay(dayjs(newValue).endOf("year"));
            setDataNotCancel(notCancel)
        }
    };

    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(1);

    useEffect(() => {
        if (!months || !years) return;

        const year = dayjs(years).year();
        const list = buildPeriodsForYear(year);

        const monthNum = dayjs.isDayjs(months)
            ? months.month() + 1
            : Number(months);

        const filtered = list.filter(period => {
            const endDate = dayjs(period.end, ['DD/MM/YYYY', 'YYYY-MM-DD']);
            const endMonth = endDate.month() + 1;

            return endMonth === monthNum;
        });

        setPeriods(filtered);

        const currentNo = findCurrentPeriod(filtered);
        if (currentNo) {
            setPeriod(currentNo);
        }
    }, [years, months]);

    const { company, drivers, reghead, regtail, small, transport, companypayment, expenseitems, customersmalltruck } = useBasicData();
    const { order, tickets, trip, typeFinancial, report, reportFinancial } = useTripData();
    const reports = Object.values(report || {});
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(transport);
    const registrationS = Object.values(regtail);
    const registrationSm = Object.values(small);
    const expenseitem = Object.values(expenseitems);
    const reportFinancials = Object.values(reportFinancial);
    const companypaymentDetail = Object.values(companypayment);
    const companies = Object.values(company || {});
    const driver = Object.values(drivers || {});
    const ticketsS = Object.values(customersmalltruck || {});

    const typeF = Object.values(typeFinancial || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    });
    const registration = Object.values(reghead || {});
    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

    const ticketWithTrip = Object.values(tickets || {}).map(curr => {
        const trip = trips.find(
            t => Number(t.id) - 1 === Number(curr.Trip)
        );

        return {
            ...curr,
            TripDetail: trip,
            TripDate:
                trip?.DateReceive ||
                null
        };
    });
    const ticket = ticketWithTrip.filter(item => {
        if (!item.TripDate) return false; // หรือ true ถ้าไม่อยากตัดทิ้ง

        const d = dayjs(item.TripDate, "DD/MM/YYYY");
        if (!d.isValid()) return false;

        return d.isSameOrAfter(
            dayjs("01/01/2026", "DD/MM/YYYY"),
            "day"
        );
    });
    const parseNumber = (val) =>
        Number(String(val || 0).replace(/,/g, "")) || 0;

    const result = useMemo(() => {
        return orders
            .filter(
                (tk) =>
                    tk.CustomerType === "ตั๋วรถเล็ก" &&
                    tk.Status !== "ยกเลิก" &&
                    tk.Trip !== "ยกเลิก"
            )
            .flatMap((tk) => {
                const customer = ticketsS.find(
                    (c) => c.uuid === tk.TicketName
                );

                const trip = trips.find((t) => Number(t.id) - 1 === Number(tk.Trip));

                return Object.entries(tk.Product || {})
                    .filter(([key]) => key !== "P")
                    .map(([ProductName, productData]) => {
                        const volume = parseNumber(productData?.Volume);
                        const rate = parseNumber(tk.Rate);
                        const rateOil = parseNumber(productData?.RateOil);
                        const cost = parseNumber(productData?.CostPrice);

                        // ✅ คำนวณตรงนี้ (แม่นสุด)
                        const transport = +(rate * volume).toFixed(2);
                        const profitLoss = +(
                            (rateOil * volume) - (cost * volume) - transport
                        ).toFixed(2);

                        return {
                            No: tk.No,
                            Trip: tk.Trip,
                            Date: trip?.DateDelivery,
                            Address: customer?.Address,
                            Registration: tk.Registration,
                            Driver: tk.Driver,
                            TicketName: tk.TicketName,
                            TicketNameName: tk.TicketNameName,
                            CustomerType: tk.CustomerType,
                            CreditTime: customer?.CreditTime,
                            Status: tk.Status,
                            Company: customer?.Company,
                            StatusCompany: customer?.StatusCompany,
                            ProductName,

                            // ✅ เก็บค่า normalized
                            Volume: volume,
                            Rate: rate,
                            RateOil: rateOil,
                            CostPrice: cost,
                            TruckType: trip?.TruckType,
                            // ✅ เก็บค่าคำนวณแล้ว
                            Transport: transport,
                            ProfitLoss: profitLoss,
                        };
                    });
            });
    }, [orders, ticketsS, trips]);

    const groupedResult = useMemo(() => {
        const getPrefix = (str) => (str || "").split(":")[0];

        const filtered = result.filter((item) => {
            if (!item?.Date) return false;

            const d = dayjs(item.Date, "DD/MM/YYYY");

            const sameMonth =
                d.month() === months.month() &&
                d.year() === months.year();

            const isAllCompany = companyName === "0:ทั้งหมด";

            const sameCompany =
                getPrefix(item.Company) === getPrefix(companyName);

            const isTruck = item?.TruckType === "รถเล็ก";

            const statusCompanyCheck = item?.StatusCompany === "ไม่อยู่บริษัทในเครือ";
            const ticket = item.TicketNameName !== "ต่อภาษี";

            return (
                sameMonth &&
                (isAllCompany || sameCompany) &&
                isTruck && statusCompanyCheck && ticket
            );
        });

        return Object.values(
            filtered.reduce((acc, item) => {
                const key = item.TicketName;

                if (!acc[key]) {
                    acc[key] = {
                        TicketName: item.TicketName,
                        TicketNameName: item.TicketNameName,
                        Date: item.Date,
                        Address: item.Address,
                        CustomerType: item.CustomerType,
                        CreditTime: item.CreditTime,
                        StatusCompany: item.StatusCompany,
                        Company: item.Company,
                        TruckType: item.TruckType,
                        Volume: 0,
                        CostPrice: 0,
                        Transport: 0,
                        ProfitLoss: 0,
                        Rate: item.Rate,
                        RateOil: item.RateOil,
                        Registration: new Map(),
                    };
                }

                // ✅ รวมหลัก
                acc[key].Volume += item.Volume;
                acc[key].CostPrice += item.CostPrice;
                acc[key].Transport += item.Transport;
                acc[key].ProfitLoss += item.ProfitLoss;

                // 🔥 DRIVER (แก้ของเดิมที่พัง)
                const driverKey = `${item.Registration || ""}`;

                if (!acc[key].Registration.has(driverKey)) {
                    acc[key].Registration.set(driverKey, {
                        Driver: item.Driver || "",
                        Registration: item.Registration || "",
                        Volume: 0,
                        Transport: 0,
                        ProfitLoss: 0,
                    });
                }

                const d = acc[key].Registration.get(driverKey);

                d.Volume += item.Volume;
                d.Transport += item.Transport;
                d.ProfitLoss += item.ProfitLoss;

                return acc;
            }, {})
        ).map((item) => ({
            ...item,
            Registration: Array.from(item.Registration.values()),
        }));
    }, [result, months]);

    const summary = useMemo(() => {
        let totalTransport = 0;
        let totalProfitLoss = 0;

        const driverTransport = {};
        const driverProfitLoss = {};

        groupedResult.forEach((row) => {
            totalTransport += row.Transport || 0;
            totalProfitLoss += row.ProfitLoss || 0;

            (row.Registration || []).forEach((d) => {
                // const driverName = d.DriverName || "";
                const regis = d.RegistrationName || "";
                const key = regis;

                if (!driverTransport[key]) {
                    driverTransport[key] = {
                        // Driver: d.Driver,
                        Registration: d.Registration,
                        total: 0,
                    };
                }

                if (!driverProfitLoss[key]) {
                    driverProfitLoss[key] = {
                        // Driver: d.Driver,
                        Registration: d.Registration,
                        total: 0,
                    };
                }

                // ✅ ใช้ d ไม่ใช่ row
                driverTransport[key].total += d.Transport || 0;
                driverProfitLoss[key].total += d.ProfitLoss || 0;
            });
        });

        return [
            {
                label: "ค่าขนส่ง",
                total: totalTransport,
                driverTotals: driverTransport, // ✅ เปลี่ยนเป็น object
            },
            {
                label: "กำไร",
                total: totalProfitLoss,
                driverTotals: driverProfitLoss,
            },
        ];
    }, [groupedResult]);

    const grandTotal = useMemo(() => {
        let totalTransport = 0;
        let totalProfitLoss = 0;
        let totalVolume = 0;

        const driverTotals = {};

        groupedResult.forEach((row) => {
            totalTransport += row.Transport || 0;
            totalProfitLoss += row.ProfitLoss || 0;
            totalVolume += row.Volume || 0;

            (row.Registration || []).forEach((d) => {
                // const driverName = d.DriverName || "";
                const regis = d.RegistrationName || "";
                const key = regis;

                if (!driverTotals[key]) {
                    driverTotals[key] = {
                        // Driver: d.Driver,
                        Registration: d.Registration,
                        Transport: 0,
                        ProfitLoss: 0,
                        Volume: 0,
                    };
                }

                // ✅ รวมจาก driver จริง
                driverTotals[key].Transport += d.Transport || 0;
                driverTotals[key].ProfitLoss += d.ProfitLoss || 0;
                driverTotals[key].Volume += d.Volume || 0;
            });
        });

        return {
            Transport: totalTransport,
            ProfitLoss: totalProfitLoss,
            Volume: totalVolume,
            driverTotals,
        };
    }, [groupedResult]);

    const formatmonth = (dateString) => {
        if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            month: "long",
        }).format(date); // ดึงชื่อเดือนภาษาไทย

        return `${formattedDate}`;
    };

    const normalizeTrip = v =>
        Number(String(v).replace(/[^\d]/g, ""));

    const formatyear = (dateString) => {
        if (!dateString || !dateString.includes("/")) return "ไม่พบข้อมูลวันที่";

        const [day, month, year] = dateString.split("/").map(Number);
        if (!day || !month || !year) return "รูปแบบวันที่ไม่ถูกต้อง";

        return `${year}`;
    };

    // ===============================
    // 1️⃣ กรอง Orders และเพิ่มข้อมูล Trip + RegistrationTail
    // ===============================

    const tripArray = Object.values(trips);

    const smallTruckTickets = ticket
        .map(t => {
            const trip = tripArray.find(
                trip => (Number(trip.id) - 1) === Number(t.Trip)
            );

            if (!trip) return null;
            if (trip.TruckType !== "รถเล็ก") return null;

            return {
                ...t,
                TruckType: trip.TruckType,
                Registration: trip.Registration
            };
        })
        .filter(Boolean);

    // const filteredOrders = useMemo(() => {
    //     if (!ticket || !trips) return [];

    //     const psOrder = ["PSสันทราย", "PS1", "PS2", "NP", "PS3", "PS4"];

    //     return ticket
    //         .filter((item) =>
    //             !["ตั๋วรถใหญ่", "ตั๋วรถเล็ก"].includes(item.CustomerType) &&
    //             item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined &&
    //             item.Trip !== "ยกเลิก"
    //         )
    //         .map((curr) => {
    //             const tripDetail = trips.find((trip) => (Number(trip.id) - 1) === Number(curr.Trip));

    //             let registrationTail = "";
    //             let truckCompany = "";
    //             if (tripDetail?.TruckType === "รถใหญ่") {
    //                 const reg = registrationH.find(
    //                     (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
    //                 );
    //                 registrationTail = reg?.RegTail || "";
    //                 truckCompany = reg?.Company || "";
    //             }
    //             else if (tripDetail?.TruckType === "รถเล็ก") {
    //                 const reg = registrationSm.find(
    //                     (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
    //                 );
    //                 registrationTail = reg?.RegHead || "";
    //                 truckCompany = reg?.Company || "";
    //             }

    //             return {
    //                 ...curr,
    //                 DateReceive: tripDetail?.DateReceive,
    //                 DateDelivery: tripDetail?.DateDelivery,
    //                 TruckType: tripDetail?.TruckType,
    //                 Driver: tripDetail?.Driver,
    //                 Registration: tripDetail?.Registration,
    //                 RegistrationTail: registrationTail,
    //                 TruckCompany: truckCompany
    //             };
    //         })
    //         .sort((a, b) => {
    //             // 🧩 ขั้นแรก: เรียงตามประเภท CustomerType
    //             const typeOrder = ["ตั๋วน้ำมัน", "ตั๋วรับจ้างขนส่ง", "ตั๋วปั้ม"];
    //             const aNamePart = (a.TicketName?.split(":")[1] || "").trim();
    //             const bNamePart = (b.TicketName?.split(":")[1] || "").trim();

    //             const typeA = typeOrder.indexOf(a.CustomerType) !== -1 ? typeOrder.indexOf(a.CustomerType) : 999;
    //             const typeB = typeOrder.indexOf(b.CustomerType) !== -1 ? typeOrder.indexOf(b.CustomerType) : 999;

    //             if (typeA !== typeB) return typeA - typeB;

    //             // 🧩 ขั้นสอง: สำหรับ "ตั๋วปั้ม"
    //             if (a.CustomerType === "ตั๋วปั้ม" && b.CustomerType === "ตั๋วปั้ม") {
    //                 const getPSKey = (name) => {
    //                     // ลบจุดออกก่อน แล้วดึงเฉพาะตัวหน้าชื่อ เช่น PSสันทราย, PS1, NP
    //                     const cleanName = name.replace(/\./g, "").replace(/\s+/g, "");
    //                     const match = psOrder.find(key => cleanName.startsWith(key));
    //                     return match || "ZZ";
    //                 };

    //                 const aKey = getPSKey(aNamePart);
    //                 const bKey = getPSKey(bNamePart);

    //                 const orderA = psOrder.indexOf(aKey);
    //                 const orderB = psOrder.indexOf(bKey);

    //                 if (orderA !== orderB) return orderA - orderB;
    //             }

    //             // 🧩 ขั้นสุดท้าย: เรียงตามชื่อปกติ
    //             return aNamePart.localeCompare(bNamePart, "th");
    //         });
    // }, [ticket, trips, registrationH, registrationT, date, months, years]);

    const normalizeDepotName = (depotName = "") => {
        // เอาข้อความหลัง :
        const name = depotName.split(":").pop().trim();
        return name;
    };

    const calcProductTotal = (products = {}, rateOil = 0) => {
        return Object.entries(products)
            .filter(([key, val]) => key !== "P" && val?.Volume > 0)
            .reduce((sum, [, val]) => {
                return sum + (val.Volume * 1000) * rateOil;
            }, 0);
    };

    const calcProductVolume = (products = {}, rateOil = 0) => {
        return Object.entries(products)
            .filter(([key, val]) => key !== "P" && val?.Volume > 0)
            .reduce((sum, [, val]) => {
                return sum + (val.Volume * 1000);
            }, 0);
    };

    const filteredOrders = useMemo(() => {
        if (!ticket || !trips) return [];

        const psOrder = ["PSสันทราย", "PS1", "PS2", "NP", "PS3", "PS4"];

        return ticket
            .filter((item) =>
                !["ตั๋วรถใหญ่", "ตั๋วรถเล็ก"].includes(item.CustomerType) &&
                item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined &&
                item.Trip !== "ยกเลิก"
            )
            .map((curr) => {
                const tripDetail = trips.find((trip) => (Number(trip.id) - 1) === Number(curr.Trip));

                let shortName = "";
                let truckCompany = "";
                if (tripDetail?.TruckType === "รถเล็ก") {
                    const reg = registrationSm.find(
                        (h) => h.uuid === tripDetail?.Registration
                    );
                    shortName = reg?.ShortName || "";
                    truckCompany = reg?.Company || "";
                }

                const depot = tripDetail?.Depot?.split(":")[1] || "-";

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
                    ShortName: shortName,
                    TruckCompany: truckCompany
                };
            })
            .sort((a, b) => {
                // 🧩 ขั้นแรก: เรียงตามประเภท CustomerType
                const typeOrder = ["ตั๋วน้ำมัน", "ตั๋วรับจ้างขนส่ง", "ตั๋วปั้ม"];
                const aNamePart = (a.TicketNameName || "").trim();
                const bNamePart = (b.TicketNameName || "").trim();

                const typeA = typeOrder.indexOf(a.CustomerType) !== -1 ? typeOrder.indexOf(a.CustomerType) : 999;
                const typeB = typeOrder.indexOf(b.CustomerType) !== -1 ? typeOrder.indexOf(b.CustomerType) : 999;

                if (typeA !== typeB) return typeA - typeB;

                // 🧩 ขั้นสอง: สำหรับ "ตั๋วปั้ม"
                if (a.CustomerType === "ตั๋วปั้ม" && b.CustomerType === "ตั๋วปั้ม") {
                    const getPSKey = (name) => {
                        // ลบจุดออกก่อน แล้วดึงเฉพาะตัวหน้าชื่อ เช่น PSสันทราย, PS1, NP
                        const cleanName = name.replace(/\./g, "").replace(/\s+/g, "");
                        const match = psOrder.find(key => cleanName.startsWith(key));
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

    // ===============================
    // 3️⃣ สร้าง ReportDetail จาก expenseitem + reports
    // ===============================

    // กรองเฉพาะรายงานที่ Period อยู่ใน periods
    const filteredReports = useMemo(() => {
        if (!periods || periods.length === 0 || !reportFinancials) return [];

        // สร้าง array ของเลขงวดทั้งหมดใน periods เช่น [11, 12]
        const validNos = periods.map(p => p.no);

        // กรองเฉพาะ reportFinancials ที่ Period อยู่ใน validNos
        return reportFinancials.filter(r => validNos.includes(r.Period) && r.Status !== "ยกเลิก" && r.VehicleType === "รถเล็ก");
    }, [reportFinancials, periods]);

    const normalizeReg = (str) => {
        if (!str) return "";

        // ตัดส่วนหน้า "1:" ออก
        let s = str.replace(/^\d+:/, "").trim();

        // ดึงเฉพาะ pattern ป้ายทะเบียน เช่น 70-1684
        const match = s.match(/\d{1,2}-\d{3,4}/);

        if (match) return match[0]; // คืน "70-1783"

        // ถ้าไม่ใช่ทะเบียน (เช่น "รับจ้างขนส่ง") คืนทั้งคำไป
        return s;
    };

    const reportDetail = useMemo(() => {
        if (!expenseitem || !reports || !filteredReports || !trips) return [];

        const priorityNames = [
            "เงินเดือน", "ค่าเที่ยวรถ", "ค่าน้ำมันรถ", "ประกันสังคม", "ภ.ง.ด. 3",
            "ภ.ง.ด. 53", "ภ.ง.ด. 51", "ค่าโทรศัพท์", "ซื้อยางเส้นใหม่",
            "คชจ.เกี่ยวกับการซ่อมยาง", "คชจ.เกี่ยวกับเปลี่ยนน้ำมันเครื่อง", "ซ่อมรถ",
        ];

        // init from expenseitem
        const reportInit = expenseitem.map(item => ({
            Bank: `${item.id}:${item.Name}`,
            Type: "ค่าใช้จ่าย",
            TotalPrice: 0,
            TotalAmount: 0,
            TotalVat: 0,
            Driver: [],
            Registrations: [],
            isFixed: priorityNames.includes(item.Name),
        }));

        // normalize function
        const normalizeReg = (reg) => reg?.trim().replace(/:$/, "").toLowerCase() || "";

        // merge reports
        reports
            .filter((ex) => {
                const regMatch = registrationSm.find((h) => h.uuid === ex.Registration);

                const rowDate = dayjs(ex.SelectedDateInvoice, "DD/MM/YYYY");
                const selectedMonth = dayjs(months);
                const selectedYear = dayjs(years);

                const dateMatch = !date
                    ? rowDate.format("MM") === selectedMonth.format("MM") &&
                    rowDate.format("YYYY") === selectedMonth.format("YYYY")
                    : rowDate.format("YYYY") === selectedYear.format("YYYY");

                const companyCheck =
                    companyName === "0:ทั้งหมด"
                        ? true
                        : companyName === regMatch?.Company;

                return ex.Status === "อยู่ในระบบ" && ex.TruckType === "รถเล็ก" && regMatch && dateMatch && companyCheck;
            })
            .forEach((curr) => {
                const bank = curr?.Bank || "-";
                const registration = curr?.Registration || "-";

                let bankGroup = reportInit.find(b => b.Bank === bank);
                if (!bankGroup) {
                    bankGroup = {
                        Bank: bank,
                        Type: "ค่าใช้จ่าย",
                        Driver: [],
                        Registrations: [],
                    };
                    reportInit.push(bankGroup);
                }

                let regGroup = bankGroup.Registrations.find(
                    (r) => normalizeReg(r.Registration) === normalizeReg(registration)
                );

                if (!regGroup) {
                    regGroup = {
                        Registration: registration.trim(),
                        TruckType: curr?.TruckType,
                        TotalPrice: 0,
                        TotalAmount: 0,
                        TotalVat: 0,
                    };
                    bankGroup.Registrations.push(regGroup);
                }

                regGroup.TotalPrice += Number(curr.Total || 0);
                regGroup.TotalAmount += Number(curr.Price || 0);
                regGroup.TotalVat += Number(curr.Vat || 0);
            });

        // 3️⃣ merge trips
        trips
            .filter((tr) => {
                if (tr.Status === "ยกเลิก") return false;
                if (tr.StatusTrip === "ยกเลิก") return false;
                if (tr.TruckType !== "รถเล็ก") return false;

                const tripDate = dayjs(tr.DateReceive, ['DD/MM/YYYY', 'YYYY-MM-DD']);
                const selectedMonth = dayjs(months);
                const selectedYear = dayjs(years);

                return !date
                    ? tripDate.month() === selectedMonth.month() &&
                    tripDate.year() === selectedMonth.year()
                    : tripDate.year() === selectedYear.year();
            })
            .forEach((curr) => {
                const bankName = "2:ค่าเที่ยวรถ";

                let bankGroup = reportInit.find(b => b.Bank === bankName);

                if (!bankGroup) {
                    bankGroup = {
                        Bank: bankName,
                        Type: "ค่าใช้จ่าย",
                        Registrations: [], // 🔥 ใช้ Drivers
                    };
                    reportInit.push(bankGroup);
                }

                const registration = curr.Registration || "";
                const key = `${registration}`;

                let regGroup = bankGroup.Registrations.find(
                    (r) => `${r.Registration}` === key
                );

                if (!regGroup) {
                    regGroup = {
                        Registration: registration,
                        TruckType: curr.TruckType,
                        TotalPrice: 0,
                        TotalAmount: 0,
                        TotalVat: 0,
                    };

                    bankGroup.Registrations.push(regGroup);
                }

                // ✅ รวมค่า
                regGroup.TotalPrice += Number(curr.CostTrip || 0);
                regGroup.TotalAmount += Number(curr.Price || 0);
                regGroup.TotalVat += Number(curr.Vat || 0);
            });

        // ✅ สรุปรวมหลังจาก loop เสร็จ
        reportInit.forEach((bankGroup) => {
            const driverList = bankGroup.Driver || [];
            const regList = bankGroup.Registrations || [];

            const all = [...driverList, ...regList]; // ✅ รวม 2 แหล่ง

            bankGroup.TotalPrice = all.reduce(
                (sum, r) => sum + Number(r.TotalPrice || 0),
                0
            );

            bankGroup.TotalAmount = all.reduce(
                (sum, r) => sum + Number(r.TotalAmount || 0),
                0
            );

            bankGroup.TotalVat = all.reduce(
                (sum, r) => sum + Number(r.TotalVat || 0),
                0
            );
        });

        // sort by priorityNames
        return reportInit
            .filter(item => item.isFixed || item.TotalPrice + item.TotalAmount + item.TotalVat !== 0)
            .sort((a, b) => {
                const nameA = a.Bank.includes(":") ? a.Bank.split(":")[1].trim() : a.Bank.trim();
                const nameB = b.Bank.includes(":") ? b.Bank.split(":")[1].trim() : b.Bank.trim();
                const indexA = priorityNames.indexOf(nameA);
                const indexB = priorityNames.indexOf(nameB);

                if (indexA === -1 && indexB === -1) return nameA.localeCompare(nameB, "th");
                else if (indexA === -1) return 1;
                else if (indexB === -1) return -1;
                else return indexA - indexB;
            });

    }, [expenseitem, reports, date, months, years, companyName, filteredReports, trips]);

    const driverFirstRegMap = {};

    const normalize = (v) => v?.trim().toLowerCase() || "";

    // 🔥 วนทุก data หา registration แรกของแต่ละ driver
    [...(groupedResult || []), ...(reportDetail || [])].forEach((item) => {
        const list = [
            ...(item.Driver || item.Drivers || []),
            ...(item.Registrations || [])
        ];

        list.forEach((d) => {
            const driverKey = normalize(d.Driver);
            const regKey = normalize(d.Registration);

            if (driverKey && regKey && !driverFirstRegMap[driverKey]) {
                driverFirstRegMap[driverKey] = regKey;
            }
        });
    });

    const getGroupKey = (registration) => {
        const regKey = normalize(registration);
        return regKey;
    };

    const driverGroups = useMemo(() => {
        if (!groupedResult && !reportDetail) return [];

        const result = [];

        const pushIfNotExist = (registration = "", extra = {}) => {
            const key = getGroupKey(registration);

            if (!key) return;

            let exist = result.find((r) => r._key === key);

            if (exist) return;

            const shortName =
                registrationSm.find((reg) => reg.uuid === registration)?.ShortName || "";

            result.push({
                _key: key, // 🔥 เก็บ key ไว้เลย
                Registration: registration,
                ShortName: shortName,
                ...extra,
            });
        };

        groupedResult?.forEach((gr) => {
            (gr.Registration || []).forEach((d) => {
                pushIfNotExist(d.Registration, {
                    TruckType: "รถเล็ก",
                });
            });
        });

        // 🔥 2. reportDetail
        reportDetail?.forEach((bank) => {
            if (bank.Driver && bank.Driver.length > 0) {
                // ✅ มี Driver → ใช้ Driver อย่างเดียว
                (bank.Driver || []).forEach((d) => {
                    pushIfNotExist(d.Registration, {
                        TruckType: d.TruckType,
                    });
                });
            } else {
                // ✅ ไม่มี Driver → ใช้ Registration
                (bank.Registrations || []).forEach((r) => {
                    pushIfNotExist(r.Registration, {
                        TruckType: r.TruckType,
                    });
                });
            }
        });

        // 🔥 sort
        const truckTypeOrder = {
            "รถรับจ้างขนส่ง": 1,
            "รถใหญ่": 2,
            "รถเล็ก": 3,
        };

        return result.sort((a, b) => {
            const typeDiff =
                (truckTypeOrder[a.TruckType] || 99) -
                (truckTypeOrder[b.TruckType] || 99);

            if (typeDiff !== 0) return typeDiff;

            const getName = (item) => {
                const name =
                    item.DriverName?.trim();
                return name;
            };

            const nameA = getName(a);
            const nameB = getName(b);

            // 🔥 ถ้า A ไม่มีค่า → ไปท้าย
            if (!nameA && nameB) return 1;

            // 🔥 ถ้า B ไม่มีค่า → ไปท้าย
            if (nameA && !nameB) return -1;

            // 🔥 ถ้าทั้งคู่ไม่มี → เท่ากัน
            if (!nameA && !nameB) return 0;

            return nameA.localeCompare(nameB, "th");
        });
    }, [registrationSm, groupedResult, reportDetail, companyName]);

    const driverToRegMap = {};

    reportDetail.forEach((item) => {
        (item.Driver || []).forEach((d) => {
            const driverKey = normalizeReg(d.Driver);
            const regKey = normalizeReg(d.Registration);

            // 🔥 เก็บทะเบียนแรกของ driver
            if (driverKey && regKey && !driverToRegMap[driverKey]) {
                driverToRegMap[driverKey] = regKey;
            }
        });
    });

    const { grandTotalReport, driverReportTotals } = useMemo(() => {
        const grandTotalReport = reportDetail.reduce(
    (sum, item) => {
        const seen = new Set(); // 👈 ย้ายมา per item

        const process = (r, type) => {
            const key = getGroupKey(r?.Registration || r?.registration);

            if (!key || seen.has(key)) return;
            seen.add(key);

            const price = Number(String(r.TotalPrice || 0).replace(/,/g, ""));
            const amount = Number(String(r.TotalAmount || 0).replace(/,/g, ""));
            const vat = Number(String(r.TotalVat || 0).replace(/,/g, ""));

            sum.TotalPrice += price;
            sum.TotalAmount += amount;
            sum.TotalVat += vat;
        };

        (item.Driver || []).forEach((r) => process(r, "driver"));
        (item.Registrations || []).forEach((r) => process(r, "reg"));

        return sum;
    },
    { TotalPrice: 0, TotalAmount: 0, TotalVat: 0 }
);

        const driverReportTotals = reportDetail.reduce((acc, item) => {
            const process = (r) => {
                const key = getGroupKey(r.Registration);

                if (!key) return;

                if (!acc[key]) {
                    acc[key] = { TotalPrice: 0, TotalAmount: 0, TotalVat: 0 };
                }

                acc[key].TotalPrice += Number(r.TotalPrice || 0);
                acc[key].TotalAmount += Number(r.TotalAmount || 0);
                acc[key].TotalVat += Number(r.TotalVat || 0);
            };

            [...(item.Driver || []), ...(item.Registrations || [])].forEach(process);

            return acc;
        }, {});

        return { grandTotalReport, driverReportTotals };
    }, [reportDetail]);

    const [driverData, setDriverData] = useState([])
    const [driverDataNotCancel, setDriverDataNotCancel] = useState([])
    const [data, setData] = useState([])
    const [dataNotCancel, setDataNotCancel] = useState([]);

    const exportTableToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานน้ำมัน");

        // 1️⃣ Columns
        const columns = [
            { header: "ลำดับ", key: "no", width: 7 }, // 50px
            { header: "ประเภท", key: "type", width: 14 }, // 100px
            { header: "ชื่อรายการ", key: "ticket", width: 40 }, // 280px
            { header: "รวม", key: "total", width: 19 }, // 130px
            ...driverGroups.map(dg => ({
                header:
                    dg.TruckType === "รถเล็ก" ?
                        `${dg.DriverName || ""}${dg.ShortName ? dg.ShortName + "/" : ""}${dg.RegistrationName}`
                        : ""
                ,
                key: `driver_${dg.Registration}`,
                width: 32, // 250px
            })),
        ];

        worksheet.columns = columns;

        // 2️⃣ Title
        worksheet.mergeCells(1, 1, 1, columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `รายงานน้ำมัน ประจำงวด`;
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDEBF7" } };
        worksheet.getRow(1).height = 30;

        // 3️⃣ Header
        const headerRow = worksheet.addRow(columns.map(c => c.header));
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 35;
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            cell.alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
        });

        summary.map(({ label, total, driverTotals }) => {
            // Header for type
            const typeRow = worksheet.addRow([label]);
            typeRow.font = { bold: true };
            typeRow.eachCell(cell => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF90CAF9" } };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });

            // Data rows
            groupedResult
                .map((row, index) => {
                    const dataRow = [
                        index + 1,
                        "รายได้",
                        row.TicketNameName || row.TicketName,
                        // row.Rate,
                        label === "ค่าขนส่ง" ? row.Transport : row.ProfitLoss,
                        ...driverGroups.map((h, i) => {
                            const found = row.Registration.find(
                                (dv) =>
                                    // dv.Driver === h.Driver &&
                                    dv.Registration === h.Registration
                            );

                            const value = label === "ค่าขนส่ง" ? Number(found?.Transport) || 0 : Number(found?.ProfitLoss) || 0;
                            return value ?? 0;
                        }),
                    ];
                    const excelRow = worksheet.addRow(dataRow);
                    excelRow.eachCell((cell, colIndex) => {
                        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                        if (colIndex > 1) cell.numFmt = "#,##0.00";
                        cell.alignment = { horizontal: colIndex === 3 ? "left" : "right", vertical: "middle" };
                    });
                });

            // Total per type
            const totalRow = [
                "",
                "",
                `รวมรายได้ของ ${label}`,
                // "",
                total,
                ...driverGroups.map((row) => {
                    const regis = row.RegistrationName || "";
                    const key = regis;

                    const found = driverTotals[key];

                    return found?.total ?? 0;
                }),
            ];
            const footerRow = worksheet.addRow(totalRow);
            footerRow.font = { bold: true };
            footerRow.eachCell(cell => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBDEFB" } };
                cell.numFmt = "#,##0.00";
                cell.alignment = { horizontal: "right", vertical: "middle" };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
        });

        // 5️⃣ รวมรายได้ทั้งหมด
        const grandTotalRow = [
            "",
            "",
            "รวมรายได้ทั้งหมด",
            // "",
            (grandTotal?.Transport + grandTotal?.ProfitLoss),
            ...driverGroups.map((row) => {
                const regis = row.RegistrationName || "";
                const key = regis;

                const total = grandTotal.driverTotals[key];
                return (total?.Transport || 0) + (total?.ProfitLoss || 0);
            }),
        ];
        const gTotalRow = worksheet.addRow(grandTotalRow);
        gTotalRow.font = { bold: true };
        gTotalRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } };
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right", vertical: "middle" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 6️⃣ ReportDetail + รวมค่าใช้จ่าย
        reportDetail.forEach((row, idx) => {
            const dataRow = [
                idx + 1,
                row.Type,
                row.Bank ? row.Bank.split(":")[1] : row.Bank,
                // "-",
                row.TotalPrice || 0,
                ...driverGroups.map((driver, i) => {
                    const key = driver._key;

                    const firstIndex = driverGroups.findIndex((d) => d._key === key);

                    if (i !== firstIndex) {
                        return <TableCell key={i} />;
                    }

                    // 🔥 source
                    const source = [
                        // ...(row.Driver || []),
                        ...(row.Registrations || [])
                    ];

                    const matched = source.filter((d) => {
                        const dKey = getGroupKey(d.Registration); // ✅ ใช้ function เดียวกัน

                        return dKey === key;
                    });

                    const totalPrice = matched.reduce(
                        (sum, d) => sum + Number(d.TotalPrice || 0),
                        0
                    );

                    if (!matched.length || totalPrice === 0) {
                        return 0;
                    }
                    return totalPrice ?? 0;
                }
                ),
            ];
            const excelRow = worksheet.addRow(dataRow);
            excelRow.eachCell((cell, colIndex) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                if (colIndex > 1) cell.numFmt = "#,##0.00";
                cell.alignment = { horizontal: colIndex === 3 ? "left" : "right", vertical: "middle" };
            });
        });

        // 7️⃣ รวมค่าใช้จ่ายทั้งหมด
        const grandTotalReportRow = [
            "",
            "",
            "รวมค่าใช้จ่าย",
            // "",
            grandTotalReport?.TotalPrice || 0,
            ...driverGroups.map((row, index) => {
                const key = row._key; // ✅ ใช้ key ที่สร้างมาแล้ว

                const total = driverReportTotals[key] || {
                    TotalAmount: 0,
                    TotalPrice: 0,
                    TotalVat: 0
                };
                return total.TotalPrice ?? 0;
            }),
        ];
        const gTotalReportRow = worksheet.addRow(grandTotalReportRow);
        gTotalReportRow.font = { bold: true };
        gTotalReportRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBDEFB" } };
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right", vertical: "middle" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 7️⃣ รวมค่าใช้จ่ายทั้งหมด
        const netIncomeReportRow = [
            "",
            "",
            "ยอดกำไรสุทธิ",
            // "",
            ((grandTotal?.Transport + grandTotal?.ProfitLoss) - (grandTotalReport?.TotalPrice)),
            ...driverGroups.map((row) => {
                const key = row._key; // ✅ ใช้อันเดียว

                const regis = row.RegistrationName || "";
                const keys = regis;

                const total1 = grandTotal.driverTotals[keys];

                const total2 = driverReportTotals[key] || {
                    TotalAmount: 0,
                    TotalPrice: 0,
                    TotalVat: 0
                };
                return (total1?.Transport ?? 0) + (total1?.ProfitLoss ?? 0) - (total2.TotalPrice ?? 0);
            })
        ];
        const gTotalnetIncomeRow = worksheet.addRow(netIncomeReportRow);
        gTotalnetIncomeRow.font = { bold: true };
        gTotalnetIncomeRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } };
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right", vertical: "middle" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 8️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ปิดงบการเงิน
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Box>
                <Grid container spacing={2} paddingLeft={4} paddingRight={4} >
                    <Grid item md={3} xs={12}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={date === false ? false : true}
                                        onChange={() => setDate(true)}
                                        color="pink"
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        รายปี
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={date === true ? false : true}
                                        onChange={() => setDate(false)}
                                        color="pink"
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        รายเดือน
                                    </Typography>
                                }
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item md={9} xs={12}></Grid>
                    <Grid item md={4.5} xs={12}>
                        {
                            date ?
                                <Paper component="form" sx={{ width: "100%", height: "35px", marginTop: -2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="year"
                                            views={["year"]}
                                            value={dayjs(years)} // แปลงสตริงกลับเป็น dayjs object
                                            format="YYYY"
                                            onChange={handleYear}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                งวดการจ่ายปี :
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                            height: "35px",  // ความสูงของ Input
                                                            padding: "10px", // Padding ภายใน Input
                                                            fontWeight: "bold",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                                :
                                <Paper component="form" sx={{ width: "100%", height: "35px", marginTop: -2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="month"
                                            views={["year", "month"]}
                                            value={dayjs(months)} // แปลงสตริงกลับเป็น dayjs object
                                            format="MMMM"
                                            onChange={handleMonth}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                งวดการจ่ายเดือน :
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                            height: "35px",  // ความสูงของ Input
                                                            padding: "10px", // Padding ภายใน Input
                                                            fontWeight: "bold",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                        }
                    </Grid>
                    <Grid item md={5.5} xs={12}>
                        <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold", marginTop: -1, color: "gray" }}
                        >
                            {!date
                                ? `( วันที่ ${firstDay.format("D เดือนMMMM พ.ศ.BBBB")} ถึง ${lastDay.format("D เดือนMMMM พ.ศ.BBBB")} )`
                                : `( ปี ${years.format("BBBB")} )`}
                        </Typography>
                    </Grid>
                    <Grid item md={2} xs={12} textAlign="right">
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                                exportTableToExcel()
                            }
                        >
                            Export Excel
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" width="100%" sx={{ marginTop: 1, }}>
                <TableContainer
                    component={Paper}
                    sx={{
                        marginBottom: 2, height: "70vh", width: "100%",
                        overflowX: "auto"
                    }}
                >
                    <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white" }}>
                                    ลำดับ
                                </TablecellPink>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100, zIndex: 5 }}>
                                    ประเภท
                                </TablecellPink>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 280, position: "sticky", left: 50, zIndex: 5, borderRight: "2px solid white" }}>
                                    ชื่อรายการ
                                </TablecellPink>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 130, position: "sticky", left: 320, zIndex: 5, borderRight: "2px solid white" }}>
                                    รวม
                                </TablecellPink>
                                {
                                    driverGroups.map((row) => (
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>
                                                {
                                                    row.TruckType === "รถเล็ก" ?
                                                        `${row.ShortName ? row.ShortName + "/" : ""}${row.RegistrationName}`
                                                        : ""
                                                }
                                            </Typography>
                                        </TablecellPink>
                                    ))
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {summary.map(({ label, total, driverTotals }) => (
                                <React.Fragment key={label}>
                                    {/* Header Row */}
                                    <TableRow
                                        sx={{
                                            borderBottom: "1px solid gray",
                                            borderTop: "1px solid gray"
                                        }}>
                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#eca9e1ff",
                                                fontWeight: "bold",
                                            }}
                                            colSpan={2}
                                        >
                                            {label}
                                        </TableCell>
                                        <TableCell colSpan={3 + driverGroups.length} />
                                    </TableRow>

                                    {/* รายการแต่ละ ticket */}
                                    {groupedResult
                                        .map((row, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff" }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        position: "sticky",
                                                        left: 0,
                                                        zIndex: 4,
                                                        borderRight: "2px solid white",
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
                                                    }}
                                                >
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell sx={{ textAlign: "center" }}>รายได้</TableCell>

                                                <TableCell
                                                    sx={{
                                                        textAlign: "left",
                                                        position: "sticky",
                                                        left: 50,
                                                        zIndex: 4,
                                                        borderRight: "2px solid white",
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ ml: 2, lineHeight: 1.2, whiteSpace: "nowrap" }}
                                                        gutterBottom
                                                    >
                                                        {row.TicketNameName || row.TicketName}
                                                    </Typography>
                                                </TableCell>

                                                {/* ช่องรวมของแต่ละ Ticket */}
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        position: "sticky",
                                                        left: 320,
                                                        zIndex: 4,
                                                        borderRight: "2px solid white",
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                                    }}
                                                >
                                                    {
                                                        new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }).format(label === "ค่าขนส่ง" ? row.Transport : row.ProfitLoss)
                                                    }
                                                </TableCell>

                                                {/* แสดงค่า per Driver */}
                                                {driverGroups.map((h, i) => {
                                                    const found = row.Registration.find(
                                                        (dv) =>
                                                            // dv.Driver === h.Driver &&
                                                            dv.Registration === h.Registration
                                                    );

                                                    const value = label === "ค่าขนส่ง" ? Number(found?.Transport) || 0 : Number(found?.ProfitLoss) || 0;

                                                    return (
                                                        <TableCell
                                                            key={i}
                                                            sx={{
                                                                textAlign: "right",
                                                                paddingLeft: "15px !important",
                                                                paddingRight: "15px !important",
                                                                fontVariantNumeric: "tabular-nums",
                                                                color: !found ? "lightgray" : "inherit",
                                                            }}
                                                        >
                                                            {value
                                                                ? new Intl.NumberFormat("en-US", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }).format(value)
                                                                : "-"}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}

                                    {/* แถวรวมรายได้ของประเภทนี้ */}
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#efc9ecff",
                                            }}
                                        />
                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#efc9ecff" }}></TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "right",
                                                position: "sticky",
                                                left: 50,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#efc9ecff",
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ mr: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }}
                                                gutterBottom
                                            >
                                                รวมรายได้ของ{label}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "right",
                                                position: "sticky",
                                                fontWeight: "bold",
                                                left: 320,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#efc9ecff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            {new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(total || 0)}
                                        </TableCell>
                                        {driverGroups.map((row) => {
                                            const regis = row.RegistrationName || "";
                                            const key = regis;

                                            const found = driverTotals[key];

                                            return (
                                                <TableCell
                                                    key={row._key}
                                                    sx={{
                                                        textAlign: "right",
                                                        backgroundColor: "#efc9ecff",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums",
                                                        color: !found ? "lightgray" : "inherit",
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                        {new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }).format(found?.total || 0)}
                                                    </Typography>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </React.Fragment>
                            ))}

                            {/* รวมรายได้ทั้งหมด */}
                            <TableRow>
                                <TableCell
                                    sx={{
                                        textAlign: "center",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                    }}
                                />
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fce3fdff" }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ mr: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }}
                                        gutterBottom
                                    >
                                        รวมรายได้ทั้งหมด
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(grandTotal?.Transport + grandTotal?.ProfitLoss)}
                                </TableCell>

                                {driverGroups.map((row) => {
                                    const regis = row.RegistrationName || "";
                                    const key = regis;

                                    const total = grandTotal.driverTotals[key];

                                    return (
                                        <TableCell
                                            key={row._key}
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#fce3fdff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums",
                                                color: !total ? "lightgray" : "inherit",
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format((total?.Transport || 0) + (total?.ProfitLoss || 0))}
                                            </Typography>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            {
                                reportDetail.map((row, index) => {
                                    const bankName = row.Bank?.split(":")[1]?.trim() || "";
                                    const isDriverOnly = DRIVER_ONLY_BANKS.includes(bankName);
                                    return (
                                        <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff" }}>
                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    position: "sticky",
                                                    left: 0,
                                                    zIndex: 4,
                                                    borderRight: "2px solid white",
                                                    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
                                                }}
                                            >
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Type}</TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "left",
                                                    position: "sticky",
                                                    left: 50,
                                                    zIndex: 4,
                                                    borderRight: "2px solid white",
                                                    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
                                                }}
                                            >
                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, lineHeight: 1.2, whiteSpace: "nowrap" }} gutterBottom>{row.Bank ? row.Bank.split(":")[1] : row.Bank}</Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    textAlign: "right",
                                                    position: "sticky",
                                                    left: 320,
                                                    zIndex: 4,
                                                    borderRight: "2px solid white",
                                                    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
                                                    paddingLeft: "15px !important",
                                                    paddingRight: "15px !important",
                                                    fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                                }}
                                            >
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(row.TotalPrice || 0)}
                                            </TableCell>
                                            {driverGroups.map((driver, i) => {
                                                const key = driver._key;

                                                const firstIndex = driverGroups.findIndex((d) => d._key === key);

                                                if (i !== firstIndex) {
                                                    return <TableCell key={i} />;
                                                }

                                                // 🔥 source
                                                const source = [
                                                    // ...(row.Driver || []),
                                                    ...(row.Registrations || [])
                                                ];

                                                const matched = source.filter((d) => {
                                                    const dKey = getGroupKey(d.Registration); // ✅ ใช้ function เดียวกัน

                                                    return dKey === key;
                                                });

                                                const totalPrice = matched.reduce(
                                                    (sum, d) => sum + Number(d.TotalPrice || 0),
                                                    0
                                                );

                                                if (!matched.length || totalPrice === 0) {
                                                    return (
                                                        <TableCell
                                                            key={i}
                                                            sx={{
                                                                textAlign: "right",
                                                                paddingLeft: "15px !important",
                                                                paddingRight: "15px !important",
                                                                fontVariantNumeric: "tabular-nums",
                                                                // color: matchedDrivers.length === 0 ? "lightgray" : "inherit"
                                                            }}
                                                        >
                                                            -
                                                        </TableCell>
                                                    );
                                                }

                                                return (
                                                    <TableCell
                                                        key={i}
                                                        sx={{
                                                            textAlign: "right",
                                                            paddingLeft: "15px !important",
                                                            paddingRight: "15px !important",
                                                            fontVariantNumeric: "tabular-nums",
                                                            // color: matchedDrivers.length === 0 ? "lightgray" : "inherit"
                                                        }}
                                                    >
                                                        {new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }).format(totalPrice)}
                                                    </TableCell>
                                                );
                                            })
                                            }
                                        </TableRow>
                                    )
                                })
                            }
                            <TableRow>
                                <TableCell
                                    sx={{
                                        textAlign: "center",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#efc9ecff",
                                    }}
                                >

                                </TableCell>

                                {/* ✅ ประเภท */}
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#efc9ecff", }}></TableCell>

                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#efc9ecff",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ marginRight: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }} gutterBottom>
                                        รวมค่าใช้จ่าย
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#efc9ecff",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}
                                >
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format((grandTotalReport?.TotalPrice) || 0)}
                                </TableCell>
                                {driverGroups.map((row, index) => {
                                    const key = row._key; // ✅ ใช้ key ที่สร้างมาแล้ว

                                    const total = driverReportTotals[key] || {
                                        TotalAmount: 0,
                                        TotalPrice: 0,
                                        TotalVat: 0
                                    };

                                    return (
                                        <TableCell
                                            key={`${key}-${index}`}    // <— ใช้ key ไม่ซ้ำ 100%
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#efc9ecff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums",
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(total.TotalPrice)}
                                            </Typography>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        textAlign: "center",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                    }}
                                >

                                </TableCell>

                                {/* ✅ ประเภท */}
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fce3fdff", }}></TableCell>

                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ marginRight: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }} gutterBottom>
                                        ยอดกำไรสุทธิ
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}
                                >
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format((grandTotal?.Transport + grandTotal?.ProfitLoss) - (grandTotalReport?.TotalPrice))}
                                </TableCell>
                                {driverGroups.map((row) => {
                                    const key = row._key; // ✅ ใช้อันเดียว

                                    const regis = row.RegistrationName || "";
                                    const keys = `${regis}`;

                                    const total1 = grandTotal.driverTotals[keys];

                                    const total2 = driverReportTotals[key] || {
                                        TotalAmount: 0,
                                        TotalPrice: 0,
                                        TotalVat: 0
                                    };

                                    return (
                                        <TableCell
                                            key={key}
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#fce3fdff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((total1?.Transport || 0) + (total1?.ProfitLoss || 0) - (total2.TotalPrice || 0))}
                                            </Typography>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>

    );
};

export default CloseFSSmallTruck;
