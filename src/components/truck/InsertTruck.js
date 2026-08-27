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
    FormControlLabel,
    FormGroup,
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
import FolderOffIcon from '@mui/icons-material/FolderOff';
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UploadButton from "./UploadButton";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import FilePreview from "./UploadButton";

const InsertTruck = (props) => {
    const { openMenu } = props;
    const [menu, setMenu] = React.useState(Number(openMenu));

    React.useEffect(() => {
        setMenu(Number(openMenu)); // อัปเดต check เมื่อ openMenu เปลี่ยนแปลง
    }, [openMenu]);

    const [open, setOpen] = React.useState(false);
    const [licenseRegHead, setLicenseRegHead] = React.useState(true);
    const [licenseRegTail, setLicenseRegTail] = React.useState(true);
    const [licenseSmallTruck, setLicenseSmallTruck] = React.useState(true);

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

    // const [company, setCompany] = useState([]);
    // const [driver, setDriver] = useState([]);
    const [registrationTail, setRegistrationTail] = useState([]);
    // const [drivers, setDrivers] = useState(0);
    const [companies, setCompanies] = useState(0);
    const [tail, setTail] = useState("ไม่มี:::");
    const [regHead, setRegHead] = React.useState("");
    const [cap, setCap] = React.useState("");
    const [weight, setWeight] = React.useState("");
    const [vehicleRegistration, setVehicleRegistration] = React.useState("");
    const [dateEndTax, setDateEndTax] = React.useState("");
    const [dateEndInsurance, setDateEndInsurance] = React.useState("");
    const [dateEnd, setDateEnd] = React.useState("");
    const [registration, setRegistration] = React.useState("");
    const [regTail, setRegTail] = React.useState("");
    const [shortName, setShortName] = React.useState("");
    const [file, setFile] = useState("ไม่แนบไฟล์");
    const [fileType, setFileType] = useState(1);

    const [fields, setFields] = useState([]); // เก็บค่าของแต่ละช่องกรอก

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงใน cap
    const handleCapChange = (e) => {
        const value = parseInt(e.target.value) || 0; // แปลงค่าจาก TextField เป็นตัวเลข
        setCap(value);

        // สร้าง array ของช่องกรอกข้อมูล
        const newFields = Array.from({ length: value }, (_, index) => ({
            id: index + 1, // id เริ่มจาก 1
            value: 0, // ค่าเริ่มต้นเป็นค่าว่าง
        }));
        setFields(newFields);
    };

    const [tailWeight, setTailWeight] = React.useState(0);

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในแต่ละช่อง
    const handleFieldChange = (id, value) => {
        setFields((prevFields) => {
            const updatedFields = prevFields.map((field) =>
                field.id === id ? { ...field, value: parseFloat(value) || 0 } : field
            );

            // คำนวณผลรวมของ value จาก updatedFields
            const totalValue = updatedFields.reduce((sum, field) => sum + field.value, 0);

            // อัปเดต TailWeight ด้วยผลรวม
            //   setTailWeight(totalValue);

            return updatedFields;
        });
    };

    // const { company, drivers, reghead, regtail, small } = useData();
    const { company, drivers, reghead, regtail, small } = useBasicData();
    const dataCompany = Object.values(company || {});
    const dataDrivers = Object.values(drivers || {});
    const regheads = Object.values(reghead || {});
    const regtails = Object.values(regtail || {});
    const smalls = Object.values(small || {});

    const driverDetail = dataDrivers.filter((row) => row.Status === "ว่าง" && row.StatusTruck !== "ยกเลิก");
    const regtailsDetail = regtails.filter((row) => row.Status === "ยังไม่เชื่อมต่อทะเบียนหัว" && row.StatusTruck !== "ยกเลิก");

    console.log("registrationTail : ", regtailsDetail);
    console.log("Comapy : ", companies);

    const handlePost = async () => {
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
        if (menu === 1) {
            database
                .ref("/truck/registration/")
                .child(regheads.length)
                .update({
                    id: regheads.length + 1,
                    Company: companies,
                    RegHead: regHead,
                    RegTail: tail? `${tail.split(":")[0]}:${tail.split(":")[1]}` : "0:ไม่มี",
                    RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
                    Weight: weight,
                    TotalWeight: (parseFloat(weight) + parseFloat(tail.split(":")[3])),
                    Insurance: "-",
                    Act: "-",
                    Status: "ว่าง",
                    Driver: "0:ไม่มี",
                    VehicleRegistration: licenseRegHead === "มี" ? vehicleRegistration : "ไม่มี",
                    DateEndTax: licenseRegHead === "มี" ? dateEndTax : "ไม่มี",
                    DateEndInsurance: licenseRegHead === "มี" ? dateEndInsurance : "ไม่มี",
                    VehPicture: "ไม่มี",
                    Path: img
                })
                .then(() => {
                    if (tail.split(":")[1] !== "ไม่มี") {
                        database
                            .ref("/truck/registrationTail/")
                            .child(Number(tail.split(":")[0]) - 1)
                            .update({
                                Status: "เชื่อมทะเบียนหัวแล้ว",
                            })
                            .then(() => {
                                console.log("Data pushed successfully");
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });
                    }
                    ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                    console.log("Data pushed successfully");
                    setCompanies("");
                    setRegHead("");
                    setTail("");
                    setWeight("");
                    setLicenseRegHead("");
                    setVehicleRegistration("");
                    setDateEndTax("");
                    setDateEndInsurance("");
                    setFile("ไม่แนบไฟล์");
                    setFileType(1);
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        } else if (menu === 2) {
            const capFields = fields.reduce((acc, field) => {
                acc[`Cap${field.id}`] = field.value || 0; // หากไม่มีค่าให้ใส่เป็น 0
                return acc;
            }, {});

            database
                .ref("/truck/registrationTail/")
                .child(regtails.length)
                .update({
                    id: regtails.length + 1,
                    Company: companies,
                    RegTail: regTail,
                    Weight: tailWeight,
                    Cap: cap,
                    Insurance: "-",
                    Status: "ยังไม่เชื่อมต่อทะเบียนหัว",
                    ...capFields, // เพิ่ม capFields ที่แปลงแล้วเข้าไป
                    VehicleRegistration: licenseRegTail === "มี" ? vehicleRegistration : "ไม่มี",
                    DateEndTax: licenseRegTail === "มี" ? dateEndTax : "ไม่มี",
                    DateEndInsurance: licenseRegTail === "มี" ? dateEndInsurance : "ไม่มี",
                    VehPicture: "ไม่มี",
                    Path: img
                })
                .then(() => {
                    ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                    console.log("Data pushed successfully");
                    setCompanies("");
                    setRegTail("");
                    setWeight("");
                    setCap("");
                    setTailWeight(0);
                    setLicenseRegTail("");
                    setVehicleRegistration("");
                    setDateEndTax("");
                    setDateEndInsurance("");
                    setFile("ไม่แนบไฟล์");
                    setFileType(1);
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        } else {
            database
                .ref("/truck/small/")
                .child(smalls.length)
                .update({
                    id: smalls.length + 1,
                    Company: companies,
                    ShortName: shortName,
                    RegHead: registration,
                    RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
                    Weight: weight,
                    Insurance: "-",
                    Act: "-",
                    Status: "ว่าง",
                    Driver: "ไม่มี",
                    VehicleRegistration: licenseSmallTruck === "มี" ? vehicleRegistration : "ไม่มี",
                    DateEndTax: licenseSmallTruck === "มี" ? dateEndTax : "ไม่มี",
                    DateEndInsurance: licenseSmallTruck === "มี" ? dateEndInsurance : "ไม่มี",
                    VehPicture: "ไม่มี",
                    Path: img
                })
                .then(() => {
                    ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                    console.log("Data pushed successfully");
                    setCompanies("");
                    setWeight("");
                    setRegistration("");
                    setLicenseSmallTruck("");
                    setVehicleRegistration("");
                    setDateEndTax("");
                    setDateEndInsurance("");
                    setFile("ไม่แนบไฟล์");
                    setFileType(1);
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        }
    };

    return (
        <React.Fragment>
            <Box textAlign="right" marginBottom={-7}>
                <Button variant="contained" color="info" onClick={handleClickOpen}>เพิ่มรถบรรทุก</Button>
            </Box>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleClose}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มรถบรรทุก</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2}>
                        <Grid item md={2} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ประเภทรถ</Typography>
                        </Grid>
                        <Grid item md={4} xs={9}>
                            <Paper
                                component="form">
                                <Select
                                    id="demo-simple-select"
                                    value={menu}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setMenu(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกประเภทรถ
                                    </MenuItem>
                                    <MenuItem value={1}>รถใหญ่</MenuItem>
                                    <MenuItem value={2}>หางรถ</MenuItem>
                                    <MenuItem value={3}>รถเล็ก</MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        <Grid item md={2} xs={3}>
                            <Typography variant="subtitle1" textAlign="right" fontWeight="bold" marginTop={1} gutterBottom>เลือกบริษัท</Typography>
                        </Grid>
                        <Grid item md={4} xs={9}>
                            <Paper
                                component="form">
                                {/* <Select
                                    id="demo-simple-select"
                                    value={companies}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setCompanies(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกบริษัท
                                    </MenuItem>
                                    {
                                        menu !== 3 ?
                                            dataCompany.map((row) => (
                                                row.id != 1 &&
                                                <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                            ))
                                            :
                                            dataCompany.map((row) => (
                                                <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                            ))
                                    }
                                </Select> */}
                                <Select
                                    id="demo-simple-select"
                                    value={companies}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setCompanies(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกบริษัท
                                    </MenuItem>
                                    <MenuItem value="2:บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" sx={{ fontSize: "14px", }}>บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)</MenuItem>
                                    <MenuItem value="3:หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)" sx={{ fontSize: "14px", }}>หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)</MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        {
                            menu === 1 ?
                                <>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ทะเบียนหัว</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={regHead} onChange={(e) => setRegHead(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>น้ำหนัก</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom marginTop={1}>ใบจดทะเบียนหัว</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <FormControlLabel
                                            checked={licenseRegHead === "มี" ? true : false}
                                            control={<Checkbox onChange={() => setLicenseRegHead("มี")} />}
                                            label="มี"
                                        />
                                        <FormControlLabel
                                            checked={licenseRegHead === "ไม่มี" ? true : false}
                                            control={<Checkbox onChange={() => setLicenseRegHead("ไม่มี")} />}
                                            label="ไม่มี"
                                        />
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" textAlign="right" fontWeight="bold" marginTop={1} gutterBottom>ทะเบียนหาง</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={tail}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setTail(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={"ไม่มี:::"}>
                                                    กรุณาเลือกทะเบียนหาง
                                                </MenuItem>
                                                <MenuItem value={"0:ไม่มี:0:0"}>
                                                    ไม่มี
                                                </MenuItem>
                                                {
                                                    regtailsDetail.map((row) => (
                                                        // row.Company === companies &&
                                                        <MenuItem value={row.id + ":" + row.RegTail + ":" + row.Cap + ":" + row.Weight}>{row.RegTail}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ช่อง</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            {
                                                tail.split(":")[1] === "ไม่มี" ?
                                                    <TextField size="small" fullWidth disabled value={0} onChange={(e) => setCap(e.target.value)} sx={{ backgroundColor: "lightgray" }} />
                                                    :
                                                    <TextField size="small" fullWidth disabled value={tail.split(":")[2]} onChange={(e) => setCap(e.target.value)} sx={{ backgroundColor: "lightgray" }} />
                                            }
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>น้ำหนักรวม</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" disabled fullWidth value={Number(weight) + Number(tail.split(":")[3])} sx={{ backgroundColor: "lightgray" }} />
                                        </Paper>
                                    </Grid>
                                    {
                                        licenseRegHead === "มี" ?
                                            <>
                                                <Grid item md={12} xs={12}>
                                                    <Divider>
                                                        <Chip label="ใบจดทะเบียนหัวรถใหญ่" size="small" />
                                                    </Divider>
                                                </Grid>
                                                <Grid item md={2} xs={3}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่</Typography>
                                                </Grid>
                                                <Grid item md={4} xs={9}>
                                                    <Paper component="form" >
                                                        <TextField size="small" fullWidth value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item md={2} xs={3}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุภาษี</Typography>
                                                </Grid>
                                                <Grid item md={4} xs={9}>
                                                    <Paper component="form" >
                                                        <TextField size="small" fullWidth value={dateEndTax} onChange={(e) => setDateEndTax(e.target.value)} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item md={2} xs={3}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุประกัน</Typography>
                                                </Grid>
                                                <Grid item md={4} xs={9}>
                                                    <Paper component="form" >
                                                        <TextField size="small" fullWidth value={dateEndInsurance} onChange={(e) => setDateEndInsurance(e.target.value)} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item md={12} xs={12}>
                                                    <Divider>
                                                        <Chip label="เพิ่มไฟล์เพิ่มเติม" size="small" sx={{ marginTop: -0.5, marginBottom: 1 }} />
                                                    </Divider>
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
                                                </Grid>
                                            </>
                                            : ""
                                    }
                                </>
                                : menu === 2 ?
                                    <>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ทะเบียนหาง</Typography>
                                        </Grid>
                                        <Grid item md={4} xs={9}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={regTail} onChange={(e) => setRegTail(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ใบจดทะเบียนหาง</Typography>
                                        </Grid>
                                        <Grid item md={4} xs={9}>
                                            <FormControlLabel
                                                checked={licenseRegTail === "มี" ? true : false}
                                                control={<Checkbox onChange={() => setLicenseRegTail("มี")} />}
                                                label="มี"
                                            />
                                            <FormControlLabel
                                                checked={licenseRegTail === "ไม่มี" ? true : false}
                                                control={<Checkbox onChange={() => setLicenseRegTail("ไม่มี")} />}
                                                label="ไม่มี"
                                            />
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ช่อง</Typography>
                                        </Grid>
                                        <Grid item md={4} xs={9}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={cap} onChange={handleCapChange} />
                                            </Paper>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>น้ำหนัก</Typography>
                                        </Grid>
                                        <Grid item md={4} xs={9}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={tailWeight} onChange={(e) => setTailWeight(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        {
                                            cap !== "" && cap !== 0 && cap !== null &&
                                            fields.map((field) => (
                                                <React.Fragment key={field.id}>
                                                    {/* <Grid item md={12} xs={12}/> */}
                                                    <Grid item md={2} xs={3}>
                                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ marginTop: 1 }} gutterBottom>{`ช่องที่ ${field.id}`}</Typography>
                                                    </Grid>
                                                    <Grid item md={4} xs={9}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            value={field.value}
                                                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                        />
                                                    </Grid>
                                                    {/* <Grid item md={12} xs={12}/> */}
                                                </React.Fragment>
                                            ))}
                                        {
                                            licenseRegTail === "มี" ?
                                                <>
                                                    <Grid item md={12} xs={12}>
                                                        <Divider>
                                                            <Chip label="ใบจดทะเบียนหางรถใหญ่" size="small" />
                                                        </Divider>
                                                    </Grid>
                                                    <Grid item md={2} xs={3}>
                                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่</Typography>
                                                    </Grid>
                                                    <Grid item md={4} xs={9}>
                                                        <Paper component="form" >
                                                            <TextField size="small" fullWidth value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} />
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item md={2} xs={3}>
                                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุ</Typography>
                                                    </Grid>
                                                    <Grid item md={4} xs={9}>
                                                        <Paper component="form" >
                                                            <TextField size="small" fullWidth value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item md={12} xs={12}>
                                                        <Divider>
                                                            <Chip label="เพิ่มไฟล์เพิ่มเติม" size="small" sx={{ marginTop: -0.5, marginBottom: 1 }} />
                                                        </Divider>
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
                                                    </Grid>
                                                </>
                                                : ""
                                        }
                                    </>
                                    :
                                    menu === 3 ?
                                        <>
                                            <Grid item md={2} xs={3}>
                                                <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>ชื่อย่อรถเล็ก</Typography>
                                            </Grid>
                                            <Grid item md={4} xs={9}>
                                                <Paper component="form">
                                                    <TextField size="small" fullWidth value={shortName} onChange={(e) => setShortName(e.target.value)} />
                                                </Paper>
                                            </Grid>
                                            <Grid item md={2} xs={3}>
                                                <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>ทะเบียน</Typography>
                                            </Grid>
                                            <Grid item md={4} xs={9}>
                                                <Paper component="form">
                                                    <TextField size="small" fullWidth value={registration} onChange={(e) => setRegistration(e.target.value)} />
                                                </Paper>
                                            </Grid>
                                            <Grid item md={2} xs={3}>
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom marginTop={1}>ใบจดทะเบียน</Typography>
                                            </Grid>
                                            <Grid item md={4} xs={9}>
                                                <FormControlLabel
                                                    checked={licenseSmallTruck === "มี" ? true : false}
                                                    control={<Checkbox onChange={() => setLicenseSmallTruck("มี")} />}
                                                    label="มี"
                                                />
                                                <FormControlLabel
                                                    checked={licenseSmallTruck === "ไม่มี" ? true : false}
                                                    control={<Checkbox onChange={() => setLicenseSmallTruck("ไม่มี")} />}
                                                    label="ไม่มี"
                                                />
                                            </Grid>
                                            <Grid item md={2} xs={3}>
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>น้ำหนัก</Typography>
                                            </Grid>
                                            <Grid item md={4} xs={9}>
                                                <Paper component="form">
                                                    <TextField size="small" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} />
                                                </Paper>
                                            </Grid>
                                            {
                                                licenseSmallTruck === "มี" ?
                                                    <>
                                                        <Grid item md={12} xs={12}>
                                                            <Divider>
                                                                <Chip label="ใบจดทะเบียนรถเล็ก" size="small" />
                                                            </Divider>
                                                        </Grid>
                                                        <Grid item md={2} xs={3}>
                                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่</Typography>
                                                        </Grid>
                                                        <Grid item md={4} xs={9}>
                                                            <Paper component="form" >
                                                                <TextField size="small" fullWidth value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item md={2} xs={3}>
                                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุ</Typography>
                                                        </Grid>
                                                        <Grid item md={4} xs={9}>
                                                            <Paper component="form" >
                                                                <TextField size="small" fullWidth value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Divider>
                                                                <Chip label="เพิ่มไฟล์เพิ่มเติม" size="small" sx={{ marginTop: -0.5, marginBottom: 1 }} />
                                                            </Divider>
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
                                                        </Grid>
                                                    </>
                                                    : ""
                                            }
                                        </>
                                        : ""
                        }
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertTruck;
