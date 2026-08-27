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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import CancelIcon from '@mui/icons-material/Cancel';
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { database } from "../../server/firebase";
import InsertGasStations from "./gasstation/InsertGasStations";
import InsertStock from "./stock/InsertStock";

const InsertGasStation = (props) => {
    const { openMenu, depot, stock, gasStation } = props;
    const [check, setCheck] = React.useState(Number(openMenu));

    React.useEffect(() => {
        setCheck(Number(openMenu)); // อัปเดต check เมื่อ openMenu เปลี่ยนแปลง
    }, [openMenu]);

    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // console.log("openMenu", openMenu);
    // console.log("check", check);
    // console.log("จำนวนปั้ม "+gasStation);
    // console.log("จำนวนคลังสต็อกน้ำมัน "+stock);
    // console.log("จำนวนคลังรับน้ำมัน "+depot);

    return (
        <React.Fragment>
            <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ height: 50, borderRadius: 3 }}
                endIcon={
                    check === 1 ? <LocalGasStationIcon />
                        : <WaterDropIcon />
                }>
                {
                    check === 1 ? "เพิ่มปั้มน้ำมัน" : "เพิ่มคลังสต็อกน้ำมัน"
                }
            </Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
                sx={{ zIndex: 1000 }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >{
                                check === 1 ? "เพิ่มปั้มน้ำมัน" : "เพิ่มคลังสต็อกน้ำมัน"
                            }</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1, marginBottom: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: "center", justifyContent: "center", marginBottom: 1 }}>
                                <FormGroup row >
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom marginRight={2} marginTop={1}>เลือกข้อมูลที่ต้องการเพิ่ม</Typography>
                                    <FormControlLabel control={<Checkbox onClick={() => setCheck(1)} checked={check === 1 ? true : false}
                                        sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 20, // ปรับขนาด Checkbox
                                            },
                                        }} />}
                                        label="ปั้มน้ำมัน"
                                        sx={{
                                            "& .MuiFormControlLabel-label": {
                                                fontSize: "14px",
                                                fontWeight: "bold"
                                            },
                                        }} />
                                    <Divider orientation="vertical" flexItem sx={{ marginRight: 2, height: 30 }} />
                                    <FormControlLabel control={<Checkbox onClick={() => setCheck(2)} checked={check === 2 ? true : false}
                                        sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 20, // ปรับขนาด Checkbox
                                            },
                                        }} />}
                                        label="คลังสต็อกน้ำมัน"
                                        sx={{
                                            "& .MuiFormControlLabel-label": {
                                                fontSize: "14px",
                                                fontWeight: "bold"
                                            },
                                        }} />
                                </FormGroup>
                            </Box>
                        </Grid>
                        {
                            check === 1 ?
                                <InsertGasStations gasStation={gasStation} handleClose={handleClose} />
                                : <InsertStock stock={stock} handleClose={handleClose} />
                        }
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertGasStation;
