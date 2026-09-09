import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BackupIcon from "@mui/icons-material/Backup";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  ShowConfirm,
  ShowError,
  ShowInfo,
  ShowSuccess,
  ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import SummarizeIcon from '@mui/icons-material/Summarize';
import Cookies from 'js-cookie';
import UpdateDatabase from "../dashboard/test";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { apiPost } from "../../server/apiClient";

// One shared visual style for every main-navigation destination card -
// icon + label, brand-colored, same footprint - so the grid re-centers
// cleanly no matter how many of them a given user's permissions show,
// instead of the old fixed xs/sm split with manual empty spacer Grids.
const NavCard = ({ icon, label, color, onClick }) => (
  <Button
    variant="contained"
    color={color}
    fullWidth
    onClick={onClick}
    sx={{
      height: "18vh",
      minHeight: 160,
      borderRadius: 4,
      fontSize: 22,
      fontWeight: "bold",
      boxShadow: 3,
      transition: "transform 0.15s ease",
      "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
    }}
    startIcon={React.cloneElement(icon, { sx: { width: 56, height: 56 } })}
  >
    {label}
  </Button>
);

const Choose = () => {
  const navigate = useNavigate();
  const { positions, officers, drivers, creditors, refetch } = useBasicData();
  const creditorsDetail = Object.values(creditors || {});
  const driversDetail = Object.values(drivers || {});
  const officersDetail = Object.values(officers || {});
  const positionsDetail = Object.values(positions || {});

  const [showDriver, setShowDriver] = useState(false);
  const [showGasStation, setShowGasStation] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showQuotation, setShowQuotation] = useState(true);

  const [showAdmin, setShowAdmin] = useState(false);
  const [showBasic, setShowBasic] = useState(false);
  const [showOperation, setShowOperation] = useState(false);
  const [showFinancial, setShowFinancial] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSmallTruck, setShowSmallTruck] = useState(false);

  const [userName, setUserName] = useState("");

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [importingIncremental, setImportingIncremental] = useState(false);
  const incrementalFileInputRef = useRef(null);

  // ยืนยันรหัสผ่านซ้ำก่อนเข้าหน้าสำรองข้อมูล - ป้องกันกรณีเปิดหน้านี้ทิ้งไว้บนเครื่องที่ใช้ร่วมกัน
  const [backupConfirmOpen, setBackupConfirmOpen] = useState(false);
  const [backupPassword, setBackupPassword] = useState("");
  const [showBackupPassword, setShowBackupPassword] = useState(false);
  const [verifyingBackupPassword, setVerifyingBackupPassword] = useState(false);



  const handleChooseGasStation = () => {
    window.location.href = "/gasStation-admin";
  };

  const handleChooseDashboard = () => {
    if (showBasic) {
      window.location.href = "/dashboard";
    } else if (showSmallTruck) {
      window.location.href = "/trips-smalltruck";
    } else if (showOperation) {
      window.location.href = "/trips-bigtruck";
    } else if (showFinancial) {
      window.location.href = "/invoice";
    } else if (showReport) {
      window.location.href = "/report";
    } else {
      window.location.href = "/dashboard"; // default fallback
    }
  };
  const handleChooseDriver = () => {
    window.location.href = "/driver";
  };

  const handleChooseQuotation = () => {
    window.location.href = "/quotation";
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file next time
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch (err) {
        ShowError("ไฟล์ไม่ถูกต้อง", "อ่านไฟล์ JSON ไม่สำเร็จ กรุณาตรวจสอบไฟล์อีกครั้ง");
        return;
      }

      ShowConfirm(
        `นำเข้าข้อมูลจาก "${file.name}" ใช่หรือไม่? ข้อมูลเดิมทั้งหมดในฐานข้อมูลจะถูกทับ`,
        async () => {
          setImporting(true);
          try {
            const result = await apiPost("/api/admin/import", { data });
            ShowSuccess(`นำเข้าข้อมูลสำเร็จ (${result.tables} ตาราง, ${result.totalRows} แถว)`);
            refetch?.();
          } catch (err) {
            ShowError("นำเข้าข้อมูลไม่สำเร็จ", err?.data?.error || err.message);
          } finally {
            setImporting(false);
          }
        }
      );
    };
    reader.onerror = () => {
      ShowError("อ่านไฟล์ไม่สำเร็จ", "");
    };
    reader.readAsText(file);
  };

  const handleIncrementalImportClick = () => {
    incrementalFileInputRef.current?.click();
  };

  // Unlike handleFileSelected above, this never drops or replaces anything
  // already in the database - it only inserts rows whose original Firebase
  // key isn't already present in the corresponding table, so it's safe to
  // run against a live database that already has real activity (new
  // customers, transfers, tickets) since the original one-time migration.
  const handleIncrementalFileSelected = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch (err) {
        ShowError("ไฟล์ไม่ถูกต้อง", "อ่านไฟล์ JSON ไม่สำเร็จ กรุณาตรวจสอบไฟล์อีกครั้ง");
        return;
      }

      ShowConfirm(
        `เพิ่มข้อมูลใหม่จาก "${file.name}" หรือไม่? จะเพิ่มเฉพาะแถวที่ยังไม่มีในฐานข้อมูล ข้อมูลเดิมทั้งหมดจะไม่ถูกลบหรือแก้ไข`,
        async () => {
          setImportingIncremental(true);
          try {
            const result = await apiPost("/api/admin/import-incremental", { data });
            if (result.totalNewRows === 0) {
              ShowInfo("ไม่มีข้อมูลใหม่", result.message || "ทุกแถวในไฟล์นี้มีอยู่ในฐานข้อมูลแล้ว");
            } else {
              ShowSuccess(`เพิ่มข้อมูลใหม่สำเร็จ (${result.totalNewRows} แถว)`);
              refetch?.();
            }
          } catch (err) {
            ShowError("เพิ่มข้อมูลใหม่ไม่สำเร็จ", err?.data?.error || err.message);
          } finally {
            setImportingIncremental(false);
          }
        }
      );
    };
    reader.onerror = () => {
      ShowError("อ่านไฟล์ไม่สำเร็จ", "");
    };
    reader.readAsText(file);
  };

  const handleOpenBackupConfirm = () => {
    setBackupPassword("");
    setShowBackupPassword(false);
    setBackupConfirmOpen(true);
  };

  const handleCloseBackupConfirm = () => {
    if (verifyingBackupPassword) return;
    setBackupConfirmOpen(false);
  };

  const handleConfirmBackupPassword = async () => {
    if (!backupPassword) {
      ShowError("กรุณากรอกรหัสผ่าน");
      return;
    }
    setVerifyingBackupPassword(true);
    try {
      await apiPost("/api/auth/verify-password", { password: backupPassword });
      setBackupConfirmOpen(false);
      navigate("/backup");
    } catch (err) {
      ShowError(err?.data?.error || "รหัสผ่านไม่ถูกต้อง");
    } finally {
      setVerifyingBackupPassword(false);
    }
  };

  useEffect(() => {
    const user = Cookies.get("user");
    if (!user) return;

    const allUsers = [...officersDetail, ...driversDetail, ...creditorsDetail];
    const matchedUser = allUsers.find((emp) => emp.User === user);

    if (!matchedUser || !matchedUser.Position) return;

    setUserName(matchedUser.Name || "");

    const positionId = matchedUser.Position;
    const position = positionsDetail.find((pos) => pos.uuid === positionId);
    if (!position) return;

    if (position.DriverData === 1) setShowDriver(true);
    if (position.GasStationData === 1) setShowGasStation(true);
    if (position.AdminData === 1) setShowAdmin(true);

    if (position.BasicData === 1) setShowBasic(true);
    if (position.OprerationData === 1) setShowOperation(true); // ตรวจสอบชื่อ key ให้ถูก
    if (position.FinancialData === 1) setShowFinancial(true);
    if (position.ReportData === 1) setShowReport(true);
    if (position.SmallTruckData === 1) setShowSmallTruck(true);

    const otherKeys = [
      "BasicData", "OprerationData", "FinancialData", "ReportData", "SmallTruckData", "BigTruckData"
    ];
    const hasOtherPermission = otherKeys.some((key) => position[key] === 1);
    if (hasOtherPermission) setShowDashboard(true);
  }, [officersDetail, driversDetail, creditorsDetail, positionsDetail]);

  const navCards = [
    showDashboard && {
      key: "dashboard",
      label: "หน้าหลัก",
      color: "success",
      icon: <DashboardIcon />,
      onClick: handleChooseDashboard,
    },
    showDriver && {
      key: "driver",
      label: "พนักงานขับรถ",
      color: "info",
      icon: <DriveEtaIcon />,
      onClick: handleChooseDriver,
    },
    showQuotation && {
      key: "quotation",
      label: "ใบเสนอราคาลูกค้า",
      color: "warning",
      icon: <SummarizeIcon />,
      onClick: handleChooseQuotation,
    },
  ].filter(Boolean);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F4F6F9", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Stack alignItems="center" spacing={1} sx={{ mb: 5 }}>
          <Avatar
            src={Logo}
            alt="PandaStar Oil"
            sx={{ width: 88, height: 88, boxShadow: 3, border: `3px solid ${theme.palette.panda.main}` }}
          />
          <Typography variant="h4" fontWeight="bold" color={theme.palette.panda.main} textAlign="center">
            กรุณาเลือกหน้าที่ต้องการ
          </Typography>
          {userName && (
            <Typography variant="subtitle1" color="text.secondary">
              ยินดีต้อนรับ, {userName}
            </Typography>
          )}
        </Stack>

        <Grid container spacing={3} justifyContent="center">
          {navCards.map((card) => (
            <Grid item xs={12} sm={6} key={card.key}>
              <NavCard icon={card.icon} label={card.label} color={card.color} onClick={card.onClick} />
            </Grid>
          ))}
        </Grid>

        {showAdmin && (
          <Box sx={{ mt: 6 }}>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                เครื่องมือผู้ดูแลระบบ
              </Typography>
            </Divider>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 4,
                borderLeft: `5px solid ${theme.palette.panda.light}`,
                backgroundColor: "#FFF9F3",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2.5 }}>
                <WarningAmberIcon color="warning" />
                <Typography variant="body2" color="text.secondary">
                  ใช้สำหรับนำเข้าข้อมูลจากไฟล์ Firebase export เท่านั้น กรุณาตรวจสอบไฟล์ให้ถูกต้องก่อนดำเนินการทุกครั้ง
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <input
                    type="file"
                    accept="application/json,.json"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileSelected}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={importing}
                    onClick={handleImportClick}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: "bold", justifyContent: "flex-start", textAlign: "left" }}
                    startIcon={importing ? <CircularProgress color="inherit" size={22} /> : <UploadFileIcon />}
                  >
                    {importing ? "กำลังนำเข้าข้อมูล..." : "นำเข้าข้อมูล JSON (ทับข้อมูลเดิมทั้งหมด)"}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <input
                    type="file"
                    accept="application/json,.json"
                    ref={incrementalFileInputRef}
                    style={{ display: "none" }}
                    onChange={handleIncrementalFileSelected}
                  />
                  <Button
                    variant="outlined"
                    color="info"
                    fullWidth
                    disabled={importingIncremental}
                    onClick={handleIncrementalImportClick}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: "bold", justifyContent: "flex-start", textAlign: "left" }}
                    startIcon={
                      importingIncremental ? <CircularProgress color="inherit" size={22} /> : <AddCircleOutlineIcon />
                    }
                  >
                    {importingIncremental ? "กำลังเพิ่มข้อมูล..." : "เพิ่มข้อมูลใหม่ (ไม่ลบของเดิม)"}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    onClick={handleOpenBackupConfirm}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: "bold", justifyContent: "flex-start", textAlign: "left" }}
                    startIcon={<BackupIcon />}
                  >
                    สำรองข้อมูล
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        <Dialog open={backupConfirmOpen} onClose={handleCloseBackupConfirm} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockIcon color="warning" />
            ยืนยันรหัสผ่านก่อนเข้าหน้าสำรองข้อมูล
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              เพื่อความปลอดภัย กรุณากรอกรหัสผ่านของคุณอีกครั้งก่อนเข้าหน้าสำรอง/ดาวน์โหลดข้อมูล
            </Typography>
            <TextField
              autoFocus
              fullWidth
              size="small"
              type={showBackupPassword ? "text" : "password"}
              label="รหัสผ่าน"
              value={backupPassword}
              onChange={(e) => setBackupPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmBackupPassword();
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowBackupPassword((v) => !v)} edge="end">
                      {showBackupPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseBackupConfirm} disabled={verifyingBackupPassword}>
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmBackupPassword}
              disabled={verifyingBackupPassword}
              startIcon={verifyingBackupPassword ? <CircularProgress color="inherit" size={16} /> : null}
            >
              ยืนยัน
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Choose;
