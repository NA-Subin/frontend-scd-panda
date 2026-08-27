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
import { database } from "../../../server/firebase";

const InsertGasStations = (props) => {
    const { gasStation } = props;
    const [check, setCheck] = React.useState(true);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [name, setName] = React.useState("");
    const [code, setCode] = React.useState("");
    const [shortName,setShortName] = React.useState("");
    const [oilWell, setOilWell] = React.useState(0);
    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");
    const [products, setProducts] = React.useState([{ Product: "", Capacity: "", Volume: "" }]);
    const [number, setNumber] = React.useState(0);

    const handleAddProduct = () => {
        if (number < oilWell) {
            setNumber(number + 1);
            setProducts([...products, { Product: "", Capacity: "", Volume: "" }]); // เพิ่มช่องใหม่
        }
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value; // อัปเดตค่าตาม index และ field
        setProducts(updatedProducts);
    };

    // ใช้ useEffect เพื่อจัดการจำนวนของ products
    React.useEffect(() => {
        if (oilWell < products.length) {
            setProducts(products.slice(0, oilWell)); // ตัดรายการที่เกินออก
            setNumber(oilWell); // อัปเดต number ให้ตรงกับ oilWell
        }
    }, [oilWell, products]);

    const [stock, setStock] = React.useState([]);
    const [stocks, setStocks] = React.useState(0);
    const [volumeData, setVolumeData] = useState([]);

    const handleVolumeChange = (product, volume, isChecked) => {
        setVolumeData((prevData) => {
            const existingEntryIndex = prevData.findIndex(
                (item) => item.Name === product.ProductName
            );
    
            let updatedData;
    
            if (existingEntryIndex !== -1) {
                // ถ้ามีรายการอยู่แล้ว อัปเดตค่า Volume และ CheckBox
                updatedData = [...prevData];
                updatedData[existingEntryIndex].Volume = volume;
                updatedData[existingEntryIndex].CheckBox = isChecked;
            } else {
                // ถ้าไม่มีรายการ เพิ่มใหม่
                updatedData = [
                    ...prevData,
                    {
                        Name: product.ProductName,
                        Volume: volume,
                        CheckBox: isChecked, // บันทึกค่า CheckBox
                    },
                ];
            }
    
            // นับจำนวนของ CheckBox === true
            const selectedCount = updatedData.filter((item) => item.CheckBox === true).length;
    
            // อัปเดตสถานะ oilWell
            setOilWell(selectedCount);
    
            // คืนค่าการอัปเดต volumeData
            return updatedData;
        });
    };

    const getStock = async () => {
        database.ref("depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                dataStock.push({ id, ...datas[id] });
            }
            setStock(dataStock);
        });
    };

    useEffect(() => {
        getStock();
    }, []);

    console.log(volumeData);

    const handlePost = () => {
        database
            .ref("depot/gasStations/")
            .child(gasStation)
            .update({
                id: gasStation + 1,
                Name: name,
                ShortName: shortName,
                Code: code,
                OilWellNumber: oilWell,
                Products: volumeData.reduce((acc, row) => {
                    if (row.CheckBox === true || row.CheckBox === "true") {
                        acc[row.Name] = row.Volume; // เพิ่ม key-value ในออบเจ็กต์
                    }
                    return acc; // คืนค่า acc เสมอ
                }, {}),
                Stock: stocks,
                Address:
                    (no === "-" ? "-" : no) +
                    (village === "-" ? "" : "," + village) +
                    (subDistrict === "-" ? "" : "," + subDistrict) +
                    (district === "-" ? "" : "," + district) +
                    (province === "-" ? "" : "," + province) +
                    (zipCode === "-" ? "" : "," + zipCode)
                ,
                lat: lat,
                lng: lng
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
    };

    return (
        <React.Fragment>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>รหัส</Typography>
            </Grid>
            <Grid item sm={2} xs={9}>
                <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} />
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อย่อ</Typography>
            </Grid>
            <Grid item sm={5} xs={9}>
                <TextField size="small" fullWidth value={shortName} onChange={(e) => setShortName(e.target.value)} />
            </Grid>
            <Grid item sm={1.5} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>จำนวนหลุม</Typography>
            </Grid>
            <Grid item sm={1.5} xs={9}>
                <TextField size="small" type="number" fullWidth value={oilWell} />
            </Grid>
            <Grid item sm={1} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อปั้ม</Typography>
            </Grid>
            <Grid item sm={4.5} xs={9}>
                <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid item sm={1.5} xs={3}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>คลังสต็อก</Typography>
            </Grid>
            <Grid item sm={5} xs={9}>
                <Paper
                    component="form">
                    <Select
                        id="demo-simple-select"
                        value={stocks}
                        size="small"
                        sx={{ textAlign: "left" }}
                        onChange={(e) => setStocks(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value={0}>
                            กรุณาเลือกคลังสต็อกน้ำมัน
                        </MenuItem>
                        {
                            stock.map((row) => (
                                <MenuItem value={row.Name}>{row.Name}</MenuItem>
                            ))
                        }
                    </Select>
                </Paper>
            </Grid>
            {
                stocks !== 0 ?
                    <>
                        <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="สินค้า" size="small" />
                            </Divider>
                        </Grid>
                        
                        {stock.map((row) =>
                            row.Name === stocks && (
                                <React.Fragment key={row.Name}>
                                    {row.Products.map((product, index) => (
                                        <React.Fragment key={index}>
                                            <Grid item sm={1}  xs={12}></Grid>
                                            <Grid item sm={0.5}  xs={2}>
                                                <Checkbox
                                                    checked={
                                                        Array.isArray(volumeData) &&
                                                        volumeData.find((item) => item.Name === product.ProductName)?.CheckBox === true
                                                    }
                                                    onChange={(e) =>
                                                        handleVolumeChange(
                                                            product,
                                                            volumeData.find((item) => item.Name === product.ProductName)?.Volume || 0,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            </Grid>
                                            <Grid item sm={1.5}  xs={10}>
                                                <Box sx={{ borderRadius: 3,backgroundColor: product.Color, width: "100%",height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                      <Typography variant="h5" fontWeight="bold">{product.ProductName}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item sm={1}  xs={2}>
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
                                            <Grid item sm={3} xs={4}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    value={product.Capacity}
                                                    InputProps={{
                                                        readOnly: true, // ช่องนี้ให้แก้ไขไม่ได้
                                                    }}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item sm={1} xs={2}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    textAlign="right"
                                                    marginTop={1}
                                                    gutterBottom
                                                >
                                                    ปริมาณ
                                                </Typography>
                                            </Grid>
                                            <Grid item sm={3} xs={4}>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    color={
                                                        Array.isArray(volumeData) &&
                                                            Number(
                                                                volumeData.find((item) => item.Name === product.ProductName)?.Volume
                                                            ) > Number(product.Capacity)
                                                            ? "error" // ใช้ 'error' color หาก Volume มากกว่า Capacity
                                                            : Number(
                                                                volumeData.find((item) => item.Name === product.ProductName)?.Volume
                                                            ) === Number(product.Capacity)
                                                                ? "warning" // ใช้ 'warning' color หาก Volume เท่ากับ Capacity
                                                                : "primary" // ใช้ 'primary' color หาก Volume น้อยกว่าหรือเท่ากับ Capacity
                                                    }
                                                    value={
                                                        Array.isArray(volumeData)
                                                            ? volumeData.find(
                                                                (item) => item.Name === product.ProductName
                                                            )?.Volume || ""
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        handleVolumeChange(product, e.target.value)
                                                    }
                                                    InputProps={{
                                                        style: {
                                                            color:
                                                                Array.isArray(volumeData) &&
                                                                    Number(
                                                                        volumeData.find((item) => item.Name === product.ProductName)?.Volume
                                                                    ) > Number(product.Capacity)
                                                                    ? "red"
                                                                    : Number(
                                                                        volumeData.find((item) => item.Name === product.ProductName)?.Volume
                                                                    ) === Number(product.Capacity)
                                                                        ? "orange"
                                                                        : "black", // สีแดงถ้า Volume มากกว่า Capacity
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item sm={1.5}  xs={12}></Grid>
                                            <Grid item sm={12} textAlign="right" marginTop={-11} marginRight={7}>
                                                {
                                                    Array.isArray(volumeData) &&
                                                        Number(
                                                            volumeData.find((item) => item.Name === product.ProductName)?.Volume
                                                        ) > Number(product.Capacity)
                                                        ? <Typography fontWeight="bold" color="red" fontSize="10px" gutterBottom>*เกินความจุ*</Typography>
                                                        : Number(
                                                            volumeData.find((item) => item.Name === product.ProductName)?.Volume
                                                        ) === Number(product.Capacity)
                                                            ? <Typography fontWeight="bold" color="orange" fontSize="10px" gutterBottom>*้เท่ากับความจุ*</Typography>
                                                            : ""
                                                }
                                            </Grid>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            )
                        )}
                    </>
                    : ""
            }
            <Grid item sm={12}  xs={12}>
                <Divider>
                    <Chip label="ที่อยู่" size="small" />
                </Divider>
            </Grid>
            <Grid item sm={1.5}  xs={3}>
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
            <Grid item sm={12}  xs={12} marginTop={1} marginBottom={1}>
                <Divider sx={{ border: "1px solid " + theme.palette.panda.dark }} />
            </Grid>
            <Grid item sm={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                <Button onClick={handlePost} variant="contained" color="success" sx={{ marginRight: 1 }}>บันทึก</Button>
                <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
            </Grid>
        </React.Fragment>

    );
};

export default InsertGasStations;
