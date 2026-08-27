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
  TablePagination,
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
import { database } from "../../server/firebase";
import InsertEmployee from "./InsertEmployee";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import UpdateDriver from "./UpdateDriver";
import UpdateEmployee from "./UpdateEmployee";
import { fetchRealtimeData } from "../../server/data";
//import { useData } from "../../server/path";
//import { useData } from "../../server/ConnectDB";
//import DriverTable from "../dashboard/ProviderTest";
import { useBasicData } from "../../server/provider/BasicDataProvider";

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

  const { officers, drivers, reghead, small, loading } = useBasicData();

  // const { data, fetchDataMany, loading } = useData();

  // useEffect(() => {
  //   fetchDataMany(["officers", "drivers", "reghead", "small"]);
  // }, [fetchDataMany]);

  // const dataofficers = Object.values(data.officers || {});
  // const datadrivers = Object.values(data.drivers || {});
  // const datareghead = Object.values(data.reghead || {});
  // const datasmall = Object.values(data.small || {});

  // const { officers, drivers, reghead, small } = useData();
  // คำนวณค่าที่ใช้หลายครั้งด้วย useMemo
  const dataofficers = useMemo(() => Object.values(officers || {}), [officers]);
  const datadrivers = useMemo(() => Object.values(drivers || {}), [drivers]);
  const datareghead = useMemo(() => Object.values(reghead || {}), [reghead]).filter((item) => item.StatusTruck !== "ยกเลิก");
  const datasmall = useMemo(() => Object.values(small || {}), [small]).filter((item) => item.StatusTruck !== "ยกเลิก");

  // ตัวกรองรถที่ไม่มีคนขับ
  const registrationHead = useMemo(() =>
    datareghead.filter(row => row.Driver === "0:ไม่มี"),
    [datareghead]
  );

  const registrationSmallTruck = useMemo(() =>
    datasmall.filter(row => row.Driver === "0:ไม่มี"),
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

  const handlePost = () => {
    database
      .ref("/employee/drivers/")
      .child(setting.split(":")[0] - 1)
      .update({
        Registration: truck.split(":")[0] + ":" + truck.split(":")[1],
      })
      .then(() => {
        if (truck.split(":")[2] === "รถใหญ่") {
          database
            .ref("/truck/registration/")
            .child(truck.split(":")[0] - 1)
            .update({
              Driver: setting,
            })
            .then(() => {
              ShowSuccess("เปลี่ยนทะเบียนสำเร็จ");
              console.log("Data pushed successfully");
              setSetting("");
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error("Error pushing data:", error);
            });
        } else if (truck.split(":")[2] === "รถเล็ก") {
          database
            .ref("/truck/small/")
            .child(truck.split(":")[0] - 1)
            .update({
              Driver: setting,
            })
            .then(() => {
              ShowSuccess("เปลี่ยนทะเบียนสำเร็จ");
              console.log("Data pushed successfully");
              setSetting("");
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error("Error pushing data:", error);
            });
        } else {

        }
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleChangeOpen1 = (event) => {
  //   setOpen(1);
  //   setPage(0);
  // };

  // const handleChangeOpen2 = (event) => {
  //   setOpen(2);
  //   setPage(0);
  // };
  const paginatedDrivers = useMemo(() => {
    return driverDetail.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [driverDetail, page, rowsPerPage]);

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
    const regText = row.Registration?.split(":")[1] || "";

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
              <IconButton size="small" sx={{ mt: -0.5 }} onClick={() => setSetting(handlePost)}>
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
                    dataofficers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <UpdateEmployee key={row.id} row={row} index={index} />
                    ))
                  }
                </TableBody>
              </Table>
              {
                dataofficers.length <= 10 ? null :
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 30]}
                    component="div"
                    count={dataofficers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                    }
                    sx={{
                      overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                      borderBottomLeftRadius: 5,
                      borderBottomRightRadius: 5,
                      '& .MuiTablePagination-toolbar': {
                        backgroundColor: "lightgray",
                        height: "20px", // กำหนดความสูงของ toolbar
                        alignItems: "center",
                        paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                        overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                        fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                      },
                      '& .MuiTablePagination-select': {
                        paddingY: 0,
                        fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                      },
                      '& .MuiTablePagination-actions': {
                        '& button': {
                          paddingY: 0,
                          fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                        },
                      },
                      '& .MuiTablePagination-displayedRows': {
                        fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                      },
                      '& .MuiTablePagination-selectLabel': {
                        fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                      }
                    }}
                  />
              }
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
              {
                driverDetail.length <= 10 ? null :
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 30]}
                    component="div"
                    count={driverDetail.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                    }
                    sx={{
                      overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                      borderBottomLeftRadius: 5,
                      borderBottomRightRadius: 5,
                      '& .MuiTablePagination-toolbar': {
                        backgroundColor: "lightgray",
                        height: "20px", // กำหนดความสูงของ toolbar
                        alignItems: "center",
                        paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                        overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                        fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                      },
                      '& .MuiTablePagination-select': {
                        paddingY: 0,
                        fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                      },
                      '& .MuiTablePagination-actions': {
                        '& button': {
                          paddingY: 0,
                          fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                        },
                      },
                      '& .MuiTablePagination-displayedRows': {
                        fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                      },
                      '& .MuiTablePagination-selectLabel': {
                        fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                      }
                    }}
                  />
              }
            </TableContainer>
        }
      </Paper>
    </Container >
  );
};

export default Employee;
