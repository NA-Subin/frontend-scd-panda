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
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import theme from "../../../theme/theme";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { database } from "../../../server/firebase";

const InsertGasStations = (props) => {
    const { gasStation, handleClose } = props;
    const [check, setCheck] = React.useState(true);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    // const handleClose = () => {
    //     setOpen(false);
    // };

    // const [checkTruck, setCheckTruck] = React.useState(false);
    const [checkTruck, setCheckTruck] = React.useState(false);
    const [name, setName] = React.useState("");
    const [code, setCode] = React.useState("");
    const [shortName, setShortName] = React.useState("");
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
    const [smallTrucks, setSmallTrucks] = useState([
        { id: 0, Truck: "", Price: "", Volume: "" }
    ]);

    const reorderIds = (arr) => {
        return arr.map((item, index) => ({
            ...item,
            id: index
        }));
    };

    const handleChange = (index, field, value) => {
        const updated = [...smallTrucks];
        updated[index][field] = value;
        setSmallTrucks(reorderIds(updated));   // 🔥 เรียง id ใหม่หลังอัปเดต
    };

    // console.log("smallTrucks : ", smallTrucks);

    const handleAdd = () => {
        const updated = [
            ...smallTrucks,
            { id: 0, Truck: "", Price: "", Volume: "" } // id จะถูกจัดใหม่ทีหลัง
        ];
        setSmallTrucks(reorderIds(updated));
    };

    const handleDelete = (index) => {
        const updated = smallTrucks.filter((_, i) => i !== index);
        setSmallTrucks(reorderIds(updated));  // 🔥 จัด id ใหม่เสมอหลังลบ
    };

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
    const [stocks, setStocks] = React.useState({});
    const [volumeData, setVolumeData] = useState([]);

    // console.log("volumeData : ", volumeData);

    // const handleVolumeChange = (product, volume, isChecked) => {
    //     setVolumeData((prevData) => {
    //         const exists = prevData.some(
    //             (item) => item.Name === product.ProductName
    //         );

    //         let updatedData;

    //         if (exists) {
    //             // ✅ ถ้ามีอยู่แล้ว → ลบออก (Toggle Off)
    //             updatedData = prevData.filter(
    //                 (item) => item.Name !== product.ProductName
    //             );
    //         } else {
    //             // ✅ ถ้ายังไม่มี → เพิ่มเข้าไป (Toggle On)
    //             updatedData = [
    //                 ...prevData,
    //                 {
    //                     Name: product.ProductName,
    //                     Capacity: product.Capacity,
    //                     Color: product.Color,
    //                     Volume: volume,
    //                     CheckBox: isChecked,
    //                 },
    //             ];
    //         }

    //         // ✅ เรียงลำดับใหม่ (เช่น เรียงตาม Name A→Z)
    //         updatedData.sort((a, b) => a.Name.localeCompare(b.Name));

    //         // ✅ นับจำนวน CheckBox ที่เป็น true
    //         const selectedCount = updatedData.filter((item) => item.CheckBox).length;
    //         setOilWell(selectedCount);

    //         return updatedData;
    //     });
    // };

    const handleVolumeUpdate = (product, volume) => {
        setVolumeData(prev => {
            const exists = prev.find(item => item.Name === product.ProductName);

            if (!exists) {
                // ถ้ายังไม่มี → สร้างใหม่พร้อม Volume
                return [
                    ...prev,
                    {
                        Name: product.ProductName,
                        Capacity: product.Capacity,
                        Color: product.Color,
                        Volume: volume,
                        CheckBox: false,
                        Backyard: false
                    },
                ];
            }

            // ถ้ามี → update Volume
            return prev.map(item =>
                item.Name === product.ProductName
                    ? { ...item, Volume: volume }
                    : item
            );
        });
    };

    const handleVolumeChange = (product, volume, isChecked) => {
        setVolumeData((prevData) => {
            let updatedData;

            if (isChecked) {
                // ✅ เพิ่มข้อมูลเมื่อ Checkbox = true
                // ถ้ามีอยู่แล้ว → update Volume
                const exists = prevData.find(item => item.Name === product.ProductName);

                if (exists) {
                    updatedData = prevData.map(item =>
                        item.Name === product.ProductName
                            ? { ...item, Volume: volume, CheckBox: true }
                            : item
                    );
                } else {
                    updatedData = [
                        ...prevData,
                        {
                            Name: product.ProductName,
                            Capacity: product.Capacity,
                            Color: product.Color,
                            Volume: volume,
                            CheckBox: true,
                            Backyard: false
                        },
                    ];
                }
            } else {
                // ❌ ถ้า Checkbox = false → ลบข้อมูลออก
                updatedData = prevData.filter(
                    (item) => item.Name !== product.ProductName
                );
            }

            // 🔄 เรียงลำดับใหม่
            updatedData.sort((a, b) => a.Name.localeCompare(b.Name));

            // 🔢 อัปเดตจำนวน Checkbox ที่เลือกอยู่
            const selectedCount = updatedData.filter((item) => item.CheckBox).length;
            setOilWell(selectedCount);

            return updatedData;
        });
    };

    const handleBackyardToggle = (product, value) => {
        setVolumeData(prev =>
            prev.map(item =>
                item.Name === product.ProductName
                    ? { ...item, Backyard: value }
                    : item
            )
        );
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

    // console.log(volumeData);

    const isSmallTrucksEmpty = (arr) => {
        return (
            arr.length === 1 &&
            arr[0].Truck.trim() === "" &&
            arr[0].Price.trim() === "" &&
            arr[0].Volume.trim() === ""
        );
    };

    const handlePost = () => {
        let truckData = "";

        if (!isSmallTrucksEmpty(smallTrucks)) {
            truckData = smallTrucks;  // บันทึกตามจริง
        }

        database
            .ref("depot/gasStations/")
            .child(gasStation)
            .update({
                id: gasStation + 1,
                Name: name,
                ShortName: shortName,
                Code: code,
                OilWellNumber: oilWell,
                Products: volumeData,
                Truck: truckData,
                CheckTruck: checkTruck,
                // Products: volumeData.reduce((acc, row) => {
                //     if (row.CheckBox === true || row.CheckBox === "true") {
                //         acc[row.Name] = row.Volume; // เพิ่ม key-value ในออบเจ็กต์
                //     }
                //     return acc; // คืนค่า acc เสมอ
                // }, {}),
                Stock: `${stocks?.id}:${stocks?.Name}`,
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
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
                setName("");
                setShortName("");
                setCode("");
                setOilWell("");
                setStocks({});
                setVolumeData([])
                setNo("");
                setVillage("");
                setSubDistrict("");
                setDistrict("");
                setProvince("");
                setZipCode("");
                setLat("");
                setLng("");
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
            <Grid item sm={3} xs={9}>
                <Paper
                    component="form">
                    <Select
                        id="demo-simple-select"
                        value={stocks ? stocks?.Name : ""}
                        size="small"
                        sx={{ textAlign: "left" }}
                        onChange={(e) => {
                            const selected = stock.find(item => item.id === e.target.value)
                            setStocks(selected)
                        }}
                        fullWidth
                    >
                        <MenuItem value={0}>
                            กรุณาเลือกคลังสต็อกน้ำมัน
                        </MenuItem>
                        {
                            stock.map((row) => (
                                <MenuItem value={row.id}>{row.Name}</MenuItem>
                            ))
                        }
                    </Select>
                </Paper>
            </Grid>
            <Grid item sm={2} xs={12} textAlign="right" >
                <FormControlLabel control={<Checkbox onClick={() => setCheckTruck(!checkTruck)} checked={checkTruck}
                    sx={{
                        "& .MuiSvgIcon-root": {
                            fontSize: 20, // ปรับขนาด Checkbox
                        },
                    }} />}
                    label="เพิ่มทะเบียนรถ"
                    sx={{
                        "& .MuiFormControlLabel-label": {
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: !check && "gray"
                        },
                    }} />
            </Grid>
            {
                stocks?.id !== undefined ?
                    <>
                        <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="สินค้า" size="small" />
                            </Divider>
                        </Grid>

                        {stock.map((row) =>
                            row.id === stocks?.id && (
                                <React.Fragment key={row.Name}>
                                    {row.Products.map((product, index) => (
                                        <React.Fragment key={index}>
                                            <Grid item sm={0.5} xs={12}></Grid>
                                            <Grid item sm={0.5} xs={2}>
                                                <Checkbox
                                                    checked={!!volumeData.find(item => item.Name === product.ProductName)}
                                                    onChange={(e) =>
                                                        handleVolumeChange(
                                                            product,
                                                            volumeData.find(item => item.Name === product.ProductName)?.Volume || 0,
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                {/* <Checkbox
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
                                                /> */}
                                            </Grid>
                                            <Grid item sm={1.5} xs={10}>
                                                <Box sx={{ borderRadius: 3, backgroundColor: product.Color, width: "100%", height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold">{product.ProductName}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item sm={1} xs={2}>
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
                                            <Grid item sm={2.5} xs={4}>
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
                                            <Grid item sm={2.5} xs={4}>
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
                                                        volumeData.find(i => i.Name === product.ProductName)?.Volume || ""
                                                    }
                                                    onChange={(e) => handleVolumeUpdate(product, e.target.value)}
                                                    // value={
                                                    //     Array.isArray(volumeData)
                                                    //         ? volumeData.find(
                                                    //             (item) => item.Name === product.ProductName
                                                    //         )?.Volume || ""
                                                    //         : ""
                                                    // }
                                                    // onChange={(e) =>
                                                    //     handleVolumeChange(product, e.target.value)
                                                    // }
                                                    disabled={
                                                        volumeData.find(i => i.Name === product.ProductName)?.Name !== product.ProductName
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
                                            <Grid item sm={2} xs={12} textAlign="right">
                                                {Array.isArray(volumeData) && (() => {
                                                    const matched = volumeData.find(
                                                        (item) => item.Name === product.ProductName
                                                    );

                                                    if (!matched) return null;

                                                    return (
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={matched.Backyard || false}
                                                                    onChange={(e) =>
                                                                        handleBackyardToggle(product, e.target.checked)
                                                                    }
                                                                    sx={{
                                                                        "& .MuiSvgIcon-root": {
                                                                            fontSize: 20,
                                                                        },
                                                                    }}
                                                                />
                                                            }
                                                            label="ตู้หลังบ้าน"
                                                            sx={{
                                                                "& .MuiFormControlLabel-label": {
                                                                    fontSize: "14px",
                                                                    fontWeight: "bold",
                                                                    color: !check ? "gray" : undefined,
                                                                },
                                                            }}
                                                        />
                                                    );
                                                })()}
                                            </Grid>
                                            <Grid item sm={0.5} xs={12}></Grid>
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
            {/* <Grid item sm={12} xs={12} marginTop={1} marginBottom={1}>
                <Divider sx={{ border: "1px solid " + theme.palette.panda.dark }} />
            </Grid>
            <Grid item sm={12} xs={12} display="flex" justifyContent="center" alignItems="center">
                <Button onClick={handlePost} variant="contained" color="success" sx={{ marginRight: 1 }}>บันทึก</Button>
                <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
            </Grid> */}
            <Grid item sm={12} xs={12} sx={{ position: "sticky", bottom: -20, backgroundColor: "white" }}>
                <Divider sx={{ border: "1px solid " + theme.palette.panda.dark, marginBottom: 1 }} />
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={2} marginBottom={2}>
                    <Button onClick={handlePost} variant="contained" color="success" sx={{ marginRight: 1 }}>บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </Box>
            </Grid>
        </React.Fragment>

    );
};

export default InsertGasStations;
