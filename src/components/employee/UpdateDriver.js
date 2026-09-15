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
import { apiPut } from "../../server/apiClient";
import { useBasicData } from "../../server/provider/BasicDataProvider";
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

    const { reghead, small, refetch: refetchBasicData } = useBasicData();
    const allReghead = Object.values(reghead || {});
    const allSmall = Object.values(small || {});

    // employee_drivers has two separate FK pairs now - Registration (big
    // trucks, -> truck_registration) and RegistrationSmall (-> truck_small) -
    // a driver can hold one of each. The "id:plate:type" composite this
    // dialog edits in-state is rebuilt from whichever pair matches TruckType.
    const currentTruckRow = driver.TruckType !== "รถเล็ก"
        ? allReghead.find((row) => row.uuid === driver.Registration)
        : allSmall.find((row) => row.uuid === driver.RegistrationSmall);
    const currentTruckType = driver.TruckType !== "รถเล็ก" ? "รถใหญ่" : "รถเล็ก";

    const [name, setName] = React.useState(driver.Name);
    const [idCard, setIDCard] = React.useState(driver.IDCard);
    const [registration, setRegistration] = React.useState(
        currentTruckRow
            ? `${currentTruckRow.id}:${currentTruckRow.RegHead}:${currentTruckType}`
            : `0:ไม่มี:${currentTruckType}`
    );
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
    // Available (driverless) trucks, plus whichever truck this driver is
    // already assigned to - the currently-assigned one is shown separately
    // via the "current value" MenuItem below, so it doesn't need to be here.
    const registrationHead = allReghead.filter((row) => !row.Driver);
    const registrationSmallTruck = allSmall.filter((row) => !row.Driver);
    const [bigTrucks, setBigTrucks] = useState(driver.TruckType !== "รถเล็ก" ? false : true);
    const [smallTrucks, setSmallTrucks] = useState(driver.TruckType !== "รถใหญ่" ? false : true);

    const handleDateChange = (newDate) => {
        setExpiration(newDate);
    };

    const handleUpdate = async () => {
        if (!driver?.uuid) {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
            return;
        }

        try {
            const [selectedIdRaw, , selectedType] = registration.split(":");
            const selectedId = Number(selectedIdRaw);
            const newTruckRow = selectedId <= 0
                ? null
                : selectedType === "รถใหญ่"
                    ? allReghead.find((row) => row.id === selectedId)
                    : allSmall.find((row) => row.id === selectedId);

            // Registration (-> truck_registration) and RegistrationSmall
            // (-> truck_small) are separate FK pairs now - only send the one
            // matching the selected truck type, so the other stays whatever
            // it already was (a driver can hold one of each).
            const registrationFields = selectedType === "รถใหญ่"
                ? { Registration: newTruckRow?.uuid || null, RegistrationName: newTruckRow?.RegHead || "ไม่มี" }
                : { RegistrationSmall: newTruckRow?.uuid || null, RegistrationSmallName: newTruckRow?.RegHead || "ไม่มี" };

            await apiPut(`/api/employee_drivers/${driver.uuid}`, {
                Name: name,
                IDCard: idCard,
                ...registrationFields,
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

            const truckChanged = currentTruckRow?.uuid !== newTruckRow?.uuid;

            // ล้างของเก่า (ถ้ามีและเปลี่ยนไปคันอื่น)
            if (truckChanged && currentTruckRow) {
                if (currentTruckType === "รถใหญ่") {
                    await apiPut(`/api/truck_registration/${currentTruckRow.uuid}`, {
                        Driver: null,
                        DriverName: "ไม่มี",
                    });
                } else {
                    await apiPut(`/api/truck_small/${currentTruckRow.uuid}`, {
                        Driver: null,
                        DriverName: "ไม่มี",
                    });
                }
            }

            // ใส่ค่าใหม่ (ถ้ามีและเปลี่ยนไปคันอื่น)
            if (truckChanged && newTruckRow) {
                if (selectedType === "รถใหญ่") {
                    await apiPut(`/api/truck_registration/${newTruckRow.uuid}`, {
                        Driver: driver.uuid,
                        DriverName: name,
                    });
                } else {
                    await apiPut(`/api/truck_small/${newTruckRow.uuid}`, {
                        Driver: driver.uuid,
                        DriverName: name,
                    });
                }
            }

            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            refetchBasicData?.();
            setUpdate(true);
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error:", error);
        }
    };

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
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.TruckType !== "รถเล็ก" ? driver.RegistrationName : driver.RegistrationSmallName}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.TruckType}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.BankID}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.BankName}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{driver.User}</TableCell>

            </TableRow>
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
