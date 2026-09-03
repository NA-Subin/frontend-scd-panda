import React, { useContext, useEffect, useState } from "react";
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
  Grid,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Popover,
  Select,
  Slide,
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
import "dayjs/locale/th";
import { IconButtonError, RateOils, TablecellHeader, TablecellNoData, TablecellSelling } from "../../../theme/style";
import { Inventory } from "@mui/icons-material";
import UpdateDepot from "./UpdateDepot";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import InserDepot from "./InsertDepot";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import TablePaginationBar from "../../../theme/TablePaginationBar";

const Depots = ({openNavbar}) => {
  const [menu, setMenu] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { depots } = useBasicData();
  const depot = Object.values(depots || {});

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [name, setName] = React.useState("");
  const [no, setNo] = React.useState("");
  const [village, setVillage] = React.useState("");
  const [subDistrict, setSubDistrict] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [province, setProvince] = React.useState("");
  const [zipCode, setZipCode] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const pageCount = Math.max(1, Math.ceil(depot.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);
  const pagedDepot = depot.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
      <Grid container spacing={2}>
        <Grid item md={9} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            คลังรับน้ำมัน
          </Typography>
        </Grid>
        <Grid item md={3} xs={12}>
          <Box marginRight={3} sx={{ textAlign: "right" }}>
            <InserDepot depot={depot.length} />
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 1, marginTop: 5 }} />
      <Box sx={{ width: "100%" }} >
        <TableContainer
          component={Paper}
          sx={{ height: "70vh", marginTop: 2 }}
        >
          <Table stickyHeader size="small" sx={{ width: "100%" }}>
            <TableHead sx={{ height: "7vh" }}>
              <TableRow>
                <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                  ลำดับ
                </TablecellSelling>
                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                  ชื่อคลังรับน้ำมัน
                </TablecellSelling>
                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                  ที่อยู่
                </TablecellSelling>
                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                  โซน
                </TablecellSelling>
                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                  Latitude (ละติจูด)
                </TablecellSelling>
                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                  Longitude (ลองจิจูด)
                </TablecellSelling>
                <TablecellSelling sx={{ width: 50, position: "sticky", right: 0 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {depot.length === 0 ? (
                <TableRow>
                  <TablecellNoData colSpan={7}>
                    <Inventory fontSize="large" />
                    <br />
                    ไม่มีข้อมูล
                  </TablecellNoData>
                </TableRow>
              ) : (
                pagedDepot.map((row) => (
                  <TableRow key={row.uuid}>
                    <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                    <TableCell>{row.Address}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Zone}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.lat}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.lng}</TableCell>
                    <UpdateDepot key={row.id} depot={row} />
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePaginationBar
          count={depot.length}
          page={safePage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </Box>
    </Container>
  );
};

export default Depots;
