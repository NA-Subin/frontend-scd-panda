import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Paper,
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
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const ReceiveOil = (props) => {
    const {stock, gasStationOil, gasStationID, report, gasStationReport, selectedDate, isToday} = props;

    const [delivered, setDelivered] = useState({});
    const [setting, setSetting] = React.useState(true);


    // ฟังก์ชันอัปเดตค่า newVolume
    const handleNewVolumeChange = (key, value) => {
        setDelivered((prev) => ({
            ...prev,
            [key]: value, // อัปเดตเฉพาะ ProductName ที่เปลี่ยน
        }));
    };

    const [updateVolumes, setUpdateVolumes] = useState({}); // สำหรับเก็บข้อมูล NewVolume ที่ถูกแก้ไข

    const handleUpdateVolumeChange = (productName, newVolume) => {
        // อัปเดตค่าใหม่ใน state
        setUpdateVolumes((prevVolumes) => ({
            ...prevVolumes,
            [productName]: newVolume, // เก็บค่าใหม่สำหรับแต่ละ productName
        }));
    };

    // console.log("show :", stock);
    // console.log("gasStation :", gasStationID);
    // console.log("Report: ", report);
    // console.log("gasStationReport: ", gasStationReport.length);
    // console.log("Date : ",dayjs(selectedDate).format('DD-MM-YYYY'));


    const saveProduct = () => {
        const updatedProducts = gasStationOil.flatMap((row) =>
            Object.entries(row.Products).map(([key, value]) => {
                const matchingStock = stock.find((s) => s.ProductName === key);
                if (matchingStock) {
                    return {
                        ProductName: key,
                        Capacity: matchingStock.Capacity,
                        Color: matchingStock.Color,
                        TotalVolume: Number(value || 0) + Number(delivered[key] || 0),
                        // Volume: Number(value) + Number(delivered[key] || 0),
                        Volume: Number(value),
                        Delivered: Number(delivered[key] || 0),
                        OilBalance: 0
                    };
                }
                return null;
            })
        ).filter(Boolean);

        const updatedVolume = gasStationOil.reduce((acc, row) => {
            Object.entries(row.Products).forEach(([key, value]) => {
                const matchingStock = stock.find((s) => s.ProductName === key);
                if (matchingStock) {
                    acc[key] = (acc[key] || 0) + Number(value) + Number(delivered[key] || 0);
                }
            });
            return acc;
        }, {});

        // อัปเดตข้อมูลในฐานข้อมูล
        database
            .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedProducts)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                window.location.reload();
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        database
            .ref("/depot/gasStations/" + (gasStationID - 1))
            .child("/Products")
            .update(updatedVolume)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                window.location.reload();
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const updateProduct = () => {
        const updatedProducts = 
        gasStationReport && gasStationReport.length > 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
        ? gasStationReport.map((row) => {
            return {
                ProductName: row.ProductName,
                Capacity: row.Capacity,
                Color: row.Color,
                TotalVolume: Number(row.TotalVolume) + Number(updateVolumes[row.ProductName] || 0),
                // Volume: Number(row.OldVolume) + Number(updateVolumes[row.ProductName] || 0), // คำนวณจากค่าใหม่
                Volume: row.Volume,
                Delivered: Number(row.Delivered) + Number(updateVolumes[row.ProductName] || 0), // ใช้ค่าใหม่ที่เก็บไว้ใน state
                OilBalance: row.OilBalance
            };
        })
        : []

        const updatedVolumes = 
        gasStationReport && gasStationReport.length > 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
        ? gasStationReport.reduce((acc, row) => {
            const updatedVolume =
              Number(row.TotalVolume) + Number(updateVolumes[row.ProductName] || 0);
          
            acc[row.ProductName] = updatedVolume; // เก็บค่าใน key ที่ตรงกับ ProductName
            return acc;
          }, {})
          : []

        // อัปเดตข้อมูลในฐานข้อมูล Firebase
        database
            .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedProducts)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                window.location.reload();
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

            database
            .ref("/depot/gasStations/" + (gasStationID - 1))
            .child("/Products")
            .update(updatedVolumes)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                window.location.reload();
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <Grid container spacing={2} sx={{ backgroundColor: "#eeeeee", marginTop: 2, p: 3, borderRadius: 5 }}>
                <Grid item xs={12} marginBottom={-2} marginTop={-3}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ผลิตภัณฑ์</Typography>
                </Grid>
                {
                    report === 0 || gasStationReport.length === 0 ?
                        gasStationOil.map((row) => (
                            Object.entries(row.Products).map(([key, value], index) => (
                                <React.Fragment key={index}>
                                    <Grid item xs={5} md={2} lg={1}>
                                        <Box
                                            sx={{
                                                backgroundColor: (key === "G91" ? "#92D050" :
                                                    key === "G95" ? "#FFC000" :
                                                        key === "B7" ? "#FFFF99" :
                                                            key === "B95" ? "#B7DEE8" :
                                                                key === "B10" ? "#32CD32" :
                                                                    key === "B20" ? "#228B22" :
                                                                        key === "E20" ? "#C4BD97" :
                                                                            key === "E85" ? "#0000FF" :
                                                                                key === "PWD" ? "#F141D8" :
                                                                                    "#FFD700"),
                                                borderRadius: 3,
                                                textAlign: "center",
                                                paddingTop: 2,
                                                paddingBottom: 1
                                            }}
                                            disabled
                                        >
                                            <Typography variant="h5" fontWeight="bold" gutterBottom>{key}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3.5} md={2} lg={1.5}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="textDisabled" gutterBottom >ปริมาณรวม</Typography>
                                        <Paper component="form" sx={{ marginTop: -1 }}>
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={new Intl.NumberFormat("en-US").format(Number(value) + Number(delivered[key] || 0))} // ใช้ NumberFormat สำหรับฟอร์แมตค่า
                                                disabled
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={3.5} md={2} lg={1.5}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom >รับเข้า</Typography>
                                        <Paper component="form" sx={{ marginTop: -1 }}>
                                            <TextField size="small" type="number" fullWidth
                                                value={delivered[key] || ""} // ดึงค่า newVolume ตาม ProductName
                                                onChange={(e) =>
                                                    handleNewVolumeChange(key, e.target.value)
                                                }
                                            />
                                        </Paper>
                                    </Grid>
                                </React.Fragment>
                            ))
                        ))
                        :
                        gasStationReport.map((row, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={setting ? 5 : 3} md={setting ? 2 : 1.5} lg={1}>
                                    <Box
                                        sx={{
                                            backgroundColor: row.Color,
                                            borderRadius: 3,
                                            textAlign: "center",
                                            paddingTop: 2,
                                            paddingBottom: 1
                                        }}
                                        disabled
                                    >
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>{row.ProductName}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={setting ? 3.5 : 3} md={setting ? 2 : 1.5} lg={setting ? 1.5 : 1}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="textDisabled" gutterBottom>ปริมาณรวม</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="text"
                                            fullWidth
                                            value={setting ? (new Intl.NumberFormat("en-US").format(Number(row.Volume))) : (new Intl.NumberFormat("en-US").format(Number(row.Volume)+ Number(row.Delivered) + Number(updateVolumes[row.ProductName] || 0)))}
                                            disabled
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={setting ? 3.5 : 3} md={setting ? 2 : 1.5} lg={setting ? 1.5 : 1}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="textDisabled" gutterBottom>รวมรับเข้า</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={setting ? (new Intl.NumberFormat("en-US").format(Number(row.Delivered))) : (new Intl.NumberFormat("en-US").format(Number(row.Delivered) + Number(updateVolumes[row.ProductName] || 0)))}
                                            onChange={(e) => handleUpdateVolumeChange(row.ProductName, e.target.value)} // เปลี่ยนค่าใน updateVolumes
                                            disabled
                                        />
                                    </Paper>
                                </Grid>
                                {
                                    setting ? "" :
                                    <Grid item xs={3} md={1.5} lg={1}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รับเข้า</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type={setting ? "" : "number"}
                                            fullWidth
                                            value={updateVolumes[row.ProductName] || 0}
                                            onChange={(e) => handleUpdateVolumeChange(row.ProductName, e.target.value)} // เปลี่ยนค่าใน updateVolumes
                                            disabled={setting ? true : false}
                                        />
                                    </Paper>
                                </Grid>
                                }
                            </React.Fragment>
                        ))
                }
            </Grid>
            <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
            {/* <Button variant="contained" color="success" onClick={saveProduct}>
                            บันทึก
                        </Button> */}
                {
                    isToday &&
                    (
                    report === 0 || gasStationReport.length === 0 ?
                        <Button variant="contained" color="success" onClick={saveProduct}>
                            บันทึก
                        </Button>
                        :
                        (
                            setting ?
                                <Button variant="contained" color="warning" sx={{ marginRight: 3 }} onClick={() => setSetting(false)}>
                                    แก้ไข
                                </Button>
                                :
                                <>
                                    <Button variant="contained" color="error" sx={{ marginRight: 3 }} onClick={() => setSetting(true)}>
                                        ยกเลิก
                                    </Button>
                                    <Button variant="contained" color="success" onClick={updateProduct}>
                                        บันทึก
                                    </Button>
                                </>
                        )
                    )
                }
            </Box>
        </React.Fragment>
    );
};

export default ReceiveOil;
