import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Chip,
    Container,
    Divider,
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
} from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { TablecellHeader, TablecellNoData, TablecellSelling } from "../../../theme/style";
import { Inventory } from "@mui/icons-material";
import InsertTruckTransport from "./InsertTruckTransport";
import { apiPut } from "../../../server/apiClient";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import TablePaginationBar from "../../../theme/TablePaginationBar";
import theme from "../../../theme/theme";

// Small click-to-open explanation bubble - used next to column headers whose
// meaning isn't obvious from the label alone. Deliberately click (not just
// hover) so it also works on touch screens.
const InfoHint = ({ title }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    return (
        <>
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                }}
                sx={{ p: 0.25, ml: 0.5, color: "inherit", verticalAlign: "middle" }}
            >
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Typography sx={{ p: 1.5, maxWidth: 260, fontSize: 13, fontWeight: "normal", textAlign: "left" }}>
                    {title}
                </Typography>
            </Popover>
        </>
    );
};

const TruckTransport = ({ openNavbar }) => {
    const [open, setOpen] = useState(1);
    const [openTab, setOpenTab] = React.useState(true);
    const [openMenu, setOpenMenu] = React.useState(1);
    const [loading, setLoading] = useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const { transport, company, refetch: refetchBasicData } = useBasicData();
    const dataTransport = Object.values(transport || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const dataCompany = Object.values(company || {});

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


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const pageCount = Math.max(1, Math.ceil(dataTransport.length / rowsPerPage));
    const safePage = Math.min(page, pageCount - 1);

    const [update, setUpdate] = React.useState(false);
    const [rowIndex, setRowIndex] = React.useState(null);
    const [rowID, setRowID] = React.useState(null);
    const [name, setName] = React.useState("");
    const [registration, setRegistration] = React.useState("");
    const [weight, setWeight] = React.useState("");
    const [companies, setCompanies] = React.useState("");


    const handleUpdate = (index, rowId, newName, newRegistration, newWeight, newCompany) => {
        setUpdate(true);
        setRowIndex(index + 1);
        setRowID(rowId);
        setName(newName);
        setRegistration(newRegistration);
        setWeight(newWeight);
        setCompanies(newCompany);
    };

    const handleSave = async () => {
        const targetRow = dataTransport.find((row) => row.id === rowID);
        if (!targetRow?.uuid) {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
            return;
        }

        const companyRow = companies?.includes(":")
            ? dataCompany.find((c) => c.id === Number(companies.split(":")[0]))
            : dataCompany.find((c) => c.uuid === companies);

        try {
            await apiPut(`/api/truck_transport/${targetRow.uuid}`, {
                Name: name,
                Company: companyRow?.uuid || null,
                CompanyName: companyRow?.Name || "",
                Registration: registration,
                Weight: weight,
            });
            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            refetchBasicData?.();
            setUpdate(false);
            setRowID(null);
            setRowIndex(null);
        } catch (error) {
            ShowError("แก้ไขข้อมูลไม่สำเร็จ");
            console.error("Error updating data:", error);
        }
    };

    const handleCancel = () => {
        setUpdate(false);
        setRowID(null);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                รถรับจ้างขนส่ง
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
                ข้อมูลรถของบริษัทภายนอกที่รับจ้างขนส่งให้ พร้อมสถานะว่ารถคันไหนว่างหรือกำลังปฏิบัติงานอยู่
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Paper sx={{ borderRadius: 3, p: { xs: 1.5, sm: 3 }, borderTop: "5px solid " + theme.palette.panda.light }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8} lg={10}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 0 }}>รายการรถรับจ้างขนส่ง</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} lg={2} sx={{ textAlign: { xs: "center", sm: "right" } }}>
                        <InsertTruckTransport />
                    </Grid>
                </Grid>
                <Box sx={{ width: "100%" }}>
                    <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{ height: "70vh", marginTop: 2 }}
                    >
                        <Table stickyHeader size="small" sx={{ width: "100%" }}>
                            <TableHead sx={{ height: "7vh" }}>
                                <TableRow>
                                    <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                        ลำดับ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                        ชื่อ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                        ทะเบียน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        น้ำหนัก
                                        <InfoHint title="น้ำหนักบรรทุกสูงสุดของรถคันนี้ ตามที่บันทึกไว้ตอนเพิ่มข้อมูล" />
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                        บริษัท
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        สถานะ
                                        <InfoHint title={'"ว่าง" = รถพร้อมใช้งาน, ค่าอื่น (เช่น "ไม่ว่าง") = รถกำลังปฏิบัติงานอยู่'} />
                                    </TablecellSelling>
                                    <TablecellSelling colSpan={2} width={50} sx={{ position: "sticky", right: 0 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataTransport.length === 0 ? (
                                    <TableRow>
                                        <TablecellNoData colSpan={8}>
                                            <Inventory fontSize="large" />
                                            <br />
                                            ไม่มีข้อมูล
                                        </TablecellNoData>
                                    </TableRow>
                                ) : (
                                dataTransport.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.uuid || index}>
                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                !update || row.id !== rowID ? row.Name
                                                    :
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
                                                                    height: '30px',
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px',
                                                                    textAlign: "center"
                                                                },
                                                            }}
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                !update || row.id !== rowID ? row.Registration
                                                    :
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
                                                                    height: '30px',
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px',
                                                                    textAlign: "center"
                                                                },
                                                            }}
                                                            value={registration}
                                                            onChange={(e) => setRegistration(e.target.value)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                !update || row.id !== rowID ? row.Weight
                                                    :
                                                    <Paper sx={{ width: "100%" }}>
                                                        <TextField
                                                            type="number"
                                                            fullWidth
                                                            InputLabelProps={{
                                                                sx: {
                                                                    fontSize: '14px',
                                                                },
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '30px',
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px',
                                                                    textAlign: "center"
                                                                },
                                                            }}
                                                            value={weight}
                                                            onChange={(e) => setWeight(e.target.value)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                !update || row.id !== rowID ? (row.CompanyName || "-")
                                                    :
                                                    <Paper
                                                        component="form">
                                                        <Select
                                                            id="demo-simple-select"
                                                            value={companies}
                                                            size="small"
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    height: '30px',
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px',
                                                                    textAlign: "center"
                                                                },
                                                            }}
                                                            onChange={(e) => setCompanies(e.target.value)}
                                                            fullWidth
                                                        >
                                                            <MenuItem value={companies}>
                                                                {companies?.includes(":") ? companies.split(":")[1] : (dataCompany.find((c) => c.uuid === companies)?.Name || "-")}
                                                            </MenuItem>
                                                            {
                                                                dataCompany.map((row) => (
                                                                    row.id != 1 && (!companies?.includes(":") || Number(companies.split(":")[0]) !== row.id) &&
                                                                    <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Chip
                                                label={row.Status || "-"}
                                                size="small"
                                                color={row.Status === "ว่าง" ? "success" : "default"}
                                                variant={row.Status === "ว่าง" ? "filled" : "outlined"}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                                            {
                                                !update || row.id !== rowID ?
                                                    <Button
                                                        variant="contained"
                                                        color="warning"
                                                        startIcon={<EditNoteIcon />}
                                                        size="small"
                                                        sx={{ height: "25px" }}
                                                        onClick={() => handleUpdate(index, row.id, row.Name, row.Registration, row.Weight, row.Company)}
                                                    >
                                                        แก้ไข
                                                    </Button>
                                                    :
                                                    <Box sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            color="success"
                                                            endIcon={<SaveIcon />}
                                                            size="small"
                                                            sx={{ height: "25px", marginBottom: 0.5 }}
                                                            onClick={handleSave}
                                                        >
                                                            บันทึก
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            color="error"
                                                            endIcon={<CancelIcon />}
                                                            size="small"
                                                            sx={{ height: "25px" }}
                                                            onClick={handleCancel}
                                                        >
                                                            ยกเลิก
                                                        </Button>
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
                    count={dataTransport.length}
                    page={safePage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </Box>
            </Paper>
        </Container>
    );
};

export default TruckTransport;
