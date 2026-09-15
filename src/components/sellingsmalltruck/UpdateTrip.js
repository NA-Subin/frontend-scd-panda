import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import WhereToVoteIcon from '@mui/icons-material/WhereToVote';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import SatelliteIcon from '@mui/icons-material/Satellite';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TableCellPWD, TablecellSelling, TablecellTickets, TablecellCustomers } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PlagiarismIcon from '@mui/icons-material/Plagiarism';
import TaskIcon from '@mui/icons-material/Task';
import { apiPost, apiPut } from "../../server/apiClient";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import OrderDetail from "./OrderDetail";
import SellingDetail from "./SellingDetail";
import "../../theme/scrollbar.css"
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

// const depotOptions = ["ลำปาง", "พิจิตร", "สระบุรี", "บางปะอิน", "IR"];

const UpdateTrip = (props) => {
    const {
        trip,
        tripID,
        weightHigh,
        weightLow,
        totalWeight,
        weightTruck,
        dateStart,
        dateReceive,
        dateDelivery,
        depotTrip,
        registrations,
        driversdetail
    } = props;

    const [open, setOpen] = React.useState(false);
    const dialogRef = useRef(null);
    const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
    const [update, setUpdate] = useState(true);
    const [tickets, setTickets] = React.useState([]);
    const [selectedDateReceive, setSelectedDateReceive] = useState(dateReceive);
    const [selectedDateDelivery, setSelectedDateDelivery] = useState(dateDelivery);
    const [windowWidths, setWindowWidth] = useState(window.innerWidth);

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

    const [isFocused1, setIsFocused1] = useState(false);
    const [isFocused2, setIsFocused2] = useState(false);

    const formatNumber = (value) => {
        const number = parseInt(value, 10);
        if (isNaN(number)) return "";
        return number.toLocaleString(); // => 3000 -> "3,000"
    };

    const [driverss, setDriverss] = React.useState(driversdetail);
    const {
        depots, small, drivers,
        customertransports, customergasstations, customertickets, customerbigtruck, customersmalltruck,
        refetch: refetchBasicData,
    } = useBasicData();

    const driver = Object.values(drivers || {});
    const driverDetail = driver.filter((row) => row.Registration === "0:ไม่มี" || row.Registration === registrations);

    const depotOptions = Object.values(depots || {});
    const smalls = Object.values(small || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const registrationTruck = smalls.filter((row) => (row.Driver === "0:ไม่มี" && row.Status === "ว่าง") || row.Driver === driverss);

    const { order: orderData, tickets: ticketsTableData, refetch: refetchTripData } = useTripData();
    const orderLength = orderData ? Object.keys(orderData).length : 0;
    const ticketLength = ticketsTableData ? Object.keys(ticketsTableData).length : 0;
    const order = Object.values(orderData || {}).filter((item) => Number(item.Trip) === Number(tripID) - 1);
    const ticket = Object.values(ticketsTableData || {}).filter((item) => Number(item.Trip) === Number(tripID) - 1);

    const ticketsT = Object.values(customertransports || {}).filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ");
    const ticketsPS = Object.values(customergasstations || {});
    const ticketsA = Object.values(customertickets || {});
    const ticketsB = Object.values(customerbigtruck || {});
    const ticketsS = Object.values(customersmalltruck || {});

    // โหลด html2canvas จาก CDN
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => setHtml2canvasLoaded(true);
        document.body.appendChild(script);
    }, []);

    const handleSaveAsImage = () => {
        // trip.Driver/trip.Registration เป็น UUID จริงหลัง migrate (schema-manifest: order.Driver/Registration = UUID)
        // จึงต้อง match ด้วย uuid ไม่ใช่แยก id ด้วย split(":") แบบ composite เดิมอีกต่อไป
        const driverName = trip.DriverName || trip.Driver || "";

        const matchedTruck = registrationTruck.find(
            (row) => row.uuid === trip.Registration
        );

        const plate = matchedTruck?.RegHead || trip.RegistrationName || trip.Registration || "";

        const shortName = matchedTruck?.ShortName || "";


        const Trips = {
            Tickets: editableTickets,
            Orders: editableOrders,
            TotalVolumeTicket: totalVolumesTicket,
            TotalVolumeOrder: totalVolumesOrder,
            CostTrip: costTrip,
            DateReceive: trip.DateReceive,
            DateDelivery: trip.DateDelivery,
            Driver: `${shortName} : ${plate} / ${driverName}`,
            Depot: depotTrip,
            WeightHigh: totalVolumesTicket.oilHeavy,
            WeightLow: totalVolumesTicket.oilLight,
            WeightTruck: weightTrucks,
            TotalWeight: totalVolumesTicket.totalWeight,
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
            "/print-tripssmall",
            "_blank",
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        );

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleCancle = () => {
        setOpen(false);
    }

    const [editMode, setEditMode] = useState(false);
    const [editableTickets, setEditableTickets] = useState([]);
    const [editableOrders, setEditableOrders] = useState([]);
    const [orderTrip, setOrderTrip] = useState([]);
    const [ticketTrip, setTicketTrip] = useState([]);
    const [costTrip, setCostTrip] = useState(trip.CostTrip);
    const [status, setStatus] = useState(trip.Status || "-");
    const [weightTrucks, setWeightTrucks] = useState(weightTruck || 0);

    const [depot, setDepot] = useState(depotTrip);
    const [registration, setRegistration] = useState(registrations);

    useEffect(() => {
        if (ticket && ticket.length > 0) {
            setEditableTickets(ticket.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้

            setTicketTrip((prev) => {
                const newTickets = {};
                ticket.forEach((item, index) => {
                    const newIndex = index + 1; // ใช้ 1-based index
                    newTickets[`Ticket${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newTickets };
            });
        }

        if (order && order.length > 0) {
            setEditableOrders(order.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้

            setOrderTrip((prev) => {
                const newOrders = {};
                order.forEach((item, index) => {
                    const newIndex = index + 1; // ใช้ 1-based index
                    newOrders[`Order${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newOrders };
            });
        }
    }, [ticket, order]); // ใช้ useEffect ดักจับการเปลี่ยนแปลงของ ticket

    const handleCancleUpdate = () => {
        setSelectedDateDelivery(trip.DateDelivery);
        setSelectedDateReceive(trip.DateReceive);
        setRegistration(trip.Registration);
        setDriverss(trip.Driver);
        setEditableTickets([]);
        setTicketTrip([]);
        setEditableOrders([]);
        setOrderTrip([]);

        if (ticket && ticket.length > 0) {
            setEditableTickets(ticket.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้

            setTicketTrip((prev) => {
                const newTickets = {};
                ticket.forEach((item, index) => {
                    const newIndex = index + 1; // ใช้ 1-based index
                    newTickets[`Ticket${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newTickets };
            });
        }

        if (order && order.length > 0) {
            setEditableOrders(order.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้

            setOrderTrip((prev) => {
                const newOrders = {};
                order.forEach((item, index) => {
                    const newIndex = index + 1; // ใช้ 1-based index
                    newOrders[`Order${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newOrders };
            });
        }
        setEditMode(false)
    }

    const handleEditChange = (index, field, value) => {
        setEditableTickets((prev) => {
            const updatedTickets = [...prev];

            // ถ้ายังไม่มี index นี้ ให้เพิ่มเข้าไปก่อน
            if (!updatedTickets[index]) {
                updatedTickets[index] = { id: index + 1, No: 0, Product: {} };
            }

            const fields = field.split(".");
            let obj = updatedTickets[index];

            for (let i = 0; i < fields.length - 1; i++) {
                const key = fields[i];
                if (!obj[key]) obj[key] = {}; // ถ้าไม่มี ให้สร้าง object ใหม่
                obj = obj[key];
            }

            // แปลงค่า value ให้เป็นตัวเลข (ถ้าเป็นค่าว่างหรือไม่ใช่ตัวเลขให้ใช้ 0 แทน)
            const numericValue = parseFloat(value) || 0;
            obj[fields[fields.length - 1]] = numericValue;

            // ถ้าเป็นการเพิ่ม Product ใหม่ และ Value > 0 ให้เพิ่มโครงสร้าง Product
            if (fields[0] === "Product" && numericValue > 0) {
                const productType = fields[1];
                if (!updatedTickets[index].Product) {
                    updatedTickets[index].Product = {};
                }
                updatedTickets[index].Product[productType] = { Volume: numericValue.toString() };
            }

            // **ลบ Product ที่มี Volume เป็น 0 ออก**
            if (fields[0] === "Product" && numericValue === 0) {
                const productType = fields[1];

                // ลบ key ของ Product
                delete updatedTickets[index].Product[productType];

                // ถ้า Product ไม่มี key เหลืออยู่ ให้ลบทั้ง object
                if (Object.keys(updatedTickets[index].Product).length === 0) {
                    delete updatedTickets[index].Product;
                }
            }

            setTicketTrip((prev) => {
                const newTickets = {};
                const allTickets = [...updatedTickets]; // ใช้ข้อมูลใหม่ทั้งหมด

                allTickets.forEach((item, i) => {
                    const newIndex = i + 1; // ใช้ 1-based index
                    newTickets[`Ticket${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newTickets };
            });

            return updatedTickets;
        });
    };

    const handleOrderChange = (index, field, value) => {
        setEditableOrders((prev) => {
            const updatedOrders = [...prev];

            // ถ้ายังไม่มี index นี้ ให้เพิ่มเข้าไปก่อน
            if (!updatedOrders[index]) {
                updatedOrders[index] = { id: index + 1, No: 0, Product: {} };
            }

            const fields = field.split(".");
            let obj = updatedOrders[index];

            for (let i = 0; i < fields.length - 1; i++) {
                const key = fields[i];
                if (!obj[key]) obj[key] = {}; // ถ้าไม่มี ให้สร้าง object ใหม่
                obj = obj[key];
            }

            // แปลงค่า value ให้เป็นตัวเลข (ถ้าเป็นค่าว่างหรือไม่ใช่ตัวเลขให้ใช้ 0 แทน)
            const numericValue = parseFloat(value) || 0;
            obj[fields[fields.length - 1]] = numericValue;

            // ถ้าเป็นการเพิ่ม Product ใหม่ และ Value > 0 ให้เพิ่มโครงสร้าง Product
            if (fields[0] === "Product" && numericValue > 0) {
                const productType = fields[1];
                if (!updatedOrders[index].Product) {
                    updatedOrders[index].Product = {};
                }
                updatedOrders[index].Product[productType] = { Volume: numericValue.toString() };
            }

            // **ลบ Product ที่มี Volume เป็น 0 ออก**
            if (fields[0] === "Product" && numericValue === 0) {
                const productType = fields[1];

                // ลบ key ของ Product
                delete updatedOrders[index].Product[productType];

                // ถ้า Product ไม่มี key เหลืออยู่ ให้ลบทั้ง object
                if (Object.keys(updatedOrders[index].Product).length === 0) {
                    delete updatedOrders[index].Product;
                }
            }


            // **อัปเดต setOrderTrip ในรูปแบบที่ต้องการ**
            setOrderTrip((prev) => {
                const newOrders = {};
                const allOrders = [...updatedOrders]; // ใช้ข้อมูลใหม่ทั้งหมด

                allOrders.forEach((item, i) => {
                    const newIndex = i + 1; // ใช้ 1-based index
                    newOrders[`Order${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newOrders };
            });

            return updatedOrders;
        });
    };

    const handleUpdate = () => {
        setEditMode(true); // สลับโหมดแก้ไข <-> อ่านอย่างเดียว
    };

    const [totalVolumesTicket, setTotalVolumesTicket] = useState({});
    const [totalVolumesOrder, setTotalVolumesOrder] = useState({});

    useEffect(() => {
        // คำนวณยอดรวมของแต่ละ product ใน editableTickets
        const totalsTicket = ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((acc, product) => {
            acc[product] = editableTickets.reduce((sum, row) => sum + (Number(row.Product[product]?.Volume) || 0), 0);
            return acc;
        }, {});

        // คำนวณยอดรวมของแต่ละ product ใน editableOrders
        const totalsOrder = ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((acc, product) => {
            acc[product] = editableOrders.reduce((sum, row) => sum + (Number(row.Product[product]?.Volume) || 0), 0);
            return acc;
        }, {});

        // ✅ คำนวณ CostTrip
        const orderCount = editableOrders.length;
        let newCostTrip = 0;

        if (orderCount > 0) {
            if (depot.split(":")[1] === "ลำปาง") {
                newCostTrip = 750 + (orderCount - 1) * 200;
            } else if (depot.split(":")[1] === "พิจิตร") {
                newCostTrip = 2000 + (orderCount - 1) * 200;
            } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1])) {
                newCostTrip = 3200 + (orderCount - 1) * 200;
            }
        }

        const totalOilT =
            totalsTicket["G91"] +
            totalsTicket["G95"] +
            totalsTicket["B95"] +
            totalsTicket["E20"] +
            totalsTicket["PWD"] +
            totalsTicket["B7"];

        const totalWeightT = parseFloat(weightTrucks) +
            totalsTicket["G91"] +
            totalsTicket["G95"] +
            totalsTicket["B95"] +
            totalsTicket["E20"] +
            totalsTicket["PWD"] +
            totalsTicket["B7"];

        const totalOil =
            totalsOrder["G91"] +
            totalsOrder["G95"] +
            totalsOrder["B95"] +
            totalsOrder["E20"] +
            totalsOrder["PWD"] +
            totalsOrder["B7"];

        const totalWeight = parseFloat(weightTrucks) +
            totalsOrder["G91"] +
            totalsOrder["G95"] +
            totalsOrder["B95"] +
            totalsOrder["E20"] +
            totalsOrder["PWD"] +
            totalsOrder["B7"];

        // ตั้งค่าผลลัพธ์
        setTotalVolumesTicket({
            ...totalsTicket,
            totalOil: totalOilT,
            totalWeight: totalWeightT
        });

        setTotalVolumesOrder({
            ...totalsOrder,
            totalOil: totalOil,
            totalWeight: totalWeight
        });

        // คำนวณผลรวมค่า Travel ทุกครั้งที่ selling เปลี่ยน
        const totalTravel = Object.values(editableOrders).reduce((sum, item) => sum + (item.Travel || 0), 0);
        setCostTrip(totalTravel);

    }, [editableTickets, editableOrders, depot, weightTrucks]);
    // คำนวณใหม่ทุกครั้งที่ editableOrders เปลี่ยน

    // ค่าเดิมที่โหลดมาจาก Postgres จะเป็น uuid อยู่แล้ว ส่วนค่าที่เพิ่งเลือกใหม่ผ่าน
    // Autocomplete ในไฟล์นี้จะเป็น "id:ชื่อ/ทะเบียน" (id ธรรมดาจาก truck_small/employee_drivers)
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const resolveTruckSmall = (value) => {
        if (!value || value === "0:ไม่มี" || value === "0:0") return null;
        return UUID_RE.test(value)
            ? smalls.find((t) => t.uuid === value)
            : smalls.find((t) => `${t.id}:${t.RegHead}` === value);
    };

    const resolveDriverRow = (value) => {
        if (!value || value === "0:ไม่มี" || value === "0:0") return null;
        return UUID_RE.test(value)
            ? driver.find((d) => d.uuid === value)
            : driver.find((d) => `${d.id}:${d.Name}` === value);
    };

    const handleSave = async () => {
        const newTruck = resolveTruckSmall(registration);
        if (!newTruck) {
            ShowError("กรุณาเลือกทะเบียนรถก่อนบันทึก");
            return;
        }
        const oldTruck = resolveTruckSmall(registrations);
        const newDriver = resolveDriverRow(driverss);
        const oldDriver = resolveDriverRow(driversdetail);

        const registrationUuid = newTruck.uuid;
        const registrationName = newTruck.RegHead;
        const driverUuid = newDriver?.uuid || null;
        const driverNameVal = newDriver?.Name || null;
        const tripFinished = trip.StatusTrip === "จบทริป";
        const currentTruckFields = {
            Registration: registrationUuid,
            RegistrationName: registrationName,
            Driver: driverUuid,
            DriverName: driverNameVal,
        };

        try {
            let ticketNoCounter = ticketLength;
            for (const item of editableTickets) {
                const { uuid, row_key, ...fields } = item;
                const isRawSelection = fields.TicketName && !UUID_RE.test(fields.TicketName);
                // Autocomplete ตอนเลือกลูกค้าใหม่เขียนเป็น "id:Name" (ดู setEditableTickets ด้านล่าง)
                // ต้อง match ด้วยรูปแบบเดียวกัน ไม่ใช่ t.Name เฉย ๆ ซึ่งจะไม่ตรงกับ "id:Name" เลย
                const resolvedTicket = isRawSelection ? getTickets().find((t) => `${t.id}:${t.Name}` === fields.TicketName) : null;
                if (isRawSelection) {
                    fields.TicketName = resolvedTicket?.uuid || null;
                    fields.TicketNameName = resolvedTicket?.Name || item.TicketName;
                }

                if (uuid) {
                    await apiPut(`/api/tickets/${uuid}`, { ...fields, ...currentTruckFields });
                } else {
                    ticketNoCounter += 1;
                    await apiPost("/api/tickets", {
                        ...fields,
                        ...currentTruckFields,
                        Trip: String(Number(tripID) - 1),
                        No: ticketNoCounter,
                    });
                }
            }

            let orderNoCounter = orderLength;
            for (const item of editableOrders) {
                const { uuid, row_key, ...fields } = item;
                const isRawSelection = fields.TicketName && !UUID_RE.test(fields.TicketName);
                // Autocomplete ตอนเลือกลูกค้าใหม่เขียนเป็น "id:Name" (ดู setEditableOrders ด้านล่าง)
                // ต้อง match ด้วยรูปแบบเดียวกัน ไม่ใช่ t.Name เฉย ๆ ซึ่งจะไม่ตรงกับ "id:Name" เลย
                const resolvedCustomer = isRawSelection ? getCustomers().find((t) => `${t.id}:${t.Name}` === fields.TicketName) : null;
                if (isRawSelection) {
                    fields.TicketName = resolvedCustomer?.uuid || null;
                    fields.TicketNameName = resolvedCustomer?.Name || item.TicketName;
                }

                if (uuid) {
                    await apiPut(`/api/order/${uuid}`, { ...fields, ...currentTruckFields });
                } else {
                    orderNoCounter += 1;
                    await apiPost("/api/order", {
                        ...fields,
                        ...currentTruckFields,
                        Trip: String(Number(tripID) - 1),
                        No: orderNoCounter,
                    });
                }
            }

            await apiPut(`/api/trip/${trip.uuid}`, {
                DateReceive: selectedDateReceive,
                DateDelivery: selectedDateDelivery,
                DateEnd: trip.DateEnd || dayjs(new Date).format("DD/MM/YYYY"),
                Depot: depot,
                CostTrip: costTrip,
                WeightOil: totalVolumesOrder.totalOil,
                WeightTruck: weightTrucks,
                TotalWeight: totalVolumesOrder.totalWeight,
                Status: status,
                StatusTrip: trip.StatusTrip !== "จบทริป" ? "กำลังจัดเที่ยววิ่ง" : "จบทริป",
                TruckType: "รถเล็ก",
                ...currentTruckFields,
                ...orderTrip,
                ...ticketTrip
            });

            // ปลดปล่อยรถ/คนขับเดิมถ้ามีการเปลี่ยนระหว่างแก้ไข
            if (oldTruck && oldTruck.uuid !== newTruck.uuid) {
                await apiPut(`/api/truck_small/${oldTruck.uuid}`, { Driver: "0:ไม่มี", Status: "ว่าง" });
            }
            if (oldDriver && oldDriver.uuid !== newDriver?.uuid) {
                await apiPut(`/api/employee_drivers/${oldDriver.uuid}`, { Registration: null, RegistrationName: "ไม่มี" });
            }

            // ตั้งสถานะรถ/คนขับปัจจุบัน
            await apiPut(`/api/truck_small/${newTruck.uuid}`, {
                Driver: tripFinished ? "0:ไม่มี" : driverss,
                Status: tripFinished ? "ว่าง" : `TR:${tripID}`,
            });
            if (newDriver) {
                await apiPut(`/api/employee_drivers/${newDriver.uuid}`, {
                    Registration: tripFinished ? null : registrationUuid,
                    RegistrationName: tripFinished ? "ไม่มี" : registrationName,
                });
            }

            ShowSuccess("บันทึกข้อมูลสำเร็จ");
            refetchTripData?.();
            refetchBasicData?.();
            setOpen(false);
            setEditMode(false);
        } catch (error) {
            ShowError("บันทึกข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    const getTickets = () => {
        const tickets = [
            { Name: "ตั๋วเปล่า", TicketName: "ตั๋วเปล่า", id: 1, Rate1: 0, Rate2: 0, Rate3: 0, CustomerType: "ตั๋วเปล่า" },  // เพิ่มตั๋วเปล่าเข้าไป
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

        const customers = [
            ...ticketsS
                .filter((item) => item.Status === "ลูกค้าประจำ" && item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => {
                    const nameA = (a.Name || "").trim();
                    const nameB = (b.Name || "").trim();
                    return nameA.localeCompare(nameB, "th"); // รองรับภาษาไทย
                })
                .map((item) => ({ ...item, CustomerType: "ตั๋วรถเล็ก" }))
        ];

        return customers.filter((item) => item.id || item.TicketsCode);
    };

    const handleDeleteTickets = (indexToDelete, id) => {
        const ticketIndex = Number(id) - 1;
        const tickets = ticket[ticketIndex];
        if (!tickets || !tickets.uuid) {
            setEditableTickets((prev) => {
                const newTicket = [];
                let newIndex = 0;

                Object.keys(prev).forEach((key) => {
                    if (parseInt(key) !== ticketIndex) {
                        newTicket[newIndex] = { ...prev[key], id: newIndex };
                        newIndex++;
                    }
                });

                return newTicket;
            });

            // ลบจาก orderTrip
            setTicketTrip((prev) => {
                const entries = Object.entries(prev);
                const filtered = entries.filter(([key]) => key !== `Ticket${Number(id) + 1}`);

                const newTicketTrip = filtered.reduce((acc, [_, value], index) => {
                    acc[`Ticket${index + 1}`] = value;
                    return acc;
                }, {});

                return newTicketTrip;
            });

            return;
        }

        ShowConfirm(
            `ต้องการยกเลิกออเดอร์ลำดับที่ ${id} ใช่หรือไม่`,
            async () => {
                try {
                    await apiPut(`/api/tickets/${tickets.uuid}`, {
                        Trip: "ยกเลิก",
                        Status: "ยกเลิก",
                    });
                    refetchTripData?.();
                    updateStateAfterTicketDelete(indexToDelete, id);
                } catch (error) {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                }
            },
            () => { }
        );
    };

    const updateStateAfterTicketDelete = (indexToDelete, id) => {
        setEditableTickets((prev) => {
            const prevArray = Object.values(prev);
            const updatedArray = prevArray
                .filter((ticket) => ticket.No !== indexToDelete)
                .map((ticket, index) => ({ ...ticket, id: index }));

            return updatedArray;
        });

        setTicketTrip((prev) => {
            const entries = Object.entries(prev);
            const filtered = entries.filter(([key]) => key !== `Ticket${parseInt(id, 10) + 1}`);

            const newTicketTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Ticket${index + 1}`] = value;
                return acc;
            }, {});

            return newTicketTrip;
        });
    };

    const handleDeleteOrder = (indexToDelete, id) => {
        const orderIndex = Number(id) - 1;
        const orders = order[orderIndex];

        if (!orders || !orders.uuid) {
            // ลบจาก editableOrders
            setEditableOrders((prev) => {
                const newOrder = [];
                let newIndex = 0;

                Object.keys(prev).forEach((key) => {
                    if (parseInt(key) !== orderIndex) {
                        newOrder[newIndex] = { ...prev[key], id: newIndex };
                        newIndex++;
                    }
                });

                return newOrder;
            });

            // ลบจาก orderTrip
            setOrderTrip((prev) => {
                const entries = Object.entries(prev);
                const filtered = entries.filter(([key]) => key !== `Order${Number(id) + 1}`);

                const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
                    acc[`Order${index + 1}`] = value;
                    return acc;
                }, {});

                return newOrderTrip;
            });

            return;
        }

        ShowConfirm(
            `ต้องการยกเลิกออเดอร์ลำดับที่ ${id} ใช่หรือไม่`,
            async () => {
                try {
                    await apiPut(`/api/order/${orders.uuid}`, {
                        Trip: "ยกเลิก",
                        Status: "ยกเลิก",
                    });
                    refetchTripData?.();
                    updateStateAfterOrderDelete(indexToDelete, id);
                } catch (error) {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                }
            },
            () => { }
        );
    };

    const updateStateAfterOrderDelete = (indexToDelete, id) => {
        setEditableOrders((prev) => {
            const prevArray = Object.values(prev);
            const updatedArray = prevArray
                .filter((order) => order.No !== indexToDelete)
                .map((order, index) => ({ ...order, id: index }));

            return updatedArray;
        });

        setOrderTrip((prev) => {
            const entries = Object.entries(prev);
            const filtered = entries.filter(([key]) => key !== `Order${parseInt(id, 10) + 1}`);

            const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Order${index + 1}`] = value;
                return acc;
            }, {});

            return newOrderTrip;
        });
    };

    const handleChangeStatus = () => {
        const selectedTruck = resolveTruckSmall(registration);
        const selectedDriver = resolveDriverRow(driverss);

        if (!selectedTruck) return ShowError("กรุณาเพิ่มทะเบียนรถก่อน");
        if (!selectedDriver) return ShowError("กรุณาเพิ่มชื่อพนักงานขับรถก่อน");

        ShowConfirm(
            `ต้องการจบเที่ยววิ่งใช่หรือไม่`,
            async () => {
                try {
                    await Promise.all([
                        apiPut(`/api/truck_small/${selectedTruck.uuid}`, {
                            Driver: "0:ไม่มี",
                            Status: "ว่าง",
                            RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ"
                        }),
                        apiPut(`/api/employee_drivers/${selectedDriver.uuid}`, {
                            Registration: null,
                            RegistrationName: "ไม่มี",
                        }),
                        apiPut(`/api/trip/${trip.uuid}`, {
                            StatusTrip: "จบทริป",
                            DateEnd: dayjs().format("DD/MM/YYYY")
                        }),
                        ...order.map((row) => apiPut(`/api/order/${row.uuid}`, { Status: "จัดส่งสำเร็จ" })),
                        ...ticket.map((row) => apiPut(`/api/tickets/${row.uuid}`, { Status: "จัดส่งสำเร็จ" })),
                    ]);

                    ShowSuccess("จบทริปเรียบร้อย");
                    refetchTripData?.();
                    refetchBasicData?.();
                    setOpen(false);
                } catch (error) {
                    console.error("Update failed:", error);
                    ShowError("เกิดข้อผิดพลาดในการบันทึก");
                }
            },
            () => { }
        );
    };


    const handleChangeCancelTrip = () => {
        const selectedTruck = resolveTruckSmall(registration);
        const selectedDriver = resolveDriverRow(driverss);

        if (!selectedTruck) return ShowError("กรุณาเพิ่มทะเบียนรถก่อน");
        if (!selectedDriver) return ShowError("กรุณาเพิ่มชื่อพนักงานขับรถก่อน");

        ShowConfirm(
            `ต้องการยกเลิกเที่ยววิ่งใช่หรือไม่`,
            async () => {
                try {
                    await Promise.all([
                        apiPut(`/api/truck_small/${selectedTruck.uuid}`, {
                            Driver: "0:ไม่มี",
                            Status: "ว่าง"
                        }),
                        apiPut(`/api/employee_drivers/${selectedDriver.uuid}`, {
                            Registration: null,
                            RegistrationName: "ไม่มี",
                        }),
                        apiPut(`/api/trip/${trip.uuid}`, {
                            StatusTrip: "ยกเลิก",
                            DateEnd: dayjs().format("DD/MM/YYYY")
                        }),
                        ...order.map((row) => apiPut(`/api/order/${row.uuid}`, { Status: "ยกเลิก" })),
                        ...ticket.map((row) => apiPut(`/api/tickets/${row.uuid}`, { Status: "ยกเลิก" })),
                    ]);

                    ShowSuccess("ยกเลิกเที่ยววิ่งเรียบร้อย");
                    refetchTripData?.();
                    refetchBasicData?.();
                    setOpen(false);
                } catch (error) {
                    console.error("Update failed:", error);
                    ShowError("เกิดข้อผิดพลาดในการบันทึก");
                }
            },
            () => { }
        )
    }

    const handleRegistration = (event, weight) => {
        const registrationValue = event;
        setRegistration(registrationValue);
        setWeightTrucks(weight);

        if (Object.keys(editableTickets).length > 0) {
            const updatedTicketsArray = Object.values(editableTickets).map((item) => ({
                ...item,
                Registration: registrationValue,
            }));

            setEditableTickets(updatedTicketsArray);
        }

        // ตรวจสอบว่า selling ไม่ใช่ object ว่าง
        if (Object.keys(editableOrders).length > 0) {
            const updatedOrdersArray = Object.values(editableOrders).map((item) => ({
                ...item,
                Registration: registrationValue
            }));

            setEditableOrders(updatedOrdersArray);
        }
    }

    const handleDriver = (event) => {
        const driversValue = event;
        setDriverss(driversValue);

        if (Object.keys(editableTickets).length > 0) {
            const updatedTicketsArray = Object.values(editableTickets).map((item) => ({
                ...item,
                Driver: driversValue,
            }));

            setEditableTickets(updatedTicketsArray);
        }

        // ตรวจสอบว่า selling ไม่ใช่ object ว่าง
        if (Object.keys(editableOrders).length > 0) {
            const updatedOrdersArray = Object.values(editableOrders).map((item) => ({
                ...item,
                Driver: driversValue,
            }));

            setEditableOrders(updatedOrdersArray);
        }
    }

    return (
        <React.Fragment>
            <Box display="flex" justifyContent="center" alignItems="center">
                {
                    trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                    <Tooltip title="กดเพื่อยกเลิกเที่ยววิ่ง" placement="left">
                        <IconButton color="error" size="small" onClick={handleChangeCancelTrip}>
                            <LocationOffIcon />
                        </IconButton>
                    </Tooltip>
                }
                {
                    trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                    <Tooltip title="กดเพื่อจบทริป" placement="top">
                        <IconButton color="success" size="small" onClick={handleChangeStatus}>
                            <WhereToVoteIcon />
                        </IconButton>
                    </Tooltip>
                }
                <Tooltip title="กดเพื่อดูรายละเอียด" placement="bottom">
                    <IconButton color="info" size="small" onClick={handleClickOpen}>
                        <FmdBadIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidths <= 900 ? true : false}
                onClose={() => {
                    if (!editMode) {
                        handleCancle();
                    } else {
                        ShowWarning("กรุณาบันทึกข้อมูลก่อนปิดหน้าต่าง");
                    }
                }}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "1300px", // กำหนดความสูงของ Dialog
                        maxHeight: "98vh"
                    },
                    zIndex: 1000,
                }}
                maxWidth="lg"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container marginTop={-1.5} marginBottom={-1.5}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >บันทึกข้อมูลการขนส่งน้ำมัน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError size="small" onClick={() => {
                                if (!editMode) {
                                    handleCancle();
                                } else {
                                    ShowWarning("กรุณาบันทึกข้อมูลก่อนปิดหน้าต่าง");
                                }
                            }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }} ref={dialogRef}>
                        <Grid container spacing={1} marginTop={0.5}>
                            <Grid item md={12} xs={12} display="flex" alignItems="center" justifyContent='center'>
                                {
                                    editMode ?
                                        <Grid container spacing={2}>
                                            <Grid item md={4.5} xs={12} textAlign="right">
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.success.dark }} gutterBottom>ตั๋วน้ำมัน</Typography>
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่รับ</Typography>
                                                    <Paper component="form" sx={{ width: "100%" }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                openTo="day"
                                                                views={["year", "month", "day"]}
                                                                value={dayjs(selectedDateReceive, "DD/MM/YYYY")}
                                                                format="DD/MM/YYYY"
                                                                onChange={(newValue) => {
                                                                    if (newValue) {
                                                                        const formatted = newValue.format("DD/MM/YYYY");
                                                                        setSelectedDateReceive(formatted);

                                                                        // อัปเดต date ทั้งหมดใน editableTickets
                                                                        setEditableTickets((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: formatted,
                                                                            }))
                                                                        );
                                                                    } else {
                                                                        setSelectedDateReceive("");
                                                                        setEditableTickets((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: dateReceive,
                                                                            }))
                                                                        );
                                                                    }
                                                                }}
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
                                            <Grid item md={7.5} xs={12}>
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                                    <Paper
                                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                                        <Autocomplete
                                                            id="autocomplete-registration-1"
                                                            options={registrationTruck}
                                                            getOptionLabel={(option) =>
                                                                `${option.ShortName ? option.ShortName : ""} : ${option.RegHead ? option.RegHead : ""}`
                                                            }
                                                            value={registration ? (registrationTruck.find(
                                                                (d) => `${d.id}:${d.RegHead}` === registration
                                                            )) : null}
                                                            onChange={(event, newValue) => {
                                                                if (newValue) {
                                                                    const value = `${newValue.id}:${newValue.RegHead}`;
                                                                    handleRegistration(value, newValue.Weight)
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
                                                                        "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                                    }}
                                                                />
                                                            )}
                                                            fullWidth
                                                            renderOption={(props, option) => (
                                                                <li {...props}>
                                                                    {
                                                                        <Typography fontSize="16px">{`${option.ShortName ? option.ShortName : ""} : ${option.RegHead ? option.RegHead : ""}`}</Typography>
                                                                    }
                                                                </li>
                                                            )}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        :
                                        <Grid container>
                                            <Grid item md={2.5} xs={4} sx={{ textAlign: { md: "right", xs: "right" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.success.dark }} gutterBottom>ตั๋วน้ำมัน</Typography>
                                            </Grid>
                                            <Grid item md={2.5} xs={8} sx={{ textAlign: { md: "center", xs: "left" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ :
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {trip.DateReceive}
                                                    </Box>
                                                </Typography>
                                            </Grid>
                                            <Grid item md={7} xs={12} sx={{ textAlign: { md: "left", xs: "center" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>
                                                    ผู้ขับ/ป้ายทะเบียน :{" "}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {(() => {
                                                            // trip.Driver/trip.Registration เป็น UUID จริงหลัง migrate (schema-manifest: order.Driver/Registration = UUID)
                                                            // จึงต้อง match ด้วย uuid ไม่ใช่แยก id ด้วย split(":") แบบ composite เดิมอีกต่อไป
                                                            const driverName = trip.DriverName || trip.Driver || "";

                                                            const matchedTruck = registrationTruck.find(
                                                                (row) => row.uuid === trip.Registration
                                                            );

                                                            const plate = matchedTruck?.RegHead || trip.RegistrationName || trip.Registration || "";

                                                            const shortName = matchedTruck?.ShortName || "";

                                                            const cleanShortName = shortName.includes("...")
                                                                ? shortName.split("...")[1]
                                                                : shortName;

                                                            // 🔥 ถ้ายังไม่ได้เลือกทะเบียน
                                                            if (!plate || plate === "0") {
                                                                return driverName
                                                                    ? `${driverName} (ยังไม่ได้เลือกทะเบียนรถ)`
                                                                    : "(ยังไม่ได้เลือกทะเบียนรถ)";
                                                            }

                                                            return `${cleanShortName} : ${plate} / ${driverName}`;
                                                        })()}
                                                    </Box>
                                                </Typography>

                                            </Grid>
                                        </Grid>
                                }
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
                                <TableContainer component={Paper} sx={{ marginBottom: 0.5 }}>
                                    {/* Header: คงที่ด้านบน */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: "35px", // กำหนดความสูง header
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
                                                    <TablecellTickets width={80} />
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
                                                {editableTickets.map((row, rowIdx) => (
                                                    <TableRow key={rowIdx}>
                                                        {/* ลำดับ */}
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50, backgroundColor: theme.palette.success.dark, color: "white" }}>
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">{rowIdx + 1}</Typography>
                                                        </TableCell>

                                                        {/* Ticket Name */}
                                                        <TableCell sx={{ textAlign: "left", height: "25px", padding: "1px 4px", width: 350 }}>
                                                            {editMode && row.TicketName === "1:ตั๋วเปล่า" ? (
                                                                <Autocomplete
                                                                    id="autocomplete-tickets"
                                                                    options={getTickets()}
                                                                    getOptionLabel={(option) => `${option.Name}`}
                                                                    isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                                                    value={getTickets().find(item => item.uuid === row.TicketName) || null}
                                                                    onChange={(event, newValue) => {
                                                                        if (newValue) {
                                                                            setEditableTickets((prev) => {
                                                                                const updatedTickets = [...prev];
                                                                                updatedTickets[rowIdx] = {
                                                                                    Address: newValue.Address || "-",
                                                                                    Bill: newValue.Bill || "-",
                                                                                    CodeID: newValue.CodeID || "-",
                                                                                    CompanyName: newValue.CompanyName || "-",
                                                                                    CreditTime: newValue.CreditTime || "-",
                                                                                    Date: selectedDateReceive,
                                                                                    Driver: driverss,
                                                                                    Lat: newValue.Lat || 0,
                                                                                    Lng: newValue.Lng || 0,
                                                                                    Product: newValue.Product || "-",
                                                                                    Rate: newValue.Rate || 0,
                                                                                    Registration: registration,
                                                                                    id: row.id,
                                                                                    No: row.No,
                                                                                    Trip: row.Trip,
                                                                                    TicketName: `${newValue.id}:${newValue.Name}`,
                                                                                    CustomerType: newValue.CustomerType || "-",
                                                                                    Product: {
                                                                                        P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                                    }
                                                                                };
                                                                                return updatedTickets;
                                                                            });
                                                                        }
                                                                    }}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            sx={{
                                                                                "& .MuiOutlinedInput-root": { height: "22px" },
                                                                                "& .MuiInputBase-input": { fontSize: "16px", textAlign: "center" },
                                                                            }}
                                                                        />
                                                                    )}
                                                                    renderOption={(props, option) => (
                                                                        <li {...props}>
                                                                            <Typography fontSize="16px">{`${option.Name}`}</Typography>
                                                                        </li>
                                                                    )}
                                                                />
                                                            )
                                                                : (
                                                                    <Box sx={{ marginLeft: 2 }}>
                                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                            {
                                                                                // (() => {
                                                                                //     const branches = [
                                                                                //         "( สาขาที่  00001)/",
                                                                                //         "( สาขาที่  00002)/",
                                                                                //         "( สาขาที่  00003)/",
                                                                                //         "(สำนักงานใหญ่)/"
                                                                                //     ];

                                                                                //     for (const branch of branches) {
                                                                                //         if (row.TicketName.includes(branch)) {
                                                                                //             return row.TicketName.split(branch)[1];
                                                                                //         }
                                                                                //     }

                                                                                //     return row.TicketName;
                                                                                // })()
                                                                                row.TicketNameName || row.TicketName

                                                                            }
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                        </TableCell>


                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 100 }}>
                                                            {editMode ? (
                                                                depot.split(":")[1] === "ลำปาง" ?
                                                                    <TextField
                                                                        value={row.Rate1}
                                                                        type="number"
                                                                        fullWidth
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '12px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px',
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '12px',
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px',
                                                                                paddingLeft: 2
                                                                            },
                                                                        }}
                                                                        onChange={(e) => handleEditChange(rowIdx, "Rate1", e.target.value)}
                                                                    />
                                                                    : depot.split(":")[1] === "พิจิตร" ?
                                                                        <TextField
                                                                            value={row.Rate2}
                                                                            type="number"
                                                                            fullWidth
                                                                            InputLabelProps={{
                                                                                sx: {
                                                                                    fontSize: '12px',
                                                                                },
                                                                            }}
                                                                            sx={{
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    height: '22px',
                                                                                },
                                                                                '& .MuiInputBase-input': {
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 'bold',
                                                                                    padding: '2px 6px',
                                                                                    paddingLeft: 2
                                                                                },
                                                                            }}
                                                                            onChange={(e) => handleEditChange(rowIdx, "Rate2", e.target.value)}
                                                                        />
                                                                        : depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ?
                                                                            <TextField
                                                                                value={row.Rate3}
                                                                                type="number"
                                                                                fullWidth
                                                                                InputLabelProps={{
                                                                                    sx: {
                                                                                        fontSize: '12px',
                                                                                    },
                                                                                }}
                                                                                sx={{
                                                                                    '& .MuiOutlinedInput-root': {
                                                                                        height: '22px',
                                                                                    },
                                                                                    '& .MuiInputBase-input': {
                                                                                        fontSize: '12px',
                                                                                        fontWeight: 'bold',
                                                                                        padding: '2px 6px',
                                                                                        paddingLeft: 2
                                                                                    },
                                                                                }}
                                                                                onChange={(e) => handleEditChange(rowIdx, "Rate3", e.target.value)}
                                                                            />
                                                                            : ""
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {
                                                                        depot.split(":")[1] === "ลำปาง" ? row.Rate1 :
                                                                            depot.split(":")[1] === "พิจิตร" ? row.Rate2 :
                                                                                depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ? row.Rate3 :
                                                                                    ""
                                                                    }
                                                                </Typography>
                                                            )}
                                                        </TableCell> */}
                                                        {/* Product Data */}
                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].map((productType) => (
                                                            <TableCell key={productType} sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 70 }}>
                                                                {editMode ? (
                                                                    <TextField
                                                                        // value={editableTickets[rowIdx]?.Product[productType]?.Volume || ""}
                                                                        type={isFocused1 ? "number" : "text"} // ✅ เปลี่ยนตามโหมด focus
                                                                        fullWidth
                                                                        InputLabelProps={{ sx: { fontSize: '12px' } }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                                                            '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                        }}
                                                                        // onChange={(e) => handleEditChange(rowIdx, `Product.${productType}.Volume`, e.target.value)}
                                                                        value={isFocused1 ? (editableTickets[rowIdx]?.Product[productType]?.Volume || "") : formatNumber(editableTickets[rowIdx]?.Product[productType]?.Volume || "")}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                                                            if (/^\d*$/.test(val)) {
                                                                                handleEditChange(rowIdx, `Product.${productType}.Volume`, val === "" ? "" : parseInt(val, 10));
                                                                            }
                                                                        }}
                                                                        onFocus={() => setIsFocused1(true)}
                                                                        onBlur={(e) => {
                                                                            setIsFocused1(false);
                                                                            const val = e.target.value.replace(/,/g, "");
                                                                            handleEditChange(rowIdx, `Product.${productType}.Volume`, val === "" ? 0 : parseInt(val, 10));
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                        {row.Product[productType]?.Volume ? new Intl.NumberFormat("en-US").format(row.Product[productType]?.Volume) : "-"}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                        {
                                                            editMode ?
                                                                <TableCell sx={{ textAlign: "center", height: "25px", width: 80 }} >
                                                                    <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }}
                                                                        onClick={() => handleDeleteTickets(row.No, (rowIdx + 1))}
                                                                    >ยกเลิก</Button>
                                                                </TableCell>
                                                                :
                                                                <TableCell width={80} />

                                                        }
                                                    </TableRow>
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
                                                    <TablecellTickets width={400} sx={{ textAlign: "center", fontSize: "16px", height: "30px" }}>
                                                        ปริมาณรวม
                                                    </TablecellTickets>
                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                        <TablecellTickets key={product} width={70} sx={{
                                                            textAlign: "center", height: "30px", fontSize: "16px", color: "black",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {new Intl.NumberFormat("en-US").format(totalVolumesTicket[product])}
                                                        </TablecellTickets>
                                                    ))}
                                                    <TablecellTickets width={80} sx={{
                                                        textAlign: "center", height: "30px", fontSize: "16px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {new Intl.NumberFormat("en-US").format(["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0))}
                                                    </TablecellTickets>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </Box>
                                </TableContainer>
                            </Paper>
                            <Grid container spacing={1} marginBottom={-0.5}>
                                {
                                    editMode &&
                                    <Grid item sm={6} xs={12} marginBottom={-0.5}>
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
                                                isOptionEqualToValue={(option, value) => option.Name === value.Name} // ตรวจสอบค่าที่เลือก// ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        setEditableTickets((prev) => {
                                                            const updatedTickets = [...prev];

                                                            // ตรวจสอบว่ามีตั๋วนี้อยู่แล้วหรือไม่
                                                            // const existingIndex = updatedTickets.findIndex(
                                                            //     (item) => item.TicketName === `${newValue.id}:${newValue.Name}`
                                                            // );

                                                            // if (existingIndex === -1) {

                                                            // let depotTrip = "-"; // ค่าเริ่มต้น

                                                            // if (depot.split(":")[1] === "ลำปาง") {
                                                            //     depotTrip = newValue.Rate1;
                                                            // } else if (depot.split(":")[1] === "พิจิตร") {
                                                            //     depotTrip = newValue.Rate2;
                                                            // } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1])) {
                                                            //     depotTrip = newValue.Rate3;
                                                            // }

                                                            // ถ้ายังไม่มี ให้เพิ่มตั๋วใหม่เข้าไป
                                                            updatedTickets.push({
                                                                Address: newValue.Address || "-",
                                                                Bill: newValue.Bill || "-",
                                                                CodeID: newValue.CodeID || "-",
                                                                CompanyName: newValue.CompanyName || "-",
                                                                CreditTime: newValue.CreditTime || "-",
                                                                Date: selectedDateDelivery,
                                                                Driver: driverss,
                                                                Lat: newValue.Lat || 0,
                                                                Lng: newValue.Lng || 0,
                                                                Product: newValue.Product || "-",
                                                                Rate1: newValue.Rate1,
                                                                Rate2: newValue.Rate2,
                                                                Rate3: newValue.Rate3,
                                                                Registration: registration,
                                                                id: updatedTickets.length, // ลำดับ id ใหม่
                                                                No: ticketLength, // คำนวณจำนวน order
                                                                Trip: (Number(tripID) - 1),
                                                                TicketName: `${newValue.id}:${newValue.Name}`,
                                                                CustomerType: newValue.CustomerType || "-",
                                                                Product: {
                                                                    P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                },
                                                                ...(trip.StatusTrip === "จบทริป" && { Status: "จัดส่งสำเร็จ" })
                                                            });
                                                            // }

                                                            return updatedTickets;
                                                        });
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={"เลือกตั๋วที่ต้องการเพิ่ม"} // เปลี่ยน label กลับหากไม่เลือก
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
                                            />
                                        </Paper>
                                    </Grid>
                                }
                            </Grid>
                        </Paper>
                        <Grid container spacing={1}>
                            <Grid item md={12} xs={12} display="flex" alignItems="center" justifyContent='center'>
                                {
                                    editMode ?
                                        <Grid container spacing={2}>
                                            <Grid item md={4} xs={12} textAlign="right">
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.info.dark }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่ส่ง</Typography>
                                                    <Paper component="form" sx={{ width: "100%" }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                openTo="day"
                                                                views={["year", "month", "day"]}
                                                                value={dayjs(selectedDateDelivery, "DD/MM/YYYY")}
                                                                format="DD/MM/YYYY"
                                                                onChange={(newValue) => {
                                                                    if (newValue) {
                                                                        const formatted = newValue.format("DD/MM/YYYY");
                                                                        setSelectedDateDelivery(formatted);

                                                                        // อัปเดต date ทั้งหมดใน editableTickets
                                                                        setEditableOrders((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: formatted,
                                                                            }))
                                                                        );
                                                                    } else {
                                                                        setSelectedDateDelivery("");
                                                                        setEditableOrders((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: dateDelivery,
                                                                            }))
                                                                        );
                                                                    }
                                                                }}
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
                                            <Grid item md={8} xs={12} >
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                                    <Paper
                                                        component="form" sx={{ height: "30px", width: "100%" }}>
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
                                                                const selectedItem = registrationTruck.find(item =>
                                                                    `${item.id}:${item.RegHead}` === registration
                                                                );
                                                                return selectedItem && `${selectedItem.ShortName ? selectedItem.ShortName : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""}`;
                                                            })()}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        :
                                        <Grid container>
                                            <Grid item md={2.5} xs={4} sx={{ textAlign: { md: "right", xs: "right" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.info.dark }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                                            </Grid>
                                            <Grid item md={2.5} xs={8} sx={{ textAlign: { md: "center", xs: "left" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่ส่ง :
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {trip.DateDelivery}
                                                    </Box>
                                                </Typography>
                                            </Grid>
                                            <Grid item md={7} xs={12} sx={{ textAlign: { md: "left", xs: "center" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>
                                                    ผู้ขับ/ป้ายทะเบียน :{" "}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {(() => {
                                                            // trip.Driver/trip.Registration เป็น UUID จริงหลัง migrate (schema-manifest: order.Driver/Registration = UUID)
                                                            // จึงต้อง match ด้วย uuid ไม่ใช่แยก id ด้วย split(":") แบบ composite เดิมอีกต่อไป
                                                            const driverName = trip.DriverName || trip.Driver || "";

                                                            const matchedTruck = registrationTruck.find(
                                                                (row) => row.uuid === trip.Registration
                                                            );

                                                            const plate = matchedTruck?.RegHead || trip.RegistrationName || trip.Registration || "";

                                                            const shortName = matchedTruck?.ShortName || "";

                                                            const cleanShortName = shortName.includes("...")
                                                                ? shortName.split("...")[1]
                                                                : shortName;

                                                            // 🔥 ถ้ายังไม่ได้เลือกทะเบียน
                                                            if (!plate || plate === "0") {
                                                                return driverName
                                                                    ? `${driverName} (ยังไม่ได้เลือกทะเบียนรถ)`
                                                                    : "(ยังไม่ได้เลือกทะเบียนรถ)";
                                                            }

                                                            return `${cleanShortName} : ${plate} / ${driverName}`;
                                                        })()}

                                                    </Box>
                                                </Typography>

                                            </Grid>
                                        </Grid>
                                }
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
                                <TableContainer component={Paper} sx={{ marginBottom: 0.5 }}>
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
                                                    <TablecellCustomers width={60} />
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
                                                {editableOrders.map((row, rowIdx) => (
                                                    <TableRow key={rowIdx}>
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50, backgroundColor: theme.palette.info.main, color: "white" }}>
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                                {rowIdx + 1}
                                                            </Typography>
                                                        </TableCell>

                                                        <TableCell sx={{ textAlign: "left", height: "25px", padding: "1px 4px", width: 240 }}>
                                                            <Box sx={{ marginLeft: 2 }}>
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {
                                                                        row.TicketNameName || row.TicketName
                                                                    }
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>

                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 60 }}>
                                                            {editMode ? (
                                                                <TextField
                                                                    value={editableOrders[rowIdx]?.Rate || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleOrderChange(rowIdx, "Rate", e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {row.Rate}
                                                                </Typography>
                                                            )}
                                                        </TableCell>

                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50 }}>
                                                            {editMode ? (
                                                                <TextField
                                                                    value={editableOrders[rowIdx]?.CreditTime || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleOrderChange(rowIdx, "CreditTime", e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {row.CreditTime}
                                                                </Typography>
                                                            )}
                                                        </TableCell>

                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].map((productType) => (
                                                            <TableCell key={productType} sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 70 }}>
                                                                {editMode ? (
                                                                    <TextField
                                                                        // value={editableOrders[rowIdx]?.Product[productType]?.Volume || ""}
                                                                        type={isFocused2 ? "number" : "text"}
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                                                            '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                        }}
                                                                        // onChange={(e) => handleOrderChange(rowIdx, `Product.${productType}.Volume`, e.target.value)}
                                                                        value={isFocused2 ? (editableOrders[rowIdx]?.Product[productType]?.Volume || "") : formatNumber(editableOrders[rowIdx]?.Product[productType]?.Volume || "")}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                                                            if (/^\d*$/.test(val)) {
                                                                                handleOrderChange(rowIdx, `Product.${productType}.Volume`, val === "" ? "" : parseInt(val, 10));
                                                                            }
                                                                        }}
                                                                        onFocus={() => setIsFocused2(true)}
                                                                        onBlur={(e) => {
                                                                            setIsFocused2(false);
                                                                            const val = e.target.value.replace(/,/g, "");
                                                                            handleOrderChange(rowIdx, `Product.${productType}.Volume`, val === "" ? 0 : parseInt(val, 10));
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                        {row.Product[productType]?.Volume ? new Intl.NumberFormat("en-US").format(row.Product[productType]?.Volume) : "-"}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 70 }}>
                                                            {editMode ? (
                                                                <TextField
                                                                    value={editableOrders[rowIdx]?.Travel || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleOrderChange(rowIdx, "Travel", e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {new Intl.NumberFormat("en-US").format(row.Travel)}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        {
                                                            editMode ?
                                                                <TableCell sx={{ textAlign: "center", height: "25px", width: 60 }} >
                                                                    <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }}
                                                                        onClick={() => handleDeleteOrder(row.No, (rowIdx + 1))}
                                                                    >ยกเลิก</Button>
                                                                </TableCell>
                                                                :
                                                                <TableCell width={60} />

                                                        }
                                                    </TableRow>
                                                ))}

                                            </TableBody>
                                        </Table>
                                    </Box>

                                    {/* Footer: คงที่ด้านล่าง */}
                                    <Box
                                        sx={
                                            ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0) !== 0 ?
                                                {
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: "25px", // กำหนดความสูง footer
                                                    bottom: "25px", // จนถึงด้านบนของ footer
                                                    backgroundColor: theme.palette.info.main,
                                                    zIndex: 2,
                                                    marginBottom: 0.5
                                                }
                                                :
                                                {
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: "25px", // กำหนดความสูง footer
                                                    backgroundColor: theme.palette.info.main,
                                                    zIndex: 2,
                                                    borderTop: "2px solid white",
                                                    marginBottom: 0.5
                                                }
                                        }
                                    >
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                            <TableFooter>
                                                <TableRow>
                                                    <TablecellCustomers width={400} sx={{ textAlign: "center", height: "25px", fontSize: "16px" }}>
                                                        รวม
                                                    </TablecellCustomers>

                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                        <TablecellCustomers key={product} width={70} sx={{
                                                            textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {new Intl.NumberFormat("en-US").format(totalVolumesOrder[product])}
                                                        </TablecellCustomers>
                                                    ))}
                                                    <TablecellCustomers width={130} colSpan={2} sx={{
                                                        textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {new Intl.NumberFormat("en-US").format(["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesOrder[product] || 0), 0))}
                                                    </TablecellCustomers>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </Box>

                                    {/* Footer: คงที่ด้านล่าง */}
                                    {
                                        ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0) !== 0 &&
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: "25px", // กำหนดความสูง footer
                                                backgroundColor: theme.palette.info.main,
                                                zIndex: 2,
                                                borderTop: "2px solid white",
                                                marginBottom: 0.5
                                            }}
                                        >
                                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                                <TableFooter>
                                                    <TableRow>
                                                        <TablecellCustomers width={400} sx={{ textAlign: "center", height: "25px", fontSize: "16px" }}>
                                                            คงเหลือ
                                                        </TablecellCustomers>

                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                            <TablecellCustomers key={product} width={70} sx={{
                                                                textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                                fontWeight: "bold", backgroundColor: (totalVolumesTicket[product] - totalVolumesOrder[product]) < 0 ? "red" : (totalVolumesTicket[product] - totalVolumesOrder[product]) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white"
                                                            }}>
                                                                {new Intl.NumberFormat("en-US").format(totalVolumesTicket[product] - totalVolumesOrder[product])}
                                                            </TablecellCustomers>
                                                        ))}
                                                        <TablecellCustomers width={130} colSpan={2} sx={{
                                                            textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {new Intl.NumberFormat("en-US").format(["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + ((totalVolumesTicket[product] - totalVolumesOrder[product]) || 0), 0))}
                                                        </TablecellCustomers>
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </Box>
                                    }
                                </TableContainer>
                            </Paper>
                            <Grid container spacing={1}>
                                {
                                    editMode &&
                                    <>
                                        <Grid item md={6} xs={12} marginBottom={-0.5}>
                                            <Paper
                                                component="form"
                                                sx={{ height: "30px", width: "100%" }}
                                            >
                                                <Autocomplete
                                                    id="autocomplete-tickets"
                                                    options={getCustomers()} // ดึงข้อมูลจากฟังก์ชัน getCustomers()
                                                    getOptionLabel={(option) =>
                                                        `${option.Name}`
                                                    } // กำหนดรูปแบบของ Label ที่แสดง
                                                    isOptionEqualToValue={(option, value) => option.Name === value.Name} // ตรวจสอบค่าที่เลือก
                                                    onChange={(event, newValue) => {
                                                        if (newValue) {
                                                            setEditableOrders((prev) => {
                                                                const updatedOrders = [...prev];

                                                                // ตรวจสอบว่ามีตั๋วนี้อยู่แล้วหรือไม่
                                                                // const existingIndex = updatedOrders.findIndex(
                                                                //     (item) => item.TicketName === `${newValue.id}:${newValue.Name}`
                                                                // );

                                                                // if (existingIndex === -1) {

                                                                // let depotTrip = "-"; // ค่าเริ่มต้น

                                                                // if (depot.split(":")[1] === "ลำปาง") {
                                                                //     depotTrip = newValue.Rate1;
                                                                // } else if (depot.split(":")[1] === "พิจิตร") {
                                                                //     depotTrip = newValue.Rate2;
                                                                // } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1])) {
                                                                //     depotTrip = newValue.Rate3;
                                                                // }

                                                                // ถ้ายังไม่มี ให้เพิ่มตั๋วใหม่เข้าไป
                                                                updatedOrders.push({
                                                                    Address: newValue.Address || "-",
                                                                    Bill: newValue.Bill || "-",
                                                                    CodeID: newValue.CodeID || "-",
                                                                    CompanyName: newValue.CompanyName || "-",
                                                                    CreditTime: newValue.CreditTime || "-",
                                                                    Date: selectedDateDelivery,
                                                                    Driver: driverss,
                                                                    Lat: newValue.Lat || 0,
                                                                    Lng: newValue.Lng || 0,
                                                                    Product: newValue.Product || "-",
                                                                    Rate: newValue.Rate || 0,
                                                                    Registration: registration,
                                                                    id: updatedOrders.length, // ลำดับ id ใหม่
                                                                    No: orderLength, // คำนวณจำนวน order
                                                                    Trip: (Number(tripID) - 1),
                                                                    TicketName: `${newValue.id}:${newValue.Name}`,
                                                                    CustomerType: newValue.CustomerType || "ตั๋วรถเล็ก",
                                                                    Product: {
                                                                        P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                    },
                                                                    ...(trip.StatusTrip === "จบทริป" && { Status: "จัดส่งสำเร็จ" })
                                                                });
                                                                // }

                                                                return updatedOrders;
                                                            });
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={"เลือกลูกค้าที่ต้องการเพิ่ม"} // เปลี่ยน label กลับหากไม่เลือก
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
                                                />
                                            </Paper>
                                        </Grid>
                                    </>
                                }
                                <Grid item md={editMode ? 2 : 12} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px',
                                                    textAlign: 'center',
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
                                            value={costTrip}
                                            disabled={editMode ? false : true}
                                        />
                                    </Paper>
                                </Grid>
                                {
                                    editMode &&
                                    <Grid item md={4} xs={6} display="flex" alignItems="center" justifyContent="center">
                                        <Paper sx={{ width: "100%" }}
                                            component="form">
                                            <Autocomplete
                                                id="autocomplete-tickets"
                                                options={driverDetail.filter((item) => item.Status !== "ยกเลิก" && item.TruckType === "รถเล็ก")} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                                getOptionLabel={(option) =>
                                                    `${option.Name}`
                                                } // กำหนดรูปแบบของ Label ที่แสดง
                                                value={driverDetail.find(item => `${item.id}:${item.Name}` === driverss) || null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        const value = `${newValue.id}:${newValue.Name}`;
                                                        handleDriver(value); // อัพเดตค่าเมื่อเลือก
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
                                                        InputProps={{
                                                            ...params.InputProps, // สำคัญ! ต้องรวมของเดิมไว้ก่อน
                                                            startAdornment: (
                                                                <>
                                                                    <InputAdornment position="start">
                                                                        <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                                            พขร :
                                                                        </Typography>
                                                                    </InputAdornment>
                                                                    {params.InputProps.startAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li {...props}>
                                                        <Typography fontSize="14px">{`${option.Name}`}</Typography>
                                                    </li>
                                                )}
                                            />
                                        </Paper>
                                    </Grid>
                                }
                            </Grid>
                        </Paper>
                    </Box>
                    {
                        !editMode ?
                            <>
                                {
                                    trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" ?
                                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*ถ้าต้องการเพิ่มตั๋วหรือลูกค้าให้กดปุ่มแก้ไข*</Typography>
                                        :
                                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*บันทึกรูปภาพ*</Typography>
                                }
                                <Box textAlign="center" marginTop={1} display="flex" justifyContent="center" alignItems="center">
                                    {
                                        trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                                        <Button variant="contained" color="success" size="small" sx={{ marginRight: 1 }} onClick={handleChangeStatus} endIcon={<WhereToVoteIcon />}>
                                            จบเที่ยววิ่ง
                                        </Button>
                                    }
                                    {
                                        trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                                        <Button variant="contained" color="error" size="small" sx={{ marginRight: 1 }} onClick={handleChangeCancelTrip} endIcon={<LocationOffIcon />} >
                                            ยกเลิกเที่ยววิ่ง
                                        </Button>
                                    }
                                    {
                                        //trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                                        trip.StatusTrip !== "ยกเลิก" &&
                                        <Button variant="contained" color="warning" size="small" sx={{ marginRight: 1 }} onClick={handleUpdate} endIcon={<EditLocationIcon />} >แก้ไข</Button>
                                    }
                                    <Button variant="contained" size="small" onClick={handleSaveAsImage} endIcon={<SatelliteIcon />} >บันทึกรูปภาพ</Button>
                                </Box>
                            </>
                            :
                            <>
                                <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*เมื่อแก้ไขเสร็จแล้วให้กดบันทึกให้เรียบร้อย*</Typography>
                                <Box textAlign="center" marginTop={1} display="flex" justifyContent="center" alignItems="center">
                                    <Button variant="contained" color="error" size="small" sx={{ marginRight: 1 }} onClick={handleCancleUpdate}>ยกเลิก</Button>
                                    <Button variant="contained" color="success" size="small" onClick={handleSave}>บันทึก</Button>
                                </Box>
                            </>
                    }
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default UpdateTrip;
