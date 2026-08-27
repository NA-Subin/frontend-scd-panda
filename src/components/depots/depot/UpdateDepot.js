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
import theme from "../../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../../theme/style";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const UpdateDepot = (props) => {
    const { depot } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const [openTab, setOpenTab] = React.useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [name, setName] = React.useState(depot.Name);
    const [no, setNo] = React.useState(depot.Address.split(",")[0] === undefined ? "-" : depot.Address.split(",")[0]);
    const [village, setVillage] = React.useState(depot.Address.split(",")[1] === undefined ? "-" : depot.Address.split(",")[1]);
    const [subDistrict, setSubDistrict] = React.useState(depot.Address.split(",")[2] === undefined ? "-" : depot.Address.split(",")[2]);
    const [district, setDistrict] = React.useState(depot.Address.split(",")[3] === undefined ? "-" : depot.Address.split(",")[3]);
    const [province, setProvince] = React.useState(depot.Address.split(",")[4] === undefined ? "-" : depot.Address.split(",")[4]);
    const [zipCode, setZipCode] = React.useState(depot.Address.split(",")[5] === undefined ? "-" : depot.Address.split(",")[5]);
    const [lat, setLat] = React.useState(depot.lat);
    const [lng, setLng] = React.useState(depot.lng);

    const handleUpdate = () => {
        database
            .ref("/depot/oils/")
            .child(depot.id - 1)
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
                lng: lng
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
            <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpen(depot.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell>
            <Dialog
                open={open === depot.id ? true : false}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดคลังรับน้ำมัน</Typography>
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
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อคลัง</Typography>
                            </Grid>
                            <Grid item xs={10.5}>
                                <TextField fullWidth variant="standard" value={name} disabled={update ? true : false} onChange={(e) => setName(e.target.value)}/>
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

export default UpdateDepot;
