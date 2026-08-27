import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Popover,
    Select,
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
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import "dayjs/locale/th";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const UpdateCustomer = (props) => {
    const { customer } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);

    const [name, setName] = React.useState(customer.Name);
    const [no, setNo] = React.useState(customer.Address.split(",")[0] === undefined ? "-" : customer.Address.split(",")[0]);
    const [village, setVillage] = React.useState(customer.Address.split(",")[1] === undefined ? "-" : customer.Address.split(",")[1]);
    const [subDistrict, setSubDistrict] = React.useState(customer.Address.split(",")[2] === undefined ? "-" : customer.Address.split(",")[2]);
    const [district, setDistrict] = React.useState(customer.Address.split(",")[3] === undefined ? "-" : customer.Address.split(",")[3]);
    const [province, setProvince] = React.useState(customer.Address.split(",")[4] === undefined ? "-" : customer.Address.split(",")[4]);
    const [zipCode, setZipCode] = React.useState(customer.Address.split(",")[5] === undefined ? "-" : customer.Address.split(",")[5]);
    const [credit, setCredit] = React.useState(customer.Credit);
    const [creditTime, setCreditTime] = React.useState(customer.CreditTime);
    const [idCard,setIDCard] = React.useState(customer.IdCard);
    const [debt, setDebt] = React.useState(customer.Debt);
    const [lat, setLat] = React.useState(customer.Lat);
    const [lng, setLng] = React.useState(customer.Lng);
    const [phone,setPhone] = React.useState(customer.Phone);

    const getRegitration = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegistration = [];
            for (let id in datas) {
                if(datas[id].Driver === "ไม่มี"){
                    dataRegistration.push({ id, ...datas[id] })
                }
            }
            
        });
    };

    useEffect(() => {
        getRegitration();
    }, []);

    const handleUpdate = () => {
        database
            .ref("/customer")
            .child(customer.id - 1)
            .update({
                Name: name,
                Address: 
                (no === "-" ? "-" : no)+
                (village === "-" ? "" : ","+village)+
                (subDistrict === "-" ? "" : ","+subDistrict)+
                (district === "-" ? "" : ","+district)+
                (province === "-" ? "" : ","+province)+
                (zipCode === "-" ? "" : ","+zipCode)
                ,
                IdCard: idCard,
                Credit: credit,
                CreditTime: creditTime,
                Debt: debt,
                Phone: phone,
                Lat: lat,
                Lng: lng
            })
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setUpdate(true)
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }


    return (
        <React.Fragment>
            <TableCell sx={{ textAlign: "center" }}>
                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpen(customer.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell>
            <Dialog
                open={open === customer.id ? true : false}
                keepMounted
                onClose={() => setOpen(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "800px", // กำหนดความกว้างแบบ Fixed
                        maxWidth: "none", // ปิดการปรับอัตโนมัติ
                    },
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดลูกค้าชื่อ{ name }</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={() => setOpen(false)}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Paper
                        sx={{ p: 2, border: "1px solid" + theme.palette.grey[600], marginTop: 2, marginBottom: 2 }}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={2.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อสถานที่/ชื่อลูกค้า</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth variant="standard" value={name} disabled={update ? true : false} onChange={(e) => setName(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เบอร์โทร</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={phone} disabled={update ? true : false} onChange={(e) => setPhone(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>บ้านเลขที่</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={no} disabled={update ? true : false} onChange={(e) => setNo(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>หมู่ที่</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={village} disabled={update ? true : false} onChange={(e) => setVillage(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ตำบล</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={subDistrict} disabled={update ? true : false} onChange={(e) => setSubDistrict(e.target.value)}/>
                            </Grid>

                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold"gutterBottom>อำเภอ</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={district} disabled={update ? true : false} onChange={(e) => setDistrict(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>จังหวัด</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={province} disabled={update ? true : false} onChange={(e) => setProvince(e.target.value)}/>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รหัสไปรษณีย์</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={zipCode} disabled={update ? true : false} onChange={(e) => setZipCode(e.target.value)}/>
                            </Grid>
                            <Grid item xs={2.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Latitude(ละติจูด)</Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <TextField fullWidth variant="standard" value={lat} disabled={update ? true : false} onChange={(e) => setLat(e.target.value)}/>
                            </Grid>
                            <Grid item xs={2.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>Longitude(ลองจิจูด)</Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <TextField fullWidth variant="standard" value={lng} disabled={update ? true : false} onChange={(e) => setLng(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>วงเงินเครดิต</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={credit} disabled={update ? true : false} onChange={(e) => setCredit(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ระยะเครดิต</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={creditTime} disabled={update ? true : false} onChange={(e) => setCreditTime(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>หนี้สิน</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={debt} disabled={update ? true : false} onChange={(e) => setDebt(e.target.value)}/>
                            </Grid>
                        </Grid>
                        </Paper>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        update ? 
                        <>
                        <Button onClick={() => setOpen(false)} variant="contained" color="error">ยกเลิก</Button>
                        <Button onClick={() => setUpdate(false)} variant="contained" color="warning">แก้ไข</Button>
                        </>
                        : 
                        <>
                        <Button onClick={() => setUpdate(true)} variant="contained" color="error">ยกเลิก</Button>
                        <Button onClick={handleUpdate} variant="contained" color="success">บันทึก</Button>
                        </>
                        
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateCustomer;
