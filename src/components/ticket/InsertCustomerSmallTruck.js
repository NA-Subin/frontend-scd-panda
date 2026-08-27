import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    Paper,
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

const InsertCustomerBigTruck = (props) => {
    const { show } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = React.useState(false);
    const [check, setCheck] = React.useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const { company, small } = useBasicData();
    const companyDetail = Object.values(company || {});
    const registrations = Object.values(small || {});

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [name, setName] = React.useState("");
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
    const [phone, setPhone] = React.useState("");
    // const [rate1, setRate1] = React.useState("");
    // const [rate2, setRate2] = React.useState("");
    // const [rate3, setRate3] = React.useState("");
    const [credit, setCredit] = React.useState("");
    const [creditTime, setCreditTime] = React.useState("");
    const [bill, setBill] = React.useState("");
    const [code, setCode] = React.useState("");
    const [codeID, setCodeID] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [checked1, setChecked1] = React.useState(show);
    const [checked2, setChecked2] = React.useState(show);
    const [ticketChecked, setTicketChecked] = React.useState(true);
    const [companyChecked, setCompanyChecked] = React.useState(true);
    const [companies, setCompanies] = React.useState("ไม่มี");
    const [registrantionCheck, setRegistrationChecked] = React.useState(false);
    const [registration, setRegistration] = React.useState("ไม่มี");

    const getTicket = async () => {
        database.ref("/customers/smalltruck").on("value", (snapshot) => {
            const datas = snapshot.val();
            if (datas === null || datas === undefined) {
                setTicket(0);
            } else {
                setTicket(datas.length);
            }
        });
    };

    useEffect(() => {
        getTicket();
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
            .ref("/customers/smalltruck")
            .child(ticket)
            .update({
                id: ticket + 1,
                Name: ticketsName,
                TicketsName: ticketsName,
                Status: ticketChecked === true ? "ลูกค้าประจำ" : "ลูกค้าไม่ประจำ",
                StatusCompany: companyChecked === true ? "อยู่บริษัทในเครือ" : "ไม่อยู่บริษัทในเครือ",
                // Rate1: rate1,
                // Rate2: rate2,
                // Rate3: rate3,
                Bill: bill,
                Code: code,
                CompanyName: companyName,
                Company: companies,
                CodeID: codeID,
                Address: address,
                lat: lat,
                lng: lng,
                Type: show === 1 ? "เชียงใหม่" : "บ้านโฮ่ง",
                Credit: credit,
                CreditTime: creditTime,
                Phone: phone,
                RegistrationCheck: registrantionCheck,
                Registration: registration
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setTicketsName("")
                // setRate1("")
                // setRate2("")
                // setRate3("")
                setCredit("")
                setCreditTime("")
                setBill("")
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
                setRegistrationChecked(false)
                setRegistration("ไม่มี")
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <Button variant="contained" color="info" startIcon={<BookOnlineIcon sx={{ transform: "rotate(90deg)" }} />} onClick={handleClickOpen} fullWidth>เพิ่มลูกค้ารถเล็กของ{show === 1 ? "เชียงใหม่" : "บ้านโฮ่ง"}</Button>
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
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มลูกค้ารถเล็กของ{show === 1 ? "เชียงใหม่" : "บ้านโฮ่ง"}</Typography>
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
                        <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" marginRight={1}>เลือกประเภทของตั๋วลูกค้ารถเล็ก :</Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={show === 1 ? true : false}
                                        size="small"
                                        disabled={show === 2 ? true : false}
                                    />
                                }
                                label="เชียงใหม่"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={show === 2 ? true : false}
                                        size="small"
                                        disabled={show === 1 ? true : false}
                                    />
                                }
                                label="บ้านโฮ่ง"
                            />
                        </Grid>
                        <Grid item md={7} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Grid container spacing={2}>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 9 } }} gutterBottom>ชื่อ</Typography>
                                    <TextField size="small" fullWidth value={ticketsName} onChange={(e) => setTicketsName(e.target.value)} />
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>รอบการวางบิล</Typography>
                                    <TextField size="small" fullWidth value={bill} onChange={(e) => setBill(e.target.value)} />
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="left" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" marginRight={1} sx={{ marginLeft: { md: 0, xs: 4 } }}>สถานะตั๋ว :</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={ticketChecked === true ? true : false}
                                                onChange={() => setTicketChecked(true)}
                                                size="small"
                                            />
                                        }
                                        label="ลูกค้าประจำ"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={ticketChecked === false ? true : false}
                                                onChange={() => setTicketChecked(false)}
                                                size="small"
                                            />
                                        }
                                        label="ลูกค้าไม่ประจำ"
                                    />
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="left" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" marginRight={1} sx={{ marginLeft: { md: 0, xs: 4 } }}>สถานะบริษัท :</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={companyChecked === true ? true : false}
                                                onChange={() => setCompanyChecked(true)}
                                                size="small"
                                            />
                                        }
                                        label="อยู่บริษัทในเครือ"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={companyChecked === false ? true : false}
                                                onChange={() => setCompanyChecked(false)}
                                                size="small"
                                            />
                                        }
                                        label="ไม่อยู่บริษัทในเครือ"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={5} xs={12}>
                            <Grid container spacing={2}>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1, marginLeft: { md: 8, xs: 5 } }} gutterBottom>เครดิต :</Typography>
                                    <TextField size="small" fullWidth value={credit} onChange={(e) => setCredit(e.target.value)} />
                                </Grid>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: -2 } }} gutterBottom>ระยะเวลาเครดิต :</Typography>
                                    <TextField size="small" fullWidth value={creditTime} onChange={(e) => setCreditTime(e.target.value)} />
                                </Grid>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1, marginLeft: { md: 6, xs: 3.5 } }} gutterBottom>เบอร์โทร :</Typography>
                                    <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </Grid>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={companies}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                        onChange={(e) => setCompanies(e.target.value)}
                                    >
                                        <MenuItem value="ไม่มี">กรุณาเลือกบริษัท</MenuItem>
                                        {
                                            companyDetail.map((item, index) => (
                                                <MenuItem value={`${item.id}:${item.Name}`}>{item.Name}</MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={2.5} xs={2.5} display="flex" justifyContent="left" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" marginRight={1} sx={{ marginLeft: { md: 0, xs: 4 } }}>เลือกทะเบียน :</Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={registrantionCheck}
                                        onChange={() => setRegistrationChecked(!registrantionCheck)}
                                        size="small"
                                    />
                                }
                            />
                        </Grid>
                        <Grid item md={9.5} xs={9.5} display="flex" justifyContent="left" alignItems="center">
                            {
                                registrantionCheck &&
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={registration}
                                    SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                    onChange={(e) => setRegistration(e.target.value)}
                                >
                                    <MenuItem value="ไม่มี">กรุณาเลือกทะเบียน</MenuItem>
                                    {
                                        registrations.map((item, index) => (
                                            <MenuItem value={`${item.id}:${item.RegHead}`}>{`${item.ShortName}${item.RegHead}`}</MenuItem>
                                        ))
                                    }
                                </TextField>
                            }
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Divider>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ใบวางบิล/ใบแจ้งหนี้</Typography>
                            </Divider>
                        </Grid>
                        <Grid item md={3} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 8 } }} gutterBottom>รหัส</Typography>
                            <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} />
                        </Grid>
                        <Grid item md={9} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 4.5 } }} gutterBottom>ชื่อบริษัท</Typography>
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
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 7 } }} gutterBottom>ตำบล</Typography>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 6.5 } }} gutterBottom>อำเภอ</Typography>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 6 } }} gutterBottom>จังหวัด</Typography>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 2 } }} gutterBottom>รหัสไปรณีย์</Typography>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 1 } }} gutterBottom>เลขผู้เสียภาษี</Typography>
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

export default InsertCustomerBigTruck;
