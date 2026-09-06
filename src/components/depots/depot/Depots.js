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
import "dayjs/locale/th";
import { RateOils, TablecellHeader, TablecellNoData, TablecellSelling } from "../../../theme/style";
import { Inventory } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import theme from "../../../theme/theme";
import UpdateDepot from "./UpdateDepot";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import InserDepot from "./InsertDepot";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import TablePaginationBar from "../../../theme/TablePaginationBar";

// Small "click-to-explain" helper - a plain Tooltip only fires on hover, which
// is easy to miss and unusable on touch devices, so table-header hints use a
// click-triggered Popover instead. Kept local to this file since only this
// page's column headers need it.
const InfoHint = ({ text }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{ p: 0.25, ml: 0.5, color: "inherit", verticalAlign: "middle" }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Typography sx={{ p: 1.5, maxWidth: 260, fontSize: 13 }}>{text}</Typography>
      </Popover>
    </>
  );
};

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
      <Grid container spacing={2} alignItems="center">
        <Grid item md={9} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            คลังรับน้ำมัน
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            รายชื่อคลังที่รับน้ำมันเข้า พร้อมที่อยู่ โซนจัดส่ง และพิกัดของแต่ละคลัง
          </Typography>
        </Grid>
        <Grid item md={3} xs={12}>
          <Box marginRight={3} sx={{ textAlign: "right" }}>
            <InserDepot depot={depot.length} />
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 2, marginTop: 3 }} />
      <Paper sx={{ p: 2, height: "70vh" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 0 }}>
            รายการคลังรับน้ำมัน
          </Typography>
          <Chip size="small" color="info" variant="outlined" label={`ทั้งหมด ${depot.length} คลัง`} />
        </Stack>
        <Divider sx={{ marginBottom: 2 }} />
        <Box sx={{ width: "100%" }} >
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ height: "62vh" }}
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
                    <InfoHint text="โซนที่คลังนี้ใช้อ้างอิงตอนตั้งเรทค่าขนส่งให้ลูกค้า เช่น ลำปาง พิจิตร สระบุรี บางปะอิน หรือ IR" />
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
                    <TableRow key={row.uuid} hover>
                      <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                      <TableCell sx={{ textAlign: "center", fontWeight: 600 }}>{row.Name}</TableCell>
                      <TableCell>{row.Address}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {row.Zone ? <Chip size="small" label={row.Zone} /> : "-"}
                      </TableCell>
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
      </Paper>
    </Container>
  );
};

export default Depots;
