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
import { IconButtonError, IconButtonSuccess, RateOils, TablecellHeader, TablecellNoData, TablecellSelling } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import CancelIcon from '@mui/icons-material/Cancel';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddCardIcon from '@mui/icons-material/AddCard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useTripData } from "../../server/provider/TripProvider";
import { apiPost, apiPut } from "../../server/apiClient";
import TablePaginationBar from "../../theme/TablePaginationBar";

const BankDetail = () => {
    const [open, setOpen] = React.useState(false);
    const [bankID, setBankID] = React.useState("");
    const [bankName, setBankName] = React.useState("");
    const [bank, setBank] = React.useState("");
    const [bankShortName, setBankShortName] = React.useState("");
    const [status, setStatus] = React.useState("");

    const { banks, refetch } = useTripData();
    const bankDetail = Object.values(banks || {});

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const pageCount = Math.max(1, Math.ceil(bankDetail.length / rowsPerPage));
    const safePage = Math.min(page, pageCount - 1);
    const pagedBankDetail = bankDetail.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [updateId, setUpdateId] = useState(null); // เก็บ ID ที่กำลังแก้ไข
    const [editedData, setEditedData] = useState({}); // เก็บค่าที่แก้ไข

    const handleEditClick = (id, row) => {
        setUpdateId(id); // ตั้งค่า ID ที่ต้องการแก้ไข
        setEditedData({ ...row }); // คัดลอกค่าของ row นั้นมาเก็บไว้
    };

    const handleSaveClick = async () => {
        try {
            await apiPut(`/api/banks/${editedData.uuid}`, {
                BankID: editedData.BankID,
                BankName: editedData.BankName,
                Bank: editedData.Bank,
                BankShortName: editedData.BankShortName,
                Status: editedData.Status
            });
            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            setBankID("")
            setBankName("")
            setBank("")
            setBankShortName("")
            setStatus("")
            setUpdateId(null); // รีเซ็ตค่า updateId กลับเป็น null
            refetch?.();
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    const handleChange = (field, value) => {
        setEditedData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    console.log("editedData : ", editedData);

    const handlePost = async () => {
        try {
            await apiPost("/api/banks", {
                id: bankDetail.length + 1,
                BankID: bankID,
                BankName: bankName,
                Bank: bank,
                BankShortName: bankShortName,
                Status: "ใช้งานอยู่"
            });
            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            setBankID("")
            setBankName("")
            setBank("")
            setBankShortName("")
            setStatus("")
            refetch?.();
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    return (
        <React.Fragment>
            <Tooltip title="เพิ่มเลขที่บัญชี" placement="left">
                <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.primary.main, marginLeft: -1, marginRight: -1, marginTop: 1 }}>
                    <Button
                        color="inherit"
                        fullWidth
                        onClick={handleClickOpen}
                        sx={{ flexDirection: "column", gap: 0.5 }}
                    >
                        <AddCardIcon fontSize="small" sx={{ color: "white" }} />
                        <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                            เพิ่มบัญชี
                        </Typography>
                    </Button>
                </Paper>
            </Tooltip>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                sx={{ zIndex: 900 }}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มบัญชีธนาคาร</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>รายการบัญชีธนาคาร</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TableContainer
                                component={Paper}
                                sx={{ marginBottom: 2, height: "150px" }}
                            >
                                <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead sx={{ height: "5vh" }}>
                                        <TableRow>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 60 }}>
                                                ลำดับ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                เลขที่บัญชีธนาคาร
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                                ชื่อบัญชีธนาคาร
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 130 }}>
                                                ชื่อธนาคาร
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                ชื่อย่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                สถานะ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", width: 60 }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bankDetail.length === 0 ? (
                                            <TableRow>
                                                <TablecellNoData colSpan={7}>
                                                    <Inventory fontSize="large" />
                                                    <br />
                                                    ไม่มีข้อมูล
                                                </TablecellNoData>
                                            </TableRow>
                                        ) : (
                                        pagedBankDetail.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell sx={{ textAlign: "center", width: 60 }}>{row.id}</TableCell>

                                                {updateId === row.uuid ? (
                                                    <>
                                                        <TableCell sx={{ textAlign: "center",height: "30px" }}>
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField
                                                                    value={editedData.BankID}
                                                                    onChange={(e) => handleChange("BankID", e.target.value)}
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": { height: "25px" },
                                                                        "& .MuiInputBase-input": { fontSize: "14px", textAlign: "center" },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center",height: "30px" }}>
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField
                                                                    value={editedData.BankName}
                                                                    onChange={(e) => handleChange("BankName", e.target.value)}
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": { height: "25px" },
                                                                        "& .MuiInputBase-input": { fontSize: "14px", textAlign: "center" },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center",height: "30px" }}>
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField
                                                                    value={editedData.Bank}
                                                                    onChange={(e) => handleChange("Bank", e.target.value)}
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": { height: "25px" },
                                                                        "& .MuiInputBase-input": { fontSize: "14px", textAlign: "center" },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center",height: "30px" }}>
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField
                                                                    value={editedData.BankShortName}
                                                                    onChange={(e) => handleChange("BankShortName", e.target.value)}
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": { height: "25px" },
                                                                        "& .MuiInputBase-input": { fontSize: "14px", textAlign: "center" },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center",height: "30px" }}>
                                                            <Paper component="form" sx={{ width: "100%", height: "25px" }}>
                                                                <Select
                                                                    value={editedData.Status}
                                                                    onChange={(e) => handleChange("Status", e.target.value)}
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={{
                                                                        height: "25px",
                                                                        "& .MuiOutlinedInput-root": { height: "25px" },
                                                                        "& .MuiInputBase-input": { fontSize: "14px", textAlign: "center" },
                                                                    }}
                                                                >
                                                                    <MenuItem value="ใช้งานอยู่">ใช้งานอยู่</MenuItem>
                                                                    <MenuItem value="ปิดการใช้งาน">ปิดการใช้งาน</MenuItem>
                                                                </Select>
                                                            </Paper>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <IconButton onClick={() => setUpdateId(null)} color="error">
                                                                <AddBoxIcon />
                                                            </IconButton>
                                                            <IconButton onClick={handleSaveClick} color="success">
                                                                <AddBoxIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.BankID}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.BankName}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.Bank}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.BankShortName}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            <Button
                                                                variant="contained"
                                                                color="warning"
                                                                startIcon={<EditNoteIcon />}
                                                                sx={{ height: "25px" }}
                                                                onClick={() => handleEditClick(row.uuid, row)} // ✅ ใช้ arrow function
                                                                size="small"
                                                                fullWidth
                                                            >
                                                                แก้ไข
                                                            </Button>
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePaginationBar
                                count={bankDetail.length}
                                page={safePage}
                                rowsPerPage={rowsPerPage}
                                onPageChange={setPage}
                                onRowsPerPageChange={setRowsPerPage}
                                rowsPerPageOptions={[5, 10, 25, 30]}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เพิ่มบัญชีธนาคาร</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={2} textAlign="right">
                                    <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>เลขที่บัญชี</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField fullWidth size="small" value={bankID} onChange={(e) => setBankID(e.target.value)} />
                                    </Paper>
                                </Grid>
                                <Grid item xs={2} textAlign="right">
                                    <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>ชื่อบัญชี</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField fullWidth size="small" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                                    </Paper>
                                </Grid>
                                <Grid item xs={2} textAlign="right">
                                    <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>ชื่อธนาคาร</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField fullWidth size="small" value={bank} onChange={(e) => setBank(e.target.value)} />
                                    </Paper>
                                </Grid>
                                <Grid item xs={2} textAlign="right">
                                    <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>ชื่อย่อธนาคาร</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField fullWidth size="small" value={bankShortName} onChange={(e) => setBankShortName(e.target.value)} />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} textAlign="center" >
                                    <Button onClick={handlePost} variant="contained" sx={{ marginTop: 1 }} color="success" size="small">บันทึก</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default BankDetail;
