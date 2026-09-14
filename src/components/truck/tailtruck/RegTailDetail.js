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
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import theme from "../../../theme/theme";
import { IconButtonError, IconButtonSuccess, IconButtonWarning, RateOils, TablecellHeader } from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { apiPut } from "../../../server/apiClient";
import { ShowConfirm, ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import UpdateRegTail from "./UpdateRegTail";

const RegTailDetail = (props) => {
  const { truck, index } = props;

  const [openTab, setOpenTab] = React.useState(true);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const handleRowClick = (truck) => {
    setSelectedTruck(truck);
    setOpenDialog(truck.id);
  };

  const handleCloseDialog = () => {
    setSelectedTruck(null);
    setOpenDialog(null);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  const [regTailLength, setRegTailLength] = React.useState("");

  const { regtail, refetch: refetchBasicData } = useBasicData();
  const dataregtail = Object.values(regtail || {}).filter((item) => item.StatusTruck !== "ยกเลิก");
  const registrationTail = dataregtail.filter(row => row.Status && row.Status === "ยังไม่ได้เชื่อมต่อทะเบียนหัว");

  const handleDelete = (t) => {
    if (!t?.uuid) {
      ShowError("ไม่พบข้อมูลรถ");
      return;
    }

    if (t.Status === "เชื่อมทะเบียนหัวแล้ว") {
      ShowError("ไม่สามารถลบได้ เนื่องจากรถไม่ได้อยู่ในสถานะว่าง");
      return;
    }

    ShowConfirm(
      `ต้องการลบทะเบียนรถ ${t.RegTail} ใช่หรือไม่`,
      async () => {
        try {
          await apiPut(`/api/truck_registration_tail/${t.uuid}`, {
            StatusTruck: "ยกเลิก",
          });
          ShowSuccess("ลบทะเบียนรถเรียบร้อย");
          refetchBasicData?.();
        } catch (error) {
          ShowError("เพิ่มข้อมูลไม่สำเร็จ");
          console.error("Error pushing data:", error);
        }
      },
      () => {}
    )
  }

  return (
    <React.Fragment>
      <TableRow key={truck.id} sx={{
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#ffebee",
        },
      }}
        onClick={() => handleRowClick(truck)}
      >
        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.RegTail}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap1 === undefined ? "-" : truck.Cap1}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap2 === undefined ? "-" : truck.Cap2}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap3 === undefined ? "-" : truck.Cap3}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap4 === undefined ? "-" : truck.Cap4}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap5 === undefined ? "-" : truck.Cap5}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap6 === undefined ? "-" : truck.Cap6}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap7 === undefined ? "-" : truck.Cap7}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Cap8 === undefined ? "-" : truck.Cap8}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(truck.Weight)}</TableCell>
        <TableCell sx={{ textAlign: "center" }}>{truck.Status}</TableCell>
        <TableCell
          sx={{
            backgroundColor: "white",
            width: 60,
            textAlign: "center",
            position: "sticky",
            right: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(truck);
          }}
        >
          <IconButton size="small">
            <DeleteForeverIcon color="error" fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
      {selectedTruck && (
        <UpdateRegTail
          truck={selectedTruck}
          open={true}
          type={"รายละเอียด"}
          onClose={() => setSelectedTruck(null)}
        />
      )}
    </React.Fragment>
  );
};

export default RegTailDetail;
