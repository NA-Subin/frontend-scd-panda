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
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Popover,
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
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { TablecellSelling } from "../../theme/style";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { database } from "../../server/firebase";
import ImportExcel from "./ExportExcel";

const CompanyPayment = ({ openNavbar }) => {
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [ID, setID] = useState("");
    const [status, setStatus] = useState("");
    const [check, setCheck] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [keyword, setKeyword] = useState(""); // ค่าที่ใช้ค้นหาจริง (กดปุ่มก่อนค่อยค้น)

    const [openTab, setOpenTab] = React.useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

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

    //const { creditors } = useData();
    const { companypayment } = useBasicData();
    const companypayments = Object.values(companypayment || {});

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
        setStatus(data.Status === "อยู่ในระบบ" ? true : false);
    }

    const filteredData = companypayments
        .filter((t) => t.Status === (check ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ"))
        .filter((t) =>
            t.Name?.toLowerCase().includes(searchText.toLowerCase())
        );

    const handleSave = () => {
        database
            .ref("/companypayment/")
            .child(companypayments.length)
            .update({
                id: companypayments.length + 1,
                Name: name,
                Status: status
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setName("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleUpdateData = () => {
        database
            .ref("/companypayment/")
            .child(Number(ID))
            .update({
                Name: name,
                Status: status ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setID("");
                setName("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleDeleteData = (data) => {
        ShowConfirm(
            `ต้องการลบข้อมูล ${data.Name} ใช่หรือไม่`,
            () => {
                database
                    .ref("/companypayment/")
                    .child(Number(data.id))
                    .update({
                        Status: "ไม่อยู่ในระบบ"
                    })
                    .then(() => {
                        ShowSuccess("ลบข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("ลบข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                ShowError("ยกเลิกการลบข้อมูล");
            }
        )
    };

    const handleResetData = (data) => {
        ShowConfirm(
            `ต้องการกู้ข้อมูล ${data.Name} ใช่หรือไม่`,
            () => {
                database
                    .ref("/companypayment/")
                    .child(Number(data.id))
                    .update({
                        Status: "อยู่ในระบบ"
                    })
                    .then(() => {
                        ShowSuccess("กู้ข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("กู้ข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                ShowError("ยกเลิกการลบข้อมูล");
            }
        )
    };

    const handleCancel = () => {
        setID("");
        setName("");
    }

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                บริษัทที่สั่งจ่าย
            </Typography>
            {/* <ImportExcel /> */}
            <Divider sx={{ marginBottom: 1 }} />
            <Box sx={{ width: "100%" }}>
                {
                    windowWidth >= 800 ?
                        <Grid container spacing={2} p={1}>
                            <Grid item sm={12} lg={12}>
                                {/* <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>รายชื่อบริษัทที่สั่งจ่าย</Typography> */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1
                                    }}
                                >
                                    {/* ซ้าย */}
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{ marginTop: 1, minWidth: 220 }}
                                        gutterBottom
                                    >
                                        รายชื่อบริษัทที่สั่งจ่าย
                                    </Typography>

                                    {/* กลาง (Search) */}
                                    <Box
                                        sx={{
                                            flex: 1,
                                            display: "flex",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            value={searchText}
                                            onChange={(e) => {
                                                setSearchText(e.target.value);
                                                setPage(0); // 🔥 รีเซ็ตหน้าเวลา search กันหน้าว่าง
                                            }}
                                            size="small"
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    height: 35, // ปรับความสูงรวม
                                                },
                                                '& .MuiInputBase-input': {
                                                    padding: '4px 8px', // ปรับ padding ด้านใน input
                                                    fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                                },
                                            }}
                                            InputProps={{
                                                sx: { height: 35 },
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <b>ค้นหา :</b>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Box>

                                    {/* ขวา */}
                                    <FormControlLabel
                                        sx={{ minWidth: 160, justifyContent: "flex-end", m: 0 }}
                                        control={
                                            <Checkbox
                                                checked={check}
                                                color="info"
                                                onChange={() => setCheck(!check)}
                                            />
                                        }
                                        label="อยู่ในระบบ"
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        :
                        <Grid container spacing={2} p={1}>
                            <Grid item xs={12} sx={{ textAlign: "center" }}>

                            </Grid>
                        </Grid>
                }
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TableContainer
                            component={Paper}
                            style={{ maxHeight: "70vh" }}
                            sx={{ marginBottom: 2 }}
                        >
                            <Table stickyHeader size="small">
                                <TableHead sx={{ height: "7vh" }}>
                                    <TableRow>
                                        <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                            ชื่อบริษัท
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            สถานะ
                                        </TablecellSelling>
                                        <TablecellSelling width={50} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        filteredData.filter((t) => t.Status === (check ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ")).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                            <TableRow>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.id && "bold" }} gutterBottom>{index + 1}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
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
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    {
                                                        ID !== row.id ?
                                                            <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Status}</Typography>
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
                                                                    marginLeft: 2
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
                                                <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.id && "#c5cae9" }}>
                                                    {
                                                        ID !== row.id ?
                                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                <IconButton size="small" onClick={() => handleUpdate(row)}>
                                                                    <SettingsIcon fontSize="small" color="warning" />
                                                                </IconButton>
                                                                {
                                                                    row.Status === "อยู่ในระบบ" ?
                                                                        <IconButton size="small" onClick={() => handleDeleteData(row)}>
                                                                            <DeleteForeverIcon fontSize="small" color="error" />
                                                                        </IconButton>
                                                                        :
                                                                        <IconButton size="small" onClick={() => handleResetData(row)}>
                                                                            <AssignmentTurnedInIcon fontSize="small" color="success" />
                                                                        </IconButton>
                                                                }
                                                            </Box>
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
                                                                <IconButton size="small" onClick={() => handleUpdateData()}>
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
                                    {
                                        open &&
                                        <TableRow sx={{ backgroundColor: "#c5cae9" }}>
                                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{companypayments.filter((t) => t.Status === (check ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ")).length + 1}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
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
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }} colSpan={2}></TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {
                            filteredData.length <= 10 ? null :
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 30]}
                                    component="div"
                                    count={filteredData.length}
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
                                            height: "20px", // กำหนดความสูงของ toolbar
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
                    </Grid>
                </Grid>
                <Box sx={{ marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {
                        open ?
                            <Box display="flex" alignItems="center" justifyContent="center" >
                                <Button variant="contained" color="error" sx={{ marginRight: 2 }} size="small" onClick={() => setOpen(false)}>ยกเลิก</Button>
                                <Button variant="contained" color="success" size="small" onClick={() => handleSave()}>บันทึก</Button>
                            </Box>
                            :
                            <Button variant="contained" size="small" onClick={() => setOpen(true)}>เพิ่มบริษัทสั่งจ่าย</Button>
                    }
                </Box>
            </Box>
        </Container>
    );
};

export default CompanyPayment;
