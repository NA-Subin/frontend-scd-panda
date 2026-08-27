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
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
    Stack,
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
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import theme from "../../../theme/theme";
import { IconButtonError, IconButtonSuccess, IconButtonWarning, RateOils, TablecellHeader } from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useData } from "../../../server/path";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import FilePreview from "../UploadButton";

const UpdateSmallTruck = (props) => {
    const { truck, open, onClose, type } = props;
    const [update, setUpdate] = React.useState(true);

    const [openTab, setOpenTab] = React.useState(true);

    // const { company, drivers } = useData();
    const { company, drivers } = useBasicData();
    const dataCompany = Object.values(company || {});
    const dataDrivers = Object.values(drivers || {});
    const employees = dataDrivers.filter(row => row.Registration && row.Registration === "0:ไม่มี" && (row.TruckType === "รถเล็ก" || row.TruckType === "รถใหญ่/รถเล็ก"));

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [companies, setCompanies] = React.useState(truck.Company);
    const [driver, setDriver] = React.useState(truck.Driver);
    const [registration, setRegistration] = React.useState(truck.RegHead);
    const [weight, setWeight] = React.useState(truck.Weight);
    const [insurance, setInsurance] = React.useState(truck.Insurance);
    const [vehicleRegistration, setVehicleRegistration] = React.useState(truck.VehicleRegistration === "มี" ? true : false);
    const [vehExpirationDate, setVehExpirationDate] = React.useState(truck.VehExpirationDate || "-");
    const [shortName, setShortName] = React.useState(truck.ShortName);

    let initialFile = "ไม่แนบไฟล์";
    let initialFileType = 1;

    if (truck?.Path) {
        const lower = truck.Path.toLowerCase();

        if (lower.endsWith(".pdf")) {
            initialFile = truck.Path;
            initialFileType = 2;
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) {
            initialFile = truck.Path;
            initialFileType = 3;
        }
    }

    const [file, setFile] = useState(initialFile);
    const [fileType, setFileType] = useState(initialFileType);

    console.log("show truck", Number(truck.Driver.split(":")[0]) - 1);
    console.log("show Driver : ", driver);

    const handleCancle = () => {
        setCompanies(truck.Company);
        setDriver(truck.Driver);
        setRegistration(truck.RegHead);
        setWeight(truck.Weight);
        setInsurance(truck.Insurance);
        setVehicleRegistration(truck.VehicleRegistration || "-");
        setVehExpirationDate(truck.VehExpirationDate || "-");
        setShortName(truck.ShortName);
        setFile(initialFile);
        setFileType(initialFileType);
        setUpdate(true);
    }

    const handleUpdate = async () => {
        try {

            if (!file) return alert("กรุณาเลือกไฟล์ก่อน");

            let img = "ไม่แนบไฟล์"; // ตั้งค่าเริ่มต้นไว้เลย

            // ✅ ตรวจสอบก่อนว่า file เป็น "ไม่แนบไฟล์" หรือไม่
            if (file !== "ไม่แนบไฟล์") {
                const formData = new FormData();
                formData.append("pic", file);

                try {
                    const response = await fetch("https://upload.happysoftth.com/panda/uploads", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    img = data.file_path;
                } catch (err) {
                    console.error("Upload failed:", err);
                }
            }
            await database
                .ref("/truck/small/")
                .child(truck.id - 1)
                .update({
                    RegHead: registration,
                    ShortName: shortName,
                    Weight: weight,
                    Insurance: insurance,
                    VehicleRegistration: vehicleRegistration ? "มี" : "ไม่มี",
                    VehExpirationDate: vehExpirationDate,
                    Company: companies,
                    Driver: driver,
                    Path: vehicleRegistration ? img : "ไม่แนบไฟล์"
                });

            const regId = driver?.split?.(":")[0] || "0";
            const drvId = truck?.Driver?.split?.(":")[0] || "0";

            const driverIdPart = drvId === "0"
                ? regId
                : (regId === "0" ? drvId : drvId);
            const driverId = Number(driverIdPart);

            // const driverIdPart = driver?.split(":")[0];
            // const driverId = Number(driverIdPart);

            if (!isNaN(driverId) && driverId > 0) {
                await database
                    .ref("/employee/drivers/")
                    .child(driverId - 1)
                    .update({
                        Registration: driver !== "0:ไม่มี" ? `${truck.id}:${registration}` : driver,
                    });
            }

            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            console.log("Data pushed successfully");
            setUpdate(true);
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    return (
        <React.Fragment>
            {/* <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpen(registration)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell> */}
            <Dialog
                open={open && type === "รายละเอียด" ? true : false}   // convert เป็น boolean ให้แน่นอน
                keepMounted
                onClose={onClose} // ใช้ตรง ๆ
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดรถทะเบียน{registration}</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={onClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Box marginTop={2} marginBottom={-2}>
                        <Typography variant="subtitle1" fontWeight="bold" color={truck.RepairTruck.split(":")[1] === "ตรวจสอบสภาพรถแล้ว" ? theme.palette.success.main : theme.palette.warning.main} textAlign="right" marginRight={2} gutterBottom>{truck.RepairTruck.split(":")[1]}</Typography>
                    </Box>
                    <Paper
                        sx={{ p: 2, border: "1px solid" + theme.palette.grey[600], marginTop: 2, marginBottom: 2 }}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อพนักงานขับรถ</Typography>
                            </Grid>
                            <Grid item xs={10}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={driver.split(":")[1]} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={driver}
                                                onChange={(e) => setDriver(e.target.value)}
                                            >
                                                <MenuItem value={driver}>{driver.split(":")[1]}</MenuItem>
                                                {
                                                    driver !== "0:ไม่มี" &&
                                                    <MenuItem value={"0:ไม่มี"}>ไม่มี</MenuItem>
                                                }
                                                {
                                                    employees.map((row) => (
                                                        row.id !== driver.split(":")[0] &&
                                                        <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="left" gutterBottom>ชื่อย่อ</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={shortName} onChange={(e) => setShortName(e.target.value)} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <TextField fullWidth variant="standard" value={registration} onChange={(e) => setRegistration(e.target.value)} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>น้ำหนัก</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField fullWidth variant="standard" value={weight} onChange={(e) => setWeight(e.target.value)} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประกัน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth variant="standard" value={insurance} onChange={((e) => setInsurance(e.target.value))} disabled={update ? true : false} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>บริษัท</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={companies.split(":")[1]} disabled />
                                        :
                                        <FormControl
                                            variant="standard"
                                            fullWidth
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': { height: '30px' },
                                                '& .MuiInputBase-input': { fontSize: "16px", textAlign: 'left' },
                                            }}
                                        >
                                            <Select
                                                value={companies}
                                                onChange={(e) => setCompanies(e.target.value)}
                                            >
                                                <MenuItem value={companies} sx={{ fontSize: "14px", }}>{companies.split(":")[1]}</MenuItem>
                                                {Number(companies.split(":")[0]) !== 2 && <MenuItem value="2:บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" sx={{ fontSize: "14px", }}>บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)</MenuItem>}
                                                {Number(companies.split(":")[0]) !== 3 && <MenuItem value="3:หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)" sx={{ fontSize: "14px", }}>หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)</MenuItem>}
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={12} display="flex" textAlign="right">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" marginRight={0.5} gutterBottom>สถานะ:</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="green" textAlign="center" gutterBottom>{truck.Status}</Typography>
                            </Grid>
                            <Grid item xs={12} marginTop={2} marginBottom={2}>
                                <Divider>
                                    <Chip label="ใบจดทะเบียนรถ" size="small" />
                                </Divider>
                            </Grid>
                            <Grid item xs={2} >
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เลขจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Stack direction="row" spacing={2}>
                                    {/* มี */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                disabled={update}
                                                checked={vehicleRegistration === true}
                                                onChange={() => setVehicleRegistration(true)}
                                            />
                                        }
                                        label="มี"
                                    />

                                    {/* ไม่มี */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                disabled={update}
                                                checked={vehicleRegistration === false}
                                                onChange={() => setVehicleRegistration(false)}
                                            />
                                        }
                                        label="ไม่มี"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={2}>
                                {!vehicleRegistration ? null : <Typography variant="subtitle1" fontWeight="bold" gutterBottom>วันหมดอายุ</Typography>}
                            </Grid>
                            <Grid item xs={4}>
                                {!vehicleRegistration ? null : <TextField variant="standard" fullWidth value={vehExpirationDate} disabled={update ? true : false} onChange={(e) => setVehExpirationDate(e.target.value)} />}
                            </Grid>
                            {
                                !vehicleRegistration ? null :
                                    <React.Fragment>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                                        </Grid>
                                        <Grid item xs={12} textAlign="center">
                                            {
                                                truck.VehPicture === "ไม่มี" ?
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
                                                    :
                                                    <>
                                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                                                        <Button variant="contained" color="warning" >แก้ไขรูปภาพ</Button>
                                                    </>
                                            }
                                        </Grid>
                                    </React.Fragment>
                            }
                        </Grid>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        update ?
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="warning" onClick={() => setUpdate(false)} sx={{ marginRight: 2 }}>แก้ไข</Button>
                                {/* <Button variant="contained" color="info">พิมพ์</Button> */}
                            </Box>
                            :
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="error" onClick={handleCancle} sx={{ marginRight: 2 }}>ยกเลิก</Button>
                                <Button variant="contained" color="success" onClick={handleUpdate} >บันทึก</Button>
                            </Box>
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateSmallTruck;
