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
import "dayjs/locale/th";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const InsertCompany = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [depots, setDepots] = useState("");

    // const { company } = useData();
    const { company } = useBasicData();
    const companyDetail = Object.values(company || {});

    console.log("Company : ", companyDetail);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [companyType, setCompanyType] = React.useState("")
    const [name, setName] = React.useState("");
    //const [company, setCompany] = React.useState([]);
    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [road, setRoad] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [cardId, setCardID] = React.useState("");

    // const getCompany = async () => {
    //     database.ref("/company").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         setCompany(datas.length);
    //     });
    // };

    // useEffect(() => {
    //     getCompany();
    // }, []);
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

    console.log("Company : ", companyDetail);

    const handlePost = () => {
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-GB");

        database
            .ref("company")
            .child(companyDetail.length)
            .update({
                id: (companyDetail.length) + 1,
                Name: name,
                CardID: cardId,
                Address: {
                    no: no === "-" ? "" : no,
                    village: village === "-" ? "" : village,
                    road: road === "-" ? "" : road,
                    subDistrict: subDistrict === "-" ? "" : subDistrict,
                    district: district === "-" ? "" : district,
                    province: province === "-" ? "" : province,
                    zipCode: zipCode === "-" ? "" : zipCode,
                },
                DateStart: dateStr,
                lat: lat,
                lng: lng,
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
                setName("");
                setCardID("");
                setNo("");
                setVillage("");
                setRoad("");
                setSubDistrict("");
                setDistrict("");
                setProvince("");
                setZipCode("");
                setLat("");
                setLng("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };


    return (
        <React.Fragment>
            <Box textAlign="right" >
                <Button variant="contained" color="info" sx={{ fontWeight: "bold", marginTop: -5 }} onClick={handleClickOpen}>เพิ่มบริษัท</Button>
            </Box>
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
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มบริษัท</Typography>
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
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                ชื่อบริษัท
                            </Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <Paper
                                component="form">
                                <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขภาษี</Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <TextField size="small" fullWidth value={cardId} onChange={(e) => setCardID(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider>
                                <Chip label="ที่อยู่" size="small" />
                            </Divider>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>หมู่ที่</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={village} onChange={(e) => setVillage(e.target.value)} />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ถนน</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={road} onChange={(e) => setRoad(e.target.value)} />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ตำบล</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>อำเภอ</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>จังหวัด</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>รหัสไปรณีย์</Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Divider>
                                <Chip label="พิกัด" size="small" />
                            </Divider>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>lat</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={lat} onChange={(e) => setLat(e.target.value)} />
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>long</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField size="small" fullWidth value={lng} onChange={(e) => setLng(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertCompany;
