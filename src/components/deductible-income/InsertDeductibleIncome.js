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
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { auth, database } from "../../server/firebase";

const InsertDeductibleIncome = (props) => {
    const { data, income, deduction } = props;
    console.log("income ", income, "deduction ", deduction);
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('รายได้');
    const [code, setCode] = React.useState(type === "รายได้" ? `R${income.toString().padStart(3, '0')}` : `D${deduction.toString().padStart(3, '0')}`);
    const [status, setStatus] = React.useState('ไม่ประจำ');

    React.useEffect(() => {
        const newCode = type === "รายได้"
            ? `R${income.toString().padStart(3, '0')}`
            : `D${deduction.toString().padStart(3, '0')}`;
        setCode(newCode);
    }, [type, income, deduction]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePost = () => {
        database
            .ref("/deductibleincome")
            .child(data)
            .update({
                id: data + 1,
                Code: code,
                Name: name,
                Type: type,
                Status: status
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
                setName("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <Button variant="contained" color="info" onClick={handleClickOpen} endIcon={<PersonAddIcon />} >เพิ่มรายได้รายหัก</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="sm"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มรายได้รายหัก</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2} marginBottom={2}>
                        {/* <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="พิกัด" size="small" />
                            </Divider>
                        </Grid> */}
                        <Grid item sm={2} xs={4}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>รหัส</Typography>
                        </Grid>
                        <Grid item sm={10} xs={8}>
                            <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} disabled />
                        </Grid>
                        <Grid item sm={2} xs={4}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อ</Typography>
                        </Grid>
                        <Grid item sm={10} xs={8}>
                            <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                        </Grid>
                        <Grid item sm={2} xs={4}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ประเภท</Typography>
                        </Grid>
                        <Grid item sm={10} xs={8}>
                            <FormGroup row>
                                <FormControlLabel control={<Checkbox checked={type === "รายได้" ? true : false} onChange={() => setType("รายได้")} />} label="รายได้" />
                                <FormControlLabel control={<Checkbox checked={type === "รายหัก" ? true : false} onChange={() => setType("รายหัก")} />} label="รายหัก" />
                            </FormGroup>
                            {/* <TextField size="small" fullWidth value={type} onChange={(e) => setType(e.target.value)} /> */}
                        </Grid>
                        <Grid item sm={2} xs={4}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>สถานะ</Typography>
                        </Grid>
                        <Grid item sm={10} xs={8}>
                            <FormGroup row>
                                <FormControlLabel control={<Checkbox checked={status === "ประจำ" ? true : false} onChange={() => setStatus("ประจำ")} />} label="ประจำ" />
                                <FormControlLabel control={<Checkbox checked={status === "ไม่ประจำ" ? true : false} onChange={() => setStatus("ไม่ประจำ")} />} label="ไม่ประจำ" />
                            </FormGroup>
                            {/* <TextField size="small" fullWidth value={status} onChange={(e) => setStatus(e.target.value)} /> */}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertDeductibleIncome;
