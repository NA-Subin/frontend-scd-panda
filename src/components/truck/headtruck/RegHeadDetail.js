import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
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
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from "@mui/icons-material/Settings";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoIcon from "@mui/icons-material/Info";
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
import {
  ShowConfirm,
  ShowError,
  ShowSuccess,
} from "../../sweetalert/sweetalert";
import UpdateRegHead from "./UpdateRegHead";
import TruckRepair from "./TruckRepair";
import { fetchRealtimeData } from "../../../server/data";
import { useData } from "../../../server/path";
import { useBasicData } from "../../../server/provider/BasicDataProvider";

const RegHeadDetail = (props) => {
  const { truck, index } = props;

  const [openTab, setOpenTab] = React.useState(true);
  const [setting, setSetting] = React.useState("0:0");
  const [tail, setTail] = React.useState("ไม่มี:0:0:0");
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  // เมื่อคลิก row
  const handleRowClick = (truck) => {
    setSelectedTruck(truck);
    setOpenDialog(truck.id);
  };

  // ปิด dialog
  const handleCloseDialog = () => {
    setSelectedTruck(null);
    setOpenDialog(null);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  // const [registrationTail, setRegistrationTail] = React.useState([]);
  const [regTailLength, setRegTailLength] = React.useState("");

  // const getRegitrationTail = async () => {
  //   database.ref("/truck/registrationTail/").on("value", (snapshot) => {
  //     const datas = snapshot.val();
  //     const dataRegistrationTail = [];
  //     for (let id in datas) {
  //       if(datas[id].Status === "ยังไม่เชื่อมต่อทะเบียนหัว" && datas[id].Company === truck.Company){
  //         dataRegistrationTail.push({ id, ...datas[id] })
  //       }
  //     }
  //     setRegTailLength(datas.length);
  //     setRegistrationTail(dataRegistrationTail);
  //   });
  // };

  // const { regtail } = useData();
  const { regtail } = useBasicData();
  const dataregtail = Object.values(regtail || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const registrationTail = dataregtail.filter(
    (row) => row.Status && row.Status === "ยังไม่ได้เชื่อมต่อทะเบียนหัว",
  );

  // useEffect(() => {
  //   getRegitrationTail();
  // }, []);

  const handlePost = () => {
    database
      .ref("/truck/registration/")
      .child(setting.split(":")[0] - 1)
      .update({
        RegTail: tail.split(":")[1],
        TotalWeight: parseFloat(truck.Weight) + parseFloat(tail.split(":")[3]),
      })
      .then(() => {
        database
          .ref("/truck/registrationTail/")
          .child(tail.split(":")[0] - 1)
          .update({
            Status: "เชื่อมทะเบียนหัวแล้ว",
          })
          .then(() => {
            ShowSuccess("เชื่อมทะเบียนหางสำเร็จ");
            console.log("Data pushed successfully");
            setSetting("");
          })
          .catch((error) => {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
          });
      })
      .catch((error) => {
        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
        console.error("Error pushing data:", error);
      });
  };

  const handleDelete = (t) => {
    if (!t?.id) {
      ShowError("ไม่พบข้อมูลรถ");
      return;
    }

    if (t.Status !== "ว่าง") {
      ShowError("ไม่สามารถลบได้ เนื่องจากรถไม่ได้อยู่ในสถานะว่าง");
      return;
    }

    if (t.RegTail !== "0:ไม่มี") {
      ShowError("ไม่สามารถลบได้ เนื่องจากรถมีการเชื่อมทะเบียนหางอยู่");
      return;
    }

    ShowConfirm(
      `ต้องการลบทะเบียนรถ ${t.RegHead} ใช่หรือไม่`,
      () => {
        database
          .ref("/truck/registration/")
          .child(t.id - 1)
          .update({
            StatusTruck: "ยกเลิก",
          })
          .then(() => {
            ShowSuccess("ลบทะเบียนรถเรียบร้อย");
          })
          .catch((error) => {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
          });
      },
      () => {
        console.log(`ยกเลิกลบทะเบียนรถ ${t.RegHead}`);
      },
    );
  };

  console.log("selectedTruck : ", selectedTruck);

  return (
    <React.Fragment>
      <TableRow
        key={truck.RegHead}
        sx={{
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "#ffebee",
          },
        }}
        onClick={() => handleRowClick(truck)}
      >
        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
        <TableCell
          sx={{
            textAlign: "center",
            position: "sticky",
            left: 0,
          }}
        >
          <Box sx={{ backgroundColor: "white" }}>{truck.RegHead}</Box>
        </TableCell>
        {setting.split(":")[1] === truck.RegTail ? (
          <TableCell
            sx={{
              textAlign: "center",
              left: 140,
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Box sx={{ backgroundColor: "white" }}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Paper component="form">
                    <Select
                      id="demo-simple-select"
                      value={tail}
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
                      onChange={(e) => setTail(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value={"ไม่มี:0:0:0"}>เลือกทะเบียน</MenuItem>
                      {registrationTail.map((row) => (
                        <MenuItem
                          value={`${row.id}:${row.RegTail}:${row.Cap}:${row.Weight}`}
                        >
                          {row.RegTail}
                        </MenuItem>
                      ))}
                    </Select>
                  </Paper>
                </Grid>
                <Grid
                  item
                  xs={4}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <IconButton
                    size="small"
                    sx={{ marginTop: -0.5 }}
                    onClick={() => setSetting("")}
                  >
                    <CancelIcon color="error" fontSize="12px" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ marginTop: -0.5 }}
                    onClick={handlePost}
                  >
                    <CheckCircleIcon color="success" fontSize="12px" />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </TableCell>
        ) : (
          <TableCell
            sx={{
              textAlign: "center",
              left: 140,
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Box sx={{ backgroundColor: "white" }}>
              {truck.RegTail === "0:ไม่มี" || truck.RegTail === "ไม่มี" ? (
                <IconButton
                  size="small"
                  sx={{ marginTop: -0.5 }}
                  onClick={() => setSetting(truck.RegTail)}
                >
                  <SettingsIcon color="warning" fontSize="12px" />
                </IconButton>
              ) : (
                truck.RegTailName
              )}
            </Box>
          </TableCell>
        )}
        <TableCell sx={{ textAlign: "center" }}>
          {new Intl.NumberFormat("en-US").format(truck.Weight)}
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          {truck.VehicleRegistration}
        </TableCell>
        <TableCell
          sx={{ textAlign: "center" }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {truck.Path ? (
            <Link
              href={
                truck.Path.startsWith("http")
                  ? truck.Path
                  : `https://${truck.Path}`
              }
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              {truck.Path}
            </Link>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color:
              truck.RepairTruck.split(":")[1] === "ตรวจสอบสภาพรถแล้ว"
                ? theme.palette.success.main
                : theme.palette.warning.main,
          }}
        >
          {truck.RepairTruck.split(":")[1]}
        </TableCell>
        <TableCell
          sx={{
            textAlign: "center",
            color:
              truck.Status === "ว่าง"
                ? theme.palette.success.main
                : truck.Status === "ขายแล้ว"
                  ? theme.palette.error.main
                  : "gray",
          }}
        >
          {truck.Status}
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          {truck.CompanyName || "-"}
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          {truck.Driver === "ไม่มี" ? truck.Driver : truck.DriverName}
        </TableCell>
        <TableCell
          sx={{
            backgroundColor: "white",
            width: 60,
            textAlign: "center",
            position: "sticky",
            right: 0,
          }}
          onClick={(e) => {
            e.stopPropagation(); // ⭐ สำคัญ
            handleDelete(truck);
          }}
        >
          <IconButton
            size="small"
            // onClick={(e) => {
            //   e.stopPropagation(); // ⭐ สำคัญ
            //   handleDelete(truck);
            // }}
          >
            <DeleteForeverIcon color="error" fontSize="small" />
          </IconButton>
        </TableCell>
        {/* <TableCell sx={{ width: 40, position: "sticky", right: 0, backgroundColor: "white" }} colSpan={2}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <TruckRepair key={truck.RepairTruck.split(":")[1]} row={truck} type={"ตรวจสอบสภาพรถ"} />
          </Box>
        </TableCell> */}
      </TableRow>
      {selectedTruck && (
        <UpdateRegHead
          truck={selectedTruck}
          open={true}
          type={"รายละเอียด"}
          onClose={() => setSelectedTruck(null)}
        />
      )}
    </React.Fragment>
  );
};

export default RegHeadDetail;
