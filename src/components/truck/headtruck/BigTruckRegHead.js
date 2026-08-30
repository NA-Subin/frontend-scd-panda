import React, { useContext, useEffect, useMemo, useState } from "react";
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
  LinearProgress,
  MenuItem,
  Paper,
  Popover,
  Select,
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
  useMediaQuery,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from "@mui/icons-material/Settings";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import RegHeadDetail from "./RegHeadDetail";
import { useBasicData } from "../../../server/provider/BasicDataProvider";

const BigTruckRegHead = (props) => {
  const { repair, loading } = props;

  const [openTab, setOpenTab] = React.useState(true);
  const [showSoldTruck, setShowSoldTruck] = useState(false);

  const { reghead } = useBasicData();
  const truck = Object.values(reghead || {}).filter((item) => {
  return showSoldTruck
    ? item.Status === "ขายแล้ว"
    : item.Status !== "ขายแล้ว";
});

  const isMobile = useMediaQuery("(max-width:1100px)");

  console.log("truck", truck);

  const shouldDrawerOpen = React.useMemo(() => {
    if (isMobile) {
      return !openTab; // ถ้าเป็นจอโทรศัพท์ ให้เปิด drawer เมื่อ open === false
    } else {
      return openTab; // ถ้าไม่ใช่จอโทรศัพท์ ให้เปิด drawer เมื่อ open === true
    }
  }, [openTab, isMobile]);

  const handleDrawerOpen = () => {
    if (isMobile) {
      // จอเท่ากับโทรศัพท์
      setOpenTab((prevOpen) => !prevOpen);
    } else {
      // จอไม่เท่ากับโทรศัพท์
      setOpenTab((prevOpen) => !prevOpen);
    }
  };

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
    <React.Fragment>
      <Grid container spacing={3} marginTop={1} marginLeft={-7} width={"100%"}>
        {shouldDrawerOpen ? (
          <Grid item xs={1.5}>
            <Button
              variant="text"
              color="inherit"
              size="small"
              fullWidth
              endIcon={<ArrowCircleLeftIcon />}
              sx={{
                marginBottom: 1.3,
                fontWeight: "bold",
                marginBottom: 1,
                marginTop: -1,
                backgroundColor: theme.palette.panda.contrastText,
              }}
              onClick={handleDrawerOpen}
            >
              ซ่อนแถบ
            </Button>
            <Paper
              sx={{
                height: "20vh",
                paddingLeft: 3,
                marginTop: 2,
                paddingTop: 3,
                backgroundColor: theme.palette.panda.main,
                color: "white",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                marginLeft={3}
                gutterBottom
              >
                รถใหญ่
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                marginTop={-2}
                gutterBottom
              >
                ทั้งหมด
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                marginTop={-2}
              >
                <Typography variant="h2" fontWeight="bold" gutterBottom>
                  {truck.length}
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  คัน
                </Typography>
              </Box>
            </Paper>
            {repair.length === 0 ? (
              <Paper
                sx={{
                  height: "20vh",
                  paddingLeft: 3,
                  marginTop: 2,
                  paddingTop: 4,
                  backgroundColor: theme.palette.success.main,
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  marginLeft={3}
                  gutterBottom
                >
                  ตรวจสภาพรถ
                </Typography>
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  marginTop={-3}
                  gutterBottom
                >
                  ครบ
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  marginTop={-5}
                  marginLeft={3}
                  gutterBottom
                >
                  ทุกคัน
                </Typography>
              </Paper>
            ) : (
              <Paper
                sx={{
                  height: "20vh",
                  paddingLeft: 3,
                  marginTop: 2,
                  paddingTop: 3,
                  backgroundColor: theme.palette.warning.main,
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  marginLeft={3}
                  gutterBottom
                >
                  ไม่ตรวจ
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  marginTop={-2}
                  gutterBottom
                >
                  สภาพรถ
                </Typography>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  marginTop={-2}
                >
                  <Typography variant="h2" fontWeight="bold" gutterBottom>
                    {repair.length}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    คัน
                  </Typography>
                </Box>
              </Paper>
            )}
          </Grid>
        ) : (
          <Grid item xs={0.5} sx={{ borderRight: "1px solid lightgray" }}>
            <Tooltip title="ซ่อนแถบ" placement="left">
              <Button
                variant="contained"
                color="inherit"
                startIcon={<ArrowCircleRightIcon />}
                sx={{ marginBottom: 1, marginTop: -3 }}
                onClick={handleDrawerOpen}
              ></Button>
            </Tooltip>
          </Grid>
        )}
        <Grid item xs={openTab ? 10.5 : 11.5}>
          <Paper
            sx={{
              p: 2,
              width: "100%",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="h6" fontWeight="bold">
                รายละเอียดข้อมูลรถใหญ่ทั้งหมด
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={showSoldTruck}
                    onChange={(e) => setShowSoldTruck(e.target.checked)}
                  />
                }
                label="ขายแล้ว"
              />
            </Box>
            <Divider sx={{ marginBottom: 1 }} />
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table stickyHeader size="small" sx={{ width: "1680px" }}>
                <TableHead sx={{ height: "7vh" }}>
                  <TableRow>
                    <TablecellHeader
                      width={50}
                      sx={{ textAlign: "center", fontSize: 16 }}
                    >
                      ลำดับ
                    </TablecellHeader>
                    <TablecellHeader
                      sx={{
                        textAlign: "center",
                        fontSize: 16,
                        position: "sticky",
                        left: 0,
                        zIndex: 3,
                      }}
                    >
                      ทะเบียนหัว
                    </TablecellHeader>
                    <TablecellHeader
                      sx={{ textAlign: "center", fontSize: 16, left: 140 }}
                    >
                      ทะเบียนหาง
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      น้ำหนัก
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      เลขจดทะเบียนรถ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ไฟล์ / รูปภาพ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ตรวจสอบสภาพรถ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      สถานะ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      บริษัท
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      พนักงานขับรถ
                    </TablecellHeader>
                    <TablecellHeader
                      width={50}
                      sx={{ position: "sticky", right: 0 }}
                    />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {truck
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row,index) => (
                      <RegHeadDetail key={row.RegHead} truck={row} index={index} />
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {truck.length <= 10 ? null : (
              <TablePagination
                rowsPerPageOptions={[10, 25, 30]}
                component="div"
                count={truck.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:" // เปลี่ยนข้อความตามที่ต้องการ
                labelDisplayedRows={({ from, to, count }) =>
                  `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                }
                sx={{
                  overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  "& .MuiTablePagination-toolbar": {
                    backgroundColor: "lightgray",
                    height: "20px", // กำหนดความสูงของ toolbar
                    alignItems: "center",
                    paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                    overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                    fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                  },
                  "& .MuiTablePagination-select": {
                    paddingY: 0,
                    fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                  },
                  "& .MuiTablePagination-actions": {
                    "& button": {
                      paddingY: 0,
                      fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                    },
                  },
                  "& .MuiTablePagination-displayedRows": {
                    fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                  },
                  "& .MuiTablePagination-selectLabel": {
                    fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                  },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default BigTruckRegHead;
