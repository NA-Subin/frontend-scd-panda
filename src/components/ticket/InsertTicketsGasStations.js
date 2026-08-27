import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { IconButtonError, TablecellHeader } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const InsertTicketsGasStations = (props) => {
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = React.useState(false);
    const [check, setCheck] = React.useState(true);
    //const [gasStation, setGasStation] = React.useState([]);
    const { gasstation } = useBasicData();
    const gasStation = Object.values(gasstation || {});

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

    const [name, setName] = React.useState("");
    const [shortName, setShortName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [ticket, setTicket] = React.useState(0);
    const [ticketsName, setTicketsName] = React.useState("");
    const [rate1, setRate1] = React.useState("");
    const [rate2, setRate2] = React.useState("");
    const [rate3, setRate3] = React.useState("");
    const [creditTime, setCreditTime] = React.useState("");
    const [code, setCode] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [codeID, setCodeID] = React.useState("");

    const getTicket = async () => {
        database.ref("/customers/gasstations/").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setTicket(0);
            } else {
                setTicket(datas.length);
            }
        });
    };

    // const getGasStation = async () => {
    //     database.ref("/depot/gasStations/").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         if (datas === null || datas === undefined) {
    //             setGasStation([]);
    //         } else {
    //             const dataList = [];
    //             for (let id in datas) {
    //                 dataList.push({ id, ...datas[id] })
    //             }
    //             setGasStation(dataList);
    //         }
    //     });
    // };

    useEffect(() => {
        getTicket();
        //getGasStation();
    }, []);

    console.log("tickket:", ticket);

    const handlePost = () => {
        const address = {
            no: no?.trim() || "",
            village: village?.trim() || "",
            subDistrict: subDistrict?.trim() || "",
            district: district?.trim() || "",
            province: province?.trim() || "",
            zipCode: zipCode?.trim() || ""
        };

        database
            .ref("/customers/gasstations/")
            .child(ticket)
            .update({
                id: ticket + 1,
                Name: shortName + name,
                ShortName: shortName,
                LastName: name,
                TicketsName: ticketsName,
                Status: "ตั๋ว/ผู้รับ",
                Rate1: rate1,
                Rate2: rate2,
                Rate3: rate3,
                CreditTime: creditTime,
                Code: code,
                CompanyName: companyName,
                CodeID: codeID,
                Address: address,
                lat: lat,
                lng: lng,
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setTicketsName("")
                setRate1("")
                setRate2("")
                setRate3("")
                setCreditTime("")
                setCode("")
                setCompanyName("")
                setCodeID("")
                setNo("")
                setVillage("")
                setSubDistrict("")
                setDistrict("")
                setProvince("")
                setZipCode("")
                setLat("")
                setLng("")
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    console.log("ticketsName : ", ticketsName);

    return (
        <React.Fragment>
            <Button variant="contained" color="info" startIcon={<BookOnlineIcon sx={{ transform: "rotate(90deg)" }} />} onClick={handleClickOpen} fullWidth>เพิ่มตั๋วปั้ม</Button>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 600 ? true : false}
                onClose={handleClose}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มตั๋วปั้ม</Typography>
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
                        <Grid item md={7} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Grid container spacing={2}>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 8 } }} gutterBottom>ชื่อตั๋ว</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item md={4} xs={12}>
                                            <TextField size="small" label="กรุณาเพิ่มรหัส" fullWidth value={shortName} onChange={(e) => setShortName(e.target.value)} />
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <TextField size="small" label="กรุณาเพิ่มชื่อ" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 6 } }} gutterBottom>เลือกปั้ม</Typography>
                                    <Paper
                                        component="form" sx={{ width: "100%" }}>
                                        <Autocomplete
                                            size="small"
                                            fullWidth
                                            options={gasStation.map((row) => row.Name + "/" + row.ShortName)}
                                            value={ticketsName}
                                            onChange={(event, newValue) => {
                                                setTicketsName(newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} label="กรุณาเลือกปั้ม" variant="outlined" />
                                            )}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 1 } }} gutterBottom>รอบการวางบิล</Typography>
                                    <TextField size="small" fullWidth value={creditTime} onChange={(e) => setCreditTime(e.target.value)} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={5} xs={12}>
                            <Grid container spacing={2}>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังลำปาง"} value={rate1} onChange={(e) => setRate1(e.target.value)} />
                                </Grid>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังพิจิตร"} value={rate2} onChange={(e) => setRate2(e.target.value)} />
                                </Grid>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังสระบุรี/บางปะอิน/IR"} value={rate3} onChange={(e) => setRate3(e.target.value)} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Divider>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ใบวางบิล/ใบแจ้งหนี้</Typography>
                            </Divider>
                        </Grid>
                        <Grid item md={3} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 9 } }} gutterBottom>รหัส</Typography>
                            <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} />
                        </Grid>
                        <Grid item md={9} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 5.5 } }} gutterBottom>ชื่อบริษัท</Typography>
                            <TextField size="small" fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                        </Grid>
                        <Grid item md={2.5} xs={6} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 4 } }} gutterBottom>บ้านเลขที่</Typography>
                            <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} />
                        </Grid>
                        <Grid item md={1.5} xs={6} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 7 } }} gutterBottom>หมู่ที่</Typography>
                            <TextField size="small" fullWidth value={village} onChange={(e) => setVillage(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 8 } }} gutterBottom>ตำบล</Typography>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 7.5 } }} gutterBottom>อำเภอ</Typography>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 7 } }} gutterBottom>จังหวัด</Typography>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 3.5 } }} gutterBottom>รหัสไปรณีย์</Typography>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 2.5 } }} gutterBottom>เลขผู้เสียภาษี</Typography>
                            <TextField size="small" fullWidth value={codeID} onChange={(e) => setCodeID(e.target.value)} />
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

export default InsertTicketsGasStations;
