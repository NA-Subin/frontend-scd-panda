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
import { API_BASE, apiPost, apiPut } from "../../server/apiClient";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import FilePreview from "./UploadButton";

const InsertTruck = (props) => {
    const { openMenu } = props;
    const [menu, setMenu] = React.useState(Number(openMenu));

    React.useEffect(() => {
        setMenu(Number(openMenu));
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

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [registrationTail, setRegistrationTail] = useState([]);
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

    const [fields, setFields] = useState([]);

    const handleCapChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setCap(value);

        const newFields = Array.from({ length: value }, (_, index) => ({
            id: index + 1,
            value: 0,
        }));
        setFields(newFields);
    };

    const [tailWeight, setTailWeight] = React.useState(0);

    const handleFieldChange = (id, value) => {
        setFields((prevFields) => {
            const updatedFields = prevFields.map((field) =>
                field.id === id ? { ...field, value: parseFloat(value) || 0 } : field
            );

            return updatedFields;
        });
    };

    const { company, drivers, reghead, regtail, small, refetch: refetchBasicData } = useBasicData();
    const dataCompany = Object.values(company || {});
    const dataDrivers = Object.values(drivers || {});
    const regheads = Object.values(reghead || {});
    const regtails = Object.values(regtail || {});
    const smalls = Object.values(small || {});

    const driverDetail = dataDrivers.filter((row) => row.Status === "ว่าง" && row.StatusTruck !== "ยกเลิก");
    const regtailsDetail = regtails.filter((row) => row.Status === "ยังไม่เชื่อมต่อทะเบียนหัว" && row.StatusTruck !== "ยกเลิก");

    const handlePost = async () => {
        if (!file) return alert("กรุณาเลือกไฟล์ก่อน");

        let img = "ไม่แนบไฟล์";

        if (file !== "ไม่แนบไฟล์") {
            const formData = new FormData();
            formData.append("pic", file);

            try {
                const response = await fetch(`${API_BASE}/panda/uploads`, {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                img = data.file_path;
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }
        const companyRow = dataCompany.find((c) => c.id === Number(String(companies).split(":")[0]));

        if (menu === 1) {
            const tailRow = tail && tail.split(":")[1] !== "ไม่มี"
                ? regtailsDetail.find((t) => t.id === Number(tail.split(":")[0]))
                : null;

            try {
                await apiPost("/api/truck_registration", {
                    id: regheads.length + 1,
                    Company: companyRow?.uuid || null,
                    CompanyName: companyRow?.Name || "",
                    RegHead: regHead,
                    RegTail: tailRow?.uuid || null,
                    RegTailName: tailRow?.RegTail || "ไม่มี",
                    RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
                    Weight: weight,
                    TotalWeight: (parseFloat(weight) + parseFloat(tail.split(":")[3] || 0)),
                    Insurance: "-",
                    Act: "-",
                    Status: "ว่าง",
                    Driver: null,
                    DriverName: "ไม่มี",
                    VehicleRegistration: licenseRegHead === "มี" ? vehicleRegistration : "ไม่มี",
                    DateEndTax: licenseRegHead === "มี" ? dateEndTax : "ไม่มี",
                    DateEndInsurance: licenseRegHead === "มี" ? dateEndInsurance : "ไม่มี",
                    VehPicture: "ไม่มี",
                    Path: img
                });

                if (tailRow?.uuid) {
                    await apiPut(`/api/truck_registration_tail/${tailRow.uuid}`, {
                        Status: "เชื่อมทะเบียนหัวแล้ว",
                    });
                }

                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                refetchBasicData?.();
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
            } catch (error) {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            }
        } else if (menu === 2) {
            const capFields = fields.reduce((acc, field) => {
                acc[`Cap${field.id}`] = field.value || 0;
                return acc;
            }, {});

            try {
                await apiPost("/api/truck_registration_tail", {
                    id: regtails.length + 1,
                    Company: companyRow?.uuid || null,
                    CompanyName: companyRow?.Name || "",
                    RegTail: regTail,
                    Weight: tailWeight,
                    Cap: cap,
                    Insurance: "-",
                    Status: "ยังไม่เชื่อมต่อทะเบียนหัว",
                    ...capFields,
                    VehicleRegistration: licenseRegTail === "มี" ? vehicleRegistration : "ไม่มี",
                    DateEndTax: licenseRegTail === "มี" ? dateEndTax : "ไม่มี",
                    DateEndInsurance: licenseRegTail === "มี" ? dateEndInsurance : "ไม่มี",
                    VehPicture: "ไม่มี",
                    Path: img
                });

                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                refetchBasicData?.();
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
            } catch (error) {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            }
        } else {
            try {
                await apiPost("/api/truck_small", {
                    id: smalls.length + 1,
                    Company: companyRow?.uuid || null,
                    CompanyName: companyRow?.Name || "",
                    ShortName: shortName,
                    RegHead: registration,
                    RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
                    Weight: weight,
                    Insurance: "-",
                    Act: "-",
                    Status: "ว่าง",
                    Driver: null,
                    DriverName: "ไม่มี",
                    VehicleRegistration: licenseSmallTruck === "มี" ? vehicleRegistration : "ไม่มี",
                    DateEndTax: licenseSmallTruck === "มี" ? dateEndTax : "ไม่มี",
                    DateEndInsurance: licenseSmallTruck === "มี" ? dateEndInsurance : "ไม่มี",
                    VehPicture: "ไม่มี",
                    Path: img
                });

                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                refetchBasicData?.();
                setCompanies("");
                setWeight("");
                setRegistration("");
                setLicenseSmallTruck("");
                setVehicleRegistration("");
                setDateEndTax("");
                setDateEndInsurance("");
                setFile("ไม่แนบไฟล์");
                setFileType(1);
            } catch (error) {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            }
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
                        width: "800px",
                        maxWidth: "none",
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
