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
import { IconButtonError, RateOils, TableCellB20, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import theme from "../../theme/theme";

const SellingDetail = (props) => {
    const {
        detail,
        ticketsTrip,
        orders,
        onSendBack,
        onDelete,
        onAddProduct,
        onUpdateOrder,
        editMode,
        depots
    } = props;

    const [orderG91, setOrderG91] = React.useState([]);
    const [orderG95, setOrderG95] = React.useState([]);
    const [orderB7, setOrderB7] = React.useState([]);
    const [orderB95, setOrderB95] = React.useState([]);
    const [orderE20, setOrderE20] = React.useState([]);
    const [orderPWD, setOrderPWD] = React.useState([]);
    const [orderB20, setOrderB20] = React.useState([]);

    // const getData = async () => {
    //     database.ref("tickets/" + ticketsTrip + "/ticketOrder/").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         for (let ticket in datas) {
    //             if (datas[ticket].TicketName === customers && customers.split(":")[0] === "T") {
    //                 setTicketsT(datas[ticket].id - 1);
    //                 setTicketsNameT(customers);
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG91(datas);
    //                     setVolumeG91(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG95(datas);
    //                     setVolumeG95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB7(datas);
    //                     setVolumeB7(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB95(datas);
    //                     setVolumeB95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setE20(datas);
    //                     setVolumeE20(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setPWD(datas);
    //                     setVolumePWD(datas.Volume)
    //                 });
    //             }
    //             else if (datas[ticket].TicketName.split(":")[0] === "PS" && customers.split(":")[0] === "PS") {
    //                 setTicketsPS(datas[ticket].id - 1);
    //                 setTicketsNamePS(datas[ticket].TicketName);
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG91(datas);
    //                     setVolumeG91(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG95(datas);
    //                     setVolumeG95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB7(datas);
    //                     setVolumeB7(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB95(datas);
    //                     setVolumeB95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setE20(datas);
    //                     setVolumeE20(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setPWD(datas);
    //                     setVolumePWD(datas.Volume)
    //                 });
    //             } else if (datas[ticket].TicketName.split(":")[0] === "A" && customers.split(":")[0] === "A") {
    //                 setTicketsA(datas[ticket].id - 1);
    //                 setTicketsNameA(datas[ticket].TicketName);
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG91(datas);
    //                     setVolumeG91(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG95(datas);
    //                     setVolumeG95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB7(datas);
    //                     setVolumeB7(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB95(datas);
    //                     setVolumeB95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setE20(datas);
    //                     setVolumeE20(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setPWD(datas);
    //                     setVolumePWD(datas.Volume)
    //                 });
    //             } else {

    //             }

    //         }
    //     });
    //     // database.ref("/order").on("value", (snapshot) => {
    //     //             const datas = snapshot.val();
    //     //             const dataOrder = [];
    //     //             for (let id in datas) {
    //     //                 datas[id].Trip === trips ?
    //     //                 dataOrder.push({ id, ...datas[id] })
    //     //                 : ""
    //     //             }
    //     //             setOrder(dataOrder);
    //     //         });
    // };

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
        database.ref("order/" + (detail.id - 1) + "/Product/E20").on("value", (snapshot) => {
            const datas = snapshot.val();
            setOrderE20(datas);
        });
        database.ref("order/" + (detail.id - 1) + "/Product/PWD").on("value", (snapshot) => {
            const datas = snapshot.val();
            setOrderPWD(datas);
        });
        database.ref("order/" + (detail.id - 1) + "/Product/B20").on("value", (snapshot) => {
            const datas = snapshot.val();
            setOrderB20(datas);
        });
    };

    useEffect(() => {
        // getData();
        getOrder();

    }, []);

    console.log("Depot : ", depots);

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 50, padding: "1px 4px", backgroundColor: theme.palette.info.main, color: "white" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.id + 1}</Typography>
                </TableCell>
                {/* <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.light }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[0]+detail.TicketName.split(":")[1]}</Typography>
                </TableCell> */}
                <TableCell sx={{ textAlign: "center", height: "20px", width: 350, padding: "1px 4px" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                        {
                            // (() => {
                            //     const branches = [
                            //         "( สาขาที่  00001)/",
                            //         "( สาขาที่  00002)/",
                            //         "( สาขาที่  00003)/",
                            //         "(สำนักงานใหญ่)/"
                            //     ];

                            //     for (const branch of branches) {
                            //         if (detail.TicketName.includes(branch)) {
                            //             return detail.TicketName.split(branch)[1];
                            //         }
                            //     }

                            //     return detail.TicketName;
                            // })()
                            detail.TicketNameName
                        }
                    </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 100, padding: "1px 4px" }}>
                    {
                        editMode ?
                            (
                                depots.split(":")[1] === "ลำปาง" ?
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
                                            type="number"
                                            inputProps={{
                                                step: 0.01,   // ✅ เพิ่มลดทีละ 0.01
                                                min: 0        // (ถ้าไม่อยากให้ติดลบ ใส่เพิ่มได้)
                                            }}
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
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    paddingLeft: 2
                                                },
                                            }}
                                            value={detail.Rate1 ?? 0.75}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onUpdateOrder("Rate1", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onUpdateOrder("Rate1", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onUpdateOrder("Rate1", 0.75);
                                            }}
                                        />
                                    </Paper>
                                    : depots.split(":")[1] === "พิจิตร" ?
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: 0.01,   // ✅ เพิ่มลดทีละ 0.01
                                                    min: 0        // (ถ้าไม่อยากให้ติดลบ ใส่เพิ่มได้)
                                                }}
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
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                        paddingLeft: 2
                                                    },
                                                }}
                                                value={detail.Rate2 ?? 0.75}
                                                onChange={(e) => {
                                                    let newValue = e.target.value;
                                                    onUpdateOrder("Rate2", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") onUpdateOrder("Rate2", "");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") onUpdateOrder("Rate2", 0.75);
                                                }}
                                            />
                                        </Paper>
                                        :
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: 0.01,   // ✅ เพิ่มลดทีละ 0.01
                                                    min: 0        // (ถ้าไม่อยากให้ติดลบ ใส่เพิ่มได้)
                                                }}
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
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                        paddingLeft: 2
                                                    },
                                                }}
                                                value={detail.Rate3 ?? 0.75}
                                                onChange={(e) => {
                                                    let newValue = e.target.value;
                                                    onUpdateOrder("Rate3", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") onUpdateOrder("Rate3", "");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") onUpdateOrder("Rate3", 0.75);
                                                }}
                                            />
                                        </Paper>
                            )
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Rate || 0.75}</Typography>
                    }
                </TableCell>
                {/* <TableCellG95 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number" 
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
                                            value={detail.Product?.G95?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G95", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G95", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G95", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG95>
                        <TableCellG95 sx={{ textAlign: "center" }}>
                            {       <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.G95?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G95", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G95", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G95", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG95> */}
                <TableCellG95 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.G95?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("G95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("G95", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("G95", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G95?.Volume || "-"}</Typography>
                    }
                </TableCellG95>
                {/* <TableCellG91 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.G91?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G91", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G91", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G91", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG91>
                        <TableCellG91 sx={{ textAlign: "center" }}>
                            {       <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.G91?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G91", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G91", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G91", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG91> */}
                <TableCellB95 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B95?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B95", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B95", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B95?.Volume || "-"}</Typography>
                    }
                </TableCellB95>
                {/* <TableCellB7 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.B7?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B7", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B7", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B7", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB7>
                        <TableCellB7 sx={{ textAlign: "center" , height: "20px"}}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
                                                },
                                            }}
                                                sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '22px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                            value={detail.Product?.B7?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B7", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B7", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B7", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB7> */}
                <TableCellB7 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B7?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B7", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B7", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B7", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B7?.Volume || "-"}</Typography>
                    }
                </TableCellB7>
                {/* <TableCellB95 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.B95?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B95", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B95", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B95", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB95>
                        <TableCellB95 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
                                                },
                                            }}
                                                sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '22px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                            value={detail.Product?.B95?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B95", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B95", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B95", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB95> */}
                <TableCellG91 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.G91?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("G91", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("G91", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("G91", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G91?.Volume || "-"}</Typography>
                    }
                </TableCellG91>
                {/* <TableCellE20 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.E20?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("E20", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("E20", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("E20", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellE20>
                        <TableCellE20 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
                                                },
                                            }}
                                                sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '22px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                            value={detail.Product?.E20?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("E20", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("E20", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("E20", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellE20> */}
                <TableCellE20 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.E20?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("E20", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("E20", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("E20", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.E20?.Volume || "-"}</Typography>
                    }
                </TableCellE20>
                {/* <TableCellPWD sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.PWD?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("PWD", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("PWD", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("PWD", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellPWD>
                        <TableCellPWD sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
                                                },
                                            }}
                                                sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '22px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                            value={detail.Product?.PWD?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("PWD", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("PWD", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("PWD", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellPWD> */}
                <TableCellPWD sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.PWD?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("PWD", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("PWD", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("PWD", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.PWD?.Volume || "-"}</Typography>
                    }
                </TableCellPWD>
                <TableCellB20 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B20?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B20", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B20", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B20", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B20?.Volume || "-"}</Typography>
                    }
                </TableCellB20>
                {/* </>
                    :
                    <>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Volume}</Typography>
                        </TableCell>
                    </>
                } */}
                <TableCell sx={{ textAlign: "center", height: "20px", width: 80 }} >
                    {
                        editMode ?
                            <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }} onClick={onDelete}>ยกเลิก</Button>
                            : ""
                    }

                    {/* <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button> */}
                </TableCell>
            </TableRow>
        </React.Fragment>

    );
};

export default SellingDetail;
