import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  ShowConfirm,
  ShowError,
  ShowInfo,
  ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import Cookies from 'js-cookie';
import { apiGet, apiPost } from "../../server/apiClient";
import { useBasicData } from "../../server/provider/BasicDataProvider";

// Same shape as the identical helper in Choose.js - kept as a local
// duplicate rather than a shared import since it's this small and the two
// import flows (post-login vs. pre-login bootstrap) are deliberately kept
// independent.
const buildImportIssuesList = (result) => {
  const issues = [...(result.warnings || [])];
  for (const fk of result.fkReferencesNotResolved || []) {
    issues.push(`เชื่อมข้อมูลไม่สำเร็จ ${fk.unresolvedRefs} รายการที่ "${fk.field}" (ไม่พบแถวปลายทางที่อ้างอิงถึง)`);
  }
  return issues;
};

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const { refetch: refetchBasicData } = useBasicData();

  // Bootstrap import (login-page JSON import for a brand-new, empty
  // database) - only offered while the DB genuinely has no account yet;
  // self-hides the moment that's no longer true.
  const [showBootstrapImport, setShowBootstrapImport] = useState(false);
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [bootstrapFile, setBootstrapFile] = useState(null);
  const [bootstrapCode, setBootstrapCode] = useState("");
  const [showBootstrapCode, setShowBootstrapCode] = useState(false);
  const [bootstrapSubmitting, setBootstrapSubmitting] = useState(false);
  const bootstrapFileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    apiGet("/api/bootstrap-import/status")
      .then((res) => {
        if (mounted) setShowBootstrapImport(!!res?.available);
      })
      .catch(() => {
        if (mounted) setShowBootstrapImport(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenBootstrapDialog = () => {
    setBootstrapFile(null);
    setBootstrapCode("");
    setShowBootstrapCode(false);
    setBootstrapOpen(true);
  };

  const handleCloseBootstrapDialog = () => {
    if (bootstrapSubmitting) return;
    setBootstrapOpen(false);
  };

  const handleBootstrapFileChange = (event) => {
    setBootstrapFile(event.target.files?.[0] || null);
    event.target.value = "";
  };

  const handleBootstrapSubmit = () => {
    if (!bootstrapFile) {
      ShowError("กรุณาเลือกไฟล์ JSON");
      return;
    }
    if (!bootstrapCode) {
      ShowError("กรุณากรอกรหัสผ่าน");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch {
        ShowError("ไฟล์ไม่ถูกต้อง", "อ่านไฟล์ JSON ไม่สำเร็จ กรุณาตรวจสอบไฟล์อีกครั้ง");
        return;
      }

      ShowConfirm(
        `นำเข้าข้อมูลจาก "${bootstrapFile.name}" เพื่อสร้างฐานข้อมูลเริ่มต้นใช่หรือไม่?`,
        async () => {
          setBootstrapSubmitting(true);
          try {
            const result = await apiPost("/api/bootstrap-import", { code: bootstrapCode, data });
            const issues = buildImportIssuesList(result);
            if (issues.length) {
              ShowWarning(
                `นำเข้าข้อมูลสำเร็จ (${result.tables} ตาราง, ${result.totalRows} แถว) แต่พบข้อควรตรวจสอบ`,
                <ul style={{ textAlign: "left", margin: 0, paddingLeft: 18 }}>
                  {issues.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              );
            } else {
              ShowInfo(
                `นำเข้าข้อมูลสำเร็จ (${result.tables} ตาราง, ${result.totalRows} แถว)`,
                "กรุณาเข้าสู่ระบบด้วยบัญชีจากข้อมูลที่นำเข้า"
              );
            }
            setBootstrapOpen(false);
            setShowBootstrapImport(false);
          } catch (err) {
            ShowError("นำเข้าข้อมูลไม่สำเร็จ", err?.data?.error || err.message);
          } finally {
            setBootstrapSubmitting(false);
          }
        }
      );
    };
    reader.onerror = () => {
      ShowError("อ่านไฟล์ไม่สำเร็จ", "");
    };
    reader.readAsText(bootstrapFile);
  };

  const loginUser = async (event) => {
    event.preventDefault();

    if (!user || !password) {
      ShowWarning("กรุณากรอก User และ Password");
      return;
    }

    try {
      const { token, user: matchedUser, accessRights } = await apiPost("/api/auth/login", {
        user,
        password,
      });

      Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
      Cookies.set("sessionToken", `${user}$${matchedUser.id}`, { expires: 30, secure: true, sameSite: "Lax" });
      Cookies.set("token", token, { expires: 30, secure: true, sameSite: "Lax" });

      // /api/basic-data requires auth now - the pre-login poll(s) 401'd
      // silently, so kick off a fresh authenticated fetch immediately instead
      // of waiting up to POLL_INTERVAL_MS for the next automatic one.
      refetchBasicData();

      if (accessRights.length === 1 && accessRights[0] === "DriverData") {
        navigate("/driver-detail", { state: { Employee: matchedUser } });
      } else if (accessRights.length === 1 && accessRights[0] === "GasStationData") {
        navigate("/gasstation-attendant", { state: { Employee: matchedUser } });
      } else {
        navigate("/choose", { state: { Employee: matchedUser } });
      }

    } catch (error) {
      console.error("Login Error:", error);
      ShowError(error?.data?.error || "User หรือ Password ไม่ถูกต้อง");
    }
  };

  return (
    <Container sx={{ p: { xs: 3, sm: 6, md: 9 }, maxWidth: { xs: "lg", sm: "md", md: "sm" } }}>
      <Paper
        sx={{
          borderRadius: 5,
          boxShadow: "1px 1px 2px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          height={50}
          sx={{
            backgroundColor: theme.palette.panda.main,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        />
        <Box sx={{
          p: { xs: 3, sm: 4, md: 5 },
          marginTop: { xs: -2, sm: -3, md: -4 },
          marginBottom: { xs: -1, sm: -2, md: -3 },
        }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.panda.main}
            gutterBottom
          >
            ยินดีต้อนรับเข้าสู่ระบบ
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginTop={-1}
          >
            <img src={Logo} width="150" />
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginLeft={-4.7}
              marginTop={3.7}
            >
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.error.main}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                S
              </Typography>
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.warning.light}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                C
              </Typography>
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.info.dark}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                D
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2} marginTop={-2} component="form"
            onSubmit={loginUser}>
            <Grid item xs={12}>
              <TextField
                label="User"
                size="small"
                type="user"
                variant="filled"
                fullWidth
                defaultValue={user}
                onChange={(e) => setUser(e.target.value)}
                sx={{ backgroundColor: theme.palette.primary.contrastText }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                size="small"
                type="password"
                variant="filled"
                fullWidth
                defaultValue={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ backgroundColor: theme.palette.primary.contrastText }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Button variant="contained" color="info" type="submit">
                เข้าสู่ระบบ
              </Button>
            </Grid>
            {showBootstrapImport && (
              <Grid item xs={12} textAlign="center">
                <Button
                  variant="text"
                  color="inherit"
                  size="small"
                  startIcon={<UploadFileIcon fontSize="small" />}
                  onClick={handleOpenBootstrapDialog}
                >
                  นำเข้าข้อมูลเริ่มต้นระบบ (ติดตั้งใหม่)
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
        <Box
          height={50}
          sx={{
            backgroundColor: theme.palette.panda.light,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />
      </Paper>
      <Dialog open={bootstrapOpen} onClose={handleCloseBootstrapDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockIcon color="warning" />
          นำเข้าข้อมูลเริ่มต้นระบบ
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ใช้สำหรับติดตั้งระบบใหม่บนฐานข้อมูลที่ยังไม่มีข้อมูลเท่านั้น จะสร้างตารางและนำเข้าข้อมูลจากไฟล์ Firebase export ทั้งหมด
          </Typography>
          <input
            type="file"
            accept="application/json,.json"
            ref={bootstrapFileInputRef}
            style={{ display: "none" }}
            onChange={handleBootstrapFileChange}
          />
          <Button
            variant="outlined"
            fullWidth
            startIcon={<UploadFileIcon />}
            onClick={() => bootstrapFileInputRef.current?.click()}
            sx={{ mb: 2 }}
          >
            {bootstrapFile ? bootstrapFile.name : "เลือกไฟล์ JSON"}
          </Button>
          <TextField
            autoFocus
            fullWidth
            size="small"
            type={showBootstrapCode ? "text" : "password"}
            label="รหัสผ่าน"
            value={bootstrapCode}
            onChange={(e) => setBootstrapCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleBootstrapSubmit();
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowBootstrapCode((v) => !v)} edge="end">
                    {showBootstrapCode ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseBootstrapDialog} disabled={bootstrapSubmitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBootstrapSubmit}
            disabled={bootstrapSubmitting || !bootstrapFile || !bootstrapCode}
            startIcon={bootstrapSubmitting ? <CircularProgress color="inherit" size={16} /> : null}
          >
            นำเข้าข้อมูล
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
