import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
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
  useMediaQuery,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import theme from "../../theme/theme";
import { database } from "../../server/firebase";
import GasStationsDetail from "./gasstation/GasStationsDetail";
import StockDetail from "./stock/StockDetail";
import InsertGasStation from "./InsertGasStation";
import { useGasStationData } from "../../server/provider/GasStationProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const GasStations = ({ openNavbar }) => {
  const [openMenu, setOpenMenu] = React.useState(1);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const { depots } = useBasicData();
  const { gasstationDetail, stockDetail } = useGasStationData();

  const depot = Object.values(depots || {});
  const gasStation = Object.values(gasstationDetail || {});
  const stock = Object.values(stockDetail || {});

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

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

  // const [depot, setDepot] = useState(0);
  // const [gasStation, setGasStation] = useState(0);
  // const [stock, setStock] = React.useState([]);

  // const getDepot = async () => {
  //   database.ref("/depot/oils").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     setDepot(datas.length);
  //   });

  //   database.ref("/depot/stock").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataList = [];
  //     for (let id in datas) {
  //       dataList.push({ id, ...datas[id] });
  //     }
  //     setStock(dataList);
  //   });

  //   database.ref("/depot/gasStations").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     setGasStation(datas.length);
  //   });
  // };

  // useEffect(() => {
  //   getDepot();
  // }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        {openMenu === 1 ? "ปั้มน้ำมัน" : "คลังสต็อกน้ำมัน"}
      </Typography>
      <Box display="flex" justifyContent="right" alignItems="center" marginRight={3} marginTop={-8} marginBottom={3}>
        <InsertGasStation openMenu={openMenu} depot={depot.length} stock={stock.length} gasStation={gasStation.length} />
      </Box>
      <Divider />
      <Grid container spacing={5} marginTop={0.5} marginBottom={2}>
        <Grid item xs={openMenu === 1 ? 9 : 3} sm={openMenu === 1 ? 10 : 2} lg={openMenu === 1 ? 11 : 1}>
          <Tooltip title="ปั้มน้ำมัน" placement="top">
            {
              isMobile ?
                <Button
                  variant="contained"
                  color={openMenu === 1 ? "success" : "inherit"}
                  fullWidth
                  onClick={() => setOpenMenu(1)}
                  sx={{ height: "10vh", fontSize: openMenu === 1 ? 40 : 16, paddingLeft: openMenu === 1 ? 0 : 3.5 }}
                >
                  <Badge
                    badgeContent={gasStation.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 20, // ขนาดตัวเลขใน Badge
                        minWidth: 30, // ความกว้างของ Badge
                        height: 30, // ความสูงของ Badge
                        top: openMenu === 1 ? 35 : -10,
                        right: openMenu === 1 ? -30 : -10,
                        color: openMenu === 1 ? theme.palette.success.main : "white",
                        backgroundColor: openMenu === 1 ? "white" : theme.palette.success.main,
                        fontWeight: "bold",
                      },
                      fontWeight: "bold",
                    }}
                  >
                    <LocalGasStationIcon sx={{ width: '3em', height: '3em' }} />
                  </Badge>
                </Button>
                :
                <Button
                  variant="contained"
                  color={openMenu === 1 ? "success" : "inherit"}
                  fullWidth
                  onClick={() => setOpenMenu(1)}
                  sx={{ height: "10vh", fontSize: openMenu === 1 ? 40 : 16, paddingLeft: openMenu === 1 ? 0 : 3.5 }}
                  startIcon={
                    <LocalGasStationIcon sx={{ width: '3em', height: '3em' }} />
                  }
                >
                  <Badge
                    badgeContent={gasStation.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 20, // ขนาดตัวเลขใน Badge
                        minWidth: 30, // ความกว้างของ Badge
                        height: 30, // ความสูงของ Badge
                        top: openMenu === 1 ? 35 : -40,
                        right: openMenu === 1 ? -30 : -5,
                        color: openMenu === 1 ? theme.palette.success.main : "white",
                        backgroundColor: openMenu === 1 ? "white" : theme.palette.success.main,
                        fontWeight: "bold",
                      },
                      fontWeight: "bold",
                    }}
                  >
                    {openMenu === 1 ? "ปั้มน้ำมัน" : ""}
                  </Badge>
                </Button>
            }
            {
              openMenu === 1 && <Divider orientation="vertical" flexItem sx={{ border: "1px solid lightgray", marginTop: 2 }} />
            }
          </Tooltip>
        </Grid>
        <Grid item xs={openMenu === 2 ? 9 : 3} sm={openMenu === 2 ? 10 : 2} lg={openMenu === 2 ? 11 : 1}>
          <Tooltip title="คลังสต็อกน้ำมัน" placement="top">
            {
              isMobile ?
                <Button
                  variant="contained"
                  color={openMenu === 2 ? "success" : "inherit"}
                  fullWidth
                  onClick={() => setOpenMenu(2)}
                  sx={{ height: "10vh", fontSize: openMenu === 2 ? 40 : 16, paddingLeft: openMenu === 2 ? 0 : 3.5 }}
                >
                  <Badge
                    badgeContent={stock.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 20, // ขนาดตัวเลขใน Badge
                        minWidth: 30, // ความกว้างของ Badge
                        height: 30, // ความสูงของ Badge
                        top: openMenu === 2 ? 35 : -10,
                        right: openMenu === 2 ? -30 : -10,
                        color: openMenu === 2 ? theme.palette.success.main : "white",
                        backgroundColor: openMenu === 2 ? "white" : theme.palette.success.main,
                        fontWeight: "bold",
                      },
                      fontWeight: "bold",
                    }}
                  >
                    <WaterDropIcon sx={{ width: '3em', height: '3em' }} />
                  </Badge>
                </Button>
                :
                <Button
                  variant="contained"
                  color={openMenu === 2 ? "success" : "inherit"}
                  fullWidth
                  onClick={() => setOpenMenu(2)}
                  sx={{ height: "10vh", fontSize: openMenu === 2 ? 40 : 16, paddingLeft: openMenu === 2 ? 0 : 3.5 }}
                  startIcon={
                    <WaterDropIcon sx={{ width: '3em', height: '3em' }} />
                  }
                >
                  <Badge
                    badgeContent={stock.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 20, // ขนาดตัวเลขใน Badge
                        minWidth: 30, // ความกว้างของ Badge
                        height: 30, // ความสูงของ Badge
                        top: openMenu === 2 ? 35 : -40,
                        right: openMenu === 2 ? -30 : -5,
                        color: openMenu === 2 ? theme.palette.success.main : "white",
                        backgroundColor: openMenu === 2 ? "white" : theme.palette.success.main,
                        fontWeight: "bold",
                      },
                      fontWeight: "bold",
                    }}
                  >
                    {openMenu === 2 ? "คลังสต็อกน้ำมัน" : ""}
                  </Badge>
                </Button>
            }
            {
              openMenu === 2 && <Divider orientation="vertical" flexItem sx={{ border: "1px solid lightgray", marginTop: 2 }} />
            }
          </Tooltip>
        </Grid>
      </Grid>
      <Box sx={{ ml: -3, width: "100%" }}>
        {
          openMenu === 1 ?
            <GasStationsDetail gasStation={gasStation.length} />
            :
            stock.map((st) => (
              <StockDetail key={st.id} stock={st} />
            ))
        }
      </Box>
    </Container>
  );
};

export default GasStations;
