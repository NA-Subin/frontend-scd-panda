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
    MenuItem,
    Paper,
    Popover,
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
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { TablecellNoData, TablecellSelling } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { apiPost, apiPut } from "../../server/apiClient";
import TablePaginationBar from "../../theme/TablePaginationBar";

// Small "click to explain" hint - a subtle info icon that opens a short
// one-line explanation in a Popover on click (works on touch devices too,
// unlike a hover-only tooltip). Used next to labels/columns whose meaning
// isn't obvious at a glance.
const InfoHint = ({ text, color = "#fff" }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    return (
        <>
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                }}
                sx={{ p: 0.25, ml: 0.5, verticalAlign: "middle" }}
            >
                <InfoOutlinedIcon sx={{ fontSize: 16 }} htmlColor={color} />
            </IconButton>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Typography sx={{ p: 1.5, maxWidth: 280, fontSize: 13 }}>{text}</Typography>
            </Popover>
        </>
    );
};

const ExpenseDetail = ({ openNavbar }) => {
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [ID, setID] = useState("");
    const [check, setCheck] = useState(true);
    const [searchText, setSearchText] = useState("");

    const [openTab, setOpenTab] = React.useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            let width = window.innerWidth;
            if (!openNavbar) {
                width += 120;
            }
            setWindowWidth(width);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openNavbar]);

    const { expenseitems, refetch } = useBasicData();
    const expenseitem = Object.values(expenseitems || {});

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredExpenseItem = expenseitem.filter((t) => t.Status === (check ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ") && t.Name?.toLowerCase().includes(searchText.toLowerCase()));
    const expenseItemPageCount = Math.max(1, Math.ceil(filteredExpenseItem.length / rowsPerPage));
    const safePage = Math.min(page, expenseItemPageCount - 1);
    const pagedExpenseItem = filteredExpenseItem.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

    const handleUpdate = (data) => {
        setID(data.uuid);
        setName(data.Name);
        setType(data.Type);
        setStatus(data.Status === "อยู่ในระบบ" ? true : false);
    }

    const handleSave = async () => {
        try {
            await apiPost("/api/expenseitems", {
                id: expenseitem.length + 1,
                Name: name,
                Type: type,
                Status: "อยู่ในระบบ"
            });
            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            setName("");
            refetch?.();
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    const handleUpdateData = async () => {
        try {
            await apiPut(`/api/expenseitems/${ID}`, {
                Name: name,
                Type: type,
                Status: status ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ"
            });
            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            setID("");
            setName("");
            setType("");
            setStatus("");
            refetch?.();
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    const handleDeleteData = (data) => {
        ShowConfirm(
            `ต้องการลบข้อมูล ${data.Name} ใช่หรือไม่`,
            async () => {
                try {
                    await apiPut(`/api/expenseitems/${data.uuid}`, {
                        Status: "ไม่อยู่ในระบบ"
                    });
                    ShowSuccess("ลบข้อมูลสำเร็จ");
                    refetch?.();
                } catch (error) {
                    ShowError("ลบข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                }
            },
            () => {
                ShowError("ยกเลิกการลบข้อมูล");
            }
        )
    };

    const handleResetData = (data) => {
        ShowConfirm(
            `ต้องการกู้ข้อมูล ${data.Name} ใช่หรือไม่`,
            async () => {
                try {
                    await apiPut(`/api/expenseitems/${data.uuid}`, {
                        Status: "อยู่ในระบบ"
                    });
                    ShowSuccess("กู้ข้อมูลสำเร็จ");
                    refetch?.();
                } catch (error) {
                    ShowError("กู้ข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                }
            },
            () => {
                ShowError("ยกเลิกการลบข้อมูล");
            }
        )
    };

    const handleCancel = () => {
        setID("");
        setName("");
        setType("");
        setStatus("");
    }

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ค่าใช้จ่าย
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
                รายการหมวดค่าใช้จ่ายที่ใช้อ้างอิงเวลาบันทึกรายจ่ายในระบบ
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ width: "100%" }}>
                {
                    windowWidth >= 800 ?
                        <Grid container spacing={2} p={1}>
                            <Grid item sm={12} lg={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{ marginTop: 1, minWidth: 220 }}
                                        gutterBottom
                                    >
                                        รายการค่าใช้จ่าย
                                    </Typography>

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
                                                    height: 35,
                                                },
                                                '& .MuiInputBase-input': {
                                                    padding: '4px 8px',
                                                    fontSize: '0.85rem',
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

                                    <Box sx={{ display: "flex", alignItems: "center", minWidth: 160, justifyContent: "flex-end" }}>
                                        <FormControlLabel
                                            sx={{ m: 0 }}
                                            control={
                                                <Checkbox
                                                    checked={check}
                                                    color="info"
                                                    onChange={() => setCheck(!check)}
                                                />
                                            }
                                            label="อยู่ในระบบ"
                                        />
                                        <InfoHint color="#616161" text="อยู่ในระบบ = แสดงเฉพาะรายการที่ยังใช้งานอยู่ ยกเลิกติ๊กเพื่อดูรายการที่ถูกลบ (ไม่อยู่ในระบบ)" />
                                    </Box>
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
                            sx={{ height: "70vh", marginBottom: 2 }}
                        >
                            <Table stickyHeader size="small">
                                <TableHead sx={{ height: "7vh" }}>
                                    <TableRow>
                                        <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                            ชื่อรายการ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            ประเภท
                                            <InfoHint text="หมวดหมู่ของรายการค่าใช้จ่าย ใช้อ้างอิงเวลาบันทึกรายจ่ายจริงในระบบ" />
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            สถานะ
                                            <InfoHint text="อยู่ในระบบ = ใช้งานได้ตามปกติ, ไม่อยู่ในระบบ = ถูกลบออกจากรายการที่เลือกได้ แต่ยังกู้คืนได้" />
                                        </TablecellSelling>
                                        <TablecellSelling width={50} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredExpenseItem.length === 0 ? (
                                        <TableRow>
                                            <TablecellNoData colSpan={5}>
                                                <Inventory fontSize="large" />
                                                <br />
                                                ไม่มีข้อมูล
                                            </TablecellNoData>
                                        </TableRow>
                                    ) : (
                                        pagedExpenseItem
                                            .map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.uuid && "bold" }} gutterBottom>{safePage * rowsPerPage + index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
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
                                                                                height: 30,
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                padding: '4px 8px',
                                                                                fontSize: '0.85rem',
                                                                            },
                                                                        }}
                                                                        InputProps={{ sx: { height: 30 } }}
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.id ?
                                                                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Type}</Typography>
                                                                :
                                                                <Paper>
                                                                    <TextField
                                                                        select
                                                                        fullWidth
                                                                        value={type}
                                                                        onChange={(e) => setType(e.target.value)}
                                                                        size="small"
                                                                        sx={{
                                                                            "& .MuiInputBase-root": {
                                                                                height: 30,
                                                                            },
                                                                            "& .MuiInputBase-input": {
                                                                                padding: "4px 8px",
                                                                                fontSize: "0.85rem",
                                                                            },
                                                                        }}
                                                                        InputProps={{ sx: { height: 30 } }}
                                                                    >
                                                                        <MenuItem value="ค่าใช้จ่าย">ค่าใช้จ่าย</MenuItem>
                                                                    </TextField>
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.id ?
                                                                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5 }} gutterBottom>{row.Status}</Typography>
                                                                :
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 0,
                                                                        m: 0,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: 'fit-content',
                                                                        height: 'fit-content',
                                                                        backgroundColor: 'white',
                                                                        marginLeft: 2
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={status}
                                                                        onChange={() => setStatus(!status)}
                                                                        sx={{
                                                                            p: 0,
                                                                            m: 0,
                                                                        }}
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
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
                                                                                p: 0,
                                                                                m: 0,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: 'fit-content',
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
                                                                                p: 0,
                                                                                m: 0,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: 'fit-content',
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
                                    )}
                                    {
                                        open &&
                                        <TableRow sx={{ backgroundColor: "#c5cae9", position: "sticky", bottom: 0 }}>
                                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{expenseitem.filter((t) => t.Status === (check ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ")).length + 1}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                <Paper>
                                                    <TextField
                                                        fullWidth
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        size="small"
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                height: 30,
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                padding: '4px 8px',
                                                                fontSize: '0.85rem',
                                                            },
                                                        }}
                                                        InputProps={{ sx: { height: 30 } }}
                                                    />
                                                </Paper>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                <Paper>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        value={type}
                                                        onChange={(e) => setType(e.target.value)}
                                                        size="small"
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 30,
                                                            },
                                                            "& .MuiInputBase-input": {
                                                                padding: "4px 8px",
                                                                fontSize: "0.85rem",
                                                            },
                                                        }}
                                                        InputProps={{ sx: { height: 30 } }}
                                                    >
                                                        <MenuItem value="ค่าใช้จ่าย">ค่าใช้จ่าย</MenuItem>
                                                    </TextField>
                                                </Paper>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }} colSpan={2}></TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePaginationBar
                            count={filteredExpenseItem.length}
                            page={safePage}
                            rowsPerPage={rowsPerPage}
                            onPageChange={setPage}
                            onRowsPerPageChange={setRowsPerPage}
                        />
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
                            <Button variant="contained" size="small" onClick={() => setOpen(true)}>เพิ่มค่าใช้จ่าย</Button>
                    }
                </Box>
            </Box>
        </Container>
    );
};

export default ExpenseDetail;
