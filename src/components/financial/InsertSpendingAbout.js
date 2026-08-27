import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
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
    InputAdornment,
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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { IconButtonError, TablecellSelling } from "../../theme/style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useData } from "../../server/path";
import dayjs from "dayjs";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const InsertSpendingAbout = ({ onSend }) => {
    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("");
    const [update, setUpdate] = React.useState(false);
    const [status, setStatus] = React.useState('ไม่ประจำ');
    const [ID, setID] = React.useState("");
    const [name, setName] = React.useState("");
    const [search, setSearch] = React.useState("");
    // const { companypayment } = useData();
    const { companypayment } = useBasicData();
    const filteredByType = Object.values(companypayment);

    const companypaymentDetail = filteredByType.filter(row =>
        row?.Name?.toLowerCase().includes(search.toLowerCase())
    );

    console.log("Type : ", type);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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

    const handleClickOpen = () => {
        setOpen(true);
        onSend(true);
    };

    const handleClose = () => {
        setOpen(false);
        onSend(false);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleUpdate = (data) => {
        setID(data.id);
        setName(data.Name);
        setStatus(data.Status === "ประจำ" ? true : false);
    }

    const handleCancel = () => {
        setID("");
        setName("");
        setStatus("ไม่ประจำ");
    }
    const handleSave = () => {
        database
            .ref("/companypayment/")
            .child(Number(ID) - 1)
            .update({
                Name: name,
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setID("");
                setName("");
                setStatus("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handlePost = () => {
        database
            .ref("companypayment/")
            .child(companypaymentDetail.length)
            .update({
                id: companypaymentDetail.length,
                Name: type,
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setType("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            () => {
                database
                    .ref("companypayment/")
                    .child(id)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ลบข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
        );
    }


    return (
        <React.Fragment>
            <IconButton color="primary" size="large" onClick={handleClickOpen}>
                <AddBoxIcon />
            </IconButton>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="sm"
                hideBackdrop
                sx={{
                    '& .MuiDialog-container': {
                        justifyContent: 'flex-end', // 👈 ชิดซ้าย
                        alignItems: 'center',
                        marginRight: windowWidth <= 900 ? 0 : 15,
                    },
                    zIndex: 1200
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }}>เพิ่มประเภท</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 1, marginBottom: -1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: -0.5 }} gutterBottom>ค้นหา</Typography>
                                <Paper sx={{ width: "100%" }} >
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
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    height: "58vh",
                                }}
                            >
                                <Table
                                    stickyHeader
                                    size="small"
                                    sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}
                                >
                                    <TableHead sx={{ height: "5vh" }}>
                                        <TableRow>
                                            <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: "16px", height: "30px" }}>
                                                ลำดับ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: "16px", height: "30px" }}>
                                                ชื่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", width: 100, position: "sticky", right: 0, height: "30px" }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            companypaymentDetail.filter((item) => item.Status === "อยู่ในระบบ").slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#ffecb3" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#ffecb3" }}>
                                                        {
                                                            ID !== row.id ?
                                                                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Name}</Typography>
                                                                :
                                                                <Paper>
                                                                    <TextField
                                                                        fullWidth
                                                                        value={name}
                                                                        onChange={(e) => setName(e.target.value)}
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
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#ffecb3" }}>
                                                        {
                                                            ID !== row.id ?
                                                                <IconButton size="small" onClick={() => handleUpdate(row)}>
                                                                    <SettingsIcon fontSize="small" color="warning" />
                                                                </IconButton>
                                                                :
                                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -2, marginRight: -2 }}>
                                                                    <IconButton size="small" onClick={() => handleCancel()}>
                                                                        <Paper
                                                                            elevation={0}
                                                                            sx={{
                                                                                p: 0, // ไม่มี padding
                                                                                m: 0, // ไม่มี margin
                                                                                display: 'flex', // ให้ Checkbox ขยายได้เต็มพื้นที่
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center', // กรณีต้องการอยู่ตรงกลาง (เลือกปรับตามต้องการ)
                                                                                width: 'fit-content', // ปรับตาม Checkbox
                                                                                height: 'fit-content',
                                                                                backgroundColor: 'white'
                                                                            }}
                                                                        >
                                                                            <DisabledByDefaultIcon fontSize="small" color="error" />
                                                                        </Paper>
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={() => handleSave()}>
                                                                        <Paper
                                                                            elevation={0}
                                                                            sx={{
                                                                                p: 0, // ไม่มี padding
                                                                                m: 0, // ไม่มี margin
                                                                                display: 'flex', // ให้ Checkbox ขยายได้เต็มพื้นที่
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center', // กรณีต้องการอยู่ตรงกลาง (เลือกปรับตามต้องการ)
                                                                                width: 'fit-content', // ปรับตาม Checkbox
                                                                                height: 'fit-content',
                                                                                backgroundColor: 'white'
                                                                            }}
                                                                        >
                                                                            <AssignmentTurnedInIcon fontSize="small" color="success" />
                                                                        </Paper>
                                                                    </IconButton>
                                                                </Box>
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                                {
                                    companypaymentDetail.filter((item) => item.Status === "อยู่ในระบบ").length <= 10 ? null :
                                        <TablePagination
                                            rowsPerPageOptions={[10, 25, 30]}
                                            component="div"
                                            count={companypaymentDetail.filter((item) => item.Status === "อยู่ในระบบ").length}
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
                                                '& .MuiTablePagination-toolbar': {
                                                    backgroundColor: "lightgray",
                                                    height: "15px", // กำหนดความสูงของ toolbar
                                                    alignItems: "center",
                                                    paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                                                    overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                                                    fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
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
                        {
                            update ?
                                <React.Fragment>
                                    <Grid item xs={12}>
                                        <Divider sx={{ marginBottom: -1, marginTop: -0.5 }}><Chip label="เพิ่มข้อมูล" size="small" /></Divider>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>เพิ่มบริษัทสั่งจ่าย</Typography>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                                <TextField size="small" fullWidth value={type} onChange={(e) => setType(e.target.value)} />
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="center" alignItems="center" >
                                            <Button onClick={handlePost} variant="contained" fullWidth color="success" size="small" sx={{ marginRight: 2 }}>บันทึก</Button>
                                            <Button onClick={() => setUpdate(false)} variant="contained" fullWidth size="small" color="error">ยกเลิก</Button>
                                        </Box>
                                    </Grid>
                                </React.Fragment>
                                :
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Button onClick={() => setUpdate(true)} variant="contained" size="small" color="info">เพิ่มชื่อบริษัทสั่งจ่าย</Button>
                                    </Box>
                                </Grid>
                        }
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertSpendingAbout;
