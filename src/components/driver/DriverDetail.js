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
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import Swal from "sweetalert2";
import {
  ShowConfirm,
  ShowError,
  ShowInfo,
  ShowSuccess,
  ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ImageIcon from "@mui/icons-material/Image";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import "dayjs/locale/th";
import { API_BASE, apiPut } from "../../server/apiClient";
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
import withReactContent from "sweetalert2-react-content";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import RepairTruck from "../truck/RepairTruck";
import TruckRepair from "../truck/headtruck/TruckRepair";

const DriverDetail = () => {
  const branches = [
    "( สาขาที่  00001)/",
    "( สาขาที่  00002)/",
    "( สาขาที่  00003)/",
    "(สำนักงานใหญ่)/",
  ];

  const userId = Cookies.get("sessionToken");
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [tripNew, setTripNew] = useState([]);
  const [orderNew, setOrderNew] = useState([]);
  const [depotNew, setDepotNew] = useState([]);
  const [showTrip, setShowTrip] = useState(true);
  const [repairTruck, setRepairTruck] = useState(true);
  const [check, setCheck] = useState({});

  const { reghead, small, drivers, depots, inspection } = useBasicData();
  const { trip, order, refetch: refetchTripData } = useTripData();
  const inspectionList = Object.values(inspection || {})
  const regheads = Object.values(reghead || {});
  const smalls = Object.values(small || {});
  const trips = Object.values(trip || {}).filter((item) => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

    return (
      deliveryDate.isSameOrAfter(targetDate, "day") ||
      receiveDate.isSameOrAfter(targetDate, "day")
    );
  });
  const orders = Object.values(order || {}).filter((item) => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), "day");
  });
  const depot = Object.values(depots || {});
  const driverDetails = Object.values(drivers || {});

  const driverDeetail = driverDetails.find(
    (row) => row.id === Number(userId.split("$")[1]),
  );
  const registrationDetail = regheads.find(
    (reg) => reg.uuid === driverDeetail?.Registration,
  );

  const driver = regheads.filter((d) => d.Driver != null);

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

  const PREFIXES = [
    "นาย",
    "นาง",
    "นางสาว",
    "เด็กชาย",
    "เด็กหญิง",
    "ด.ช.",
    "ด.ญ.",
  ];

  const splitThaiName = (fullName = "") => {
    if (!fullName.trim()) return { firstName: "", lastName: "" };

    const prefix = PREFIXES.find((p) => fullName.startsWith(p));

    const nameWithoutPrefix = prefix
      ? fullName.slice(prefix.length).trim()
      : fullName.trim();

    const parts = nameWithoutPrefix.split(/\s+/);

    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };
  const { prefix, firstName, lastName } = splitThaiName(driverDeetail?.Name);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dataNo, setDataNo] = useState(null);

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

  const [truck, setTruck] = React.useState(
    `${registrationDetail?.Driver}:${registrationDetail?.RegHead}:${registrationDetail?.RegTail}`,
  );

  useEffect(() => {
    if (!truck || !orders.length || !tripDetail.length) return;

    const driverId = truck?.split(":")?.[0];

    const currentTrip = tripDetail.find((item) => {
      const id = item.Driver;
      return id === driverId;
    });

    if (!currentTrip) {
      return;
    }

    const relatedOrders = orders.filter(
      (item) => Number(item.Trip) === Number(currentTrip.id) - 1,
    );

    const depotZone =
      typeof currentTrip.Depot === "string"
        ? currentTrip.Depot.split(":")[1]
        : "";

    const currentDepot = depot.find((item) => item.Zone === depotZone) ?? {};

    const tripMapped = Object.entries(currentTrip)
      .filter(([key]) => key.startsWith("Order"))
      .reduce((acc, [key, value], index) => {
        acc[index] = {
          Name: value,
          No: index,
          Depot: currentTrip.Depot,
          Trip: currentTrip.id,
        };
        return acc;
      }, {});

    setCheck(currentTrip);
    setTripNew(tripMapped);
    setOrderNew(relatedOrders);
    setDepotNew(currentDepot);
  }, [truck, orders, tripDetail, depot]);

  const completeTrip = async (trip, orders) => {
    try {
      if (!trip?.uuid) return;

      await apiPut(`/api/trip/${trip.uuid}`, {
        StatusTrip: "จบทริป",
        DateEnd: dayjs().format("DD/MM/YYYY"),
      });

      const truckTable = trip.TruckType === "รถใหญ่"
        ? "truck_registration"
        : trip.TruckType === "รถเล็ก"
          ? "truck_small"
          : null;
      const truckMatch = trip.TruckType === "รถเล็ก"
        ? smalls.find((r) => r.uuid === trip.Registration)
        : regheads.find((r) => r.uuid === trip.Registration);

      if (truckTable && truckMatch?.uuid) {
        await apiPut(`/api/${truckTable}/${truckMatch.uuid}`, {
          Status: "ว่าง",
          RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
        });
      }

      refetchTripData?.();
    } catch (error) {
      ShowError("เพิ่มข้อมูลไม่สำเร็จ");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!check || !orderNew?.length) return;

    const isAllDone = orderNew.every((item) => item.Status === "จัดส่งสำเร็จ");

    if (!isAllDone) return;

    completeTrip(check, orderNew);
  }, [check, orderNew]);

  const handleChangeDriver = (e) => {
    const trucks = e.target.value;
    setTruck(trucks);

    const driverId = trucks?.split(":")?.[0];

    const check = tripDetail.find((item) => {
      const id = item.Driver;
      return id === driverId;
    });

    if (!check) {
      setCheck({});
      setTripNew({});
      setOrderNew([]);
      setDepotNew({});
      return;
    }

    // กัน type mismatch + -1 ให้ชัด
    const tripId = Number(check.id) - 1;

    const checkOrder = orders
      .filter((item) => Number(item.Trip) === tripId)
      .sort((a, b) => Number(a.No) - Number(b.No));

    const depotZone =
      typeof check.Depot === "string" ? check.Depot.split(":")?.[1] : "";

    const checkDepot = depot.find((item) => item.Zone === depotZone) ?? {};

    const tripNew = Object.keys(check)
      .filter((key) => key.startsWith("Order") && check[key])
      .reduce((acc, key, index) => {
        acc[index] = {
          Name: check[key],
          No: index,
          Depot: check.Depot,
          Trip: check.id,
        };
        return acc;
      }, {});

    setCheck(check);
    setTripNew(tripNew);
    setOrderNew(checkOrder);
    setDepotNew(checkDepot);

    const isAllDone =
      checkOrder.length > 0 &&
      checkOrder.every((item) => item.Status === "จัดส่งสำเร็จ");

    if (isAllDone) {
      completeTrip(check, checkOrder);
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
        `${API_BASE}/panda/uploads`,
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
      const orderRow = orders.find((item) => item.No === no);
      if (!orderRow?.uuid) {
        throw new Error("ไม่พบข้อมูลที่ต้องการอัปเดต");
      }

      await apiPut(`/api/order/${orderRow.uuid}`, {
        Status: "จัดส่งสำเร็จ",
        file_path: img,
      });

      refetchTripData?.();
      setDialogOpen(false);
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Firebase update error:", error);
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  const generatePDF = (row) => {
    const invoiceData = { order: row, trip: check, depot: depotNew };

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

  const handleBack = () => {
    withReactContent(Swal)
      .fire({
        title: "ต้องการออกจากระบบใช่หรือไม่",
        icon: "error",
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
        showCancelButton: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          Cookies.remove("user");
          Cookies.remove("sessionToken");
          Cookies.remove("token");
          navigate("/");
          Swal.fire("ออกจากระบบเรียบร้อย", "", "success");
        } else if (result.isDenied) {
          Swal.fire("ออกจากระบบล้มเหลว", "", "error");
        }
      });
  };

  const formatAddress = (address) => {
    const parts = address && address.split(/,|\s+/).filter(Boolean);

    if (!parts || parts.length < 5) return "-";

    const [houseNo, moo, subdistrict, district, province, postalCode] = parts;

    return `${houseNo} หมู่ ${moo} ต.${subdistrict} อ.${district} จ.${province} ${postalCode}`;
  };

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
                ออกจากระบบ
              </Button>
            }
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.panda.main}
            gutterBottom
          >
            ยินดีต้อนรับเข้าสู่หน้าพนักงานขับรถ
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
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={12}>
            <Grid
              container
              spacing={1}
              paddingLeft={5}
              paddingRight={5}
              marginBottom={-3}
            >
              <Grid item xs={6} lg={2}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                    gutterBottom
                  >
                    คำนำหน้า :{" "}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    variant="standard"
                    value={prefix}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px", // ขนาด font เวลาพิมพ์
                        fontWeight: "bold",
                        padding: "2px 6px", // ปรับ padding ภายใน input
                        marginLeft: 2,
                        color: "#616161",
                      },
                      "& .MuiInput-underline:before": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} lg={3}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                    gutterBottom
                  >
                    ชื่อ :{" "}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    variant="standard"
                    value={firstName}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px", // ขนาด font เวลาพิมพ์
                        fontWeight: "bold",
                        padding: "2px 6px", // ปรับ padding ภายใน input
                        marginLeft: 2,
                        color: "#616161",
                      },
                      "& .MuiInput-underline:before": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} lg={3}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                    gutterBottom
                  >
                    สกุล :{" "}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    variant="standard"
                    value={lastName}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px", // ขนาด font เวลาพิมพ์
                        fontWeight: "bold",
                        padding: "2px 6px", // ปรับ padding ภายใน input
                        marginLeft: 2,
                        color: "#616161",
                      },
                      "& .MuiInput-underline:before": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                    gutterBottom
                  >
                    ตำแหน่ง :{" "}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    variant="standard"
                    value={driverDeetail?.PositionName || ""}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px", // ขนาด font เวลาพิมพ์
                        fontWeight: "bold",
                        padding: "2px 6px", // ปรับ padding ภายใน input
                        marginLeft: 2,
                        color: "#616161",
                      },
                      "& .MuiInput-underline:before": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} lg={4}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                    gutterBottom
                  >
                    ทะเบียนหัว :{" "}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    variant="standard"
                    value={registrationDetail?.RegHead}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px", // ขนาด font เวลาพิมพ์
                        fontWeight: "bold",
                        padding: "2px 6px", // ปรับ padding ภายใน input
                        marginLeft: 2,
                        color: "#616161",
                      },
                      "& .MuiInput-underline:before": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} lg={4}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                    gutterBottom
                  >
                    ทะเบียนหาง :{" "}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    variant="standard"
                    value={registrationDetail?.RegTailName || ""}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "25px", // ปรับความสูงของ TextField
                        display: "flex", // ใช้ flexbox
                        alignItems: "center", // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "18px", // ขนาด font เวลาพิมพ์
                        fontWeight: "bold",
                        padding: "2px 6px", // ปรับ padding ภายใน input
                        marginLeft: 2,
                        color: "#616161",
                      },
                      "& .MuiInput-underline:before": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={0.5} lg={1} />
          <Grid
            item
            xs={11}
            lg={10}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
          </Grid>
          <Grid item xs={0.5} lg={1} />
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
            <Grid container spacing={2} marginTop={3} marginBottom={3}>
              <Grid item xs={0.5} lg={1} />
              <Grid item xs={11} lg={10}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom={1}
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
                    key={registrationDetail.RepairTruck.split(":")[1]}
                    row={registrationDetail}
                    type={"ตรวจสอบสภาพรถ"}
                  />
                </Box>
                <Box>
                  {!repairTruck && (
                    <RepairTruck
                      selectDriver={
                        registrationDetail?.id -
                        1 +
                        ":" +
                        registrationDetail?.RegHead +
                        ":รถใหญ่"
                      }
                      driverDetail={registrationDetail?.Driver}
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
                        orderNew.map((row, orderIndex) => {
                          // order.TicketName is a real UUID now - match by
                          // position (orderNew is sorted by No, same
                          // sequence as the OrderN slots) instead of name text.
                          return (
                            orderIndex === value.No && (
                              <TableRow key={key}>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {value.No + 1}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                  {row.TicketNameName}
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
                            .filter((row, orderIndex) => orderIndex === value.No)
                            .map((row) =>
                              row.Lat &&
                              row.Lng &&
                              row.Lat !== "-" &&
                              row.Lng !== "-" &&
                              row.Lat !== 0 &&
                              row.Lng !== 0
                                ? `${row.Lat},${row.Lng}`
                                : null,
                            )
                            .filter(Boolean),
                      );

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
                      orderNew.map((row, orderIndex) => {
                        // order.TicketName is a real UUID now - match by
                        // position (orderNew is sorted by No, same sequence
                        // as the OrderN slots) instead of by name text.
                        return (
                          orderIndex === value.No && (
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
                                        {row.TicketNameName}
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
                                            title={fileUrl}
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
                                        {row.TicketNameName}
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
                                            title={fileUrl}
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
                            .filter((row, orderIndex) => orderIndex === value.No)
                            .map((row) =>
                              row.Lat &&
                              row.Lng &&
                              row.Lat !== "-" &&
                              row.Lng !== "-" &&
                              row.Lat !== 0 &&
                              row.Lng !== 0
                                ? `${row.Lat},${row.Lng}`
                                : null,
                            )
                            .filter(Boolean),
                      );

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
                      orderNew.map((row, orderIndex) => {
                        // order.TicketName is a real UUID now - match by
                        // position (orderNew is sorted by No, same sequence
                        // as the OrderN slots) instead of by name text.
                        return (
                          orderIndex === value.No && (
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
                                    {row.TicketNameName}
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
                                        title={fileUrl}
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

export default DriverDetail;
