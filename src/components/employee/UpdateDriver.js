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
    FormControl,
    FormControlLabel,
    FormGroup,
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
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { database } from "../../server/firebase";
import InsertEmployee from "./InsertEmployee";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FilePreview from "../truck/UploadButton";

const UpdateDriver = (props) => {
    const { driver, index } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const [openTab, setOpenTab] = React.useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [name, setName] = React.useState(driver.Name);
    const [idCard, setIDCard] = React.useState(driver.IDCard);
    const [registration, setRegistration] = React.useState(driver.TruckType !== "รถเล็ก" ? `${driver.Registration}:รถใหญ่` : `${driver.Registration}:รถเล็ก`);
    const [bank, setBank] = React.useState(driver.BankName);
    const [bankID, setBankID] = React.useState(driver.BankID);
    const [salary, setSalary] = React.useState(driver.Salary);
    const [tripCost, setTripCost] = React.useState(driver.TripCost);
    const [pointCost, setPointCost] = React.useState(driver.PointCost);
    const [security, setSecurity] = React.useState(driver.Security);
    const [payment, setPayment] = React.useState("");
    const [deposit, setDeposit] = React.useState(driver.Deposit);
    const [loan, setLoan] = React.useState(driver.Loan);
    const [truckType, setTruckType] = React.useState(driver.TruckType);
    const [license, setLicense] = React.useState(driver.DrivingLicense);
    const [expiration, setExpiration] = React.useState(driver.DrivingLicenseExpiration);

    let initialFile = "ไม่แนบไฟล์";
    let initialFileType = 1;

    if (driver.DrivingLicensePicture) {
        const lower = driver.DrivingLicensePicture.toLowerCase();

        if (lower.endsWith(".pdf")) {
            initialFile = driver.DrivingLicensePicture;
            initialFileType = 2;
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) {
            initialFile = driver.DrivingLicensePicture;
            initialFileType = 3;
        }
    }

    const [file, setFile] = useState(initialFile);
    const [fileType, setFileType] = useState(initialFileType);

    const [phone, setPhone] = React.useState(driver.Phone);
    const [user, setUser] = React.useState(driver.User);
    const [registrationHead, setRegistrationHead] = React.useState([]);
    const [registrationSmallTruck, setRegistrationSmallTruck] = React.useState([]);
    const [bigTrucks, setBigTrucks] = useState(driver.TruckType !== "รถเล็ก" ? false : true);
    const [smallTrucks, setSmallTrucks] = useState(driver.TruckType !== "รถใหญ่" ? false : true);

    console.log("bigtruck : ", bigTrucks);
    console.log("smalltruck : ", smallTrucks);

    const handleDateChange = (newDate) => {
        setExpiration(newDate);
    };

    console.log("show date : " + dayjs(expiration).format("DD/MM/YYYY"));

    const getRegitration = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegistration = [];
            for (let id in datas) {
                if (datas[id].Driver === "0:ไม่มี") {
                    dataRegistration.push({ id, ...datas[id] })
                }
            }
            setRegistrationHead(dataRegistration);
        });

        database.ref("/truck/small/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegistration = [];
            for (let id in datas) {
                if (datas[id].Driver === "0:ไม่มี") {
                    dataRegistration.push({ id, ...datas[id] })
                }
            }
            setRegistrationSmallTruck(dataRegistration);
        });
    };

    useEffect(() => {
        getRegitration();
    }, []);

    console.log("registartion : ", driver.Registration.split(":")[0] - 1)

    const handleUpdate = async () => {
        try {
            await database.ref("/employee/drivers/").child(driver.id - 1).update({
                Name: name,
                IDCard: idCard,
                Registration: `${registration.split(":")[0]}:${registration.split(":")[1]}`,
                BankName: bank,
                BankID: bankID,
                Salary: salary,
                TripCost: tripCost,
                PointCost: pointCost,
                Security: security,
                Deposit: deposit,
                Loan: loan,
                TruckType: !bigTrucks && !smallTrucks ? "รถใหญ่/รถเล็ก" : !bigTrucks && smallTrucks ? "รถใหญ่" : bigTrucks && !smallTrucks ? "รถเล็ก" : "",
                DrivingLicense: license,
                DrivingLicenseExpiration: expiration === "ไม่มี" ? "ไม่มี" : dayjs(expiration).format("DD/MM/YYYY"),
                DrivingLicensePicture: file
            });

            const newTruckId = Number(registration?.split?.(":")[0] || 0);   // ค่าที่เลือกใหม่
            const oldTruckId = Number(driver?.Registration?.split?.(":")[0] || 0); // ค่าเดิม

            const updates = [];

            // หา path รถก่อน (ใช้ค่าใหม่ถ้ามี ไม่งั้นใช้ค่าเดิม)
            const truckTypeSource = registration !== "0:ไม่มี"
                ? registration
                : driver?.Registration || "";

            const truckPath =
                truckTypeSource.split(":")[2] === "รถใหญ่"
                    ? "/truck/registration/"
                    : "/truck/small/";


            // ✅ 1. ล้างของเก่า (ถ้ามี)
            if (oldTruckId !== 0) {
                updates.push(
                    database
                        .ref(truckPath)
                        .child(oldTruckId - 1)
                        .update({
                            Driver: "0:ไม่มี",
                        })
                );
            }

            // ✅ 2. ใส่ค่าใหม่ (ถ้ามี)
            if (newTruckId !== 0) {
                updates.push(
                    database
                        .ref(truckPath)
                        .child(newTruckId - 1)
                        .update({
                            Driver: `${driver.id}:${name}`,
                        })
                );
            }

            // 🚀 รอทุกอย่างเสร็จ
            if (updates.length > 0) {
                Promise.all(updates)
                    .then(() => {
                        console.log("Truck updated successfully");
                    })
                    .catch((err) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error(err);
                    });
            }


            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            setUpdate(true);
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error:", error);
        }
    };

    console.log("registration ss : ", registration);

    return (
        <React.Fragment>
            <TableRow key={driver.id}
                sx={{
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: "#ffebee",
                    },
                }}
                onClick={() => setOpen(driver.id)}
            >
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{index + 1}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.Name}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.IDCard}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.Registration?.split(":")[1]}</TableCell>
                {/* {renderSettingCell(driver)} */}
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.TruckType}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.BankID}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.BankName}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.User}</TableCell>

            </TableRow>
            {/* <TableCell sx={{ textAlign: "center" }}>
                <IconButton sx={{ marginTop: -0.5 }} onClick={() => setOpen(driver.id)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell> */}
            <Dialog
                open={open === driver.id ? true : false}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดพนักงานชื่อ{name}</Typography>
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
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อ-สกุล</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={name} disabled={update ? true : false} onChange={(e) => setName(e.target.value)} />
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>บัตรประชาชน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth variant="standard" value={idCard} disabled={update ? true : false} onChange={(e) => setIDCard(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ทะเบียนรถ</Typography>
                            </Grid>
                            <Grid item xs={4.5}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={registration.split(":")[1]} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={registration}
                                                onChange={(e) => setRegistration(e.target.value)}
                                            >
                                                {/* ค่าเริ่มต้น */}
                                                {registration && (
                                                    <MenuItem value={registration}>
                                                        {registration.split(":")[1] || "ไม่ระบุ"}
                                                    </MenuItem>
                                                )}
                                                <MenuItem value={`0:ไม่มี:${driver.TruckType !== "รถเล็ก" ? `รถใหญ่` : `รถเล็ก`}`}>ไม่มี</MenuItem>

                                                {(bigTrucks === false && smallTrucks === false) ? (
                                                    [
                                                        ...registrationHead.map((row) => (
                                                            <MenuItem key={`big-${row.id}`} value={row.id + ":" + row.RegHead + ":รถใหญ่"}>
                                                                {row.RegHead}
                                                            </MenuItem>
                                                        )),
                                                        ...registrationSmallTruck.map((row) => (
                                                            <MenuItem key={`small-${row.id}`} value={row.id + ":" + row.RegHead + ":รถเล็ก"}>
                                                                {row.RegHead}
                                                            </MenuItem>
                                                        )),
                                                    ]
                                                ) : bigTrucks === false ? (
                                                    registrationHead.map((row) => (
                                                        <MenuItem key={`big-${row.id}`} value={row.id + ":" + row.RegHead + ":รถใหญ่"}>
                                                            {row.RegHead}
                                                        </MenuItem>
                                                    ))
                                                ) : smallTrucks === false ? (
                                                    registrationSmallTruck.map((row) => (
                                                        <MenuItem key={`small-${row.id}`} value={row.id + ":" + row.RegHead + ":รถเล็ก"}>
                                                            {row.RegHead}
                                                        </MenuItem>
                                                    ))
                                                ) : ""
                                                }
                                            </Select>

                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ประเภทรถ</Typography>
                            </Grid>
                            <Grid item xs={4.5}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={driver.TruckType} disabled />
                                        :
                                        <FormGroup row>
                                            <FormControlLabel control={<Checkbox defaultChecked={!bigTrucks} onChange={() => setBigTrucks(!bigTrucks)} />} label="รถใหญ่" />
                                            <FormControlLabel control={<Checkbox defaultChecked={!smallTrucks} onChange={() => setSmallTrucks(!smallTrucks)} />} label="รถเล็ก" />
                                        </FormGroup>
                                    // <FormControl variant="standard" fullWidth>
                                    //     <Select
                                    //         labelId="demo-simple-select-standard-label"
                                    //         id="demo-simple-select-standard"
                                    //         value={truckType}
                                    //         onChange={(e) => setTruckType(e.target.value)}
                                    //     >
                                    //         <MenuItem value={truckType}>{truckType}</MenuItem>
                                    //         <MenuItem value={"รถใหญ่"}>รถใหญ่</MenuItem>
                                    //         <MenuItem value={"รถเล็ก"}>รถเล็ก</MenuItem>
                                    //     </Select>
                                    // </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ค่าเที่ยว</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={tripCost} disabled={update ? true : false} onChange={(e) => setTripCost(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ค่าจุด</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={pointCost} disabled={update ? true : false} onChange={(e) => setPointCost(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>User</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={user} disabled />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" whiteSpace="nowrap" gutterBottom>เบอร์โทร</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={phone} disabled={update ? true : false} onChange={(e) => setPhone(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} marginTop={2} marginBottom={2}>
                                <Divider>
                                    <Chip label="ข้อมูลการเงินของพนักงานขับรถ" size="small" />
                                </Divider>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เงินเดือน</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" type="number" value={salary} disabled={update ? true : false} onChange={(e) => setSalary(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เลขที่บัญชี</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={bankID} disabled={update ? true : false} onChange={(e) => setBankID(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ชื่อบัญชี</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={bank} disabled={update ? true : false} onChange={(e) => setBank(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>สวัสดิการ</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={security} disabled={update ? true : false} onChange={(e) => setSecurity(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เงินประกัน</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth type="number" variant="standard" value={deposit} disabled={update ? true : false} onChange={(e) => setDeposit(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เงินกู้ยืม</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth type="number" variant="standard" value={loan} disabled={update ? true : false} onChange={(e) => setLoan(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} marginTop={2} marginBottom={2}>
                                <Divider>
                                    <Chip label="ใบอนุญาตการขับขี่รถ" size="small" />
                                </Divider>
                            </Grid>
                            <Grid item xs={2} >
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เลขจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth variant="standard" value={license} disabled={update ? true : false} onChange={(e) => setLicense(e.target.value)} />
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>วันหมดอายุ</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={expiration} disabled />
                                        :
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(expiration === "ไม่มี" ? new Date : expiration).locale("th")}
                                                format="DD/MM/YYYY"
                                                slotProps={{ textField: { size: "small", variant: "standard" } }}
                                                sx={{ backgroundColor: theme.palette.primary.contrastText }}
                                                onChange={handleDateChange}
                                            />
                                        </LocalizationProvider>
                                }
                            </Grid>
                            {
                                file !== "ไม่มี" && file !== "ไม่แนบไฟล์" ? null :
                                    <React.Fragment>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                                        </Grid>
                                        <Grid item xs={12} textAlign="center">
                                            {
                                                update ?
                                                    <>
                                                        <Box textAlign="center">
                                                            {/* <TextField
                                                                                                        size="small"
                                                                                                        type="text"
                                                                                                        fullWidth
                                                                                                        value={file.name}
                                                                                                        sx={{ marginRight: 2 }}
                                                                                                    /> */}

                                                            <Box display="flex" alignItems="center" justifyContent="center" >
                                                                {
                                                                    file === "ไม่แนบไฟล์" ?
                                                                        <ImageNotSupportedIcon fontSize="small" color="disabled" sx={{ width: 200, height: 200 }} />
                                                                        :
                                                                        <FilePreview file={file} />
                                                                }
                                                            </Box>
                                                            <Box textAlign="center">
                                                                {file instanceof File ? (
                                                                    // ✅ กรณีเป็น File object
                                                                    <Typography variant="subtitle1" gutterBottom>
                                                                        {file.name}
                                                                    </Typography>
                                                                ) : (
                                                                    // ✅ กรณีเป็น path (string)
                                                                    file === "ไม่แนบไฟล์" ? null :
                                                                        <Typography
                                                                            variant="subtitle2"
                                                                            gutterBottom
                                                                            component="a"
                                                                            href={file.startsWith("http") ? file : `https://${file}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            sx={{
                                                                                wordBreak: "break-all",
                                                                                textDecoration: "underline",
                                                                                color: "primary.main",
                                                                                cursor: "pointer"
                                                                            }}
                                                                        >
                                                                            {file}
                                                                        </Typography>

                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </>
                                                    :
                                                    <React.Fragment>
                                                        {
                                                            file === "ไม่แนบไฟล์" ?
                                                                <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingLeft: 3, paddingRight: 3 }}>
                                                                    <Button
                                                                        variant="contained"
                                                                        component="label"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            height: "50px",
                                                                            backgroundColor: fileType === 1 ? "#5552ffff" : "#eeeeee",
                                                                            borderRadius: 2,
                                                                        }}
                                                                        onClick={() => { setFileType(1); setFile("ไม่แนบไฟล์"); }}
                                                                    >
                                                                        <Typography
                                                                            variant="subtitle2"
                                                                            fontWeight="bold"
                                                                            color={fileType === 1 ? "white" : "lightgray"}
                                                                            sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                                                                            gutterBottom
                                                                        >
                                                                            ไม่แนบไฟล์
                                                                        </Typography>
                                                                        <FolderOffIcon
                                                                            sx={{
                                                                                fontSize: 30,
                                                                                color: fileType === 1 ? "white" : "lightgray",
                                                                                marginLeft: 0.5,
                                                                            }}
                                                                        />
                                                                    </Button>
                                                                    {/* <Chip label="หรือ" size="small" sx={{ marginLeft: 3, marginRight: 3 }} /> */}
                                                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 3, marginRight: 3, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                                                    <Button
                                                                        variant="contained"
                                                                        component="label"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            height: "50px",
                                                                            backgroundColor: fileType === 2 ? "#ff5252" : "#eeeeee",
                                                                            borderRadius: 2,
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                        }}
                                                                        onClick={() => setFileType(2)}
                                                                    >
                                                                        <Typography
                                                                            variant="h6"
                                                                            fontWeight="bold"
                                                                            color={fileType === 2 ? "white" : "lightgray"}
                                                                            gutterBottom
                                                                        >
                                                                            PDF
                                                                        </Typography>
                                                                        <PictureAsPdfIcon
                                                                            sx={{
                                                                                fontSize: 40,
                                                                                color: fileType === 2 ? "white" : "lightgray",
                                                                                marginLeft: 0.5,
                                                                            }}
                                                                        />
                                                                        <input
                                                                            type="file"
                                                                            hidden
                                                                            accept="application/pdf"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) setFile(file);
                                                                            }}
                                                                        />
                                                                    </Button>
                                                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 3, marginRight: 3, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                                                    <Button
                                                                        variant="contained"
                                                                        component="label"
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={{
                                                                            height: "50px",
                                                                            backgroundColor: fileType === 3 ? "#29b6f6" : "#eeeeee",
                                                                            borderRadius: 2,
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                        }}
                                                                        onClick={() => setFileType(3)}
                                                                    >
                                                                        <Typography
                                                                            variant="h6"
                                                                            fontWeight="bold"
                                                                            color={fileType === 3 ? "white" : "lightgray"}
                                                                            gutterBottom
                                                                        >
                                                                            รูปภาพ
                                                                        </Typography>
                                                                        <ImageIcon
                                                                            sx={{
                                                                                fontSize: 40,
                                                                                color: fileType === 3 ? "white" : "lightgray",
                                                                                marginLeft: 0.5,
                                                                            }}
                                                                        />
                                                                        <input
                                                                            type="file"
                                                                            hidden
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) setFile(file);
                                                                            }}
                                                                        />
                                                                    </Button>
                                                                </Box>
                                                                :
                                                                <Box textAlign="center">
                                                                    {/* <TextField
                                                                                                        size="small"
                                                                                                        type="text"
                                                                                                        fullWidth
                                                                                                        value={file.name}
                                                                                                        sx={{ marginRight: 2 }}
                                                                                                    /> */}

                                                                    <Box display="flex" alignItems="center" justifyContent="center" >
                                                                        <FilePreview file={file} />
                                                                        <Button variant="outlined" color="error" size="small" sx={{ marginLeft: 2 }} onClick={() => { setFileType(1); setFile("ไม่แนบไฟล์"); }}>
                                                                            <DeleteForeverIcon />
                                                                        </Button>
                                                                    </Box>
                                                                    <Box textAlign="center">
                                                                        <Typography variant="subtitle1" gutterBottom>{file.name}</Typography>
                                                                    </Box>
                                                                </Box>
                                                            // <Box sx={{
                                                            //     display: "flex",
                                                            //     alignItems: "center",
                                                            //     justifyContent: "space-between", // ช่วยแยกซ้ายขวา
                                                            //     paddingLeft: 12,
                                                            // }}>
                                                            //     <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                            //         File : {file.name}
                                                            //     </Typography>
                                                            //     {/* <IconButton color="error" onClick={() => { setFile(null); setFileType(null); }}>
                                                            //         <DeleteForeverIcon />
                                                            //     </IconButton> */}
                                                            //     <Button variant="outlined" color="error" size="small" onClick={() => { setFile(null); setFileType(null); }}>
                                                            //         ลบไฟล์
                                                            //     </Button>
                                                            // </Box>
                                                        }
                                                    </React.Fragment>
                                            }
                                        </Grid>
                                    </React.Fragment>
                            }
                        </Grid>
                    </Paper>
                    {
                        update ?
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="info" sx={{ marginRight: 2 }}>พิมพ์</Button>
                            </Box>
                            :
                            ""
                    }
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

export default UpdateDriver;
