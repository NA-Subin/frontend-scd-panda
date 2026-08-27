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
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import "dayjs/locale/th";
import { IconButtonError, RateOils, TablecellHeader, TablecellSelling } from "../../../theme/style";
import { database } from "../../../server/firebase";
import UpdateDepot from "./UpdateDepot";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import InserDepot from "./InsertDepot";
import { useData } from "../../../server/path";
import { useBasicData } from "../../../server/provider/BasicDataProvider";

const Depots = ({openNavbar}) => {
  const [menu, setMenu] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  // const { depots } = useData();
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
          style={{ maxHeight: "70vh" }}
          sx={{ marginTop: 2 }}
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
              {
                depot.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow>
                    <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                    <TableCell>{row.Address}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Zone}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.lat}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.lng}</TableCell>
                    <UpdateDepot key={row.id} depot={row} />
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
        {
          depot.length < 10 ? null :
            <TablePagination
              rowsPerPageOptions={[10, 25, 30]}
              component="div"
              count={depot.length}
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
      </Box>
    </Container>
  );
};

export default Depots;
