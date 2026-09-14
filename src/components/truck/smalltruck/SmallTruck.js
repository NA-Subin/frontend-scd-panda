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
import { IconButtonError, RateOils, TablecellHeader, TablecellNoData } from "../../../theme/style";
import { Inventory } from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import UpdateSmallTruck from "./UpdateSmallTruck";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import SmallDetail from "./SmallDetail";
import TablePaginationBar from "../../../theme/TablePaginationBar";

const SmallTruck = (props) => {
  const { repair } = props;
  const [openTab, setOpenTab] = React.useState(true);
  const [openMenu, setOpenMenu] = React.useState(false);

  const { small } = useBasicData();
  const truck = Object.values(small || {}).filter((item) => item.StatusTruck !== "ยกเลิก");

  const isMobile = useMediaQuery("(max-width:1100px)");

  const shouldDrawerOpen = React.useMemo(() => {
    if (isMobile) {
      return !openTab;
    } else {
      return openTab;
    }
  }, [openTab, isMobile]);

  const handleDrawerOpen = () => {
    if (isMobile) {
      setOpenTab((prevOpen) => !prevOpen);
    } else {
      setOpenTab((prevOpen) => !prevOpen);
    }
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const pageCount = Math.max(1, Math.ceil(truck.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);

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
              <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>รถเล็ก</Typography>
              <Typography variant="h5" fontWeight="bold" marginTop={-2} gutterBottom>ทั้งหมด</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" marginTop={-2}>
                <Typography variant="h2" fontWeight="bold" gutterBottom>{truck.length}</Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>คัน</Typography>
              </Box>
            </Paper>
            {
              repair.length === 0 ?
                <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 4, backgroundColor: theme.palette.success.main, color: "white", borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>ตรวจสภาพรถ</Typography>
                  <Typography variant="h2" fontWeight="bold" marginTop={-3} gutterBottom>ครบ</Typography>
                  <Typography variant="h5" fontWeight="bold" marginTop={-5} marginLeft={3} gutterBottom>ทุกคัน</Typography>
                </Paper>
                :
                <Paper sx={{ height: "20vh", paddingLeft: 3, marginTop: 2, paddingTop: 3, backgroundColor: theme.palette.warning.main, color: "white", borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" marginLeft={3} gutterBottom>ไม่ตรวจ</Typography>
                  <Typography variant="h5" fontWeight="bold" marginTop={-2} gutterBottom>สภาพรถ</Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" marginTop={-2}>
                    <Typography variant="h2" fontWeight="bold" gutterBottom>{repair.length}</Typography>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>คัน</Typography>
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
              รายละเอียดข้อมูลรถเล็กทั้งหมด
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
            <TableContainer
              component={Paper}
              sx={{ height: "70vh", marginTop: 2 }}
            >
              <Table stickyHeader size="small" sx={{ width: "1500px" }}>
                <TableHead sx={{ height: "7vh" }}>
                  <TableRow>
                    <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                      ลำดับ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ชื่อย่อ
                    </TablecellHeader>
                    <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                      ทะเบียน
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
                    <TablecellHeader sx={{ position: "sticky", right: 0 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {truck.length === 0 ? (
                    <TableRow>
                      <TablecellNoData colSpan={10}>
                        <Inventory fontSize="large" />
                        <br />
                        ไม่มีข้อมูล
                      </TablecellNoData>
                    </TableRow>
                  ) : (
                    truck.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row, index) => (
                      <SmallDetail key={row.id} truck={row} index={index} />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePaginationBar
              count={truck.length}
              page={safePage}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />

          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default SmallTruck;
