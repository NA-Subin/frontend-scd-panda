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
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TablecellCustomers, TableCellE20, TableCellG91, TableCellG95, TableCellPWD, TablecellSelling, TablecellTickets } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import OrderDetail from "./OrderDetail";
import SellingDetail from "./SellingDetail";
import "../../theme/scrollbar.css"
import { useBasicData } from "../../server/provider/BasicDataProvider";

const InsertTrips = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [codeCustomer, setCodeCustomer] = React.useState("");
    const [codes, setCodes] = React.useState("");
    const [tickets, setTickets] = React.useState("0:0");
    const [customers, setCustomers] = React.useState("0:0");
    const [customer, setCustomer] = React.useState("0:0");
    const [driverss, setDriverss] = React.useState("0:0");
    const [selectedValue, setSelectedValue] = useState('');
    const [registration, setRegistration] = React.useState("0:0");
    const [weight, setWeight] = React.useState(0);
    const [totalWeight, setTotalWeight] = React.useState(0);
    const [showTickers, setShowTickers] = React.useState(true);
    const [showTrips, setShowTrips] = React.useState(true);
    const [selectedDateReceive, setSelectedDateReceive] = useState(dayjs(new Date()));
    const [selectedDateDelivery, setSelectedDateDelivery] = useState(dayjs(new Date()));
    const [depots, setDepots] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [ticket, setTicket] = React.useState(0);
    const [ticketsTrip, setTicketsTrip] = React.useState(0);
    const [ticketTrip, setTicketTrip] = React.useState(0);
    const [ticketsOrder, setTicketsOrder] = React.useState([]);
    const dialogRef = useRef(null);
    const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
    const [editMode, setEditMode] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [ordersTickets, setOrdersTickets] = React.useState({});
    const [selling, setSelling] = React.useState({});
    const [volumeT, setVolumeT] = React.useState({});
    const [volumeS, setVolumeS] = React.useState({});
    const [weightA, setWeightA] = React.useState({});
    const [orderTrip, setOrderTrip] = React.useState({});
    const [weightH, setWeightH] = React.useState(0);
    const [weightL, setWeightL] = React.useState(0);
    const [costTrip, setCostTrip] = React.useState(0);

    const { reghead, small, transport, drivers } = useBasicData();
    const truckH = Object.values(reghead || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const truckS = Object.values(small || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const truckT = Object.values(transport || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const driver = Object.values(drivers || {});

    const driverDetail = driver.filter((row) => row.Registration === "0:ไม่มี" && (row.TruckType === "รถเล็ก" || row.TruckType === "รถใหญ่/รถเล็ก"));

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

    console.log("Registration : ", registration);

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


    // const handleDateChangeReceive = (newValue) => {
    //     if (newValue) {
    //         const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
    //         setSelectedDateReceive(formattedDate);
    //     }
    // };

    // const handleDateChangeDelivery = (newValue) => {
    //     if (newValue) {
    //         const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
    //         setSelectedDateDelivery(formattedDate);
    //     }
    // };

    const handleDateChangeReceive = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue);
            setSelectedDateReceive(formattedDate);
            setSelectedDateDelivery(formattedDate);

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
        database.ref("/tickets/" + ticket + "/ticketOrder").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTicket = [];
            for (let id in datas) {
                dataTicket.push({ id, ...datas[id] })
            }
            setTicketsOrder(dataTicket);
        });
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

    const handleSendBack = (newTotal, newTotalVolume, newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD) => {
        setWeightOil((prev) => prev + newTotal);
        setVolume((prev) => prev + newTotalVolume);
        setVolumeG91((prev) => prev + newVolumeG91);
        setVolumeG95((prev) => prev + newVolumeG95);
        setVolumeB7((prev) => prev + newVolumeB7);
        setVolumeB95((prev) => prev + newVolumeB95);
        setVolumeE20((prev) => prev + newVolumeE20);
        setVolumePWD((prev) => prev + newVolumePWD);
        // setCostG91((prev) => prev + newCostG91);
        // setCostG95((prev) => prev + newCostG95);
        // setCostB7((prev) => prev + newCostB7);
        // setCostB95((prev) => prev + newCostB95);
        // setCostE20((prev) => prev + newCostE20);
        // setCostPWD((prev) => prev + newCostPWD);
    };

    const handleSendBackSell = (
        newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD
    ) => {
        console.log("Before Update:", { volumeG91, volumeG95, volumeB7, volumeB95, volumeE20, volumePWD });
        console.log("Received Values:", { newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD });

        setVolumeG91(prev => prev - newVolumeG91);
        setVolumeG95(prev => prev - newVolumeG95);
        setVolumeB7(prev => prev - newVolumeB7);
        setVolumeB95(prev => prev - newVolumeB95);
        setVolumeE20(prev => prev - newVolumeE20);
        setVolumePWD(prev => prev - newVolumePWD);

        // setCostG91(prev => prev - newCostG91);
        // setCostG95(prev => prev - newCostG95);
        // setCostB7(prev => prev - newCostB7);
        // setCostB95(prev => prev - newCostB95);
        // setCostE20(prev => prev - newCostE20);
        // setCostPWD(prev => prev - newCostPWD);

        console.log("After Update:", { volumeG91, volumeG95, volumeB7, volumeB95, volumeE20, volumePWD });
    };


    const [orders, setOrders] = useState([]);
    const [data, setData] = useState([]);

    const getData = async () => {
        database.ref("/customer").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            console.log(dataList);
            setData(dataList);
        });
    };

    const [regHead, setRegHead] = React.useState([]);
    const [smallTruck, setSmallTruck] = React.useState([]);
    const [allTruck, setAllTruck] = React.useState([]);

    const getTruck = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegHead = [];
            for (let id in datas) {
                if (datas[id].Driver !== "0:ไม่มี" && datas[id].RegTail !== "0:ไม่มี" && datas[id].Status === "ว่าง") {
                    dataRegHead.push({ id, ...datas[id], type: "รถใหญ่" });
                }
            }
            setRegHead(dataRegHead);

            database.ref("/truck/small/").on("value", (snapshot) => {
                const datas = snapshot.val();
                const dataSmall = [];
                for (let id in datas) {
                    if (datas[id].Status === "ว่าง" && datas[id].Driver === "0:ไม่มี") {
                        dataSmall.push({ id, ...datas[id], type: "รถเล็ก" });
                    }
                }
                setSmallTruck(dataSmall);
                setAllTruck([...dataRegHead, ...dataSmall]);
            });
        });
    };

    const [depot, setDepot] = React.useState([]);

    const getDepot = async () => {
        database.ref("/depot/oils").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataDepot = [];
            for (let id in datas) {
                dataDepot.push({ id, ...datas[id] })
            }
            setDepot(dataDepot);
        });
    };

    const [order, setOrder] = React.useState([]);

    const [trip, setTrip] = React.useState([]);
    const [trips, setTrips] = React.useState("");

    const getOrder = async () => {
        database.ref("/order").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataOrder = [];
            for (let id in datas) {
                dataOrder.push({ id, ...datas[id] })
            }
            setOrder(dataOrder);
        });
    };

    const [productT, setProductT] = React.useState([]);

    const getTrip = async () => {
        database.ref("/trip").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTrip = [];
            for (let id in datas) {
                dataTrip.push({ id, ...datas[id] })
            }
            setTrip(dataTrip);
        });
    };

    console.log("แสดงข้อมูลทั้งหมด", productT);

    const [ticketsT, setTicketsT] = React.useState([]);
    const [ticketsPS, setTicketsPS] = React.useState([]);
    const [ticketsA, setTicketsA] = React.useState([]);
    const [ticketsB, setTicketsB] = React.useState([]);
    const [ticketsS, setTicketsS] = React.useState([]);
    const [orderT, setOrderT] = React.useState([]);
    const [orderPS, setOrderPS] = React.useState([]);
    const [orderA, setOrderA] = React.useState([]);

    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            setTicket(datas.length);
        });

        database.ref("/customers/transports/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTicket = [];
            for (let id in datas) {
                if (datas[id].Status === "ตั๋ว" || datas[id].Status === "ตั๋ว/ผู้รับ")
                    dataTicket.push({ id, ...datas[id] })
            }
            setTicketsT(dataTicket);
        });

        database.ref("/customers/transports/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataCustomer = [];
            for (let id in datas) {
                if (datas[id].Status === "ผู้รับ" || datas[id].Status === "ตั๋ว/ผู้รับ")
                    dataCustomer.push({ id, ...datas[id] })
            }
            setCustomer(dataCustomer);
        });

        database.ref("/customers/gasstations/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataGasStations = [];
            for (let id in datas) {
                dataGasStations.push({ id, ...datas[id] })
            }
            setTicketsPS(dataGasStations);
        });

        database.ref("/customers/tickets/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataGasStations = [];
            for (let id in datas) {
                dataGasStations.push({ id, ...datas[id] })
            }
            setTicketsA(dataGasStations);
        });

        database.ref("/customers/bigtruck/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                dataStock.push({ id, ...datas[id] })
            }
            setTicketsB(dataStock);
        });

        database.ref("/customers/smalltruck/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                dataStock.push({ id, ...datas[id] })
            }
            setTicketsS(dataStock);
        });
    };

    useEffect(() => {
        getTicket();
        getData();
        getTruck();
        getDepot();
        getOrder();
        getTrip();
    }, []);

    console.log("Order : ", orders);

    const [isFocused, setIsFocused] = useState(false);

    const formatNumber = (value) => {
        const number = parseInt(value, 10);
        if (isNaN(number)) return "";
        return number.toLocaleString(); // => 3000 -> "3,000"
    };

    console.log("ข้อมูลตั๋ว : ", Object.values(ordersTickets));
    console.log("ข้อมูลลูกค้า : ", Object.values(selling));

    useEffect(() => {
        // คำนวณผลรวมค่า Travel ทุกครั้งที่ selling เปลี่ยน
        const totalTravel = Object.values(selling).reduce((sum, item) => sum + (item.Travel || 0), 0);
        setCostTrip(totalTravel);
    }, [selling]);

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
                    Rate: ticketData.Rate || 0,
                    Trip: trip.length,
                    Date: dayjs(selectedDateReceive).format('DD/MM/YYYY'),
                    Registration: registration,
                    CustomerType: ticketData.CustomerType || "-",
                    Driver: driverss,
                    Travel: ticketData.Travel || 0,
                    id: newIndex,
                    Product: {
                        P: { Volume: 0, Cost: 0, Selling: 0 },
                    }
                    // TicketName: ticketValue,
                    // id: newIndex,
                    // //Travel: ticketData.Travel || 0,
                    // OrderID: "",
                    // CustomerType: "ตั๋วรถเล็ก",
                    // Trip: trip.length,
                    // Product: {
                    //     P: { Volume: 0, Cost: 0, Selling: 0 },
                    // } // เพิ่ม Product ไว้เป็น Object ว่าง
                }
            };
        });

        setTicketTrip((prev) => {
            const newIndex = Object.keys(prev).length + 1; // เพิ่มเป็น 1-based index
            return {
                ...prev,
                [`Tickets${newIndex}`]: ticketValue.includes("/")
                    ? ticketValue.split("/")[1]
                    : ticketValue
            };
        });
    };

    const handlePostSelling = (event) => {
        const customerValue = event.target.value;
        setCustomers(customerValue);

        if (customerValue === "0:0") return;

        // ค้นหา ticket ที่ตรงกับ customerValue ใน getTickets() เพื่อที่จะนำค่า rate จาก row นั้นมาใช้
        const ticketData = getCustomers().find(
            (item) => `${item.id}:${item.Name}` === customerValue
        );



        // กำหนดค่า default rate หากไม่พบข้อมูลหรือ depots ยังไม่ได้เลือก
        // let newRate = 0;
        // if (ticketData && depots) {
        //     // ตรวจสอบค่า depot ที่เลือก (สมมุติว่า depots เป็น "1", "2", "3")
        //     if (depots.split(":")[1] === "ลำปาง") {
        //         // newRate = ticketData.Rate1;
        //         setCostTrip((prev) => (prev === 0 ? 750 : prev + 200));
        //     } else if (depots.split(":")[1] === "พิจิตร") {
        //         // newRate = ticketData.Rate2;
        //         setCostTrip((prev) => (prev === 0 ? 2000 : prev + 200));
        //     } else if (depots.split(":")[1] === "สระบุรี" || depots.split(":")[1] === "บางปะอิน" || depots.split(":")[1] === "IR") {
        //         // newRate = ticketData.Rate3;
        //         setCostTrip((prev) => (prev === 0 ? (2000 + 1200) : prev + 200));
        //     }
        // }

        setSelling((prev) => {
            const newIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newIndex]: {
                    TicketName: customerValue,
                    CompanyName: ticketData.CompanyName || "-",
                    Address: ticketData.Address || "-",
                    Lat: ticketData.lat || "-",
                    Lng: ticketData.lng || "-",
                    CodeID: ticketData.CodeID || "-",
                    CreditTime: ticketData.CreditTime || "-",
                    Bill: ticketData.Bill || "-",
                    Rate: ticketData.Rate || 0,
                    Trip: trip.length,
                    Date: dayjs(selectedDateDelivery).format('DD/MM/YYYY'),
                    Registration: registration,
                    CustomerType: ticketData.CustomerType || "ตั๋วรถเล็ก",
                    Driver: driverss,
                    Travel: ticketData.Travel || 0,
                    id: newIndex,
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
                [`Order${newIndex}`]: customerValue.includes("/")
                    ? customerValue.split("/")[1]
                    : customerValue
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

    // ฟังก์ชันอัพเดตราคาใน ordersTickets เมื่อมีการเปลี่ยน depot
    // const updateRatesByDepot = (selectedDepot) => {
    //     setCostTrip(0);
    //     setOrdersTickets((prevOrders) => {
    //         return Object.keys(prevOrders).reduce((acc, key) => {
    //             const order = prevOrders[key];
    //             const ticketData = getTickets().find(
    //                 (item) => item.TicketsName === order.TicketName
    //             );
    //             // let newRate = 0;
    //             // if (ticketData) {
    //             //     if (selectedDepot === "ลำปาง") {
    //             //         newRate = ticketData.Rate1;
    //             //     } else if (selectedDepot === "พิจิตร") {
    //             //         newRate = ticketData.Rate2;
    //             //     } else if (selectedDepot === "สระบุรี" || selectedDepot === "บางปะอิน" || selectedDepot === "IR") {
    //             //         newRate = ticketData.Rate3;
    //             //     }
    //             // }
    //             acc[key] = {
    //                 ...order,
    //                 Rate1: ticketData.Rate1,
    //                 Rate2: ticketData.Rate2,
    //                 Rate3: ticketData.Rate3,
    //             };
    //             return acc;
    //         }, {});
    //     });

    //     // คำนวณ costTrip ครั้งเดียว โดยดูจากจำนวน ordersTickets ที่มีอยู่และค่า depot
    //     // สมมุติว่า ordersTickets มี 3 รายการ
    //     // เราคำนวณตามเงื่อนไข depot แต่ละครั้ง
    //     setSelling((prevOrders) => {
    //         const updatedOrders = Object.keys(prevOrders).reduce((acc, key) => {
    //             const order = prevOrders[key];
    //             const ticketData = getCustomers().find(
    //                 (item) => item.TicketsName === order.TicketName
    //             );
    //             // let newRate = 0;
    //             // if (ticketData) {
    //             //     if (selectedDepot === "ลำปาง") {
    //             //         newRate = ticketData.Rate1;
    //             //     } else if (selectedDepot === "พิจิตร") {
    //             //         newRate = ticketData.Rate2;
    //             //     } else if (selectedDepot === "สระบุรี" || selectedDepot === "บางปะอิน" || selectedDepot === "IR") {
    //             //         newRate = ticketData.Rate3;
    //             //     }
    //             // }
    //             acc[key] = {
    //                 ...order,
    //                 Rate1: ticketData.Rate1,
    //                 Rate2: ticketData.Rate2,
    //                 Rate3: ticketData.Rate3,
    //             };
    //             return acc;
    //         }, {});

    //         // หลังจากอัพเดต orders แล้ว คำนวณ costTrip รวม
    //         let cost = 0;
    //         Object.keys(updatedOrders).forEach((key) => {
    //             if (selectedDepot === "ลำปาง") {
    //                 cost += cost === 0 ? 750 : 200;
    //             } else if (selectedDepot === "พิจิตร") {
    //                 cost += cost === 0 ? 2000 : 200;
    //             } else if (selectedDepot === "สระบุรี" || selectedDepot === "บางปะอิน" || selectedDepot === "IR") {
    //                 cost += cost === 0 ? 2000 + 1200 : 200;
    //             }
    //         });
    //         setCostTrip(cost);
    //         return updatedOrders;
    //     });
    // };


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

            // วนลูปหาค่า Volume รวมของแต่ละ productName
            Object.values(updatedOrders).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            setVolumeT({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
            });

            let G95 = (totalG95 * 0.740) * 1000;
            let G91 = (totalG91 * 0.740) * 1000;
            let B7 = (totalB7 * 0.837) * 1000;
            let B95 = (totalB95 * 0.740) * 1000;
            let E20 = (totalE20 * 0.740) * 1000;
            let PWD = (totalPWD * 0.740) * 1000;

            setWeightA({ G91: G91.toFixed(2), G95: G95.toFixed(2), B7: B7.toFixed(2), B95: B95.toFixed(2), E20: E20.toFixed(2), PWD: PWD.toFixed(2) });
            setWeightL(parseFloat(G91) + parseFloat(G95) + parseFloat(B95) + parseFloat(E20) + parseFloat(PWD));
            setWeightH(B7);

            // อัปเดตค่า State ของแต่ละ productName
            setVolumeG95(totalG95);
            setVolumeG91(totalG91);
            setVolumeB7(totalB7);
            setVolumeB95(totalB95);
            setVolumeE20(totalE20);
            setVolumePWD(totalPWD);

            return updatedOrders;
        });
    };

    const handleChangeDriverss = (newvalue) => {
        setDriverss(newvalue); // อัพเดตค่าเมื่อเลือก

        if (ordersTickets && Object.keys(ordersTickets).length > 0) {
            setOrdersTickets((prevOrders) => {
                const updated = {};
                for (const key in prevOrders) {
                    updated[key] = {
                        ...prevOrders[key],
                        Driver: newvalue,
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
                        Driver: newvalue,
                    };
                }
                console.log("Updated Orders with new Date (object):", updated);
                return updated;
            });
        }
    }

    const handleChangeRegistration = (newvalue) => {
        setRegistration(newvalue);

        if (ordersTickets && Object.keys(ordersTickets).length > 0) {
            setOrdersTickets((prevOrders) => {
                const updated = {};
                for (const key in prevOrders) {
                    updated[key] = {
                        ...prevOrders[key],
                        Registration: newvalue,
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
                        Registration: newvalue,
                    };
                }
                console.log("Updated Orders with new Date (object):", updated);
                return updated;
            });
        }
    }

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

            // วนลูปหาค่า Volume รวมของแต่ละ productName
            Object.values(updatedOrders).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            setVolumeS({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
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

            Object.values(newOrder).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            // อัปเดตค่า volumeT ใหม่
            setVolumeT({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
            });

            setVolumeG95(totalG95);
            setVolumeG91(totalG91);
            setVolumeB7(totalB7);
            setVolumeB95(totalB95);
            setVolumeE20(totalE20);
            setVolumePWD(totalPWD);

            return newOrder;
        });

        setTicketTrip((prev) => {
            // แปลง object เป็น array ของ entries
            const entries = Object.entries(prev);

            // กรองรายการที่ key ไม่ตรงกับ key ที่ต้องการลบ (เช่น order1)
            const filtered = entries.filter(([key]) => key !== `Tickets${parseInt(indexToDelete, 10) + 1}`);

            // เรียงลำดับใหม่โดย re-index key ให้ต่อเนื่อง เริ่มจาก order1
            const newTicketsTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Tickets${index + 1}`] = value;
                return acc;
            }, {});

            return newTicketsTrip;
        });
    };

    const handleDeleteCustomer = (indexToDelete) => {
        setSelling((prev) => {
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

            Object.values(newOrder).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            // อัปเดตค่า volumeT ใหม่
            setVolumeS({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
            });

            return newOrder;
        });

        setOrderTrip((prev) => {
            // แปลง object เป็น array ของ entries
            const entries = Object.entries(prev);

            // กรองรายการที่ key ไม่ตรงกับ key ที่ต้องการลบ (เช่น order1)
            const filtered = entries.filter(([key]) => key !== `Order${parseInt(indexToDelete, 10) + 1}`);

            // เรียงลำดับใหม่โดย re-index key ให้ต่อเนื่อง เริ่มจาก order1
            const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Order${index + 1}`] = value;
                return acc;
            }, {});

            return newOrderTrip;
        });

        //setCostTrip((prev) => (prev === 750 ? 0 : prev - 200));
        // ลด costTrip -200 เมื่อมีการยกเลิก (กดปุ่ม "ยกเลิก")
        // if (depots) {
        //     // ตรวจสอบค่า depot ที่เลือก
        //     const depotName = depots.split(":")[1]; // สมมุติรูปแบบ depots = "xx:ลำปาง" เป็นต้น
        //     if (depotName === "ลำปาง") {
        //         setCostTrip((prev) => (prev === 750 ? 0 : prev - 200));
        //     } else if (depotName === "พิจิตร") {
        //         setCostTrip((prev) => (prev === 2000 ? 0 : prev - 200));
        //     } else if (depotName === "สระบุรี" || depotName === "บางปะอิน" || depotName === "IR") {
        //         setCostTrip((prev) => (prev === 3200 ? 0 : prev - 200));
        //     }
        // }
    };

    const handleSaveAsImage = () => {
        const Trips = {
            Tickets: Object.values(ordersTickets),
            Orders: Object.values(selling),
            TotalVolumeTicket: volumeT,
            TotalVolumeOrder: volumeS,
            CostTrip: costTrip,
            DateReceive: dayjs(selectedDateReceive).format("DD/MM/YYYY"),
            DateDelivery: dayjs(selectedDateDelivery).format("DD/MM/YYYY"),
            Driver: driverss.split(":")[1] + " / " + driverss.split(":")[0],
            Depot: depots,
            WeightHigh: weightH,
            WeightLow: weightL,
            WeightTruck: weight,
            TotalWeight: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)),
        };

        // บันทึกข้อมูลลง sessionStorage
        sessionStorage.setItem("Trips", JSON.stringify(Trips));

        // เปิดหน้าต่างใหม่ไปที่ /print-invoice
        const printWindow = window.open("/print-trips", "_blank", "width=800,height=600");

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    const handleSubmit = () => {
        for (const key in selling) {
            const item = selling[key];

            // ❌ ไม่มี Product หรือไม่มี key นอกจาก 'P'
            const productKeys = Object.keys(item.Product || {});
            if (productKeys.length === 0 || (productKeys.length === 1 && productKeys[0] === 'P')) {
                ShowError(`รายการที่ ${+key + 1} กรุณาเพิ่มจำนวนสินค้าให้ครบ`);
                return;
            }

            if (!item.Rate || item.Rate === 0) {
                ShowError(`รายการที่ ${+key + 1} กรุณาระบุค่าบรรทุก ให้ครบ`);
                return;
            }

            if (!item.CreditTime || item.CreditTime === "-") {
                ShowError(`รายการที่ ${+key + 1} กรุณาระบุ CreditTime ให้ครบ`);
                return;
            }

            // if (!item.Travel || item.Travel === 0) {
            //     ShowError(`รายการที่ ${+key + 1} กรุณาระบุจำนวนเที่ยว ให้ครบ`);
            //     return;
            // }
        }

        const orderRef = database.ref("order/");
        const ticketsRef = database.ref("tickets/");

        // ดึงข้อมูลปัจจุบันใน order เพื่อหาค่า index ล่าสุด
        orderRef.once("value")
            .then((snapshot) => {
                const orders = snapshot.val() || {};
                const currentLength = Object.keys(orders).length;

                // สมมุติ selling คือ object ที่มีโครงสร้างเป็น
                // {
                //    0: { name: GG },
                //    1: { name: BB },
                //    2: { name: FF }
                // }
                // เราจะ append ข้อมูลใน selling ทีละตัว โดยคำนวณ index ใหม่เป็น currentLength + key ของ selling
                const updates = {};
                Object.keys(selling).forEach((key) => {
                    const newIndex = currentLength + parseInt(key, 10);

                    // เพิ่ม No เข้าไปในแต่ละออเดอร์
                    updates[newIndex] = {
                        ...selling[key], // คัดลอกค่าทั้งหมดใน selling[key]
                        No: newIndex,    // เพิ่มฟิลด์ No
                    };
                });

                // อัปเดตข้อมูลใน /order ด้วยการ merge updates
                return orderRef.update(updates);
            })
            .then(() => {
                ShowSuccess("เพิ่มออเดอร์เรียบร้อย");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error updating order:", error);
            });

        ticketsRef.once("value")
            .then((snapshot) => {
                const tickets = snapshot.val() || {};
                const currentLength = Object.keys(tickets).length;

                // สมมุติ selling คือ object ที่มีโครงสร้างเป็น
                // {
                //    0: { name: GG },
                //    1: { name: BB },
                //    2: { name: FF }
                // }
                // เราจะ append ข้อมูลใน selling ทีละตัว โดยคำนวณ index ใหม่เป็น currentLength + key ของ selling

                const updates = {};
                Object.keys(ordersTickets).forEach((key) => {
                    const newIndex = currentLength + parseInt(key, 10);

                    // เพิ่ม No เข้าไปในแต่ละออเดอร์
                    updates[newIndex] = {
                        ...ordersTickets[key], // คัดลอกค่าทั้งหมดใน selling[key]
                        No: newIndex,    // เพิ่มฟิลด์ No
                    };
                });

                // อัปเดตข้อมูลใน /order ด้วยการ merge updates
                return ticketsRef.update(updates);
            })
            .then(() => {
                ShowSuccess("เพิ่มออเดอร์เรียบร้อย");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error updating order:", error);
            });

        database
            .ref("trip/")
            .child(trip.length)
            .update({
                id: trip.length + 1,
                DateReceive: dayjs(selectedDateReceive).format('DD/MM/YYYY'),
                DateDelivery: dayjs(selectedDateDelivery).format('DD/MM/YYYY'),
                Registration: registration,
                DateStart: dayjs(new Date).format("DD/MM/YYYY"),
                Driver: driverss,
                Depot: depots,
                CostTrip: costTrip,
                WeightOil: (volumeS.G91 + volumeS.G95 + volumeS.B7 + volumeS.B95 + volumeS.E20 + volumeS.PWD),
                WeightTruck: parseFloat(weight).toFixed(2),
                TotalWeight: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)),
                Status: status,
                StatusTrip: "กำลังจัดเที่ยววิ่ง",
                TruckType: "รถเล็ก",
                ...orderTrip,
                ...ticketTrip
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                const getIdFromValue = (value) => {
                    if (!value) return null;

                    const id = Number(String(value).split(":")[0]);

                    if (!Number.isInteger(id) || id <= 0) return null; // ❌ กัน 0 และ NaN

                    return id - 1;
                };

                const regId = getIdFromValue(registration);
                const driverId = getIdFromValue(driverss);

                if (regId !== null) {
                    database
                        .ref("truck/small/")
                        .child(regId) // ❗ ไม่ต้อง -1 แล้ว
                        .update({
                            Driver: driverss,
                            Status: "TR:" + trip.length
                        })
                        .then(() => {
                            setOpen(false);
                            console.log("Truck updated");
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error(error);
                        });
                }

                if (driverId !== null) {
                    database
                        .ref("employee/drivers/")
                        .child(driverId) // ❗ ไม่ต้อง -1 แล้ว
                        .update({
                            Registration: registration
                        })
                        .then(() => {
                            setOpen(false);
                            console.log("Driver updated");
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error(error);
                        });
                }

                // database
                //     .ref("truck/small/")
                //     .child(Number(registration.split(":")[0]) - 1)
                //     .update({
                //         Driver: driverss,
                //         Status: "TR:" + trip.length
                //     })
                //     .then(() => {
                //         setOpen(false);
                //         console.log("Data pushed successfully");

                //     })
                //     .catch((error) => {
                //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                //         console.error("Error pushing data:", error);
                //     });

                // database
                //     .ref("employee/drivers/")
                //     .child(Number(driverss.split(":")[0]) - 1)
                //     .update({
                //         Registration: registration
                //     })
                //     .then(() => {
                //         setOpen(false);
                //         console.log("Data pushed successfully");

                //     })
                //     .catch((error) => {
                //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                //         console.error("Error pushing data:", error);
                //     });
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
        setOrdersTickets({});
        setSelling({});
        setVolumeT({});
        setVolumeS({});
        setWeightA({});
        setOrderTrip({});
        setTicketTrip({});
        setWeightH(0);
        setWeightL(0);
        setCostTrip(0);
        setDriverss("0:0");
        setRegistration("0:0");
        setSelectedDateReceive(dayjs(new Date()));
        setSelectedDateDelivery(dayjs(new Date()));
    };

    const handleCancle = () => {
        if (showTickers === false) {
            if (showTrips === false) {
                database
                    .ref("trip/")
                    .child(trip.length)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ยกเลิกสำเร็จ");
                        console.log("Data pushed successfully");
                        database
                            .ref("truck/small/")
                            .child(Number(registration.split(":")[0]) - 1)
                            .update({
                                Status: "ว่าง"
                            })
                            .then(() => {
                                console.log("Data pushed successfully");
                                setOpen(false);
                                setShowTickers(true);
                                setShowTrips(true)
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            } else {
                database
                    .ref("truck/small/")
                    .child(Number(registration.split(":")[0]) - 1)
                    .update({
                        Status: "ว่าง"
                    })
                    .then(() => {
                        ShowSuccess("ยกเลิกข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                        setOpen(false);
                        setShowTickers(true);
                    })
                    .catch((error) => {
                        ShowError("ยกเลิกข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            }
        } else {
            setOpen(false);
        }
        setOrdersTickets({});
        setSelling({});
        setVolumeT({});
        setVolumeS({});
        setWeightA({});
        setOrderTrip({});
        setTicketTrip({});
        setWeightH(0);
        setWeightL(0);
        setCostTrip(0);
        setDriverss("0:0");
        setRegistration("0:0");
        setSelectedDateReceive(dayjs(new Date()));
        setSelectedDateDelivery(dayjs(new Date()));
    }

    const handleTotalWeight = (newHeavyOil, newWeight) => {
        const total =
            parseFloat(newHeavyOil || 0) +
            parseFloat(newWeight || 0);
        setTotalWeight(total);
    };

    React.useEffect(() => {
        const currentRow = smallTruck.find(item =>
            `${item.id}:${item.RegHead}` === registration)
        console.log("Current : ", currentRow);

        if (currentRow) {
            setWeight(currentRow.Weight || 0);
        }
    }, [registration, smallTruck]);

    const getTickets = () => {
        if (!registration || registration === "0:0:0:0") return [];

        // const selectedTruck = allTruck.find(
        //     (item) => `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration
        // );

        // if (!selectedTruck) return [];

        const tickets = [
            { Name: "ตั๋วเปล่า", TicketName: "ตั๋วเปล่า", id: "1", Rate1: 0, Rate2: 0, Rate3: 0, CustomerType: "ตั๋วเปล่า" },
            ...ticketsA
                .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
                .map((item) => ({ ...item, CustomerType: "ตั๋วน้ำมัน" })),
            ...ticketsPS
                .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
                .map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),
            ...ticketsT
                .filter((item) => (item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ") && item.SystemStatus !== "ไม่อยู่ในระบบ")
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),
            ...ticketsB.filter((t) => t.RegistrationCheck === true && t.Registration !== "" && t.Registration !== undefined).map((item) => ({ ...item, CustomerType: "ตั๋วรถใหญ่" })),
        ];

        return tickets.filter((item) => item.id || item.TicketsCode);
    };

    const getCustomers = () => {
        if (!registration || registration === "0:0:0:0") return [];

        // const selectedTruck = allTruck.find(
        //     (item) => `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration
        // );

        // if (!selectedTruck) return [];

        const customers = [
            // ...ticketsPS.map((item) => ({ ...item })),
            // ...ticketsT
            //     .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
            //     .map((item) => ({ ...item })),
            ...ticketsS
                .filter((item) => item.Status === "ลูกค้าประจำ" && item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => {
                    const nameA = (a.Name || "").trim();
                    const nameB = (b.Name || "").trim();
                    return nameA.localeCompare(nameB, "th"); // รองรับภาษาไทย
                })
                .map((item) => ({ ...item, CustomerType: "ตั๋วรถเล็ก" })),

            // ...(selectedTruck.type === "รถใหญ่"
            //     ? ticketsB.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item })) // รถใหญ่ใช้ ticketsB
            //     : ticketsS.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item })) // รถเล็กใช้ ticketsS
            //),
        ];

        return customers;
    };

    console.log("getCustomers : ", getCustomers());

    const sortedSmallTruck = [...smallTruck].sort((a, b) =>
        (a.ShortName || "").localeCompare(b.ShortName || "")
    );

    let G95 = (Number(volumeT.G95) - Number(volumeS.G95));
    let B95 = (Number(volumeT.B95) - Number(volumeS.B95));
    let B7 = (Number(volumeT.B7) - Number(volumeS.B7));
    let G91 = (Number(volumeT.G91) - Number(volumeS.G91));
    let E20 = (Number(volumeT.E20) - Number(volumeS.E20));
    let PWD = (Number(volumeT.PWD) - Number(volumeS.PWD));

    const isNegative = Math.min(G95, B95, B7, G91, E20, PWD) < 0;

    const fuelTypes = ["G95", "B95", "B7", "G91", "E20", "PWD"];
    const totalVolume = fuelTypes.reduce((sum, type) => sum + (Number(volumeT[type]) - Number(volumeS[type])), 0) || 0;

    const getBackgroundColor = (value) =>
        value < 0 ? "red" : value > 0 ? "yellow" : "lightgray";

    console.log("G95", G95);
    console.log("B95", B95);
    console.log("B7", B7);
    console.log("G91", G91);
    console.log("E20", E20);
    console.log("PWD", PWD);

    console.log("Check : ", isNegative);

    return (
        <React.Fragment>
            <Button variant="contained" color="pink" onClick={handleClickOpen} sx={{ height: 50, borderRadius: 3 }} endIcon={<AddLocationAltIcon />} >จัดเที่ยววิ่ง</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleCancle}
                fullScreen={windowWidth <= 900 ? true : false}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "1300px", // กำหนดความสูงของ Dialog
                    },
                    zIndex: 1000,
                }}
                maxWidth="xl"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container marginTop={-1.5} marginBottom={-1.5}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >บันทึกข้อมูลการขนส่งน้ำมันของรถเล็ก</Typography>
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
                            <Grid item md={1} xs={2} textAlign="left">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, color: theme.palette.success.dark }} gutterBottom>ตั๋วน้ำมัน</Typography>
                            </Grid>
                            <Grid item md={3} xs={10} textAlign="right">
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>วันที่รับ</Typography>
                                    <Paper component="form" sx={{ width: "100%", marginTop: -1 }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={(dayjs(selectedDateReceive))} // แปลงสตริงกลับเป็น dayjs object
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
                                                                fontSize: "14px",
                                                            },
                                                            "& .MuiInputAdornment-root": {
                                                                marginLeft: "0px", // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
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
                            <Grid item md={8} xs={12}>
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                    <Paper
                                        component="form" sx={{ height: "30px", width: "100%", marginTop: -1 }}>
                                        <Autocomplete
                                            id="autocomplete-registration-1"
                                            options={sortedSmallTruck}
                                            getOptionLabel={(option) =>
                                                `${option.ShortName ? option.ShortName : ""} : ${option.RegHead ? option.RegHead : ""}`
                                            }
                                            isOptionEqualToValue={(option, value) => option.id === value.id && option.type === value.type}
                                            value={registration ? sortedSmallTruck.find(item => `${item.id}:${item.RegHead}` === registration) : null}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const value = `${newValue.id}:${newValue.RegHead}`;
                                                    handleChangeRegistration(value);
                                                } else {
                                                    setRegistration("0:0");
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={!registration || registration === "0:0" ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": { fontSize: "14px", padding: "1px 2px" },
                                                    }}
                                                />
                                            )}
                                            fullWidth
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    {
                                                        <Typography fontSize="14px">{`${option.ShortName ? option.ShortName : ""} : ${option.RegHead ? option.RegHead : ""}`}</Typography>
                                                    }
                                                </li>
                                            )}
                                        />
                                    </Paper>
                                </Box>
                            </Grid>
                        </Grid>
                        <Paper
                            sx={{ p: 1, backgroundColor: "lightgray", marginBottom: 1 }}
                        >
                            <Paper
                                className="custom-scrollbar"
                                sx={{
                                    position: "relative",
                                    maxWidth: "100%",
                                    height: "25vh", // ความสูงรวมของ container หลัก
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
                                                <TablecellTickets width={50} sx={{ textAlign: "center", height: "35px" }}>ลำดับ</TablecellTickets>
                                                <TablecellTickets width={350} sx={{ textAlign: "center", height: "35px" }}>ตั๋ว</TablecellTickets>
                                                <TableCellG95 width={70} sx={{ textAlign: "center", height: "35px" }}>G95</TableCellG95>
                                                <TableCellB95 width={70} sx={{ textAlign: "center", height: "35px" }}>B95</TableCellB95>
                                                <TableCellB7 width={70} sx={{ textAlign: "center", height: "35px" }}>B7(D)</TableCellB7>
                                                <TableCellG91 width={70} sx={{ textAlign: "center", height: "35px" }}>G91</TableCellG91>
                                                <TableCellE20 width={70} sx={{ textAlign: "center", height: "35px" }}>E20</TableCellE20>
                                                <TableCellPWD width={70} sx={{ textAlign: "center", height: "35px" }}>PWD</TableCellPWD>
                                                <TablecellTickets width={Object.keys(ordersTickets).length > 6 ? 90 : 80} sx={{ textAlign: "center", height: "35px", borderLeft: "3px solid white" }} />
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
                                                // onUpdateOrderID={(field, value) =>
                                                //     handleUpdateOrderID(parseInt(key), field, value)
                                                // }
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
                                                <TablecellTickets width={400} sx={{ textAlign: "center" }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ปริมาณรวม</Typography>
                                                </TablecellTickets>
                                                <TableCellG95 width={70} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth

                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center',
                                                                        },
                                                                    }}
                                                                    value={formatNumber(volumeT.G95 || 0)}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.G95 || 0}</Typography>
                                                    }
                                                </TableCellG95>
                                                <TableCellB95 width={70} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth

                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center',
                                                                        },
                                                                    }}
                                                                    value={formatNumber(volumeT.B95 || 0)}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.B95 || 0}</Typography>
                                                    }
                                                </TableCellB95>
                                                <TableCellB7 width={70} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth

                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center',
                                                                        },
                                                                    }}
                                                                    value={formatNumber(volumeT.B7 || 0)}
                                                                // value={volumeB7}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.B7 || 0}</Typography>
                                                    }
                                                </TableCellB7>
                                                <TableCellG91 width={70} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth

                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center',
                                                                        },
                                                                    }}
                                                                    value={formatNumber(volumeT.G91 || 0)}
                                                                // value={volumeG91}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.G91 || 0}</Typography>
                                                    }
                                                </TableCellG91>
                                                <TableCellE20 width={70} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth

                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center',
                                                                        },
                                                                    }}
                                                                    value={formatNumber(volumeT.E20 || 0)}
                                                                // value={volumeE20}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.E20 || 0}</Typography>
                                                    }
                                                </TableCellE20>
                                                <TableCellPWD width={70} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth

                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center',
                                                                        },
                                                                    }}
                                                                    value={formatNumber(volumeT.PWD || 0)}
                                                                // value={volumePWD}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.PWD || 0}</Typography>
                                                    }
                                                </TableCellPWD>
                                                <TablecellTickets width={Object.keys(ordersTickets).length > 6 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} >
                                                    <Box display="flex" justifyContent="center" alignItems="center">
                                                        {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1 }} gutterBottom>ต้นทุนรวม</Typography>
                                                        <Paper component="form">
                                                            <TextField size="small" fullWidth
                                                                
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

                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '12px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px', // ปรับความสูงของ TextField
                                                                                display: 'flex', // ใช้ flexbox
                                                                                alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                                paddingLeft: 0.5
                                                                            },
                                                                        }}
                                                                        value={formatNumber((volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD) || 0)}

                                                                    // value={volumeG95}
                                                                    />
                                                                </Paper>
                                                                :
                                                                <Typography variant="subtitle2" fontSize="12px" fontWeight="bold" color="black" gutterBottom>{(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD) || 0}</Typography>
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
                                            value={tickets ? getTickets().find(item => `${item.id}:${item.TickeNametsName}` === tickets) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
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
                                                        "& .MuiInputBase-input": { fontSize: "14px", padding: "2px 6px" },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="14px">{`${option.Name}`}</Typography>
                                                </li>
                                            )}
                                            disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item md={6} xs={12} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>หมายเหตุ</Typography>
                                    <Paper
                                        component="form" sx={{ width: "100%" }}>
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
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Grid>
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
                            <Grid item md={1} xs={2} textAlign="left">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, color: theme.palette.info.main }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                            </Grid>
                            <Grid item md={3} xs={10} textAlign="right">
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>วันที่ส่ง</Typography>
                                    <Paper component="form" sx={{ width: "100%", marginTop: -1 }}>
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
                                                                fontSize: "14px",
                                                            },
                                                            "& .MuiInputAdornment-root": {
                                                                marginLeft: "0px", // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
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
                            <Grid item md={8} xs={12}>
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                    <Paper
                                        component="form" sx={{ height: "30px", width: "100%", marginTop: -1 }}>
                                        <TextField size="small" fullWidth disabled
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    padding: "1px 4px",
                                                },
                                                borderRadius: 10
                                            }}
                                            value={(() => {
                                                const selectedItem = smallTruck.find(item =>
                                                    `${item.id}:${item.RegHead}` === registration
                                                );
                                                return selectedItem && `${selectedItem.ShortName ? selectedItem.ShortName : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""}`;
                                            })()}
                                        />
                                    </Paper>
                                </Box>
                            </Grid>
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
                                                <TablecellCustomers width={50} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    ลำดับ
                                                </TablecellCustomers>
                                                <TablecellCustomers width={240} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    รายการส่ง
                                                </TablecellCustomers>
                                                <TablecellCustomers width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    ค่าบรรทุก
                                                </TablecellCustomers>
                                                <TablecellCustomers width={50} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    Credit
                                                </TablecellCustomers>
                                                <TableCellG95 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    G95
                                                </TableCellG95>
                                                <TableCellB95 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    B95
                                                </TableCellB95>
                                                <TableCellB7 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    B7(D)
                                                </TableCellB7>
                                                <TableCellG91 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    G91
                                                </TableCellG91>
                                                <TableCellE20 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    E20
                                                </TableCellE20>
                                                <TableCellPWD width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                    PWD
                                                </TableCellPWD>
                                                <TablecellCustomers width={70} sx={{ textAlign: "center", height: "35px" }}>ค่าเที่ยว</TablecellCustomers>
                                                <TablecellCustomers width={Object.keys(selling).length > 6 ? 80 : 70} sx={{ textAlign: "center" }} />
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
                                        bottom: "25px", // จนถึงด้านบนของ footer
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
                                                        orders={orders.length}
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
                                    sx={
                                        totalVolume !== 0 ?
                                            {
                                                position: "absolute",
                                                height: "25px",
                                                bottom: "25px", // จนถึงด้านบนของ footer
                                                backgroundColor: theme.palette.info.main,
                                                zIndex: 2,
                                                marginBottom: 0.5
                                            }
                                            :
                                            {
                                                position: "absolute",
                                                height: "25px",
                                                bottom: 0,
                                                backgroundColor: theme.palette.info.main,
                                                zIndex: 2,
                                                borderTop: "2px solid white",
                                                marginBottom: 0.5
                                            }

                                    }
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableFooter>
                                            <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.panda.main, }}>
                                                <TablecellCustomers width={400} sx={{ textAlign: "center" }}>
                                                    รวม
                                                </TablecellCustomers>
                                                <TablecellCustomers width={70} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {formatNumber(volumeS.G95 || 0)}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={70} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {formatNumber(volumeS.B95 || 0)}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={70} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {formatNumber(volumeS.B7 || 0)}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={70} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {formatNumber(volumeS.G91 || 0)}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={70} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {formatNumber(volumeS.E20 || 0)}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={70} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {formatNumber(volumeS.PWD || 0)}
                                                </TablecellCustomers>
                                                <TablecellCustomers width={Object.keys(selling).length > 6 ? 150 : 140} colSpan={2} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth

                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center',
                                                                        },
                                                                    }}
                                                                    value={formatNumber((volumeS.G91 + volumeS.G95 + volumeS.B7 + volumeS.B95 + volumeS.E20 + volumeS.PWD) || 0)}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{formatNumber((volumeS.G91 + volumeS.G95 + volumeS.B7 + volumeS.B95 + volumeS.E20 + volumeS.PWD) || 0)}</Typography>
                                                    }
                                                </TablecellCustomers>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>

                                {/* Footer: คงที่ด้านล่าง */}
                                {
                                    totalVolume !== 0 &&
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            height: "25px",
                                            bottom: 0,
                                            backgroundColor: theme.palette.info.main,
                                            zIndex: 2,
                                            borderTop: "2px solid white",
                                            marginBottom: 0.5
                                        }}
                                    >
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                            <TableFooter>
                                                <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.panda.main }}>
                                                    <TablecellCustomers width={400} sx={{ textAlign: "center", height: "35px" }}>
                                                        คงเหลือ
                                                    </TablecellCustomers>
                                                    {
                                                        fuelTypes.map((type) => {
                                                            const value = Number(volumeT[type]) - Number(volumeS[type]);
                                                            return (
                                                                <TablecellCustomers
                                                                    key={type}
                                                                    width={70}
                                                                    sx={{
                                                                        textAlign: "center",
                                                                        color: "black",
                                                                        height: "35px",
                                                                        fontWeight: "bold",
                                                                        backgroundColor: getBackgroundColor(value),
                                                                        borderLeft: "2px solid white",
                                                                    }}
                                                                >
                                                                    {formatNumber(value || 0)}
                                                                </TablecellCustomers>
                                                            );
                                                        })
                                                    }
                                                    <TablecellCustomers width={Object.keys(selling).length > 6 ? 150 : 140} colSpan={2} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                        {
                                                            editMode ?
                                                                <Paper component="form" sx={{ width: "100%", marginTop: -0.5 }}>
                                                                    <TextField size="small" fullWidth

                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '12px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px', // ปรับความสูงของ TextField
                                                                                display: 'flex', // ใช้ flexbox
                                                                                alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: 'center',
                                                                            },
                                                                        }}
                                                                        value={formatNumber(totalVolume)}
                                                                    // value={volumeG95}
                                                                    />
                                                                </Paper>
                                                                :
                                                                <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>
                                                                    {formatNumber(totalVolume)}
                                                                </Typography>
                                                        }
                                                    </TablecellCustomers>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </Box>
                                }
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
                                                    value={customers ? getCustomers().find(item => `${item.id}:${item.TickeNametsName}` === customers) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
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
                                                                "& .MuiInputBase-input": { fontSize: "14px", padding: "4px 8px" },
                                                            }}
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                        <li {...props}>
                                                            <Typography fontSize="14px">{`${option.Name}`}</Typography>
                                                        </li>
                                                    )}
                                                    disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                                <Grid item md={2} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(costTrip)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    padding: "2px 6px",
                                                },
                                                borderRadius: 10
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                            ค่าเที่ยว :
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item md={4} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <Autocomplete
                                            id="autocomplete-tickets"
                                            options={driverDetail} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                            getOptionLabel={(option) =>
                                                `${option.Name}`
                                            } // กำหนดรูปแบบของ Label ที่แสดง
                                            isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบค่าที่เลือก
                                            value={driverss ? driverDetail.find(item => item.Name === driverss) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const value = `${newValue.id}:${newValue.Name}`;
                                                    handleChangeDriverss(value);
                                                } else {
                                                    setDriverss("0:0"); // รีเซ็ตค่าเป็น default หากไม่มีการเลือก
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={driverss === "0:0" ? "เลือกพนักงานขับรถ" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": { fontSize: "14px", padding: "4px 8px" },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="14px">{`${option.Name}`}</Typography>
                                                </li>
                                            )}
                                        //disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                    {/* {
                        !isNegative && ( // เพิ่มเงื่อนไขเช็คว่าห้ามมีค่าติดลบ
                            <> */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <Button onClick={handleCancle} variant="contained" color="error" sx={{ marginRight: 1 }} size="small">ยกเลิก</Button>
                        <Button onClick={handleSubmit} variant="contained" color="success" size="small">บันทึก</Button>
                    </Box>
                    <Box textAlign="center" marginTop={1}>
                        <Button variant="contained" size="small" onClick={handleSaveAsImage}>บันทึกรูปภาพ</Button>
                    </Box>
                    {/* </>
                        )
                    } */}
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertTrips;
