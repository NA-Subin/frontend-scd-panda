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
    FormGroup,
    Grid,
    IconButton,
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
import { IconButtonWarning, TablecellSelling, TablecellNoData } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import InsertDeductibleIncome from "./InsertDeductibleIncome";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { apiPut } from "../../server/apiClient";
import TablePaginationBar from "../../theme/TablePaginationBar";

// Small "click to explain" hint - a subtle info icon that opens a short
// one-line explanation in a Popover on click (works on touch devices too,
// unlike a hover-only tooltip). Used next to labels/columns whose meaning
// isn't obvious (e.g. deduction-vs-income logic, "ประจำ" status).
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

const DeductibleIncomeDetail = ({ openNavbar }) => {
    const [update, setUpdate] = React.useState({});
    const [open, setOpen] = useState(false);
    const [typeIncome, setTypeIncome] = React.useState(true);
    const [typeDeduction, setTypeDeduction] = React.useState(true);
    const [ID, setID] = React.useState("");
    const [name, setName] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [checkIncome, setCheckIncome] = React.useState(false);
    const [checkDeduction, setCheckDeduction] = React.useState(false);
    const [checkData, setCheckData] = React.useState(true);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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

    const { creditors, deductibleincome, refetch } = useBasicData();
    const creditor = Object.values(creditors || {});
    const deductibleIncome = Object.values(deductibleincome || {});

    const deduction = deductibleIncome.filter((row) => {
        if (row.Type !== "รายหัก") return false;

        if (checkDeduction) {
            return row.Status === "ประจำ";
        }

        return true;
    });

    const income = deductibleIncome.filter((row) => {
        if (row.Type !== "รายได้") return false;

        if (checkIncome) {
            return row.Status === "ประจำ";
        }

        return true;
    });


    const [pageIncome, setPageIncome] = useState(0);
    const [rowsPerPageIncome, setRowsPerPageIncome] = useState(10);

    const [pageDeduction, setPageDeduction] = useState(0);
    const [rowsPerPageDeduction, setRowsPerPageDeduction] = useState(10);

    const incomeFiltered = income.filter((t) => t.StatusData === (checkData ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ"));
    const incomePageCount = Math.max(1, Math.ceil(incomeFiltered.length / rowsPerPageIncome));
    const safePageIncome = Math.min(pageIncome, incomePageCount - 1);
    const pagedIncome = incomeFiltered.slice(safePageIncome * rowsPerPageIncome, safePageIncome * rowsPerPageIncome + rowsPerPageIncome);

    const deductionFiltered = deduction.filter((t) => t.StatusData === (checkData ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ"));
    const deductionPageCount = Math.max(1, Math.ceil(deductionFiltered.length / rowsPerPageDeduction));
    const safePageDeduction = Math.min(pageDeduction, deductionPageCount - 1);
    const pagedDeduction = deductionFiltered.slice(safePageDeduction * rowsPerPageDeduction, safePageDeduction * rowsPerPageDeduction + rowsPerPageDeduction);

    const handleUpdate = (data) => {
        setID(data.uuid);
        setName(data.Name);
        setStatus(data.Status === "ประจำ" ? true : false);
    }

    const handleCancel = () => {
        setID("");
        setName("");
        setStatus("");
    }

    const handleSave = async () => {
        try {
            await apiPut(`/api/deductibleincome/${ID}`, {
                Name: name,
                Status: status ? "ประจำ" : "ไม่ประจำ",
                StatusData: checkData ? "อยู่ในระบบ" : "ไม่อยู่ในระบบ"
            });
            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            setID("");
            setName("");
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
                    await apiPut(`/api/deductibleincome/${data.uuid}`, { StatusData: "ไม่อยู่ในระบบ" });
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
                    await apiPut(`/api/deductibleincome/${data.uuid}`, { StatusData: "อยู่ในระบบ" });
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

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            {
                windowWidth >= 800 ?
                    <Grid container spacing={2} p={1}>
                        <Grid item sm={12} lg={12}>
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                textAlign="center"
                                gutterBottom
                            >
                                {
                                    (typeIncome && !typeDeduction) ? "รายได้"
                                        : (!typeIncome && typeDeduction) ? "รายหัก"
                                            : "รายได้รายหัก"
                                }
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={12} sx={{ textAlign: "center", mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                รายการรายได้และรายหักที่ใช้ประกอบการคำนวณเงินเดือนพนักงาน
                            </Typography>
                        </Grid>
                        <Grid item sm={12} lg={12} sx={{ textAlign: "right" }}>
                            <InsertDeductibleIncome data={deductibleIncome.length} income={income.length + 1} deduction={deduction.length + 1} />
                        </Grid>
                        <Grid item xs={12} md={12} sx={{ textAlign: "right" }}>
                            <FormGroup row sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                                <Typography variant="subtitle1" sx={{ marginRight: 1 }}>เลือกเพื่อแสดงข้อมูล</Typography>
                                <InfoHint
                                    color="#616161"
                                    text="รายได้ = เงินที่จ่ายเพิ่มให้พนักงาน (เช่น ค่าคอมมิชชั่น), รายหัก = เงินที่หักออกจากพนักงาน (เช่น ค่าปรับ, ประกันสังคม) ใช้ติ๊กเพื่อเลือกแสดงตารางที่ต้องการ"
                                />
                                <FormControlLabel control={<Checkbox checked={typeIncome} color="info" onChange={() => setTypeIncome(!typeIncome)} />} label="รายได้" />
                                <FormControlLabel control={<Checkbox checked={typeDeduction} color="info" onChange={() => setTypeDeduction(!typeDeduction)} />} label="รายหัก" />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checkData}
                                            color="info"
                                            onChange={() => setCheckData(!checkData)}
                                        />
                                    }
                                    label="อยู่ในระบบ"
                                />
                                <InfoHint
                                    color="#616161"
                                    text="อยู่ในระบบ = แสดงเฉพาะรายการที่ยังใช้งานอยู่ ยกเลิกติ๊กเพื่อดูรายการที่ถูกลบ (ไม่อยู่ในระบบ)"
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
                    :
                    <Grid container spacing={2} p={1}>
                        <Grid item xs={12}>
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                textAlign="center"
                                gutterBottom
                            >
                                รายได้รายหัก
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                รายการรายได้และรายหักที่ใช้ประกอบการคำนวณเงินเดือนพนักงาน
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: "center" }}>
                            <InsertDeductibleIncome data={deductibleIncome.length} income={income.length + 1} deduction={deduction.length + 1} />
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: "center" }}>
                            <FormGroup row>
                                <Typography variant="subtitle1" sx={{ marginRight: 1, marginTop: 1 }} gutterBottom>เลือกเพื่อแสดงข้อมูล</Typography>
                                <FormControlLabel control={<Checkbox checked={typeIncome} color="info" onChange={() => setTypeIncome(!typeIncome)} />} label="รายได้" />
                                <FormControlLabel control={<Checkbox checked={typeDeduction} color="info" onChange={() => setTypeDeduction(!typeDeduction)} />} label="รายหัก" />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checkData}
                                            color="info"
                                            onChange={() => setCheckData(!checkData)}
                                        />
                                    }
                                    label="อยู่ในระบบ"
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
            }
            <Divider sx={{ marginBottom: 1 }} />
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={2}>
                    {
                        typeIncome &&
                        <Grid item xs={12} md={(typeIncome && typeDeduction) ? 6 : 12} >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom={false}>รายละเอียดรายได้</Typography>
                                    <InfoHint color="#616161" text="ติ๊ก 'ประจำ' เพื่อแสดงเฉพาะรายได้ที่เกิดขึ้นทุกงวดเงินเดือน (ไม่รวมรายการที่เกิดขึ้นเป็นครั้งคราว)" />
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checkIncome}
                                            color="info"
                                            onChange={() => setCheckIncome(!checkIncome)}
                                        />
                                    }
                                    label="ประจำ"
                                />
                            </Box>
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
                                                รหัส
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ชื่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                สถานะ
                                                <InfoHint text="ประจำ = รายการนี้เกิดขึ้นทุกงวดเงินเดือน, ไม่ประจำ = เกิดขึ้นเป็นครั้งคราวเท่านั้น" />
                                            </TablecellSelling>
                                            <TablecellSelling width={50} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {incomeFiltered.length === 0 ? (
                                            <TableRow>
                                                <TablecellNoData colSpan={5}>
                                                    <Inventory fontSize="large" />
                                                    <br />
                                                    ไม่มีข้อมูล
                                                </TablecellNoData>
                                            </TableRow>
                                        ) : (
                                            pagedIncome.map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.uuid && "bold" }} gutterBottom>{safePageIncome * rowsPerPageIncome + index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.uuid && "bold" }} gutterBottom>{row.Code}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.uuid ?
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
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.uuid ?
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
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.uuid ?
                                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                    <IconButton size="small" onClick={() => handleUpdate(row)}>
                                                                        <SettingsIcon fontSize="small" color="warning" />
                                                                    </IconButton>
                                                                    {
                                                                        row.StatusData === "อยู่ในระบบ" ?
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
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePaginationBar
                                count={incomeFiltered.length}
                                page={safePageIncome}
                                rowsPerPage={rowsPerPageIncome}
                                onPageChange={setPageIncome}
                                onRowsPerPageChange={setRowsPerPageIncome}
                            />
                        </Grid>
                    }
                    {
                        typeDeduction &&
                        <Grid item xs={12} md={(typeIncome && typeDeduction) ? 6 : 12} >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom={false}>รายละเอียดรายหัก</Typography>
                                    <InfoHint color="#616161" text="ติ๊ก 'ประจำ' เพื่อแสดงเฉพาะรายหักที่เกิดขึ้นทุกงวดเงินเดือน (ไม่รวมรายการที่เกิดขึ้นเป็นครั้งคราว)" />
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checkDeduction}
                                            color="info"
                                            onChange={() => setCheckDeduction(!checkDeduction)}
                                        />
                                    }
                                    label="ประจำ"
                                />
                            </Box>
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
                                                รหัส
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                ชื่อ
                                            </TablecellSelling>
                                            <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                สถานะ
                                                <InfoHint text="ประจำ = รายการนี้เกิดขึ้นทุกงวดเงินเดือน, ไม่ประจำ = เกิดขึ้นเป็นครั้งคราวเท่านั้น" />
                                            </TablecellSelling>
                                            <TablecellSelling width={50} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deductionFiltered.length === 0 ? (
                                            <TableRow>
                                                <TablecellNoData colSpan={5}>
                                                    <Inventory fontSize="large" />
                                                    <br />
                                                    ไม่มีข้อมูล
                                                </TablecellNoData>
                                            </TableRow>
                                        ) : (
                                            pagedDeduction.map((row, index) => (
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.uuid && "bold" }} gutterBottom>{safePageDeduction * rowsPerPageDeduction + index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', marginTop: 0.5, fontWeight: ID === row.uuid && "bold" }} gutterBottom>{row.Code}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.uuid ?
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
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.uuid ?
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
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: ID === row.uuid && "#c5cae9" }}>
                                                        {
                                                            ID !== row.uuid ?
                                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                    <IconButton size="small" onClick={() => handleUpdate(row)}>
                                                                        <SettingsIcon fontSize="small" color="warning" />
                                                                    </IconButton>
                                                                    {
                                                                        row.StatusData === "อยู่ในระบบ" ?
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
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePaginationBar
                                count={deductionFiltered.length}
                                page={safePageDeduction}
                                rowsPerPage={rowsPerPageDeduction}
                                onPageChange={setPageDeduction}
                                onRowsPerPageChange={setRowsPerPageDeduction}
                            />
                        </Grid>
                    }
                </Grid>
            </Box>
        </Container>
    );
};

export default DeductibleIncomeDetail;
