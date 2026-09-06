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
  Paper,
  Popover,
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
import { IconButtonError, RateOils, TablecellGray, TablecellHeader, TablecellNoData, TablecellSelling } from "../../theme/style";
import { Inventory } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InsertCreditor from "./InsertCreditor";
import UpdateCreditor from "./UpdateCreditor";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import TablePaginationBar from "../../theme/TablePaginationBar";

// Small "click-to-explain" helper - a plain Tooltip only fires on hover, which
// is easy to miss and unusable on touch devices, so ambiguous labels use a
// click-triggered Popover instead. Kept local to this file since only this
// page's labels need it.
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

const Creditor = ({ openNavbar }) => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openTab, setOpenTab] = React.useState(true);

  const toggleDrawer = (newOpen) => () => {
    setOpenTab(newOpen);
  };

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

  const { creditors } = useBasicData();
  const creditor = Object.values(creditors || {});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const pageCount = Math.max(1, Math.ceil(creditor.length / rowsPerPage));
  const safePage = Math.min(page, pageCount - 1);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        เจ้าหนี้น้ำมัน
        <InfoHint text="บริษัท/บุคคลที่เราซื้อน้ำมันมาเพื่อขายต่อ (ไม่ใช่ลูกค้าที่ซื้อจากเรา) ใช้หน้านี้บันทึกข้อมูลติดต่อและเงื่อนไขเครดิตของแต่ละเจ้าหนี้" />
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: -1 }}>
        รายชื่อผู้ขายน้ำมันให้กับบริษัท พร้อมข้อมูลติดต่อและระยะเวลาเครดิต
      </Typography>
      <Divider sx={{ marginBottom: 2, marginTop: 2 }} />
      <Paper sx={{ p: 2 }}>
        {
          windowWidth >= 800 ?
            <Grid container spacing={2} alignItems="center">
              <Grid item sm={8} lg={10}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 0 }}>รายชื่อเจ้าหนี้น้ำมัน</Typography>
                  <Chip size="small" color="info" variant="outlined" label={`ทั้งหมด ${creditor.length} ราย`} />
                </Stack>
              </Grid>
              <Grid item sm={4} lg={2} sx={{ textAlign: "right" }}>
                <InsertCreditor creditor={creditor.length} />
              </Grid>
            </Grid>
            :
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 0 }}>รายชื่อเจ้าหนี้น้ำมัน</Typography>
                  <Chip size="small" color="info" variant="outlined" label={`ทั้งหมด ${creditor.length} ราย`} />
                </Stack>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <InsertCreditor creditor={creditor.length} />
              </Grid>
            </Grid>
        }
        <Divider sx={{ marginBottom: 2, marginTop: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ height: "68vh" }}
            >
              <Table stickyHeader size="small" sx={{ width: "100%" }}>
                <TableHead sx={{ height: "7vh" }}>
                  <TableRow>
                    <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                      ลำดับ
                    </TablecellSelling>
                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                      ชื่อ-สกุล
                    </TablecellSelling>
                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                      เลขประจำตัวผู้เสียภาษี
                    </TablecellSelling>
                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                      เบอร์โทร
                    </TablecellSelling>
                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                      User
                      <InfoHint text="ชื่อผู้ใช้งานที่ผูกกับเจ้าหนี้รายนี้ในระบบ (ถ้ามี)" />
                    </TablecellSelling>
                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                      ระยะเครดิต
                      <InfoHint text="จำนวนวันที่สามารถค้างชำระค่าน้ำมันให้เจ้าหนี้รายนี้ได้ก่อนครบกำหนด" />
                    </TablecellSelling>
                    <TablecellSelling />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditor.length === 0 ? (
                    <TableRow>
                      <TablecellNoData colSpan={7}>
                        <Inventory fontSize="large" />
                        <br />
                        ไม่มีข้อมูล
                      </TablecellNoData>
                    </TableRow>
                  ) : (
                    creditor.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow key={row.uuid} hover>
                        <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 600 }}>{row.Name}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.IDCard}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.Phone}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.User}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {row.Credit || row.Credit === 0 ? `${row.Credit} วัน` : "-"}
                        </TableCell>
                        <UpdateCreditor key={row.id} employee={row} />
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePaginationBar
              count={creditor.length}
              page={safePage}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Creditor;
