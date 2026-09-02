import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
  MenuItem,
  Paper,
  Popover,
  Select,
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
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import HailIcon from "@mui/icons-material/Hail";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { apiPut } from "../../server/apiClient";
import InsertEmployee from "./InsertEmployee";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import UpdateDriver from "./UpdateDriver";
import UpdateEmployee from "./UpdateEmployee";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import TablePaginationBar from "../../theme/TablePaginationBar";

const Employee = ({ openNavbar }) => {
  //const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = React.useState(1);
  //const [openMenu, setOpenMenu] = useState(1);
  //const [openOfficeDetail, setOpenOfficeDetail] = useState(false);
  const [check, setCheck] = React.useState(1);
  const [setting, setSetting] = React.useState("");
  const [truck, setTruck] = React.useState("0:ไม่มี:ไม่มี");

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

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // const handleClose = () => {
  //   setOpenOfficeDetail(false);
  // };

  const { officers, drivers, reghead, small, loading, refetch: refetchBasicData } = useBasicData();

  // const dataofficers = Object.values(data.officers || {});
  // const datadrivers = Object.values(data.drivers || {});
  // const datareghead = Object.values(data.reghead || {});
  // const datasmall = Object.values(data.small || {});

  // คำนวณค่าที่ใช้หลายครั้งด้วย useMemo
  const dataofficers = useMemo(() => Object.values(officers || {}), [officers]);
  const datadrivers = useMemo(() => Object.values(drivers || {}), [drivers]);
  const datareghead = useMemo(() => Object.values(reghead || {}), [reghead]).filter((item) => item.StatusTruck !== "ยกเลิก");
  const datasmall = useMemo(() => Object.values(small || {}), [small]).filter((item) => item.StatusTruck !== "ยกเลิก");

  // ตัวกรองรถที่ไม่มีคนขับ - Driver is a real UUID FK (null when unassigned) on
  // truck_registration, but a plain "no driver" TEXT placeholder on truck_small.
  const registrationHead = useMemo(() =>
    datareghead.filter(row => !row.Driver),
    [datareghead]
  );

  const registrationSmallTruck = useMemo(() =>
    datasmall.filter(row => row.Driver === "0:ไม่มี" || row.Driver === "ไม่มี" || !row.Driver),
    [datasmall]
  );

  // กรองคนขับตาม TruckType เฉพาะถ้าจำเป็น
  const driverDetail = useMemo(() => {
    if (check === 2) return datadrivers.filter(row => row.TruckType === "รถใหญ่" || row.TruckType === "รถใหญ่/รถเล็ก");
    if (check === 3) return datadrivers.filter(row => row.TruckType === "รถเล็ก" || row.TruckType === "รถใหญ่/รถเล็ก");
    return datadrivers;
  }, [datadrivers, check]);

  // const [openTab, setOpenTab] = React.useState(true);

  // const isMobile = useMediaQuery("(max-width:1000px)");

  // const shouldDrawerOpen = React.useMemo(() => {
  //   if (isMobile) {
  //     return !openTab; // ถ้าเป็นจอโทรศัพท์ ให้เปิด drawer เมื่อ open === false
  //   } else {
  //     return openTab; // ถ้าไม่ใช่จอโทรศัพท์ ให้เปิด drawer เมื่อ open === true
  //   }
  // }, [openTab, isMobile]);

  // const handleDrawerOpen = () => {
  //   if (isMobile) {
  //     // จอเท่ากับโทรศัพท์
  //     setOpenTab((prevOpen) => !prevOpen);
  //   } else {
  //     // จอไม่เท่ากับโทรศัพท์
  //     setOpenTab((prevOpen) => !prevOpen);
  //   }
  // };

  // const toggleDrawer = (newOpen) => () => {
  //   setOpenTab(newOpen);
  // };

  // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ

  console.log("setting : ", setting);
  console.log("trucks : ", truck);

  const handlePost = async () => {
    const driverRow = datadrivers.find((d) => d.id === Number(setting.split(":")[0]));
    // This dialog only ever offers head-truck (รถใหญ่) options in its
    // dropdown (see registrationHead below), so the target table is fixed.
    const truckRow = datareghead.find((t) => t.id === Number(truck.split(":")[0]));

    if (!driverRow?.uuid || !truckRow?.uuid) {
      ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
      return;
    }

    try {
      await apiPut(`/api/employee_drivers/${driverRow.uuid}`, {
        Registration: truckRow.uuid,
        RegistrationName: truckRow.RegHead,
      });
      await apiPut(`/api/truck_registration/${truckRow.uuid}`, {
        Driver: driverRow.uuid,
        DriverName: driverRow.Name,
      });
      ShowSuccess("เปลี่ยนทะเบียนสำเร็จ");
      refetchBasicData?.();
      setSetting("");
    } catch (error) {
      ShowError("เพิ่มข้อมูลไม่สำเร็จ");
      console.error("Error pushing data:", error);
    }
  }

  // const handleChangeOpen1 = (event) => {
  //   setOpen(1);
  //   setPage(0);
  // };

  // const handleChangeOpen2 = (event) => {
  //   setOpen(2);
  //   setPage(0);
  // };
  const officersPageCount = Math.max(1, Math.ceil(dataofficers.length / rowsPerPage));
  const safeOfficersPage = Math.min(page, officersPageCount - 1);
  const driversPageCount = Math.max(1, Math.ceil(driverDetail.length / rowsPerPage));
  const safeDriversPage = Math.min(page, driversPageCount - 1);
  const paginatedOfficers = useMemo(() => {
    return dataofficers.slice(safeOfficersPage * rowsPerPage, safeOfficersPage * rowsPerPage + rowsPerPage);
  }, [dataofficers, safeOfficersPage, rowsPerPage]);
  const paginatedDrivers = useMemo(() => {
    return driverDetail.slice(safeDriversPage * rowsPerPage, safeDriversPage * rowsPerPage + rowsPerPage);
  }, [driverDetail, safeDriversPage, rowsPerPage]);

  const renderSelectOptions = (truckType) => {
    // if (truckType === "รถใหญ่") {
    //   return registrationHead.map(head => (
    //     <MenuItem key={head.id} value={`${head.id}:${head.RegHead}:รถใหญ่`}>{head.RegHead}</MenuItem>
    //   ));
    // }
    // if (truckType === "รถเล็ก") {
    //   return registrationSmallTruck.map(small => (
    //     <MenuItem key={small.id} value={`${small.id}:${small.RegHead}:รถเล็ก`}>{small.RegHead}</MenuItem>
    //   ));
    // }
    return (
      <>
        {registrationHead.map(head => (
          <MenuItem key={head.id} value={`${head.id}:${head.RegHead}`}>{head.RegHead}</MenuItem>
        ))}
        {/* {registrationSmallTruck.map(small => (
          <MenuItem key={small.id} value={`${small.id}:${small.Registration}`}>{small.Registration}</MenuItem>
        ))} */}
      </>
    );
  };

  const renderSettingCell = (row) => {
    const rowName = row.Name;
    const regText = row.RegistrationName || "";

    if (!setting || setting === "") {
      return (
        <TableCell sx={{ textAlign: "center" }}>
          {regText}
          {regText === "ไม่มี" && (
            <IconButton size="small" sx={{ mt: -0.5 }} onClick={() => setSetting(`${row.id}:${rowName}`)}>
              <SettingsIcon color="warning" fontSize="12px" />
            </IconButton>
          )}
        </TableCell>
      );
    }

    if (setting.split(":")[1] === rowName) {
      return (
        <TableCell sx={{ textAlign: "center" }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Paper component="form">
                <Select
                  id="demo-simple-select"
                  value={truck}
                  size="small"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          fontSize: "14px",
                        },
                      },
                    },
                  }}
                  sx={{ textAlign: "left", height: 25, fontSize: "14px" }}
                  onChange={(e) => setTruck(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="0:ไม่มี:ไม่มี">เลือกทะเบียน</MenuItem>
                  {registrationHead.map(head => (
                    <MenuItem key={head.id} value={`${head.id}:${head.RegHead}`}>{head.RegHead}</MenuItem>
                  ))}
                  {/* {renderSelectOptions(row.TruckType)} */}
                </Select>
              </Paper>
            </Grid>
            <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
              <IconButton size="small" sx={{ mt: -0.5 }} onClick={() => setSetting("")}>
                <CancelIcon color="error" fontSize="12px" />
              </IconButton>
              <IconButton size="small" sx={{ mt: -0.5 }} onClick={() => handlePost()}>
                <CheckCircleIcon color="success" fontSize="12px" />
              </IconButton>
            </Grid>
          </Grid>
        </TableCell>
      );
    }

    return <TableCell></TableCell>;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={"100vh"} width={"100vw"}>
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        พนักงาน
      </Typography>
      <Divider sx={{ marginBottom: 1 }} />
      <Grid container spacing={2} marginTop={1} sx={{ width: "100%" }}>
        <Grid item xs={6}>
          <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(1)}>พนักงานขับรถ</Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(2)}>พนักงานบริษัท</Button>
        </Grid>
        <Grid item xs={6} sx={{ marginTop: -3 }}>
          {
            open === 1 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
          }
        </Grid>
        <Grid item xs={6} sx={{ marginTop: -3 }}>
          {
            open === 2 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
          }
        </Grid>
      </Grid>
      <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light, marginTop: -2.5, width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item md={open === 1 ? 3 : 5} xs={12} >
            <Typography variant="h6" fontWeight="bold" gutterBottom>รายชื่อพนักงาน{open === 2 ? "ภายในบริษัท" : "ขับรถ"}</Typography>
          </Grid>
          <Grid item md={open === 1 ? 6 : 4} xs={12}>
            {
              open === 1 &&
              <FormGroup row sx={{ marginBottom: -2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกประเภทที่ต้องการ : </Typography>
                <FormControlLabel control={<Checkbox checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
                <FormControlLabel control={<Checkbox checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="รถใหญ่" />
                <FormControlLabel control={<Checkbox checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="รถเล็ก" />
              </FormGroup>
            }
          </Grid>
          <Grid item md={3} xs={12}>
            <InsertEmployee type={open} driver={driverDetail} officer={dataofficers} truck={registrationHead} smallTruck={registrationSmallTruck} />
          </Grid>
        </Grid>
        <Divider sx={{ marginBottom: 1, marginTop: 2 }} />
        {
          open === 2 ?
            <TableContainer
              component={Paper}
              sx={{ marginTop: 2 }}
            >
              <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                <TableHead sx={{ height: "7vh" }}>
                  <TableRow>
                    <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                      ลำดับ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                      ชื่อ-สกุล
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                      ตำแหน่ง
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                      เบอร์โทร
                    </TablecellHeader>
                    {/* <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                      สิทธิ์
                    </TablecellHeader> */}
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                      UserID
                    </TablecellHeader>
                    {/* <TablecellHeader sx={{ width: 50 }} /> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    // loading ? (
                    //   <p> กำลังโหลด...</p>
                    // ) :
                    paginatedOfficers.map((row, index) => (
                      <UpdateEmployee key={row.id} row={row} index={index} />
                    ))
                  }
                </TableBody>
              </Table>
              <TablePaginationBar
                count={dataofficers.length}
                page={safeOfficersPage}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
              />
            </TableContainer>
            :
            // <DriverTable />
            <TableContainer
              component={Paper}
              sx={{ marginTop: 2 }}
            >
              <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                <TableHead sx={{ height: "7vh" }}>
                  <TableRow>
                    <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                      ลำดับ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                      ชื่อ-สกุล
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                      เลขประจำตัวผู้เสียภาษี
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                      ทะเบียนรถ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                      ประเภทรถ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                      เลขที่ธนาคาร
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                      ธนาคาร
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                      UserID
                    </TablecellHeader>
                    {/* <TablecellHeader sx={{ width: 50 }} /> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    // loading ? (
                    //   <p> กำลังโหลด...</p>
                    // ) :
                    paginatedDrivers.map((row, index) => (
                      <UpdateDriver key={row.id} driver={row} index={index} />
                    ))
                  }
                </TableBody>
              </Table>
              <TablePaginationBar
                count={driverDetail.length}
                page={safeDriversPage}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
              />
            </TableContainer>
        }
      </Paper>
    </Container >
  );
};

export default Employee;
