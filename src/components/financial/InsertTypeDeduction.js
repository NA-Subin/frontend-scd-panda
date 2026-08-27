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
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
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

const InsertTypeDeduction = ({ onSend }) => {
    // const { typeFinancial } = useData();
    const { deductibleincome } = useBasicData();
    const deductibleIncome = Object.values(deductibleincome || {});

    const deduction = deductibleIncome.filter(row => row.Type === "รายหัก");
    const income = deductibleIncome.filter(row => row.Type === "รายได้");

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

    const [open, setOpen] = React.useState(false);
    const [update, setUpdate] = React.useState(false);
    const [typeDeduction, setTypeDeduction] = React.useState(true);
    const [typeIncome, setTypeIncome] = React.useState(true);
    const [search, setSearch] = React.useState("");

    // เลือกชุดข้อมูลตาม typeIncome / typeDeduction ก่อน
    const filteredByType = typeIncome && !typeDeduction
        ? income
        : !typeIncome && typeDeduction
            ? deduction
            : deductibleIncome;

    // กรองข้อมูลตาม search (ทั้ง Name และ Code)
    const dataSource = filteredByType.filter(row =>
        row?.Name?.toLowerCase().includes(search.toLowerCase()) ||
        row?.Code?.toLowerCase().includes(search.toLowerCase())
    );


    const [type, setType] = React.useState("รายได้");
    const [status, setStatus] = React.useState('ไม่ประจำ');
    const [ID, setID] = React.useState("");
    const [name, setName] = React.useState("");

    const [code, setCode] = React.useState(() => {
        const prefix = type === "รายได้" ? "R" : "D";
        const lengthCount = type === "รายได้" ? income.length : deduction.length;
        return `${prefix}${lengthCount.toString().padStart(3, '0')}`;
    });

    React.useEffect(() => {
        const newCode = type === "รายได้"
            ? `R${income.length.toString().padStart(3, '0')}`
            : `D${deduction.length.toString().padStart(3, '0')}`;
        setCode(newCode);
    }, [type, income.length, deduction.length]);

    console.log("Type : ", type);


    const handleClickOpen = () => {
        setOpen(true);
        onSend(true);
    };

    const handleClose = () => {
        setOpen(false);
        onSend(false);
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

    const handlePost = () => {
        database
            .ref("deductibleincome")
            .child(deductibleIncome.length)
            .update({
                id: deductibleIncome.length,
                Name: name,
                Type: type,
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setName("");
                setType("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleSave = () => {
        database
            .ref("/deductibleincome/")
            .child(Number(ID) - 1)
            .update({
                Name: name,
                Status: status ? "ประจำ" : "ไม่ประจำ"
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

    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            () => {
                database
                    .ref("/deductibleincome")
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
            {/* <IconButton color="primary" size="large" sx={{ marginTop: -1.5 }} onClick={handleClickOpen}>
                <AddBoxIcon fontSize="large"/>
            </IconButton> */}
            <Button variant="contained" color="primary" onClick={handleClickOpen}>
                เพิ่มประเภทรายได้รายหัก
            </Button>
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
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >เพิ่มประเภท</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <FormGroup row>
                                <Typography variant="subtitle1" sx={{ marginRight: 1, marginTop: 1 }} gutterBottom>เลือกเพื่อแสดงข้อมูล</Typography>
                                <FormControlLabel control={<Checkbox checked={typeIncome} color="info" onChange={() => setTypeIncome(!typeIncome)} />} label="รายได้" />
                                <FormControlLabel control={<Checkbox checked={typeDeduction} color="info" onChange={() => setTypeDeduction(!typeDeduction)} />} label="รายหัก" />
                            </FormGroup>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingLeft: 2, paddingRight: 2 }}>
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
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    height: "42vh",
                                    marginTop: -1
                                }}
                            >
                                <Table
                                    stickyHeader
                                    size="small"
                                    sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                >
                                    <TableHead sx={{ height: "5vh" }}>
                                        <TableRow>
                                            <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                ลำดับ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                รหัส
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ชื่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                                ประเภท
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                                สถานะ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", width: 80, position: "sticky", right: 0 }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            dataSource.filter((item) => item.StatusData === "อยู่ในระบบ").slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#ffecb3" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#ffecb3" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{row.Code}</Typography>
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
                                                        <Typography variant="subtitle1" fontSize="14px" sx={{ lineHeight: 1, whiteSpace: "nowrap", fontWeight: ID === row.id && "bold" }} gutterBottom>{row.Type}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#ffecb3" }}>
                                                        {
                                                            ID !== row.id ?
                                                                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>{row.Status}</Typography>
                                                                // <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>{row.Status === "ประจำ" ? <CheckIcon fontSize="small" /> : <ClearIcon fontSize="small" />}</Typography>
                                                                :
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
                                                                        backgroundColor: 'white',
                                                                        marginLeft: 3
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={status}
                                                                        onChange={() => setStatus(!status)}
                                                                        sx={{
                                                                            p: 0, // ไม่มี padding รอบ checkbox
                                                                            m: 0, // ไม่มี margin
                                                                        }}
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
                                                    {/* <TableCell sx={{ textAlign: "center" }}>
                                                        <Button variant="contained" size="small" sx={{ height: "22px" }} color="error" fullWidth
                                                            onClick={() => handleChangDelete(row.id)}
                                                        >ลบ</Button>
                                                    </TableCell> */}
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                                {
                                    dataSource.filter((item) => item.StatusData === "อยู่ในระบบ").length <= 10 ? null :
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25, 30]}
                                            component="div"
                                            count={dataSource.filter((item) => item.StatusData === "อยู่ในระบบ").length}
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
                        {
                            update ?
                                <React.Fragment>
                                    <Grid item xs={12}>
                                        <Divider sx={{ marginTop: 1 }}><Chip label="เพิ่มข้อมูล" size="small" /></Divider>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>รหัส</Typography>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                                <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} disabled />
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ชื่อ</Typography>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                                <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormGroup row sx={{ marginTop: -1 }}>
                                            <Typography variant="subtitle1" sx={{ marginRight: 1, marginTop: 1, fontWeight: "bold" }} gutterBottom>ประเภท</Typography>
                                            <FormControlLabel control={<Checkbox checked={type === "รายได้" ? true : false} color="info" onChange={() => setType("รายได้")} />} label="รายได้" />
                                            <FormControlLabel control={<Checkbox checked={type === "รายหัก" ? true : false} color="info" onChange={() => setType("รายหัก")} />} label="รายหัก" />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormGroup row sx={{ marginTop: -1 }}>
                                            <Typography variant="subtitle1" sx={{ marginRight: 1, marginTop: 1, fontWeight: "bold" }} gutterBottom>สถานะ</Typography>
                                            <FormControlLabel control={<Checkbox checked={status === "ประจำ" ? true : false} color="info" onChange={() => setStatus("ประจำ")} />} label="ประจำ" />
                                            <FormControlLabel control={<Checkbox checked={status === "ไม่ประจำ" ? true : false} color="info" onChange={() => setStatus("ไม่ประจำ")} />} label="ไม่ประจำ" />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="center" alignItems="center" >
                                            <Button onClick={handlePost} variant="contained" fullWidth color="success" size="small" sx={{ marginRight: 2 }}>บันทึก</Button>
                                            <Button onClick={() => setUpdate(false)} variant="contained" fullWidth size="small" color="error">ยกเลิก</Button>
                                        </Box>
                                    </Grid>
                                </React.Fragment>
                                :
                                <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" >
                                    <Button onClick={() => setUpdate(true)} variant="contained" size="small" color="info">เพิ่มข้อมูลรายได้รายหัก</Button>
                                </Grid>
                        }
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertTypeDeduction;
