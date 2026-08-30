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
  FormControl,
  Grid,
  IconButton,
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
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import theme from "../../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import UpdateRegTail from "./UpdateRegTail";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import RegTailDetail from "./RegTailDetail";

const BigTruckRegTail = (props) => {
  const { status } = props;
  const [openTab, setOpenTab] = React.useState(true);
  const [open, setOpen] = useState(false);

  const { regtail } = useBasicData();
  const truck = Object.values(regtail || {}).filter((item) => item.StatusTruck !== "ยกเลิก");

  const isMobile = useMediaQuery("(max-width:1100px)");

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
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
      <Grid container spacing={3} marginTop={1} marginLeft={-7}>
        {shouldDrawerOpen ? (
          <Grid item xs={1.5}>
            <Button
              variant="text"
              color="inherit"
              size="small"
              fullWidth
              endIcon={<ArrowCircleLeftIcon />}
              sx={{ marginBottom: 1.3, fontWeight: "bold", marginBottom: 1, marginTop: -1, backgroundColor: theme.palette.panda.contrastText }}
              onClick={handleDrawerOpen}
            >
              ซ่อนแถบ
            </Button>
            <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 3, backgroundColor: theme.palette.panda.main, color: "white", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>หางรถ</Typography>
              <Typography variant="h5" fontWeight="bold" marginTop={-2} gutterBottom>ทั้งหมด</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" marginTop={-2}>
                <Typography variant="h2" fontWeight="bold" gutterBottom>{truck.length}</Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>หาง</Typography>
              </Box>
            </Paper>
            {
              status.length === 0 ?
                <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 4, backgroundColor: theme.palette.success.main, color: "white", borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>เชื่อมต่อทะเบียนหัว</Typography>
                  <Typography variant="h2" fontWeight="bold" marginTop={-3} gutterBottom>ครบ</Typography>
                  <Typography variant="h5" fontWeight="bold" marginTop={-5} marginLeft={3} gutterBottom>ทุกหาง</Typography>
                </Paper>
                :
                <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 3, backgroundColor: theme.palette.warning.main, color: "white", borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" marginLeft={1} gutterBottom>ไม่มี</Typography>
                  <Typography variant="h5" fontWeight="bold" marginTop={-2} gutterBottom>ทะเบียนหัว</Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" marginTop={-2}>
                    <Typography variant="h2" fontWeight="bold" gutterBottom>{status.length}</Typography>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>หาง</Typography>
                  </Box>
                </Paper>
            }
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
              >
              </Button>
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
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              รายละเอียดข้อมูลหางรถทั้งหมด
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
            <TableContainer
              component={Paper}
              sx={{ marginTop: 2 }}
            >
              <Table stickyHeader size="small" sx={{ width: "100%" }}>
                <TableHead sx={{ height: "7vh" }}>
                  <TableRow>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ลำดับ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ทะเบียนหาง
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง1
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง2
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง3
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง4
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง5
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง6
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง7
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 40 }}>
                      ช่อง8
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      น้ำหนัก
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      สถานะ
                    </TablecellHeader>
                    <TablecellHeader sx={{ position: "sticky", right: 0 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    truck.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <RegTailDetail key={row.RegTail} truck={row} index={index} />
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
            {
              truck.length <= 10 ? null :
                <TablePagination
                  rowsPerPageOptions={[10, 25, 30]}
                  component="div"
                  count={truck.length}
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

          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default BigTruckRegTail;
