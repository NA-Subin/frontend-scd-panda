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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../../theme/style";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import CancelIcon from '@mui/icons-material/Cancel';
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { database } from "../../../server/firebase";

const Detail = (props) => {
    const { gasStation, stock, onCheck } = props;

    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState(gasStation?.Name);
    const [code, setCode] = React.useState(gasStation?.Code);
    const [shortName, setShortName] = React.useState(gasStation?.ShortName);
    const [oilWell, setOilWell] = React.useState(Number(gasStation?.OilWellNumber));
    const [checkTruck, setCheckTruck] = React.useState(gasStation?.Gasstation === undefined || gasStation?.Gasstation === false ? false : true);
    const addressText = gasStation?.Address?.trim() || "";

    // ใช้ regex แยกค่าแต่ละส่วน (รองรับกรณีบางส่วนหายไป)
    const noMatch = addressText.match(/^([^\s]+)/)?.[1] || "-";
    const villageMatch = addressText.match(/หมู่\s?([^\s]+)/)?.[1] || "-";
    const subDistrictMatch = addressText.match(/ต\.([^\s]+)/)?.[1] || "-";
    const districtMatch = addressText.match(/อ\.([^\s]+)/)?.[1] || "-";
    const provinceMatch = addressText.match(/จ\.([^\s]+)/)?.[1] || "-";
    const zipCodeMatch = addressText.match(/(\d{5})$/)?.[1] || "-";

    // ✅ ตั้งค่าเริ่มต้นใน useState โดยตรง
    const [no, setNo] = React.useState(noMatch);
    const [village, setVillage] = React.useState(villageMatch);
    const [subDistrict, setSubDistrict] = React.useState(subDistrictMatch);
    const [district, setDistrict] = React.useState(districtMatch);
    const [province, setProvince] = React.useState(provinceMatch);
    const [zipCode, setZipCode] = React.useState(zipCodeMatch);

    const [lat, setLat] = React.useState(gasStation?.lat);
    const [lng, setLng] = React.useState(gasStation?.lng);
    const [products, setProducts] = React.useState([{ Product: "", Capacity: "", Volume: "" }]);
    const [number, setNumber] = React.useState(0);
    const [check, setCheck] = React.useState(false);

    // console.log("stock : ", stock);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [stocks, setStocks] = React.useState(() => {
        if (!Array.isArray(stock)) return null;
        const stockValue = gasStation?.Stock ?? "";
        const id = stockValue.includes(":") ? Number(stockValue.split(":")[0]) : null;
        return stock.find(item => item.id === id) || null;
    });

    const [volumeData, setVolumeData] = useState(gasStation?.Products);

    // console.log("stocks : ", stocks);
    // console.log("volumeData : ", volumeData);

    const handleVolumeChange = (product, volume, isChecked) => {
        setVolumeData((prevData) => {
            const exists = prevData.some(
                (item) => item.Name === product.ProductName
            );

            let updatedData;

            if (exists) {
                // ✅ ถ้ามีอยู่แล้ว → ลบออก (Toggle Off)
                updatedData = prevData.filter(
                    (item) => item.Name !== product.ProductName
                );
            } else {
                // ✅ ถ้ายังไม่มี → เพิ่มเข้าไป (Toggle On)
                updatedData = [
                    ...prevData,
                    {
                        Name: product.ProductName,
                        Capacity: product.Capacity,
                        Color: product.Color,
                        Volume: volume,
                        CheckBox: isChecked,
                        Backyard: product.Backyard === true ? true : false
                    },
                ];
            }

            // ✅ เรียงลำดับใหม่ (เช่น เรียงตาม Name A→Z)
            updatedData.sort((a, b) => a.Name.localeCompare(b.Name));

            // ✅ นับจำนวน CheckBox ที่เป็น true
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

    console.log("Volume Data : ", volumeData);

    const handlePost = () => {
        database
            .ref("depot/gasStations/")
            .child(Number(gasStation?.id) - 1)
            .update({
                Name: name,
                ShortName: shortName,
                Code: code,
                OilWellNumber: oilWell,
                Products: volumeData,
                Stock: `${stocks?.id}:${stocks?.Name}`,
                CheckTruck: checkTruck,
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
                setCheck(false);
                onCheck(true);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    // console.log("จำนวนปั้ม "+gasStation);
    // console.log("จำนวนคลังสต็อกน้ำมัน "+stock);
    // console.log("จำนวนคลังรับน้ำมัน "+depot);

    return (
        <React.Fragment>
            <Button variant="contained" color="warning" size="small" sx={{ mr: -0.5, boxShadow: "1px 1px 4px gray" }} onClick={handleClickOpen} >แก้ไขข้อมูลปั้ม</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
                sx={{ zIndex: 1000 }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >แก้ไขข้อมูลปั้ม</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2}>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ color: !check && "gray" }} gutterBottom>รหัส</Typography>
                        </Grid>
                        <Grid item sm={2} xs={9}>
                            <TextField size="small" fullWidth value={code} onChange={(e) => setCode(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ color: !check && "gray" }} gutterBottom>ชื่อย่อ</Typography>
                        </Grid>
                        <Grid item sm={5} xs={9}>
                            <TextField size="small" fullWidth value={shortName} onChange={(e) => setShortName(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ color: !check && "gray" }} gutterBottom>จำนวนหลุม</Typography>
                        </Grid>
                        <Grid item sm={1.5} xs={9}>
                            <TextField size="small" type="number" fullWidth value={oilWell} disabled={!check} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ color: !check && "gray" }} gutterBottom>ชื่อปั้ม</Typography>
                        </Grid>
                        <Grid item sm={4.5} xs={9}>
                            <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ color: !check && "gray" }} gutterBottom>คลังสต็อก</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <Paper
                                component="form">
                                <Select
                                    id="demo-simple-select"
                                    value={stocks ? stocks?.id : ""}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => {
                                        const selected = stock.find(item => item.id === e.target.value)
                                        setStocks(selected)
                                    }}
                                    fullWidth
                                    disabled={!check}
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
                                disabled={!check}
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
                                            <Chip label="สินค้า" sx={{ color: !check && "gray" }} size="small" />
                                        </Divider>
                                    </Grid>
                                    {stock.map((row) =>
                                        row.id === stocks?.id && (
                                            <React.Fragment key={row.Name}>
                                                {row.Products.map((product, index) => {
                                                    const isChecked =
                                                        Array.isArray(volumeData) &&
                                                        volumeData.find((item) => item.Name === product.ProductName)?.CheckBox === true;

                                                    const currentVolume =
                                                        Array.isArray(volumeData) &&
                                                        volumeData.find((item) => item.Name === product.ProductName)?.Volume || 0;

                                                    return (
                                                        <React.Fragment key={index}>
                                                            <Grid item sm={3} xs={12}>
                                                                {
                                                                    check ?
                                                                        <React.Fragment>
                                                                            <Box
                                                                                onClick={() => handleVolumeChange(product, currentVolume, !isChecked)} // คลิกแทน checkbox
                                                                                sx={{
                                                                                    borderRadius: 2,
                                                                                    backgroundColor: isChecked ? product.Color : "#e0e0e0",
                                                                                    width: "100%",
                                                                                    height: 40,
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    alignItems: "center",
                                                                                    cursor: "pointer",
                                                                                    transition: "all 0.2s ease-in-out",
                                                                                    "&:hover": {
                                                                                        transform: "scale(1.03)",
                                                                                        boxShadow: "1px 1px 2px 1px rgba(0,0,0,0.2)",
                                                                                    },
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    variant="h5"
                                                                                    fontWeight="bold"
                                                                                    color={isChecked ? "black" : "#9e9e9e"}
                                                                                >
                                                                                    {product.ProductName}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Box sx={{ textAlign: "center" }}>
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
                                                                            </Box>
                                                                        </React.Fragment>
                                                                        :
                                                                        <React.Fragment>
                                                                            <Box
                                                                                sx={{
                                                                                    borderRadius: 2,
                                                                                    backgroundColor: isChecked ? product.Color : "#e0e0e0",
                                                                                    opacity: 0.8,
                                                                                    width: "100%",
                                                                                    height: 40,
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    alignItems: "center",
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    variant="h5"
                                                                                    fontWeight="bold"
                                                                                    color={isChecked ? "black" : "#9e9e9e"}
                                                                                >
                                                                                    {product.ProductName}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Box sx={{ textAlign: "center" }}>
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
                                                                                                    disabled={true}
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
                                                                            </Box>
                                                                        </React.Fragment>
                                                                }
                                                            </Grid>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </React.Fragment>
                                        )
                                    )}
                                </>
                                : ""
                        }
                        {
                            check &&
                            <Grid item sm={12} xs={12}>
                                <Typography variant="subtitle2" fontWeight="bold" color="error" gutterBottom>*กรณีที่มีข้อมูลสินค้าจะแสดงสีออกมา ถ้าเกิดว่าไม่มีข้อมูลจะไม่แสดงสี*</Typography>
                            </Grid>
                        }

                        <Grid item sm={12} xs={12} sx={{ mt: check && -3 }}>
                            <Divider>
                                <Chip label="ที่อยู่" size="small" sx={{ color: !check && "gray" }} />
                            </Divider>
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>บ้านเลขที่</Typography>
                        </Grid>
                        <Grid item sm={2.5} xs={9}>
                            <TextField size="small" fullWidth value={no} onChange={(e) => setNo(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>หมู่ที่</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={village} onChange={(e) => setVillage(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>ตำบล</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>อำเภอ</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>จังหวัด</Typography>
                        </Grid>
                        <Grid item sm={3} xs={9}>
                            <TextField size="small" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1.5} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>รหัสไปรณีย์</Typography>
                        </Grid>
                        <Grid item sm={2.5} xs={9}>
                            <TextField size="small" fullWidth value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={12} xs={12}>
                            <Divider>
                                <Chip label="พิกัด" size="small" sx={{ color: !check && "gray" }} />
                            </Divider>
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>lat</Typography>
                        </Grid>
                        <Grid item sm={5} xs={9}>
                            <TextField size="small" fullWidth value={lat} onChange={(e) => setLat(e.target.value)} disabled={!check} />
                        </Grid>
                        <Grid item sm={1} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ color: !check && "gray" }} marginTop={1} gutterBottom>long</Typography>
                        </Grid>
                        <Grid item sm={5} xs={9}>
                            <TextField size="small" fullWidth value={lng} onChange={(e) => setLng(e.target.value)} disabled={!check} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: `1px solid ${theme.palette.panda.dark}`, display: "flex", alignItems: "center", justifyContent: "center", height: "55px" }}>
                    {
                        !check ?
                            <Button variant="contained" color="warning" onClick={() => setCheck(true)}>
                                แก้ไขข้อมูล
                            </Button>
                            :
                            <React.Fragment>
                                <Button variant="contained" color="success" sx={{ mr: 2 }} onClick={handlePost}>
                                    บันทึก
                                </Button>
                                <Button variant="contained" color="error" onClick={() => setCheck(false)} >
                                    ยกเลิก
                                </Button>
                            </React.Fragment>
                    }
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default Detail;