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
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import OrderDetail from "./OrderDetail";
import SellingDetail from "./SellingDetail";

const InsertTrips = (props) => {
    const { creditor } = props;
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [codes, setCodes] = React.useState("");
    const [tickets, setTickets] = React.useState("0:0");
    const [customers, setCustomers] = React.useState("0:0");
    const [selectedValue, setSelectedValue] = useState('');
    const [registration, setRegistration] = React.useState("0:0:0");
    const [weight, setWeight] = React.useState(0);
    const [totalWeight, setTotalWeight] = React.useState(0);
    const [showTickers, setShowTickers] = React.useState(true);
    const [showTrips, setShowTrips] = React.useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const [depots, setDepots] = React.useState("");
    const [status, setStatus] = React.useState("");

    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setShowTickers(true);
        setShowTrips(true)
    };

    const [weightOil, setWeightOil] = React.useState([]);
    const total = weightOil.reduce((sum, value) => sum + value, 0);
    const [heavyOil, setHeavyOil] = React.useState(total);

    const handleSendBack = (newData) => {
        setWeightOil((prev) => [...prev, newData]);
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

    const getTruck = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegHead = [];
            for (let id in datas) {
                if (datas[id].Driver !== "ไม่มี" && datas[id].RegTail !== "ไม่มี" && datas[id].Status === "ว่าง") {
                    dataRegHead.push({ id, ...datas[id] })
                }
            }
            setRegHead(dataRegHead);
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

    const [ticketsT, setTicketsT] = React.useState([]);
    const [ticketsPS, setTicketsPS] = React.useState([]);
    const [ticketsA, setTicketsA] = React.useState([]);
    const [orderT, setOrderT] = React.useState([]);
    const [orderPS, setOrderPS] = React.useState([]);
    const [orderA, setOrderA] = React.useState([]);
    const [ticket, setTicket] = React.useState(0);
    const [ticketsTrip, setTicketsTrip] = React.useState(0);
    const [ticketsOrder, setTicketsOrder] = React.useState([]);

    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            setTicket(datas.length);
        });

        database.ref("/customer").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataCustomer = [];
            for (let id in datas) {
                dataCustomer.push({ id, ...datas[id] })
            }
            setTicketsT(dataCustomer);
        });

        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataGasStations = [];
            for (let id in datas) {
                dataGasStations.push({ id, ...datas[id] })
            }
            setTicketsPS(dataGasStations);
        });

        database.ref("/depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                dataStock.push({ id, ...datas[id] })
            }
            setTicketsA(dataStock);
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

    // const filteredOptions = ticket.filter(row =>
    //     row.Code.toLowerCase().includes(code.toLowerCase())
    // );

    const handleTickets = () => {
        if (registration === "0:0:0") {
            ShowWarning("กรุณาเลือกผู้ขับ/ป้ายทะเบียนให้เรียบร้อย")
        } else {
            ShowConfirm(
                "ต้องการสร้างตั๋วใช่หรือไม่",
                () => {
                    // เงื่อนไขเมื่อกดปุ่มตกลง
                    setShowTickers(false)
                    database
                        .ref("tickets/")
                        .child(ticket)
                        .update({
                            id: ticket + 1,
                            DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                            Registration: registration.split(":")[1],
                            Driver: registration.split(":")[2],
                            WeightTruck: weight
                        })
                        .then(() => {
                            ShowSuccess("สามารถเพิ่มตั๋วได้เลย");
                            setTicketsTrip(ticket);
                            database.ref("/tickets/" + ticket + "/ticketOrder").on("value", (snapshot) => {
                                const datas = snapshot.val();
                                const dataTicket = [];
                                for (let id in datas) {
                                    dataTicket.push({ id, ...datas[id] })
                                }
                                setTicketsOrder(dataTicket);
                            });

                            database
                                .ref("truck/registration/")
                                .child((registration.split(":")[0]) - 1)
                                .update({
                                    Status: "GT:" + ticket
                                })
                                .then(() => {
                                    console.log("Data pushed successfully");

                                })
                                .catch((error) => {
                                    console.error("Error pushing data:", error);
                                });
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error("Error pushing data:", error);
                        });
                },
                () => {
                    // เงื่อนไขเมื่อกดปุ่มยกเลิก
                    setShowTickers(true)
                }
            );
        }
    }

    const handleTrip = () => {
        ShowConfirm(
            "ต้องการสร้างเที่ยววิ่งใช่หรือไม่?",
            () => {
                // เงื่อนไขเมื่อกดปุ่มตกลง
                setShowTrips(false)
                database
                    .ref("trip/")
                    .child(trip.length)
                    .update({
                        id: trip.length + 1,
                        DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                        Registration: registration.split(":")[1],
                        Driver: registration.split(":")[2],
                        WeightTruck: weight,
                        WeightOil: total,
                        Ticketsnumber: ticketsTrip
                    })
                    .then(() => {
                        ShowSuccess("สร้างเที่ยววิ่งเรียบร้อย");
                        setTrips(trip.length);
                        database.ref("/order").on("value", (snapshot) => {
                            const datas = snapshot.val();
                            const dataOrder = [];
                            for (let id in datas) {
                                if (datas[id].Trip === trip.length) {
                                    dataOrder.push({ id, ...datas[id] })
                                }
                            }
                            setOrders(dataOrder);
                        });

                        database.ref("/tickets/" + ticketsTrip + "/ticketOrder").on("value", (snapshot) => {
                            const datas = snapshot.val();
                            const dataT = []; // สร้าง array สำหรับเก็บข้อมูล
                            const dataA = [];
                            for (let id in datas) {
                                const ticketType = datas[id].TicketName.split(":")[0]; // ดึงประเภท ticket
                                const TicketName = datas[id].TicketName.split(":")[1];

                                if (ticketType === "T") {
                                    database.ref("/customer").on("value", (snapshot) => {
                                        const customer = snapshot.val();
                                        for (let T in customer) {
                                            if (customer[T].Name === TicketName) {
                                                dataT.push({ T, ...customer[T] })
                                            }
                                        }
                                    });
                                } else if (ticketType === "PS") {
                                    database.ref("/depot/gasStations/").on("value", (snapshot) => {
                                        const gasStations = snapshot.val();
                                        const dataPS = [];
                                        for (let PS in gasStations) {
                                            dataPS.push({ PS, ...gasStations[PS] });
                                        }
                                        setOrderPS(dataPS); // ตั้งค่า OrderPS เมื่อดึงข้อมูลสำเร็จ
                                    });
                                } else {
                                    database.ref("/customer").on("value", (snapshot) => {
                                        const customer = snapshot.val();
                                        for (let A in customer) {
                                            if (customer[A].Name !== TicketName) {
                                                dataA.push({ A, ...customer[A] })
                                            }
                                        }
                                    });
                                    // database.ref("/depot/stock/").on("value", (snapshot) => {
                                    //     const stock = snapshot.val();
                                    //     const dataA = [];
                                    //     for (let A in stock) {
                                    //         dataA.push({ A, ...stock[A] });
                                    //     }
                                    //     setOrderA(dataA); // ตั้งค่า OrderA เมื่อดึงข้อมูลสำเร็จ
                                    // });
                                }
                            }

                            setOrderT(dataT);
                            setOrderA(dataA);
                        });
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                // เงื่อนไขเมื่อกดปุ่มยกเลิก
                setShowTickers(true)
            }
        );
    };

    const handlePost = () => {
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder")
            .child(ticketsOrder.length)
            .update({
                id: ticketsOrder.length + 1,
                TicketName: tickets,
                Rate: 0.75,
                OrderID: ""
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleSubmit = () => {
        database
            .ref("trip/")
            .child(trips)
            .update({
                Depot: depots,
                Status: "รออนุมัติ",
                Creditor: creditor
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                database
                    .ref("truck/registration/")
                    .child((registration.split(":")[0]) - 1)
                    .update({
                        Status: "TR:" + trips
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                        setOpen(false);
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
    };

    const handleCustomer = () => {
        database
            .ref("order/")
            .child(order.length)
            .update({
                id: order.length + 1,
                DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                Registration: registration.split(":")[1],
                Driver: registration.split(":")[2],
                Customer: customers.split(":")[1],
                TicketName: customers,
                Trip: trips
            })
            .then(() => {
                ShowSuccess("เพิ่มออเดอร์เรียบร้อย");

            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleCancle = () => {
        if (showTickers === false) {
            if (showTrips === false) {
                database
                    .ref("trip/")
                    .child(trips)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ยกเลิกสำเร็จ");
                        console.log("Data pushed successfully");
                        database
                            .ref("truck/registration/")
                            .child((registration.split(":")[0]) - 1)
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
                    .ref("truck/registration/")
                    .child((registration.split(":")[0]) - 1)
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
    }

    const handleTotalWeight = (newHeavyOil, newWeight) => {
        const total =
            parseFloat(newHeavyOil || 0) +
            parseFloat(newWeight || 0);
        setTotalWeight(total);
    };

    const handleChangeHeavyOil = (e) => {
        const value = e.target.value;
        setHeavyOil(value);
        handleTotalWeight(value, weight);
    };

    const handleChangeWeight = (e) => {
        const value = e.target.value;
        setWeight(value);
        handleTotalWeight(heavyOil, value);
    };

    const getCombinedTickets = () => {
        const combinedTickets = [];
        const maxLength = Math.max(ticketsT.length, ticketsA.length, ticketsPS.length);

        for (let i = 0; i < maxLength; i++) {
            if (ticketsT[i]) combinedTickets.push({ type: "T", ...ticketsT[i] });
            if (ticketsA[i]) combinedTickets.push({ type: "A", ...ticketsA[i] });
            if (ticketsPS[i]) combinedTickets.push({ type: "PS", ...ticketsPS[i] });
        }

        return combinedTickets;
    };

    // เรียกใช้ฟังก์ชันเพื่อสร้างอาร์เรย์ combinedTickets
    const combinedTickets = getCombinedTickets();

    console.log("แสดง " + orderT.length + "," + orderPS.length + "," + orderA.length);

    const getCombinedOrder = () => {
        const combinedOrder = [];
        const maxLength = Math.max(orderT.length, orderA.length, orderPS.length);

        for (let i = 0; i < maxLength; i++) {
            if (orderT[i]) combinedOrder.push({ type: "T", ...orderT[i] });
            if (orderA[i]) combinedOrder.push({ type: "A", ...orderA[i] });
            if (orderPS[i]) combinedOrder.push({ type: "PS", ...orderPS[i] });
        }

        return combinedOrder;
    };

    // เรียกใช้ฟังก์ชันเพื่อสร้างอาร์เรย์ combinedOrder
    const combinedOrder = getCombinedOrder();

    React.useEffect(() => {
        const currentRow = regHead.find((row) => row.RegHead === registration.split(":")[1]);
        if (currentRow) {
            setWeight(currentRow.Weight || 0); // ใช้ค่า Weight จาก row หรือ 0 ถ้าไม่มี
        }
    }, [registration, regHead]);

    return (
        <React.Fragment>
            <Button variant="contained" color="info" onClick={handleClickOpen} sx={{ height: 50, borderRadius: 3 }} endIcon={<AddLocationAltIcon />} >จัดเที่ยววิ่ง</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleCancle}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "1500px", // กำหนดความกว้างแบบ Fixed
                        maxWidth: "none", // ปิดการปรับอัตโนมัติ
                    },
                    zIndex: 1000
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >บันทึกข้อมูลขนส่งของการขายส่งน้ำมัน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleCancle}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} marginTop={2}>
                        <Grid item sm={1} xs={3} textAlign="right" marginTop={1}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>วันที่รับ</Typography>
                        </Grid>
                        <Grid item sm={4} xs={9} textAlign="right">
                            <Paper
                                component="form">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        openTo="day"
                                        views={["year", "month", "day"]}
                                        value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                        format="DD/MM/YYYY"
                                        onChange={handleDateChange}
                                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                                        disabled={showTickers ? false : true}
                                    />
                                </LocalizationProvider>
                            </Paper>
                        </Grid>
                        <Grid item sm={1.5} xs={3} marginTop={1}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                        </Grid>
                        <Grid item sm={5.5} xs={9}>
                            <Paper
                                component="form">
                                <Select
                                    id="demo-simple-select"
                                    value={registration}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setRegistration(e.target.value)}
                                    fullWidth
                                    disabled={showTickers ? false : true}
                                >
                                    <MenuItem value={"0:0:0"}>
                                        กรุณาเลือกผู้ขับ/ป้ายทะเบียน
                                    </MenuItem>
                                    {
                                        regHead.map((row) => (
                                            <MenuItem value={row.id + ":" + row.RegHead + ":" + row.Driver}>{row.Driver + " : " + row.RegHead}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} marginTop={2}>
                        {
                            showTickers ?
                                <Grid item xs={12} marginTop={1} marginBottom={1}>
                                    <Divider>
                                        <Button variant="contained" color="info" size="small" onClick={handleTickets} sx={{ borderRadius: 20 }}>จัดการตั๋ว</Button>
                                    </Divider>
                                </Grid>
                                :
                                <>
                                    <Grid item xs={1} textAlign="right">
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ราคาบรรทุกน้ำมัน</Typography>
                                    </Grid>
                                    <Grid item xs={11} textAlign="right" >
                                        <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                                            <TableContainer
                                                component={Paper}
                                                style={{ height: "40vh" }}
                                                sx={{
                                                    maxWidth: '100%',
                                                    overflowX: 'auto',  // ทำให้สามารถเลื่อนได้ในแนวนอน
                                                }}
                                            >
                                                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                                                    <TableHead >
                                                        <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.error.main }}>
                                                            <TablecellHeader width={80} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ลำดับ
                                                            </TablecellHeader>
                                                            <TablecellHeader width={80} sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: theme.palette.panda.light, borderRight: "1px solid white" }} rowSpan={2}>
                                                                รหัสตั๋ว
                                                            </TablecellHeader>
                                                            <TablecellHeader width={500} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ตั๋ว
                                                            </TablecellHeader>
                                                            <TablecellHeader width={300} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                เลขที่ออเดอร์
                                                            </TablecellHeader>
                                                            <TablecellHeader width={200} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ค่าบรรทุก
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                G95
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                G91
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                B7(D)
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                B95
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                B10
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                B20
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                E20
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                E85
                                                            </TablecellHeader>
                                                            <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                                PWD
                                                            </TablecellHeader>
                                                            <TablecellHeader width={180} sx={{ textAlign: "center" }} rowSpan={2} />
                                                        </TableRow>
                                                        <TableRow sx={{ position: "sticky", top: 35, zIndex: 2, backgroundColor: theme.palette.panda.light }}>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4} >
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2} marginLeft={-4}>
                                                                    <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                                        <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {
                                                            ticketsOrder.map((row) => (
                                                                <OrderDetail key={row.id} detail={row} ticketsTrip={ticketsTrip} onSendBack={handleSendBack} total={total} />
                                                            ))
                                                        }
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <Grid container spacing={1} marginTop={1}>
                                                <Grid item sm={5} xs={12}>
                                                    <Paper
                                                        component="form"
                                                    >
                                                        <Grid container>
                                                            <Grid item sm={1.5} xs={2}>
                                                                <Paper
                                                                    component="form">
                                                                    <TextField size="small" fullWidth sx={{ borderRadius: 10 }} value={code} onChange={(e) => setCode(e.target.value)} />
                                                                </Paper>
                                                            </Grid>
                                                            <Grid item sm={8} xs={7}>
                                                                <Select
                                                                    id="demo-simple-select"
                                                                    value={tickets}
                                                                    size="small"
                                                                    sx={{ textAlign: "left" }}
                                                                    onChange={(e) => setTickets(e.target.value)}
                                                                    fullWidth
                                                                >
                                                                    <MenuItem value={"0:0"}>
                                                                        เลือกตั๋วที่ต้องการเพิ่ม
                                                                    </MenuItem>
                                                                    {
                                                                        code === "PS" || code === "ps" ?
                                                                            ticketsPS.map((row) => (
                                                                                <MenuItem value={"PS:" + row.Name}>{"PS: " + row.Name}</MenuItem>
                                                                            ))
                                                                            : code === "A" || code === "a" ?
                                                                                ticketsA.map((row) => (
                                                                                    <MenuItem value={"A:" + row.Name}>{"A: " + row.Name}</MenuItem>
                                                                                ))
                                                                                : code === "T" || code === "t" ?
                                                                                    ticketsT.map((row) => (
                                                                                        <MenuItem value={"T:" + row.Name}>{"T: " + row.Name}</MenuItem>
                                                                                    ))
                                                                                    : code === "" ?
                                                                                        combinedTickets.map((row, index) => (
                                                                                            <MenuItem key={index} value={`${row.type}:${row.Name}`}>
                                                                                                {`${row.type}:${row.Name}`}
                                                                                            </MenuItem>
                                                                                        ))
                                                                                        : ""
                                                                    }
                                                                    {/* {
                                                                        filteredOptions.map((row) => (
                                                                            <MenuItem value={row.Code + ":" + row.Name}>{row.Code + " : " + row.Name}</MenuItem>
                                                                        ))
                                                                    }
                                                                    {filteredOptions.length === 0 && (
                                                                        <MenuItem disabled>No results found</MenuItem>
                                                                    )} */}
                                                                </Select>
                                                            </Grid>
                                                            <Grid item sm={2.5} xs={3} display="flex" alignItems="center" paddingLeft={0.5} paddingRight={0.5}>
                                                                <Button variant="contained" color="info" fullWidth onClick={handlePost}>เพิ่มตั๋ว</Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={1} xs={2} marginTop={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>สถานะ</Typography>
                                                </Grid>
                                                <Grid item sm={6} xs={10}>
                                                    <Paper
                                                        component="form">
                                                        <Select
                                                            id="demo-simple-select"
                                                            value={status}
                                                            size="small"
                                                            sx={{ textAlign: "left" }}
                                                            onChange={(e) => setStatus(e.target.value)}
                                                            fullWidth
                                                        >
                                                            <MenuItem value={0}>
                                                                กรุณาเลือกสถานะ
                                                            </MenuItem>
                                                            <MenuItem value={10}>Menu1</MenuItem>
                                                            <MenuItem value={20}>Menu2</MenuItem>
                                                            <MenuItem value={30}>Menu3</MenuItem>
                                                        </Select>
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={1} xs={3} marginTop={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>น้ำมันหนัก</Typography>
                                                </Grid>
                                                <Grid item sm={3.5} xs={9}>
                                                    <Paper
                                                        component="form">
                                                        <TextField size="small" type="number" fullWidth
                                                            sx={{ borderRadius: 10 }}
                                                            value={total.toFixed(2)}
                                                            onChange={handleChangeHeavyOil}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                            }}
                                                            disabled />
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={1} xs={3} marginTop={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>น้ำหนักรถ</Typography>
                                                </Grid>
                                                {
                                                    registration.split(":")[1] === 0 ?
                                                        <Grid item sm={2} xs={9} >
                                                            <Paper
                                                                component="form">
                                                                <TextField size="small" type="number" fullWidth
                                                                    sx={{ borderRadius: 10 }}
                                                                    value={weight}
                                                                    onChange={handleChangeWeight}
                                                                    InputProps={{
                                                                        endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                                    }}
                                                                    disabled
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        :
                                                        regHead.map((row) => (
                                                            row.RegHead === registration.split(":")[1] ?
                                                                <Grid item sm={3.5} xs={9} key={row.id}>
                                                                    <Paper
                                                                        component="form">
                                                                        <TextField size="small" type="number" fullWidth sx={{ borderRadius: 10 }}
                                                                            value={weight} // แสดงค่าจาก state weight
                                                                            onChange={handleTotalWeight}
                                                                            disabled
                                                                            InputProps={{
                                                                                endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                                            }}
                                                                        />
                                                                    </Paper>
                                                                </Grid>
                                                                :
                                                                null
                                                        ))
                                                }
                                                <Grid item sm={0.5} xs={3} marginTop={1} >
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                                                </Grid>
                                                <Grid item sm={2.5} xs={9} >
                                                    <Paper
                                                        component="form">
                                                        <TextField size="small" fullWidth
                                                            sx={{ borderRadius: 10 }}
                                                            value={parseFloat(total) + parseFloat(weight)}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                            }}
                                                            disabled
                                                        />
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    {
                                        total !== 0 && showTrips ?
                                            <Grid item xs={12} marginTop={1} marginBottom={1}>
                                                <Divider>
                                                    <Button variant="contained" color="info" size="small" onClick={handleTrip} sx={{ borderRadius: 20 }}>จัดเที่ยววิ่ง</Button>
                                                </Divider>
                                            </Grid>
                                            :
                                            ""
                                    }
                                </>
                        }
                    </Grid>
                    <Divider sx={{ marginTop: 2, marginBottom: 1 }} />
                    {
                        showTrips ?
                            ""
                            :
                            <>
                                <Grid container spacing={1} marginTop={1} marginBottom={1}>
                                    <Grid item sm={1} xs={3} textAlign="right" marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>วันที่ส่ง</Typography>
                                    </Grid>
                                    <Grid item sm={11} xs={9} textAlign="right">
                                        <Paper
                                            component="form">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    openTo="day"
                                                    views={["year", "month", "day"]}
                                                    value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                                    format="DD/MM/YYYY"
                                                    onChange={handleDateChange}
                                                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                                                />
                                            </LocalizationProvider>
                                        </Paper>
                                    </Grid>
                                    <Grid item sm={1.5} xs={3} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                    </Grid>
                                    <Grid item sm={7} xs={9}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={registration}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setRegistration(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={"0:0:0"}>
                                                    กรุณาเลือกผู้ขับ/ป้ายทะเบียน
                                                </MenuItem>
                                                {
                                                    regHead.map((row) => (
                                                        <MenuItem value={row.id + ":" + row.RegHead + ":" + row.Driver}>{row.Driver + " : " + row.RegHead}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={1} marginTop={1} marginBottom={1}>
                                    <Grid item xs={1} textAlign="right">
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ขายน้ำมัน</Typography>
                                    </Grid>
                                    <Grid item xs={11} textAlign="right" >
                                        <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                                            <TableContainer
                                                component={Paper}
                                                style={{ height: "40vh" }}
                                                sx={{
                                                    maxWidth: '100%',
                                                    overflowX: 'auto',  // ทำให้สามารถเลื่อนได้ในแนวนอน
                                                }}
                                            >
                                                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                                                    <TableHead>
                                                        <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.error.main }}>
                                                            <TablecellHeader width={60} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ลำดับ
                                                            </TablecellHeader>
                                                            <TablecellHeader width={200} sx={{ textAlign: "center", left: 0, zIndex: 5, backgroundColor: theme.palette.panda.light, borderRight: "1px solid white" }} rowSpan={2}>
                                                                ลูกค้า
                                                            </TablecellHeader>
                                                            <TablecellHeader width={250} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ตั๋ว
                                                            </TablecellHeader>
                                                            <TablecellHeader width={300} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                เลขที่ออเดอร์
                                                            </TablecellHeader>
                                                            <TablecellHeader width={200} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ค่าบรรทุก
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                G95
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                G91
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                B7(D)
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                B95
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                B10
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                B20
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                E20
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                E85
                                                            </TablecellHeader>
                                                            <TablecellHeader width={230} sx={{ textAlign: "center" }}>
                                                                PWD
                                                            </TablecellHeader>
                                                            <TablecellHeader width={180} sx={{ textAlign: "center" }} rowSpan={2} />
                                                        </TableRow>
                                                        <TableRow sx={{ position: "sticky", top: 35, zIndex: 2, backgroundColor: theme.palette.error.main }}>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={1}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4} borderRight={"1px solid white"} paddingRight={2}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </TablecellHeader>
                                                            <TablecellHeader sx={{ textAlign: "center" }} />
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {
                                                            orders === undefined || orders === null ?
                                                                ""
                                                                :
                                                                orders.map((row) => (
                                                                    <SellingDetail key={row.id} detail={row} orders={orders.length} ticketsTrip={ticketsTrip} customers={customers} />
                                                                ))
                                                        }
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <Grid container spacing={1} marginTop={1}>
                                                <Grid item sm={5} xs={12}>
                                                    <Paper
                                                        component="form"
                                                    >
                                                        <Grid container>
                                                            <Grid item sm={1.5} xs={2}>
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
                                                                    onChange={(e) => setCustomers(e.target.value)}
                                                                    fullWidth
                                                                >
                                                                    <MenuItem value={"0:0"}>
                                                                        เลือกลูกค้าที่ต้องการเพิ่ม
                                                                    </MenuItem>
                                                                    {
                                                                        combinedOrder.map((row, index) => (
                                                                            codes === "A" ?
                                                                                <MenuItem key={index} value={`${row.type}:${row.Name}`}>
                                                                                    {`${row.type}:${row.Name}`}
                                                                                </MenuItem>
                                                                                : codes === "PS" ?
                                                                                    <MenuItem key={index} value={`${row.type}:${row.Name}`}>
                                                                                        {`${row.type}:${row.Name}`}
                                                                                    </MenuItem>
                                                                                    : codes === "T" ?
                                                                                        <MenuItem key={index} value={`${row.type}:${row.Name}`}>
                                                                                            {`${row.type}:${row.Name}`}
                                                                                        </MenuItem>
                                                                                        : codes === "" ?
                                                                                            <MenuItem key={index} value={`${row.type}:${row.Name}`}>
                                                                                                {`${row.type}:${row.Name}`}
                                                                                            </MenuItem>
                                                                                            : ""
                                                                        ))
                                                                    }
                                                                    {/* {
                                                                        filteredOptions.map((row) => (
                                                                            <MenuItem value={row.Code + ":" + row.Name}>{row.Code + " : " + row.Name}</MenuItem>
                                                                        ))
                                                                    }
                                                                    {filteredOptions.length === 0 && (
                                                                        <MenuItem disabled>No results found</MenuItem>
                                                                    )} */}
                                                                </Select>
                                                            </Grid>
                                                            <Grid item sm={2.5} xs={3} display="flex" alignItems="center" paddingLeft={0.5} paddingRight={0.5}>
                                                                <Button variant="contained" color="info" fullWidth onClick={handleCustomer}>เพิ่มออเดอร์</Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={1} xs={3} marginTop={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ค่าเที่ยว</Typography>
                                                </Grid>
                                                <Grid item sm={2} xs={9}>
                                                    <Paper
                                                        component="form">
                                                        <TextField size="small" fullWidth sx={{ borderRadius: 10 }} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={0.5} xs={3} marginTop={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>คลัง</Typography>
                                                </Grid>
                                                <Grid item sm={3.5} xs={9}>
                                                    <Paper
                                                        component="form">
                                                        <Select
                                                            id="demo-simple-select"
                                                            value={depots}
                                                            size="small"
                                                            sx={{ textAlign: "left" }}
                                                            onChange={(e) => setDepots(e.target.value)}
                                                            fullWidth
                                                        >
                                                            <MenuItem value={0}>
                                                                กรุณาเลือกคลัง
                                                            </MenuItem>
                                                            {
                                                                depot.map((row) => (
                                                                    <MenuItem value={row.Name}>{row.Name}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </Paper>
                                                </Grid>
                                            </Grid></Paper>
                                    </Grid>
                                </Grid>
                            </>
                    }
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handleSubmit} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleCancle} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>

            </Dialog>
        </React.Fragment>

    );
};

export default InsertTrips;
