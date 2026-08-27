import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth, database, googleProvider } from "../../server/firebase";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { TablecellHeader } from "../../theme/style";
import InsertTrips from "./InsertTrips";

const TradePayable = () => {

    const navigate = useNavigate();
    const [open, setOpen] = React.useState(true);
    const [trip, setTrip] = useState([]);
    const location = useLocation();
    
        const { Creditor } = location.state || {};

    const getNameParts = (fullName) => {
        // ใช้ Regex เพื่อจับคำนำหน้า และแยกชื่อออกจากคำนำหน้า
        const prefixMatch = fullName.match(/^(นาย|นาง|นางสาว)\s*/);
        const prefix = prefixMatch ? prefixMatch[0].trim() : ""; // เก็บคำนำหน้า หรือเว้นว่างไว้ถ้าไม่มี

        // ลบคำนำหน้าออกจากชื่อเต็ม
        const nameWithoutPrefix = fullName.replace(/^(นาย|นาง|นางสาว)\s*/, "");

        // แยกชื่อและนามสกุลโดยใช้ช่องว่าง
        const [firstName, lastName] = nameWithoutPrefix.split(" ");

        return { prefix, firstName, lastName };
    };

    // ตัวอย่างการใช้งาน
    const { prefix, firstName, lastName } = getNameParts(Creditor.Name);

    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const getTrip = async () => {
        database.ref("/trip").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTrip = [];
            for (let id in datas) {
                if(datas[id].Creditor === Creditor.Name){
                    dataTrip.push({ id, ...datas[id] })
                }
            }
            setTrip(dataTrip);
        });
    };

    useEffect(() => {
        getTrip();
    }, []);

    const handleLogout = () => {
        ShowConfirm(
            "ต้องการออกจากระบบใช่หรือไม่",
            () => {
                signOut(auth)
                    .then(() => {
                        console.log("User logged out");
                        // Cookies.remove('token');
                        navigate("/");
                        Cookies.remove('user');
                    })
                    .catch(() => {
                        console.error("Error logging out:");
                    }); // นำผู้ใช้ไปยังหน้า login
            }, () => {
                // เงื่อนไขเมื่อกดปุ่มยกเลิก
                console.log("ยกเลิกแล้ว");
            }
        )
    };

    return (
        <Container sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: { xs: "lg", sm: "lg", md: "lg" } }}>
            <Paper
                sx={{
                    borderRadius: 5,
                    boxShadow: "1px 1px 2px 2px rgba(0, 0, 0, 0.5)",
                }}
            >
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.main,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                />
                <Box sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    marginTop: { xs: -2, sm: -3, md: -4 },
                    marginBottom: { xs: -1, sm: -2, md: -3 },
                }}>
                    <Box textAlign="right" marginTop={-6.5} marginBottom={4} sx={{ marginRight: { xs: -2, sm: -3, md: -4 } }}>
                        {
                            isMobile ?
                                <>
                                    {
                                        open ?
                                            <Button variant="contained" color="warning" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} onClick={() => setOpen(false)}><SettingsIcon fontSize="small" /></Button>
                                            :
                                            <Button variant="contained" color="primary" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} onClick={() => setOpen(true)}><PostAddIcon fontSize="small" /></Button>
                                    }
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} onClick={handleLogout}><MeetingRoomIcon fontSize="small" /></Button>
                                </>

                                :
                                <>
                                    {
                                        open ?
                                            <Button variant="contained" color="warning" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} endIcon={<SettingsIcon fontSize="small" />} onClick={() => setOpen(false)}>ตั้งค่า</Button>
                                            :
                                            <Button variant="contained" color="primary" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} endIcon={<PostAddIcon fontSize="small" />} onClick={() => setOpen(true)}>ลงข้อมูล</Button>
                                    }
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<MeetingRoomIcon fontSize="small" />} onClick={handleLogout}>ออกจากระบบ</Button>
                                </>

                        }
                    </Box>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        color={theme.palette.panda.main}
                        gutterBottom
                    >
                        {
                            open ? "ยินดีต้อนรับเข้าสู่หน้าจัดการสินค้า" : "ตั้งค่าบัญชีผู้ใช้"
                        }
                    </Typography>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        marginTop={-1}
                    >
                        <img src={Logo} width="150" />
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            marginLeft={-4.7}
                            marginTop={3.7}
                        >
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.error.main}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                S
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.warning.light}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                C
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.info.dark}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                D
                            </Typography>
                        </Box>
                    </Box>
                    <Grid container spacing={2} marginTop={2}>
                                            <Grid item xs={12} sm={3} md={2} display="flex" justifyContent="center" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom sx={{ whiteSpace: 'nowrap' }}>คำนำหน้า</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{
                                                        "& .MuiInput-underline:before": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                                        },
                                                        "& .MuiInput-underline:after": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                                        },
                                                        marginLeft: 2
                                                    }}
                                                    value={prefix}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4.5} md={2.5} display="flex" justifyContent="center" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom>ชื่อ</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{
                                                        "& .MuiInput-underline:before": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                                        },
                                                        "& .MuiInput-underline:after": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                                        },
                                                        marginLeft: 2
                                                    }}
                                                    value={firstName}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4.5} md={2.5} display="flex" justifyContent="center" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom>สกุล</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{
                                                        "& .MuiInput-underline:before": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                                        },
                                                        "& .MuiInput-underline:after": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                                        },
                                                        marginLeft: 2
                                                    }}
                                                    value={lastName}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={12} md={5} display="flex" justifyContent="center" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ชื่อปั้ม</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{
                                                        "& .MuiInput-underline:before": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                                        },
                                                        "& .MuiInput-underline:after": {
                                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                                        },
                                                        marginLeft: 2
                                                    }}
                                                    value={Creditor.Address}
                                                    disabled
                                                />
                                            </Grid>
                                        </Grid>
                </Box>
                <Box sx={{ p: 3,width: "100%" }}>
                <Grid container spacing={2} width="100%" paddingRight={4}>
                <Grid item xs={8} sm={7} md={10}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                        รายการขายน้ำมัน
                    </Typography>
                    <Divider sx={{ marginTop: 1 }} />
                </Grid>
                        <Grid item xs={4} sm={3} md={2}>
                            <InsertTrips creditor={Creditor.Name}/>
                        </Grid>
                <Grid item xs={12}>
                    <TableContainer
                        component={Paper}
                        style={{ maxHeight: "90vh" }}
                        sx={{
                            maxWidth: trip.length === 0 || trip.length === null ? "100%" : "1200px",
                            overflowX: "auto", // แสดง scrollbar แนวนอน
                            marginTop: 2,
                        }}
                    >
                        <Table
                            stickyHeader
                            size="small"
                            sx={{
                                tableLayout: "fixed", // บังคับความกว้างของคอลัมน์
                            }}
                        >
                            <TableHead>
                                <TableRow sx={{ height: "7vh" }}>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 50 } : { textAlign: "center", fontSize: 16, width: 100 }}>
                                        ลำดับ
                                    </TablecellHeader>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 50 } : { textAlign: "center", fontSize: 16, width: 100 }}>
                                        วันที่
                                    </TablecellHeader>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 100 } : { textAlign: "center", fontSize: 16, width: 250 }}>
                                        คลังรับน้ำมัน
                                    </TablecellHeader>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 100 } : { textAlign: "center", fontSize: 16, width: 250 }}>
                                        ชื่อ/ทะเบียนรถ
                                    </TablecellHeader>
                                    {
                                        trip.length === 0 || trip.length === null ? "" :
                                        <>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 1
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 2
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 3
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 4
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 5
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 6
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 7
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 230 }}>
                                        ลำดับที่ 8
                                    </TablecellHeader>
                                        </>
                                    }
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 100 } : { textAlign: "center", fontSize: 16, width: 150 }}>
                                        ปริมาณน้ำมัน
                                    </TablecellHeader>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 100 } : { textAlign: "center", fontSize: 16, width: 150 }}>
                                        น้ำหนักรถ
                                    </TablecellHeader>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 100 } : { textAlign: "center", fontSize: 16, width: 150 }}>
                                        น้ำหนักรวม
                                    </TablecellHeader>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 100 } : { textAlign: "center", fontSize: 16, width: 100 }}>
                                        สถานะ
                                    </TablecellHeader>
                                    <TablecellHeader sx={ trip.length === 0 || trip.length === null ? { textAlign: "center", fontSize: 16, width: 100 } : { textAlign: "center", fontSize: 16, width: 250 }}>
                                        เพิ่มเที่ยววิ่งโดย
                                    </TablecellHeader>
                                    <TablecellHeader />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    trip.length === 0 || trip.length === null ?
                                        <TableRow>
                                            <TableCell colSpan={10} sx={{ textAlign: "center", height: "80px", backgroundColor: "lightgray",color: "white", fontWeight: "bold", fontSize: "18px" }}><DescriptionIcon/></TableCell>
                                        </TableRow>
                                    : trip.map((row) => (
                                        <TableRow>
                                            <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.DateStart}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Depot}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Driver}/{row.Registration}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order1 === undefined ? "-" : row.Order1.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order2 === undefined ? "-" : row.Order2.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order3 === undefined ? "-" : row.Order3.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order4 === undefined ? "-" : row.Order4.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order5 === undefined ? "-" : row.Order5.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order6 === undefined ? "-" : row.Order6.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order7 === undefined ? "-" : row.Order7.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Order8 === undefined ? "-" : row.Order8.split(":")[2]}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.WeightOil}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.WeightTruck}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{parseFloat(row.WeightOil) + parseFloat(row.WeightTruck)}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Creditor}</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default TradePayable;
