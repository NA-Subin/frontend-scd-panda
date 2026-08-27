import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
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
    useMediaQuery,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import HailIcon from "@mui/icons-material/Hail";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const UpdateEmployee = (props) => {
    const { row, index } = props;
    const [update, setUpdate] = React.useState(true);
    const [openOfficeDetail, setOpenOfficeDetail] = useState(false);
    // const { positions } = useData();
    const { positions } = useBasicData();
    const positionDetail = Object.values(positions || {});

    const [name, setName] = React.useState(row.Name);
    const [user, setUser] = React.useState(row.User);
    const [position, setPosition] = React.useState(row.Position);
    const [phone, setPhone] = React.useState(row.Phone);
    const [rights, setRights] = React.useState(row.Rights === "แอดมิน" ? 1 : row.Rights === "หน้าลาน" ? 2 : row.Rights === "เจ้าหนี้น้ำมัน" ? 3 : 0);

    const handleClose = () => {
        setOpenOfficeDetail(false);
    };

    const handleUpdate = () => {
        database
            .ref("employee/officers/")
            .child(row.id - 1)
            .update({
                Name: name,
                User: user,
                Position: position,
                Phone: phone
                //Rights: rights === 1 ? "แอดมิน" : rights === 2 ? "หน้าลาน" : rights === 3 ? "เจ้าหนี้น้ำมัน" : ""
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                setUpdate(true)
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    return (
        <React.Fragment>
            <TableRow
                key={row.id}
                sx={{
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: "#ffebee",
                    },
                }}
                onClick={() => setOpenOfficeDetail(row.id)}
            >
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{index + 1}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{row.Name}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{row.Position.split(":")[1]}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{row.Phone}</TableCell>
                {/* <TableCell sx={{ textAlign: "center", height: "35px" }}>{row.Rights}</TableCell> */}
                <TableCell sx={{ textAlign: "center", height: "35px" }}>{row.User}</TableCell>
            </TableRow>
            <Dialog
                open={openOfficeDetail === row.id ? true : false}
                keepMounted
                onClose={() => setOpenOfficeDetail(false)}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดพนักงานชื่อ{row.Name}</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={() => setOpenOfficeDetail(false)}>
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
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตำแหน่ง</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                {
                                    !update ?
                                        <FormControl fullWidth>
                                            <Select
                                                size="small"
                                                id="demo-simple-select"
                                                value={position}
                                                label="Age"
                                                variant="standard"
                                                onChange={(e) => setPosition(e.target.value)}
                                            >
                                                <MenuItem value={position}>{position.split(":")[1]}</MenuItem>
                                                {
                                                    positionDetail.map((row) => (
                                                        `${row.id}:${row.Name}` !== position &&
                                                        <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                        :
                                        <TextField fullWidth variant="standard" value={position.split(":")[1]} disabled />
                                }
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>เบอร์โทร</Typography>
                            </Grid>
                            <Grid item xs={4.5}>
                                <TextField fullWidth variant="standard" value={phone} disabled={update ? true : false} onChange={(e) => setPhone(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>UserID</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth variant="standard" value={user} disabled />
                            </Grid>
                            {/* <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                                <FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rights === 1 ? true : false}
                                                onChange={() => setRights(1)}
                                                size="small"
                                            />
                                        }
                                        disabled={update ? true : false}
                                        label="แอดมิน" />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rights === 2 ? true : false}
                                                onChange={() => setRights(2)}
                                                size="small"
                                            />
                                        }
                                        disabled={update ? true : false}
                                        label="หน้าลาน" />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rights === 3 ? true : false}
                                                onChange={() => setRights(3)}
                                                size="small"
                                            />
                                        }
                                        disabled={update ? true : false}
                                        label="เจ้าหนี้น้ำมัน" />
                                </FormGroup>
                            </Grid> */}
                        </Grid>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        update ?
                            <>
                                <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                                <Button variant="contained" color="warning" onClick={() => setUpdate(false)} >แก้ไข</Button>
                            </>
                            :
                            <>
                                <Button variant="contained" color="error" onClick={() => setUpdate(true)}>ยกเลิก</Button>
                                <Button onClick={handleUpdate} variant="contained" color="success">บันทึก</Button>
                            </>
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateEmployee;
