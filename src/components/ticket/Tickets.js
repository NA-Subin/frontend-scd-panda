import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Popover,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { apiPut } from "../../server/apiClient";
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import theme from "../../theme/theme";
import InsertTickets from "./InsertTickets";
import { IconButtonError, TablecellHeader, TablecellNoData, TablecellSelling } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import TablePaginationBar from "../../theme/TablePaginationBar";

// Small "click-to-explain" helper - a plain Tooltip only fires on hover, which
// is easy to miss and unusable on touch devices, so ambiguous column headers
// use a click-triggered Popover instead. Kept local to this file since only
// this page's headers need it.
const InfoHint = ({ text }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
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
                <Typography sx={{ p: 1.5, maxWidth: 260, fontSize: 13 }}>{text}</Typography>
            </Popover>
        </>
    );
};

const Tickets = ({ openNavbar }) => {
    const [update, setUpdate] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [updateCustomer, setUpdateCustomer] = React.useState(true);
    //const [ticket, setTicket] = React.useState([]);
    const [open, setOpen] = useState(1);
    const [setting, setSetting] = React.useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข

    const [openCustomer, setOpenCustomer] = React.useState("");

    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [ticketsName, setTicketsName] = React.useState("");
    const [rate1, setRate1] = React.useState("");
    const [rate2, setRate2] = React.useState("");
    const [rate3, setRate3] = React.useState("");
    const [creditTime, setCreditTime] = React.useState("");
    const [code, setCode] = React.useState("");
    const [codeID, setCodeID] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [companyChecked, setCompanyChecked] = React.useState(true);
    const [type1, setType1] = React.useState(true);
    const [type2, setType2] = React.useState(true);
    const [bill, setBill] = React.useState("");

    const { customertickets, refetch } = useBasicData();
    const tickets = Object.values(customertickets || {});
    const ticket = tickets.filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ");
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

    // State สำหรับเก็บค่าแก้ไข Rate
    const [rate1Edit, setRate1Edit] = useState("");
    const [rate2Edit, setRate2Edit] = useState("");
    const [rate3Edit, setRate3Edit] = useState("");
    const [rowIndex, setRowIndex] = useState(null);
    const [name, setName] = useState("");

    // ฟังก์ชันสำหรับกดแก้ไข
    const handleSetting = (index, rowId, status, rowRate1, rowRate2, rowRate3, newname) => {
        setRowIndex(index + 1);
        setSetting(true);
        setSelectedRowId(rowId);
        // ตั้งค่าของ checkbox ตามสถานะที่มีอยู่
        const hasTicket = status.includes("รถใหญ่");
        const hasRecipient = status.includes("รถเล็ก");
        setTicketChecked(hasTicket);
        setRecipientChecked(hasRecipient);
        // เซ็ตค่า RateEdit เป็นค่าปัจจุบันของ row ที่เลือก
        setRate1Edit(rowRate1);
        setRate2Edit(rowRate2);
        setRate3Edit(rowRate3);
        setName(newname)
    };

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

    const handleCustomer = (row) => {
        setOpenCustomer(row.uuid);
        setName(row.Name)
        setTicketsName(row.Name)
        setRate1(row.Rate1)
        setRate2(row.Rate2)
        setRate3(row.Rate3)
        setCreditTime(row.Bill)
        setCode(row.Code)
        setCodeID(row.CodeID)
        setCompanyName(row.CompanyName)
        setPhone(row.Phone)
        setCreditTime(row.CreditTime)
        setBill(row.Bill);

        if (row.Type === "รถใหญ่/รถเล็ก") {
            setType1(false);
            setType2(false);
        } else if (row.Type === "รถใหญ่") {
            setType1(false);
            setType2(true);
        } else if (row.Type === "รถเล็ก") {
            setType1(true);
            setType2(false);
        } else {
            setType1(true);
            setType2(true);
        }
        const addr = normalizeAddress(row.Address);

        setNo(addr.no);
        setVillage(addr.village);
        setSubDistrict(addr.subDistrict);
        setDistrict(addr.district);
        setProvince(addr.province);
        setZipCode(addr.zipCode);
        //setCompanyChecked
    }

    const handleSaveCustomer = async () => {
        const address = {
            no: no?.trim() || "",
            village: village?.trim() || "",
            subDistrict: subDistrict?.trim() || "",
            district: district?.trim() || "",
            province: province?.trim() || "",
            zipCode: zipCode?.trim() || ""
        };

        try {
            await apiPut(`/api/customers/${openCustomer}`, {
                Name: ticketsName,
                Rate1: rate1,
                Rate2: rate2,
                Rate3: rate3,
                Bill: bill,
                Code: code,
                CompanyName: companyName,
                CodeID: codeID,
                Address: address,
                Phone: phone,
                CreditTime: creditTime,
                Type: type1 === false && type2 === true ? "รถใหญ่" : type1 === true && type2 === false ? "รถเล็ก" : type1 === false && type2 === false ? "รถใหญ่/รถเล็ก" : "-",
            });
            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            refetch?.();
            setUpdateCustomer(true);
        } catch (error) {
            ShowError("แก้ไขข้อมูลไม่สำเร็จ");
            console.error("Error updating data:", error);
        }
    }

    // ฟังก์ชันสำหรับบันทึก
    const handleSave = async () => {
        const newType = [
            ticketChecked ? "รถใหญ่" : "",
            recipientChecked ? "รถเล็ก" : ""
        ].filter((s) => s).join("/");

        try {
            await apiPut(`/api/customers/${selectedRowId}`, {
                Type: newType,
                Rate1: rate1Edit,
                Rate2: rate2Edit,
                Rate3: rate3Edit,
                Name: name
            });
            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            refetch?.();
            setSetting(false);
            setSelectedRowId(null);
            setRowIndex(null);
        } catch (error) {
            ShowError("แก้ไขข้อมูลไม่สำเร็จ");
            console.error("Error updating data:", error);
        }
    };

    const handleCancel = () => {
        setSetting(false);
        setSelectedRowId(null);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const pageCount = Math.max(1, Math.ceil(ticket.length / rowsPerPage));
    const safePage = Math.min(page, pageCount - 1);

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วน้ำมันที่ ${rowIndex} ใช่หรือไม่`,
            async () => {
                try {
                    await apiPut(`/api/customers/${selectedRowId}`, {
                        SystemStatus: "ไม่อยู่ในระบบ",
                    });
                    ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                    refetch?.();
                    setSetting(false);
                    setSelectedRowId(null);
                    setRowIndex(null);
                } catch (error) {
                    ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                    console.error("Error updating data:", error);
                }
            },
            () => {
                console.log(`ยกเลิกลบตั๋วน้ำมันที่ ${rowIndex}`);
            }
        )
    }

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ตั๋วน้ำมัน
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: -1 }}>
                จัดการรายชื่อลูกค้าตั๋วน้ำมัน อัตราค่าขนส่งเฉพาะคลัง และประเภทรถที่ใช้บริการของแต่ละราย
            </Typography>
            <Box textAlign="right" marginRight={3} marginTop={1}>
                <InsertTickets />
            </Box>
            <Divider sx={{ marginBottom: 2, marginTop: 1 }} />
            <Box sx={{ width: "100%" }}>
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        backgroundColor: theme.palette.info.light + "22",
                        border: "1px solid " + theme.palette.info.light,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        mb: 2,
                    }}
                >
                    <TouchAppIcon color="info" fontSize="small" />
                    <Typography variant="body2" fontWeight="bold" color={theme.palette.info.dark}>
                        คลิกที่ชื่อตั๋วในตารางเพื่อดูและแก้ไขรายละเอียดทั้งหมดของลูกค้ารายนั้น
                    </Typography>
                </Stack>
                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ marginTop: 2, height: "70vh" }}
                >
                    <Table stickyHeader size="small" sx={{ width: "100%" }}>
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                    ลำดับ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                    ชื่อตั๋ว
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เรทคลังลำปาง
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เรทคลังพิจิตร
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                    เรทคลังสระบุรี/บางปะอิน/IR
                                    <InfoHint text="ราคาค่าขนส่งที่ตกลงกับลูกค้ารายนี้ แยกตามคลังต้นทางที่รับน้ำมัน" />
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                    ประเภทรถ
                                    <InfoHint text="กำหนดว่าลูกค้ารายนี้ใช้บริการรถใหญ่ รถเล็ก หรือทั้งสองประเภทในการขนส่ง" />
                                </TablecellSelling>
                                <TablecellSelling sx={{ position: "sticky", right: 0 }} colSpan={2} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                ticket.length === 0 ?
                                    <TableRow>
                                        <TablecellNoData colSpan={8}>
                                            <Inventory fontSize="large" />
                                            <br />
                                            ไม่มีข้อมูล
                                        </TablecellNoData>
                                    </TableRow>
                                    :
                                    ticket.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <TableRow key={row.uuid}>
                                            <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {index + safePage * rowsPerPage + 1}
                                                </Typography>
                                            </TableCell>
                                            {/* <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Name}</Typography> */}
                                            <TableCell
                                                sx={{
                                                    textAlign: "left",
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        backgroundColor: "#ffebee",
                                                    },
                                                }}
                                                onClick={() => handleCustomer(row)}
                                            >
                                                {
                                                    // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                    !setting || row.uuid !== selectedRowId ?
                                                        <Typography variant="subtitle2" sx={{ marginLeft: 3 }} gutterBottom>
                                                            {row.Name}
                                                        </Typography>
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
                                            <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                {
                                                    // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                    !setting || row.uuid !== selectedRowId ?
                                                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Rate1}</Typography>
                                                        :
                                                        <TextField
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
                                                                    paddingLeft: 2
                                                                },
                                                            }}
                                                            value={rate1Edit}
                                                            onChange={(e) => setRate1Edit(e.target.value)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                }
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                {
                                                    !setting || row.uuid !== selectedRowId ?
                                                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Rate2}</Typography>
                                                        :
                                                        <TextField
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
                                                                    paddingLeft: 2
                                                                },
                                                            }}
                                                            value={rate2Edit}
                                                            onChange={(e) => setRate2Edit(e.target.value)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                }
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                {
                                                    !setting || row.uuid !== selectedRowId ?
                                                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Rate3}</Typography>
                                                        :
                                                        <TextField
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
                                                                    paddingLeft: 2
                                                                },
                                                            }}
                                                            value={rate3Edit}
                                                            onChange={(e) => setRate3Edit(e.target.value)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                }
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    {
                                                        !setting || row.uuid !== selectedRowId ?
                                                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Type}</Typography>
                                                            :
                                                            <>
                                                                <FormControlLabel
                                                                    sx={{ ml: -2, mt: -2, mb: -2 }}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={ticketChecked}
                                                                            onChange={(e) => setTicketChecked(e.target.checked)}
                                                                            size="small"
                                                                        />
                                                                    }
                                                                    label="รถใหญ่"
                                                                />
                                                                <FormControlLabel
                                                                    sx={{ mr: -2, mt: -2, mb: -2 }}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={recipientChecked}
                                                                            onChange={(e) => setRecipientChecked(e.target.checked)}
                                                                            size="small"
                                                                        />
                                                                    }
                                                                    label="รถเล็ก"
                                                                />
                                                            </>
                                                    }
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ height: "30px", position: "sticky", right: !setting || row.uuid !== selectedRowId ? 20 : 100, backgroundColor: "white" }}>
                                                <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", marginTop: -0.5 }}>
                                                    {
                                                        !setting || row.uuid !== selectedRowId ?
                                                            <Button
                                                                variant="contained"
                                                                color="warning"
                                                                startIcon={<EditNoteIcon />}
                                                                size="small"
                                                                sx={{ height: "25px" }}
                                                                onClick={() => handleSetting(index, row.uuid, row.Type, row.Rate1, row.Rate2, row.Rate3, row.Name)}
                                                                fullWidth
                                                            >
                                                                แก้ไข
                                                            </Button>
                                                            :
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    endIcon={<CancelIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px", marginRight: 1 }}
                                                                    onClick={handleCancel}
                                                                >
                                                                    ยกเลิก
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    endIcon={<SaveIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px" }}
                                                                    onClick={handleSave}
                                                                >
                                                                    บันทึก
                                                                </Button>

                                                                {/* <IconButton color="error" onClick={handleCancel}>
                                                                    <CancelIcon />
                                                                </IconButton>
                                                                <IconButton color="success" onClick={handleSave} >
                                                                    <SaveIcon />
                                                                </IconButton> */}
                                                            </Box>
                                                    }
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ height: "30px", position: "sticky", right: 0, backgroundColor: "white" }}>
                                                {
                                                    !setting || row.uuid !== selectedRowId ?
                                                        ""
                                                        :
                                                        <Box sx={{ marginTop: -0.5 }}>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                endIcon={<DeleteIcon />}
                                                                size="small"
                                                                sx={{ height: "25px" }}
                                                                onClick={handleDelete}

                                                            >
                                                                ลบ
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
                <TablePaginationBar
                    count={ticket.length}
                    page={safePage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </Box>
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
                                {ticket.find((r) => r.uuid === openCustomer)?.Name || ""}
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
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 9 } }} gutterBottom>ชื่อ</Typography>
                                    <TextField size="small" fullWidth value={ticketsName} onChange={(e) => setTicketsName(e.target.value)} disabled={updateCustomer} />
                                </Grid>
                                <Grid item md={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>รอบการวางบิล</Typography>
                                    <InfoHint text="รอบที่ใช้ออกใบวางบิล/ใบแจ้งหนี้ให้ลูกค้ารายนี้ เช่น ทุกสิ้นเดือน หรือทุก 15 วัน" />
                                    <TextField size="small" fullWidth value={bill} onChange={(e) => setBill(e.target.value)} disabled={updateCustomer} />
                                </Grid>
                                {/* <Grid item md={6} display="flex" justifyContent="left" alignItems="center">
                                                        <Typography variant="subtitle1" fontWeight="bold" marginRight={1}>สถานะตั๋ว :</Typography>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={ticketChecked1 === false ? true : false}
                                                                    onChange={() => setTicketChecked1(!ticketChecked1)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label="ตั๋ว"
                                                        />
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={ticketChecked2 === false ? true : false}
                                                                    onChange={() => setTicketChecked2(!ticketChecked2)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label="ผู้รับ"
                                                        />
                                                    </Grid> */}
                                <Grid item md={12} xs={12} display="flex" justifyContent="left" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" marginRight={1}>ประเภทรถ :</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={type1 === false ? true : false}
                                                onChange={() => setType1(!type1)}
                                                size="small"
                                            />
                                        }
                                        label="รถใหญ่"
                                        disabled={updateCustomer}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={type2 === false ? true : false}
                                                onChange={() => setType2(!type2)}
                                                size="small"
                                            />
                                        }
                                        label="รถเล็ก"
                                        disabled={updateCustomer}
                                    />
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
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 5.5 } }} gutterBottom>เบอร์โทร</Typography>
                            <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={6} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, marginLeft: { md: 0, xs: 2.5 } }} gutterBottom>เลขผู้เสียภาษี</Typography>
                            <TextField size="small" fullWidth value={codeID} onChange={(e) => setCodeID(e.target.value)} disabled={updateCustomer} />
                        </Grid>
                        <Grid item md={6} xs={12} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ระยะเวลาเครดิต</Typography>
                            <InfoHint text="จำนวนวันที่ลูกค้าสามารถค้างชำระได้หลังจากวันวางบิล ใช้ตรวจสอบยอดหนี้ค้างชำระ" />
                            <TextField size="small" fullWidth value={creditTime} onChange={(e) => setCreditTime(e.target.value)} disabled={updateCustomer} />
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
        </Container>
    );
};

export default Tickets;
