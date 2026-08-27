import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Cookies from "js-cookie";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { database } from "../../server/firebase";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ITEM_HEIGHT = 30;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const RepairTruck = ({ selectDriver, driverDetail, setRepairTruck, trip }) => {
  const [regHead, setRegHead] = React.useState(selectDriver || "");
  const token = Cookies.get("token");
  const handleChange = (event) => {
    setRegHead(event.target.value);
  };

  const [brakeFluid, setBrakeFluid] = useState("");
  const [clutchOil, setClutchOil] = useState("");
  const [leak_B, setLeak_B] = useState("");
  const [leak_BDetail, setLeak_BDetail] = useState("");
  const [brake, setBrake] = useState("");

  const [distilledWater, setDistilledWater] = useState("");
  const [batteryTerminals, setBatteryTerminals] = useState("");
  const [batteryOrther, setBatteryOrther] = useState("");
  const [batteryStrap, setBatteryStrap] = useState("");
  const [strapOther, setStrapOther] = useState("");
  const [light, setLight] = useState("");
  const [horn, setHorn] = useState("");
  const [hornDetail, setHornDetail] = useState("");

  const [radiator, setRadiator] = useState("");
  const [washerFluid, setWasherFluid] = useState("");
  const [radiatorCap, setRadiatorCap] = useState("");
  const [pressure, setPressure] = useState("");
  const [belt, setBelt] = useState("");
  const [radiatorHose, setRadiatorHose] = useState("");
  const [radiatorHoseDetail, setRadiatorHoseDetail] = useState("");

  const [tireSize, setTireSize] = useState("");
  const [tirePressureMax, setTirePressureMax] = useState("");
  const [weightTruck, setWeightTruck] = useState("");
  const [speed, setSpeed] = useState("");
  const [dateTire, setDateTire] = useState("");
  const [treadDepth, setTreadDepth] = useState("");
  const [cheekRubber, setCheekRubber] = useState("");
  const [cheekRubberDetail, setCheekRubberDetail] = useState("");
  const [tirePressure, setTirePressure] = useState("");
  const [tirePressureHigh, setTirePressureHigh] = useState("");
  const [tirePressureLow, setTirePressureLow] = useState("");
  const [airCap, setAirCap] = useState("");

  const [leak_G, setLeak_G] = useState("");
  const [leak_GDetail, setLeak_GDetail] = useState("");
  const [waterFilter, setWaterFilter] = useState("");
  const [airFilter, setAirFilter] = useState("");

  const [engineOil, setEngineOil] = useState("");
  const [powerSteeringOil, setPowersteeringOil] = useState("");
  const [transmissionFluid, setTransmissionFluid] = useState("");
  const [leak_O, setLeak_O] = useState("");
  const [leak_ODetail, setLeak_ODetail] = useState("");

  const [unusualNoise, setUnusualNoise] = useState("");
  const [unusualNoiseDetail, setUnusualNoiseDetail] = useState("");
  const [mountRubber, setMountRubber] = useState("");
  const [mountRubberDetail, setMountRubberDetail] = useState("");
  const [intake, setIntake] = useState("");
  const [intakeDetail, setIntakeDetail] = useState("");

  const [inspection, setInspection] = React.useState([]);
  const [data, setData] = useState([]);
  const [employee, setEmployee] = useState("");
  const [driver, setDriver] = useState("");
  const [regTail, setRegTail] = useState("");
  const [type, setType] = useState("");
  const [repairSmallTruck, setRepairSmallTruck] = React.useState([]);
  const [repairRegHead, setRepairRegHead] = React.useState([]);

  console.log(
    "🚀 ~ file: RepairTruck.js:143 ~ RepairTruck ~ repairSmallTruck:",
    repairSmallTruck,
  );
  console.log(
    "🚀 ~ file: RepairTruck.js:144 ~ RepairTruck ~ repairRegHead:",
    repairRegHead,
  );

  const getTruck = async () => {
    database.ref("/truck/registration/").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataRepair = [];
      for (let id in datas) {
        if (datas[id].RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ") {
          dataRepair.push({ id, ...datas[id], TruckType: "รถใหญ่" });
        }
      }
      setRepairRegHead(dataRepair);
    });

    database.ref("/truck/small/").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataRepair = [];
      for (let id in datas) {
        if (datas[id].RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ") {
          dataRepair.push({ id, ...datas[id], TruckType: "รถเล็ก" });
        }
      }
      setRepairSmallTruck(dataRepair);
    });
  };

  const getInspection = async () => {
    database.ref("/inspection").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataList = [];
      for (let id in datas) {
        dataList.push({ id, ...datas[id] });
      }
      setInspection(dataList);
    });
  };

  useEffect(() => {
    setRegHead(selectDriver || "");
    setEmployee(driverDetail || "...");
    getTruck();
    getInspection();
  }, [selectDriver, driverDetail]);

  const resetForm = () => {
    // Brake
    setBrakeFluid("");
    setClutchOil("");
    setLeak_B("");
    setLeak_BDetail("");
    setBrake("");

    // Electricity
    setDistilledWater("");
    setBatteryTerminals("");
    setBatteryOrther("");
    setBatteryStrap("");
    setStrapOther("");
    setLight("");
    setHorn("");
    setHornDetail("");

    // Water
    setRadiator("");
    setWasherFluid("");
    setRadiatorCap("");
    setPressure("");
    setBelt("");
    setRadiatorHose("");
    setRadiatorHoseDetail("");

    // Air
    setTireSize("");
    setTirePressureMax("");
    setWeightTruck("");
    setSpeed("");
    setDateTire("");
    setTreadDepth("");
    setCheekRubber("");
    setCheekRubberDetail("");
    setTirePressure("");
    setTirePressureHigh("");
    setTirePressureLow("");
    setAirCap("");

    // Gasoline
    setLeak_G("");
    setLeak_GDetail("");
    setWaterFilter("");
    setAirFilter("");

    // Oils
    setEngineOil("");
    setPowersteeringOil("");
    setTransmissionFluid("");
    setLeak_O("");
    setLeak_ODetail("");

    // Noise
    setUnusualNoise("");
    setUnusualNoiseDetail("");
    setMountRubber("");
    setMountRubberDetail("");
    setIntake("");
    setIntakeDetail("");

    // Other
    setEmployee("");
    setDriver("");
    setRegTail("");
    setType("");
  };

  const handlePost = async () => {
    try {
      const newRef = database.ref("inspection").push();
      const newId = newRef.key;

      const today = dayjs(new Date()).locale("th").format("DD/MM/YYYY");

      const baseData = {
        id: newId,
        Dates: today,
        RegHeadID: regHead.split(":")[0],
        RegHead: regHead.split(":")[1],
        RegTail: regTail,
        Type: regHead.split(":")[2],
        Employee: employee,
      };

      // 🔥 รวมทุกอย่างเป็น object เดียว
      const data = {
        ...baseData,

        Brake: {
          BrakeFluid: brakeFluid,
          ClutchOil: clutchOil,
          Leak_B:
            leak_B === "มีรอยรั่ว" ? `${leak_B}(${leak_BDetail})` : leak_B,
          Brake: brake,
        },

        Electricity: {
          DistilledWater: distilledWater,
          BatteryTerminals:
            batteryTerminals === "อื่นๆ"
              ? `${batteryTerminals}(${batteryOrther})`
              : batteryTerminals,
          BatteryStrap:
            batteryStrap === "อื่นๆ"
              ? `${batteryStrap}(${strapOther})`
              : batteryStrap,
          Light: light,
          Horn: horn === "ใช้ไม่ได้" ? `${horn}(${hornDetail})` : horn,
        },

        Water: {
          Radiator: radiator,
          WasherFluid: washerFluid,
          RadiatorCap:
            radiatorCap === "ความดันสปริงฝาหม้อน้ำ"
              ? `${radiatorCap}(${pressure})`
              : radiatorCap,
          Belt: belt,
          RadiatorHose:
            radiatorHose === "ใช้ไม่ได้"
              ? `${radiatorHose}(${radiatorHoseDetail})`
              : radiatorHose,
        },

        Air: {
          TireSize: tireSize,
          TirePressureMax: tirePressureMax,
          WeightTruck: weightTruck,
          Speed: speed,
          DateTire: dateTire,
          TreadDepth: treadDepth,
          CheekRubber:
            cheekRubber === "ผิดปรกติ"
              ? `${cheekRubber}(${cheekRubberDetail})`
              : cheekRubber,
          TirePressure:
            tirePressure === "สูงไป"
              ? `${tirePressure}(${tirePressureHigh})`
              : tirePressure === "ต่ำไป"
                ? `${tirePressure}(${tirePressureLow})`
                : tirePressure,
          AirCap: airCap,
        },

        Gasoline: {
          Leak_G:
            leak_G === "มีรอยรั่ว" ? `${leak_G}(${leak_GDetail})` : leak_G,
          WaterFilter: waterFilter,
          AirFilter: airFilter,
        },

        Oils: {
          EngineOil: engineOil,
          PowerSteeringOil: powerSteeringOil,
          TransmissionFluid: transmissionFluid,
          Leak_O:
            leak_O === "มีรอยรั่ว" ? `${leak_O}(${leak_ODetail})` : leak_O,
        },

        Noise: {
          UnusualNoise:
            unusualNoise === "มี"
              ? `${unusualNoise}(${unusualNoiseDetail})`
              : unusualNoise,
          MountRubber:
            mountRubber === "ควรเปลี่ยน"
              ? `${mountRubber}(${mountRubberDetail})`
              : mountRubber,
          Intake: intake === "รั่ว" ? `${intake}(${intakeDetail})` : intake,
        },
        employee: employee,
        Trip: trip?.Trip || null,
      };

      // ✅ ยิงครั้งเดียวจบ
      await newRef.set(data);

      // ✅ update truck
      if (regHead.split(":")[2] === "รถใหญ่") {
        await database
          .ref("truck/registration/")
          .child(regHead.split(":")[0])
          .update({
            RepairTruck: `${today}:ตรวจสอบสภาพรถแล้ว`,
          });
      } else if (regHead.split(":")[2] === "รถเล็ก") {
        await database
          .ref("truck/small/")
          .child(regHead.split(":")[0])
          .update({
            RepairTruck: `${today}:ตรวจสอบสภาพรถแล้ว`,
          });
      }

      ShowSuccess("เพิ่มข้อมูลสำเร็จ");
      setRegHead("");
      setRepairTruck(true);
      resetForm();
    } catch (error) {
      ShowError("เพิ่มข้อมูลไม่สำเร็จ");
      console.error(error);
    }
  };

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ p: 5 }}>
        {(selectDriver === "" || selectDriver === undefined) && (
          <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
            <InputLabel id="demo-select-small-label">เลือกทะเบียนรถ</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={regHead}
              label="เลือกทะเบียนรถ"
              onChange={handleChange}
            >
              <MenuItem value="">เลือกทะเบียนรถ</MenuItem>
              {repairRegHead.map(
                (row) =>
                  row.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ" && (
                    <MenuItem
                      value={row.id - 1 + ":" + row.RegHead + ":รถใหญ่"}
                    >
                      {row.RegHead} : {row.Driver.split(":")[1]}
                    </MenuItem>
                  ),
              )}

              {repairSmallTruck.map(
                (row) =>
                  row.RepairTruck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ" && (
                    <MenuItem
                      value={row.id - 1 + ":" + row.RegHead + ":รถเล็ก"}
                    >
                      {row.ShortName} : {row.RegHead}
                    </MenuItem>
                  ),
              )}
            </Select>
          </FormControl>
        )}
        {regHead !== "" ? (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            marginTop={1}
            marginBottom={2}
          >
            {regHead.split(":")[2] === "รถใหญ่"
              ? repairRegHead.map((row) =>
                  row.RegHead === regHead.split(":")[1] ? (
                    <>
                      {/* ชื่อคนขับ */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        ชื่อ
                      </Typography>
                      <TextField
                        placeholder="ระบุ"
                        size="small"
                        variant="standard"
                        value={row?.Driver?.split(":")?.[1] || ""}
                        disabled
                        sx={{ maxWidth: "20vw", ml: 1 }}
                      />

                      {/* ทะเบียนหัว */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        ทะเบียนหัว
                      </Typography>
                      <TextField
                        placeholder="ระบุ"
                        size="small"
                        variant="standard"
                        value={row?.RegHead || ""}
                        disabled
                        sx={{ maxWidth: "10vw", ml: 1 }}
                      />

                      {/* ทะเบียนหาง */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        ทะเบียนหาง
                      </Typography>
                      <TextField
                        placeholder="ระบุ"
                        size="small"
                        variant="standard"
                        value={row?.RegTail?.split(":")?.[1] || ""}
                        disabled
                        sx={{ maxWidth: "10vw", ml: 1 }}
                      />

                      {/* ชนิดรถ */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        ชนิดรถ
                      </Typography>
                      <TextField
                        placeholder="ระบุ"
                        size="small"
                        variant="standard"
                        value={regHead?.split(":")?.[2] || ""}
                        disabled
                        sx={{ maxWidth: "10vw", ml: 1 }}
                      />
                    </>
                  ) : (
                    ""
                  ),
                )
              : regHead.split(":")[2] === "รถเล็ก"
                ? repairSmallTruck.map((row) =>
                    row.RegHead === regHead.split(":")[1] ? (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          ชื่อ{" "}
                        </Typography>
                        <TextField
                          placeholder="ระบุ"
                          size="small"
                          variant="standard"
                          value={row.ShortName}
                          onChange={(e) => setDriver(e.target.value)}
                          disabled
                          sx={{ maxWidth: "20vw", marginLeft: 1 }}
                        />
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          ทะเบียน{" "}
                        </Typography>
                        <TextField
                          placeholder="ระบุ"
                          size="small"
                          variant="standard"
                          value={row.RegHead}
                          disabled
                          sx={{ maxWidth: "10vw", marginLeft: 1 }}
                        />
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          ชนิดรถ{" "}
                        </Typography>
                        <TextField
                          placeholder="ระบุ"
                          size="small"
                          variant="standard"
                          value={regHead.split(":")[2]}
                          onChange={(e) => setType(e.target.value)}
                          disabled
                          sx={{ maxWidth: "10vw", marginLeft: 1 }}
                        />
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          วันที่{" "}
                        </Typography>
                        <TextField
                          placeholder="ระบุ"
                          size="small"
                          variant="standard"
                          value={dayjs(new Date())
                            .locale("th")
                            .format("DD/MM/YYYY")}
                          disabled
                          sx={{ maxWidth: "10vw", marginLeft: 1 }}
                        />
                      </>
                    ) : (
                      ""
                    ),
                  )
                : ""}
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            marginTop={1}
            marginBottom={2}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ชื่อ{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "20vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ทะเบียนหัว{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ทะเบียนหาง{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ชนิดรถ{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              วันที่{" "}
            </Typography>
            <TextField
              placeholder="ระบุ"
              size="small"
              variant="standard"
              value={dayjs(new Date()).locale("th").format("DD/MM/YYYY")}
              disabled
              sx={{ maxWidth: "10vw", marginLeft: 1 }}
            />
          </Box>
        )}
        <Paper
          sx={{
            p: 2,
            boxShadow: "1px 1px 2px 2px " + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            1).ตรวจสอบระบบเบรก
          </Typography>

          <Grid container spacing={2}>
            {/* ===================== (ก) ===================== */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ก.)
                </Typography>
                <Typography>ระดับน้ำมันเบรก</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["สูงไป", "ปกติ", "ต่ำไป", "สภาพใช้ได้", "ควรเปลี่ยน"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      disabled={!regHead}
                      checked={brakeFluid === item}
                      control={
                        <Checkbox onChange={() => setBrakeFluid(item)} />
                      }
                      label={item}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* ===================== (ข) ===================== */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ข.)
                </Typography>
                <Typography>ระดับน้ำมันคลัตช์</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["สูงไป", "ปกติ", "ต่ำไป", "สภาพใช้ได้", "ควรเปลี่ยน"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      disabled={!regHead}
                      checked={clutchOil === item}
                      control={<Checkbox onChange={() => setClutchOil(item)} />}
                      label={item}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* ===================== (ค) ===================== */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ค.)
                </Typography>
                <Typography>รอยรั่วซึมตามจุดต่างๆ</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                <FormControlLabel
                  disabled={!regHead}
                  checked={leak_B === "ไม่มี"}
                  control={<Checkbox onChange={() => setLeak_B("ไม่มี")} />}
                  label="ไม่มี"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={leak_B === "มีรอยรั่ว"}
                  control={<Checkbox onChange={() => setLeak_B("มีรอยรั่ว")} />}
                  label="มีรอยรั่ว"
                />

                {leak_B === "มีรอยรั่ว" && (
                  <TextField
                    placeholder="ระบุ"
                    size="small"
                    disabled={!regHead}
                    value={leak_BDetail}
                    onChange={(e) => setLeak_BDetail(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 180 }}
                  />
                )}
              </Box>
            </Grid>

            {/* ===================== (ง) ===================== */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ง.)
                </Typography>
                <Typography>เบรกมือ</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["เสียงดัง...คลิ๊ก", "ใช้ได้", "ควรปรับตั้ง"].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={brake === item}
                    control={<Checkbox onChange={() => setBrake(item)} />}
                    label={item}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            mt: 2,
            boxShadow: "1px 1px 2px 2px " + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2).ตรวจสอบระบบไฟฟ้า
          </Typography>

          <Grid container spacing={2}>
            {/* ================= (ก) ================= */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ก.)
                </Typography>
                <Typography>ระดับน้ำกลั่น</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["สูงไป", "ปกติ", "ต่ำไป", "ควรเติม"].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={distilledWater === item}
                    control={
                      <Checkbox onChange={() => setDistilledWater(item)} />
                    }
                    label={item}
                  />
                ))}
              </Box>
            </Grid>

            {/* ================= (ข) ================= */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ข.)
                </Typography>
                <Typography>ขั้วแบตเตอรี่</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={batteryTerminals === "แน่นและมีฉนวนหุ่ม"}
                  control={
                    <Checkbox
                      onChange={() => setBatteryTerminals("แน่นและมีฉนวนหุ่ม")}
                    />
                  }
                  label="แน่นและมีฉนวนหุ่ม"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={batteryTerminals === "ไม่แน่น"}
                  control={
                    <Checkbox onChange={() => setBatteryTerminals("ไม่แน่น")} />
                  }
                  label="ไม่แน่น"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={batteryTerminals === "อื่นๆ"}
                  control={
                    <Checkbox onChange={() => setBatteryTerminals("อื่นๆ")} />
                  }
                  label="อื่นๆ"
                />

                {batteryTerminals === "อื่นๆ" && (
                  <TextField
                    size="small"
                    placeholder="ระบุ"
                    disabled={!regHead}
                    value={batteryOrther}
                    onChange={(e) => setBatteryOrther(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 180 }}
                  />
                )}
              </Box>
            </Grid>

            {/* ================= (ค) ================= */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ค.)
                </Typography>
                <Typography>สายรัดและแท่นรองแบตเตอรี่</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={batteryStrap === "แน่นและมีฉนวนหุ่ม"}
                  control={
                    <Checkbox
                      onChange={() => setBatteryStrap("แน่นและมีฉนวนหุ่ม")}
                    />
                  }
                  label="แน่นและมีฉนวนหุ่ม"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={batteryStrap === "ไม่แน่น"}
                  control={
                    <Checkbox onChange={() => setBatteryStrap("ไม่แน่น")} />
                  }
                  label="ไม่แน่น"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={batteryStrap === "อื่นๆ"}
                  control={
                    <Checkbox onChange={() => setBatteryStrap("อื่นๆ")} />
                  }
                  label="อื่นๆ"
                />

                {batteryStrap === "อื่นๆ" && (
                  <TextField
                    size="small"
                    placeholder="ระบุ"
                    disabled={!regHead}
                    value={strapOther}
                    onChange={(e) => setStrapOther(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 180 }}
                  />
                )}
              </Box>
            </Grid>

            {/* ================= (ง) ================= */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ง.)
                </Typography>
                <Typography>ไฟสูง-ต่ำ / ไฟท้าย / ไฟเบรก / ไฟถอยหลัง</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["ใช้ได้", "ควรปรับตั้ง"].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={light === item}
                    control={<Checkbox onChange={() => setLight(item)} />}
                    label={item}
                  />
                ))}
              </Box>
            </Grid>

            {/* ================= (จ) ================= */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (จ.)
                </Typography>
                <Typography>แตร / ที่ปัดน้ำฝน / ที่ฉีดน้ำล้างกระจก</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={horn === "ใช้ได้หมด"}
                  control={<Checkbox onChange={() => setHorn("ใช้ได้หมด")} />}
                  label="ใช้ได้หมด"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={horn === "ใช้ไม่ได้"}
                  control={<Checkbox onChange={() => setHorn("ใช้ไม่ได้")} />}
                  label="ใช้ไม่ได้"
                />

                {horn === "ใช้ไม่ได้" && (
                  <TextField
                    size="small"
                    placeholder="ระบุจุด"
                    disabled={!regHead}
                    value={hornDetail}
                    onChange={(e) => setHornDetail(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 180 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            mt: 2,
            boxShadow: "1px 1px 2px 2px " + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            3).ตรวจสอบระบบน้ำหล่อเย็น
          </Typography>

          <Grid container spacing={2}>
            {/* ================= (ก) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ก.)
                </Typography>
                <Typography>ระดับน้ำในหม้อน้ำและถังพักน้ำสำรอง</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["สูงไป", "ปกติ", "ต่ำไป", "สภาพใช้ได้", "ควรเปลี่ยน"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      disabled={!regHead}
                      checked={radiator === item}
                      control={<Checkbox onChange={() => setRadiator(item)} />}
                      label={item}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* ================= (ข) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ข.)
                </Typography>
                <Typography>ระดับน้ำฉีดกระจก</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["ปกติ", "ควรเติม"].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={washerFluid === item}
                    control={<Checkbox onChange={() => setWasherFluid(item)} />}
                    label={item}
                  />
                ))}
              </Box>
            </Grid>

            {/* ================= (ค) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ค.)
                </Typography>
                <Typography>ฝาปิดหม้อน้ำ</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={radiatorCap === "ใช้ได้"}
                  control={
                    <Checkbox onChange={() => setRadiatorCap("ใช้ได้")} />
                  }
                  label="ใช้ได้"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={radiatorCap === "ควรเปลี่ยน"}
                  control={
                    <Checkbox onChange={() => setRadiatorCap("ควรเปลี่ยน")} />
                  }
                  label="ควรเปลี่ยน"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={radiatorCap === "ความดันสปริงฝาหม้อน้ำ"}
                  control={
                    <Checkbox
                      onChange={() => setRadiatorCap("ความดันสปริงฝาหม้อน้ำ")}
                    />
                  }
                  label="ความดันสปริงฝาหม้อน้ำ"
                />

                {radiatorCap === "ความดันสปริงฝาหม้อน้ำ" && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      size="small"
                      placeholder="กรอก.."
                      disabled={!regHead}
                      value={pressure}
                      onChange={(e) => setPressure(e.target.value)}
                      variant="standard"
                      sx={{ minWidth: 120 }}
                    />
                    <Typography variant="body2">กก/ชม.2</Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* ================= (ง) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (ง.)
                </Typography>
                <Typography>สายพานทุกเส้น</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {["ตึง", "พอดี", "หย่อน", "สภาพดี", "ควรเปลี่ยน"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      disabled={!regHead}
                      checked={belt === item}
                      control={<Checkbox onChange={() => setBelt(item)} />}
                      label={item}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* ================= (จ) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold" sx={{ mr: 1 }}>
                  (จ.)
                </Typography>
                <Typography>ท่อยางหม้อน้ำ</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={radiatorHose === "ใช้ได้"}
                  control={
                    <Checkbox onChange={() => setRadiatorHose("ใช้ได้")} />
                  }
                  label="ใช้ได้"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={radiatorHose === "ใช้ไม่ได้"}
                  control={
                    <Checkbox onChange={() => setRadiatorHose("ใช้ไม่ได้")} />
                  }
                  label="ใช้ไม่ได้"
                />

                {radiatorHose === "ใช้ไม่ได้" && (
                  <TextField
                    size="small"
                    placeholder="ระบุจุด"
                    disabled={!regHead}
                    value={radiatorHoseDetail}
                    onChange={(e) => setRadiatorHoseDetail(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 180 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            mt: 2,
            boxShadow: "1px 1px 2px 2px " + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4).ตรวจลมยางและกระทะล้อ
          </Typography>

          <Grid container spacing={2}>
            {/* ================= (ก) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                <Typography fontWeight="bold">(ก.)</Typography>
                <Typography>ขนาดยางและข้อมูลสเปค</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="ขนาดยาง"
                  disabled={!regHead}
                  value={tireSize}
                  onChange={(e) => setTireSize(e.target.value)}
                  variant="standard"
                />

                <TextField
                  size="small"
                  type="number"
                  placeholder="ลมยางสูงสุด"
                  disabled={!regHead}
                  value={tirePressureMax}
                  onChange={(e) => setTirePressureMax(e.target.value)}
                  variant="standard"
                />

                <TextField
                  size="small"
                  type="number"
                  placeholder="น้ำหนักบรรทุก"
                  disabled={!regHead}
                  value={weightTruck}
                  onChange={(e) => setWeightTruck(e.target.value)}
                  variant="standard"
                />

                <TextField
                  size="small"
                  type="number"
                  placeholder="ความเร็ว"
                  disabled={!regHead}
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  variant="standard"
                />

                <TextField
                  size="small"
                  type="date"
                  disabled={!regHead}
                  value={dateTire}
                  onChange={(e) => setDateTire(e.target.value)}
                  variant="standard"
                />
              </Box>
            </Grid>

            {/* ================= (ข) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold">(ข.)</Typography>
                <Typography>ความลึกดอกยาง</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {["มากกว่า 1.6 มม.", "น้อยกว่า 1.6 มม."].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={treadDepth === item}
                    control={<Checkbox onChange={() => setTreadDepth(item)} />}
                    label={item}
                  />
                ))}
              </Box>
            </Grid>

            {/* ================= (ค) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold">(ค.)</Typography>
                <Typography>สภาพแก้มยาง</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={cheekRubber === "ปกติ"}
                  control={<Checkbox onChange={() => setCheekRubber("ปกติ")} />}
                  label="ปกติ"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={cheekRubber === "ผิดปกติ"}
                  control={
                    <Checkbox onChange={() => setCheekRubber("ผิดปกติ")} />
                  }
                  label="ผิดปกติ"
                />

                {cheekRubber === "ผิดปกติ" && (
                  <TextField
                    size="small"
                    placeholder="ระบุล้อ"
                    disabled={!regHead}
                    value={cheekRubberDetail}
                    onChange={(e) => setCheekRubberDetail(e.target.value)}
                    variant="standard"
                  />
                )}
              </Box>
            </Grid>

            {/* ================= (ง) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold">(ง.)</Typography>
                <Typography>ความดันลมยาง</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={tirePressure === "ถูกต้องตามคู่มือรถ"}
                  control={
                    <Checkbox
                      onChange={() => setTirePressure("ถูกต้องตามคู่มือรถ")}
                    />
                  }
                  label="ถูกต้อง"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={tirePressure === "สูงไป"}
                  control={
                    <Checkbox onChange={() => setTirePressure("สูงไป")} />
                  }
                  label="สูงไป"
                />

                {tirePressure === "สูงไป" && (
                  <TextField
                    size="small"
                    placeholder="ระบุล้อ"
                    disabled={!regHead}
                    value={tirePressureHigh}
                    onChange={(e) => setTirePressureHigh(e.target.value)}
                    variant="standard"
                  />
                )}

                <FormControlLabel
                  disabled={!regHead}
                  checked={tirePressure === "น้อยไป"}
                  control={
                    <Checkbox onChange={() => setTirePressure("น้อยไป")} />
                  }
                  label="น้อยไป"
                />

                {tirePressure === "น้อยไป" && (
                  <TextField
                    size="small"
                    placeholder="ระบุล้อ"
                    disabled={!regHead}
                    value={tirePressureLow}
                    onChange={(e) => setTirePressureLow(e.target.value)}
                    variant="standard"
                  />
                )}
              </Box>
            </Grid>

            {/* ================= (จ) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Typography fontWeight="bold">(จ.)</Typography>
                <Typography>ฝาปิดจุ๊บเติมลม</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {["มีครบ", "มีไม่ครบ"].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={airCap === item}
                    control={<Checkbox onChange={() => setAirCap(item)} />}
                    label={item}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            mt: 2,
            boxShadow: "1px 1px 2px 2px " + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            5-6).ตรวจระบบของเหลวทั้งหมด
          </Typography>

          <Grid container spacing={3}>
            {/* ================= 5 (ก) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(5 ก.)</Typography>
                <Typography>รอยรั่วซึมระบบเชื้อเพลิง</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={leak_G === "ไม่มี"}
                  control={<Checkbox onChange={() => setLeak_G("ไม่มี")} />}
                  label="ไม่มี"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={leak_G === "มีรอยรั่ว"}
                  control={<Checkbox onChange={() => setLeak_G("มีรอยรั่ว")} />}
                  label="มีรอยรั่ว"
                />

                {leak_G === "มีรอยรั่ว" && (
                  <TextField
                    size="small"
                    placeholder="ระบุจุดที่รั่ว"
                    disabled={!regHead}
                    value={leak_GDetail}
                    onChange={(e) => setLeak_GDetail(e.target.value)}
                    variant="standard"
                  />
                )}
              </Box>
            </Grid>

            {/* ================= 5 (ข) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(5 ข.)</Typography>
                <Typography>กรองดักน้ำ (ดีเซล)</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {["มีน้ำ", "ไม่มีน้ำ", "ไม่แน่ใจ"].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={waterFilter === item}
                    control={<Checkbox onChange={() => setWaterFilter(item)} />}
                    label={item}
                  />
                ))}
              </Box>
            </Grid>

            {/* ================= 5 (ค) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(5 ค.)</Typography>
                <Typography>กรองอากาศ</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {["สภาพดี", "พอใช้", "ควรเปลี่ยน"].map((item) => (
                  <FormControlLabel
                    key={item}
                    disabled={!regHead}
                    checked={airFilter === item}
                    control={<Checkbox onChange={() => setAirFilter(item)} />}
                    label={item}
                  />
                ))}
              </Box>
            </Grid>

            {/* ================= 6 (ก) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(6 ก.)</Typography>
                <Typography>ระดับน้ำมันเครื่อง</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {["สูงไป", "ปกติ", "ต่ำไป", "สภาพใช้ได้", "ควรเปลี่ยน"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      disabled={!regHead}
                      checked={engineOil === item}
                      control={<Checkbox onChange={() => setEngineOil(item)} />}
                      label={item}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* ================= 6 (ข) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(6 ข.)</Typography>
                <Typography>พวงมาลัยพาวเวอร์</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {["สูงไป", "ปกติ", "ต่ำไป", "สภาพใช้ได้", "ควรเปลี่ยน"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      disabled={!regHead}
                      checked={powerSteeringOil === item}
                      control={
                        <Checkbox onChange={() => setPowersteeringOil(item)} />
                      }
                      label={item}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* ================= 6 (ค) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(6 ค.)</Typography>
                <Typography>น้ำเกียร์อัตโนมัติ</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {["สูงไป", "ปกติ", "ต่ำไป", "สภาพใช้ได้", "ควรเปลี่ยน"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      disabled={!regHead}
                      checked={transmissionFluid === item}
                      control={
                        <Checkbox onChange={() => setTransmissionFluid(item)} />
                      }
                      label={item}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* ================= 6 (ง) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(6 ง.)</Typography>
                <Typography>รอยรั่วระบบหล่อลื่น</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={leak_O === "ไม่มี"}
                  control={<Checkbox onChange={() => setLeak_O("ไม่มี")} />}
                  label="ไม่มี"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={leak_O === "มีรอยรั่ว"}
                  control={<Checkbox onChange={() => setLeak_O("มีรอยรั่ว")} />}
                  label="มีรอยรั่ว"
                />

                {leak_O === "มีรอยรั่ว" && (
                  <TextField
                    size="small"
                    placeholder="ระบุจุดที่รั่ว"
                    disabled={!regHead}
                    value={leak_ODetail}
                    onChange={(e) => setLeak_ODetail(e.target.value)}
                    variant="standard"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          sx={{
            p: 2,
            mt: 2,
            boxShadow: "1px 1px 2px 2px " + theme.palette.grey[600],
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            7).เสียงดังต่างๆ
          </Typography>

          <Grid container spacing={3}>
            {/* ================= (ก) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(ก.)</Typography>
                <Typography>เสียงดังผิดปกติอื่นๆ</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={unusualNoise === "ไม่มี"}
                  control={
                    <Checkbox onChange={() => setUnusualNoise("ไม่มี")} />
                  }
                  label="ไม่มี"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={unusualNoise === "มี"}
                  control={<Checkbox onChange={() => setUnusualNoise("มี")} />}
                  label="มี"
                />

                {unusualNoise === "มี" && (
                  <TextField
                    size="small"
                    placeholder="ระบุจุด"
                    disabled={!regHead}
                    value={unusualNoiseDetail}
                    onChange={(e) => setUnusualNoiseDetail(e.target.value)}
                    variant="standard"
                  />
                )}
              </Box>
            </Grid>

            {/* ================= (ข) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(ข.)</Typography>
                <Typography>ยางแท่นเครื่อง</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={mountRubber === "ใช้ได้"}
                  control={
                    <Checkbox onChange={() => setMountRubber("ใช้ได้")} />
                  }
                  label="ใช้ได้"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={mountRubber === "ควรเปลี่ยน"}
                  control={
                    <Checkbox onChange={() => setMountRubber("ควรเปลี่ยน")} />
                  }
                  label="ควรเปลี่ยน"
                />

                {mountRubber === "ควรเปลี่ยน" && (
                  <TextField
                    size="small"
                    placeholder="ระบุจุด"
                    disabled={!regHead}
                    value={mountRubberDetail}
                    onChange={(e) => setMountRubberDetail(e.target.value)}
                    variant="standard"
                  />
                )}
              </Box>
            </Grid>

            {/* ================= (ค) ================= */}
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography fontWeight="bold">(ค.)</Typography>
                <Typography>ท่อไอเสีย</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <FormControlLabel
                  disabled={!regHead}
                  checked={intake === "ไม่รั่ว"}
                  control={<Checkbox onChange={() => setIntake("ไม่รั่ว")} />}
                  label="ไม่รั่ว"
                />

                <FormControlLabel
                  disabled={!regHead}
                  checked={intake === "รั่ว"}
                  control={<Checkbox onChange={() => setIntake("รั่ว")} />}
                  label="รั่ว"
                />

                {intake === "รั่ว" && (
                  <TextField
                    size="small"
                    placeholder="ระบุจุดที่รั่ว"
                    disabled={!regHead}
                    value={intakeDetail}
                    onChange={(e) => setIntakeDetail(e.target.value)}
                    variant="standard"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        {regHead !== "" ? (
          <Grid container spacing={2} marginTop={3}>
            <Grid item xs={9}></Grid>
            <Grid item xs={3} textAlign="center">
              <TextField
                placeholder="ลงชื่อ"
                size="small"
                variant="standard"
                value={employee && employee.split(":")[1]}
                InputLabelProps={{
                  style: { textAlign: "center", width: "100%" }, // จัดให้ label อยู่ตรงกลาง
                }}
                inputProps={{
                  style: { textAlign: "center" }, // จัดให้ input text อยู่ตรงกลาง (ถ้าต้องการ)
                }}
                disabled
              />
              <Typography
                variant="subtitle1"
                textAlign="center"
                fontWeight="bold"
                gutterBottom
              >
                ลงชื่อผู้ตรวจสภาพรถ
              </Typography>
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Button
                variant="contained"
                size="large"
                color="success"
                onClick={handlePost}
              >
                บันทึก
              </Button>
            </Grid>
          </Grid>
        ) : (
          ""
        )}
      </Container>
    </React.Fragment>
  );
};

export default RepairTruck;
