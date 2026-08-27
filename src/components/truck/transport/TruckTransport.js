import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Badge,
    Box,
    Button,
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
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { TablecellHeader, TablecellSelling } from "../../../theme/style";
import InsertTruckTransport from "./InsertTruckTransport";
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";

const TruckTransport = ({ openNavbar }) => {
    const [open, setOpen] = useState(1);
    const [openTab, setOpenTab] = React.useState(true);
    const [openMenu, setOpenMenu] = React.useState(1);
    const [loading, setLoading] = useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    // const { reghead,regtail,small } = useData();

    const { transport, company } = useBasicData();
    const dataTransport = Object.values(transport || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
    const dataCompany = Object.values(company || {});

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


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [update, setUpdate] = React.useState(false);
    const [rowIndex, setRowIndex] = React.useState(null);
    const [rowID, setRowID] = React.useState(null);
    const [name, setName] = React.useState("");
    const [registration, setRegistration] = React.useState("");
    const [weight, setWeight] = React.useState("");
    const [companies, setCompanies] = React.useState("");


    // ฟังก์ชันสำหรับกดแก้ไข
    const handleUpdate = (index, rowId, newName, newRegistration, newWeight, newCompany) => {
        setUpdate(true);
        setRowIndex(index + 1);
        setRowID(rowId);
        setName(newName);
        setRegistration(newRegistration);
        setWeight(newWeight);
        setCompanies(newCompany);
    };

    // บันทึกข้อมูลที่แก้ไขแล้ว
    const handleSave = async () => {
        database
            .ref("/truck/transport/")
            .child(rowID - 1)
            .update({
                Name: name,
                Company: companies,
                Registration: registration,
                Weight: weight,
            }) // อัพเดท values ทั้งหมด
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data updated successfully");
                setUpdate(false);
                setRowID(null);
                setRowIndex(null);
            })
            .catch((error) => {
                ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
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
            <Divider sx={{ marginBottom: 1 }} />
            {
                windowWidth >= 800 ?
                    <Grid container spacing={2} p={1} marginBottom={-2}>
                        <Grid item sm={8} lg={10}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>รายการรถรับจ้างขนส่ง</Typography>
                        </Grid>
                        <Grid item sm={4} lg={2} sx={{ textAlign: "right" }}>
                            <InsertTruckTransport />
                        </Grid>
                    </Grid>
                    :
                    <Grid container spacing={2} p={1} marginBottom={-2}>
                        <Grid item xs={12} sx={{ textAlign: "center" }}>
                            <InsertTruckTransport />
                        </Grid>
                    </Grid>
            }
            <Box sx={{ width: "100%" }}>
                <TableContainer
                    component={Paper}
                    sx={{ marginTop: 2 }}
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
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                    บริษัท
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                    สถานะ
                                </TablecellSelling>
                                <TablecellSelling colSpan={2} width={50} sx={{ position: "sticky", right: 0 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                dataTransport.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow>
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
                                                                    height: '30px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px', // ปรับ padding ภายใน input
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
                                                                    height: '30px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px', // ปรับ padding ภายใน input
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
                                                                    height: '30px', // ปรับความสูงของ TextField
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px', // ปรับ padding ภายใน input
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
                                                !update || row.id !== rowID ? row.Company.split(":")[1]
                                                    :
                                                    <Paper
                                                        component="form">
                                                        <Select
                                                            id="demo-simple-select"
                                                            value={companies}
                                                            size="small"
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
                                                            onChange={(e) => setCompanies(e.target.value)}
                                                            fullWidth
                                                        >
                                                            <MenuItem value={companies}>
                                                                {companies.split(":")[1]}
                                                            </MenuItem>
                                                            {
                                                                dataCompany.map((row) => (
                                                                    row.id != 1 && Number(companies.split(":")[0]) !== row.id &&
                                                                    <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </Paper>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Status}</TableCell>
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
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                {
                    dataTransport.length <= 10 ? null :
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 30]}
                            component="div"
                            count={dataTransport.length}
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
            </Box>
        </Container>
    );
};

export default TruckTransport;
