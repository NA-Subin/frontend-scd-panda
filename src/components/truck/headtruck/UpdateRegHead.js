import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  RadioGroup,
  Select,
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
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from "@mui/icons-material/Settings";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import theme from "../../../theme/theme";
import {
  IconButtonError,
  IconButtonSuccess,
  IconButtonWarning,
  RateOils,
  TablecellHeader,
} from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { database } from "../../../server/firebase";
import { API_BASE } from "../../../server/apiClient";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useData } from "../../../server/path";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import TruckRepair from "./TruckRepair";
import FilePreview from "../UploadButton";

const UpdateRegHead = (props) => {
  const { truck, open, onClose, type } = props;
  const [update, setUpdate] = React.useState(true);

  // const { regtail, company, drivers } = useData();
  const { regtail, company, drivers } = useBasicData();
  const dataregtail = Object.values(regtail || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const dataCompany = Object.values(company || {});
  const dataDrivers = Object.values(drivers || {});
  const registrationTail = dataregtail.filter(
    (row) => row.Status === "ยังไม่ได้เชื่อมต่อทะเบียนหัว",
  );
  const employees = dataDrivers.filter(
    (row) =>
      row.Registration &&
      row.Registration === "0:ไม่มี" &&
      (row.TruckType === "รถใหญ่" || row.TruckType === "รถใหญ่/รถเล็ก"),
  );

  const [companies, setCompanies] = React.useState(truck.Company);
  const [driver, setDriver] = React.useState(truck.Driver);
  const [regHead, setRegHead] = React.useState(truck.RegHead);
  const [regTail, setRegTail] = React.useState(() => {
    if (truck.RegTail === "0:ไม่มี") return "0:ไม่มี:0:0";
    const match = dataregtail.find(
      (item) => item.uuid === truck.RegTail,
    );
    return match
      ? `${match.id}:${match.RegTail}:${match.Cap}:${match.Weight}`
      : "";
  });

  console.log("regHead :", `${truck.id}:${regHead}`);

  const [statusTruck, setStatusTruck] = React.useState(truck.Status);
  const [weight, setWeight] = React.useState(truck.Weight);
  const [insurance, setInsurance] = React.useState(truck.Insurance);
  const [vehicleRegistration, setVehicleRegistration] = React.useState(
    truck.VehicleRegistration === "มี" ? true : false,
  );
  const [vehExpirationDate, setVehExpirationDate] = React.useState(
    truck.VehExpirationDate,
  );
  console.log("regTail :", regTail);

  let initialFile = "ไม่แนบไฟล์";
  let initialFileType = 1;

  if (truck?.Path) {
    const lower = truck.Path.toLowerCase();

    if (lower.endsWith(".pdf")) {
      initialFile = truck.Path;
      initialFileType = 2;
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) {
      initialFile = truck.Path;
      initialFileType = 3;
    }
  }

  const [file, setFile] = useState(initialFile);
  const [fileType, setFileType] = useState(initialFileType);

  console.log("show truck", truck.Driver - 1);
  console.log("show Driver : ", driver);

  const handleCancle = () => {
    setCompanies(truck.Company);
    setDriver(truck.Driver);
    setRegHead(truck.RegHead);
    const match = dataregtail.find(
      (item) => item.uuid === truck.RegTail,
    );

    setRegTail(
      match ? `${match.id}:${match.RegTail}:${match.Cap}:${match.Weight}` : "",
    );
    setWeight(truck.Weight);
    setInsurance(truck.Insurance);
    setVehicleRegistration(truck.VehicleRegistration);
    setVehExpirationDate(truck.VehExpirationDate);
    setFile(initialFile);
    setFileType(initialFileType);
    setUpdate(true);
    setStatusTruck(truck.Status);
  };

  const handleUpdate = async () => {
    if (!file) return alert("กรุณาเลือกไฟล์ก่อน");

    let img = "ไม่แนบไฟล์"; // ตั้งค่าเริ่มต้นไว้เลย

    // ✅ ตรวจสอบก่อนว่า file เป็น "ไม่แนบไฟล์" หรือไม่
    if (file !== "ไม่แนบไฟล์") {
      const formData = new FormData();
      formData.append("pic", file);

      try {
        const response = await fetch(
          `${API_BASE}/panda/uploads`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await response.json();
        img = data.file_path;
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    const oldRegistration = "1:71-1639";
const newRegistration = `${truck.id}:${regHead}`;

// // =========================
// // ORDER
// // =========================
// database.ref("/order").once("value", (snapshot) => {
//   snapshot.forEach((child) => {
//     const data = child.val();

//     if (data?.Registration === oldRegistration) {
//       database
//         .ref(`/order/${child.key}`)
//         .update({
//           Registration: newRegistration,
//         });
//     }
//   });
// });

// // =========================
// // TRIP
// // =========================
// database.ref("/trip").once("value", (snapshot) => {
//   snapshot.forEach((child) => {
//     const data = child.val();

//     if (data?.Registration === oldRegistration) {
//       database
//         .ref(`/trip/${child.key}`)
//         .update({
//           Registration: newRegistration,
//         });
//     }
//   });
// });

// // =========================
// // TICKET
// // =========================
// database.ref("/tickets").once("value", (snapshot) => {
//   snapshot.forEach((child) => {
//     const data = child.val();

//     if (data?.Registration === oldRegistration) {
//       database
//         .ref(`/tickets/${child.key}`)
//         .update({
//           Registration: newRegistration,
//         });
//     }
//   });
// });

database.ref("/report/invoice").once("value", (snapshot) => {
  snapshot.forEach((child) => {
    const data = child.val();

    if (data?.Registration === oldRegistration) {
      database
        .ref(`/report/invoice/${child.key}`)
        .update({
          Registration: newRegistration,
        });
    }
  });
});

    database
      .ref("/truck/registration/")
      .child(truck.id - 1)
      .update({
        RegHead: regHead,
        RegTail: `${regTail.split(":")[0]}:${regTail.split(":")[1]}`,
        Weight: weight,
        TotalWeight: parseFloat(weight) + parseFloat(regTail.split(":")[3]),
        Insurance: insurance,
        VehicleRegistration: vehicleRegistration ? "มี" : "ไม่มี",
        VehExpirationDate: vehExpirationDate || "-",
        Company: companies,
        Driver: driver,
        Path: vehicleRegistration ? img : "ไม่แนบไฟล์",
        Status: statusTruck,
      })
      .then(() => {
        const newDriverId = Number(driver?.split?.(":")[0] || 0);
        const oldDriverId = Number(truck?.Driver?.split?.(":")[0] || 0);

        const updates = [];

        // ✅ 1. ล้างของเก่า (ถ้ามี)
        if (oldDriverId !== 0) {
          updates.push(
            database
              .ref("/employee/drivers/")
              .child(oldDriverId - 1)
              .update({
                Registration: "0:ไม่มี",
              }),
          );
        }

        // ✅ 2. ถ้าเลือกใหม่ไม่ใช่ 0 → ใส่ค่าใหม่
        if (newDriverId !== 0) {
          updates.push(
            database
              .ref("/employee/drivers/")
              .child(newDriverId - 1)
              .update({
                Registration: `${truck.id}:${regHead}`,
              }),
          );
        }

        Promise.all(updates)
          .then(() => {
            ShowSuccess("แก้ไขข้อมูลสำเร็จ");
            setUpdate(true);
          })
          .catch((err) => {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error(err);
          });

        const newRegId = Number(regTail?.split?.(":")[0] || 0);
        const oldRegId = Number(truck?.RegTail?.split?.(":")[0] || 0);

        const regUpdates = [];

        // ล้างของเก่า
        if (oldRegId !== 0) {
          regUpdates.push(
            database
              .ref("/truck/registrationTail/")
              .child(oldRegId - 1)
              .update({
                Status: "ยังไม่ได้เชื่อมต่อทะเบียนหัว",
              }),
          );
        }

        // ใส่ของใหม่
        if (newRegId !== 0) {
          regUpdates.push(
            database
              .ref("/truck/registrationTail/")
              .child(newRegId - 1)
              .update({
                Status: "เชื่อมทะเบียนหัวแล้ว",
              }),
          );
        }

        Promise.all(regUpdates)
          .then(() => console.log("Registration updated"))
          .catch((err) => console.error(err));
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
  };

  console.log("registrationTail :", registrationTail);

  return (
    <React.Fragment>
      {/* <IconButton size="small" sx={{ marginTop: -0.5, marginRight: 1 }} onClick={() => setOpen(truck.id)}><InfoIcon color="info" fontSize="12px" /></IconButton> */}
      <Dialog
        open={open && type === "รายละเอียด" ? true : false} // convert เป็น boolean ให้แน่นอน
        keepMounted
        onClose={onClose} // ใช้ตรง ๆ
        sx={{
          "& .MuiDialog-paper": {
            width: "800px", // กำหนดความกว้างแบบ Fixed
            maxWidth: "none", // ปิดการปรับอัตโนมัติ
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <Typography variant="h6" fontWeight="bold" color="white">
                รายละเอียดรถทะเบียน{regHead}
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign="right">
              <IconButtonError onClick={onClose}>
                <CancelIcon />
              </IconButtonError>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Box
            marginTop={2}
            marginBottom={-2}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "right",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color={
                truck.RepairTruck.split(":")[1] === "ตรวจสอบสภาพรถแล้ว"
                  ? theme.palette.success.main
                  : theme.palette.warning.main
              }
              textAlign="right"
              marginRight={2}
              gutterBottom
            >
              {truck.RepairTruck.split(":")[1]}
            </Typography>
            <TruckRepair
              key={truck.RepairTruck.split(":")[1]}
              row={truck}
              type={"ตรวจสอบสภาพรถ"}
            />
          </Box>
          <Paper
            sx={{
              p: 2,
              border: "1px solid" + theme.palette.grey[600],
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  ชื่อพนักงานขับรถ
                </Typography>
              </Grid>
              <Grid item xs={10}>
                {update ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    value={driver.split(":")[1]}
                    disabled
                  />
                ) : (
                  <FormControl variant="standard" fullWidth>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                    >
                      <MenuItem value={driver}>{driver.split(":")[1]}</MenuItem>
                      {driver !== "0:ไม่มี" && (
                        <MenuItem value={"0:ไม่มี"}>ไม่มี</MenuItem>
                      )}
                      {employees.map((row) => (
                        <MenuItem value={`${row.id}:${row.Name}`}>
                          {row.Name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={1.5}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="left"
                  gutterBottom
                >
                  ทะเบียนหัว
                </Typography>
              </Grid>
              <Grid item xs={4.5}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={regHead}
                  disabled={update ? true : false}
                  onChange={(e) => setRegHead(e.target.value)}
                />
              </Grid>
              <Grid item xs={1.5}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="center"
                  gutterBottom
                >
                  ทะเบียนหาง
                </Typography>
              </Grid>
              <Grid item xs={4.5}>
                {update ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    value={regTail.split(":")[1]}
                    disabled
                  />
                ) : (
                  <FormControl variant="standard" fullWidth>
                    <Select
                      id="demo-simple-select"
                      value={regTail}
                      size="small"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            "& .MuiMenuItem-root": {
                              fontSize: "14px", // ขนาดตัวอักษรในรายการเมนู
                            },
                          },
                        },
                      }}
                      sx={{ textAlign: "left", height: 25, fontSize: "14px" }}
                      onChange={(e) => setRegTail(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value={regTail}>
                        {regTail.split(":")[1]}
                      </MenuItem>
                      {regTail !== "0:ไม่มี:0:0" && (
                        <MenuItem value={"0:ไม่มี:0:0"}>ไม่มี</MenuItem>
                      )}
                      {registrationTail.map((row) => (
                        <MenuItem
                          value={`${row.id}:${row.RegTail}:${row.Cap}:${row.Weight}`}
                        >
                          {row.RegTail}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={1}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="left"
                  gutterBottom
                >
                  บริษัท
                </Typography>
              </Grid>
              <Grid item xs={11}>
                {update ? (
                  <TextField
                    fullWidth
                    variant="standard"
                    value={companies.split(":")[1]}
                    disabled
                  />
                ) : (
                  // <FormControl variant="standard" fullWidth>
                  //     <Select
                  //         labelId="demo-simple-select-standard-label"
                  //         id="demo-simple-select-standard"
                  //         value={companies}
                  //         onChange={(e) => setCompanies(e.target.value)}
                  //     >
                  //         <MenuItem value={companies}>{companies.split(":")[1]}</MenuItem>
                  //         {
                  //             dataCompany.map((truck) => (
                  //                 (truck.id !== 1 && truck.id !== Number(companies.split(":")[0])) &&
                  //                 <MenuItem value={`${truck.id}:${truck.Name}`}>{truck.Name}</MenuItem>
                  //             ))
                  //         }
                  //     </Select>
                  // </FormControl>
                  <FormControl
                    variant="standard"
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": { height: "30px" },
                      "& .MuiInputBase-input": {
                        fontSize: "16px",
                        textAlign: "left",
                      },
                    }}
                  >
                    <Select
                      value={companies}
                      onChange={(e) => setCompanies(e.target.value)}
                    >
                      <MenuItem value={companies} sx={{ fontSize: "14px" }}>
                        {companies.split(":")[1]}
                      </MenuItem>
                      {Number(companies.split(":")[0]) !== 2 && (
                        <MenuItem
                          value="2:บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)"
                          sx={{ fontSize: "14px" }}
                        >
                          บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)
                        </MenuItem>
                      )}
                      {Number(companies.split(":")[0]) !== 3 && (
                        <MenuItem
                          value="3:หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)"
                          sx={{ fontSize: "14px" }}
                        >
                          หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={1}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  น้ำหนัก
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={weight}
                  disabled={update ? true : false}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Grid>
              <Grid item xs={1}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  ประกัน
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={insurance}
                  disabled={update ? true : false}
                  onChange={(e) => setInsurance(e.target.value)}
                />
              </Grid>
              <Grid item xs={3} display="flex">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="center"
                  marginRight={1}
                  gutterBottom
                >
                  สถานะ:
                </Typography>
                {update ? (
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color={statusTruck === "ว่าง" ? theme.palette.success.main : theme.palette.error.main}
                    textAlign="center"
                    gutterBottom
                  >
                    {truck.Status}
                  </Typography>
                ) : (
                  <FormControl
                    variant="standard"
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": { height: "30px" },
                      "& .MuiInputBase-input": {
                        fontSize: "16px",
                        textAlign: "left",
                      },
                    }}
                  >
                    <Select
                      value={statusTruck}
                      onChange={(e) => setStatusTruck(e.target.value)}
                    >
                      <MenuItem value="ว่าง" sx={{ fontSize: "14px" }}>
                        ว่าง
                      </MenuItem>
                      <MenuItem value="ขายแล้ว" sx={{ fontSize: "14px" }}>
                        ขายแล้ว
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12} marginTop={2} marginBottom={2}>
                <Divider>
                  <Chip label="ใบจดทะเบียนรถ" size="small" />
                </Divider>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  เลขจดทะเบียน
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Stack direction="row" spacing={2}>
                  {/* มี */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={update}
                        checked={vehicleRegistration === true}
                        onChange={() => setVehicleRegistration(true)}
                      />
                    }
                    label="มี"
                  />

                  {/* ไม่มี */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={update}
                        checked={vehicleRegistration === false}
                        onChange={() => setVehicleRegistration(false)}
                      />
                    }
                    label="ไม่มี"
                  />
                </Stack>
              </Grid>
              <Grid item xs={2}>
                {!vehicleRegistration ? null : (
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    วันหมดอายุ
                  </Typography>
                )}
              </Grid>
              <Grid item xs={4}>
                {!vehicleRegistration ? null : (
                  <TextField
                    variant="standard"
                    fullWidth
                    value={vehExpirationDate}
                    disabled={update ? true : false}
                    onChange={(e) => setVehExpirationDate(e.target.value)}
                  />
                )}
              </Grid>
              {!vehicleRegistration ? null : (
                <React.Fragment>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      textAlign="center"
                      gutterBottom
                    >
                      รูปภาพใบจดทะเบียน
                    </Typography>
                  </Grid>
                  <Grid item xs={12} textAlign="center">
                    {truck.VehPicture === "ไม่มี" ? (
                      update ? (
                        <>
                          <Box textAlign="center">
                            {/* <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={file.name}
                                                                        sx={{ marginRight: 2 }}
                                                                    /> */}

                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {file === "ไม่แนบไฟล์" ? (
                                <ImageNotSupportedIcon
                                  fontSize="small"
                                  color="disabled"
                                  sx={{ width: 200, height: 200 }}
                                />
                              ) : (
                                <FilePreview file={file} />
                              )}
                            </Box>
                            <Box textAlign="center">
                              {file instanceof File ? (
                                // ✅ กรณีเป็น File object
                                <Typography variant="subtitle1" gutterBottom>
                                  {file.name}
                                </Typography>
                              ) : // ✅ กรณีเป็น path (string)
                              file === "ไม่แนบไฟล์" ? null : (
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                  component="a"
                                  href={
                                    file.startsWith("http")
                                      ? file
                                      : `https://${file}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    wordBreak: "break-all",
                                    textDecoration: "underline",
                                    color: "primary.main",
                                    cursor: "pointer",
                                  }}
                                >
                                  {file}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <React.Fragment>
                          {
                            file === "ไม่แนบไฟล์" ? (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ paddingLeft: 3, paddingRight: 3 }}
                              >
                                <Button
                                  variant="contained"
                                  component="label"
                                  size="small"
                                  fullWidth
                                  sx={{
                                    height: "50px",
                                    backgroundColor:
                                      fileType === 1 ? "#5552ffff" : "#eeeeee",
                                    borderRadius: 2,
                                  }}
                                  onClick={() => {
                                    setFileType(1);
                                    setFile("ไม่แนบไฟล์");
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    color={
                                      fileType === 1 ? "white" : "lightgray"
                                    }
                                    sx={{
                                      whiteSpace: "nowrap",
                                      marginTop: 0.5,
                                    }}
                                    gutterBottom
                                  >
                                    ไม่แนบไฟล์
                                  </Typography>
                                  <FolderOffIcon
                                    sx={{
                                      fontSize: 30,
                                      color:
                                        fileType === 1 ? "white" : "lightgray",
                                      marginLeft: 0.5,
                                    }}
                                  />
                                </Button>
                                {/* <Chip label="หรือ" size="small" sx={{ marginLeft: 3, marginRight: 3 }} /> */}
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  sx={{
                                    marginLeft: 3,
                                    marginRight: 3,
                                    marginTop: 0.5,
                                  }}
                                  gutterBottom
                                >
                                  หรือ
                                </Typography>
                                <Button
                                  variant="contained"
                                  component="label"
                                  size="small"
                                  fullWidth
                                  sx={{
                                    height: "50px",
                                    backgroundColor:
                                      fileType === 2 ? "#ff5252" : "#eeeeee",
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  onClick={() => setFileType(2)}
                                >
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={
                                      fileType === 2 ? "white" : "lightgray"
                                    }
                                    gutterBottom
                                  >
                                    PDF
                                  </Typography>
                                  <PictureAsPdfIcon
                                    sx={{
                                      fontSize: 40,
                                      color:
                                        fileType === 2 ? "white" : "lightgray",
                                      marginLeft: 0.5,
                                    }}
                                  />
                                  <input
                                    type="file"
                                    hidden
                                    accept="application/pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) setFile(file);
                                    }}
                                  />
                                </Button>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  sx={{
                                    marginLeft: 3,
                                    marginRight: 3,
                                    marginTop: 0.5,
                                  }}
                                  gutterBottom
                                >
                                  หรือ
                                </Typography>
                                <Button
                                  variant="contained"
                                  component="label"
                                  size="small"
                                  fullWidth
                                  sx={{
                                    height: "50px",
                                    backgroundColor:
                                      fileType === 3 ? "#29b6f6" : "#eeeeee",
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  onClick={() => setFileType(3)}
                                >
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={
                                      fileType === 3 ? "white" : "lightgray"
                                    }
                                    gutterBottom
                                  >
                                    รูปภาพ
                                  </Typography>
                                  <ImageIcon
                                    sx={{
                                      fontSize: 40,
                                      color:
                                        fileType === 3 ? "white" : "lightgray",
                                      marginLeft: 0.5,
                                    }}
                                  />
                                  <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) setFile(file);
                                    }}
                                  />
                                </Button>
                              </Box>
                            ) : (
                              <Box textAlign="center">
                                {/* <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={file.name}
                                                                        sx={{ marginRight: 2 }}
                                                                    /> */}

                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <FilePreview file={file} />
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    sx={{ marginLeft: 2 }}
                                    onClick={() => {
                                      setFileType(1);
                                      setFile("ไม่แนบไฟล์");
                                    }}
                                  >
                                    <DeleteForeverIcon />
                                  </Button>
                                </Box>
                                <Box textAlign="center">
                                  <Typography variant="subtitle1" gutterBottom>
                                    {file.name}
                                  </Typography>
                                </Box>
                              </Box>
                            )
                            // <Box sx={{
                            //     display: "flex",
                            //     alignItems: "center",
                            //     justifyContent: "space-between", // ช่วยแยกซ้ายขวา
                            //     paddingLeft: 12,
                            // }}>
                            //     <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            //         File : {file.name}
                            //     </Typography>
                            //     {/* <IconButton color="error" onClick={() => { setFile(null); setFileType(null); }}>
                            //         <DeleteForeverIcon />
                            //     </IconButton> */}
                            //     <Button variant="outlined" color="error" size="small" onClick={() => { setFile(null); setFileType(null); }}>
                            //         ลบไฟล์
                            //     </Button>
                            // </Box>
                          }
                        </React.Fragment>
                      )
                    ) : (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          textAlign="center"
                          gutterBottom
                        >
                          รูปภาพใบจดทะเบียน
                        </Typography>
                        <Button variant="contained" color="warning">
                          แก้ไขรูปภาพ
                        </Button>
                      </>
                    )}
                  </Grid>
                </React.Fragment>
              )}
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions
          sx={{
            textAlign: "center",
            borderTop: "2px solid " + theme.palette.panda.dark,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {update ? (
            <Box marginBottom={2} textAlign="center">
              {/* <Button variant="contained" color="error" onClick={handleDelete} sx={{ marginRight: 2 }}>ลบทะเบียนรถ</Button> */}
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdate(false)}
              >
                แก้ไข
              </Button>
            </Box>
          ) : (
            <Box marginBottom={2} textAlign="center">
              <Button
                variant="contained"
                color="error"
                sx={{ marginRight: 2 }}
                onClick={handleCancle}
              >
                ยกเลิก
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpdate}
              >
                บันทึก
              </Button>
            </Box>
          )}
          {/* <Button onClick={onClose} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={onClose} variant="contained" color="error">ยกเลิก</Button> */}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default UpdateRegHead;
