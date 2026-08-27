import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
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
import {
  ShowError,
  ShowInfo,
  ShowSuccess,
  ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, database, googleProvider } from "../../server/firebase";
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import SummarizeIcon from '@mui/icons-material/Summarize';
import Cookies from 'js-cookie';
import UpdateDatabase from "../dashboard/test";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const Choose = () => {
  const navigate = useNavigate();
  const { positions, officers, drivers, creditors } = useBasicData();
  const creditorsDetail = Object.values(creditors || {});
  const driversDetail = Object.values(drivers || {});
  const officersDetail = Object.values(officers || {});
  const positionsDetail = Object.values(positions || {});

  const [showDriver, setShowDriver] = useState(false);
  const [showGasStation, setShowGasStation] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showQuotation, setShowQuotation] = useState(true);

  const [showBasic, setShowBasic] = useState(false);
  const [showOperation, setShowOperation] = useState(false);
  const [showFinancial, setShowFinancial] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSmallTruck, setShowSmallTruck] = useState(false);



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

  useEffect(() => {
    const user = Cookies.get("user");
    if (!user) return;

    const allUsers = [...officersDetail, ...driversDetail, ...creditorsDetail];
    const matchedUser = allUsers.find((emp) => emp.User === user);

    if (!matchedUser || !matchedUser.Position) return;

    const positionId = Number(matchedUser.Position.split(":")[0]);
    const position = positionsDetail.find((pos) => pos.id === positionId);
    if (!position) return;

    if (position.DriverData === 1) setShowDriver(true);
    if (position.GasStationData === 1) setShowGasStation(true);

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
        <Grid item xs={12} sm={3}></Grid>
      </Grid>
    </Container>
  );
};

export default Choose;
