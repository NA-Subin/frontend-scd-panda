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
import CancelIcon from '@mui/icons-material/Cancel';
import { IconButtonError } from "../../../theme/style";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import theme from "../../../theme/theme";
import { apiPost } from "../../../server/apiClient";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";

const InsertTruckTransport = () => {
    const [open, setOpen] = React.useState(false);

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

    const [companies, setCompanies] = useState(0);
    const [name, setName] = React.useState("");
    const [weight, setWeight] = React.useState("");
    const [registration, setRegistration] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [truckType, setTruckType] = React.useState(0);

    const { company, transport, drivers, refetch: refetchBasicData } = useBasicData();
    const dataCompany = Object.values(company || {});
    const dataDriver = Object.values(drivers || {});
    const dataTransport = Object.values(transport || {}).filter((item) => item.StatusTruck !== "ยกเลิก");

    const handlePost = async () => {
        const companyRow = dataCompany.find((c) => c.id === Number(String(companies).split(":")[0]));

        try {
            await apiPost("/api/auth/register", {
                table: "truck_transport",
                password: "1234567",
                fields: {
                    id: dataTransport.length + 1,
                    Name: name,
                    Company: companyRow?.uuid || null,
                    CompanyName: companyRow?.Name || "",
                    Registration: registration,
                    Weight: weight,
                    TruckType: truckType === 1 ? "รถใหญ่" : "รถเล็ก",
                    Status: "ว่าง",
                    UserId: `t${(dataDriver.length + 1).toString().padStart(4, '0')}`,
                },
            });
            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            refetchBasicData?.();
            setCompanies("");
            setRegistration("");
            setWeight("");
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    return (
        <React.Fragment>
            <Box>
                <Button variant="contained" color="info" onClick={handleClickOpen}>เพิ่มรถรับจ้างขนส่ง</Button>
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
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มรถรับจ้างขนส่ง</Typography>
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
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อรถ</Typography>
                        </Grid>
                        <Grid item md={4} xs={9}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item md={2} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ทะเบียนรถ</Typography>
                        </Grid>
                        <Grid item md={4} xs={9}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={registration} onChange={(e) => setRegistration(e.target.value)} />
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
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เบอร์โทร</Typography>
                        </Grid>
                        <Grid item md={4} xs={9}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item md={2} xs={3}>
                            <Typography variant="subtitle1" textAlign="right" fontWeight="bold" marginTop={1} gutterBottom>เลือกประเภทรถ</Typography>
                        </Grid>
                        <Grid item md={10} xs={9}>
                            <Paper
                                component="form">
                                <Select
                                    id="demo-simple-select"
                                    value={truckType}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setTruckType(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกประเภทรถ
                                    </MenuItem>
                                    <MenuItem value={1}>
                                        รถใหญ่
                                    </MenuItem>
                                    <MenuItem value={2}>
                                        รถเล็ก
                                    </MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        <Grid item md={2} xs={3}>
                            <Typography variant="subtitle1" textAlign="right" fontWeight="bold" marginTop={1} gutterBottom>เลือกบริษัท</Typography>
                        </Grid>
                        <Grid item md={10} xs={9}>
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
                                    {
                                        dataCompany.map((row) => (
                                            row.id != 1 &&
                                            <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </Paper>
                        </Grid>
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

export default InsertTruckTransport;
