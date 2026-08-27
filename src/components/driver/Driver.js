import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
  ShowConfirm,
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
  signOut,
} from "firebase/auth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PrintIcon from "@mui/icons-material/Print";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import dayjs from "dayjs";
import ImageIcon from "@mui/icons-material/Image";
import Cookies from "js-cookie";
import "dayjs/locale/th";
import { database } from "../../server/firebase";
import {
  TableCellB7,
  TableCellB95,
  TableCellE20,
  TableCellG91,
  TableCellG95,
  TablecellSelling,
  TableCellPWD,
  TableCellB20,
} from "../../theme/style";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import RepairTruck from "../truck/RepairTruck";
import TruckRepair from "../truck/headtruck/TruckRepair";

const Driver = () => {
  const [truck, setTruck] = React.useState("0:0:0");
  const branches = [
    "( สาขาที่  00001)/",
    "( สาขาที่  00002)/",
    "( สาขาที่  00003)/",
    "(สำนักงานใหญ่)/",
  ];

  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
    };

    window.addEventListener("resize", handleResize); // เพิ่ม event listener

    // ลบ event listener เมื่อ component ถูกทำลาย
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const [driver, setDriver] = useState([]);
  // const [trip, setTrip] = useState([]);
  // const [order, setOrder] = useState([]);
  const [tripNew, setTripNew] = useState([]);
  const [orderNew, setOrderNew] = useState([]);
  // const [depot, setDepot] = useState([]);
  const [depotNew, setDepotNew] = useState([]);
  const [showTrip, setShowTrip] = useState(true);
  const [repairTruck, setRepairTruck] = useState(true);
  const [check, setCheck] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dataNo, setDataNo] = useState(null);
  const [selectDriver, setSelectDriver] = useState("");
  const [truckRepair, setTruckRepair] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleClose = () => {
    setDialogOpen(false);
    setFile(null);
    setPreview(null);
  };

  // const getTrip = async () => {
  //     database.ref("/truck/registration").on("value", (snapshot) => {
  //         const datas = snapshot.val();
  //         if (datas === null || datas === undefined) {
  //             setDriver([]);
  //         } else {
  //             const dataDriver = [];
  //             for (let id in datas) {
  //                 if (datas[id].Driver !== "ไม่มี") {
  //                     dataDriver.push({ id, ...datas[id] })
  //                 }
  //             }
  //             setDriver(dataDriver);
  //         }
  //     });

  //     database.ref("/trip").on("value", (snapshot) => {
  //         const datas = snapshot.val();
  //         if (datas === null || datas === undefined) {
  //             setTrip([]);
  //         } else {
  //             const dataTrip = [];
  //             for (let id in datas) {
  //                 if (datas[id].StatusTrips === "กำลังจัดเที่ยววิ่ง" || (datas[id].StatusTrips === "จบทริป" && datas[id].DateEnd === dayjs(new Date).format("DD/MM/YYYY"))) {
  //                     dataTrip.push({ id, ...datas[id] })
  //                 }
  //             }
  //             setTrip(dataTrip);
  //         }
  //     });

  //     database.ref("/order").on("value", (snapshot) => {
  //         const datas = snapshot.val();
  //         if (datas === null || datas === undefined) {
  //             setOrder([]);
  //         } else {
  //             const dataOrder = [];
  //             for (let id in datas) {
  //                 dataOrder.push({ id, ...datas[id] })
  //             }
  //             setOrder(dataOrder);
  //         }
  //     });

  //     database.ref("/depot/oils").on("value", (snapshot) => {
  //         const datas = snapshot.val();
  //         if (datas === null || datas === undefined) {
  //             setDepot([]);
  //         } else {
  //             const dataDepot = [];
  //             for (let id in datas) {
  //                 dataDepot.push({ id, ...datas[id] })
  //             }
  //             setDepot(dataDepot);
  //         }
  //     });
  // };

  // useEffect(() => {
  //     getTrip();
  // }, []);

  // const { reghead, trip, order, depots } = useData();
  const { reghead, depots, inspection } = useBasicData();
  const { trip, order } = useTripData();

  const inspectionList = Object.values(inspection || {})
  const drivers = Object.values(reghead || {});
  // const trips = Object.values(trip || {});
  const trips = Object.values(trip || {}).filter((item) => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

    return (
      deliveryDate.isSameOrAfter(targetDate, "day") ||
      receiveDate.isSameOrAfter(targetDate, "day")
    );
  });
  // const orders = Object.values(order || {});
  const orders = Object.values(order || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });
  const depot = Object.values(depots || {});

  // กรองตามเงื่อนไขที่ต้องการหลังจาก data มาแล้ว
  const driver = drivers.filter((d) => d.Driver !== "0:ไม่มี");

  const today = dayjs(new Date()).format("DD/MM/YYYY");
  const tripDetail = trips
    .filter((t) => t.DateEnd === today || t.StatusTrip === "กำลังจัดเที่ยววิ่ง")
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.DateEnd) - new Date(a.updatedAt || a.DateEnd),
    )
    .filter((t, index, arr) => {
      // ถ้ามี "กำลังจัดเที่ยววิ่ง" ใน list
      const hasActive = arr.some((x) => x.StatusTrip === "กำลังจัดเที่ยววิ่ง");

      // ถ้ามี → เอาเฉพาะกำลังจัดเที่ยววิ่ง
      if (hasActive) {
        return t.StatusTrip === "กำลังจัดเที่ยววิ่ง";
      }

      // ถ้าไม่มี → เอาจบทริปของวันนี้
      return t.StatusTrip === "จบทริป" && t.DateEnd === today;
    });
  useEffect(() => {
    if (!truck || !orders?.length || !tripDetail?.length) return;

    const driverId = Number(truck?.split(":")?.[0]);

    // ✅ หา trip แบบ safe
    const check = tripDetail.find((item) => {
      const id = Number(item.Driver?.split(":")?.[0]);
      return id === driverId;
    });

    if (!check) {
      console.warn("❌ ไม่เจอ trip");
      setCheck({});
      setTripNew({});
      setOrderNew([]);
      setDepotNew({});
      return;
    }

    const tripId = Number(check.id) - 1;

    // ✅ กัน type mismatch
    const checkOrder = orders.filter((item) => Number(item.Trip) === tripId);

    // ✅ depot safe
    const depotZone =
      typeof check.Depot === "string" ? check.Depot.split(":")?.[1] : "";

    const checkDepot = depot.find((item) => item.Zone === depotZone) ?? {};

    // ✅ map Order1,2,3 (กัน undefined + fix id)
    const tripNewData = Object.keys(check)
      .filter((key) => key.startsWith("Order") && check[key])
      .reduce((acc, key, index) => {
        acc[index] = {
          Name: check[key],
          No: index,
          Depot: check.Depot,
          Trip: check.id, // 🔥 แก้จาก check[key].id
        };
        return acc;
      }, {});

    setCheck(check);
    setTripNew(tripNewData);
    setOrderNew(checkOrder);
    setDepotNew(checkDepot);

    // 🔍 debug (แนะนำเปิดไว้ช่วงทดสอบ)
    console.log("✅ check:", check);
    console.log("✅ orders:", checkOrder);
    console.log("✅ depot:", checkDepot);
  }, [truck, orders, tripDetail, depot]);

  useEffect(() => {
    if (!check || !orderNew?.length) return;

    const isAllDone = orderNew.every((item) => item.Status === "จัดส่งสำเร็จ");

    if (!isAllDone) return;

    database
      .ref("trip/")
      .child(check.id - 1)
      .update({
        StatusTrip: "จบทริป",
        DateEnd: dayjs().format("DD/MM/YYYY"),
      })
      .then(() => {
        if (!check || !orderNew?.length) return;

        if (check.TruckType === "รถใหญ่") {
          database
            .ref("truck/registration/")
            .child(Number(check.Registration.split(":")[0]) - 1)
            .update({
              Status: "ว่าง",
              RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
            })
            .then(() => {
              console.log("Trip completed");
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error(error);
            });
        } else if (check.TruckType === "รถเล็ก") {
          database
            .ref("truck/small/")
            .child(Number(check.Registration.split(":")[0]) - 1)
            .update({
              Status: "ว่าง",
              RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
            })
            .then(() => {
              console.log("Trip completed");
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error(error);
            });
        }

        console.log("Trip completed");
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error(error);
      });
  }, [orderNew, check]);

  const handleChangeDriver = (e) => {
    const trucks = e.target.value;
    setTruck(trucks);

    const driverId = Number(trucks?.split(":")?.[0]);

    // ✅ หา trip
    const check = tripDetail.find((item) => {
      const id = Number(item.Driver?.split(":")?.[0]);
      return id === driverId;
    });

    // ✅ หา driver
    const driverName = drivers.find((item) => {
      const id = Number(item.Driver?.split(":")?.[0]);
      return id === driverId;
    });

    if (!check) {
      console.warn("❌ ไม่เจอ trip");
      setCheck({});
      setTripNew({});
      setOrderNew([]);
      setDepotNew({});
      return;
    }

    // ✅ set driver
    setTruckRepair(driverName || {});
    setSelectDriver(
      driverName ? `${driverName.id - 1}:${driverName.RegHead}:รถใหญ่` : "",
    );

    console.log("✅ check :", check);

    const tripId = Number(check.id) - 1;

    // ✅ หา order (กัน type mismatch)
    const checkOrder = orders.filter((item) => Number(item.Trip) === tripId);

    console.log("✅ checkOrder :", checkOrder);

    // ✅ depot
    const depotZone =
      typeof check.Depot === "string" ? check.Depot.split(":")?.[1] : "";

    const checkDepot = depot.find((item) => item.Zone === depotZone) ?? {};

    console.log("✅ depotZone :", depotZone);
    console.log("✅ checkDepot :", checkDepot);

    // ✅ map Order1,2,3
    const tripNew = Object.keys(check)
      .filter((key) => key.startsWith("Order") && check[key])
      .reduce((acc, key, index) => {
        acc[index] = {
          Name: check[key],
          No: index,
          Depot: check.Depot,
          Trip: check.id, // 🔥 แก้ (ของเดิมพัง)
        };
        return acc;
      }, {});

    setCheck(check);
    setTripNew(tripNew);
    setOrderNew(checkOrder);
    setDepotNew(checkDepot);

    // ✅ check จบทริป
    const isAllDone =
      checkOrder.length > 0 &&
      checkOrder.every((item) => item.Status === "จัดส่งสำเร็จ");

    if (isAllDone) {
      database
        .ref("trip/")
        .child(tripId)
        .update({
          StatusTrip: "จบทริป",
          DateEnd: dayjs().format("DD/MM/YYYY"),
        })
        .then(() => {
          console.log("✅ Trip completed");
        })
        .catch((error) => {
          ShowError("เพิ่มข้อมูลไม่สำเร็จ");
          console.error(error);
        });
    }
  };

  const generatePDF = (row) => {
    const invoiceData = { order: row, trip: check, depot: depotNew };

    // บันทึกข้อมูลลง sessionStorage
    sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = 820;
    const windowHeight = 559;

    const left = (screenWidth - windowWidth) / 2;
    const top = (screenHeight - windowHeight) / 2;

    const printWindow = window.open(
      "/pda-printer",
      "_blank",
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`,
    );

    if (!printWindow) {
      alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
    }
  };

  const handleSaveStatus = async (no) => {
    if (!file) {
      alert("กรุณาเลือกไฟล์ก่อน");
      return;
    }

    let img = "ไม่แนบไฟล์";

    try {
      const formData = new FormData();
      formData.append("pic", file);

      const response = await fetch(
        "https://upload.happysoftth.com/panda/uploads",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (!data?.file_path) {
        throw new Error("No file_path returned");
      }

      img = data.file_path;
    } catch (err) {
      console.error("Upload error:", err);
      alert("อัปโหลดรูปไม่สำเร็จ");
      return; // ❗ หยุด ไม่ให้ update Firebase
    }

    try {
      await database
        .ref("order")
        .child(String(no)) // ✅ แปลงเป็น string ชัวร์
        .update({
          Status: "จัดส่งสำเร็จ",
          file_path: img,
        });

      setDialogOpen(false);
      setFile(null);
      setPreview(null);

      console.log("Data pushed successfully");
    } catch (error) {
      console.error("Firebase update error:", error);
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  const handleBack = () => {
    navigate("/choose");
  };

  const formatAddress = (address) => {
    // แยกข้อมูลจาก address โดยใช้ , หรือ เว้นวรรคเป็นตัวแบ่ง
    const parts = address && address.split(/,|\s+/).filter(Boolean);

    if (!parts || parts.length < 5) return "-";

    const [houseNo, moo, subdistrict, district, province, postalCode] = parts;

    return `${houseNo} หมู่ ${moo} ต.${subdistrict} อ.${district} จ.${province} ${postalCode}`;
  };

  console.log("Trip : ", tripDetail);
  console.log("Truck : ", truck.split(":")[1]);
  console.log("TripNew : ", tripNew);
  console.log("TripNew length : ", Object.keys(tripNew).length);
  console.log("DepotNew : ", depotNew);
  console.log("OrderNew : ", orderNew);
  console.log("check : ", check);

  return (
    <Container
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: { xs: "lg", sm: "lg", md: "lg" },
      }}
    >
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
        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            marginTop: { xs: -2, sm: -3, md: -4 },
            marginBottom: { xs: -1, sm: -2, md: -3 },
          }}
        >
          <Box
            textAlign="right"
            marginTop={-6.5}
            marginBottom={4}
            sx={{ marginRight: { xs: -2, sm: -3, md: -4 } }}
          >
            {
              //    isMobile ?
              //        <>
              //            <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }}><ReplyAllIcon fontSize="small" /></Button>
              //</Box>        </>

              //        :
              //        <>
              <Button
                variant="contained"
                color="error"
                sx={{
                  border: "3px solid white",
                  borderTopRightRadius: 15,
                  borderTopLeftRadius: 6,
                  borderBottomRightRadius: 6,
                  borderBottomLeftRadius: 6,
                }}
                endIcon={<ReplyAllIcon fontSize="small" />}
                onClick={handleBack}
              >
                กลับหน้าแรก
              </Button>
              //        </>
            }
          </Box>
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            marginTop={-3}
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
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              color={theme.palette.panda.main}
              sx={{ marginTop: 5, marginLeft: 1 }}
              gutterBottom
            >
              ยินดีต้อนรับเข้าสู่หน้าพนักงานขับรถ
            </Typography>
          </Box>
          <Divider />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={0.5} lg={1} />
          <Grid
            item
            xs={11}
            lg={10}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              textAlign="right"
              sx={{ whiteSpace: "nowrap" }}
              gutterBottom
            >
              ชื่อพนักงานขับรถ/ทะเบียนรถ
            </Typography>
            <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={truck}
                onChange={handleChangeDriver}
                sx={{
                  px: 3, // padding ซ้าย-ขวา
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 180, // กำหนดความสูงของ dropdown
                      overflowY: "auto", // เปิดใช้งาน scrollbar แนวตั้ง
                    },
                  },
                }}
                fullWidth
              >
                <MenuItem value={"0:0:0"}>กรุณาเลือกรถบรรทุก</MenuItem>
                {driver.map((row) => (
                  <MenuItem
                    value={`${row.Driver}:${row.RegHead}:${row.RegTail}`}
                  >{`${row.Driver ? row.Driver.split(":")[1] : ""} / ${row.RegHead}:${row.RegTail ? row.RegTail.split(":")[1] : ""}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {Object.keys(tripNew).length === 0 ? (
          <Grid container spacing={2} marginTop={3} marginBottom={3}>
            <Grid item xs={3.5}></Grid>
            <Grid item xs={5}>
              <Paper sx={{ p: 5, backgroundColor: "lightgray" }}>
                <Typography
                  variant="h6"
                  textAlign="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  ไม่มีเที่ยววิ่ง
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3.5}></Grid>
          </Grid>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={0.5} lg={1} />
              <Grid item xs={11} lg={10}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    endIcon={
                      repairTruck ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowUpIcon />
                      )
                    }
                    disabled={
                        inspectionList.find((item) => item.Trip === tripNew[0].Trip) !== undefined
                    }
                    onClick={() => setRepairTruck(!repairTruck)}
                  >
                    ตรวจสอบสภาพรถ
                  </Button>
                  <TruckRepair
                    key={truckRepair.RepairTruck.split(":")[1]}
                    row={truckRepair}
                    type={"ตรวจสอบสภาพรถ"}
                  />
                </Box>
                <Box>
                  {!repairTruck && (
                    <RepairTruck
                      selectDriver={selectDriver}
                      driverDetail={truckRepair.Driver}
                      setRepairTruck={setRepairTruck}
                      trip={tripNew[0]}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={0.5} lg={1} />
              <Grid item xs={0.5} lg={1} />
              <Grid item xs={11} lg={10}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{
                    fontSize: "12px",
                    color: theme.palette.error.main,
                    textAlign: "right",
                  }}
                  gutterBottom
                >
                  *กดปุ่มจัดส่งแล้วเมื่อถึงจุดส่ง*
                </Typography>
                <TableContainer component={Paper}>
                  <Table
                    stickyHeader
                    size="small"
                    sx={{
                      tableLayout: "fixed",
                      "& .MuiTableCell-root": {
                        padding: { xs: "12px", sm: "8px", md: "4px" },
                      },
                    }}
                  >
                    <TableHead sx={{ height: "5vh" }}>
                      <TableRow>
                        <TablecellSelling
                          width={50}
                          sx={{ textAlign: "center", fontSize: 16 }}
                        >
                          ลำดับ
                        </TablecellSelling>
                        <TablecellSelling
                          sx={{ textAlign: "center", fontSize: 16, width: 300 }}
                        >
                          ชื่อลูกค้า
                        </TablecellSelling>
                        <TableCellG95
                          sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                        >
                          G95
                        </TableCellG95>
                        <TableCellB95
                          sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                        >
                          B95
                        </TableCellB95>
                        <TableCellB7
                          sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                        >
                          B7(D)
                        </TableCellB7>
                        <TableCellG91
                          sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                        >
                          G91
                        </TableCellG91>
                        <TableCellE20
                          sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                        >
                          E20
                        </TableCellE20>
                        <TableCellPWD
                          sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                        >
                          PWD
                        </TableCellPWD>
                        <TableCellB20
                          sx={{ textAlign: "center", fontSize: 16, width: 50 }}
                        >
                          B20
                        </TableCellB20>
                        <TablecellSelling
                          sx={{ width: 150, position: "sticky", right: 0 }}
                        />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(tripNew).map(([key, value], index) =>
                        orderNew.map((row) => {
                          // หาค่าที่ต้อง split
                          let modifiedTicketName = row.TicketName;

                          branches.forEach((branch) => {
                            if (row.TicketName.includes(branch)) {
                              modifiedTicketName = row.TicketName.split(branch)
                                .pop()
                                .trim(); // เอาค่าหลังจาก branch และตัดช่องว่างออก
                            }
                          });

                          return (
                            modifiedTicketName === value.Name && (
                              <TableRow key={key}>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {value.No + 1}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.TicketName.split(":")[1]}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.Product.G95 === undefined
                                    ? "-"
                                    : row.Product.G95.Volume * 1000}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.Product.B95 === undefined
                                    ? "-"
                                    : row.Product.B95.Volume * 1000}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.Product.B7 === undefined
                                    ? "-"
                                    : row.Product.B7.Volume * 1000}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.Product.G91 === undefined
                                    ? "-"
                                    : row.Product.G91.Volume * 1000}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.Product.E20 === undefined
                                    ? "-"
                                    : row.Product.E20.Volume * 1000}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.Product.PWD === undefined
                                    ? "-"
                                    : row.Product.PWD.Volume * 1000}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.Product.B20 === undefined
                                    ? "-"
                                    : row.Product.B20.Volume * 1000}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    position: "sticky",
                                    right: 0,
                                    backgroundColor: "white",
                                  }}
                                >
                                  {row.Status === "จัดส่งสำเร็จ" ? (
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight="bold"
                                      color="success"
                                      gutterBottom
                                    >
                                      จัดส่งสำเร็จ
                                    </Typography>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      sx={{
                                        fontSize: {
                                          xs: "16px",
                                          sm: "14px",
                                          md: "12px",
                                        },
                                        padding: {
                                          xs: "12px 20px",
                                          sm: "10px 18px",
                                          md: "8px 16px",
                                        },
                                        whiteSpace: "nowrap",
                                      }}
                                      color="primary"
                                      onClick={() => {
                                        setDialogOpen(true);
                                        setDataNo(row.No);
                                      }}
                                    >
                                      จัดส่งแล้ว
                                    </Button>
                                  )}
                                  <Button
                                    variant="contained"
                                    sx={{
                                      marginLeft: 1,
                                      fontSize: {
                                        xs: "16px",
                                        sm: "14px",
                                        md: "12px",
                                      },
                                      padding: {
                                        xs: "12px 20px",
                                        sm: "10px 18px",
                                        md: "8px 16px",
                                      },
                                      whiteSpace: "nowrap",
                                    }}
                                    color="primary"
                                    onClick={() => generatePDF(row)}
                                  >
                                    <PrintIcon sx={{ color: "white" }} />
                                  </Button>
                                </TableCell>
                                <Dialog open={dialogOpen} onClose={handleClose}>
                                  <DialogTitle
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    เพิ่มรูปภาพการจัดส่ง
                                  </DialogTitle>

                                  <DialogContent>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 2,
                                      }}
                                    >
                                      {/* 🔹 Preview รูป */}
                                      {preview ? (
                                        <Box
                                          component="img"
                                          src={preview}
                                          alt="preview"
                                          sx={{
                                            width: 500,
                                            height: 500,
                                            objectFit: "contain",
                                            borderRadius: 2,
                                            border: "1px solid #ddd",
                                          }}
                                        />
                                      ) : (
                                        <ImageIcon
                                          sx={{
                                            fontSize: 80,
                                            color: "lightgray",
                                          }}
                                        />
                                      )}

                                      {/* 🔹 ปุ่มเลือกไฟล์ */}
                                      <Button
                                        variant="outlined"
                                        component="label"
                                        size="small"
                                      >
                                        แนบไฟล์รูปภาพ
                                        <input
                                          type="file"
                                          hidden
                                          accept="image/*"
                                          onChange={handleFileChange}
                                        />
                                      </Button>
                                    </Box>
                                  </DialogContent>

                                  <DialogActions
                                    sx={{ justifyContent: "center" }}
                                  >
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleSaveStatus(dataNo)}
                                      disabled={!file}
                                    >
                                      บันทึก
                                    </Button>
                                  </DialogActions>
                                </Dialog>
                              </TableRow>
                            )
                          );
                        }),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={0.5} lg={1} />
            </Grid>
            {windowWidth > 650 ? (
              <Grid
                container
                paddingLeft={10}
                paddingRight={10}
                marginTop={3}
                marginBottom={3}
              >
                <Grid
                  item
                  xs={12}
                  textAlign="center"
                  marginTop={2}
                  marginBottom={3}
                >
                  <Typography
                    variant="subtitle2"
                    fontSize="12px"
                    fontWeight="bold"
                    color={theme.palette.error.main}
                    gutterBottom
                  >
                    *ถ้าต้องการเช็คลำดับในการจัดส่งสินค้ากดปุ่มด้านล่างนี้*
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    endIcon={
                      showTrip ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowUpIcon />
                      )
                    }
                    onClick={() => setShowTrip(!showTrip)}
                  >
                    เช็คลำดับในการจัดส่งสินค้า
                  </Button>
                  {!showTrip &&
                    (() => {
                      // รวม lat,lng จาก orderNew ที่ตรงกับ tripNew
                      const coordinates = Object.entries(tripNew).flatMap(
                        ([key, value]) =>
                          orderNew
                            .filter((row) => {
                              let modifiedTicketName = row.TicketName;

                              // ตัดค่า branch ออกจาก TicketName
                              // branches.forEach(branch => {
                              //     if (row.TicketName.includes(branch)) {
                              //         modifiedTicketName = row.TicketName.split(branch).pop().trim();
                              //     }
                              // });

                              return modifiedTicketName === value.Name;
                            })
                            .map((row) =>
                              row.Lat &&
                              row.Lng &&
                              row.Lat !== "-" &&
                              row.Lng !== "-" &&
                              row.Lat !== 0 &&
                              row.Lng !== 0
                                ? `${row.Lat},${row.Lng}`
                                : null,
                            ) // ตรวจสอบ lat,lng
                            .filter(Boolean), // ลบค่า null ออก
                      );

                      // ถ้ามีพิกัดให้สร้างลิงก์
                      if (coordinates.length > 0) {
                        const depotLatLng =
                          depotNew.lat === "0" && depotNew.lng === "0"
                            ? ""
                            : `${depotNew.lat},${depotNew.lng}/`;
                        const googleMapsUrl = `https://www.google.com/maps/dir/${depotLatLng}${coordinates.join("/")}`;

                        return (
                          <Typography sx={{ marginTop: 2 }}>
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              คลิ๊กตรงนี้เพื่อเช็คดูเส้นทางการเดินรถ
                            </a>
                          </Typography>
                        );
                      }

                      return null;
                    })()}
                </Grid>
                {!showTrip && (
                  <>
                    <Grid item xs={3.5} />
                    <Grid item xs={5}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="h6"
                          textAlign="center"
                          fontWeight="bold"
                          gutterBottom
                        >
                          เริ่มต้น
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3.5} />
                    <Grid item xs={5.5} />
                    <Grid
                      item
                      xs={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: "4px",
                          height: "50px",
                          backgroundColor: "black",
                        }}
                      />
                    </Grid>
                    <Grid item xs={5.5} />
                    <Grid item xs={5.5}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >{`เข้ารับน้ำมันที่ ${depotNew.Name}`}</Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >{`โซน ${depotNew.Zone}`}</Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >{`ที่อยู่ ${formatAddress(depotNew.Address)}`}</Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          textAlign="right"
                          marginBottom={-2}
                          color="warning"
                        >
                          กำลังเข้ารับน้ำมัน
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid
                      item
                      xs={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: "50px",
                          height: "5px",
                          backgroundColor: "black",
                        }}
                      />
                      <Box
                        sx={{
                          width: "5px",
                          height: "100%",
                          backgroundColor: "black",
                        }}
                      />
                      <Box
                        sx={{
                          width: "50px",
                          height: "5px",
                          backgroundColor: "white",
                        }}
                      />
                    </Grid>
                    <Grid item xs={5.5} />
                    {Object.entries(tripNew).map(([key, value], index) =>
                      orderNew.map((row) => {
                        // หาค่าที่ต้อง split
                        let modifiedTicketName = row.TicketName;

                        // branches.forEach(branch => {
                        //     if (row.TicketName.includes(branch)) {
                        //         modifiedTicketName = row.TicketName.split(branch).pop().trim(); // เอาค่าหลังจาก branch และตัดช่องว่างออก
                        //     }
                        // });

                        return (
                          modifiedTicketName === value.Name && (
                            <React.Fragment key={key}>
                              {index % 2 === 0 ? (
                                // แสดงข้อมูลฝั่งซ้าย
                                <>
                                  <Grid item xs={5.5} />
                                  <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                  >
                                    <Box
                                      sx={{
                                        width: "50px",
                                        height: "5px",
                                        backgroundColor: "white",
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: "5px",
                                        height: "100%",
                                        backgroundColor: "black",
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: "50px",
                                        height: "5px",
                                        backgroundColor: "black",
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={5.5}>
                                    <Paper
                                      sx={{
                                        p: 2,
                                        borderLeft:
                                          row.Status === undefined
                                            ? "15px solid " +
                                              theme.palette.warning.main
                                            : "15px solid " +
                                              theme.palette.success.main,
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        gutterBottom
                                      >{`สินค้าลำดับที่ ${value.No + 1}`}</Typography>
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        gutterBottom
                                      >
                                        {row.TicketName.split(":")[1]}
                                      </Typography>
                                      {Object.entries(row.Product).map(
                                        ([key, value]) =>
                                          key !== "P" && (
                                            <Box key={key}>
                                              <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                              >
                                                ประเภทน้ำมัน: {key}
                                              </Typography>
                                              <Typography variant="subtitle2">
                                                ปริมาณ: {value.Volume * 1000}{" "}
                                                ลิตร
                                              </Typography>
                                            </Box>
                                          ),
                                      )}
                                      {(() => {
                                        let fileUrl = row.file_path;

                                        if (!fileUrl) {
                                          return (
                                            <Typography
                                              variant="subtitle2"
                                              fontWeight="bold"
                                              color="warning"
                                              gutterBottom
                                            >
                                              ไม่มีข้อมูลไฟล์
                                            </Typography>
                                          );
                                        }

                                        // ✅ เติม https ถ้ายังไม่มี
                                        if (
                                          !fileUrl.startsWith("http://") &&
                                          !fileUrl.startsWith("https://")
                                        ) {
                                          fileUrl = `https://${fileUrl}`;
                                        }

                                        return (
                                          <Typography
                                            variant="subtitle2"
                                            fontWeight="bold"
                                            color={
                                              row.Status === undefined
                                                ? "warning"
                                                : "success"
                                            }
                                            gutterBottom
                                            component="a"
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              display: "block",
                                              textDecoration: "underline",
                                              cursor: "pointer",
                                              maxWidth: 150,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                            title={fileUrl} // ✅ hover เห็นเต็ม
                                          >
                                            เปิดไฟล์
                                          </Typography>
                                        );
                                      })()}
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        textAlign="right"
                                        marginBottom={-2}
                                        color={
                                          row.Status === undefined
                                            ? "warning"
                                            : "success"
                                        }
                                        gutterBottom
                                      >
                                        {row.Status === undefined
                                          ? "กำลังจัดส่ง"
                                          : row.Status}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                </>
                              ) : (
                                // แสดงข้อมูลฝั่งขวา
                                <>
                                  <Grid item xs={5.5}>
                                    <Paper
                                      sx={{
                                        p: 2,
                                        borderRight:
                                          row.Status === undefined
                                            ? "15px solid " +
                                              theme.palette.warning.main
                                            : "15px solid " +
                                              theme.palette.success.main,
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        gutterBottom
                                      >{`สินค้าลำดับที่ ${value.No + 1}`}</Typography>
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        gutterBottom
                                      >
                                        {row.TicketName.split(":")[1]}
                                      </Typography>
                                      {Object.entries(row.Product).map(
                                        ([key, value]) =>
                                          key !== "P" && (
                                            <Box key={key}>
                                              <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                              >
                                                ประเภทน้ำมัน: {key}
                                              </Typography>
                                              <Typography variant="subtitle2">
                                                ปริมาณ: {value.Volume * 1000}{" "}
                                                ลิตร
                                              </Typography>
                                            </Box>
                                          ),
                                      )}
                                      {(() => {
                                        let fileUrl = row.file_path;

                                        if (!fileUrl) {
                                          return (
                                            <Typography
                                              variant="subtitle2"
                                              fontWeight="bold"
                                              color="warning"
                                              gutterBottom
                                            >
                                              ไม่มีข้อมูลไฟล์
                                            </Typography>
                                          );
                                        }

                                        // ✅ เติม https ถ้ายังไม่มี
                                        if (
                                          !fileUrl.startsWith("http://") &&
                                          !fileUrl.startsWith("https://")
                                        ) {
                                          fileUrl = `https://${fileUrl}`;
                                        }

                                        return (
                                          <Typography
                                            variant="subtitle2"
                                            fontWeight="bold"
                                            color={
                                              row.Status === undefined
                                                ? "warning"
                                                : "success"
                                            }
                                            gutterBottom
                                            component="a"
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              display: "block",
                                              textDecoration: "underline",
                                              cursor: "pointer",
                                              maxWidth: 150,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                            title={fileUrl} // ✅ hover เห็นเต็ม
                                          >
                                            เปิดไฟล์
                                          </Typography>
                                        );
                                      })()}
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        textAlign="right"
                                        marginBottom={-2}
                                        color={
                                          row.Status === undefined
                                            ? "warning"
                                            : "success"
                                        }
                                        gutterBottom
                                      >
                                        {row.Status === undefined
                                          ? "กำลังจัดส่ง"
                                          : row.Status}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                  >
                                    <Box
                                      sx={{
                                        width: "50px",
                                        height: "5px",
                                        backgroundColor: "black",
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: "5px",
                                        height: "100%",
                                        backgroundColor: "black",
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: "50px",
                                        height: "5px",
                                        backgroundColor: "white",
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={5.5} />
                                </>
                              )}
                            </React.Fragment>
                          )
                        );
                      }),
                    )}
                    <Grid item xs={5.5} />
                    <Grid
                      item
                      xs={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: "4px",
                          height: "100px",
                          backgroundColor: "black",
                        }}
                      />
                    </Grid>
                    <Grid item xs={5.5} />
                    <Grid item xs={3.5} />
                    <Grid item xs={5}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor:
                            check.StatusTrips === "จบทริป" &&
                            theme.palette.success.main,
                          color: check.StatusTrips === "จบทริป" && "white",
                        }}
                      >
                        <Typography
                          variant="h6"
                          textAlign="center"
                          fontWeight="bold"
                          gutterBottom
                        >
                          จบเที่ยววิ่ง
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3.5} />
                  </>
                )}
              </Grid>
            ) : Object.keys(tripNew).length === 0 ? (
              <Grid container spacing={2} marginTop={3} marginBottom={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, backgroundColor: "lightgray" }}>
                    <Typography
                      variant="h6"
                      textAlign="center"
                      fontWeight="bold"
                      gutterBottom
                    >
                      ไม่มีเที่ยววิ่ง
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Grid
                container
                paddingLeft={10}
                paddingRight={10}
                marginTop={3}
                marginBottom={3}
              >
                <Grid
                  item
                  xs={12}
                  textAlign="center"
                  marginTop={2}
                  marginBottom={3}
                >
                  <Typography
                    variant="subtitle2"
                    fontSize="12px"
                    fontWeight="bold"
                    color={theme.palette.error.main}
                    gutterBottom
                  >
                    *ถ้าต้องการเช็คลำดับในการจัดส่งสินค้ากดปุ่มด้านล่างนี้*
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    endIcon={
                      showTrip ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowUpIcon />
                      )
                    }
                    onClick={() => setShowTrip(!showTrip)}
                  >
                    เช็คลำดับในการจัดส่งสินค้า
                  </Button>
                  {!showTrip &&
                    (() => {
                      // รวม lat,lng จาก orderNew ที่ตรงกับ tripNew
                      const coordinates = Object.entries(tripNew).flatMap(
                        ([key, value]) =>
                          orderNew
                            .filter((row) => {
                              let modifiedTicketName = row.TicketName;

                              // ตัดค่า branch ออกจาก TicketName
                              branches.forEach((branch) => {
                                if (row.TicketName.includes(branch)) {
                                  modifiedTicketName = row.TicketName.split(
                                    branch,
                                  )
                                    .pop()
                                    .trim();
                                }
                              });

                              return modifiedTicketName === value.Name;
                            })
                            .map((row) =>
                              row.Lat &&
                              row.Lng &&
                              row.Lat !== "-" &&
                              row.Lng !== "-" &&
                              row.Lat !== 0 &&
                              row.Lng !== 0
                                ? `${row.Lat},${row.Lng}`
                                : null,
                            ) // ตรวจสอบ lat,lng
                            .filter(Boolean), // ลบค่า null ออก
                      );

                      // ถ้ามีพิกัดให้สร้างลิงก์
                      if (coordinates.length > 0) {
                        const depotLatLng =
                          depotNew.lat === "0" && depotNew.lng === "0"
                            ? ""
                            : `${depotNew.lat},${depotNew.lng}/`;
                        const googleMapsUrl = `https://www.google.com/maps/dir/${depotLatLng}${coordinates.join("/")}`;

                        return (
                          <Typography sx={{ marginTop: 2 }}>
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              คลิ๊กตรงนี้เพื่อเช็คดูเส้นทางการเดินรถ
                            </a>
                          </Typography>
                        );
                      }

                      return null;
                    })()}
                </Grid>
                {!showTrip && (
                  <>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="h6"
                          textAlign="center"
                          fontWeight="bold"
                          gutterBottom
                        >
                          เริ่มต้น
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: "5px",
                          height: "50px",
                          backgroundColor: "black",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >{`เข้ารับน้ำมันที่ ${depotNew.Name}`}</Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >{`โซน ${depotNew.Zone}`}</Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >{`ที่อยู่ ${formatAddress(depotNew.Address)}`}</Typography>
                      </Paper>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: "5px",
                          height: "50px",
                          backgroundColor: "black",
                        }}
                      />
                    </Grid>
                    {Object.entries(tripNew).map(([key, value], index) =>
                      orderNew.map((row) => {
                        // หาค่าที่ต้อง split
                        let modifiedTicketName = row.TicketName;

                        branches.forEach((branch) => {
                          if (row.TicketName.includes(branch)) {
                            modifiedTicketName = row.TicketName.split(branch)
                              .pop()
                              .trim(); // เอาค่าหลังจาก branch และตัดช่องว่างออก
                          }
                        });

                        return (
                          modifiedTicketName === value.Name && (
                            <React.Fragment key={key}>
                              <Grid item xs={12}>
                                <Paper
                                  sx={{
                                    p: 2,
                                    borderBottom:
                                      row.Status === undefined
                                        ? "15px solid " +
                                          theme.palette.warning.main
                                        : "15px solid " +
                                          theme.palette.success.main,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                    gutterBottom
                                  >{`สินค้าลำดับที่ ${value.No + 1}`}</Typography>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    gutterBottom
                                  >
                                    {row.TicketName}
                                  </Typography>
                                  {Object.entries(row.Product).map(
                                    ([key, value]) =>
                                      key !== "P" && (
                                        <Box key={key}>
                                          <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                          >
                                            ประเภทน้ำมัน: {key}
                                          </Typography>
                                          <Typography variant="subtitle2">
                                            ปริมาณ: {value.Volume * 1000} ลิตร
                                          </Typography>
                                        </Box>
                                      ),
                                  )}
                                  {(() => {
                                    let fileUrl = row.file_path;

                                    if (!fileUrl) {
                                      return (
                                        <Typography
                                          variant="subtitle2"
                                          fontWeight="bold"
                                          color="warning"
                                          gutterBottom
                                        >
                                          ไม่มีข้อมูลไฟล์
                                        </Typography>
                                      );
                                    }

                                    // ✅ เติม https ถ้ายังไม่มี
                                    if (
                                      !fileUrl.startsWith("http://") &&
                                      !fileUrl.startsWith("https://")
                                    ) {
                                      fileUrl = `https://${fileUrl}`;
                                    }

                                    return (
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        color={
                                          row.Status === undefined
                                            ? "warning"
                                            : "success"
                                        }
                                        gutterBottom
                                        component="a"
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                          display: "block",
                                          textDecoration: "underline",
                                          cursor: "pointer",
                                          maxWidth: 150,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                        title={fileUrl} // ✅ hover เห็นเต็ม
                                      >
                                        เปิดไฟล์
                                      </Typography>
                                    );
                                  })()}
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    textAlign="right"
                                    marginBottom={-2}
                                    color={
                                      row.Status === undefined
                                        ? "warning"
                                        : "success"
                                    }
                                    gutterBottom
                                  >
                                    {row.Status === undefined
                                      ? "กำลังจัดส่ง"
                                      : row.Status}
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                              >
                                <Box
                                  sx={{
                                    width: "5px",
                                    height: "50px",
                                    backgroundColor: "black",
                                  }}
                                />
                              </Grid>
                            </React.Fragment>
                          )
                        );
                      }),
                    )}
                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor:
                            check.StatusTrips === "จบทริป" &&
                            theme.palette.success.main,
                          color: check.StatusTrips === "จบทริป" && "white",
                        }}
                      >
                        <Typography
                          variant="h6"
                          textAlign="center"
                          fontWeight="bold"
                          gutterBottom
                        >
                          จบเที่ยววิ่ง
                        </Typography>
                      </Paper>
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </>
        )}
        <Box
          height={50}
          sx={{
            backgroundColor: theme.palette.panda.light,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />
      </Paper>
    </Container>
  );
};

export default Driver;
