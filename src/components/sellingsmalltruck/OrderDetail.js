import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
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
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD, TablecellSelling } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import theme from "../../theme/theme";

const OrderDetail = (props) => {
    const { detail, ticketsTrip, onSendBack, total, onDelete, onAddProduct, onUpdateOrderID, editMode, tickets, depots, totalWeight } = props;
    const [rate, setRate] = React.useState(0.75);
    const [G91, setG91] = React.useState([]);
    const [G95, setG95] = React.useState([]);
    const [B7, setB7] = React.useState([]);
    const [B95, setB95] = React.useState([]);
    // const [B10, setB10] = React.useState([]);
    // const [B20, setB20] = React.useState([]);
    const [E20, setE20] = React.useState([]);
    // const [E85, setE85] = React.useState([]);
    const [PWD, setPWD] = React.useState([]);
    const [weightOil, setWeightOil] = React.useState(0);
    const [orderID, setOrderID] = React.useState("");

    const [isFocused, setIsFocused] = useState(false);

    const formatNumber = (value) => {
        const number = parseInt(value, 10);
        if (isNaN(number)) return "";
        return number.toLocaleString(); // => 3000 -> "3,000"
    };

    const getData = async () => {
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id) + "/Product/G91").on("value", (snapshot) => {
            const datas = snapshot.val();
            setG91(datas);
        });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id) + "/Product/G95").on("value", (snapshot) => {
            const datas = snapshot.val();
            setG95(datas);
        });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id) + "/Product/B7").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB7(datas);
        });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id) + "/Product/B95").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB95(datas);
        });
        // database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id) + "/Product/B10").on("value", (snapshot) => {
        //     const datas = snapshot.val();
        //     setB10(datas);
        // });
        // database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id) + "/Product/B20").on("value", (snapshot) => {
        //     const datas = snapshot.val();
        //     setB20(datas);
        // });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id) + "/Product/E20").on("value", (snapshot) => {
            const datas = snapshot.val();
            setE20(datas);
        });
        // database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id) + "/Product/E85").on("value", (snapshot) => {
        //     const datas = snapshot.val();
        //     setE85(datas);
        // });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id) + "/Product/PWD").on("value", (snapshot) => {
            const datas = snapshot.val();
            setPWD(datas);
        });
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center", height: "20px", padding: "1px 4px", width: 50, backgroundColor: theme.palette.success.dark, color: "white" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.id + 1}</Typography>
                </TableCell>
                {/* <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.main }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[0]+detail.TicketName.split(":")[1]}</Typography>
                </TableCell> */}
                <TableCell sx={{ textAlign: "left", height: "20px", padding: "1px 4px", width: 350 }}>
                    {
                        detail.TicketName === "ตั๋วเปล่า" ?
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={tickets}  // ใช้ ticket.map หรือ ticket โดยตรงเป็น options
                                getOptionLabel={(option) =>
                                    option.TicketsName.includes("/")
                                        ? option.TicketsName.split("/")[1]
                                        : option.TicketsName
                                }  // ใช้ OrderID หรือค่าที่ต้องการแสดง
                                isOptionEqualToValue={(option, value) => option.TicketsName === value.TicketsName}  // ตรวจสอบค่าที่เลือก
                                value={detail.TicketsName ? tickets.find(item => item.TicketsName === detail.TicketsName) : null} // ค่าที่เลือก
                                onChange={(e, newValue) => {
                                    if (newValue) {
                                        onUpdateOrderID("TicketName", newValue.TicketsName); // อัปเดตค่า OrderID
                                    } else {
                                        onUpdateOrderID("TicketName", ""); // รีเซ็ตค่าเมื่อไม่ได้เลือก
                                    }
                                }}
                                sx={{ marginLeft: 1.5}}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '12px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '22px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                paddingLeft: 2,
                                            },
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Typography fontSize="14px">
                                            {option.TicketsName}
                                        </Typography>
                                    </li>
                                )}
                            />
                            :
                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0, marginLeft: 1.5 }} gutterBottom>
                                {
                                    detail.TicketName.split(":")[1]
                                }
                            </Typography>
                    }
                </TableCell>
                <TableCellG95 sx={{ textAlign: "center", backgroundColor: "#FFC000", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type={isFocused ? "number" : "text"}
                                    InputLabelProps={{ sx: { fontSize: "12px" } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.G95?.Volume || "") : formatNumber(detail.Product?.G95?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("G95", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("G95", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G95?.Volume || "-"}</Typography>
                    }
                </TableCellG95>
                <TableCellB95 sx={{ textAlign: "center", backgroundColor: "#92D050", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type={isFocused ? "number" : "text"}
                                    InputLabelProps={{ sx: { fontSize: "12px" } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.B95?.Volume || "") : formatNumber(detail.Product?.B95?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("B95", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("B95", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{new Intl.NumberFormat("en-US").format(detail.Product?.B95?.Volume) || "-"}</Typography>
                    }
                </TableCellB95>
                <TableCellB7 sx={{ textAlign: "center", backgroundColor: "#FFFF99", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type={isFocused ? "number" : "text"}
                                    InputLabelProps={{ sx: { fontSize: "12px" } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.B7?.Volume || "") : formatNumber(detail.Product?.B7?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("B7", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("B7", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{new Intl.NumberFormat("en-US").format(detail.Product?.B7?.Volume) || "-"}</Typography>
                    }
                </TableCellB7>
                <TableCellG91 sx={{ textAlign: "center", backgroundColor: "#B7DEE8", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type={isFocused ? "number" : "text"}
                                    InputLabelProps={{ sx: { fontSize: "12px" } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.G91?.Volume || "") : formatNumber(detail.Product?.G91?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("G91", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("G91", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{new Intl.NumberFormat("en-US").format(detail.Product?.G91?.Volume) || "-"}</Typography>
                    }
                </TableCellG91>
                <TableCellE20 sx={{ textAlign: "center", backgroundColor: "#C4BD97", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type={isFocused ? "number" : "text"}
                                    InputLabelProps={{ sx: { fontSize: "12px" } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.E20?.Volume || "") : formatNumber(detail.Product?.E20?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("E20", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("E20", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{new Intl.NumberFormat("en-US").format(detail.Product?.E20?.Volume) || "-"}</Typography>
                    }
                </TableCellE20>
                <TableCellPWD sx={{ textAlign: "center", backgroundColor: "#F141D8", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type={isFocused ? "number" : "text"}
                                    InputLabelProps={{ sx: { fontSize: "12px" } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px', // ปรับความสูงของ TextField
                                            display: 'flex', // ใช้ flexbox
                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                            fontWeight: 'bold',
                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.PWD?.Volume || "") : formatNumber(detail.Product?.PWD?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("PWD", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("PWD", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{new Intl.NumberFormat("en-US").format(detail.Product?.PWD?.Volume) || "-"}</Typography>
                    }
                </TableCellPWD>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 80 }} >
                    {editMode ?
                        <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }} onClick={onDelete}>ยกเลิก</Button>
                        :
                        ""
                    }
                    {/* <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button> */}
                </TableCell>
            </TableRow>
        </React.Fragment>

    );
};

export default OrderDetail;
