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

const OrderDetail = (props) => {
    const { detail, ticketsTrip, onSendBack, total } = props;
    const [CostG91, setCostG91] = React.useState(0);
    const [VolumeG91, setVolumeG91] = React.useState(0);
    const [CostG95, setCostG95] = React.useState(0);
    const [VolumeG95, setVolumeG95] = React.useState(0);
    const [CostB7, setCostB7] = React.useState(0);
    const [VolumeB7, setVolumeB7] = React.useState(0);
    const [CostB95, setCostB95] = React.useState(0);
    const [VolumeB95, setVolumeB95] = React.useState(0);
    const [CostB10, setCostB10] = React.useState(0);
    const [VolumeB10, setVolumeB10] = React.useState(0);
    const [CostB20, setCostB20] = React.useState(0);
    const [VolumeB20, setVolumeB20] = React.useState(0);
    const [CostE20, setCostE20] = React.useState(0);
    const [VolumeE20, setVolumeE20] = React.useState(0);
    const [CostE85, setCostE85] = React.useState(0);
    const [VolumeE85, setVolumeE85] = React.useState(0);
    const [CostPWD, setCostPWD] = React.useState(0);
    const [VolumePWD, setVolumePWD] = React.useState(0);
    const [orderDetail, setOrderDetail] = React.useState(true);
    const [rate, setRate] = React.useState(detail.Rate);
    const [G91, setG91] = React.useState([]);
    const [G95, setG95] = React.useState([]);
    const [B7, setB7] = React.useState([]);
    const [B95, setB95] = React.useState([]);
    const [B10, setB10] = React.useState([]);
    const [B20, setB20] = React.useState([]);
    const [E20, setE20] = React.useState([]);
    const [E85, setE85] = React.useState([]);
    const [PWD, setPWD] = React.useState([]);
    const [weightOil, setWeightOil] = React.useState(0);
    const [orderID,setOrderID] = React.useState("");

    const getData = async () => {
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/G91").on("value", (snapshot) => {
            const datas = snapshot.val();
            setG91(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/G95").on("value", (snapshot) => {
            const datas = snapshot.val();
            setG95(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/B7").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB7(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/B95").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB95(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/B10").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB10(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/B20").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB20(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/E20").on("value", (snapshot) => {
            const datas = snapshot.val();
            setE20(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/E85").on("value", (snapshot) => {
            const datas = snapshot.val();
            setE85(datas);
        });
        database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/PWD").on("value", (snapshot) => {
            const datas = snapshot.val();
            setPWD(datas);
        });
    };

    useEffect(() => {
        getData();
    }, []);

    const handleTotalWeight = (newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeB10, newVolumeB20, newVolumeE20, newVolumeE85, newVolumePWD) => {

        const total = newVolumeG91 + newVolumeG95 + newVolumeB7 + newVolumeB95 + newVolumeB10 + newVolumeB20 + newVolumeE20 + newVolumeE85 + newVolumePWD;
        // parseFloat(newVolumeG91 || 0) +
        // parseFloat(newVolumeG95 || 0) +
        // parseFloat(newVolumeB7 || 0) +
        // parseFloat(newVolumeB95 || 0) +
        // parseFloat(newVolumeB10 || 0) +
        // parseFloat(newVolumeB20 || 0) +
        // parseFloat(newVolumeE20 || 0) +
        // parseFloat(newVolumeE85 || 0) +
        // parseFloat(newVolumePWD || 0);

        if (onSendBack) {
            onSendBack(total); // เรียกฟังก์ชันที่ส่งมาจาก Page 1
        }
    };

    const SubmitOrder = () => {
        database
            .ref("tickets/")
            .child(ticketsTrip)
            .update({
                Rate: rate,
                OrderID: orderID
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/G91")
            .update({
                Cost: CostG91 === 0 ? "-" : CostG91,
                Volume: VolumeG91 === 0 ? "-" : VolumeG91
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/G95")
            .update({
                Cost: CostG95 === 0 ? "-" : CostG95,
                Volume: VolumeG95 === 0 ? "-" : VolumeG95
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/B7")
            .update({
                Cost: CostB7 === 0 ? "-" : CostB7,
                Volume: VolumeB7 === 0 ? "-" : VolumeB7
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/B95")
            .update({
                Cost: CostB95 === 0 ? "-" : CostB95,
                Volume: VolumeB95 === 0 ? "-" : VolumeB95
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/B10")
            .update({
                Cost: CostB10 === 0 ? "-" : CostB10,
                Volume: VolumeB10 === 0 ? "-" : VolumeB10
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/B20")
            .update({
                Cost: CostB20 === 0 ? "-" : CostB20,
                Volume: VolumeB20 === 0 ? "-" : VolumeB20
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/E20")
            .update({
                Cost: CostE20 === 0 ? "-" : CostE20,
                Volume: VolumeE20 === 0 ? "-" : VolumeE20
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/E85")
            .update({
                Cost: CostE85 === 0 ? "-" : CostE85,
                Volume: VolumeE85 === 0 ? "-" : VolumeE85
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
            .child("/Product/PWD")
            .update({
                Cost: CostPWD === 0 ? "-" : CostPWD,
                Volume: VolumePWD === 0 ? "-" : VolumePWD
            })
            .then(() => {
                console.log("Data pushed successfully");
                ShowSuccess("เพิ่มข้อมูลเรียบร้อย")
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
                ShowError(error);
            });
        database.ref("/products").on("value", (snapshot) => {
            const datas = snapshot.val();
            let G95 = 0;
            let G91 = 0;
            let B7 = 0;
            let B95 = 0;
            let B10 = 0;
            let B20 = 0;
            let E20 = 0;
            let E85 = 0;
            let PWD = 0;

            for (let id in datas) {
                switch (datas[id].Product_name) {
                    case "G95":
                        G95 = (VolumeG95 * datas[id].SG) * 1000;
                        break;
                    case "G91":
                        G91 = (VolumeG91 * datas[id].SG) * 1000;
                        break;
                    case "B7":
                        B7 = (VolumeB7 * datas[id].SG) * 1000;
                        break;
                    case "B95":
                        B95 = (VolumeB95 * datas[id].SG) * 1000;
                        break;
                    case "B10":
                        B10 = (VolumeB10 * datas[id].SG) * 1000;
                        break;
                    case "B20":
                        B20 = (VolumeB20 * datas[id].SG) * 1000;
                        break;
                    case "E20":
                        E20 = (VolumeE20 * datas[id].SG) * 1000;
                        break;
                    case "E85":
                        E85 = (VolumeE85 * datas[id].SG) * 1000;
                        break;
                    case "PWD":
                        PWD = (VolumePWD * datas[id].SG) * 1000;
                        break;
                    default:
                        break;
                }
            }
            handleTotalWeight(G91, G95, B7, B95, B10, B20, E20, E85, PWD);
        });
        setOrderDetail(false);
    }

    return (
        <React.Fragment>
            <TableRow>
                <TablecellHeader sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.id}</Typography>
                </TablecellHeader>
                <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.light}}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[0]}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[1]}</Typography>
                </TableCell>
                {
                    orderDetail ?
                        <>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth label="เลขที่ออเดอร์"
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
                                        value={orderID}
                                        onChange={(e) => setOrderID(e.target.value)}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth label="ค่าบรรทุก"
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
                                        value={rate}
                                        onChange={(e) => setRate(e.target.value)}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostG95}
                                                onChange={(e) => setCostG95(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeG95}
                                                onChange={(e) => setVolumeG95(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostG91}
                                                onChange={(e) => setCostG91(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeG91}
                                                onChange={(e) => setVolumeG91(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostB7}
                                                onChange={(e) => setCostB7(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeB7}
                                                onChange={(e) => setVolumeB7(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostB95}
                                                onChange={(e) => setCostB95(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeB95}
                                                onChange={(e) => setVolumeB95(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostB10}
                                                onChange={(e) => setCostB10(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeB10}
                                                onChange={(e) => setVolumeB10(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostB20}
                                                onChange={(e) => setCostB20(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeB20}
                                                onChange={(e) => setVolumeB20(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostE20}
                                                onChange={(e) => setCostE20(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeE20}
                                                onChange={(e) => setVolumeE20(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostE85}
                                                onChange={(e) => setCostE85(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumeE85}
                                                onChange={(e) => setVolumeE85(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} paddingRight={1}>
                                        <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ต้นทุน"
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
                                                value={CostPWD}
                                                onChange={(e) => setCostPWD(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper component="form" sx={{ marginRight: -1 }}>
                                            <TextField size="small" fullWidth label="ปริมาณ"
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
                                                value={VolumePWD}
                                                onChange={(e) => setVolumePWD(e.target.value)}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }} >
                                <Button variant="contained" color="error" size="small" sx={{ width: 30, marginRight: 1 }}>ยกเลิก</Button>
                                <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button>
                            </TableCell>
                        </>
                        :
                        <>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderID}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{rate}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B10.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B10.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B20.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B20.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E85.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E85.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Cost}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Volume}</Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }} >
                                <Button variant="contained" color="warning" size="small" sx={{ width: 30 }}>แก้ไข</Button>
                            </TableCell>
                        </>
                }
            </TableRow>
        </React.Fragment>

    );
};

export default OrderDetail;
