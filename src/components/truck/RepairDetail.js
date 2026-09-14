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
import { TablecellHeader, TablecellNoData, TablecellTickets } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import TruckRepair from "./headtruck/TruckRepair";
import TablePaginationBar from "../../theme/TablePaginationBar";

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

const RepairDetail = ({}) => {
  const [regHead, setRegHead] = React.useState("");
  const token = Cookies.get("token");
  const handleChange = (event) => {
    setRegHead(event.target.value);
  };

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { inspection, reghead, small } = useBasicData();

  const inspectionData = Object.values(inspection);
  const regheadData = Object.values(reghead || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );
  const smallData = Object.values(small || {}).filter(
    (item) => item.StatusTruck !== "ยกเลิก",
  );

  const data = inspectionData.map((item) => {
    const registration = regheadData.find(
      (reg) => reg.id - 1 === Number(item.RegHeadID),
    );

    const smallTruck = smallData.find(
      (reg) => reg.id - 1 === Number(item.RegHeadID),
    );

    return {
      ...item,
      RegHead:
        item.Type === "รถใหญ่"
          ? (registration?.RegHead ?? "-")
          : (smallTruck?.RegHead ?? "-"),
      RegTail:
        item.Type === "รถใหญ่"
          ? (registration?.RegTail ?? "-")
          : (smallTruck?.RegTail ?? "-"),
      // registration.RegTail is a UUID FK (truck_registration_tail); its
      // display text lives in the RegTailName companion column, not in
      // RegTail itself.
      RegTailName: item.Type === "รถใหญ่" ? (registration?.RegTailName ?? "-") : "-",
      Company: registration?.Company ?? "-",
      CompanyName:
        item.Type === "รถใหญ่"
          ? (registration?.CompanyName ?? "-")
          : (smallTruck?.CompanyName ?? "-"),
      Status: registration?.StatusTruck ?? "ใช้งานอยู่",
      // inspection.Employee is a UUID FK (employee_drivers); its display
      // text lives in the EmployeeName companion column.
      Driver: item.Employee ?? "-",
      DriverName: item.EmployeeName ?? "-",
      Shortname: item.Type === "รถใหญ่" ? "-" : (smallTruck?.Shortname ?? "-"),
    };
  });

  const pageCount = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);
  const pagedData = data.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

  return (
    <React.Fragment>
      <TableContainer component={Paper} sx={{ height: "70vh", marginTop: 5 }}>
        <Table stickyHeader size="small" sx={{ width: "1250px" }}>
          <TableHead sx={{ height: "7vh" }}>
            <TableRow>
              <TablecellTickets
                width={50}
                sx={{ textAlign: "center", fontSize: 16 }}
              >
                ลำดับ
              </TablecellTickets>
              <TablecellTickets
                sx={{
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                วันที่ตรวจสอบสภาพรถ
              </TablecellTickets>
              <TablecellTickets
                sx={{
                  textAlign: "center",
                  fontSize: 16,
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                }}
              >
                ทะเบียน
              </TablecellTickets>
              <TablecellTickets sx={{ textAlign: "center", fontSize: 16 }}>
                พนักงานขับรถ
              </TablecellTickets>
              <TablecellTickets sx={{ textAlign: "center", fontSize: 16 }}>
                บริษัท
              </TablecellTickets>
              <TablecellTickets sx={{ textAlign: "center", fontSize: 16 }}>
                สถานะ
              </TablecellTickets>
              <TablecellTickets
                width={50}
                sx={{ position: "sticky", right: 0 }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TablecellNoData colSpan={7}>
                  <Inventory fontSize="large" />
                  <br />
                  ไม่มีข้อมูล
                </TablecellNoData>
              </TableRow>
            ) : (
            pagedData.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: "center", fontSize: 14 }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: 14 }}>
                  {dayjs(row.Date).locale("th").format("DD MMMM YYYY")}
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: "center",
                    fontSize: 14,
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  {row.Type === "รถใหญ่"
                    ? `${row.RegHead}/${row.RegTail && row.RegTailName ? row.RegTailName : "-"}`
                    : `${row.Shortname ? row.Shortname : ""})/${row.RegHead}`}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: 14 }}>
                  {row.Driver && row.DriverName
                    ? row.DriverName
                    : "-"}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: 14 }}>
                  {row.CompanyName || "-"}
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontSize: 14 }}>
                  {row.Status}
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: "center",
                    fontSize: 14,
                    position: "sticky",
                    right: 0,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <TruckRepair key={row.id} row={row} type={"ตรวจสอบสภาพรถ"} />
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePaginationBar
        count={data.length}
        page={safePage}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </React.Fragment>
  );
};

export default RepairDetail;
