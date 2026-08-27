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
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import theme from "../../theme/theme";

const SellingDetail = (props) => {
    const { detail, ticketsTrip, orders, customers } = props;
    const [SellingG91, setSellingG91] = React.useState(0);
    const [SellingG95, setSellingG95] = React.useState(0);
    const [SellingB7, setSellingB7] = React.useState(0);
    const [SellingB95, setSellingB95] = React.useState(0);
    const [SellingB10, setSellingB10] = React.useState(0);
    const [SellingB20, setSellingB20] = React.useState(0);
    const [SellingE20, setSellingE20] = React.useState(0);
    const [SellingE85, setSellingE85] = React.useState(0);
    const [SellingPWD, setSellingPWD] = React.useState(0);

    const [VolumeG91, setVolumeG91] = React.useState(0);
    const [VolumeG95, setVolumeG95] = React.useState(0);
    const [VolumeB7, setVolumeB7] = React.useState(0);
    const [VolumeB95, setVolumeB95] = React.useState(0);
    const [VolumeB10, setVolumeB10] = React.useState(0);
    const [VolumeB20, setVolumeB20] = React.useState(0);
    const [VolumeE20, setVolumeE20] = React.useState(0);
    const [VolumeE85, setVolumeE85] = React.useState(0);
    const [VolumePWD, setVolumePWD] = React.useState(0);

    const [orderDetail, setOrderDetail] = React.useState(true);
    const [G91, setG91] = React.useState([]);
    const [G95, setG95] = React.useState([]);
    const [B7, setB7] = React.useState([]);
    const [B95, setB95] = React.useState([]);
    const [B10, setB10] = React.useState([]);
    const [B20, setB20] = React.useState([]);
    const [E20, setE20] = React.useState([]);
    const [E85, setE85] = React.useState([]);
    const [PWD, setPWD] = React.useState([]);
    const [order, setOrder] = React.useState([]);

    const [orderG91, setOrderG91] = React.useState([]);
    const [orderG95, setOrderG95] = React.useState([]);
    const [orderB7, setOrderB7] = React.useState([]);
    const [orderB95, setOrderB95] = React.useState([]);
    const [orderB10, setOrderB10] = React.useState([]);
    const [orderB20, setOrderB20] = React.useState([]);
    const [orderE20, setOrderE20] = React.useState([]);
    const [orderE85, setOrderE85] = React.useState([]);
    const [orderPWD, setOrderPWD] = React.useState([]);

    const [ticketT,setTicketsT] = React.useState(0);
    const [ticketA,setTicketsA] = React.useState(0);
    const [ticketPS,setTicketsPS] = React.useState(0);

    const [ticketNameT,setTicketsNameT] = React.useState(0);
    const [ticketNameA,setTicketsNameA] = React.useState(0);
    const [ticketNamePS,setTicketsNamePS] = React.useState(0);

    const getData = async () => {
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/").on("value", (snapshot) => {
            const datas = snapshot.val();
            for (let ticket in datas) {
                if (datas[ticket].TicketName === customers && customers.split(":")[0] === "T") {
                    setTicketsT(datas[ticket].id - 1);
                    setTicketsNameT(customers);
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setG91(datas);
                        setVolumeG91(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setG95(datas);
                        setVolumeG95(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB7(datas);
                        setVolumeB7(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB95(datas);
                        setVolumeB95(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B10").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB10(datas);
                        setVolumeB10(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB20(datas);
                        setVolumeB20(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setE20(datas);
                        setVolumeE20(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E85").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setE85(datas);
                        setVolumeE85(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setPWD(datas);
                        setVolumePWD(datas.Volume)
                    });
                }
                else if (datas[ticket].TicketName.split(":")[0] === "PS" && customers.split(":")[0] === "PS") {
                    setTicketsPS(datas[ticket].id - 1);
                    setTicketsNamePS(datas[ticket].TicketName);
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setG91(datas);
                        setVolumeG91(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setG95(datas);
                        setVolumeG95(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB7(datas);
                        setVolumeB7(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB95(datas);
                        setVolumeB95(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B10").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB10(datas);
                        setVolumeB10(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB20(datas);
                        setVolumeB20(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setE20(datas);
                        setVolumeE20(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E85").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setE85(datas);
                        setVolumeE85(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setPWD(datas);
                        setVolumePWD(datas.Volume)
                    });
                } else if (datas[ticket].TicketName.split(":")[0] === "A" && customers.split(":")[0] === "A") {
                    setTicketsA(datas[ticket].id - 1);
                    setTicketsNameA(datas[ticket].TicketName);
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setG91(datas);
                        setVolumeG91(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setG95(datas);
                        setVolumeG95(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB7(datas);
                        setVolumeB7(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB95(datas);
                        setVolumeB95(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B10").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB10(datas);
                        setVolumeB10(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setB20(datas);
                        setVolumeB20(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setE20(datas);
                        setVolumeE20(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E85").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setE85(datas);
                        setVolumeE85(datas.Volume)
                    });
                    database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setPWD(datas);
                        setVolumePWD(datas.Volume)
                    });
                } else {

                }

            }
        });
        // database.ref("/order").on("value", (snapshot) => {
        //             const datas = snapshot.val();
        //             const dataOrder = [];
        //             for (let id in datas) {
        //                 datas[id].Trip === trips ?
        //                 dataOrder.push({ id, ...datas[id] })
        //                 : ""
        //             }
        //             setOrder(dataOrder);
        //         });
    };

    const getOrder = async () => {
                    database.ref("order/" + (detail.id - 1) + "/Product/G91").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderG91(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/G95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderG95(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/B7").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderB7(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/B95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderB95(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/B10").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderB10(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/B20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderB20(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/E20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderE20(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/E85").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderE85(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/PWD").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderPWD(datas);
                    });
    };

    useEffect(() => {
        getData();
        getOrder();
    }, []);

    const SubmitOrder = () => {
    //     console.log("PS :"+ticketPS+":"+ticketNamePS);
    // console.log("A :"+ticketA+":"+ticketNameA);
    // console.log("G95 : "+(G95.Volume === "-" ? G95.Volume : (parseFloat(G95.Volume) - parseFloat(VolumeG95))));
    // console.log("G91 : "+(G91.Volume === "-" ? G91.Volume : (parseFloat(G91.Volume) - parseFloat(VolumeG91))));
    const totalG95 = (G95.Volume === "-" ? G95.Volume : (parseFloat(G95.Volume) - parseFloat(VolumeG95)));
    const totalG91 = (G91.Volume === "-" ? G91.Volume : (parseFloat(G91.Volume) - parseFloat(VolumeG91)));
    const totalB7 = (B7.Volume === "-" ? B7.Volume : (parseFloat(B7.Volume) - parseFloat(VolumeB7)));
    const totalB95 = (B95.Volume === "-" ? B95.Volume : (parseFloat(B95.Volume) - parseFloat(VolumeB95)));
    const totalB10 = (B10.Volume === "-" ? B10.Volume : (parseFloat(B10.Volume) - parseFloat(VolumeB10)));
    const totalB20 = (B20.Volume === "-" ? B20.Volume : (parseFloat(B20.Volume) - parseFloat(VolumeB20)));
    const totalE20 = (E20.Volume === "-" ? E20.Volume : (parseFloat(E20.Volume) - parseFloat(VolumeE20)));
    const totalE85 = (E85.Volume === "-" ? E85.Volume : (parseFloat(E85.Volume) - parseFloat(VolumeE85)));
    const totalPWD = (PWD.Volume === "-" ? PWD.Volume : (parseFloat(PWD.Volume) - parseFloat(VolumePWD)));

        database
            .ref("trip/")
            .child((detail.Trip))
            .update({
                [`Order${orders}`]: detail.id + ":" + detail.TicketName,
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
            database
            .ref("order/")
            .child((detail.id - 1))
            .update({
                TicketName: detail.TicketName.split(":")[0] === "PS" ? ticketNamePS : detail.TicketName.split(":")[0] === "A" ? ticketNameA : ticketNameT
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/G91")
            .update({
                Cost: G91.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? G91.Volume : VolumeG91,
                Selling: G91.Volume === 0 || G91.Volume === "-" ? "-" : SellingG91
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/G91")
                    .update({
                        Volume: totalG91,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/G91")
                    .update({
                        Volume: totalG91,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName === customers && detail.TicketName.split(":")[0] === "T"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketT)
                    .child("/Product/G91")
                    .update({
                        Volume: totalG91,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/G95")
            .update({
                Cost: G95.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? G95.Volume : VolumeG95,
                Selling: G95.Volume === 0 || G95.Volume === "-" ? "-" : SellingG95
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/G95")
                    .update({
                        Volume: totalG95,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/G95")
                    .update({
                        Volume: totalG95,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/B7")
            .update({
                Cost: B7.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? B7.Volume : VolumeB7,
                Selling: B7.Volume === 0 || B7.Volume === "-" ? "-" : SellingB7
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/B7")
                    .update({
                        Volume: totalB7
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/B7")
                    .update({
                        Volume: totalB7
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/B95")
            .update({
                Cost: B95.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? B95.Volume : VolumeB95,
                Selling: B95.Volume === 0 || B95.Volume === "-" ? "-" : SellingB95
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/B95")
                    .update({
                        Volume: totalB95,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/B95")
                    .update({
                        Volume: totalB95,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/B10")
            .update({
                Cost: B10.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? B10.Volume : VolumeB10,
                Selling: B10.Volume === 0 || B10.Volume === "-" ? "-" : SellingB10
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/B10")
                    .update({
                        Volume: totalB10,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/B10")
                    .update({
                        Volume: totalB10,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/B20")
            .update({
                Cost: B20.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? B20.Volume : VolumeB20,
                Selling: B20.Volume === 0 || B20.Volume === "-" ? "-" : SellingB20
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/B20")
                    .update({
                        Volume: totalB20,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/B20")
                    .update({
                        Volume: totalB20,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/E20")
            .update({
                Cost: E20.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? E20.Volume : VolumeE20,
                Selling: E20.Volume === 0 || E20.Volume === "-" ? "-" : SellingE20
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/E20")
                    .update({
                        Volume: totalE20,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/E20")
                    .update({
                        Volume: totalE20,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/E85")
            .update({
                Cost: E85.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? E85.Volume : VolumeE85,
                Selling: E85.Volume === 0 || E85.Volume === "-" ? "-" : SellingE85
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/E85")
                    .update({
                        Volume: totalE85,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/E85")
                    .update({
                        Volume: totalE85,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/PWD")
            .update({
                Cost: PWD.Cost,
                Volume: detail.TicketName.split(":")[0] === "T" ? PWD.Volume : VolumePWD,
                Selling: PWD.Volume === 0 || PWD.Volume === "-" ? "-" : SellingPWD
            })
            .then(() => {
                if (detail.TicketName.split(":")[0] === "PS") {
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                    .child("/Product/PWD")
                    .update({
                        Volume: totalPWD,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else if(detail.TicketName.split(":")[0] === "A"){
                    database
                    .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                    .child("/Product/PWD")
                    .update({
                        Volume: totalPWD,
                    })
                    .then(() => {
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        console.error("Error pushing data:", error);
                    });
                }else{

                }
                console.log("Data pushed successfully");
                ShowSuccess("เพิ่มข้อมูลเรียบร้อย")
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
                ShowError(error);
            });

        setOrderDetail(false);
    }

    return (
        <React.Fragment>
            <TableRow>
                <TablecellHeader sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.id}</Typography>
                </TablecellHeader>
                <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.light }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.Customer}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center", position: "sticky", left: 20, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.light }}>
                    {
                        orderDetail ?
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            {
                                customers.split(":")[0] === "PS" ? ticketNamePS
                                : customers.split(":")[0] === "A" ? ticketNameA 
                                : ticketNameT
                            }
                            </Typography>
                            :
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.TicketName}</Typography>
                        }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.OrderId}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.Rate}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                G95.Volume === "-" || G95.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingG95}
                                                            onChange={(e) => setSellingG95(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    G95.Volume === "-" || G95.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingG95}
                                                                onChange={(e) => setSellingG95(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    G95.Volume === "-" || G95.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeG95}
                                                                onChange={(e) => setVolumeG95(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                G91.Volume === "-" || G91.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingG91}
                                                            onChange={(e) => setSellingG91(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    G91.Volume === "-" || G91.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingG91}
                                                                onChange={(e) => setSellingG91(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    G91.Volume === "-" || G91.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeG91}
                                                                onChange={(e) => setVolumeG91(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                B7.Volume === "-" || B7.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingB7}
                                                            onChange={(e) => setSellingB7(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    B7.Volume === "-" || B7.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingB7}
                                                                onChange={(e) => setSellingB7(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    B7.Volume === "-" || B7.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeB7}
                                                                onChange={(e) => setVolumeB7(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                B95.Volume === "-" || B95.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingB95}
                                                            onChange={(e) => setSellingB95(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    B95.Volume === "-" || B95.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingB95}
                                                                onChange={(e) => setSellingB95(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    B95.Volume === "-" || B95.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeB95}
                                                                onChange={(e) => setVolumeB95(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B10.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                B10.Volume === "-" || B10.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingB10}
                                                            onChange={(e) => setSellingB10(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B10.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B10.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB10.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB10.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB10.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B10.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    B10.Volume === "-" || B10.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingB10}
                                                                onChange={(e) => setSellingB10(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    B10.Volume === "-" || B10.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeB10}
                                                                onChange={(e) => setVolumeB10(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB10.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB10.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB10.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B20.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                B20.Volume === "-" || B20.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingB20}
                                                            onChange={(e) => setSellingB20(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B20.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B20.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB20.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB20.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB20.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B20.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    B20.Volume === "-" || B20.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingB20}
                                                                onChange={(e) => setSellingB20(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    B20.Volume === "-" || B20.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeB20}
                                                                onChange={(e) => setVolumeB20(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB20.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB20.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB20.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                E20.Volume === "-" || E20.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingE20}
                                                            onChange={(e) => setSellingE20(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    E20.Volume === "-" || E20.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingE20}
                                                                onChange={(e) => setSellingE20(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    E20.Volume === "-" || E20.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeE20}
                                                                onChange={(e) => setVolumeE20(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E85.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                E85.Volume === "-" || E85.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingE85}
                                                            onChange={(e) => setSellingE85(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E85.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E85.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE85.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE85.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE85.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E85.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    E85.Volume === "-" || E85.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingE85}
                                                                onChange={(e) => setSellingE85(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    E85.Volume === "-" || E85.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumeE85}
                                                                onChange={(e) => setVolumeE85(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE85.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE85.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE85.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                {
                        detail.TicketName.split(":")[0] === "T" ?
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                    <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>

                                            {
                                                PWD.Volume === "-" || PWD.Volume === 0 ?
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                    :
                                                    <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                        <TextField size="small" fullWidth label="ขาย"
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
                                                            value={SellingPWD}
                                                            onChange={(e) => setSellingPWD(e.target.value)}
                                                        />
                                                    </Paper>
                                            }

                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Volume}</Typography>
                                        </Grid>
                                    </>
                                        :
                                        <>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Cost}</Typography>
                                        </Grid>
                                        <Grid item xs={4} paddingRight={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Selling}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Volume}</Typography>
                                        </Grid>
                                        </>
                                }
                            </Grid>
                            :
                            <Grid container spacing={1}>
                                {
                                    orderDetail ?
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                {
                                                    PWD.Volume === "-" || PWD.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ขาย"
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
                                                                value={SellingPWD}
                                                                onChange={(e) => setSellingPWD(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                            <Grid item xs={4}>
                                                {
                                                    PWD.Volume === "-" || PWD.Volume === 0 ?
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                                        :
                                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                                value={VolumePWD}
                                                                onChange={(e) => setVolumePWD(e.target.value)}
                                                            />
                                                        </Paper>
                                                }
                                            </Grid>
                                        </>
                                        :
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Cost}</Typography>
                                            </Grid>
                                            <Grid item xs={4} paddingRight={1}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Selling}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Volume}</Typography>
                                            </Grid>
                                        </>
                                }
                            </Grid>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }} >
                    {
                        orderDetail ?
                            <>
                                <Button variant="contained" color="error" size="small" sx={{ width: 30, marginRight: 1 }}>ยกเลิก</Button>
                                <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button>
                            </>
                            :
                            <Button variant="contained" color="warning" size="small" sx={{ width: 30 }}>แก้ไข</Button>
                    }
                </TableCell>
            </TableRow>
        </React.Fragment>

    );
};

export default SellingDetail;
