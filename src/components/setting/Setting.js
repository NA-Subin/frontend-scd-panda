import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PasswordIcon from '@mui/icons-material/Password';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxIcon from '@mui/icons-material/AddBox';
import InfoIcon from '@mui/icons-material/Info';
import { IconButtonError, IconButtonInfo, TablecellHeader, TablecellSetting, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import InsertCompany from "./InsertCompany";
import theme from "../../theme/theme";
import Cookies from 'js-cookie';
import { useData } from "../../server/path";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";


const Setting = () => {
  const [open, setOpen] = useState(1);
  const [update, setUpdate] = React.useState(true);
  const [openEditePassword, setOpenEditePassword] = React.useState(false);
  const [openDetailCompany, setOpenDetailCompany] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [insertPositions, setInsertPositions] = useState(true);
  const [checkID, setCheckID] = useState(0);
  const [checkIndex, setCheckIndex] = useState(0);
  const [positionName, setPositionName] = useState("");
  const [checkBasicData, setCheckBasicData] = useState("");
  const [checkOrperationData, setCheckOprerationData] = useState("");
  const [checkFinancialData, setCheckFinancialData] = useState("");
  const [checkReportData, setCheckReportData] = useState("");
  const [checkBigTruckData, setCheckBigTruckData] = useState("");
  const [checkSmallTruckData, setCheckSmallTruckData] = useState("");
  const [checkGasStationData, setCheckGasStationData] = useState("");
  const [checkDriverData, setCheckDriverData] = useState("");
  const [updatePosition, setUpdatePosition] = React.useState(true);
  const [name, setName] = useState("");

  // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
    };

    window.addEventListener('resize', handleResize); // เพิ่ม event listener

    // ลบ event listener เมื่อ component ถูกทำลาย
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const userId = Cookies.get("sessionToken");
  // const { company, officers } = useData();

  const { company, officers, positions } = useBasicData();
  const companyDetail = Object.values(company || {});
  const officersDetail = Object.values(officers || {});
  const positionsDetail = Object.values(positions || {});
  console.log("company : ", company);
  console.log("Officers : ", officers);

  const userDetail = officersDetail.find((row) => (row.id === Number(userId.split("$")[1])));

  console.log("User : ", userId);
  console.log("User Detail : ", userDetail);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordAgain, setNewPasswordAgian] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((show) => !show);

  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    console.log("Auth : ", auth);
    console.log("User : ", user);

    if (newPassword === newPasswordAgain) {
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        console.log("Credential : ", credential);

        try {
          // 1. ยืนยันตัวตนด้วยรหัสผ่านเดิม
          await reauthenticateWithCredential(user, credential);

          // 2. เปลี่ยนรหัสผ่านใหม่
          await updatePassword(user, newPassword);

          database
            .ref("employee/officers/")
            .child(userDetail.id - 1)
            .update({
              Password: newPassword,
            })
            .then(() => {
              console.log("Data pushed successfully");
              setOpenEditePassword(false)
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error("Error pushing data:", error);
            });

          ShowSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
        } catch (error) {
          ShowError(`เกิดข้อผิดพลาด: ${error.message}`);
        }
      } else {
        ShowError('ไม่พบผู้ใช้ที่เข้าสู่ระบบ');
      }
    } else {
      ShowError('กรูณากรอกรหัสผ่านใหม่อีกครั้ง');
    }


  };

  const handleUpdate = (newIndex, newID, newName, newBasicData, newOperationData, newFinancialData, newReportData, newBigTruckData, newSmallTruckData, newGasStationData, newDriverData) => {
    setCheckID(newID - 1);
    setCheckIndex(newIndex);
    setName(newName);
    setCheckBasicData(newBasicData === 0 ? false : true);
    setCheckOprerationData(newOperationData === 0 ? false : true);
    setCheckFinancialData(newFinancialData === 0 ? false : true);
    setCheckReportData(newReportData === 0 ? false : true);
    setCheckBigTruckData(newBigTruckData === 0 ? false : true);
    setCheckSmallTruckData(newSmallTruckData === 0 ? false : true);
    setCheckGasStationData(newGasStationData === 0 ? false : true);
    setCheckDriverData(newDriverData === 0 ? false : true);
    setUpdatePosition(false);
  }

  const [companyID, setCompanyID] = useState(0);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState({
    no: "",
    village: "",
    road: "",
    subDistrict: "",
    district: "",
    province: "",
    zipCode: "",
  });
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [newCardID, setNewCardID] = useState("");

  const handleEditCompany = (row) => {
    setOpenDetailCompany(row.id);
    setCompanyID(row.id);
    setNewName(row.Name || "");
    setNewAddress({
      no: row.Address?.no || "",
      village: row.Address?.village || "",
      road: row.Address?.road || "",
      subDistrict: row.Address?.subDistrict || "",
      district: row.Address?.district || "",
      province: row.Address?.province || "",
      zipCode: row.Address?.zipCode || "",
    });
    setNewLat(row.Lat || "");
    setNewLng(row.Lng || "");
    setNewCardID(row.CardID || "");
    setUpdate(true); // เริ่มแบบดูอย่างเดียวก่อน
  };


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    database
      .ref("positions/")
      .child(positionsDetail.length)
      .update({
        id: (positionsDetail.length) + 1,
        Name: positionName,
        BasicData: 0,
        OprerationData: 0,
        FinancialData: 0,
        ReportData: 0,
        BigTruckData: 0,
        SmallTruckData: 0,
        GasStationData: 0,
        DriverData: 0
      })
      .then(() => {
        ShowSuccess("เพิ่มข้อมูลสำเร็จ");
        console.log("Data pushed successfully");
        setInsertPositions(false);
        setPositionName("");
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
  }
  // const [company, setCompany] = useState([]);

  // const getCompany = async () => {
  //   database.ref("/company").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataCompany = [];
  //     const dataTranSport = [];
  //     for (let id in datas) {
  //       dataCompany.push({ id, ...datas[id] })
  //     }
  //     setCompany(dataCompany);
  //   });
  // };
  // useEffect(() => {
  //   getCompany();
  // }, []);

  console.log("BasucData : ", checkBasicData);

  const formatAddress = (address) => {
    if (!address) return "-";

    const {
      no,
      village,
      road,
      subDistrict,
      district,
      province,
      zipCode,
    } = address;

    const parts = [];

    if (no && no !== "-") parts.push(`บ้านเลขที่ ${no}`);
    if (village && village !== "-") parts.push(`หมู่ที่ ${village}`);
    if (road && road !== "-") parts.push(`ถนน ${road}`);
    if (subDistrict && subDistrict !== "-") parts.push(`ตำบล${subDistrict}`);
    if (district && district !== "-") parts.push(`อำเภอ${district}`);
    if (province && province !== "-") parts.push(`จังหวัด${province}`);
    if (zipCode && zipCode !== "-") parts.push(`รหัสไปรษณีย์ ${zipCode}`);

    return parts.join(" ");
  };


  const handleSaveCompany = async () => {
    try {
      const companyRef = database.ref("company").child(Number(companyID) - 1);

      const snapshot = await companyRef.once("value");
      const companyData = snapshot.val();

      const today = new Date();
      const dateStr = today.toLocaleDateString("en-GB");

      const updatedData = {
        Name: newName,
        Address: newAddress,
        Lat: newLat,
        Lng: newLng,
        CardID: newCardID,
        DateStart: dateStr
      };

      const isChanged =
        companyData.CardID !== newCardID ||
        companyData.Name !== newName ||
        companyData.Address !== newAddress;

      if (isChanged) {
        const history = companyData.History || {};
        const nextIndex = Object.keys(history).length;

        const oldHistory = {
          id: nextIndex,
          Name: companyData.Name,
          Address: companyData.Address,
          CardID: companyData.CardID,
          DateStart: companyData.DateStart || "",
          DateEnd: dateStr,
        };

        await companyRef.child("History").child(nextIndex).set(oldHistory);
      }

      await companyRef.update(updatedData);

      ShowSuccess("อัปเดตข้อมูลสำเร็จ");
      setUpdate(true);

    } catch (err) {
      ShowError("เกิดข้อผิดพลาดในการอัปเดต");
      console.error(err);
    }
  };

  const handleSavePosition = () => {
    database
      .ref("positions/")
      .child(checkID)
      .update({
        Name: name,
        BasicData: checkBasicData === false ? 0 : 1,
        OprerationData: checkOrperationData === false ? 0 : 1,
        FinancialData: checkFinancialData === false ? 0 : 1,
        ReportData: checkReportData === false ? 0 : 1,
        BigTruckData: checkBigTruckData === false ? 0 : 1,
        SmallTruckData: checkSmallTruckData === false ? 0 : 1,
        GasStationData: checkGasStationData === false ? 0 : 1,
        DriverData: checkDriverData === false ? 0 : 1
      })
      .then(() => {
        ShowSuccess("เพิ่มข้อมูลสำเร็จ");
        console.log("Data pushed successfully");
        setUpdatePosition(true);
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
  }

  console.log("Positon Detail : ", positionsDetail);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        ตั้งค่า
      </Typography>
      <Divider />
      <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 130) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 280) }}>
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={1.5} md={3} />
          <Grid item xs={4} sm={3} md={2}>
            <Button variant="contained" color={open === 1 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(1)}>
              <AssignmentIndIcon fontSize="large" />
            </Button>
          </Grid>
          <Grid item xs={4} sm={3} md={2}>
            <Button variant="contained" color={open === 3 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(3)}>
              <PrivacyTipIcon fontSize="large" />
            </Button>
          </Grid>
          <Grid item xs={4} sm={3} md={2}>
            <Button variant="contained" color={open === 2 ? "warning" : "inherit"} fullWidth sx={{ height: "20vh", borderRadius: 5 }} onClick={() => setOpen(2)}>
              <BusinessIcon fontSize="large" />
            </Button>
          </Grid>
          <Grid item xs={12} sm={1.5} md={3} />
          <Grid item xs={12} marginTop={3}>
            {
              open === 1 ?
                <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                  <Typography variant="h6" fontWeight="bold" textAlign="center">ข้อมูลส่วนตัว</Typography>
                  <Divider sx={{ marginTop: 1 }} />
                  <Grid container spacing={2} marginTop={2} padding={5}>
                    <Grid item xs={6}>
                      <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>ชื่อ-สกุล : </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.Name}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>ตำแหน่ง : </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.Position.split(":")[1]}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>User : </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.User}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" textAlign="center" justifyContent="left" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 2 }} gutterBottom>เบอร์โทร : </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{userDetail.Phone}</Typography>
                      </Box>
                    </Grid>
                    {
                      !openEditePassword &&
                      <Grid item xs={12}>
                        <Button variant="contained" color="warning" size="small" onClick={() => setOpenEditePassword(true)}>แก้ไขรหัสผ่าน</Button>
                      </Grid>
                    }
                    {
                      openEditePassword &&
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านเดิม</Typography>
                          </Grid>
                          <Grid item xs={9}>
                            <Paper component="form" >
                              <TextField
                                size="small"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={handleTogglePassword}
                                        edge="end"
                                        aria-label="toggle password visibility"
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Paper>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านใหม่</Typography>
                          </Grid>
                          <Grid item xs={9}>
                            <Paper component="form" >
                              <TextField
                                size="small"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={handleTogglePassword}
                                        edge="end"
                                        aria-label="toggle password visibility"
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Paper>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" marginTop={1} gutterBottom>รหัสผ่านใหม่อีกครั้ง</Typography>
                          </Grid>
                          <Grid item xs={9}>
                            <Paper component="form" >
                              <TextField
                                size="small"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                value={newPasswordAgain}
                                onChange={(e) => setNewPasswordAgian(e.target.value)}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={handleTogglePassword}
                                        edge="end"
                                        aria-label="toggle password visibility"
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Paper>
                          </Grid>
                          <Grid item xs={12} textAlign="center" marginTop={2}>
                            <Button variant="contained" color="error" size="small" sx={{ marginRight: 2 }} onClick={() => setOpenEditePassword(false)}>ยกเลิก</Button>
                            <Button variant="contained" color="success" size="small" onClick={handleChangePassword}>บันทึก</Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    }

                  </Grid>
                </Paper>
                : open === 2 ?
                  <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                    <Typography variant="h6" fontWeight="bold" textAlign="center">บริษัท</Typography>
                    <Divider sx={{ marginTop: 1 }} />
                    <InsertCompany />
                    <TableContainer
                      component={Paper}
                      style={{ maxHeight: "90vh" }}
                      sx={{ marginTop: 2 }}
                    >
                      <Table stickyHeader size="small" sx={{ width: "1280px" }}>
                        <TableHead sx={{ height: "7vh" }}>
                          <TableRow>
                            <TablecellSetting width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                              ลำดับ
                            </TablecellSetting>
                            <TablecellSetting sx={{ textAlign: "center", fontSize: 16 }}>
                              ชื่อบริษัท
                            </TablecellSetting>
                            <TablecellSetting sx={{ textAlign: "center", fontSize: 16 }}>
                              ที่อยู่
                            </TablecellSetting>
                            <TablecellSetting />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            companyDetail.map((row, index) => (
                              <TableRow>
                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                <TableCell sx={{ textAlign: "left" }}>{row.Name}</TableCell>
                                <TableCell sx={{ textAlign: "left" }}>{formatAddress(row.Address)}</TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => handleEditCompany(row)}><InfoIcon color="info" fontSize="12px" /></IconButton>
                                </TableCell>
                                <Dialog
                                  open={openDetailCompany === row.id ? true : false}
                                  keepMounted
                                  onClose={() => setOpenDetailCompany(false)}
                                  sx={{
                                    "& .MuiDialog-paper": {
                                      width: "800px", // กำหนดความกว้างแบบ Fixed
                                      maxWidth: "none", // ปิดการปรับอัตโนมัติ
                                    },
                                  }}
                                >
                                  <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                                    <Grid container spacing={2}>
                                      <Grid item xs={10}>
                                        <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดบริษัท{row.Name}</Typography>
                                      </Grid>
                                      <Grid item xs={2} textAlign="right">
                                        <IconButtonError onClick={() => setOpenDetailCompany(false)}>
                                          <CancelIcon />
                                        </IconButtonError>
                                      </Grid>
                                    </Grid>
                                  </DialogTitle>
                                  <DialogContent>
                                    <Paper
                                      sx={{ p: 2, border: "1px solid" + theme.palette.grey[600], marginTop: 2, marginBottom: 2 }}
                                    >
                                      <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              ชื่อบริษัท
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newName : row.Name}
                                              onChange={(e) => setNewName(e.target.value)}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              เลขที่ภาษี
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newCardID : row.CardID}
                                              onChange={(e) => setNewCardID(e.target.value)}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              บ้านเลขที่
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newAddress.no : row.Address.no}
                                              onChange={(e) => setNewAddress({ ...newAddress, no: e.target.value })}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              หมู่ที่
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newAddress.village : row.Address.village}
                                              onChange={(e) => setNewAddress({ ...newAddress, village: e.target.value })}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              ถนน
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newAddress.road : row.Address.road}
                                              onChange={(e) => setNewAddress({ ...newAddress, road: e.target.value })}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              ตำบล
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newAddress.subDistrict : row.Address.subDistrict}
                                              onChange={(e) => setNewAddress({ ...newAddress, subDistrict: e.target.value })}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              อำเภอ
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newAddress.district : row.Address.district}
                                              onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              จังหวัด
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newAddress.province : row.Address.province}
                                              onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              รหัสไปรษณีย์
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newAddress.zipCode : row.Address.zipCode}
                                              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              Latitude(ละติจูด)
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newLat : row.Lat}
                                              onChange={(e) => setNewLat(e.target.value)}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center", // ให้แนวตั้งตรงกัน
                                              width: "100%",
                                              gap: 1, // ระยะห่างระหว่าง label กับช่องกรอก
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              sx={{ whiteSpace: "nowrap" }} // ป้องกันตัดบรรทัด
                                            >
                                              Longitude(ลองจิจูด)
                                            </Typography>

                                            <TextField
                                              variant="standard"
                                              value={!update ? newLng : row.Lng}
                                              onChange={(e) => setNewLng(e.target.value)}
                                              disabled={update}
                                              fullWidth
                                            />
                                          </Box>
                                        </Grid>
                                      </Grid>
                                    </Paper>
                                  </DialogContent>
                                  <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    {
                                      update ?
                                        <Box marginBottom={2} textAlign="center">
                                          <Button variant="contained" color="info" sx={{ marginRight: 2 }}>พิมพ์</Button>
                                          <Button variant="contained" color="warning" onClick={() => setUpdate(false)} >แก้ไข</Button>
                                        </Box>
                                        :
                                        <Box marginBottom={2} textAlign="center">
                                          <Button variant="contained" color="success" sx={{ marginRight: 2 }} onClick={handleSaveCompany} >บันทึก</Button>
                                          <Button variant="contained" color="error" onClick={() => setUpdate(true)} >ยกเลิก</Button>
                                        </Box>
                                    }
                                  </DialogActions>
                                </Dialog>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                  :
                  <Paper sx={{ height: "70vh", borderRadius: 5, padding: 2 }}>
                    <Typography variant="h6" fontWeight="bold" textAlign="center">จัดการสิทธิ์เข้าใช้งานระบบ</Typography>
                    <Divider sx={{ marginTop: 1 }} />
                    {
                      !insertPositions &&
                      <Grid container spacing={2} sx={{ marginBottom: -3, marginTop: 1 }}>
                        <Grid item xs={10}>
                          <TextField
                            fullWidth
                            size="small"
                            value={positionName}
                            onChange={(e) => setPositionName(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    กรุณากรอกชื่อตำแหน่ง :
                                  </Typography>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <Button variant="contained" color="success" size="small" fullWidth sx={{ marginTop: 0.5 }} onClick={handleSave} >บันทึก</Button>
                        </Grid>
                        <Grid item xs={1}>
                          <Button variant="contained" color="error" size="small" fullWidth sx={{ marginTop: 0.5 }} onClick={() => setInsertPositions(true)}>ยกเลิก</Button>
                        </Grid>
                      </Grid>
                    }
                    <Grid container spacing={2} marginTop={2} padding={2}>
                      <Grid item xs={12}>
                        <TableContainer
                          component={Paper}
                          style={{ maxHeight: "90vh" }}
                        >
                          <Table stickyHeader size="small" sx={{ width: "1245px" }}>
                            <TableHead sx={{ height: "7vh" }}>
                              <TableRow>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16 }} rowSpan={2} width={50}>
                                  ลำดับ
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 280 }} rowSpan={2}>
                                  ตำแหน่ง
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 900 }} colSpan={8}>
                                  สิทธิ์
                                </TablecellSetting>
                                <TablecellSetting rowSpan={2} width={50} sx={{ textAlign: "center", position: 'sticky', zIndex: 3, right: 0, }}>
                                  <IconButtonInfo onClick={() => setInsertPositions(false)}>
                                    <AddBoxIcon />
                                  </IconButtonInfo>
                                </TablecellSetting>
                              </TableRow>
                              <TableRow>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  ข้อมูลทั่วไป
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  ปฎิบัติงาน
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  ชำระเงิน
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  รายงาน
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  รถใหญ่
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  รถเล็ก
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  หน้าลาน
                                </TablecellSetting>
                                <TablecellSetting sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                  พขร.
                                </TablecellSetting>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {
                                positionsDetail.map((row, index) => (
                                  <TableRow>
                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      {
                                        !updatePosition && checkIndex === index ?
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth
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
                                            />
                                          </Paper>
                                          :
                                          row.Name
                                      }
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {
                                          !updatePosition && checkIndex === index ?
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={checkBasicData}
                                                  onChange={() => setCheckBasicData(!checkBasicData)}
                                                  size="small"
                                                />
                                              }
                                            />
                                            :
                                            (row.BasicData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)

                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {
                                          !updatePosition && checkIndex === index ?
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={checkOrperationData}
                                                  onChange={() => setCheckOprerationData(!checkOrperationData)}
                                                  size="small"
                                                />
                                              }
                                            />
                                            :
                                            (row.OprerationData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)
                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {
                                          !updatePosition && checkIndex === index ?
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={checkFinancialData}
                                                  onChange={() => setCheckFinancialData(!checkFinancialData)}
                                                  size="small"
                                                />
                                              }
                                            />
                                            :
                                            (row.FinancialData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)

                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {
                                          !updatePosition && checkIndex === index ?
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={checkReportData}
                                                  onChange={() => setCheckReportData(!checkReportData)}
                                                  size="small"
                                                />
                                              }
                                            />
                                            :
                                            (row.ReportData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)

                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {
                                          !updatePosition && checkIndex === index ?
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={checkBigTruckData}
                                                  onChange={() => setCheckBigTruckData(!checkBigTruckData)}
                                                  size="small"
                                                />
                                              }
                                            />
                                            :
                                            (row.BigTruckData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)

                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {
                                          !updatePosition && checkIndex === index ?
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={checkSmallTruckData}
                                                  onChange={() => setCheckSmallTruckData(!checkSmallTruckData)}
                                                  size="small"
                                                />
                                              }
                                            />
                                            :
                                            (row.SmallTruckData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)

                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {
                                          !updatePosition && checkIndex === index ?
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={checkGasStationData}
                                                  onChange={() => setCheckGasStationData(!checkGasStationData)}
                                                  size="small"
                                                />
                                              }
                                            />
                                            :
                                            (row.GasStationData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)

                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Box display="flex" justifyContent="center" alignItems="center">
                                        {!updatePosition && checkIndex === index ?
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                checked={checkDriverData}
                                                onChange={() => setCheckDriverData(!checkDriverData)}
                                                size="small"
                                              />
                                            }
                                          />
                                          :
                                          (row.DriverData === 0 ? <CloseIcon color="error" /> : <DoneIcon color="success" />)

                                        }
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", position: 'sticky', right: 0, backgroundColor: "white" }}>
                                      {
                                        !updatePosition && checkIndex === index ?
                                          <Box>
                                            <Button
                                              variant="contained"
                                              color="success"
                                              size="small"
                                              fullWidth
                                              sx={{ height: 20, marginBottom: 0.5 }}
                                              onClick={handleSavePosition}
                                            >
                                              บันทึก
                                            </Button>
                                            <Button
                                              variant="contained"
                                              color="error"
                                              size="small"
                                              fullWidth
                                              sx={{ height: 20 }}
                                              onClick={() => setUpdatePosition(true)}
                                            >
                                              ยกเลิก
                                            </Button>
                                          </Box>
                                          :
                                          <Button
                                            variant="contained"
                                            color="warning"
                                            size="small"
                                            fullWidth
                                            onClick={() => handleUpdate(index, row.id, row.Name, row.BasicData, row.OprerationData, row.FinancialData, row.ReportData, row.BigTruckData, row.SmallTruckData, row.GasStationData, row.DriverData)}
                                          >
                                            แก้ไข
                                          </Button>
                                      }
                                    </TableCell>
                                  </TableRow>
                                ))
                              }
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>

                  </Paper>
            }
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Setting;
