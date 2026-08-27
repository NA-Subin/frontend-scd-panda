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
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const UpdateCreditor = (props) => {
    const { employee } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);
    const [name,setName] = React.useState(employee.Name);
    const [idCard,setIDCard] = React.useState(employee.IDCard);
    const [phone,setPhone] = React.useState(employee.Phone);
    const [credit,setCredit] = React.useState(employee.Credit);
    const [email,setUser] = React.useState(employee.User);
    const [no, setNo] = React.useState(employee.Address.split(",")[0] === undefined ? "-" : employee.Address.split(",")[0]);
    const [village, setVillage] = React.useState(employee.Address.split(",")[1] === undefined ? "-" : employee.Address.split(",")[1]);
    const [subDistrict, setSubDistrict] = React.useState(employee.Address.split(",")[2] === undefined ? "-" : employee.Address.split(",")[2]);
    const [district, setDistrict] = React.useState(employee.Address.split(",")[3] === undefined ? "-" : employee.Address.split(",")[3]);
    const [province, setProvince] = React.useState(employee.Address.split(",")[4] === undefined ? "-" : employee.Address.split(",")[4]);
    const [zipCode, setZipCode] = React.useState(employee.Address.split(",")[5] === undefined ? "-" : employee.Address.split(",")[5]);
    const [lat,setLat] = React.useState(employee.lat);
    const [lng,setLng] = React.useState(employee.lng);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUpdate = () => {
        database
            .ref("/employee/creditors/")
            .child(employee.id - 1)
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
                lat: lat,
                lng: lng,
                IDCard: idCard,
                Credit: credit,
                User: email,
                Phone: phone
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
                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpen(employee.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell>
            <Dialog
                open={open === employee.id ? true : false}
                keepMounted
                onClose={handleClose}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดรถทะเบียน{employee.id}</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
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
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อ-สกุล</Typography>
                            </Grid>
                            <Grid item xs={4.5}>
                                <TextField fullWidth variant="standard" value={name} disabled={update ? true : false} onChange={(e) => setName(e.target.value)}/>
                            </Grid>
                            <Grid item xs={2.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เลขประจำตัวผู้เสียภาษี</Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <TextField fullWidth variant="standard" value={idCard} disabled={update ? true : false} onChange={(e) => setIDCard(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เบอร์โทร</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={phone} disabled={update ? true : false} onChange={(e) => setPhone(e.target.value)}/>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" type="number" fontWeight="bold" textAlign="center" gutterBottom>ระยะเครดิต</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <TextField fullWidth variant="standard" value={credit} disabled={update ? true : false} onChange={(e) => setCredit(e.target.value)}/>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>User</Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                {
                                    update ?
                                    <TextField fullWidth variant="standard" value={email} disabled onChange={(e) => setUser(e.target.value)}/>
                                    :
                                    <TextField fullWidth variant="standard" value={email} onChange={(e) => setUser(e.target.value)}/>
                                    // <FormControl variant="standard" fullWidth>
                                    //         <Select
                                    //             labelId="demo-simple-select-standard-label"
                                    //             id="demo-simple-select-standard"
                                    //             value={type}
                                    //             onChange={(e) => setType(e.target.value)}
                                    //         >
                                    //             <MenuItem value={"เจ้าหนี้ขนส่ง"}>เจ้าหนี้ขนส่ง</MenuItem>
                                    //             <MenuItem value={"เจ้าหนี้น้ำมัน"}>เจ้าหนี้น้ำมัน</MenuItem>
                                    //         </Select>
                                    //     </FormControl>
                                }
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
                                <TextField fullWidth type="number" variant="standard" value={lat} disabled={update ? true : false} onChange={(e) => setLat(e.target.value)}/>
                            </Grid>
                            <Grid item xs={2.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>Longitude(ลองจิจูด)</Typography>
                            </Grid>
                            <Grid item xs={3.5}>
                                <TextField fullWidth type="number" variant="standard" value={lng} disabled={update ? true : false} onChange={(e) => setLng(e.target.value)}/>
                            </Grid>
                        </Grid>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        update ?
                            <>
                                <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                                <Button variant="contained" color="warning" onClick={() => setUpdate(false)} >แก้ไข</Button>
                            </>
                            :
                            <>
                                <Button variant="contained" color="error" onClick={() => setUpdate(true)}>ยกเลิก</Button>
                                <Button variant="contained" color="success" onClick={handleUpdate} >บันทึก</Button>
                            </>
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateCreditor;
