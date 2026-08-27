import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { auth, database } from "../../server/firebase";

const InsertCreditor = (props) => {
    const { creditor } = props;
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [prefix, setPrefix] = React.useState(0);
    const [name, setName] = React.useState('');
    const [lastname, setLastname] = React.useState('');
    const [idCard, setIDCard] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [creditTime, setCreditTime] = React.useState("");
    const [user, setUser] = React.useState("");
    const [lat,setLat] = React.useState("");
    const [lng,setLng] = React.useState("");

    const [position, setPosition] = React.useState("");
    const [phone, setPhone] = React.useState("");

    console.log("creditor : ", creditor);

    const handlePost = () => {
        database
            .ref("employee/creditors/")
            .child(creditor)
            .update({
                id: creditor + 1,
                Name: prefix + name + " " + lastname,
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
                Credit: creditTime,
                User: user,
                Password: "1234567",
                IDCard: idCard,
                Phone: phone
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <Button variant="contained" color="info" onClick={handleClickOpen} endIcon={<PersonAddIcon />} >เพิ่มเจ้าหนี้น้ำมัน</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มพนักงาน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2} marginBottom={2}>
                        <Grid item sm={2.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>คำนำหน้าชื่อ</Typography>
                        </Grid>
                        <Grid item sm={2} xs={9}>
                            <Paper
                                component="form">
                                <Select
                                    id="demo-simple-select"
                                    value={prefix}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกคำนำหน้า
                                    </MenuItem>
                                    <MenuItem value={"นาย"}>นาย</MenuItem>
                                    <MenuItem value={"นาง"}>นาง</MenuItem>
                                    <MenuItem value={"นางสาว"}>นางสาว</MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อ</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item sm={0.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>สกุล</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={lastname} onChange={(e) => setLastname(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item sm={2.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขประจำตัวผู้เสียภาษี</Typography>
                        </Grid>
                        <Grid item sm={3.5} xs={9}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={idCard} onChange={(e) => setIDCard(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item sm={2} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>User</Typography>
                        </Grid>
                        <Grid item sm={4} xs={9}>
                            <Paper
                                component="form">
                                    <TextField size="small" fullWidth value={user} onChange={(e) => setUser(e.target.value)} />
                                {/* <Select
                                    id="demo-simple-select"
                                    value={creditorType}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setCreditorType(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกประเภทเจ้าหนี้
                                    </MenuItem>
                                    <MenuItem value={"เจ้าหนี้ขนส่ง"}>เจ้าหนี้ขนส่ง</MenuItem>
                                    <MenuItem value={"เจ้าหนี้น้ำมัน"}>เจ้าหนี้น้ำมัน</MenuItem>
                                </Select> */}
                            </Paper>
                        </Grid>
                        <Grid item sm={2.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ระยะเครดิต</Typography>
                        </Grid>
                        <Grid item sm={3.5} xs={9}>
                            <Paper component="form">
                                <TextField size="small" type="number" fullWidth value={creditTime} onChange={(e) => setCreditTime(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item sm={2} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เบอร์โทร</Typography>
                        </Grid>
                        <Grid item sm={4} xs={9}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="ที่อยู่" size="small" />
                            </Divider>
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>บ้านเลขที่</Typography>
                        </Grid>
                        <Grid item sm={2.5} xs={9}>
                            <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>หมู่ที่</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={village} onChange={(e) => setVillage(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ตำบล</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>อำเภอ</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>จังหวัด</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} />
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>รหัสไปรณีย์</Typography>
                        </Grid>
                        <Grid item sm={2.5} xs={9}>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                        </Grid>
                        <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="พิกัด" size="small" />
                            </Divider>
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>lat</Typography>
                        </Grid>
                        <Grid item sm={5} xs={9}>
                            <TextField size="small" type="number" fullWidth value={lat} onChange={(e) => setLat(e.target.value)} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>lng</Typography>
                        </Grid>
                        <Grid item sm={5} xs={9}>
                            <TextField size="small" type="number" fullWidth value={lng} onChange={(e) => setLng(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertCreditor;
