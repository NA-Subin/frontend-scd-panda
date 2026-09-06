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
    InputAdornment,
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
import BorderColorIcon from '@mui/icons-material/BorderColor';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import theme from "../../theme/theme";
import { IconButtonError, TablecellHeader, TablecellNoData } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import InsertTicketsTransport from "./InsertTicketsTransport";
import InsertTicketsGasStations from "./InsertTicketsGasStations";
import TicketsGasStation from "./TicketsGasStation";
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

const TicketsTransport = ({ openNavbar }) => {
    //const [transport, setTransport] = useState([]);
    //const [gasStation, setGasStation] = React.useState([]);
    const [updateCustomer, setUpdateCustomer] = React.useState(true);
    const [setting, setSetting] = useState(false);
    const [ticketChecked, setTicketChecked] = useState(false);
    const [recipientChecked, setRecipientChecked] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null); // จับ ID ของแถวที่ต้องการแก้ไข
    const [typeCustomer, setTypeCuster] = React.useState(0);
    const [open, setOpen] = useState(1);

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
    const [type, setType] = React.useState("");
    const [bill, setBill] = React.useState("");

    const { customertransports, customergasstations, refetch } = useBasicData();
    const transports = Object.values(customertransports || {});
    const gasStations = Object.values(customergasstations || {});

    const transport = transports.filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ");
    const gasStation = gasStations.filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ");

    console.log("gasStation : ", gasStation);

    const [search, setSearch] = useState("");

    const filtered =
        open === 1
            ? transport.filter((item) => {
                const name = (item.Name?.split(":")[1] || item.Name || "").toLowerCase().trim();
                const searchText = search.toLowerCase().trim();
                return name.includes(searchText);
            })
            : gasStation.filter((item) => {
                const name = (item.Name?.split(":")[1] || item.Name || "").toLowerCase().trim();
                const searchText = search.toLowerCase().trim();
                return name.includes(searchText);
            });


    console.log("Show :: ", filtered);
    console.log("search : ", search);

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
    const [ticketCheckedC, setTicketCheckedC] = useState(true);
    const [rate1Edit, setRate1Edit] = useState("");
    const [rate2Edit, setRate2Edit] = useState("");
    const [rate3Edit, setRate3Edit] = useState("");
    const [creditTimeEdit, setCreditTimeEdit] = useState("");
    const [name, setName] = useState("");
    const [rowIndex, setRowIndex] = useState(null);

    // ฟังก์ชันสำหรับกดแก้ไข
    const handleSetting = (index, rowId, statusCompany, status, rowRate1, rowRate2, rowRate3, rowCreditTime, newname) => {
        setRowIndex(index + 1);
        setSetting(true);
        setSelectedRowId(rowId);

        if (statusCompany === "อยู่บริษัทในเครือ") {
            setTicketCheckedC(true);
        } else {
            setTicketCheckedC(false);
        }
        // ตั้งค่าของ checkbox ตามสถานะที่มีอยู่
        const hasTicket = status.includes("ตั๋ว");
        const hasRecipient = status.includes("ผู้รับ");
        setTicketChecked(hasTicket);
        setRecipientChecked(hasRecipient);
        // เซ็ตค่า RateEdit เป็นค่าปัจจุบันของ row ที่เลือก
        setRate1Edit(rowRate1);
        setRate2Edit(rowRate2);
        setRate3Edit(rowRate3);
        setName(newname);
        setCreditTimeEdit(rowCreditTime);
    };

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
                Name: name,
                Status: ticketChecked === false && recipientChecked === true ? "ตั๋ว" : ticketChecked === true && recipientChecked === false ? "ผู้รับ" : ticketChecked === false && recipientChecked === false ? "ตั๋ว/ผู้รับ" : "-",
                Rate1: rate1,
                Rate2: rate2,
                Rate3: rate3,
                Bill: bill,
                Code: code,
                CompanyName: companyName,
                CodeID: codeID,
                Address: address,
                Phone: phone,
                CreditTime: creditTime
            });
            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            refetch?.();
            setUpdateCustomer(true)
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error updating data:", error);
        }
    }

    // ฟังก์ชันสำหรับบันทึก
    const handleSave = async () => {
        const newStatus = [
            ticketChecked ? "ตั๋ว" : "",
            recipientChecked ? "ผู้รับ" : ""
        ].filter((s) => s).join("/");

        try {
            await apiPut(`/api/customers/${selectedRowId}`, {
                Status: newStatus,
                Rate1: rate1Edit,
                Rate2: rate2Edit,
                Rate3: rate3Edit,
                CreditTime: creditTimeEdit,
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
        setType(row.Type);
        setBill(row.Bill);
        if (row.StatusCompany === "อยู่บริษัทในเครือ") {
            setTicketCheckedC(true);
        } else {
            setTicketCheckedC(false);
        }

        if (row.Status === "ตั๋ว/ผู้รับ") {
            setTicketChecked(false);
            setRecipientChecked(false);
        } else if (row.Status === "ตั๋ว") {
            setTicketChecked(true);
            setRecipientChecked(false);
        } else if (row.Status === "ผู้รับ") {
            setTicketChecked(false);
            setRecipientChecked(true);
        } else {
            setTicketChecked(true);
            setRecipientChecked(true);
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

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const safePage = Math.min(page, pageCount - 1);

    const handleClickOpen1 = () => {
        setOpen(1);
        setPage(0)
        setRowsPerPage(10)
    };

    const handleClickOpen2 = () => {
        setOpen(2);
        setPage(0)
        setRowsPerPage(10)
    };

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วรับจ้างขนส่งที่ ${rowIndex} ใช่หรือไม่`,
            async () => {
                try {
                    await apiPut(`/api/customers/${selectedRowId}`, {
                        SystemStatus: "ไม่อยู่ในระบบ"
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
                console.log(`ยกเลิกลบตั๋วรับจ้างขนส่งที่ ${rowIndex}`);
            }
        );
    }

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                {open === 1 ? "ลูกค้ารับจ้างขนส่ง" : "ปั้มน้ำมัน"}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: -1 }}>
                จัดการรายชื่อลูกค้าที่รับจ้างขนส่ง และปั๊มน้ำมันคู่สัญญา อัตราค่าขนส่งเฉพาะคลัง และเงื่อนไขเครดิตของแต่ละราย
            </Typography>
            <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
            <Grid container spacing={2} marginTop={1}>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen1}>ลูกค้ารับจ้างขนส่ง</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={handleClickOpen2}>ปั้มน้ำมัน</Button>
                </Grid>
                <Grid item xs={6} sx={{ marginTop: -3 }}>
                    {
                        open === 1 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
                    }
                </Grid>
                <Grid item xs={6} sx={{ marginTop: -3 }}>
                    {
                        open === 2 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
                    }
                </Grid>
            </Grid>
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: { xs: 2, md: 4 }, borderTop: "5px solid" + theme.palette.panda.light, marginTop: -2.5, width: "100%" }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item md={3} xs={12}>
                        <Typography variant="h6" fontWeight="bold" sx={{ marginTop: 1, mb: 0 }} gutterBottom>{open === 1 ? "รายการลูกค้ารับจ้างขนส่ง" : "รายการปั้มน้ำมัน"}</Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <Paper variant="outlined">
                            {
                                open === 1 ?
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <Typography fontWeight="bold">ค้นหาชื่อลูกค้า :</Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    :
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <Typography fontWeight="bold">ค้นหาชื่อปั้ม :</Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                            }
                        </Paper>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        {
                            open === 1 ? <InsertTicketsTransport show={open} /> : <InsertTicketsGasStations show={open} />
                        }
                    </Grid>
                </Grid>
                <Divider sx={{ marginBottom: 2, marginTop: 2 }} />
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
                {
                    open === 1 ?
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ marginTop: 2, height: "70vh" }}
                        >
                            <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px 8px" }, width: "100%" }}>
                                <TableHead sx={{ height: "7vh" }}>
                                    <TableRow>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            ลำดับ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                            ชื่อตั๋ว
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100, whiteSpace: "nowrap" }}>
                                            ระยะเครดิต
                                            <InfoHint text="จำนวนวันที่ลูกค้าสามารถค้างชำระค่าขนส่งได้ หลังจากวันวางบิล" />
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังลำปาง
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังพิจิตร
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 150 : 100 }}>
                                            เรทคลังสระบุรี/บางปะอิน/IR
                                            <InfoHint text="ราคาค่าขนส่งที่ตกลงกับลูกค้ารายนี้ แยกตามคลังต้นทางที่รับน้ำมัน" />
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: !setting ? 100 : 150 }}>
                                            สถานะ
                                            <InfoHint text="บทบาทของลูกค้ารายนี้ในระบบตั๋ว ('ตั๋ว' และ/หรือ 'ผู้รับ') ใช้ในการออกและจับคู่เอกสารตั๋วขนส่ง" />
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ position: 'sticky', right: !setting ? 20 : 60, width: !setting ? 50 : 100, textAlign: "center" }}>

                                        </TablecellHeader>
                                        <TablecellHeader sx={{ position: 'sticky', right: 0, width: !setting ? 20 : 60, textAlign: "center" }}>

                                        </TablecellHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        filtered.length === 0 ?
                                            <TableRow>
                                                <TablecellNoData colSpan={9}>
                                                    <Inventory fontSize="large" />
                                                    <br />
                                                    ไม่มีข้อมูล
                                                </TablecellNoData>
                                            </TableRow>
                                            :
                                            filtered.sort((a, b) => a.Name.localeCompare(b.Name)).slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TableRow key={row.uuid} sx={{ backgroundColor: !setting || row.uuid !== selectedRowId ? "" : "#fff59d" }}>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                            {index + safePage * rowsPerPage + 1}
                                                        </Typography>
                                                    </TableCell>
                                                    {/* <TableCell sx={{ textAlign: "center", fontWeight: !setting || row.uuid !== selectedRowId ? "" : "bold" }}>{row.Name}</TableCell> */}
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
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.uuid !== selectedRowId ?
                                                                row.CreditTime
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
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
                                                                                textAlign: "center"
                                                                            },
                                                                        }}
                                                                        value={creditTimeEdit}
                                                                        onChange={(e) => setCreditTimeEdit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            // ถ้า row นี้กำลังอยู่ในโหมดแก้ไขให้แสดง TextField พร้อมค่าเดิม
                                                            !setting || row.uuid !== selectedRowId ?
                                                                row.Rate1
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        type="number"
                                                                        fullWidth
                                                                        inputProps={{
                                                                            step: 0.01
                                                                        }}
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
                                                                        value={rate1Edit}
                                                                        onChange={(e) => setRate1Edit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            !setting || row.uuid !== selectedRowId ?
                                                                row.Rate2
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        type="number"
                                                                        fullWidth
                                                                        inputProps={{
                                                                            step: 0.01
                                                                        }}
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
                                                                        value={rate2Edit}
                                                                        onChange={(e) => setRate2Edit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {
                                                            !setting || row.uuid !== selectedRowId ?
                                                                row.Rate3
                                                                :
                                                                <Paper sx={{ width: "100%" }}>
                                                                    <TextField
                                                                        type="number"
                                                                        fullWidth
                                                                        inputProps={{
                                                                            step: 0.01
                                                                        }}
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
                                                                        value={rate3Edit}
                                                                        onChange={(e) => setRate3Edit(e.target.value)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Paper>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            {
                                                                !setting || row.uuid !== selectedRowId ?
                                                                    <Typography variant="subtitle2" gutterBottom>{row.Status}</Typography>
                                                                    :
                                                                    <>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={ticketChecked}
                                                                                    onChange={(e) => setTicketChecked(e.target.checked)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    ตั๋ว
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={recipientChecked}
                                                                                    onChange={(e) => setRecipientChecked(e.target.checked)}
                                                                                    size="small"
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                                                                    ผู้รับ
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                    {/* <TableCell width={70} sx={{ position: "sticky", right: 0, backgroundColor: "white" }}>
                                                        <Box sx={{ marginTop: -0.5 }}>
                                                            {
                                                                !setting || row.uuid !== selectedRowId ?
                                                                    <Button
                                                                        variant="contained"
                                                                        color="warning"
                                                                        startIcon={<EditNoteIcon />}
                                                                        size="small"
                                                                        sx={{ height: "25px", marginTop: 1.5, marginBottom: 1 }}
                                                                        onClick={() => handleSetting(row.id, row.Status, row.Rate1, row.Rate2, row.Rate3, row.CreditTime, row.Name)}
                                                                        fullWidth
                                                                    >
                                                                        แก้ไข
                                                                    </Button>
                                                                    :
                                                                    <>
                                                                        <Button variant="contained" color="success" onClick={handleSave} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>บันทึก</Button>
                                                                        <Button variant="contained" color="error" onClick={handleCancel} sx={{ height: "25px", marginTop: 0.5 }} size="small" fullWidth>ยกเลิก</Button>
                                                                    </>
                                                            }
                                                        </Box>
                                                    </TableCell> */}
                                                    <TableCell sx={{ width: !setting || row.uuid !== selectedRowId ? 50 : 100, height: "30px", position: "sticky", right: !setting || row.uuid !== selectedRowId ? 0 : 60, backgroundColor: "white", textAlign: "center" }}>
                                                        {
                                                            !setting || row.uuid !== selectedRowId ?
                                                                <Button
                                                                    variant="contained"
                                                                    color="warning"
                                                                    startIcon={<EditNoteIcon />}
                                                                    size="small"
                                                                    sx={{ height: "25px" }}
                                                                    onClick={() => handleSetting(index, row.uuid, row.StatusCompany, row.Status, row.Rate1, row.Rate2, row.Rate3, row.CreditTime, row.Name)}
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

                                                                    {/* <IconButton color="error" onClick={handleCancel}>
                                                                    <CancelIcon />
                                                                </IconButton>
                                                                <IconButton color="success" onClick={handleSave} >
                                                                    <SaveIcon />
                                                                </IconButton> */}
                                                                </Box>
                                                        }
                                                    </TableCell>
                                                    {
                                                        !setting || row.uuid !== selectedRowId ?
                                                            ""
                                                            :
                                                            <TableCell sx={{ width: 50, height: "30px", position: "sticky", right: 0, backgroundColor: "white", textAlign: "center" }}>
                                                                <Box>
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
                                                            </TableCell>
                                                    }
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        :
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ marginTop: 2, height: "70vh" }}
                        >
                            <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px 8px" }, width: "100%" }}>
                                <TableHead sx={{ height: "7vh" }} >
                                    <TableRow>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            ลำดับ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                            ชื่อตั๋ว
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                            ระยะเครดิต
                                            <InfoHint text="จำนวนวันที่ลูกค้าสามารถค้างชำระค่าขนส่งได้ หลังจากวันวางบิล" />
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                            เรทคลังลำปาง
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                            เรทคลังพิจิตร
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            เรทคลังสระบุรี/บางปะอิน/IR
                                            <InfoHint text="ราคาค่าขนส่งที่ตกลงกับลูกค้ารายนี้ แยกตามคลังต้นทางที่รับน้ำมัน" />
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            สถานะ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ width: 80, position: "sticky", right: 0 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        filtered.length === 0 ?
                                            <TableRow>
                                                <TablecellNoData colSpan={8}>
                                                    <Inventory fontSize="large" />
                                                    <br />
                                                    ไม่มีข้อมูล
                                                </TablecellNoData>
                                            </TableRow>
                                            :
                                            filtered.sort((a, b) => a.ShortName.localeCompare(b.ShortName)).slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row, index) => (
                                                <TicketsGasStation key={row.id} row={row} index={index + safePage * rowsPerPage} openNavbar={openNavbar} />
                                            ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                }
                <TablePaginationBar
                    count={filtered.length}
                    page={safePage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </Paper>
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
                                {filtered.find((r) => r.uuid === openCustomer)?.Name || ""}
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
                                <Grid item md={12} xs={12} display="flex" justifyContent="left" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" marginRight={1} sx={{ marginLeft: { md: 0, xs: 4 } }}>สถานะตั๋ว :</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={ticketChecked === false ? true : false}
                                                onChange={() => setTicketChecked(!ticketChecked)}
                                                size="small"
                                            />
                                        }
                                        label="ตั๋ว"
                                        disabled={updateCustomer}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={recipientChecked === false ? true : false}
                                                onChange={() => setRecipientChecked(!recipientChecked)}
                                                size="small"
                                            />
                                        }
                                        label="ผู้รับ"
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

export default TicketsTransport;
