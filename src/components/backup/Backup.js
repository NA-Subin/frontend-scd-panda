import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
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
import BackupIcon from "@mui/icons-material/Backup";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Inventory } from "@mui/icons-material";
import theme from "../../theme/theme";
import { TablecellHeader, TablecellNoData } from "../../theme/style";
import { apiGet, apiPost, apiDelete, apiDownload } from "../../server/apiClient";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [error, setError] = useState(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet("/api/admin/backups");
      setBackups(data?.backups || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleRunBackup = async () => {
    setRunning(true);
    try {
      await apiPost("/api/admin/backups");
      ShowSuccess("สำรองข้อมูลสำเร็จ");
      refetch();
    } catch (err) {
      ShowError(err?.data?.error || "สำรองข้อมูลไม่สำเร็จ");
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = async (filename) => {
    setDownloadingFile(filename);
    try {
      await apiDownload(`/api/admin/backups/${encodeURIComponent(filename)}`, filename);
    } catch (err) {
      ShowError(err?.data?.error || "ดาวน์โหลดไม่สำเร็จ");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDelete = (filename) => {
    ShowConfirm(
      `ต้องการลบไฟล์สำรอง ${filename} ใช่หรือไม่`,
      async () => {
        try {
          await apiDelete(`/api/admin/backups/${encodeURIComponent(filename)}`);
          ShowSuccess("ลบไฟล์สำรองสำเร็จ");
          refetch();
        } catch (err) {
          ShowError(err?.data?.error || "ลบไฟล์สำรองไม่สำเร็จ");
        }
      },
      () => {}
    );
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      ShowError("กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่");
      return;
    }
    if (newPassword !== confirmPassword) {
      ShowError("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setChangingPassword(true);
    try {
      await apiPost("/api/admin/backup-access/reset", { oldPassword, newPassword });
      ShowSuccess("เปลี่ยนรหัสผ่านสำหรับหน้านี้สำเร็จ");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    } catch (err) {
      ShowError(err?.data?.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setChangingPassword(false);
    }
  };

  const isForbidden = error?.status === 403;

  return (
    <Container maxWidth="lg" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
        สำรองข้อมูล
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
        สำรองฐานข้อมูลอัตโนมัติทุกวัน เวลา 01:00 น. และเก็บไฟล์สำรองไว้ 30 วันล่าสุดเท่านั้น
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {isForbidden ? (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="subtitle1" fontWeight="bold" color="error">
            ต้องมีสิทธิ์ผู้ดูแลระบบ (admin) จึงจะเข้าถึงหน้านี้ได้
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 4,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              borderLeft: `5px solid ${theme.palette.panda.main}`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <InfoOutlinedIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                ไฟล์สำรองเป็น .sql (pg_dump) - สามารถดาวน์โหลดเก็บไว้ หรือใช้กู้คืนข้อมูลผ่าน psql ได้โดยตรง
              </Typography>
            </Stack>
            <Button
              variant="contained"
              color="info"
              startIcon={running ? <CircularProgress color="inherit" size={18} /> : <BackupIcon />}
              disabled={running}
              onClick={handleRunBackup}
              sx={{ borderRadius: 3, fontWeight: "bold", whiteSpace: "nowrap" }}
            >
              {running ? "กำลังสำรองข้อมูล..." : "สำรองข้อมูลเดี๋ยวนี้"}
            </Button>
          </Paper>

          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TablecellHeader width={60} sx={{ textAlign: "center" }}>
                    ลำดับ
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "left" }}>ชื่อไฟล์</TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center" }} width={120}>
                    ขนาดไฟล์
                  </TablecellHeader>
                  <TablecellHeader sx={{ textAlign: "center" }} width={220}>
                    วันที่สร้าง
                  </TablecellHeader>
                  <TablecellHeader width={180} sx={{ textAlign: "center" }}>
                    จัดการ
                  </TablecellHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : backups.length === 0 ? (
                  <TableRow>
                    <TablecellNoData colSpan={5}>
                      <Inventory fontSize="large" />
                      <br />
                      ยังไม่มีไฟล์สำรองข้อมูล
                    </TablecellNoData>
                  </TableRow>
                ) : (
                  backups.map((b, index) => (
                    <TableRow key={b.filename}>
                      <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                      <TableCell sx={{ wordBreak: "break-all" }}>{b.filename}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{formatSize(b.size)}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{formatDate(b.createdAt)}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            disabled={downloadingFile === b.filename}
                            onClick={() => handleDownload(b.filename)}
                            startIcon={
                              downloadingFile === b.filename ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : (
                                <CloudDownloadIcon fontSize="small" />
                              )
                            }
                            sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
                          >
                            ดาวน์โหลด
                          </Button>
                          <Tooltip title="ลบไฟล์สำรองนี้">
                            <IconButton size="small" onClick={() => handleDelete(b.filename)}>
                              <DeleteForeverIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<LockResetIcon />}
              onClick={() => setShowChangePassword((v) => !v)}
              sx={{ fontWeight: "bold" }}
            >
              เปลี่ยนรหัสผ่านสำหรับเข้าหน้านี้
            </Button>
            {showChangePassword && (
              <Paper variant="outlined" sx={{ p: 2.5, mt: 1, borderRadius: 3, maxWidth: 500 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  ต้องกรอกรหัสผ่านเดิมให้ถูกต้องก่อน จึงจะตั้งรหัสผ่านใหม่ได้
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="รหัสผ่านเดิม"
                      type={showPasswords ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="รหัสผ่านใหม่"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="ยืนยันรหัสผ่านใหม่"
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPasswords((v) => !v)}>
                              {showPasswords ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} textAlign="right">
                    <Button
                      variant="contained"
                      color="success"
                      disabled={changingPassword}
                      onClick={handleChangePassword}
                      startIcon={changingPassword ? <CircularProgress size={16} color="inherit" /> : null}
                      sx={{ borderRadius: 3, fontWeight: "bold" }}
                    >
                      บันทึกรหัสผ่านใหม่
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default Backup;
