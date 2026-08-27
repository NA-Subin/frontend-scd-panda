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
    TablePagination,
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
import { IconButtonError, IconButtonSuccess, RateOils, TablecellHeader, TablecellSelling } from "../../theme/style";
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import AddCardIcon from '@mui/icons-material/AddCard';
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { auth, database } from "../../server/firebase";
import { useData } from "../../server/path";
import { useTripData } from "../../server/provider/TripProvider";

const BankDetail = () => {
    const [open, setOpen] = React.useState(false);
    const [bankID, setBankID] = React.useState("");
    const [bankName, setBankName] = React.useState("");
    const [bank, setBank] = React.useState("");
    const [bankShortName, setBankShortName] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [updateBank, setUpdateBank] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // const { banks } = useData();
    const { banks } = useTripData();
    //const bankDetail = Object.values(banks || {});

    const bankDetail = Object.values(banks || {}).filter(row =>
        (
            row?.BankID?.toLowerCase().includes(search.toLowerCase()) ||
            row?.BankName?.toLowerCase().includes(search.toLowerCase())
        ) &&
        row?.Status !== "ยกเลิก"
    );


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

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 5));
        setPage(0);
    };

    const handleSaveClick = () => {
        const normalize = (str) => (str || "").trim().toLowerCase();

        // const isDuplicateBankID = bankDetail.some(
        //     (bank) => normalize(bank.BankID) === normalize(editedData.BankID) && bank.id !== editedData.id
        // );

        // const isDuplicateBankName = bankDetail.some(
        //     (bank) => normalize(bank.BankName) === normalize(editedData.BankName) && bank.id !== editedData.id
        // );

        // if (isDuplicateBankID || isDuplicateBankName) {
        //     let message = "ไม่สามารถบันทึกได้ เนื่องจาก";
        //     if (isDuplicateBankID) message += " BankID ซ้ำ";
        //     if (isDuplicateBankID && isDuplicateBankName) message += " และ";
        //     if (isDuplicateBankName) message += " BankName ซ้ำ";

        //     ShowError(message);
        //     return;
        // }

        database
            .ref("banks/")
            .child(editedData.id - 1)
            .update({
                BankID: editedData.BankID,
                BankName: editedData.BankName,
                Bank: editedData.Bank,
                BankShortName: editedData.BankShortName,
                Status: editedData.Status
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setBankID("")
                setBankName("")
                setBank("")
                setBankShortName("")
                setStatus("")
                setUpdateId(null); // รีเซ็ตค่า updateId กลับเป็น null
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleChange = (field, value) => {
        setEditedData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    console.log("editedData : ", editedData);

    const handleDeleteReport = (newID) => {
        if (newID === null) {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
            return;
        }

        ShowConfirm(
            "คุณต้องการยกเลิกรายการนี้ใช่หรือไม่?",
            () => {
                // ✅ ถ้ากดยืนยัน
                database
                    .ref("banks/")
                    .child(newID - 1)
                    .update({ Status: "ยกเลิก" })
                    .then(() => {
                        ShowSuccess("บันทึกข้อมูลเรียบร้อย");
                        console.log("บันทึกข้อมูลเรียบร้อย ✅");
                    })
                    .catch((error) => {
                        ShowError("ไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                // ❌ ถ้ากดยกเลิก
                console.log("ยกเลิกการลบข้อมูล ❌");
            }
        );
    };

    const handlePost = () => {
        const isDuplicateBankID = bankDetail.some(
            (bank) => bank.BankID === bankID
        );

        const isDuplicateBankName = bankDetail.some(
            (bank) => bank.BankName === bankName
        );


        if (isDuplicateBankID || isDuplicateBankName) {
            let message = "ไม่สามารถบันทึกได้ เนื่องจาก";
            if (isDuplicateBankID) message += " BankID ซ้ำ";
            if (isDuplicateBankID && isDuplicateBankName) message += " และ";
            if (isDuplicateBankName) message += " BankName ซ้ำ";

            ShowError(message);
            return;
        }

        database
            .ref("banks/")
            .child(bankDetail.length)
            .update({
                id: bankDetail.length + 1,
                BankID: bankID,
                BankName: bankName,
                Bank: bank,
                BankShortName: bankShortName,
                Status: "ใช้งานอยู่"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setBankID("")
                setBankName("")
                setBank("")
                setBankShortName("")
                setStatus("")
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            {/* <Box display="flex" justifyContent="center" alignItems="center">
                เลขที่บัญชี
                <Box textAlign="right">
                    <Tooltip title="เพิ่มบัญชีธนาคาร" placement="right">
                        <IconButton color="inherit"
                            size="small"
                            fullWidth
                            onClick={handleClickOpen}
                            sx={{ borderRadius: 2 }}
                        >
                            <AddBoxIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box> */}
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
                    {/* <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>รายการบัญชีธนาคาร</Typography> */}
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: -0.5 }} gutterBottom>ค้นหา</Typography>
                        <Paper sx={{ marginTop: -1, marginBottom: 1, width: "100%" }} >
                            <TextField
                                fullWidth
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: 30, // ปรับความสูงรวม
                                    },
                                    '& .MuiInputBase-input': {
                                        padding: '4px 8px', // ปรับ padding ด้านใน input
                                        fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                    },
                                }}
                                InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                            />
                        </Paper>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TableContainer
                                component={Paper}
                                sx={{ marginBottom: 2, height: "300px" }}
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
                                            {/* <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                                สถานะ
                                            </TablecellSelling> */}
                                            <TablecellSelling sx={{ textAlign: "center", width: 60 }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bankDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                            <TableRow key={row.id}>
                                                <TableCell sx={{ textAlign: "center", width: 60 }}>{row.id}</TableCell>

                                                {updateId === row.id ? (
                                                    <>
                                                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
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
                                                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
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
                                                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
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
                                                        <TableCell sx={{ textAlign: "center", height: "30px" }}>
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
                                                        {/* <TableCell sx={{ textAlign: "center", height: "30px" }}>
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
                                                        </TableCell> */}
                                                        <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <IconButton onClick={() => setUpdateId(null)} color="error" sx={{ marginRight: -1.5 }}>
                                                                <CancelIcon />
                                                            </IconButton>
                                                            <IconButton onClick={handleSaveClick} color="success">
                                                                <SaveIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.BankID}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.BankName}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.Bank}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.BankShortName}</TableCell>
                                                        {/* <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell> */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            <Box display="flex" alignItems="center" justifyContent="center" >
                                                                <IconButton
                                                                    color="warning"
                                                                    onClick={() => handleEditClick(row.id, row)} // ✅ ใช้ arrow function
                                                                    sx={{ marginTop: -0.5, marginBottom: -0.5, marginRight: -2 }}
                                                                >
                                                                    <EditNoteIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => handleDeleteReport(row.id)}
                                                                    sx={{ marginTop: -0.5, marginBottom: -0.5 }}
                                                                >
                                                                    <DeleteForeverIcon />
                                                                </IconButton>
                                                            </Box>
                                                            {/* <Button
                                                                variant="contained"
                                                                color="warning"
                                                                startIcon={<EditNoteIcon />}
                                                                sx={{ height: "25px" }}
                                                                onClick={() => handleEditClick(row.id, row)} // ✅ ใช้ arrow function
                                                                size="small"
                                                                fullWidth
                                                            >
                                                                แก้ไข
                                                            </Button> */}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {
                                    bankDetail.length <= 10 ? null :
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25, 30]}
                                            component="div"
                                            count={bankDetail.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                                            labelDisplayedRows={({ from, to, count }) =>
                                                `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                                            }
                                            sx={{
                                                overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                                                borderBottomLeftRadius: 5,
                                                borderBottomRightRadius: 5,
                                                height: "45px",
                                                '& .MuiTablePagination-toolbar': {
                                                    backgroundColor: "lightgray",
                                                    height: "20px", // กำหนดความสูงของ toolbar
                                                    alignItems: "center",
                                                    paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                                                    overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                                                    fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                                                    marginTop: -0.5
                                                },
                                                '& .MuiTablePagination-select': {
                                                    paddingY: 0,
                                                    fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                                                },
                                                '& .MuiTablePagination-actions': {
                                                    '& button': {
                                                        paddingY: 0,
                                                        fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                                                    },
                                                },
                                                '& .MuiTablePagination-displayedRows': {
                                                    fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                                                },
                                                '& .MuiTablePagination-selectLabel': {
                                                    fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                                                }
                                            }}
                                        />
                                }
                            </TableContainer>
                        </Grid>
                        <Grid item xs={12}>
                            {
                                updateBank ?
                                    <Paper sx={{ backgroundColor: "lightgray", p: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เพิ่มบัญชีธนาคาร</Typography>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <Grid container spacing={1}>
                                            <Grid item xs={2} textAlign="right">
                                                <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>เลขที่บัญชี</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Paper component="form" sx={{ width: "100%" }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={bankID}
                                                        onChange={(e) => setBankID(e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                height: 30, // ปรับความสูงรวม
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                padding: '4px 8px', // ปรับ padding ด้านใน input
                                                                fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                            },
                                                        }}
                                                        InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={2} textAlign="right">
                                                <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>ชื่อบัญชี</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Paper component="form" sx={{ width: "100%" }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={bankName}
                                                        onChange={(e) => setBankName(e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                height: 30, // ปรับความสูงรวม
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                padding: '4px 8px', // ปรับ padding ด้านใน input
                                                                fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                            },
                                                        }}
                                                        InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={2} textAlign="right">
                                                <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>ชื่อธนาคาร</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Paper component="form" sx={{ width: "100%" }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={bank}
                                                        onChange={(e) => setBank(e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                height: 30, // ปรับความสูงรวม
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                padding: '4px 8px', // ปรับ padding ด้านใน input
                                                                fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                            },
                                                        }}
                                                        InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={2} textAlign="right">
                                                <Typography variant="subtitle2" paddingTop={1} fontWeight="bold" gutterBottom>ชื่อย่อธนาคาร</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Paper component="form" sx={{ width: "100%" }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={bankShortName}
                                                        onChange={(e) => setBankShortName(e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                height: 30, // ปรับความสูงรวม
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                padding: '4px 8px', // ปรับ padding ด้านใน input
                                                                fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                            },
                                                        }}
                                                        InputProps={{ sx: { height: 30 } }} // เพิ่มตรงนี้ด้วยถ้า sx ไม่พอ
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 1, marginLeft: 12, marginRight: 12 }}>
                                                    <Button onClick={handlePost} variant="contained" fullWidth color="success" size="small" sx={{ marginRight: 2 }}>บันทึก</Button>
                                                    <Button onClick={() => setUpdateBank(false)} variant="contained" fullWidth color="error" size="small">ยกเลิก</Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                    :
                                    <Box display="flex" alignItems="center" justifyContent="center" >
                                        <Button variant="contained" onClick={() => setUpdateBank(true)}>
                                            เพิ่มบัญชีธนาคาร
                                        </Button>
                                    </Box>
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default BankDetail;
