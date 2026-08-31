import React, { useContext, useEffect, useRef, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TableCellB20, TableCellB7, TableCellB95, TablecellCustomers, TableCellE20, TableCellG91, TableCellG95, TableCellPWD, TablecellSelling, TablecellTickets } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { apiPost, apiPut } from "../../server/apiClient";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import OrderDetail from "./OrderDetail";
import SellingDetail from "./SellingDetail";
import "../../theme/scrollbar.css"
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const InsertTrips = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [codeCustomer, setCodeCustomer] = React.useState("");
    const [codes, setCodes] = React.useState("");
    const [tickets, setTickets] = React.useState("0:0");
    const [customers, setCustomers] = React.useState("0:0");
    const [customer, setCustomer] = React.useState("0:0");
    const [selectedValue, setSelectedValue] = useState('');
    const [registration, setRegistration] = React.useState("0:0:0:0:0");
    const [weight, setWeight] = React.useState(0);
    const [totalWeight, setTotalWeight] = React.useState(0);
    const [showTickers, setShowTickers] = React.useState(true);
    const [showTrips, setShowTrips] = React.useState(true);
    const [selectedDateReceive, setSelectedDateReceive] = useState(dayjs(new Date()));
    const [selectedDateDelivery, setSelectedDateDelivery] = useState(dayjs(new Date()).add(1, 'day'));
    const [depots, setDepots] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [ticket, setTicket] = React.useState(0);
    const [ticketsTrip, setTicketsTrip] = React.useState(0);
    const [ticketsOrder, setTicketsOrder] = React.useState([]);
    const dialogRef = useRef(null);
    const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
    const [editMode, setEditMode] = useState(true);
    const [windowWidths, setWindowWidth] = useState(window.innerWidth);

    const [ordersTickets, setOrdersTickets] = React.useState({});
    const [selling, setSelling] = React.useState({});
    const [volumeT, setVolumeT] = React.useState({});
    const [volumeS, setVolumeS] = React.useState({});
    const [weightA, setWeightA] = React.useState({});
    const [orderTrip, setOrderTrip] = React.useState({});
    const [ticketTrip, setTicketTrip] = React.useState({});
    const [weightH, setWeightH] = React.useState(0);
    const [weightL, setWeightL] = React.useState(0);
    const [costTrip, setCostTrip] = React.useState(0);

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

    // โหลด html2canvas จาก CDN
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => setHtml2canvasLoaded(true);
        document.body.appendChild(script);
    }, []);

    // const handleSaveAsImage = async () => {
    //     setEditMode(false); // เปลี่ยนเป็นโหมดแสดงผลแบบ Typography

    //     setTimeout(async () => {
    //         if (dialogRef.current && html2canvasLoaded) {
    //             // ดึงค่าความสูงของ TextField และกำหนดให้ inline style
    //             const inputElement = dialogRef.current.querySelector("input");
    //             if (inputElement) {
    //                 const computedStyle = window.getComputedStyle(inputElement);
    //                 inputElement.style.height = computedStyle.height;
    //                 inputElement.style.fontSize = computedStyle.fontSize;
    //                 inputElement.style.fontWeight = computedStyle.fontWeight;
    //                 inputElement.style.padding = computedStyle.padding;
    //             }

    //             // ใช้ html2canvas จับภาพ
    //             const canvas = await window.html2canvas(dialogRef.current, {
    //                 scrollY: 0,
    //                 useCORS: true,
    //                 width: dialogRef.current.scrollWidth,
    //                 height: dialogRef.current.scrollHeight,
    //                 scale: window.devicePixelRatio,
    //             });

    //             const image = canvas.toDataURL("image/png");

    //             // สร้างลิงก์ดาวน์โหลด
    //             const link = document.createElement("a");
    //             link.href = image;
    //             link.download = "บันทึกข้อมูลการขนส่งน้ำมันวันที่" + dayjs(selectedDate).format("DD-MM-YYYY") + ".png";
    //             link.click();

    //             setEditMode(true);
    //         } else {
    //             console.error("html2canvas ยังไม่ถูกโหลด");
    //         }
    //     }, 500); // รอให้ React เปลี่ยน UI ก่อนแคปภาพ
    // };


    const handleDateChangeReceive = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue);
            setSelectedDateReceive(formattedDate);
            setSelectedDateDelivery(formattedDate.add(1, 'day'));

            console.log("order Ticket : ", Object.keys(ordersTickets).length);
            console.log("selectedDateReceive : ", formattedDate.format("DD/MM/YYYY"));

            if (ordersTickets && Object.keys(ordersTickets).length > 0) {
                setOrdersTickets((prevOrders) => {
                    const updated = {};
                    for (const key in prevOrders) {
                        updated[key] = {
                            ...prevOrders[key],
                            Date: formattedDate.format("DD/MM/YYYY"),
                        };
                    }
                    console.log("Updated Orders with new Date (object):", updated);
                    return updated;
                });
            }

            if (selling && Object.keys(selling).length > 0) {
                setSelling((prevOrders) => {
                    const updated = {};
                    for (const key in prevOrders) {
                        updated[key] = {
                            ...prevOrders[key],
                            Date: formattedDate.add(1, 'day').format("DD/MM/YYYY")
                        };
                    }
                    console.log("Updated Selling with new Date (object):", updated);
                    return updated;
                });
            }
        }
    };


    const handleDateChangeDelivery = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateDelivery(formattedDate);

            if (selling && Object.keys(selling).length > 0) {
                setSelling((prevOrders) => {
                    const updated = {};
                    for (const key in prevOrders) {
                        updated[key] = {
                            ...prevOrders[key],
                            Date: formattedDate.format("DD/MM/YYYY"),
                        };
                    }
                    console.log("Updated Orders with new Date (object):", updated);
                    return updated;
                });
            }
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
        setTicketsTrip(ticket);
    };

    const handleClose = () => {
        setOpen(false);
        setShowTickers(true);
        setShowTrips(true)
    };

    const [weightOil, setWeightOil] = React.useState(0);
    const [volume, setVolume] = React.useState(0);
    const [volumeG91, setVolumeG91] = React.useState(0);
    const [volumeG95, setVolumeG95] = React.useState(0);
    const [volumeB7, setVolumeB7] = React.useState(0);
    const [volumeB95, setVolumeB95] = React.useState(0);
    const [volumeE20, setVolumeE20] = React.useState(0);
    const [volumePWD, setVolumePWD] = React.useState(0);
    const [volumeB20, setVolumeB20] = React.useState(0);

    // const total = weightOil.reduce((sum, value) => sum + value, 0);
    // const totalVolume = volume.reduce((sum, value) => sum + value, 0);
    // const totalCost = cost.reduce((sum, value) => sum + value, 0);

    // console.log("แสดงน้ำหนักรวมทั้งหมด",weightOil);
    // console.log("แสดงต้นทุนรวม G91",costG91);
    // console.log("แสดงปริมาณรวม G91",volumeG91);
    // console.log("แสดงต้นทุนรวม G95",costG95);
    // console.log("แสดงปริมาณรวม G95",volumeG95);
    // console.log("แสดงต้นทุนรวม B7",costB7);
    // console.log("แสดงปริมาณรวม B7",volumeB7);
    // console.log("แสดงต้นทุนรวม B95",costB95);
    // console.log("แสดงปริมาณรวม B95",volumeB95);
    // console.log("แสดงต้นทุนรวม E20",costE20);
    // console.log("แสดงปริมาณรวม E20",volumeE20);
    // console.log("แสดงต้นทุนรวม PWD",costPWD);
    // console.log("แสดงปริมาณรวม PWD",volumePWD);
    // console.log("แสดงต้นทุนรวม",cost);
    // console.log("แสดงปริมาณรวม",volume);

    const [heavyOil, setHeavyOil] = React.useState(weightOil);

    // const handleSendBack = (newTotal, newTotalCost, newTotalVolume) => {
    //     setWeightOil((prev) => [...prev, newTotal]);  // ✅ เก็บค่า total
    //     setCost((prev) => [...prev, newTotalCost]); // ✅ เก็บค่า totalVolume
    //     setVolume((prev) => [...prev, newTotalVolume]); // ✅ เก็บค่า totalVolume
    // };

    const handleSendBack = (newTotal, newTotalVolume, newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD, newVolumeB20) => {
        setWeightOil((prev) => prev + newTotal);
        setVolume((prev) => prev + newTotalVolume);
        setVolumeG91((prev) => prev + newVolumeG91);
        setVolumeG95((prev) => prev + newVolumeG95);
        setVolumeB7((prev) => prev + newVolumeB7);
        setVolumeB95((prev) => prev + newVolumeB95);
        setVolumeE20((prev) => prev + newVolumeE20);
        setVolumePWD((prev) => prev + newVolumePWD);
        setVolumeB20((prev) => prev + newVolumeB20);
        // setCostG91((prev) => prev + newCostG91);
        // setCostG95((prev) => prev + newCostG95);
        // setCostB7((prev) => prev + newCostB7);
        // setCostB95((prev) => prev + newCostB95);
        // setCostE20((prev) => prev + newCostE20);
        // setCostPWD((prev) => prev + newCostPWD);
    };

    const handleSendBackSell = (
        newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD, newVolumeB20
    ) => {
        console.log("Before Update:", { volumeG91, volumeG95, volumeB7, volumeB95, volumeE20, volumePWD, volumeB20 });
        console.log("Received Values:", { newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD, newVolumeB20 });

        setVolumeG91(prev => prev - newVolumeG91);
        setVolumeG95(prev => prev - newVolumeG95);
        setVolumeB7(prev => prev - newVolumeB7);
        setVolumeB95(prev => prev - newVolumeB95);
        setVolumeE20(prev => prev - newVolumeE20);
        setVolumePWD(prev => prev - newVolumePWD);
        setVolumeB20(prev => prev - newVolumeB20);

        // setCostG91(prev => prev - newCostG91);
        // setCostG95(prev => prev - newCostG95);
        // setCostB7(prev => prev - newCostB7);
        // setCostB95(prev => prev - newCostB95);
        // setCostE20(prev => prev - newCostE20);
        // setCostPWD(prev => prev - newCostPWD);

        console.log("After Update:", { volumeG91, volumeG95, volumeB7, volumeB95, volumeE20, volumePWD, volumeB20 });
    };

    const { reghead, small, transport, depots: depotBasicData, customertransports, customergasstations, customertickets, customerbigtruck, customersmalltruck, refetch: refetchBasicData } = useBasicData();
    const truckH = Object.values(reghead || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const truckS = Object.values(small || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const truckT = Object.values(transport || {}).filter((item) => item.StatusTruck !== "ยกเลิก");

    const { trip: tripData, order: orderData, tickets: ticketsTableData, refetch: refetchTripData } = useTripData();
    const trip = Object.values(tripData || {});
    const order = Object.values(orderData || {});
    const depot = Object.values(depotBasicData || {});

    const ticketsT = Object.values(customertransports || {}).filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ");
    const ticketsPS = Object.values(customergasstations || {});
    const ticketsA = Object.values(customertickets || {});
    const ticketsB = Object.values(customerbigtruck || {});
    const ticketsS = Object.values(customersmalltruck || {});

    const [usedShortNames, setUsedShortNames] = useState(new Set());

    console.log("Used ShortNames: ", [...usedShortNames]);

    console.log("ข้อมูลตั๋ว : ", Object.values(ordersTickets));
    console.log("ข้อมูลลูกค้า : ", Object.values(selling));

    console.log("Order on Trip : ", orderTrip);
    console.log("Ticket on Trip : ", ticketTrip);

    const handlePost = (event) => {
        const ticketValue = event.target.value;
        setTickets(ticketValue);

        if (ticketValue === "0:0") return;

        // ค้นหา ticket ที่ตรงกับ ticketValue ใน getTickets() เพื่อที่จะนำค่า rate จาก row นั้นมาใช้
        const ticketData = getTickets().find(
            (item) => `${item.id}:${item.Name}` === ticketValue
        );

        // กำหนดค่า default rate หากไม่พบข้อมูลหรือ depots ยังไม่ได้เลือก
        // let newRate = 0;
        // if (ticketData && depots) {
        //     // ตรวจสอบค่า depot ที่เลือก (สมมุติว่า depots เป็น "1", "2", "3")
        //     if (depots.split(":")[1] === "ลำปาง") {
        //         newRate = ticketData.Rate1;
        //     } else if (depots.split(":")[1] === "พิจิตร") {
        //         newRate = ticketData.Rate2;
        //     } else if (depots.split(":")[1] === "สระบุรี" || depots.split(":")[1] === "บางปะอิน" || depots.split(":")[1] === "IR") {
        //         newRate = ticketData.Rate3;
        //     }
        // }

        setOrdersTickets((prev) => {
            const newIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newIndex]: {
                    TicketName: ticketValue,
                    CompanyName: ticketData.CompanyName || "-",
                    Address: ticketData.Address || "-",
                    Lat: ticketData.lat || "-",
                    Lng: ticketData.lng || "-",
                    CodeID: ticketData.CodeID || "-",
                    CreditTime: ticketData.CreditTime || "-",
                    Bill: ticketData.Bill || "-",
                    Rate1: ticketData.Rate1,
                    Rate2: ticketData.Rate2,
                    Rate3: ticketData.Rate3,
                    Trip: trip.length,
                    Date: dayjs(selectedDateReceive).format('DD/MM/YYYY'),
                    Registration: `${registration.split(":")[0]}:${registration.split(":")[1]}`,
                    Driver: `${registration.split(":")[2]}:${registration.split(":")[3]}`,
                    id: newIndex,
                    CustomerType: ticketData.CustomerType,
                    Product: {
                        P: { Volume: 0, Cost: 0, Selling: 0 },
                    }
                }
            };
        });

        setTicketTrip((prev) => {
            const newIndex = Object.keys(prev).length + 1; // เพิ่มเป็น 1-based index
            return {
                ...prev,
                [`Ticket${newIndex}`]: ticketValue
                // [`Ticket${newIndex}`]: ticketValue.includes("/")
                //     ? ticketValue.split("/")[1]
                //     : ticketValue
            };
        });

    };

    const handlePostSelling = (event) => {
        const customerValue = event.target.value;
        setCustomers(customerValue);

        if (customerValue === "0:0") return;

        // ค้นหา ticket ที่ตรงกับ customerValue ใน getTickets() เพื่อที่จะนำค่า rate จาก row นั้นมาใช้
        const orderData = getCustomers().find(
            (item) => `${item.id}:${item.Name}` === customerValue
        );

        console.log("customerValue : ", customerValue.split(":")[1].split(".")[0]);

        // กำหนดค่า default rate หากไม่พบข้อมูลหรือ depots ยังไม่ได้เลือก
        // let newRate = 0;
        // if (orderData && depots) {
        //     // ตรวจสอบค่า depot ที่เลือก (สมมุติว่า depots เป็น "1", "2", "3")
        //     if (depots.split(":")[1] === "ลำปาง") {
        //         // newRate = orderData.Rate1;
        //         setCostTrip((prev) => (prev === 0 ? 750 : prev + 200));
        //     } else if (depots.split(":")[1] === "พิจิตร") {
        //         // newRate = orderData.Rate2;
        //         setCostTrip((prev) => (prev === 0 ? 2000 : prev + 200));
        //     } else if (depots.split(":")[1] === "สระบุรี" || depots.split(":")[1] === "บางปะอิน" || depots.split(":")[1] === "IR") {
        //         // newRate = orderData.Rate3;
        //         setCostTrip((prev) => (prev === 0 ? (2000 + 1200) : prev + 200));
        //     }
        // }

        if (orderData && depots) {
            const depotName = depots.split(":")[1];

            const shortName = orderData.ShortName || "-";
            let shouldAddExtra = false;

            if (shortName === "-" || shortName.trim() === "") {
                // ถ้าไม่มีค่า หรือเป็น "-"
                shouldAddExtra = true;
            } else if (!usedShortNames.has(shortName)) {
                // ถ้ามีค่าและยังไม่เคยเจอ
                shouldAddExtra = true;
                setUsedShortNames((prev) => new Set([...prev, shortName])); // ✅ สำคัญ
            }

            if (depotName === "ลำปาง") {
                setCostTrip((prev) => (prev === 0 ? 750 : prev + (shouldAddExtra ? 200 : 0)));
            } else if (depotName === "พิจิตร") {
                setCostTrip((prev) => (prev === 0 ? 2000 : prev + (shouldAddExtra ? 200 : 0)));
            } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
                setCostTrip((prev) => (prev === 0 ? (2000 + 1200) : prev + (shouldAddExtra ? 200 : 0)));
            }
        }

        setSelling((prev) => {
            const newIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newIndex]: {
                    TicketName: customerValue,
                    CompanyName: orderData.CompanyName || "-",
                    Address: orderData.Address || "-",
                    Lat: orderData.lat || "-",
                    Lng: orderData.lng || "-",
                    CodeID: orderData.CodeID || "-",
                    CreditTime: orderData.CreditTime || "-",
                    Bill: orderData.Bill || "-",
                    Rate1: orderData.Rate1,
                    Rate2: orderData.Rate2,
                    Rate3: orderData.Rate3,
                    Trip: trip.length,
                    Date: dayjs(selectedDateDelivery).format('DD/MM/YYYY'),
                    Registration: `${registration.split(":")[0]}:${registration.split(":")[1]}`,
                    Driver: `${registration.split(":")[2]}:${registration.split(":")[3]}`,
                    id: newIndex,
                    CustomerType: orderData.CustomerType,
                    ShortName: orderData.ShortName || "-",
                    LastName: orderData.LastName || "-",
                    Product: {
                        P: { Volume: 0, Cost: 0, Selling: 0 },
                    }
                }
            };
        });

        setOrderTrip((prev) => {
            const newIndex = Object.keys(prev).length + 1; // เพิ่มเป็น 1-based index
            return {
                ...prev,
                [`Order${newIndex}`]: customerValue
                // [`Order${newIndex}`]: customerValue.includes("/")
                //     ? customerValue.split("/")[1]
                //     : customerValue
            };
        });

    };

    const handleRegistration = (event) => {
        const registrationValue = event;
        setRegistration(registrationValue);
        console.log("show registration : ", registrationValue);

        if (Object.keys(ordersTickets).length > 0) {
            const registration = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            const driver = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            setOrdersTickets((prevSelling) =>
                Object.fromEntries(
                    Object.entries(prevSelling).map(([key, item]) => [
                        key,
                        {
                            ...item,
                            Registration: registration,
                            Driver: driver,
                        },
                    ])
                )
            );
        }

        // ตรวจสอบว่า selling ไม่ใช่ object ว่าง
        if (Object.keys(selling).length > 0) {
            const registration = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            const driver = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            setSelling((prevSelling) =>
                Object.fromEntries(
                    Object.entries(prevSelling).map(([key, item]) => [
                        key,
                        {
                            ...item,
                            Registration: registration,
                            Driver: driver,
                        },
                    ])
                )
            );
        }

    }

    const handleUpdateOrderID = (ticketIndex, field, value) => {
        setOrdersTickets((prev) => {
            return {
                ...prev,
                [ticketIndex]: {
                    ...prev[ticketIndex],
                    [field]: value
                }
            };
        });
    };

    const handleUpdateOrder = (ticketIndex, field, value) => {
        setSelling((prev) => {
            return {
                ...prev,
                [ticketIndex]: {
                    ...prev[ticketIndex],
                    [field]: value
                }
            };
        });
    };

    const handleChangeCostTrip = (e) => {
        let raw = e.target.value;

        // ลบทุกอย่างที่ไม่ใช่ตัวเลขหรือตัวจุด
        raw = raw.replace(/[^0-9.]/g, "");

        // ตรวจสอบว่าใส่จุดได้แค่ 1 จุดเท่านั้น
        const parts = raw.split(".");
        if (parts.length > 2) return; // ห้ามใส่จุดมากกว่า 1 จุด

        // จำกัดจุดทศนิยมไว้แค่ 2 ตำแหน่ง
        if (parts[1]?.length > 2) {
            parts[1] = parts[1].slice(0, 2);
            raw = parts.join(".");
        }

        setCostTrip(Number(raw));
    };

    console.log("cost trip : ", costTrip);

    // ฟังก์ชันอัพเดตราคาใน ordersTickets เมื่อมีการเปลี่ยน depot
    const updateRatesByDepot = (selectedDepot) => {
        setCostTrip(0);
        setOrdersTickets((prevOrders) => {
            return Object.keys(prevOrders).reduce((acc, key) => {
                const order = prevOrders[key];
                const ticketData = getTickets().find(
                    (item) => `${item.id}:${item.Name}` === order.TicketName
                );
                // let newRate = 0;
                // if (ticketData) {
                //     if (selectedDepot === "ลำปาง") {
                //         newRate = ticketData.Rate1;
                //     } else if (selectedDepot === "พิจิตร") {
                //         newRate = ticketData.Rate2;
                //     } else if (selectedDepot === "สระบุรี" || selectedDepot === "บางปะอิน" || selectedDepot === "IR") {
                //         newRate = ticketData.Rate3;
                //     }
                // }
                acc[key] = {
                    ...order,
                    Rate1: ticketData.Rate1,
                    Rate2: ticketData.Rate2,
                    Rate3: ticketData.Rate3,
                };
                return acc;
            }, {});
        });

        // คำนวณ costTrip ครั้งเดียว โดยดูจากจำนวน ordersTickets ที่มีอยู่และค่า depot
        // สมมุติว่า ordersTickets มี 3 รายการ
        // เราคำนวณตามเงื่อนไข depot แต่ละครั้ง
        setSelling((prevOrders) => {
            const seenShortNames = new Set();
            const updatedOrders = Object.keys(prevOrders).reduce((acc, key) => {
                const order = prevOrders[key];
                const ticketData = getCustomers().find(
                    (item) => `${item.id}:${item.Name}` === order.TicketName
                );
                // let newRate = 0;
                // if (ticketData) {
                //     if (selectedDepot === "ลำปาง") {
                //         newRate = ticketData.Rate1;
                //     } else if (selectedDepot === "พิจิตร") {
                //         newRate = ticketData.Rate2;
                //     } else if (selectedDepot === "สระบุรี" || selectedDepot === "บางปะอิน" || selectedDepot === "IR") {
                //         newRate = ticketData.Rate3;
                //     }
                // }
                acc[key] = {
                    ...order,
                    Rate1: ticketData.Rate1,
                    Rate2: ticketData.Rate2,
                    Rate3: ticketData.Rate3,
                };
                return acc;
            }, {});

            // หลังจากอัพเดต orders แล้ว คำนวณ costTrip รวม
            let cost = 0;
            Object.keys(updatedOrders).forEach((key, index) => {
                const order = updatedOrders[key];
                const shortName = order.ShortName || "-";

                let shouldAddExtra = false;

                if (shortName === "-" || shortName.trim() === "") {
                    shouldAddExtra = true;
                } else if (!seenShortNames.has(shortName)) {
                    shouldAddExtra = true;
                    seenShortNames.add(shortName);
                }

                if (selectedDepot === "ลำปาง") {
                    cost += index === 0 ? 750 : (shouldAddExtra ? 200 : 0);
                } else if (selectedDepot === "พิจิตร") {
                    cost += index === 0 ? 2000 : (shouldAddExtra ? 200 : 0);
                } else if (["สระบุรี", "บางปะอิน", "IR"].includes(selectedDepot)) {
                    cost += index === 0 ? (2000 + 1200) : (shouldAddExtra ? 200 : 0);
                }
            });
            setCostTrip(cost);
            return updatedOrders;
        });
    };


    const handleAddProduct = (ticketIndex, productName, field, value) => {
        setOrdersTickets((prev) => {
            const newValue = value === "" ? "" : Number(value);

            // คัดลอกโครงสร้างข้อมูลปัจจุบัน
            const updatedTicket = { ...prev[ticketIndex] };
            if (!updatedTicket.Product) updatedTicket.Product = {};
            if (!updatedTicket.Product[productName]) updatedTicket.Product[productName] = {};

            // อัปเดตค่าฟิลด์
            updatedTicket.Product[productName][field] = newValue;

            // ตรวจสอบว่า Volume และ Cost เป็น 0 หรือไม่
            const cost = updatedTicket.Product[productName]?.Cost || 0;
            const volume = updatedTicket.Product[productName]?.Volume || 0;

            if (cost === 0 && volume === 0) {
                delete updatedTicket.Product[productName]; // ลบ productName ออกถ้าทั้งคู่เป็น 0
            }

            // อัปเดตค่า VolumeT
            const updatedOrders = { ...prev, [ticketIndex]: updatedTicket };

            // คำนวณค่า Volume รวมของแต่ละ productName
            let totalG95 = 0;
            let totalG91 = 0;
            let totalB7 = 0;
            let totalB95 = 0;
            let totalE20 = 0;
            let totalPWD = 0;
            let totalB20 = 0;

            // วนลูปหาค่า Volume รวมของแต่ละ productName
            Object.values(updatedOrders).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                    totalB20 += ticket.Product?.B20?.Volume || 0;
                }
            });

            setVolumeT({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD,
                B20: totalB20
            });

            let G95 = (totalG95 * 0.740) * 1000;
            let G91 = (totalG91 * 0.740) * 1000;
            let B7 = (totalB7 * 0.837) * 1000;
            let B95 = (totalB95 * 0.740) * 1000;
            let E20 = (totalE20 * 0.740) * 1000;
            let PWD = (totalPWD * 0.837) * 1000;
            let B20 = (totalB20 * 0.837) * 1000;

            setWeightA({ G91: G91.toFixed(2), G95: G95.toFixed(2), B7: B7.toFixed(2), B95: B95.toFixed(2), E20: E20.toFixed(2), PWD: PWD.toFixed(2), B20: B20.toFixed(2) });
            setWeightL(parseFloat(G91) + parseFloat(G95) + parseFloat(B95) + parseFloat(E20));
            setWeightH(parseFloat(B7) + parseFloat(PWD) + parseFloat(B20));

            // อัปเดตค่า State ของแต่ละ productName
            setVolumeG95(totalG95);
            setVolumeG91(totalG91);
            setVolumeB7(totalB7);
            setVolumeB95(totalB95);
            setVolumeE20(totalE20);
            setVolumePWD(totalPWD);
            setVolumeB20(totalB20);
            return updatedOrders;
        });
    };

    const handleAddCustomer = (ticketIndex, productName, field, value) => {
        setSelling((prev) => {
            const newValue = value === "" ? "" : Number(value);

            // คัดลอกโครงสร้างข้อมูลปัจจุบัน
            const updatedTicket = { ...prev[ticketIndex] };
            if (!updatedTicket.Product) updatedTicket.Product = {};
            if (!updatedTicket.Product[productName]) updatedTicket.Product[productName] = {};

            // อัปเดตค่าฟิลด์
            updatedTicket.Product[productName][field] = newValue;

            // ตรวจสอบว่า Volume และ Cost เป็น 0 หรือไม่
            const cost = updatedTicket.Product[productName]?.Cost || 0;
            const selling = updatedTicket.Product[productName]?.Selling || 0;
            const volume = updatedTicket.Product[productName]?.Volume || 0;

            if (cost === 0 && selling === 0 && volume === 0) {
                delete updatedTicket.Product[productName]; // ลบ productName ออกถ้าทั้งคู่เป็น 0
            }

            // อัปเดตค่า VolumeT
            const updatedOrders = { ...prev, [ticketIndex]: updatedTicket };

            // คำนวณค่า Volume รวมของแต่ละ productName
            let totalG95 = 0;
            let totalG91 = 0;
            let totalB7 = 0;
            let totalB95 = 0;
            let totalE20 = 0;
            let totalPWD = 0;
            let totalB20 = 0;

            // วนลูปหาค่า Volume รวมของแต่ละ productName
            Object.values(updatedOrders).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                    totalB20 += ticket.Product?.B20?.Volume || 0;
                }
            });

            setVolumeS({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD,
                B20: totalB20
            });

            return updatedOrders;
        });
    };

    const handleDelete = (indexToDelete) => {
        setOrdersTickets((prev) => {
            const newOrder = {};
            let newIndex = 0;

            Object.keys(prev).forEach((key) => {
                if (parseInt(key) !== indexToDelete) {
                    newOrder[newIndex] = { ...prev[key], id: newIndex };
                    newIndex++;
                }
            });

            // คำนวณค่า Volume ใหม่จาก newOrder (ข้อมูลหลังจากลบ)
            let totalG95 = 0;
            let totalG91 = 0;
            let totalB7 = 0;
            let totalB95 = 0;
            let totalE20 = 0;
            let totalPWD = 0;
            let totalB20 = 0;

            Object.values(newOrder).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                    totalB20 += ticket.Product?.B20?.Volume || 0;
                }
            });

            // อัปเดตค่า volumeT ใหม่
            setVolumeT({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD,
                B20: totalB20
            });

            setVolumeG95(totalG95);
            setVolumeG91(totalG91);
            setVolumeB7(totalB7);
            setVolumeB95(totalB95);
            setVolumeE20(totalE20);
            setVolumePWD(totalPWD);
            setVolumeB20(totalB20);

            return newOrder;
        });
    };

    const handleDeleteCustomer = (indexToDelete) => {
        setSelling((prev) => {
            // 1. ลบ order ตาม indexToDelete และ re-index ใหม่
            const newOrder = {};
            let newIndex = 0;
            Object.keys(prev).forEach((key) => {
                if (parseInt(key) !== indexToDelete) {
                    newOrder[newIndex] = { ...prev[key], id: newIndex };
                    newIndex++;
                }
            });

            // 2. อัปเดต Rate และ shortName พร้อมคำนวณ costTrip ใหม่
            const seenShortNames = new Set();
            const updatedOrders = {};
            let cost = 0;

            Object.keys(newOrder).forEach((key, index) => {
                const order = newOrder[key];
                const ticketData = getCustomers().find(
                    (item) => `${item.id}:${item.Name}` === order.TicketName
                );

                const updatedOrder = {
                    ...order,
                    Rate1: ticketData?.Rate1,
                    Rate2: ticketData?.Rate2,
                    Rate3: ticketData?.Rate3,
                };

                updatedOrders[key] = updatedOrder;

                const shortName = updatedOrder.ShortName || "-";

                let shouldAddExtra = false;
                if (shortName === "-" || shortName.trim() === "") {
                    shouldAddExtra = true;
                } else if (!seenShortNames.has(shortName)) {
                    shouldAddExtra = true;
                    seenShortNames.add(shortName);
                }

                if (depots) {
                    const depotName = depots.split(":")[1]; // สมมุติรูปแบบ depots = "xx:ลำปาง" เป็นต้น
                    if (depotName === "ลำปาง") {
                        cost += index === 0 ? 750 : (shouldAddExtra ? 200 : 0);
                    } else if (depotName === "พิจิตร") {
                        cost += index === 0 ? 2000 : (shouldAddExtra ? 200 : 0);
                    } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
                        cost += index === 0 ? (2000 + 1200) : (shouldAddExtra ? 200 : 0);
                    }
                }
            });

            // 3. คำนวณ Volume จาก updatedOrders
            let totalG95 = 0,
                totalG91 = 0,
                totalB7 = 0,
                totalB95 = 0,
                totalE20 = 0,
                totalPWD = 0,
                totalB20 = 0;

            Object.values(updatedOrders).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                    totalB20 += ticket.Product?.B20?.Volume || 0;
                }
            });

            setVolumeS({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD,
                B20: totalB20
            });

            // 4. อัพเดตค่า costTrip ใหม่
            setCostTrip(cost);

            // 5. คืนค่า updatedOrders เพื่ออัพเดต state
            return updatedOrders;
        });

        // อัพเดต orderTrip เหมือนเดิม
        setOrderTrip((prev) => {
            const entries = Object.entries(prev);
            const filtered = entries.filter(
                ([key]) => key !== `Order${parseInt(indexToDelete, 10) + 1}`
            );
            const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Order${index + 1}`] = value;
                return acc;
            }, {});
            return newOrderTrip;
        });
    };


    console.log("Registration s : ", registration);
    const handleSaveAsImage = () => {
        const Trips = {
            Tickets: Object.values(ordersTickets),
            Orders: Object.values(selling),
            TotalVolumeTicket: volumeT,
            TotalVolumeOrder: volumeS,
            CostTrip: costTrip,
            DateReceive: dayjs(selectedDateReceive).format("DD/MM/YYYY"),
            DateDelivery: dayjs(selectedDateDelivery).format("DD/MM/YYYY"),
            Driver: registration.split(":")[3] + " / " + registration.split(":")[1],
            Depot: depots,
            WeightHigh: weightH,
            WeightLow: weightL,
            WeightTruck: weight,
            TotalWeight: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)),
        };

        // บันทึกข้อมูลลง sessionStorage
        sessionStorage.setItem("Trips", JSON.stringify(Trips));

        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const windowWidth = 835;
        const windowHeight = 559;

        const left = (screenWidth - windowWidth) / 2;
        const top = (screenHeight - windowHeight) / 2;

        const printWindow = window.open(
            "/print-trips",
            "_blank",
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        );

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    const handleSubmit = async () => {
        const selectedTruck = getDriver().find((item) =>
            item.Type === "รถบริษัท"
                ? (`${item.id}:${item.RegHead}:${item.Driver}:${item.Type}` === registration)
                : (`${item.id}:${item.Registration}:${item.id}:${item.Name}:${item.Type}` === registration)
        );

        if (!selectedTruck) {
            ShowError("กรุณาเลือกผู้ขับ/ป้ายทะเบียนก่อนบันทึก");
            return;
        }

        const isCompanyTruck = selectedTruck.Type === "รถบริษัท";
        const registrationUuid = selectedTruck.uuid;
        const registrationName = isCompanyTruck ? selectedTruck.RegHead : selectedTruck.Registration;
        const driverUuid = isCompanyTruck ? selectedTruck.Driver : null;
        const driverName = isCompanyTruck ? selectedTruck.DriverName : selectedTruck.Name;
        // เลขอ้างอิงเที่ยววิ่งแบบ 0-based เดิม (เท่ากับ trip.id - 1 ของเที่ยวที่กำลังจะสร้าง)
        const tripSeq = trip.length;

        try {
            let orderNo = order.length;
            for (const key of Object.keys(selling)) {
                const entry = selling[key];
                const customerRow = getCustomers().find((item) => `${item.id}:${item.Name}` === entry.TicketName);
                orderNo += 1;
                await apiPost("/api/order", {
                    ...entry,
                    TicketName: customerRow?.uuid || null,
                    TicketNameName: customerRow?.Name || entry.TicketName,
                    Registration: registrationUuid,
                    RegistrationName: registrationName,
                    Driver: driverUuid,
                    DriverName: driverName,
                    Trip: String(tripSeq),
                    No: orderNo,
                });
            }

            let ticketNo = ticketsTableData ? Object.keys(ticketsTableData).length : 0;
            for (const key of Object.keys(ordersTickets)) {
                const entry = ordersTickets[key];
                const ticketRow = getTickets().find((item) => `${item.id}:${item.Name}` === entry.TicketName);
                ticketNo += 1;
                await apiPost("/api/tickets", {
                    ...entry,
                    TicketName: ticketRow?.uuid || null,
                    TicketNameName: ticketRow?.Name || entry.TicketName,
                    Registration: registrationUuid,
                    RegistrationName: registrationName,
                    Driver: driverUuid,
                    DriverName: driverName,
                    Trip: String(tripSeq),
                    No: ticketNo,
                });
            }

            await apiPost("/api/trip", {
                id: tripSeq + 1,
                DateReceive: dayjs(selectedDateReceive).format('DD/MM/YYYY'),
                DateDelivery: dayjs(selectedDateDelivery).format('DD/MM/YYYY'),
                DateStart: dayjs(new Date()).format('DD/MM/YYYY'),
                Registration: registrationUuid,
                RegistrationName: registrationName,
                Driver: driverUuid,
                DriverName: driverName,
                Depot: depots,
                CostTrip: costTrip,
                WeightHigh: parseFloat(weightH).toFixed(2),
                WeightLow: parseFloat(weightL).toFixed(2),
                WeightTruck: parseFloat(weight).toFixed(2),
                TotalWeight: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)),
                Status: status,
                StatusTrip: "กำลังจัดเที่ยววิ่ง",
                TruckType: isCompanyTruck ? "รถใหญ่" : "รถรับจ้างขนส่ง",
                ...orderTrip,
                ...ticketTrip
            });

            await apiPut(
                isCompanyTruck ? `/api/truck_registration/${registrationUuid}` : `/api/truck_transport/${registrationUuid}`,
                { Status: "TR:" + tripSeq }
            );

            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            refetchTripData?.();
            refetchBasicData?.();
            setOpen(false);
            setOrdersTickets({});
            setSelling({});
            setVolumeT({});
            setVolumeS({});
            setWeightA({});
            setOrderTrip({});
            setWeightH(0);
            setWeightL(0);
            setCostTrip(0);
            setRegistration("0:0:0:0:0");
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    const handleCancle = () => {
        setOpen(false);
    }

    // const handleCustomer = () => {
    //     database
    //         .ref("order/")
    //         .child(order.length)
    //         .update({
    //             id: order.length + 1,
    //             DateReceive: dayjs(selectedDateReceive).format('DD/MM/YYYY'),
    //             Registration: registration.split(":")[1],
    //             Driver: registration.split(":")[2],
    //             Customer: customers.split(":")[1],
    //             TicketName: customers,
    //             Trip: trip.length
    //         })
    //         .then(() => {
    //             ShowSuccess("เพิ่มออเดอร์เรียบร้อย");

    //         })
    //         .catch((error) => {
    //             ShowError("เพิ่มข้อมูลไม่สำเร็จ");
    //             console.error("Error pushing data:", error);
    //         });
    // };

    const handleTotalWeight = (newHeavyOil, newWeight) => {
        const total =
            parseFloat(newHeavyOil || 0) +
            parseFloat(newWeight || 0);
        setTotalWeight(total);
    };

    const getDriver = () => {
        const driverss = [
            ...[...truckH]
                .filter((item) => item.Driver !== "0:ไม่มี" && item.Status === "ว่าง")
                .sort((a, b) => (a.Driver || "").localeCompare(b.Driver || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, Type: "รถบริษัท" })),

            ...[...truckT]
                .filter((item) => item.TruckType === "รถใหญ่")
                .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, Type: "รถรับจ้างขนส่ง" })),
        ];

        return driverss.filter((item) => item.id);
    };

    console.log("Driver : ", getDriver());

    const getTickets = () => {
        if (!registration || registration === "0:0:0:0:0") return [];

        const selectedTruck = getDriver().find(
            (item) =>
                item.Type === "รถบริษัท" ?
                    (`${item.id}:${item.RegHead}:${item.Driver}:${item.Type}` === registration)
                    : (`${item.id}:${item.Registration}:${item.id}:${item.Name}:${item.Type}` === registration)
        );

        console.log("selectTicket : ", selectedTruck);

        if (!selectedTruck) return [];

        const tickets = [
            { Name: "ตั๋วเปล่า", TicketName: "ตั๋วเปล่า", id: 1, Rate1: 0, Rate2: 0, Rate3: 0, CustomerType: "ตั๋วเปล่า" },

            ...[...ticketsA]
                .filter((row) => row.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วน้ำมัน" })),

            ...[...ticketsPS]
                .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),

            ...[...ticketsT]
                .filter((item) => (item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ") && (item.SystemStatus !== "ไม่อยู่ในระบบ"))
                .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),
        ];


        return tickets.filter((item) => item.id || item.TicketsCode);
    };

    const getCustomers = () => {
        if (!registration || registration === "0:0:0:0:0") return [];

        // const selectedTruck = allTruck.find(
        //     (item) => `${item.id}:${item.RegHead}:${item.Driver}:` === registration.split("รถบริษัท")[0]
        // );
        const selectedTruck = getDriver().find(
            (item) =>
                item.Type === "รถบริษัท" ?
                    (`${item.id}:${item.RegHead}:${item.Driver}:${item.Type}` === registration)
                    : (`${item.id}:${item.Registration}:${item.id}:${item.Name}:${item.Type}` === registration)
        );

        if (!selectedTruck) return [];

        const customers = [
            ...[...ticketsPS]
                .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),

            ...[...ticketsT]
                .filter((item) => (item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ") && item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),

            ...[...ticketsB].filter((item) => item.Status === "ลูกค้าประจำ" && item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => (a.Name || "").localeCompare(b.Name || "", undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรถใหญ่" })) // รถใหญ่ใช้ ticketsB
        ];

        return customers.filter((item) => item.id || item.TicketsCode);
    };

    React.useEffect(() => {
        const currentRow = getDriver().find(
            (item) =>
                item.Type === "รถบริษัท" ?
                    (`${item.id}:${item.RegHead}:${item.Driver}:${item.Type}` === registration)
                    : (`${item.id}:${item.Registration}:${item.id}:${item.Name}:${item.Type}` === registration)
        );
        if (currentRow) {
            if (currentRow.Type === "รถบริษัท") {
                setWeight(currentRow.TotalWeight || 0); // ใช้ค่า Weight จาก row หรือ 0 ถ้าไม่มี
            } else {
                setWeight(currentRow.Weight || 0); // ใช้ค่า Weight จาก row หรือ 0 ถ้าไม่มี
            }
        }
    }, [registration, getDriver()]);

    console.log("driver : ", getDriver());
    console.log("ticket : ", getTickets());
    console.log("registraation : ", registration);
    // const getTickets = () => {
    //     if (codeCustomer === "") {
    //         // รวมข้อมูลทั้งหมด พร้อมเพิ่ม `type` ให้กับแต่ละรายการ
    //         return [
    //             ...ticketsPS.map((item) => ({ ...item, type: item.Code })),
    //             ...ticketsT
    //                 .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
    //                 .map((item) => ({ ...item, type: "T" })),
    //             ...ticketsB.map((item) => ({ ...item, type: "A" })),
    //         ];
    //     } else if (codeCustomer === "PS") {
    //         return ticketsPS.map((item) => ({ ...item, type: item.Code }));
    //     } else if (codeCustomer === "T") {
    //         return ticketsT
    //             .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
    //             .map((item) => ({ ...item, type: "T" }));
    //     } else if (codeCustomer === "A") {
    //         return ticketsB.map((item) => ({ ...item, type: "A" }));
    //     }
    //     return []; // ถ้าไม่มีการกำหนด ให้คืนค่า empty array
    // };

    // const getCustomers = () => {
    //     if (codeCustomer === "") {
    //         // รวมข้อมูลทั้งหมด พร้อมเพิ่ม `type` ให้กับแต่ละรายการ
    //         return [
    //             ...ticketsPS.map((item) => ({ ...item, type: "PS" })),
    //             ...ticketsT
    //                 .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
    //                 .map((item) => ({ ...item, type: "T" })),
    //             ...ticketsB.map((item) => ({ ...item, type: "A" })),
    //         ];
    //     } else if (codeCustomer === "PS") {
    //         return ticketsPS.map((item) => ({ ...item, type: "PS" }));
    //     } else if (codeCustomer === "T") {
    //         return ticketsT
    //             .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
    //             .map((item) => ({ ...item, type: "T" }));
    //     } else if (codeCustomer === "A") {
    //         return ticketsB.map((item) => ({ ...item, type: "A" }));
    //     }
    //     return []; // ถ้าไม่มีการกำหนด ให้คืนค่า empty array
    // };

    let G95 = (Number(volumeT.G95) - Number(volumeS.G95));
    let B95 = (Number(volumeT.B95) - Number(volumeS.B95));
    let B7 = (Number(volumeT.B7) - Number(volumeS.B7));
    let G91 = (Number(volumeT.G91) - Number(volumeS.G91));
    let E20 = (Number(volumeT.E20) - Number(volumeS.E20));
    let PWD = (Number(volumeT.PWD) - Number(volumeS.PWD));
    let B20 = (Number(volumeT.B20) - Number(volumeS.B20));

    const isNegative = Math.min(G95, B95, B7, G91, E20, PWD, B20) < 0;

    const fuelTypes = ["G95", "B95", "B7", "G91", "E20", "PWD", "B20"];
    const totalVolume = fuelTypes.reduce((sum, type) => sum + (Number(volumeT[type]) - Number(volumeS[type])), 0) || 0;

    const getBackgroundColor = (value) =>
        value < 0 ? "red" : value > 0 ? "yellow" : "lightgray";

    console.log("G95", G95);
    console.log("B95", B95);
    console.log("B7", B7);
    console.log("G91", G91);
    console.log("E20", E20);
    console.log("PWD", PWD);
    console.log("B20", B20);
    console.log("Check : ", isNegative);

    return (
        <React.Fragment>
            <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ height: 50, borderRadius: 3 }} endIcon={<AddLocationAltIcon />} >จัดเที่ยววิ่ง</Button>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidths <= 900 ? true : false}
                onClose={handleCancle}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "1300px", // กำหนดความสูงของ Dialog
                        maxHeight: "98vh",
                    },
                    zIndex: 1000,
                }}
                maxWidth="xl"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container marginTop={-1.5} marginBottom={-1.5}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >บันทึกข้อมูลการขนส่งน้ำมันของรถใหญ่</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError size="small" onClick={handleCancle}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }} ref={dialogRef}>
                        <Grid container spacing={1} marginTop={0.5}>
                            <Grid item md={3.5} xs={12} textAlign="right">
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, color: theme.palette.success.dark, marginTop: 0.5 }} gutterBottom>ตั๋วน้ำมัน</Typography>
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 0.5 }} gutterBottom>วันที่รับ</Typography>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDateReceive)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChangeReceive}
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
                                                                fontSize: "16px",
                                                                marginLeft: -1,
                                                            },
                                                            "& .MuiInputAdornment-root": {
                                                                marginLeft: -2, // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
                                                                paddingLeft: "0px"  // เอาพื้นที่ด้านซ้ายของไอคอนออก
                                                            }
                                                        },
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Paper>

                                </Box>
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 0.5 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                    <Paper
                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                        <Autocomplete
                                            id="autocomplete-registration-1"
                                            options={getDriver()}
                                            getOptionLabel={(option) =>
                                                option.Type === "รถบริษัท" ?
                                                    `${option.Driver ? option.DriverName : ""} : ${option.RegHead ? option.RegHead : ""}${option.RegTail &&
                                                        option.RegTail !== "0:ไม่มี"
                                                        ? `/${option.RegTailName}`
                                                        : ""
                                                    }`
                                                    :
                                                    `${option.Name ? option.Name : ""} ${option.Registration === "ไม่มี" ? "" : `:${option.Registration}`}`
                                            }
                                            isOptionEqualToValue={(option, value) => option.id === value.id && option.Type === value.Type}
                                            value={registration ? getDriver().find(item =>
                                                item.Type === "รถบริษัท" ?
                                                    (`${item.id}:${item.RegHead}:${item.Driver}:${item.Type}` === registration)
                                                    : item.Type === "รถรับจ้างขนส่ง" ?
                                                        (`${item.id}:${item.Registration}:${item.id}:${item.Name}:${item.Type}` === registration)
                                                        : null
                                            )
                                                :
                                                null
                                            }
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    let values = "";
                                                    newValue.Type === "รถบริษัท" ?
                                                        handleRegistration(`${newValue.id}:${newValue.RegHead}:${newValue.Driver}:${newValue.Type}`)
                                                        :
                                                        handleRegistration(`${newValue.id}:${newValue.Registration}:${newValue.id}:${newValue.Name}:${newValue.Type}`); // อัพเดตค่าเมื่อเลือก
                                                } else {
                                                    setRegistration("0:0:0:0:0");
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={!registration || registration === "0:0:0:0:0" ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                    }}
                                                />
                                            )}
                                            fullWidth
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    {
                                                        option.Type === "รถบริษัท" ?
                                                            <Typography fontSize="16px">{`${option.DriverName} : ${option.RegHead}${option.RegTail &&
                                                                option.RegTail !== "0:ไม่มี"
                                                                ? `/${option.RegTailName}`
                                                                : ""
                                                                }`}</Typography>
                                                            :
                                                            <Typography fontSize="16px">{`${option.Name}  ${option.Registration === "ไม่มี" ? "" : `:${option.Registration}`}`}</Typography>
                                                    }
                                                </li>
                                            )}
                                        />
                                    </Paper>
                                </Box>
                            </Grid>
                            <Grid item md={2.5} xs={12} display="flex" alignItems="center" justifyContent="center">
                                <Typography variant="h6" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 0.5 }} fontWeight="bold" gutterBottom>คลัง</Typography>
                                <Paper sx={{ width: "100%" }}
                                    component="form">
                                    <Autocomplete
                                        id="depot-autocomplete"
                                        options={depot}
                                        getOptionLabel={(option) => `${option.Name}`}
                                        value={depot.find((d) => d.Name + ":" + d.Zone === depots) || null}
                                        onChange={(event, newValue) => {
                                            setDepots(newValue ? `${newValue.Name}:${newValue.Zone}` : '')
                                            updateRatesByDepot(newValue.Zone);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={depots === "" ? "กรุณาเลือกคลัง" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: "30px" },
                                                    "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                }}
                                            />
                                        )}
                                        sx={{
                                            "& .MuiOutlinedInput-root": { height: "30px" },
                                            "& .MuiInputBase-input": {
                                                fontSize: "16px",
                                                padding: "2px 6px",
                                            },
                                        }}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">{option.Name}</Typography>
                                            </li>
                                        )}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                        <Paper
                            sx={{ p: 1, backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 ? "red" : "lightgray", marginBottom: 1 }}
                        >
                            <Paper
                                className="custom-scrollbar"
                                sx={{
                                    position: "relative",
                                    maxWidth: "100%",
                                    height: "31vh", // ความสูงรวมของ container หลัก
                                    overflow: "hidden",
                                    marginBottom: 0.5,
                                    overflowX: "auto",
                                }}
                            >
                                {/* Header: คงที่ด้านบน */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "35px", // กำหนดความสูง header
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 3,
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableHead>
                                            <TableRow>
                                                <TablecellTickets width={50} sx={{ textAlign: "center", fontSize: "16px", height: "35px", backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 && theme.palette.error.main }}>ลำดับ</TablecellTickets>
                                                <TablecellTickets width={350} sx={{ textAlign: "center", fontSize: "16px", height: "35px", backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 && theme.palette.error.main }}>ตั๋ว</TablecellTickets>
                                                <TablecellTickets width={150} sx={{ textAlign: "center", fontSize: "16px", height: "35px", backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 && theme.palette.error.main }}>เลขที่ออเดอร์</TablecellTickets>
                                                <TablecellTickets width={100} sx={{ textAlign: "center", fontSize: "16px", height: "35px", backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 && theme.palette.error.main }}>ค่าบรรทุก</TablecellTickets>
                                                <TableCellG95 width={60} sx={{ textAlign: "center", fontSize: "16px", height: "35px" }}>G95</TableCellG95>
                                                <TableCellB95 width={60} sx={{ textAlign: "center", fontSize: "16px", height: "35px" }}>B95</TableCellB95>
                                                <TableCellB7 width={60} sx={{ textAlign: "center", fontSize: "16px", height: "35px" }}>B7(D)</TableCellB7>
                                                <TableCellG91 width={60} sx={{ textAlign: "center", fontSize: "16px", height: "35px" }}>G91</TableCellG91>
                                                <TableCellE20 width={60} sx={{ textAlign: "center", fontSize: "16px", height: "35px" }}>E20</TableCellE20>
                                                <TableCellPWD width={60} sx={{ textAlign: "center", fontSize: "16px", height: "35px" }}>PWD</TableCellPWD>
                                                <TableCellB20 width={60} sx={{ textAlign: "center", fontSize: "16px", height: "35px" }}>B20</TableCellB20>
                                                <TablecellTickets width={Object.keys(ordersTickets).length > 5 ? 90 : 80} sx={{ textAlign: "center", height: "35px", borderLeft: "3px solid white", backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 && theme.palette.error.main }} />
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </Box>

                                {/* TableBody: ส่วนที่ scroll ได้ */}
                                <Box
                                    className="custom-scrollbar"
                                    sx={{
                                        position: "absolute",
                                        top: "35px", // เริ่มจากด้านล่าง header
                                        bottom: "35px", // จนถึงด้านบนของ footer
                                        overflowY: "auto",
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableBody>
                                            {Object.keys(ordersTickets).map((key) => (
                                                <OrderDetail
                                                    key={ordersTickets[key].id}
                                                    detail={ordersTickets[key]}
                                                    ticketsTrip={ticketsTrip}
                                                    total={weightOil}
                                                    totalWeight={(parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight))}
                                                    editMode={editMode}
                                                    depots={depots}
                                                    tickets={getTickets()}
                                                    onSendBack={handleSendBack}
                                                    onDelete={() => handleDelete(parseInt(key))}
                                                    onAddProduct={(productName, field, value) =>
                                                        handleAddProduct(parseInt(key), productName, field, value)
                                                    }
                                                    onUpdateOrderID={(field, value) =>
                                                        handleUpdateOrderID(parseInt(key), field, value)
                                                    }
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>

                                {/* Footer: คงที่ด้านล่าง */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: 2,
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableFooter>
                                            <TableRow>
                                                <TablecellTickets width={650} sx={{ textAlign: "center", fontSize: "16px", backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 && theme.palette.error.main }}>
                                                    ปริมาณรวม
                                                </TablecellTickets>
                                                <TableCellG95 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.G95 || 0}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{volumeT.G95 || 0}</Typography>
                                                    }
                                                </TableCellG95>
                                                <TableCellB95 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.B95 || 0}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{volumeT.B95 || 0}</Typography>
                                                    }
                                                </TableCellB95>
                                                <TableCellB7 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.B7 || 0}
                                                                // value={volumeB7}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{volumeT.B7 || 0}</Typography>
                                                    }
                                                </TableCellB7>
                                                <TableCellG91 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.G91 || 0}
                                                                // value={volumeG91}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{volumeT.G91 || 0}</Typography>
                                                    }
                                                </TableCellG91>
                                                <TableCellE20 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.E20 || 0}
                                                                // value={volumeE20}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{volumeT.E20 || 0}</Typography>
                                                    }
                                                </TableCellE20>
                                                <TableCellPWD width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.PWD || 0}
                                                                // value={volumePWD}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{volumeT.PWD || 0}</Typography>
                                                    }
                                                </TableCellPWD>
                                                <TableCellB20 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.B20 || 0}
                                                                // value={volumeB20}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{volumeT.B20 || 0}</Typography>
                                                    }
                                                </TableCellB20>
                                                <TablecellTickets width={Object.keys(ordersTickets).length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white", backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 && theme.palette.error.main }} >
                                                    <Box display="flex" justifyContent="center" alignItems="center">
                                                        {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1 }} gutterBottom>ต้นทุนรวม</Typography>
                                                        <Paper component="form">
                                                            <TextField size="small" fullWidth
                                                                type="number"
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '14px'
                                                                    },
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '30px', // ปรับความสูงของ TextField
                                                                    },
                                                                }}
                                                                // value={cost}
                                                                value={showTrips ? cost : ((productTG91.TotalCost || 0) + (productTG95.TotalCost || 0) + (productTB7.TotalCost || 0) + (productTB95.TotalCost || 0) + (productTE20.TotalCost || 0) + (productTPWD.TotalCost || 0))
                                                            />
                                                        </Paper> */}
                                                        {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1, marginLeft: 1 }} gutterBottom>ปริมาณรวมทั้งหมด</Typography> */}
                                                        {
                                                            editMode ?
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    <TextField size="small" fullWidth
                                                                        type="number"
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '16px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '25px', // ปรับความสูงของ TextField
                                                                                display: 'flex', // ใช้ flexbox
                                                                                alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                                paddingLeft: 2
                                                                            },
                                                                        }}
                                                                        value={(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD + volumeT.B20) || 0}

                                                                    // value={volumeG95}
                                                                    />
                                                                </Paper>
                                                                :
                                                                <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" color="black" gutterBottom>{(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD + volumeT.B20) || 0}</Typography>
                                                        }
                                                    </Box>
                                                </TablecellTickets>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </Paper>
                            <Grid container spacing={1} marginBottom={-1}>
                                <Grid item md={6} xs={12}>
                                    <Paper
                                        component="form"
                                        sx={{ height: "30px", width: "100%" }}
                                    >
                                        <Autocomplete
                                            id="autocomplete-tickets"
                                            options={getTickets()} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                            getOptionLabel={(option) =>
                                                `${option.Name}`
                                            } // กำหนดรูปแบบของ Label ที่แสดง
                                            isOptionEqualToValue={(option, value) => option.Name === value.Name} // ตรวจสอบค่าที่เลือก
                                            value={tickets ? getTickets().find(item => `${item.id}:${item.Name}` === tickets) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const value = `${newValue.id}:${newValue.Name}`;
                                                    handlePost({ target: { value } }); // อัพเดตค่าเมื่อเลือก
                                                } else {
                                                    setTickets("0:0"); // รีเซ็ตค่าเป็น default หากไม่มีการเลือก
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={tickets === "0:0" ? "เลือกตั๋วที่ต้องการเพิ่ม" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="16px">{`${option.Name}`}</Typography>
                                                </li>
                                            )}
                                            disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item md={2} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>น้ำมันหนัก</Typography>
                                    <Paper
                                        component="form" sx={{ width: "100%", marginTop: -1 }}>
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(weightH))}
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item md={2} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>น้ำมันเบา</Typography>
                                    <Paper
                                        component="form" sx={{ width: "100%", marginTop: -1 }}>
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(weightL))}
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Grid>
                                {/* {
                                regHead.map((row) => (
                                    row.RegHead === registration.split(":")[1] ? */}
                                <Grid item md={2} xs={6} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>น้ำหนักรถ</Typography>
                                    <Paper
                                        component="form" sx={{ width: "100%", marginTop: -1 }}>
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(weight))}
                                        //onChange={handleTotalWeight}
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Grid>
                                {
                                    windowWidths <= 900 &&
                                    <Grid item xs>
                                        <Box sx={{ backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 ? "red" : "lightgray", display: "flex", justifyContent: "center", alignItems: "center", p: 0.5, marginTop: -1, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                                            <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>รวม</Typography>
                                            <Paper
                                                component="form" sx={{ width: "100%", marginTop: 0.5 }}>
                                                <TextField size="small" fullWidth
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            height: '30px', // ปรับความสูงของ TextField
                                                            display: 'flex', // ใช้ flexbox
                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                            fontWeight: 'bold',
                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                        },
                                                        borderRadius: 10
                                                    }}
                                                    value={new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format((parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) || 0)}
                                                // InputProps={{
                                                //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                // }}
                                                />
                                            </Paper>
                                        </Box>
                                    </Grid>
                                }
                                {/* :
                                        null
                                ))
                            } */}
                            </Grid>
                        </Paper>
                        {/* {
                        weightOil !== 0 && showTrips ?
                            <Box>
                                <Divider>
                                    <Button variant="contained" color="info" size="small" onClick={handleTrip} sx={{ borderRadius: 20 }}>จัดเที่ยววิ่ง</Button>
                                </Divider>
                            </Box>
                            :
                            ""
                    }*/}
                        <Grid container spacing={1}>
                            <Grid item md={3.5} xs={12} textAlign="right">
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, color: theme.palette.info.main, marginTop: 0.5 }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 0.5 }} gutterBottom>วันที่ส่ง</Typography>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDateDelivery)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChangeDelivery}
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
                                                                fontSize: "16px",
                                                                marginLeft: -1
                                                            },
                                                            "& .MuiInputAdornment-root": {
                                                                marginLeft: -2, // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
                                                                paddingLeft: "0px"  // เอาพื้นที่ด้านซ้ายของไอคอนออก
                                                            }
                                                        },
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Paper>

                                </Box>
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 0.5 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                    <Paper
                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                        <TextField size="small" fullWidth
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "16px",
                                                    padding: "1px 4px",
                                                },
                                                borderRadius: 10
                                            }}
                                            value={(() => {
                                                const selectedItem = getDriver().find(item =>
                                                    item.Type === "รถบริษัท" ?
                                                        (`${item.id}:${item.RegHead}:${item.Driver}:${item.Type}` === registration)
                                                        :
                                                        (`${item.id}:${item.Registration}:${item.id}:${item.Name}:${item.Type}` === registration)
                                                );
                                                return selectedItem && selectedItem.Type === "รถบริษัท"
                                                    ? `${selectedItem.Driver ? selectedItem.DriverName : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""}${selectedItem.RegTail &&
                                                        selectedItem.RegTail !== "0:ไม่มี"
                                                        ? `/${selectedItem.RegTailName}`
                                                        : ""
                                                    }`
                                                    : selectedItem && selectedItem.Type === "รถรับจ้างขนส่ง"
                                                        ? `${selectedItem.Name ? selectedItem.Name : ""} ${selectedItem.Registration === "ไม่มี" ? "" : `:${selectedItem.Registration}`}`
                                                        : "";
                                            })()}
                                        />
                                        {/* <Autocomplete
                                            id="autocomplete-registration-2"
                                            options={regHead}
                                            getOptionLabel={(option) =>
                                                `${option.Driver ? option.Driver : ""} : ${option.RegHead ? option.RegHead : ""}/${option.RegTail ? option.RegTail : ""}`
                                            }
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            value={registration ? regHead.find(item => `${item.id}:${item.RegHead}:${item.Driver}` === registration) : null}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const value = `${newValue.id}:${newValue.RegHead}:${newValue.Driver}`;
                                                    setRegistration(value);
                                                } else {
                                                    setRegistration(null);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={!registration ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": { fontSize: "14px", padding: "3px 8px" },
                                                    }}
                                                />
                                            )}
                                            fullWidth
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="14px">{`${option.Driver} : ${option.RegHead}/${option.RegTail}`}</Typography>
                                                </li>
                                            )}
                                            disabled={!showTickers}
                                        /> */}
                                    </Paper>
                                </Box>
                            </Grid>
                            {
                                windowWidths >= 900 &&
                                <Grid item md={2.5} xs={12}>
                                    <Box sx={{ backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 ? "red" : "lightgray", display: "flex", justifyContent: "center", alignItems: "center", p: 0.5, marginTop: -1, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>รวม</Typography>
                                        <Paper
                                            component="form" sx={{ width: "100%", marginTop: 0.5 }}>
                                            <TextField size="small" fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '30px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                    borderRadius: 10
                                                }}
                                                value={new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format((parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) || 0)}
                                            // InputProps={{
                                            //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                            // }}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>
                            }
                        </Grid>
                        <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                            <Paper
                                className="custom-scrollbar"
                                sx={{
                                    position: "relative",
                                    maxWidth: "100%",
                                    height: "31vh", // ความสูงรวมของ container หลัก
                                    overflow: "hidden",
                                    marginBottom: 0.5,
                                    overflowX: "auto",
                                    paddingBottom: -1
                                }}
                            >
                                {/* Header: คงที่ด้านบน */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "35px", // กำหนดความสูง header
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 3,
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableHead>
                                            <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.panda.main }}>
                                                <TablecellCustomers width={50} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    ลำดับ
                                                </TablecellCustomers>
                                                <TablecellCustomers width={350} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    ลูกค้า
                                                </TablecellCustomers>
                                                <TablecellCustomers width={100} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    ค่าบรรทุก
                                                </TablecellCustomers>
                                                <TableCellG95 width={60} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    G95
                                                </TableCellG95>
                                                <TableCellB95 width={60} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    B95
                                                </TableCellB95>
                                                <TableCellB7 width={60} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    B7(D)
                                                </TableCellB7>
                                                <TableCellG91 width={60} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    G91
                                                </TableCellG91>
                                                <TableCellE20 width={60} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    E20
                                                </TableCellE20>
                                                <TableCellPWD width={60} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    PWD
                                                </TableCellPWD>
                                                <TableCellB20 width={60} sx={{ textAlign: "center", height: "35px", fontSize: "16px" }}>
                                                    B20
                                                </TableCellB20>
                                                <TablecellCustomers width={Object.keys(selling).length > 4 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} />
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </Box>

                                {/* TableBody: ส่วนที่ scroll ได้ */}
                                <Box
                                    className="custom-scrollbar"
                                    sx={{
                                        position: "absolute",
                                        top: "35px", // เริ่มจากด้านล่าง header
                                        bottom: "50px", // จนถึงด้านบนของ footer
                                        overflowY: "auto",
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableBody>
                                            {
                                                Object.keys(selling).map((key) => (
                                                    <SellingDetail
                                                        key={selling[key].id}
                                                        detail={selling[key]}
                                                        orders={order.length}
                                                        ticketsTrip={ticketsTrip}
                                                        customers={customers}
                                                        editMode={editMode}
                                                        depots={depots}
                                                        onSendBack={handleSendBackSell}
                                                        onDelete={() => handleDeleteCustomer(parseInt(key))}
                                                        onAddProduct={(productName, field, value) =>
                                                            handleAddCustomer(parseInt(key), productName, field, value)
                                                        }
                                                        onUpdateOrder={(field, value) =>
                                                            handleUpdateOrder(parseInt(key), field, value) // ✅ ฟังก์ชันอัปเดต orderID
                                                        }
                                                    />
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </Box>

                                {/* Footer: คงที่ด้านล่าง */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: "25px", // จนถึงด้านบนของ footer
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 2,
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableFooter>
                                            <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.panda.main, }}>
                                                <TablecellCustomers width={500} sx={{ textAlign: "center", fontSize: "16px" }}>
                                                    รวม
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", fontSize: "16px", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.G95 || 0}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", fontSize: "16px", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.B95 || 0}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", fontSize: "16px", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.B7 || 0}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", fontSize: "16px", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.G91 || 0}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", fontSize: "16px", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.E20 || 0}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", fontSize: "16px", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.PWD || 0}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", fontSize: "16px", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.B20 || 0}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={Object.keys(selling).length > 4 ? 90 : 80} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                        },
                                                                    }}
                                                                    value={(volumeS.G91 + volumeS.G95 + volumeS.B7 + volumeS.B95 + volumeS.E20 + volumeS.PWD + volumeS.B20) || 0}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="16px" color="black" fontWeight="bold" gutterBottom>{(volumeS.G91 + volumeS.G95 + volumeS.B7 + volumeS.B95 + volumeS.E20 + volumeS.PWD + volumeS.B20) || 0}</Typography>
                                                    }
                                                </TablecellCustomers>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>

                                {/* Footer: คงที่ด้านล่าง */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        height: "25px",
                                        bottom: 0,
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 2,
                                        borderTop: "2px solid white",
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableFooter>
                                            <TableRow sx={{ position: "sticky", zIndex: 3, backgroundColor: theme.palette.panda.main }}>
                                                <TablecellCustomers width={500} sx={{ textAlign: "center", height: "25px", fontSize: "16px" }}>
                                                    คงเหลือ
                                                </TablecellCustomers>
                                                {
                                                    fuelTypes.map((type) => {
                                                        const value = Number(volumeT[type]) - Number(volumeS[type]);
                                                        return (
                                                            <TablecellCustomers
                                                                key={type}
                                                                width={60}
                                                                sx={{
                                                                    textAlign: "center",
                                                                    color: "black",
                                                                    height: "25px",
                                                                    fontWeight: "bold",
                                                                    backgroundColor: getBackgroundColor(value),
                                                                    borderLeft: "2px solid white",
                                                                    fontSize: "16px"
                                                                }}
                                                            >
                                                                {value || 0}
                                                            </TablecellCustomers>
                                                        );
                                                    })
                                                }
                                                <TablecellCustomers width={Object.keys(selling).length > 4 ? 90 : 80} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '16px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '25px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                        },
                                                                    }}
                                                                    value={totalVolume}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>
                                                                {totalVolume}
                                                            </Typography>
                                                    }
                                                </TablecellCustomers>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </Paper>
                            <Grid container spacing={1}>
                                <Grid item md={6} xs={12}>
                                    <Paper
                                        component="form"
                                    >
                                        <Grid container>
                                            <Grid item sm={12} xs={12}>
                                                <Autocomplete
                                                    id="autocomplete-tickets"
                                                    options={getCustomers()} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                                    getOptionLabel={(option) =>
                                                        `${option.Name}`
                                                    } // กำหนดรูปแบบของ Label ที่แสดง
                                                    isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบค่าที่เลือก
                                                    value={customers ? getCustomers().find(item => `${item.id}:${item.Name}` === customers) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                    onChange={(event, newValue) => {
                                                        if (newValue) {
                                                            const value = `${newValue.id}:${newValue.Name}`;
                                                            handlePostSelling({ target: { value } }); // อัพเดตค่าเมื่อเลือก
                                                        } else {
                                                            setCustomers("0:0"); // รีเซ็ตค่าเป็น default หากไม่มีการเลือก
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={customers === "0:0" ? "เลือกลูกค้าที่ต้องการเพิ่ม" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                                "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                            }}
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                        <li {...props}>
                                                            <Typography fontSize="16px">{`${option.Name}`}</Typography>
                                                        </li>
                                                    )}
                                                    disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                                />
                                            </Grid>

                                            {/* <Grid item sm={1.5} xs={2}>
                                            <Paper
                                                component="form">
                                                <TextField size="small" fullWidth sx={{ borderRadius: 10 }} value={codes} onChange={(e) => setCodes(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item sm={8} xs={7}>
                                            <Select
                                                id="demo-simple-select"
                                                value={customers}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(event) => handlePostSelling(event)}
                                                fullWidth
                                            >
                                                <MenuItem value={"0:0"}>
                                                    เลือกลูกค้าที่ต้องการเพิ่ม
                                                </MenuItem>
                                                {getCustomers().map((row) => {
                                                    // ตรวจสอบประเภทของข้อมูลเพื่อกำหนด prefix ที่เหมาะสม
                                                    const prefix = row.type;
                                                    const id = row.id || row.TicketsCode;
                                                    const name = row.Name || row.Name;

                                                    return (
                                                        <MenuItem key={id} value={`${prefix}:${id}:${name}`}>
                                                            {`${prefix}:${id}:${name}`}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </Grid>
                                        <Grid item sm={2.5} xs={3} display="flex" alignItems="center" paddingLeft={0.5} paddingRight={0.5}>
                                            {
                                                (volumeG95 + volumeG91 + volumeB7 + volumeB95 + volumeE20 + volumePWD) !== 0 && <Button variant="contained" color="info" fullWidth onClick={handleCustomer}>เพิ่มออเดอร์</Button>
                                            }
                                        </Grid> */}
                                        </Grid>
                                    </Paper>
                                </Grid>
                                {
                                    registration.split(":")[4] !== "รถรับจ้างขนส่ง" &&
                                    <Grid item md={2} xs={6} display="flex" alignItems="center" justifyContent="center">
                                        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>ค่าเที่ยว</Typography>
                                        <Paper sx={{ width: "100%", marginTop: -1 }}
                                            component="form">
                                            <TextField
                                                size="small"
                                                fullWidth
                                                value={new Intl.NumberFormat("en-US").format(costTrip)}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: "30px" },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "16px",
                                                        padding: "2px 6px",
                                                    },
                                                    borderRadius: 10
                                                }}
                                                onChange={handleChangeCostTrip}
                                            />
                                        </Paper>
                                    </Grid>
                                }
                                <Grid item md={registration.split(":")[4] !== "รถรับจ้างขนส่ง" ? 4 : 6} xs={registration.split(":")[4] !== "รถรับจ้างขนส่ง" ? 6 : 12} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>สถานะ</Typography>
                                    <Paper sx={{ width: "100%", marginTop: -1 }}
                                        component="form">
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={status}
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "16px",
                                                    padding: "2px 6px",
                                                },
                                                borderRadius: 10,
                                            }}
                                            onChange={(e) => setStatus(e.target.value)}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                    {
                        (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) <= 50300 &&
                        !isNegative && ( // เพิ่มเงื่อนไขเช็คว่าห้ามมีค่าติดลบ
                            <>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                                    <Button onClick={handleCancle} variant="contained" color="error" sx={{ marginRight: 1 }} size="small">ยกเลิก</Button>
                                    <Button onClick={handleSubmit} variant="contained" color="success" size="small">บันทึก</Button>
                                </Box>
                                <Box textAlign="center" marginTop={1}>
                                    <Button variant="contained" size="small" onClick={handleSaveAsImage}>บันทึกรูปภาพ</Button>
                                </Box>
                            </>
                        )
                    }
                </DialogContent>
                {/* <DialogActions
                    sx={{
                        textAlign: "center", // ตั้งค่ากลาง
                        borderTop: "2px solid " + theme.palette.panda.dark,
                        display: "flex", // ใช้ Flexbox
                        justifyContent: "center", // จัดตำแหน่งปุ่มให้อยู่กึ่งกลาง
                    }}
                >
                    <Button onClick={handleSubmit} variant="contained" color="success" size="small">บันทึก</Button>
                    <Button onClick={handleCancle} variant="contained" color="error" size="small">ยกเลิก</Button>
                </DialogActions> */}


            </Dialog>
        </React.Fragment>

    );
};

export default InsertTrips;
