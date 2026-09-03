import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
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

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [importingIncremental, setImportingIncremental] = useState(false);
  const incrementalFileInputRef = useRef(null);



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

  useEffect(() => {
    const user = Cookies.get("user");
    if (!user) return;

    const allUsers = [...officersDetail, ...driversDetail, ...creditorsDetail];
    const matchedUser = allUsers.find((emp) => emp.User === user);

    if (!matchedUser || !matchedUser.Position) return;

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

  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Email และ Password
  return (
    <Container sx={{ p: { xs: 2, sm: 3 }, maxWidth: { xs: "lg", sm: "md" } }}>
      <Grid container spacing={5} sx={{ marginTop: { xs: 2, sm: 4, md: 10 } }}>
        <Grid item xs={12}>
          <Typography variant="h3" fontWeight="bold" textAlign="center">กรุณาเลือกหน้าที่ต้องการ</Typography>
        </Grid>
        {/* {
          showGasStation && (
            <Grid item xs={12} sm={6}>
              <Button variant="contained"
                color="error"
                fullWidth
                sx={{ height: "20vh", borderRadius: 5, fontSize: 26, fontWeight: "bold" }}
                onClick={handleChooseGasStation}
                startIcon={
                  <LocalGasStationIcon
                    sx={{
                      width: 80,  // ความกว้างที่ต้องการ
                      height: 80, // ความสูงที่ต้องการ
                    }}
                  />
                }
              >
                ทดสอบหน้าลาน
              </Button>
            </Grid>
          )
        } */}

        {
          showDashboard && (
            <Grid item xs={12} sm={6}>
              <Button variant="contained"
                color="success"
                fullWidth
                sx={{ height: "20vh", borderRadius: 5, fontSize: 26, fontWeight: "bold" }}
                onClick={handleChooseDashboard}
                startIcon={
                  <DashboardIcon
                    sx={{
                      width: 80,  // ความกว้างที่ต้องการ
                      height: 80, // ความสูงที่ต้องการ
                    }}
                  />
                }>
                หน้าหลัก
              </Button>
            </Grid>
          )}
        {
          showDriver && (
            <Grid item xs={12} sm={6}>
              <Button variant="contained"
                color="info"
                fullWidth
                sx={{ height: "20vh", borderRadius: 5, fontSize: 26, fontWeight: "bold" }}
                onClick={handleChooseDriver}
                startIcon={
                  <DriveEtaIcon
                    sx={{
                      width: 80,  // ความกว้างที่ต้องการ
                      height: 80, // ความสูงที่ต้องการ
                    }}
                  />
                }>
                พนักงานขับรถ
              </Button>
            </Grid>
          )}
        <Grid item xs={12} sm={3}></Grid>
        {
          showQuotation &&
          <Grid item xs={12} sm={6}>
            <Button variant="contained"
              color="warning"
              fullWidth
              sx={{ height: "20vh", borderRadius: 5, fontSize: 26, fontWeight: "bold" }}
              onClick={handleChooseQuotation}
              startIcon={
                <SummarizeIcon
                  sx={{
                    width: 80,  // ความกว้างที่ต้องการ
                    height: 80, // ความสูงที่ต้องการ
                  }}
                />
              }>
              ใบเสนอราคาลูกค้า
            </Button>
          </Grid>
        }
        {
          showAdmin && (
            <Grid item xs={12} sm={6}>
              <input
                type="file"
                accept="application/json,.json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelected}
              />
              <Button variant="contained"
                color="secondary"
                fullWidth
                disabled={importing}
                sx={{ height: "20vh", borderRadius: 5, fontSize: 26, fontWeight: "bold" }}
                onClick={handleImportClick}
                startIcon={
                  importing ? (
                    <CircularProgress color="inherit" size={40} />
                  ) : (
                    <UploadFileIcon sx={{ width: 80, height: 80 }} />
                  )
                }>
                {importing ? "กำลังนำเข้าข้อมูล..." : "นำเข้าข้อมูล JSON (ทับข้อมูลเดิมทั้งหมด)"}
              </Button>
            </Grid>
          )
        }
        {
          showAdmin && (
            <Grid item xs={12} sm={6}>
              <input
                type="file"
                accept="application/json,.json"
                ref={incrementalFileInputRef}
                style={{ display: "none" }}
                onChange={handleIncrementalFileSelected}
              />
              <Button variant="contained"
                color="info"
                fullWidth
                disabled={importingIncremental}
                sx={{ height: "20vh", borderRadius: 5, fontSize: 26, fontWeight: "bold" }}
                onClick={handleIncrementalImportClick}
                startIcon={
                  importingIncremental ? (
                    <CircularProgress color="inherit" size={40} />
                  ) : (
                    <UploadFileIcon sx={{ width: 80, height: 80 }} />
                  )
                }>
                {importingIncremental ? "กำลังเพิ่มข้อมูล..." : "เพิ่มข้อมูลใหม่ (ไม่ลบของเดิม)"}
              </Button>
            </Grid>
          )
        }
      </Grid>
    </Container>
  );
};

export default Choose;
