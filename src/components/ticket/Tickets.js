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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { database } from "../../server/firebase";
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import theme from "../../theme/theme";
import InsertTickets from "./InsertTickets";
import { IconButtonError, TablecellHeader, TablecellSelling } from "../../theme/style";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";

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

    const { customertickets } = useBasicData();
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

    // const getTicket = async () => {
    //     database.ref("/customers/tickets").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         const dataList = [];
    //         for (let id in datas) {
    //             dataList.push({ id, ...datas[id] })
    //         }
    //         setTicket(dataList);
    //     });
    // };

    // useEffect(() => {
    //     getTicket();
    // }, []);

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
        setOpenCustomer(row.id);
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

    const handleSaveCustomer = () => {
        const address = {
            no: no?.trim() || "",
            village: village?.trim() || "",
            subDistrict: subDistrict?.trim() || "",
            district: district?.trim() || "",
            province: province?.trim() || "",
            zipCode: zipCode?.trim() || ""
        };

        database
            .ref("/customers/tickets/")
            .child(Number(openCustomer) - 1)
            .update({
                Name: ticketsName,
                //Status: ticketChecked1 === false && ticketChecked2 === true ? "ตั๋ว" : ticketChecked1 === true && ticketChecked2 === false ? "ผู้รับ" : ticketChecked1 === false && ticketChecked2 === false ? "ตั๋ว/ผู้รับ" : "-",
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
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setUpdateCustomer(true);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    // ฟังก์ชันสำหรับบันทึก
    const handleSave = async () => {
        const newType = [
            ticketChecked ? "รถใหญ่" : "",
            recipientChecked ? "รถเล็ก" : ""
        ].filter((s) => s).join("/");

        // // Update ทั้ง Status และค่า Rate ไปยัง Firebase
        // await database.ref(`/customers/tickets/${selectedRowId - 1}`).update({
        //     Type: newType,
        //     Rate1: rate1Edit,
        //     Rate2: rate2Edit,
        //     Rate3: rate3Edit,
        //     Name: name
        // });
        // Reset state หลังบันทึก
        // setSetting(false);
        // setSelectedRowId(null);
        database
            .ref("/customers/tickets/")
            .child(selectedRowId - 1)
            .update({
                Type: newType,
                Rate1: rate1Edit,
                Rate2: rate2Edit,
                Rate3: rate3Edit,
                Name: name
            }) // อัพเดท values ทั้งหมด
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data updated successfully");
                setSetting(false);
                setSelectedRowId(null);
                setRowIndex(null);
            })
            .catch((error) => {
                ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                console.error("Error updating data:", error);
            });
    };

    const handleCancel = () => {
        setSetting(false);
        setSelectedRowId(null);
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

    const handleDelete = () => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วน้ำมันที่ ${selectedRowId} ใช่หรือไม่`,
            () => {
                database
                    .ref("/customers/tickets/")
                    .child(selectedRowId - 1)
                    .update({
                        SystemStatus: "ไม่อยู่ในระบบ",
                    }) // อัพเดท values ทั้งหมด
                    .then(() => {
                        ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                        console.log("Data updated successfully");
                        setSetting(false);
                        setSelectedRowId(null);
                        setRowIndex(null);
                    })
                    .catch((error) => {
                        ShowError("แก้ไขข้อมูลไม่สำเร็จ");
                        console.error("Error updating data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกลบตั๋วน้ำมันที่ ${selectedRowId}`);
            }
        )
    }

    console.log("ticket", ticket);
    console.log("name", name);
    console.log("selectedRowId ", selectedRowId - 1);

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
            <Box textAlign="right" marginRight={3} marginTop={-10}>
                <InsertTickets />
            </Box>
            <Divider sx={{ marginBottom: 1, marginTop: 5 }} />
            <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" color="error" fontWeight="bold" sx={{ marginBottom: -2 }} gutterBottom>*ถ้าต้องการดูรายละเอียดทั้งหมดให้คลิ๊กชื่อตั๋ว*</Typography>
                <TableContainer
                    component={Paper}
                    sx={{ marginTop: 2 }}
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
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                    ประเภทรถ
                                </TablecellSelling>
                                <TablecellSelling sx={{ position: "sticky", right: 0 }} colSpan={2} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                ticket === null || ticket === undefined ?
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ textAlign: "center", lineHeight: 1, margin: 0 }}>ไม่มีข้อมูล</TableCell>
                                    </TableRow>
                                    :
                                    ticket.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <TableRow key={row.id}>
                                            <TableCell sx={{ textAlign: "center", height: "30px" }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {index + page * rowsPerPage + 1}
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
                                                    !setting || row.id !== selectedRowId ?
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
                                                    !setting || row.id !== selectedRowId ?
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
                                                    !setting || row.id !== selectedRowId ?
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
                                                    !setting || row.id !== selectedRowId ?
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
                                                        !setting || row.id !== selectedRowId ?
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
                                            <TableCell sx={{ height: "30px", position: "sticky", right: !setting || row.id !== selectedRowId ? 20 : 100, backgroundColor: "white" }}>
                                                <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", marginTop: -0.5 }}>
                                                    {
                                                        !setting || row.id !== selectedRowId ?
                                                            <Button
                                                                variant="contained"
                                                                color="warning"
                                                                startIcon={<EditNoteIcon />}
                                                                size="small"
                                                                sx={{ height: "25px" }}
                                                                onClick={() => handleSetting(index, row.id, row.Type, row.Rate1, row.Rate2, row.Rate3, row.Name)}
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
                                                    !setting || row.id !== selectedRowId ?
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
                {
                    ticket.length <= 10 ? null :
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 30]}
                            component="div"
                            count={ticket.length}
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
                                {ticket.find((r) => r.id === openCustomer)?.Name || ""}
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
