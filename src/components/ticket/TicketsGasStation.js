import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { IconButtonError, TablecellHeader } from "../../theme/style";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const TicketsGasStation = (props) => {
    const { row, index, openNavbar } = props;
    const [update, setUpdate] = React.useState(true);
    const [updateCustomer, setUpdateCustomer] = React.useState(true);
    const [name, setName] = React.useState(row.Name);
    const [shortName, setShortName] = React.useState(row.ShortName || "");
    const [lastName, setLastName] = React.useState(row.LastName || "");
    const [rate1, setRate1] = React.useState(row.Rate1);
    const [rate2, setRate2] = React.useState(row.Rate2);
    const [rate3, setRate3] = React.useState(row.Rate3);
    const [creditTime, setCreditTime] = React.useState(row.CreditTime);
    const [status, setStatus] = React.useState(row.Status);
    const [open, setOpen] = useState(false);

    const { gasstation } = useBasicData();
    const gasStation = Object.values(gasstation || {});

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            let width = window.innerWidth;
            if (!openNavbar) {
                width += 120; // ✅ เพิ่ม 200 ถ้า openNavbar = false
            }
            setWindowWidth(width);
        };

        // เรียกครั้งแรกตอน mount
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

    const normalizeAddress = (address) => {
        // ---------- แบบใหม่ (object) ----------
        if (address && typeof address === "object") {
            return {
                no: address.no || "-",
                village: address.village || "-",
                subDistrict: address.subDistrict || "-",
                district: address.district || "-",
                province: address.province || "-",
                zipCode: address.zipCode || "-"
            };
        }

        // ---------- แบบเก่า (string) ----------
        if (typeof address === "string") {
            const parts = address.trim().split(/\s+/);

            return {
                no: parts[0] || "-",
                village: parts[1] || "-",
                subDistrict: parts[2] || "-",
                district: parts[3] ? parts[3].replace("อ.", "") : "-",
                province: parts[4] || "-",
                zipCode: parts[5] || "-"
            };
        }

        // ---------- fallback ----------
        return {
            no: "-",
            village: "-",
            subDistrict: "-",
            district: "-",
            province: "-",
            zipCode: "-"
        };
    };

    const [openCustomer, setOpenCustomer] = React.useState("");
    const addr = normalizeAddress(row.Address);

    const [no, setNo] = React.useState(addr.no || "");
    const [village, setVillage] = React.useState(addr.village || "");
    const [subDistrict, setSubDistrict] = React.useState(addr.subDistrict || "");
    const [district, setDistrict] = React.useState(addr.district || "");
    const [province, setProvince] = React.useState(addr.province || "");
    const [zipCode, setZipCode] = React.useState(addr.zipCode || "");
    const [ticketsName, setTicketsName] = React.useState(row.Name);
    const [code, setCode] = React.useState(row.Code);
    const [codeID, setCodeID] = React.useState(row.CodeID);
    const [companyName, setCompanyName] = React.useState(row.CompanyName);
    const [phone, setPhone] = React.useState(row.Phone);
    const [companyChecked, setCompanyChecked] = React.useState(true);
    const [type, setType] = React.useState("");
    const [bill, setBill] = React.useState(row.Bill);

    const handleSaveCustomer = () => {
        const address = {
            no: no?.trim() || "",
            village: village?.trim() || "",
            subDistrict: subDistrict?.trim() || "",
            district: district?.trim() || "",
            province: province?.trim() || "",
            zipCode: zipCode?.trim() || ""
        };

        database
            .ref("/customers/gasstations/")
            .child(Number(row.id) - 1)
            .update({
                Name: ticketsName,
                ShortName: shortName,
                LastName: lastName,
                Status: "ตั๋ว/ผู้รับ",
                Rate1: rate1,
                Rate2: rate2,
                Rate3: rate3,
                CreditTime: creditTime,
                Code: code,
                CompanyName: companyName,
                CodeID: codeID,
                Address: address,
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setUpdateCustomer(true)
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    const handleUpdate = () => {
        database
            .ref("/customers/gasstations/")
            .child(row.id - 1)
            .update({
                Rate1: rate1,
                Rate2: rate2,
                Rate3: rate3,
                CreditTime: creditTime,
                Name: shortName + lastName,
                ShortName: shortName,
                LastName: lastName
            }) // อัพเดท values ทั้งหมด
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data updated successfully");
                setOpen(false);
            })
            .catch((error) => {
                ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วปั้มที่ ${row.id} ใช่หรือไม่`,
            () => {
                database
                    .ref("/customers/gasstations/")
                    .child(row.id - 1)
                    .update({
                        SystemStatus: "ไม่อยู่ในระบบ"
                    }) // อัพเดท values ทั้งหมด
                    .then(() => {
                        ShowSuccess(`ลบข้อตั๋วปั้มลำดับที่ ${row.id} สำเร็จ`);
                        console.log("Data updated successfully");
                        setOpen(false);
                    })
                    .catch((error) => {
                        ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกลบตั๋วปั้มที่ ${row.id}`);
            }
        )
    }

    return (
        <React.Fragment>
            {
                !open ?
                    <TableRow key={index} >
                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{index + 1}</TableCell>
                        <TableCell
                            sx={{
                                textAlign: "left",
                                cursor: "pointer",
                                "&:hover": {
                                    backgroundColor: "#ffebee",
                                },
                            }}
                            onClick={() => setOpenCustomer(row.id)}
                        >
                            {<Typography variant="subtitle2" sx={{ marginLeft: 3 }} gutterBottom>
                                {row.Name}
                            </Typography>}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{creditTime}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate1}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate2}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{rate3}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{status}</TableCell>
                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<EditNoteIcon />}
                                size="small"
                                sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }}
                                onClick={() => setOpen(true)}
                                fullWidth
                            >
                                แก้ไข
                            </Button>
                        </TableCell>
                    </TableRow>
                    :
                    <TableRow key={index} sx={{ backgroundColor: "#fff59d" }}>
                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{index + 1}</TableCell>
                        {/* <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{name}</TableCell> */}
                        <TableCell sx={{ textAlign: "center" }}>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Paper sx={{ width: "100%" }}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '14px',
                                                },
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '2px 6px', // ปรับ padding ภายใน input
                                                    textAlign: "center"
                                                },
                                            }}
                                            value={shortName}
                                            onChange={(e) => setShortName(e.target.value)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={8}>
                                    <Paper sx={{ width: "100%" }}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '14px',
                                                },
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '2px 6px', // ปรับ padding ภายใน input
                                                    textAlign: "center"
                                                },
                                            }}
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
                                    type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '14px',
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '30px', // ปรับความสูงของ TextField
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '14px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: "center"
                                        },
                                    }}
                                    value={creditTime || 0}
                                    onChange={(e) => setCreditTime(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
                                    type="number"
                                    inputProps={{
                                        step: 0.01
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '14px',
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '30px', // ปรับความสูงของ TextField
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '14px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: "center"
                                        },
                                    }}
                                    value={rate1 || 0}
                                    onChange={(e) => setRate1(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
                                    type="number"
                                    inputProps={{
                                        step: 0.01
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '14px',
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '30px', // ปรับความสูงของ TextField
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '14px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: "center"
                                        },
                                    }}
                                    value={rate2 || 0}
                                    onChange={(e) => setRate2(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
                                    type="number"
                                    inputProps={{
                                        step: 0.01
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '14px',
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '30px', // ปรับความสูงของ TextField
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '14px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: "center"
                                        },
                                    }}
                                    value={rate3 || 0}
                                    onChange={(e) => setRate3(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            <Box sx={{ marginLeft: 2.5, marginRight: 2.5 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    endIcon={<DeleteIcon />}
                                    size="small"
                                    sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }}
                                    onClick={handleDelete}
                                    fullWidth
                                >
                                    ลบ
                                </Button>
                            </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                            {
                                !open ?
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        startIcon={<EditNoteIcon />}
                                        size="small"
                                        sx={{ height: "25px" }}
                                        onClick={() => setOpen(true)}
                                        fullWidth
                                    >
                                        แก้ไข
                                    </Button>
                                    :
                                    <>
                                        <Button variant="contained" color="success" onClick={handleUpdate} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                        <Button variant="contained" color="error" onClick={() => setOpen(false)} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>ยกเลิก</Button>
                                    </>
                            }
                        </TableCell>
                    </TableRow>
            }
            <Dialog
                open={!!openCustomer}
                keepMounted
                fullScreen={windowWidth <= 600}
                onClose={() => setOpenCustomer("")}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white">
                                ชื่อลูกค้า :{" "}
                                {row.Name}
                            </Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={() => setOpenCustomer("")}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} marginTop={2} marginBottom={2}>
                        <Grid item md={7} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Grid container spacing={2}>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 8 } }} gutterBottom>ชื่อตั๋ว</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item md={4} xs={12}>
                                            <TextField size="small" label="กรุณาเพิ่มรหัส" fullWidth value={shortName} onChange={(e) => setShortName(e.target.value)} disabled={updateCustomer} />
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <TextField size="small" label="กรุณาเพิ่มชื่อ" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={updateCustomer} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 6 } }} gutterBottom>เลือกปั้ม</Typography>
                                    <Paper
                                        component="form" sx={{ width: "100%" }}>
                                        <Autocomplete
                                            size="small"
                                            fullWidth
                                            options={gasStation.map((row) => row.Name + "/" + row.ShortName)}
                                            value={ticketsName}
                                            disabled={updateCustomer}
                                            onChange={(event, newValue) => {
                                                setTicketsName(newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} label="กรุณาเลือกปั้ม" variant="outlined" />
                                            )}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 1 } }} gutterBottom>รอบการวางบิล</Typography>
                                    <TextField size="small" fullWidth value={creditTime} onChange={(e) => setCreditTime(e.target.value)} disabled={updateCustomer} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={5} xs={12}>
                            <Grid container spacing={2}>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังลำปาง"} value={rate1} onChange={(e) => setRate1(e.target.value)} disabled={updateCustomer} />
                                </Grid>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังพิจิตร"} value={rate2} onChange={(e) => setRate2(e.target.value)} disabled={updateCustomer} />
                                </Grid>
                                <Grid item md={12} xs={12} display='flex' justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 1 }} gutterBottom>Rate ค่าขนส่ง :</Typography>
                                    <TextField size="small" fullWidth label={"คลังสระบุรี/บางปะอิน/IR"} value={rate3} onChange={(e) => setRate3(e.target.value)} disabled={updateCustomer} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Divider>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ใบวางบิล/ใบแจ้งหนี้</Typography>
                            </Divider>
                        </Grid>
                        <Grid item md={3} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 9 } }} gutterBottom>รหัส</Typography>
                            <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={9} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 5.5 } }} gutterBottom>ชื่อบริษัท</Typography>
                            <TextField size="small" fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={2.5} xs={6} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 4 } }} gutterBottom>บ้านเลขที่</Typography>
                            <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={1.5} xs={6} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 7 } }} gutterBottom>หมู่ที่</Typography>
                            <TextField size="small" fullWidth value={village} onChange={(e) => setVillage(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 8 } }} gutterBottom>ตำบล</Typography>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 7.5 } }} gutterBottom>อำเภอ</Typography>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 7 } }} gutterBottom>จังหวัด</Typography>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 3.5 } }} gutterBottom>รหัสไปรณีย์</Typography>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 2.5 } }} gutterBottom>เลขผู้เสียภาษี</Typography>
                            <TextField size="small" fullWidth value={codeID} onChange={(e) => setCodeID(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                            {
                                updateCustomer ?
                                    <Button variant="contained" color="warning" size="small" onClick={() => setUpdateCustomer(false)} >แก้ไข</Button>
                                    :
                                    <React.Fragment>
                                        <Button variant="contained" color="success" size="small" sx={{ marginRight: 2 }} onClick={() => handleSaveCustomer()}>บันทึก</Button>
                                        <Button variant="contained" color="error" size="small" onClick={() => setUpdateCustomer(true)}>ยกเลิก</Button>
                                    </React.Fragment>

                            }
                        </Grid>
                    </Grid>
                </DialogContent>

                {/* <DialogActions
                    sx={{
                        textAlign: "center",
                        borderTop: "2px solid " + theme.palette.panda.dark,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Button variant="contained" color="success">
                        บันทึก
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setOpenCustomer("")}
                    >
                        ยกเลิก
                    </Button>
                </DialogActions> */}
            </Dialog>
        </React.Fragment>
    );
};

export default TicketsGasStation;
