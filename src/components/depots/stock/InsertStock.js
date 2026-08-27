import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
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
import theme from "../../../theme/theme";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { database } from "../../../server/firebase";

const InsertStock = (props) => {
    const { stock, handleClose } = props;
    const [check, setCheck] = React.useState(true);
    const [open, setOpen] = React.useState(false);
    const [numberAdd, setNumberAdd] = React.useState(1);
    const [products, setProducts] = React.useState([{ id: numberAdd, Product: "", Capacity: "", Color: "" }]);

    const handleAddProduct = () => {
        setNumberAdd(numberAdd + 1);
        setProducts([...products, { id: numberAdd + 1, Product: "", Capacity: "", Color: "" }]); // เพิ่มช่องใหม่
    };

    const handleDeleteProduct = () => {
        if (numberAdd > 1) {
            setNumberAdd(numberAdd - 1);
            setProducts(products.slice(0, -1)); // ลบช่องสุดท้าย
        }
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value; // อัปเดตค่าตาม index และ field
        setProducts(updatedProducts);
    };

    console.log("products", products);

    const handleClickOpen = () => {
        setOpen(true);
    };

    // const handleClose = () => {
    //     setOpen(false);
    // };

    const [name, setName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");

    const [volume, setVolume] = React.useState("");
    const [G91, setG91] = React.useState("");
    const [G95, setG95] = React.useState("");
    const [B7, setB7] = React.useState("");
    const [B95, setB95] = React.useState("");
    const [B10, setB10] = React.useState("");
    const [B20, setB20] = React.useState("");
    const [E20, setE20] = React.useState("");
    const [E85, setE85] = React.useState("");
    const [PWD, setPWD] = React.useState("");

    // React.useEffect(() => {
    //     const total =
    //       (parseFloat(G91) || 0) +
    //       (parseFloat(G95) || 0) +
    //       (parseFloat(B7) || 0) +
    //       (parseFloat(B95) || 0) +
    //       (parseFloat(B10) || 0) +
    //       (parseFloat(B20) || 0) +
    //       (parseFloat(E20) || 0) +
    //       (parseFloat(E85) || 0) +
    //       (parseFloat(PWD) || 0);

    //     setVolume(total);
    //   }, [G91, G95, B7, B95, B10, B20, E20, E85, PWD]);

    const handlePost = () => {
        const totalVolume = products.reduce((sum, row) => {
            return sum + (parseFloat(row.Capacity) || 0); // แปลง Capacity เป็นตัวเลขและรวม
        }, 0);

        database
            .ref("depot/stock/")
            .child(stock)
            .update({
                id: stock + 1,
                Name: name,
                // Products: products.reduce((acc, row) => {
                //     acc[row.Product] = row.Capacity; // เพิ่ม key-value ในออบเจ็กต์
                //     return acc;
                // }, {}),
                Volume: totalVolume,
                Address:
                    (no === "-" ? "-" : no) +
                    (village === "-" ? "" : ` ${village}`) +
                    (subDistrict === "-" ? "" : ` ${subDistrict}`) +
                    (district === "-" ? "" : ` ${district}`) +
                    (province === "-" ? "" : ` ${province}`) +
                    (zipCode === "-" ? "" : ` ${zipCode}`)
                ,
                lat: lat,
                lng: lng
            })
            .then(() => {
                products.map((row) => {
                    database
                        .ref("depot/stock/" + stock)
                        .child("/Products/" + row.id)
                        .update({
                            id: row.id,
                            ProductName: row.Product,
                            Capacity: row.Capacity,
                            Color: row.Color
                        })
                        .then(() => {
                            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                            console.log("Data pushed successfully");
                            setOpen(false);
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error("Error pushing data:", error);
                        });
                })
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อคลัง</Typography>
            </Grid>
            <Grid item sm={7} xs={9}>
                <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid item sm={1.5} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ปริมาณน้ำมัน</Typography>
            </Grid>
            <Grid item sm={2.5} xs={9}>
                <TextField size="small" fullWidth value={volume} disabled />
            </Grid>
            <Grid item sm={12} xs={12}>
                <Divider>
                    <Chip label="สินค้า" size="small" />
                </Divider>
            </Grid>
            {products.map((item, index) => (
                <React.Fragment key={index}>
                    <Grid item sm={1.5} xs={3}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            textAlign="right"
                            marginTop={1}
                            gutterBottom
                        >
                            ชื่อสินค้า
                        </Typography>
                    </Grid>
                    <Grid item sm={6} xs={9}>
                        <TextField
                            size="small"
                            fullWidth
                            value={item.Product}
                            error={(products.filter((p) => p.Product === item.Product).length > 1) && item.Product !== ""} // แสดง error เมื่อมีค่าซ้ำและไม่ใช่ค่าว่าง
                            helperText={
                                (products.filter((p) => p.Product === item.Product).length > 1) && item.Product !== ""
                                    ? "*ชื่อสินค้านี้ซ้ำกัน* --กรณีต้องการเพิ่มสินค้าให้ทำตามนี้ " + item.Product + "(" + (products.filter((p) => p.Product === item.Product && p.Product !== "").indexOf(item) + 1) + ")"
                                    : ""
                            } // แสดงข้อความเตือนเมื่อค่าซ้ำ
                            onChange={(e) =>
                                handleProductChange(index, "Product", e.target.value)
                            }
                            sx={{
                                '& .MuiFormHelperText-root': {
                                    color: 'orange', // สีตัวอักษรของข้อความเตือน
                                },
                            }}
                        />
                    </Grid>
                    <Grid item sm={1} xs={3}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            textAlign="right"
                            marginTop={1}
                            gutterBottom
                        >
                            ความจุ
                        </Typography>
                    </Grid>
                    <Grid item sm={numberAdd === 1 ? 3 : 2.5} xs={numberAdd === 1 ? 7 : 6.5}>
                        <TextField
                            size="small"
                            fullWidth
                            value={item.Capacity}
                            onChange={(e) =>
                                handleProductChange(index, "Capacity", e.target.value)
                            }
                        />
                        <TextField
                            style={{ display: 'none' }}
                            inputProps={{ readOnly: true }}
                            value={item.Color = (() => {
                                const baseProduct = item.Product.replace(/\(\d+\)$/, ""); // ตัดตัวเลขในวงเล็บออก
                                return baseProduct === "G91" ? "#92D050" :
                                    baseProduct === "G95" ? "#FFC000" :
                                        baseProduct === "B7" ? "#FFFF99" :
                                            baseProduct === "B95" ? "#B7DEE8" :
                                                baseProduct === "B10" ? "#32CD32" :
                                                    baseProduct === "B20" ? "#228B22" :
                                                        baseProduct === "E20" ? "#C4BD97" :
                                                            baseProduct === "E85" ? "#0000FF" :
                                                                baseProduct === "PWD" ? "#F141D8" :
                                                                    "#FFD700";
                            })()}
                            onChange={(e) =>
                                handleProductChange(index, "Color", e.target.value)
                            }
                        />
                    </Grid>
                    <Grid item sm={numberAdd === 1 ? 0.5 : 1} xs={numberAdd === 1 ? 2 : 2.5} />
                </React.Fragment>
            ))}
            <Grid item sm={12} xs={12} marginTop={-7} marginRight={-3} display="flex" justifyContent="right" alignItems="center">
                {
                    numberAdd === 1 ?
                        <IconButton color="success" onClick={handleAddProduct}>
                            <AddCircleIcon fontSize="small" />
                        </IconButton>
                        :
                        <>
                            <IconButton color="success" onClick={handleAddProduct}>
                                <AddCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="error" onClick={handleDeleteProduct}>
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </>
                }
            </Grid>
            <Grid item sm={12} xs={12}>
                <Divider>
                    <Chip label="ที่อยู่" size="small" />
                </Divider>
            </Grid>
            <Grid item sm={1.5} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>บ้านเลขที่</Typography>
            </Grid>
            <Grid item sm={2.5} xs={9}>
                <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} />
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>หมู่ที่</Typography>
            </Grid>
            <Grid item sm={3} xs={9}>
                <TextField size="small" fullWidth value={village} onChange={(e) => setVillage(e.target.value)} />
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ตำบล</Typography>
            </Grid>
            <Grid item sm={3} xs={9}>
                <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} />
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>อำเภอ</Typography>
            </Grid>
            <Grid item sm={3} xs={9}>
                <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>จังหวัด</Typography>
            </Grid>
            <Grid item sm={3} xs={9}>
                <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} />
            </Grid>
            <Grid item sm={1.5} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>รหัสไปรณีย์</Typography>
            </Grid>
            <Grid item sm={2.5} xs={9}>
                <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </Grid>
            <Grid item sm={12} xs={12}>
                <Divider>
                    <Chip label="พิกัด" size="small" />
                </Divider>
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>lat</Typography>
            </Grid>
            <Grid item sm={5} xs={9}>
                <TextField size="small" fullWidth value={lat} onChange={(e) => setLat(e.target.value)} />
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>long</Typography>
            </Grid>
            <Grid item sm={5} xs={9}>
                <TextField size="small" fullWidth value={lng} onChange={(e) => setLng(e.target.value)} />
            </Grid>
            <Grid item sm={12} xs={12} sx={{ position: "sticky", bottom: 0, backgroundColor: "white" }}>
                <Divider sx={{ border: "1px solid " + theme.palette.panda.dark, marginBottom: 1 }} />
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
                    <Button onClick={handlePost} variant="contained" color="success" sx={{ marginRight: 1 }}>บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </Box>
            </Grid>
        </React.Fragment>

    );
};

export default InsertStock;
