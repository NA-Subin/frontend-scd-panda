import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Popover,
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
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import HailIcon from "@mui/icons-material/Hail";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import EmojiTransportationIcon from "@mui/icons-material/EmojiTransportation";
import CarRentalIcon from "@mui/icons-material/CarRental";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BentoIcon from "@mui/icons-material/Bento";
import CommuteIcon from "@mui/icons-material/Commute";
import HandymanIcon from "@mui/icons-material/Handyman";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SmallTruck from "./smalltruck/SmallTruck";
import InsertTruck from "./InsertTruck";
import BigTruckRegHead from "./headtruck/BigTruckRegHead";
import BigTruckRegTail from "./tailtruck/BigTruckRegTail";
import {
  SmallTruckIconBlack,
  SmallTruckIconWhite,
  TailTruckIconBlack,
  TailTruckIconWhite,
  TruckIconBlack,
  TruckIconWhite,
} from "../../theme/icon";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import RepairDetail from "./RepairDetail";

const Trucks = ({ openNavbar }) => {
  const [open, setOpen] = useState(1);
  const [openTab, setOpenTab] = React.useState(true);
  const [openMenu, setOpenMenu] = React.useState(1);
  const [loading, setLoading] = useState(true);

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  const { reghead, regtail, small } = useBasicData();
  const datareghead = Object.values(reghead || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const dataregtail = Object.values(regtail || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const datasmall = Object.values(small || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      let width = window.innerWidth;
      if (!openNavbar) {
        width += 120; // ✅ เพิ่ม 200 ถ้า openNavbar = false
      }
      setWindowWidth(width);
    };

    // เรียกครั้งแรกตอน mount
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

  const [repair, setRepair] = React.useState(false);

  const repairRegHead = datareghead.filter(
    (row) =>
      row.RepairTruck &&
      row.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ",
  );
  const status = dataregtail.filter(
    (row) => row.Status && row.Status !== "เชื่อมทะเบียนหัวแล้ว",
  );
  const repairSmallTruck = datasmall.filter(
    (row) =>
      row.RepairTruck &&
      row.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ",
  );

  //   const repairRegHead = useMemo(() => {
  //     return Object.entries(reghead).filter(([id, emp]) => emp.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ");
  // }, [reghead]);

  // const status = useMemo(() => {
  //   return Object.entries(regtail).filter(([id, emp]) => emp.Status !== "เชื่อมทะเบียนหัวแล้ว");
  // }, [regtail]);

  // const repairSmallTruck = useMemo(() => {
  //   return Object.entries(small).filter(([id, emp]) => emp.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ");
  // }, [small]);

  return (
    <Container
      maxWidth="xl"
      sx={{
        marginTop: 13,
        marginBottom: 5,
        width:
          windowWidth <= 900 && windowWidth > 600
            ? windowWidth - 95
            : windowWidth <= 600
              ? windowWidth
              : windowWidth - 230,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        {repair === false
          ? openMenu === 1
            ? "รถใหญ่"
            : openMenu === 2
              ? "หางรถ"
              : openMenu === 3
                ? "รถเล็ก"
                : ""
          : "รายการตรวจสอบสภาพรถ"}
      </Typography>
      <Divider />
      <Box textAlign="right" marginTop={-8}>
        {repair === false ? (
          <Button
            variant="contained"
            color="warning"
            endIcon={<HandymanIcon />}
            onClick={() => setRepair(true)}
          >
            รายการตรวจสอบสภาพรถ
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            endIcon={<ReplyAllIcon />}
            onClick={() => setRepair(false)}
          >
            ย้อนกลับ
          </Button>
        )}
      </Box>
      {repair === false ? (
        <>
          <Grid
            container
            spacing={5}
            marginTop={0.5}
            marginBottom={2}
            sx={{ width: "100%" }}
          >
            <Grid
              item
              xs={openMenu === 1 ? 6 : 3}
              sm={openMenu === 1 ? 8 : 2}
              lg={openMenu === 1 ? 10 : 1}
            >
              <Tooltip title="รถใหญ่" placement="top">
                <Button
                  variant="contained"
                  color={openMenu === 1 ? "info" : "inherit"}
                  fullWidth
                  onClick={() => setOpenMenu(1)}
                  sx={{
                    height: "10vh",
                    fontSize: openMenu === 1 ? 40 : 16,
                    paddingLeft: openMenu === 1 ? 0 : 3.5,
                  }}
                  startIcon={
                    openMenu === 1 ? <TruckIconWhite /> : <TruckIconBlack />
                  }
                >
                  <Badge
                    badgeContent={datareghead.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 20, // ขนาดตัวเลขใน Badge
                        minWidth: 30, // ความกว้างของ Badge
                        height: 30, // ความสูงของ Badge
                        top: openMenu === 1 ? 35 : -40,
                        right: openMenu === 1 ? -30 : -5,
                        color:
                          openMenu === 1 ? theme.palette.info.main : "white",
                        backgroundColor:
                          openMenu === 1 ? "white" : theme.palette.info.main,
                        fontWeight: "bold",
                      },
                      fontWeight: "bold",
                    }}
                  >
                    {openMenu === 1 ? "รถใหญ่" : ""}
                  </Badge>
                </Button>
                {openMenu === 1 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ border: "1px solid lightgray", marginTop: 2 }}
                  />
                )}
              </Tooltip>
            </Grid>
            <Grid
              item
              xs={openMenu === 2 ? 6 : 3}
              sm={openMenu === 2 ? 8 : 2}
              lg={openMenu === 2 ? 10 : 1}
            >
              <Tooltip title="หางรถ" placement="top">
                <Button
                  variant="contained"
                  color={openMenu === 2 ? "info" : "inherit"}
                  fullWidth
                  onClick={() => setOpenMenu(2)}
                  sx={{
                    height: "10vh",
                    fontSize: openMenu === 2 ? 40 : 16,
                    paddingLeft: openMenu === 2 ? 0 : 3.5,
                  }}
                  startIcon={
                    openMenu === 2 ? (
                      <TailTruckIconWhite />
                    ) : (
                      <TailTruckIconBlack />
                    )
                  }
                >
                  <Badge
                    badgeContent={dataregtail.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 20, // ขนาดตัวเลขใน Badge
                        minWidth: 30, // ความกว้างของ Badge
                        height: 30, // ความสูงของ Badge
                        top: openMenu === 2 ? 35 : -40,
                        right: openMenu === 2 ? -30 : -5,
                        color:
                          openMenu === 2 ? theme.palette.info.main : "white",
                        backgroundColor:
                          openMenu === 2 ? "white" : theme.palette.info.main,
                        fontWeight: "bold",
                      },
                      fontWeight: "bold",
                    }}
                  >
                    {openMenu === 2 ? "หางรถ" : ""}
                  </Badge>
                </Button>
                {openMenu === 2 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ border: "1px solid lightgray", marginTop: 2 }}
                  />
                )}
              </Tooltip>
            </Grid>
            <Grid
              item
              xs={openMenu === 3 ? 6 : 3}
              sm={openMenu === 3 ? 8 : 2}
              lg={openMenu === 3 ? 10 : 1}
            >
              <Tooltip title="รถเล็ก" placement="top">
                <Button
                  variant="contained"
                  color={openMenu === 3 ? "info" : "inherit"}
                  fullWidth
                  onClick={() => setOpenMenu(3)}
                  sx={{
                    height: "10vh",
                    fontSize: openMenu === 3 ? 40 : 16,
                    paddingLeft: openMenu === 3 ? 0 : 3.5,
                  }}
                  startIcon={
                    openMenu === 3 ? (
                      <SmallTruckIconWhite />
                    ) : (
                      <SmallTruckIconBlack />
                    )
                  }
                >
                  <Badge
                    badgeContent={datasmall.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 20, // ขนาดตัวเลขใน Badge
                        minWidth: 30, // ความกว้างของ Badge
                        height: 30, // ความสูงของ Badge
                        top: openMenu === 3 ? 35 : -40,
                        right: openMenu === 3 ? -30 : -5,
                        color:
                          openMenu === 3 ? theme.palette.info.main : "white",
                        backgroundColor:
                          openMenu === 3 ? "white" : theme.palette.info.main,
                        fontWeight: "bold",
                      },
                      fontWeight: "bold",
                    }}
                  >
                    {openMenu === 3 ? "รถเล็ก" : ""}
                  </Badge>
                </Button>
                {openMenu === 3 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ border: "1px solid lightgray", marginTop: 2 }}
                  />
                )}
              </Tooltip>
            </Grid>
            <Grid item xs={12} marginBottom={-7}>
              <InsertTruck openMenu={openMenu} />
            </Grid>
            <Grid item xs={12}>
              {openMenu === 1 ? (
                <BigTruckRegHead repair={repairRegHead} loading={loading} />
              ) : openMenu === 2 ? (
                <BigTruckRegTail status={status} />
              ) : (
                <SmallTruck repair={repairSmallTruck} />
              )}
            </Grid>
          </Grid>
        </>
      ) : (
        // <RepairTruck />
        <RepairDetail />
      )}
    </Container>
  );
};

export default Trucks;
