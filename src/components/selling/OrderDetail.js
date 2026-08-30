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
import { IconButtonError, RateOils, TableCellB20, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD, TablecellSelling } from "../../theme/style";
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
    const [B20, setB20] = React.useState([]);
    const [weightOil, setWeightOil] = React.useState(0);
    const [orderID, setOrderID] = React.useState("");

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
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id) + "/Product/B20").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB20(datas);
        });
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center", height: "20px", padding: "1px 4px", width: 50, backgroundColor: totalWeight > 50300 ? theme.palette.error.main : theme.palette.success.dark, color: "white" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.id + 1}</Typography>
                </TableCell>
                {/* <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.main }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[0]+detail.TicketName.split(":")[1]}</Typography>
                </TableCell> */}
                <TableCell sx={{ textAlign: "center", height: "20px", padding: "1px 4px", width: 350 }}>
                    {
                        !detail.TicketName ?
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={tickets}  // ใช้ ticket.map หรือ ticket โดยตรงเป็น options
                                getOptionLabel={(option) => option.Name
                                    // option.Name.includes("/")
                                    //     ? option.Name.split("/")[1]
                                    //     : option.Name
                                }  // ใช้ OrderID หรือค่าที่ต้องการแสดง
                                isOptionEqualToValue={(option, value) => option.Name === value.Name}  // ตรวจสอบค่าที่เลือก
                                value={detail.Name ? tickets.find(item => item.Name === detail.Name) : null} // ค่าที่เลือก
                                onChange={(e, newValue) => {
                                    if (newValue) {
                                        onUpdateOrderID("TicketName", newValue.Name); // อัปเดตค่า OrderID
                                    } else {
                                        onUpdateOrderID("TicketName", ""); // รีเซ็ตค่าเมื่อไม่ได้เลือก
                                    }
                                }}
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
                                            {option.Name}
                                        </Typography>
                                    </li>
                                )}
                            />
                            :
                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                {
                                    // (() => {
                                    //     const branches = [
                                    //         "( สาขาที่  00001)/",
                                    //         "( สาขาที่  00002)/",
                                    //         "( สาขาที่  00003)/",
                                    //         "(สำนักงานใหญ่)/"
                                    //     ];

                                    //     for (const branch of branches) {
                                    //         if (detail.TicketName.includes(branch)) {
                                    //             return detail.TicketName.split(branch)[1];
                                    //         }
                                    //     }

                                    //     return detail.TicketName.split(":")[1];
                                    // })()
                                    detail.TicketNameName
                                }
                            </Typography>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 150 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth
                                    //type="number"
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
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.OrderID ?? ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onUpdateOrderID("OrderID", newValue);
                                        //onUpdateOrderID("OrderID", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                    }}
                                // onFocus={(e) => {
                                //     if (e.target.value === "0") onUpdateOrderID("OrderID", "");
                                // }}
                                // onBlur={(e) => {
                                //     if (e.target.value === "") onUpdateOrderID("OrderID", 0);
                                // }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.OrderID || "-"}</Typography>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 100 }}>
                    {
                        editMode ?
                            (
                                depots.split(":")[1] === "ลำปาง" ?
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
                                            type="number"
                                            inputProps={{
                                                step: 0.01,   // ✅ เพิ่มลดทีละ 0.01
                                                min: 0        // (ถ้าไม่อยากให้ติดลบ ใส่เพิ่มได้)
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px',
                                                },
                                            }}
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
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    paddingLeft: 2
                                                },
                                            }}
                                            value={detail.Rate1 ?? 0.75}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onUpdateOrderID("Rate1", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onUpdateOrderID("Rate1", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onUpdateOrderID("Rate1", 0.75);
                                            }}
                                        />
                                    </Paper>
                                    : depots.split(":")[1] === "พิจิตร" ?
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: 0.01,   // ✅ เพิ่มลดทีละ 0.01
                                                    min: 0        // (ถ้าไม่อยากให้ติดลบ ใส่เพิ่มได้)
                                                }}
                                                InputLabelProps={{
                                                    sx: {
                                                        fontSize: '12px',
                                                    },
                                                }}
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
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                        paddingLeft: 2
                                                    },
                                                }}
                                                value={detail.Rate2 ?? 0.75}
                                                onChange={(e) => {
                                                    let newValue = e.target.value;
                                                    onUpdateOrderID("Rate2", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") onUpdateOrderID("Rate2", "");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") onUpdateOrderID("Rate2", 0.75);
                                                }}
                                            />
                                        </Paper>
                                        :
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: 0.01,   // ✅ เพิ่มลดทีละ 0.01
                                                    min: 0        // (ถ้าไม่อยากให้ติดลบ ใส่เพิ่มได้)
                                                }}
                                                InputLabelProps={{
                                                    sx: {
                                                        fontSize: '12px',
                                                    },
                                                }}
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
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                        paddingLeft: 2
                                                    },
                                                }}
                                                value={detail.Rate3 ?? 0.75}
                                                onChange={(e) => {
                                                    let newValue = e.target.value;
                                                    onUpdateOrderID("Rate3", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") onUpdateOrderID("Rate3", "");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") onUpdateOrderID("Rate3", 0.75);
                                                }}
                                            />
                                        </Paper>
                            )
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Rate || 0.75}</Typography>
                    }
                </TableCell>
                {/* ช่องกรอกราคา Cost G95*/}
                {/* <TableCellG95 sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '1px 4px',
                                            }
                                        }}
                                        value={detail.Product?.G95?.Cost || ""}
                                        onChange={(e) => {
                                            let newValue = e.target.value;
                                            onAddProduct("G95", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") onAddProduct("G95", "Cost", "");
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") onAddProduct("G95", "Cost", 0);
                                        }}
                                    />
                                </Paper>
                            </TableCellG95> */}

                {/* ช่องกรอกปริมาณ Volume G95 */}
                <TableCellG95 sx={{ textAlign: "center", backgroundColor: "#FFC000", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.G95?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("G95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("G95", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("G95", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G95?.Volume || "-"}</Typography>
                    }
                </TableCellG95>
                {/* ช่องกรอกราคา Cost G91 */}
                {/* <TableCellG91 sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '1px 4px',
                                            }
                                        }}
                                        value={detail.Product?.G91?.Cost || ""}
                                        onChange={(e) => {
                                            let newValue = e.target.value;
                                            onAddProduct("G91", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") onAddProduct("G91", "Cost", "");
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") onAddProduct("G91", "Cost", 0);
                                        }}
                                    />
                                </Paper>
                            </TableCellG91> */}

                {/* ช่องกรอกปริมาณ Volume G91 */}
                <TableCellB95 sx={{ textAlign: "center", backgroundColor: "#92D050", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B95?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B95", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B95", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B95?.Volume || "-"}</Typography>
                    }
                </TableCellB95>
                {/* ช่องกรอกราคา Cost B7 */}
                {/* <TableCellB7 sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '1px 4px',
                                            }
                                        }}
                                        value={detail.Product?.B7?.Cost || ""}
                                        onChange={(e) => {
                                            let newValue = e.target.value;
                                            onAddProduct("B7", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") onAddProduct("B7", "Cost", "");
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") onAddProduct("B7", "Cost", 0);
                                        }}
                                    />
                                </Paper>
                            </TableCellB7> */}

                {/* ช่องกรอกปริมาณ Volume  B7 */}
                <TableCellB7 sx={{ textAlign: "center", backgroundColor: "#FFFF99", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B7?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B7", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B7", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B7", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B7?.Volume || "-"}</Typography>
                    }
                </TableCellB7>
                {/* ช่องกรอกราคา Cost B95 */}
                {/* <TableCellB95 sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '1px 4px',
                                            }
                                        }}
                                        value={detail.Product?.B95?.Cost || ""}
                                        onChange={(e) => {
                                            let newValue = e.target.value;
                                            onAddProduct("B95", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") onAddProduct("B95", "Cost", "");
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") onAddProduct("B95", "Cost", 0);
                                        }}
                                    />
                                </Paper>
                            </TableCellB95> */}

                {/* ช่องกรอกปริมาณ Volume  B95 */}
                <TableCellG91 sx={{ textAlign: "center", backgroundColor: "#B7DEE8", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.G91?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("G91", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("G91", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("G91", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G91?.Volume || "-"}</Typography>
                    }
                </TableCellG91>
                {/* ช่องกรอกราคา Cost E20 */}
                {/* <TableCellE20 sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '1px 4px',
                                            }
                                        }}
                                        value={detail.Product?.E20?.Cost || ""}
                                        onChange={(e) => {
                                            let newValue = e.target.value;
                                            onAddProduct("E20", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") onAddProduct("E20", "Cost", "");
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") onAddProduct("E20", "Cost", 0);
                                        }}
                                    />
                                </Paper>
                            </TableCellE20> */}

                {/* ช่องกรอกปริมาณ Volume  E20 */}
                <TableCellE20 sx={{ textAlign: "center", backgroundColor: "#C4BD97", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.E20?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("E20", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("E20", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("E20", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.E20?.Volume || "-"}</Typography>
                    }
                </TableCellE20>
                {/* ช่องกรอกราคา Cost PWD */}
                {/* <TableCellPWD sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        InputLabelProps={{ sx: { fontSize: "12px" } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '1px 4px',
                                            }
                                        }}
                                        value={detail.Product?.PWD?.Cost || ""}
                                        onChange={(e) => {
                                            let newValue = e.target.value;
                                            onAddProduct("PWD", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") onAddProduct("PWD", "Cost", "");
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") onAddProduct("PWD", "Cost", 0);
                                        }}
                                    />
                                </Paper>
                            </TableCellPWD> */}

                {/* ช่องกรอกปริมาณ Volume  PWD */}
                <TableCellPWD sx={{ textAlign: "center", backgroundColor: "#F141D8", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.PWD?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("PWD", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("PWD", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("PWD", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.PWD?.Volume || "-"}</Typography>
                    }
                </TableCellPWD>
                <TableCellB20 sx={{ textAlign: "center", backgroundColor: "#F141D8", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
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
                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B20?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B20", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B20", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B20", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B20?.Volume || "-"}</Typography>
                    }
                </TableCellB20> 
                {/* <TableCell sx={{ textAlign: "center",borderLeft: "3px solid white",backgroundColor: "#92D050" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostG91 === "" ? "" : CostG91}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostG91(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostG91(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostG91(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostG91(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostG91(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostG91) || 0;
                                    //     setCostG91(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#92D050" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeG91 === "" ? "" : VolumeG91}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeG91(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeG91(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeG91(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeG91(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeG91(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeG91) || 0;
                                    //     setVolumeG91(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell> */}
                {/* <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostB7 === "" ? "" : CostB7}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostB7(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostB7(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostB7(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostB7(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostB7(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostB7) || 0;
                                    //     setCostB7(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", backgroundColor: "#FFFF99" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeB7 === "" ? "" : VolumeB7}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeB7(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeB7(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeB7(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeB7(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeB7(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeB7) || 0;
                                    //     setVolumeB7(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostB95 === "" ? "" : CostB95}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostB95(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostB95(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostB95(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostB95(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostB95(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostB95) || 0;
                                    //     setCostB95(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", backgroundColor: "#B7DEE8" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeB95 === "" ? "" : VolumeB95}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeB95(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeB95(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeB95(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeB95(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeB95(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeB95) || 0;
                                    //     setVolumeB95(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostE20 === "" ? "" : CostE20}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostE20(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostE20(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostE20(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostE20(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostE20(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostE20) || 0;
                                    //     setCostE20(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", backgroundColor: "#C4BD97" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeE20 === "" ? "" : VolumeE20}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeE20(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeE20(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeE20(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeE20(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeE20(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeE20) || 0;
                                    //     setVolumeE20(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostPWD === "" ? "" : CostPWD}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostPWD(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostPWD(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostPWD(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostPWD(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostPWD(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostPWD) || 0;
                                    //     setCostPWD(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", backgroundColor: "#F141D8" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
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
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumePWD === "" ? "" : VolumePWD}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumePWD(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumePWD(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumePWD(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumePWD(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumePWD(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumePWD) || 0;
                                    //     setVolumePWD(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell> */}
                <TableCell sx={{ textAlign: "center", height: "20px", width: 80 }} >
                    {editMode ?
                        <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }} onClick={onDelete}>ยกเลิก</Button>
                        :
                        ""
                    }
                    {/* <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button> */}
                </TableCell>
                {/* </>
                        // :
                        // <>
                        //     <TableCell sx={{ textAlign: "center" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderID}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{rate}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#FFC000" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Cost}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#FFC000" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Volume}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#92D050" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Cost}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#92D050" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Volume}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#FFFF99" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Cost}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#FFFF99" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Volume}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#B7DEE8" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Cost}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#B7DEE8" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Volume}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#C4BD97" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Cost}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#C4BD97" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Volume}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#F141D8" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Cost}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", backgroundColor: "#F141D8" }}>
                        //         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Volume}</Typography>
                        //     </TableCell>
                        //     <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }} >
                        //         <Button variant="contained" color="warning" size="small" sx={{ width: 30 }}>แก้ไข</Button>
                        //     </TableCell>
                        // </>
                } */}
            </TableRow>
        </React.Fragment>

    );
};

export default OrderDetail;
