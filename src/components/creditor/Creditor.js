import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
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
import { IconButtonError, RateOils, TablecellGray, TablecellHeader, TablecellSelling } from "../../theme/style";
import InsertCreditor from "./InsertCreditor";
import UpdateCreditor from "./UpdateCreditor";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import TablePaginationBar from "../../theme/TablePaginationBar";

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
      </Typography>
      <Divider sx={{ marginBottom: 1 }} />
      <Box sx={{ width: "100%" }}>
        {
          windowWidth >= 800 ?
            <Grid container spacing={2} p={1}>
              <Grid item sm={8} lg={10}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>รายชื่อเจ้าหนี้น้ำมัน</Typography>
              </Grid>
              <Grid item sm={4} lg={2} sx={{ textAlign: "right" }}>
                <InsertCreditor creditor={creditor.length} />
              </Grid>
            </Grid>
            :
            <Grid container spacing={2} p={1}>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <InsertCreditor creditor={creditor.length} />
              </Grid>
            </Grid>
        }
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TableContainer
              component={Paper}
              style={{ maxHeight: "70vh" }}
              sx={{ marginBottom: 2 }}
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
                    </TablecellSelling>
                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                      ระยะเครดิต
                    </TablecellSelling>
                    <TablecellSelling />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    creditor.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow>
                        <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.IDCard}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.Phone}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.User}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{row.Credit}</TableCell>
                        <UpdateCreditor key={row.id} employee={row} />
                      </TableRow>
                    ))
                  }
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
      </Box>
    </Container>
  );
};

export default Creditor;
