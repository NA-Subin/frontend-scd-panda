import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import Swal from "sweetalert2";
import theme from "../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
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
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import GasStationDetail from "./GasStationDetail";
import { useData } from "../../server/path";
import withReactContent from "sweetalert2-react-content";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useGasStationData } from "../../server/provider/GasStationProvider";
import { formatThaiSlash } from "../../theme/DateTH";

const GasStationA = () => {
    const userId = Cookies.get("sessionToken");
    const navigate = useNavigate();
    const { officers } = useBasicData();
    const { gasstationDetail } = useGasStationData();
    const employee = Object.values(officers || {});
    const gasstations = Object.values(gasstationDetail || {});
    const employeeDetail = employee.find((emp) => (emp.id === Number(userId.split("$")[1])));
    const gasStationsDetail = gasstations.find((gas) => gas.id === Number(employeeDetail?.GasStation.split(":")[0]));

    console.log("GasStation : : :", Number(employeeDetail?.GasStation.split(":")[0]));
    console.log("GasStation : :", employeeDetail?.GasStation);

    const [open, setOpen] = React.useState(true);
    const [openOil, setOpenOil] = React.useState(true);
    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = useState([]);
    const [statusSave, setStatusSave] = useState(true);
    const [newVolume, setNewVolume] = React.useState(0);
    const [gasStation, setGasStation] = React.useState(0);
    const [gasStations, setGasStations] = React.useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const today = dayjs(new Date());
    const isToday = selectedDate.isSame(today, "day"); // เปรียบเทียบเฉพาะวันที่

    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    console.log("User Id ", userId.split("$")[1]);
    console.log("Employee ", employee);
    console.log("Employee Detail ", employeeDetail);

    const [gasStationID, setGasStationID] = React.useState(0);
    const [newVolumes, setNewVolumes] = useState({});
    const [products, setProducts] = useState([]);
    const [report, setReport] = React.useState([]);
    const [setting, setSetting] = React.useState(true);
    const [gasStationReport, setGasStationReport] = React.useState([]);
    //const [gasstationDetails,setGasStationDetail] = React.useState("");
    const gasstationDetails = employeeDetail?.GasStation;

    const PREFIXES = ["นาย", "นาง", "นางสาว", "เด็กชาย", "เด็กหญิง", "ด.ช.", "ด.ญ."];

    const splitThaiName = (fullName) => {
        if (!fullName) return { prefix: "", firstName: "", lastName: "" };

        const prefix = PREFIXES.find(p => fullName.startsWith(p));
        if (!prefix) return { prefix: "", firstName: "", lastName: "" };

        // ตัดคำนำหน้าออกจากชื่อเต็ม
        const rest = fullName.slice(prefix.length).trim();
        const nameParts = rest.split(" ");

        return {
            prefix,
            firstName: nameParts[0] || "",
            lastName: nameParts[1] || "",
        };
    };

    // ตัวอย่างการใช้งาน
    const { prefix, firstName, lastName } = splitThaiName(employeeDetail?.Name);

    console.log("คำนำหน้า:", prefix);     // นางสาว
    console.log("ชื่อ:", firstName);       // สมส่วน
    console.log("นามสกุล:", lastName);     // สามสี


    console.log("GasStation : ", gasStationsDetail);
    console.log("GasStation Oil : ", gasStationOil);
    console.log("GasStation ID : ", gasStationID);
    console.log("GasStation Detail : ", gasstationDetails);

    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
            database.ref("/depot/gasStations").on("value", (snapshot) => {
                const datasG = snapshot.val();
                const dataListG = [];
                for (let idG in datasG) {
                    if (datasG[idG].Name === gasstationDetails.split(":")[1]) {
                        dataListG.push({ idG, ...datasG[idG] });
                        database.ref("/depot/stock").on("value", (snapshot) => {
                            const datasS = snapshot.val();
                            const productsList = [];
                            const dataListReport = [];

                            for (let idS in datasS) {
                                if (datasS[idS].Name === datasG[idG].Stock) {
                                    // ดึงเฉพาะ Products และบันทึกลง productsList
                                    const products = datasS[idS].Products || {};
                                    productsList.push(...Object.values(products)); // รวม Products ทั้งหมดเข้าใน array

                                    const report = datasG[idG].Report || {};
                                    dataListReport.push(...Object.values(report));

                                    // ตั้งค่า GasStationID
                                    setGasStationID(datasG[idG].id);
                                    database.ref("depot/gasStations/" + (datasG[idG].id - 1) + "/Report/" + dayjs(formattedDate).format("DD-MM-YYYY")).on("value", (snapshot) => {
                                        const datas = snapshot.val();
                                        const dataList = [];
                                        for (let id in datas) {
                                            dataList.push({ id, ...datas[id] });
                                        }
                                        setGasStationReport(dataList);
                                    });
                                }
                            }
                            if (dataListReport.length === 0) {
                                setReport(0); // ถ้าไม่มีข้อมูลใน dataListReport ให้ตั้งค่าเป็น 0
                            } else {
                                setReport(dataListReport); // ถ้ามีข้อมูลให้บันทึกลง state
                            }
                            setStock(productsList);
                        })
                    }
                }
                setGasStationsOil(dataListG);
                setStatusSave(false);
            });
        }
    };

    const getGasStations = async () => {
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] })
            }
            setGasStations(dataList);
        });
    };

    useEffect(() => {
        getGasStations();
    }, []);

    const handleBack = () => {
        withReactContent(Swal)
            .fire({
                title: "ต้องการออกจากระบบใช่หรือไม่",
                icon: "error",
                confirmButtonText: "ตกลง",
                cancelButtonText: "ยกเลิก",
                showCancelButton: true,
            })
            .then((result) => {
                if (result.isConfirmed) {
                    signOut(auth)
                        .then(() => {
                            Cookies.remove('user');
                            Cookies.remove('sessionToken');
                            Cookies.remove('password');
                            navigate("/");
                            Swal.fire("ออกจากระบบเรียบร้อย", "", "success");
                        })
                        .catch((error) => {
                            Swal.fire("ไม่สามารถออกจากระบบได้", "", "error");
                        });
                } else if (result.isDenied) {
                    Swal.fire("ออกจากระบบล้มเหลว", "", "error");
                }
            });
    }

    useEffect(() => {
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datasG = snapshot.val();
            const dataListG = [];
            for (let idG in datasG) {
                if (datasG[idG].Name === gasstationDetails.split(":")[1]) {
                    dataListG.push({ idG, ...datasG[idG] });
                    database.ref("/depot/stock").on("value", (snapshot) => {
                        const datasS = snapshot.val();
                        const productsList = [];
                        const dataListReport = [];

                        for (let idS in datasS) {
                            if (datasS[idS].Name === datasG[idG].Stock) {
                                // ดึงเฉพาะ Products และบันทึกลง productsList
                                const products = datasS[idS].Products || {};
                                productsList.push(...Object.values(products)); // รวม Products ทั้งหมดเข้าใน array

                                const report = datasG[idG].Report || {};
                                dataListReport.push(...Object.values(report));

                                // ตั้งค่า GasStationID
                                setGasStationID(datasG[idG].id);
                                database.ref("depot/gasStations/" + (datasG[idG].id - 1) + "/Report/" + dayjs(selectedDate).format("DD-MM-YYYY")).on("value", (snapshot) => {
                                    const datas = snapshot.val();
                                    const dataList = [];
                                    for (let id in datas) {
                                        dataList.push({ id, ...datas[id] });
                                    }
                                    setGasStationReport(dataList);
                                });
                            }
                        }
                        if (dataListReport.length === 0) {
                            setReport(0); // ถ้าไม่มีข้อมูลใน dataListReport ให้ตั้งค่าเป็น 0
                        } else {
                            setReport(dataListReport); // ถ้ามีข้อมูลให้บันทึกลง state
                        }
                        setStock(productsList);
                    })
                }
            }
            setGasStationsOil(dataListG);
            setStatusSave(false);
        });

    }, [gasstationDetails]); // อัปเดตเมื่อ orderNew เปลี่ยน

    // const handleGasStationChange = (e) => {
    //     setGasStation(e.target.value);
    //     const DataGasStation = e.target.value;
    //     database.ref("/depot/gasStations").on("value", (snapshot) => {
    //         const datasG = snapshot.val();
    //         const dataListG = [];
    //         for (let idG in datasG) {
    //             if (datasG[idG].Name === DataGasStation) {
    //                 dataListG.push({ idG, ...datasG[idG] });
    //                 database.ref("/depot/stock").on("value", (snapshot) => {
    //                     const datasS = snapshot.val();
    //                     const productsList = [];
    //                     const dataListReport = [];

    //                     for (let idS in datasS) {
    //                         if (datasS[idS].Name === datasG[idG].Stock) {
    //                             // ดึงเฉพาะ Products และบันทึกลง productsList
    //                             const products = datasS[idS].Products || {};
    //                             productsList.push(...Object.values(products)); // รวม Products ทั้งหมดเข้าใน array

    //                             const report = datasG[idG].Report || {};
    //                             dataListReport.push(...Object.values(report));

    //                             // ตั้งค่า GasStationID
    //                             setGasStationID(datasG[idG].id);
    //                             database.ref("depot/gasStations/" + (datasG[idG].id - 1) + "/Report/" + dayjs(selectedDate).format("DD-MM-YYYY")).on("value", (snapshot) => {
    //                                 const datas = snapshot.val();
    //                                 const dataList = [];
    //                                 for (let id in datas) {
    //                                     dataList.push({ id, ...datas[id] });
    //                                 }
    //                                 setGasStationReport(dataList);
    //                             });
    //                         }
    //                     }
    //                     if (dataListReport.length === 0) {
    //                         setReport(0); // ถ้าไม่มีข้อมูลใน dataListReport ให้ตั้งค่าเป็น 0
    //                     } else {
    //                         setReport(dataListReport); // ถ้ามีข้อมูลให้บันทึกลง state
    //                     }
    //                     setStock(productsList);
    //                 })
    //             }
    //         }
    //         setGasStationsOil(dataListG);
    //         setStatusSave(false);
    //     });
    // };

    // const [showButton, setShowButton] = useState(false);

    // useEffect(() => {
    //     const checkTime = () => {
    //         const now = dayjs(); // เวลาปัจจุบัน
    //         const start = dayjs().hour(17).minute(0).second(0); // 17:00
    //         const end = dayjs().hour(20).minute(0).second(0); // 20:00
    //         setShowButton(now.isAfter(start) && now.isBefore(end)); // อัปเดตสถานะปุ่มตามช่วงเวลา
    //     };

    //     checkTime(); // ตรวจสอบครั้งแรกเมื่อคอมโพเนนต์โหลด
    //     const interval = setInterval(checkTime, 1000); // ตรวจสอบทุก 1 วินาที

    //     return () => clearInterval(interval); // ล้าง interval เมื่อคอมโพเนนต์ถูกทำลาย
    // }, []);

    console.log("GasStation :", gasstationDetails);
    console.log("GasStationOil ::", gasStationOil);

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
                        <Button variant="contained" color="warning" sx={{ border: "3px solid white" }} endIcon={<SettingsIcon fontSize="small" />} onClick={handleBack}>ตั้งค่า</Button>
                        {
                            isMobile ?
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} onClick={handleBack}><ReplyAllIcon fontSize="small" /></Button>
                                </>

                                :
                                <>
                                    <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<ReplyAllIcon fontSize="small" />} onClick={handleBack}>ออกจากระบบ</Button>
                                </>

                        }
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="left"
                        alignItems="center"
                        marginTop={-3}
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
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            textAlign="center"
                            color={theme.palette.panda.main}
                            sx={{ marginTop: 5, marginLeft: 1 }}
                            gutterBottom
                        >
                            ยินดีต้อนรับเข้าสู่หน้าลงข้อมูลน้ำมัน
                        </Typography>
                    </Box>
                    <Divider />
                    <Grid container spacing={2} marginTop={-1} component="form">
                        <Grid item xs={6} md={2} lg={2}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>คำนำหน้า : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={prefix}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3} lg={3}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>ชื่อ : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={firstName}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3} lg={3}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>สกุล : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={lastName}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4} lg={4}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>ตำแหน่ง : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={employeeDetail?.Position.split(":")[1]}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4} lg={4} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="h6" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>เลือกวันที่</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    openTo="day"
                                    views={["year", "month", "day"]}
                                    value={selectedDate ? dayjs(selectedDate, "DD/MM/YYYY") : null}
                                    format="DD/MM/YYYY"
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            variant: "standard",
                                            inputProps: {
                                                value: formatThaiSlash(selectedDate), // ✅ แสดงเป็น 05/11/2568
                                                readOnly: true, // ปิดการพิมพ์เอง
                                            },
                                            InputProps: {
                                                disableUnderline: false, // ยังมีเส้นอยู่
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '25px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        padding: '2px 6px',
                                                        textAlign: 'center',
                                                        color: "#616161",
                                                    },
                                                },
                                            },
                                            // ✅ เพิ่มเส้นประที่ด้านล่าง
                                            sx: {
                                                "& .MuiInput-underline:before": {
                                                    borderBottom: "1px dashed gray",
                                                },
                                                "& .MuiInput-underline:after": {
                                                    borderBottom: "1px dashed gray",
                                                },
                                                marginLeft: 2,
                                            },
                                        },
                                    }}
                                    sx={{ marginLeft: 2 }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={8} lg={8}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>ชื่อปั้ม : </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="standard"
                                    value={gasStationsDetail?.Name}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '25px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '18px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            marginLeft: 2,
                                            color: "#616161"
                                        },
                                        "& .MuiInput-underline:before": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                        },
                                        "& .MuiInput-underline:after": {
                                            borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                        }
                                    }}
                                />
                            </Box>
                            {/*<Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>ชื่อปั้ม : {gasStationsDetail.Name} </Typography>
                             <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
                                <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={gasStation}
                                    onChange={handleGasStationChange}
                                    fullWidth
                                >
                                    <MenuItem value={0}>กรุณาเลือกปั้ม</MenuItem>
                                    {
                                        [...new Set(gasStations.map(row => row.Name))].map((name) => (
                                            <MenuItem key={name} value={name}>{name}</MenuItem>
                                        ))
                                    }

                                </Select>
                            </FormControl> */}
                        </Grid>
                        {/* <Grid item xs={5} md={3} lg={2} textAlign="right">
                            {
                                openOil === true || openOil === false ? <Button variant="contained" color="error" onClick={() => setOpenOil("")}>ย้อนกลับ</Button> : ""
                            }
                        </Grid> */}
                    </Grid>
                    {gasStationOil.map((row, index) => {
                        const prevIndex = index - 1; // index ก่อนหน้า
                        const prevGas = gasStationOil[prevIndex] || {}; // ✅ ใช้ {} แทน []
                        const latestGas = gasStationOil[index] || {}; // ✅ ใช้ {} แทน []

                        const selectedDateKey = dayjs(selectedDate).format("DD-MM-YYYY");

                        // ตรวจสอบว่ามีค่าเป็นอาร์เรย์ก่อนใช้ spread operator
                        const prevReport = Array.isArray(prevGas.Report?.[selectedDateKey]) ? [...prevGas.Report[selectedDateKey]] : [];
                        const latestReport = Array.isArray(latestGas.Report?.[selectedDateKey]) ? [...latestGas.Report[selectedDateKey]] : [];

                        // ตรวจสอบข้อมูลซ้ำ
                        const reportOilBalance = prevReport.map((prevItem) => {
                            const matchingLatestItem = latestReport.find(
                                (latestItem) => latestItem.ProductName === prevItem.ProductName
                            );

                            return {
                                ProductName: prevItem.ProductName,
                                Color: prevItem.Color,
                                PrevOilBalance: prevItem.OilBalance,
                                LatestOilBalance: matchingLatestItem ? matchingLatestItem.OilBalance : 0,
                                Difference: Number(prevItem.OilBalance) - Number(matchingLatestItem ? matchingLatestItem.OilBalance : 0)
                            };
                        });

                        const oilBalance = prevReport.map((prevItem) => {
                            const matchingLatestItem = latestReport.find(
                                (latestItem) => latestItem.ProductName === prevItem.ProductName
                            );

                            return {
                                ProductName: prevItem.ProductName || "",
                                Capacity: prevItem.Capacity || 0,
                                Color: prevItem.Color || "",
                                Volume: prevItem.Volume || 0,
                                Squeeze: prevItem.Squeeze || 0,
                                Delivered: prevItem.Delivered || 0,
                                Pending1: prevItem.Pending1 || 0,
                                Pending2: prevItem.Pending2 || 0,
                                Pending3: prevItem.Pending3 || 0,
                                Driver1: prevItem.Driver1 || 0,
                                Driver2: prevItem.Driver2 || 0,
                                EstimateSell: prevItem.EstimateSell || 0,
                                Period: prevItem.Period || 0,
                                DownHole: prevItem.DownHole || 0,
                                YesterDay: prevItem.YesterDay || 0,
                                Sell: prevItem.Sell || 0,
                                TotalVolume: prevItem.TotalVolume || 0,
                                OilBalance: prevItem.OilBalance || 0,
                                Difference: Number(prevItem.OilBalance) - Number(matchingLatestItem ? matchingLatestItem.OilBalance : 0)
                            };
                        });

                        return (
                            <React.Fragment key={index}>
                                <GasStationDetail
                                    stock={stock}
                                    gasStationID={gasStationID}
                                    // report={report}
                                    // gasStationReport={gasStationReport}
                                    selectedDate={selectedDate}
                                    // gasStationOil={gasStationOil}
                                    isToday={isToday}
                                    gas={row}
                                    gasID={index}
                                    first={prevGas}
                                    last={latestGas}
                                    reportOilBalance={reportOilBalance}
                                    oilBalance={oilBalance}
                                    status={statusSave}
                                />
                            </React.Fragment>
                        );
                    })}
                </Box>
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.light,
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                    }}
                />
            </Paper>
        </Container>
    );
};

export default GasStationA;
