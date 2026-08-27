import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Chip,
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
import "dayjs/locale/th";
import { IconButtonError, IconButtonSuccess, IconButtonWarning, RateOils, TablecellHeader } from "../../../theme/style";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import theme from "../../../theme/theme";

const StockDetail = (props) => {
    const { stock } = props;

    const [update, setUpdate] = React.useState(true);
    const [edit, setEdit] = React.useState(true);
    const [show, setShow] = React.useState(false);
    const [name, setName] = React.useState("");
    const [volume, setVolume] = React.useState(0);
    const [editStates, setEditStates] = React.useState({});
    const [volumes, addVolumes] = React.useState(0);
    const [productnanme, addProductname] = React.useState("");

    // console.log("editStates before useEffect: ", editStates);

    React.useEffect(() => {
        if (stock) {
            setName(stock.Name || "");
            setVolume(stock.Volume || 0);
            setEditStates(stock.Products || {});
        }
    }, [stock]); // ทุกครั้งที่ props stock เปลี่ยน จะอัปเดต state

    // ✅ toggle เปิด/ปิดโหมดแก้ไขตาม id
    const handleEditToggle = (product, isEditing) => {
        setEditStates((prev) => ({
            ...prev,
            [product.id]: { ...prev[product.id] }, // เก็บ object เดิม
            isEditingId: isEditing ? product.id : null, // id ที่กำลังแก้
        }));
    };

    const handleEditChange = (id, field, value) => {
        setEditStates((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    // console.log("editStates : ", editStates);

    const formatNumber = (value) =>
        value === 0 || value === '0'
            ? '0'
            : new Intl.NumberFormat("en-US").format(value);

    // console.log("stock : ", stock);

    const handleUpdate = () => {
        // 1️⃣ กรองเอาเฉพาะ product จริง ๆ ไม่เอา isEditingId
        const productsToSave = Object.fromEntries(
            Object.entries(editStates).filter(([key, value]) => key !== "isEditingId")
        );

        // 2️⃣ คำนวณผลรวม Capacity
        const totalVolume = Object.values(productsToSave)
            .filter(item => item && item.Capacity)
            .reduce((sum, item) => sum + Number(item.Capacity), 0);

        // 3️⃣ push ลง Firebase
        database
            .ref("/depot/stock")
            .child(stock.id - 1)
            .update({
                Volume: totalVolume,
                Products: productsToSave,
            })
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handlesave = () => {
        database
            .ref(`/depot/stock/${Number(stock.id) - 1}/Products`)
            .child(editStates.length)
            .update({
                id: editStates.length,
                ProductName: productnanme,
                Capacity: Number(volumes),
                Color: productnanme === "G91" ? "#92D050" :
                    productnanme === "G95" ? "#FFC000" :
                        productnanme === "B7" ? "#FFFF99" :
                            productnanme === "B95" ? "#B7DEE8" :
                                productnanme === "B10" ? "#32CD32" :
                                    productnanme === "B20" ? "#228B22" :
                                        productnanme === "E20" ? "#C4BD97" :
                                            productnanme === "E85" ? "#0000FF" :
                                                productnanme === "PWD" ? "#F141D8" :
                                                    "#FFD700",
            })
            .then(() => {

                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setShow(false);
                // รีเซ็ตฟิลด์หลังบันทึก
                addProductname("");
                addVolumes(0);

            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    return (
        <React.Fragment>
            <Paper sx={{
                backgroundColor: stock.Name === "แม่โจ้" ? "#f8fdf2ff"
                    : stock.Name === "สันกลาง" ? "#f7f4f9ff"
                        : stock.Name === "สันทราย" ? "#f0f3f5ff"
                            : stock.Name === "บ้านโฮ่ง" ? "#f7f4f1ff"
                                : stock.Name === "ป่าแดด" ? "#f7f7f9ff"
                                    : "", border: `2px solid ${stock.Name === "แม่โจ้" ? "#92D050"
                                        : stock.Name === "สันกลาง" ? "#B1A0C7"
                                            : stock.Name === "สันทราย" ? "#B7DEE8"
                                                : stock.Name === "บ้านโฮ่ง" ? "#FABF8F"
                                                    : stock.Name === "ป่าแดด" ? "#B1A0C7"
                                                        : "lightgray"}`, borderRadius: 3, marginTop: 4,
                boxShadow: `2px 2px 5px ${stock.Name === "แม่โจ้" ? "#92d050be"
                    : stock.Name === "สันกลาง" ? "#b1a0c7bf"
                        : stock.Name === "สันทราย" ? "#b7dee8c7"
                            : stock.Name === "บ้านโฮ่ง" ? "#fabf8fc7"
                                : stock.Name === "ป่าแดด" ? "#b1a0c7cd"
                                    : "lightgray"}`,
            }}>
                <Grid container>
                    <Grid item lg={2} md={3} xs={4}
                        sx={{
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 2,
                            borderRight: `2px solid ${stock.Name === "แม่โจ้" ? "#92D050"
                                : stock.Name === "สันกลาง" ? "#B1A0C7"
                                    : stock.Name === "สันทราย" ? "#B7DEE8"
                                        : stock.Name === "บ้านโฮ่ง" ? "#FABF8F"
                                            : stock.Name === "ป่าแดด" ? "#B1A0C7"
                                                : "lightgray"}`,
                            backgroundColor: stock.Name === "แม่โจ้" ? "#92D050"
                                : stock.Name === "สันกลาง" ? "#B1A0C7"
                                    : stock.Name === "สันทราย" ? "#B7DEE8"
                                        : stock.Name === "บ้านโฮ่ง" ? "#FABF8F"
                                            : stock.Name === "ป่าแดด" ? "#B1A0C7"
                                                : "lightgray"
                        }}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>{name}</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ปริมาณน้ำหนักรวม</Typography>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>{formatNumber(volume)}</Typography>
                        </Box>
                        {/* <TextField fullWidth variant="standard" value={update ? formatNumber(volume) : volume} disabled={update ? true : false} onChange={(e) => setVolume(e.target.value)} /> */}
                    </Grid>
                    <Grid item
                        xs={12}
                        md={9} // เต็มความกว้างในหน้าจอเล็ก
                        lg={10}  // 1/3 ในหน้าจอกว้าง
                        display="flex"
                        flexDirection="column"
                        sx={{ p: 3 }}
                    >
                        <Grid container spacing={2}
                        >
                            <Grid item xs={12} textAlign="center">
                                <Typography variant="h6" fontWeight="bold" gutterBottom>ผลิตภัณฑ์</Typography>
                                <Divider sx={{ mt: 1, border: 1 }} />
                            </Grid>
                            {stock.Products.map((product) => {
                                const editingProduct = editStates[product.id];
                                const isEditing = editStates.isEditingId === product.id;

                                return (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        md={4}
                                        lg={3}
                                        display="flex"
                                        flexDirection="column"
                                        key={product.id}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor: "lightgray",
                                                borderRadius: 3,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                width: "100%",
                                                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.53)",
                                            }}
                                        >
                                            {isEditing ? (
                                                <Grid container>
                                                    <Grid
                                                        item
                                                        xs={4}
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            backgroundColor: product.Color,
                                                            borderRadius: 3,
                                                            borderRight: `4px solid gray`,
                                                            p: 0.5,
                                                        }}
                                                    >
                                                        {/* <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>
                                                            {product.ProductName}
                                                        </Typography> */}
                                                        <Paper sx={{ width: "100%", ml: 0.5, mr: 0.5, borderRadius: 2 }}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                value={editingProduct?.ProductName ?? ""}
                                                                onChange={(e) => handleEditChange(product.id, "ProductName", e.target.value)}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '40px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        borderRadius: 2,
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '18px',
                                                                        fontWeight: 'bold',
                                                                        textAlign: 'left',
                                                                    },
                                                                }}
                                                            />
                                                        </Paper>
                                                    </Grid>

                                                    <Grid item xs={5} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <Paper sx={{ width: "100%", ml: 0.5, mr: 0.5, borderRadius: 2 }}>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                fullWidth
                                                                value={editingProduct?.Capacity ?? ""}
                                                                onChange={(e) => handleEditChange(product.id, "Capacity", e.target.value)}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '40px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        borderRadius: 2,
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '18px',
                                                                        fontWeight: 'bold',
                                                                        textAlign: 'left',
                                                                    },
                                                                }}
                                                            />
                                                        </Paper>
                                                    </Grid>

                                                    <Grid item xs={3} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <IconButtonError size="small" onClick={() => handleEditToggle(product, false)} sx={{ mr: 0.5 }}>
                                                            <CloseIcon fontSize="small" />
                                                        </IconButtonError>
                                                        <IconButtonSuccess size="small" onClick={() => handleUpdate()} sx={{ mr: 0.5 }}>
                                                            <SaveIcon fontSize="small" />
                                                        </IconButtonSuccess>
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <Grid container>
                                                    <Grid
                                                        item
                                                        xs={4}
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            backgroundColor: product.Color,
                                                            borderRadius: 3,
                                                            borderRight: `4px solid gray`,
                                                        }}
                                                    >
                                                        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>
                                                            {product.ProductName}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>
                                                            {formatNumber(product.Capacity)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={2} marginTop={1} textAlign="center">
                                                        <IconButtonWarning size="small" onClick={() => handleEditToggle(product, true)}>
                                                            <SettingsIcon fontSize="small" />
                                                        </IconButtonWarning>
                                                    </Grid>
                                                </Grid>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })}
                            {
                                show ? (
                                    <React.Fragment>
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: "lightgray",
                                                    borderRadius: 3,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    width: "100%",
                                                    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.53)",
                                                }}
                                            >
                                                <Grid container>
                                                    <Grid
                                                        item
                                                        xs={4}
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            backgroundColor: "lightgray",
                                                            borderRadius: 3,
                                                            borderRight: `4px solid gray`,
                                                            p: 0.5,
                                                        }}
                                                    >
                                                        {/* <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>
                                                            {product.ProductName}
                                                        </Typography> */}
                                                        <Paper sx={{ width: "100%", ml: 0.5, mr: 0.5, borderRadius: 2 }}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                value={productnanme}
                                                                onChange={(e) => addProductname(e.target.value)}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '40px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        borderRadius: 2,
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '18px',
                                                                        fontWeight: 'bold',
                                                                        textAlign: 'left',
                                                                    },
                                                                }}
                                                            />
                                                        </Paper>
                                                    </Grid>

                                                    <Grid item xs={5} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <Paper sx={{ width: "100%", ml: 0.5, mr: 0.5, borderRadius: 2 }}>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                fullWidth
                                                                value={volumes}
                                                                onChange={(e) => addVolumes(e.target.value)}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '40px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        borderRadius: 2,
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '18px',
                                                                        fontWeight: 'bold',
                                                                        textAlign: 'left',
                                                                    },
                                                                }}
                                                            />
                                                        </Paper>
                                                    </Grid>

                                                    <Grid item xs={3} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <IconButtonError size="small" sx={{ mr: 0.5 }} onClick={() => setShow(false)}>
                                                            <CloseIcon fontSize="small" />
                                                        </IconButtonError>
                                                        <IconButtonSuccess size="small" sx={{ mr: 0.5 }} onClick={() => handlesave()}>
                                                            <SaveIcon fontSize="small" />
                                                        </IconButtonSuccess>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </React.Fragment>
                                )
                                    :
                                    (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                        >
                                            <Box sx={{ pl: 5, pr: 5 }}>
                                                <Button
                                                    variant="contained"
                                                    color="inherit"
                                                    fullWidth
                                                    sx={{ height: 50, borderRadius: 3 }}
                                                    onClick={() => setShow(true)}
                                                    endIcon={
                                                        <BloodtypeIcon
                                                            sx={{
                                                                '&.MuiSvgIcon-root': { fontSize: 30, mr: -2 }
                                                            }}
                                                            color="error"
                                                        />
                                                    }
                                                >
                                                    <Typography variant="h6" fontSize="16px" fontWeight="bold">เพิ่มผลิตภัณฑ์</Typography>
                                                </Button>
                                            </Box>
                                        </Grid>
                                    )
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </React.Fragment>

    );
};

export default StockDetail;
