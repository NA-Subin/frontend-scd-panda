import React, { useContext, useEffect, useRef, useState } from "react";
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
import theme from "../../../theme/theme";
import CloseIcon from "@mui/icons-material/Close";
import ConstructionIcon from "@mui/icons-material/Construction";
import PostAddIcon from "@mui/icons-material/PostAdd";
import {
  FormCheckBox,
  FormTypography,
  IconButtonError,
  IconButtonInfo,
  IconButtonWarning,
  RateOils,
  TablecellHeader,
} from "../../../theme/style";
import { HTTP } from "../../../server/axios";
import { useBasicData } from "../../../server/provider/BasicDataProvider";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import dayjs from "dayjs";
import "dayjs/locale/th";
import "@fontsource/sarabun";
import html2pdf from "html2pdf.js";

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

const TruckRepair = (props) => {
  const { row, type } = props;
  const [truck, setTruck] = useState("");

  const { reghead, small, inspection: inspectionBasicData } = useBasicData();
  const matchedTruck = [
    ...Object.values(reghead || {}),
    ...Object.values(small || {}),
  ].find((t) => t.RegHead === row.RegHead);
  const matchedInspection = Object.values(inspectionBasicData || {}).find(
    (item) => item.RegHead === row.RegHead,
  );

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    if (truck.split(":")[1] === "ยังไม่ตรวจสอบสภาพรถ") {
      ShowError("วันนี้ยังไม่ได้ตรวจสภาพรถ");
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [brake, setBrake] = useState("");
  const [electricity, setElectricity] = useState("");
  const [water, setWater] = useState("");
  const [air, setAir] = useState("");
  const [gasoline, setGasoline] = useState("");
  const [oils, setOils] = useState("");
  const [noise, setNoise] = useState("");
  const [inspection, setInspection] = useState("");

  useEffect(() => {
    setTruck(matchedTruck?.RepairTruck || "");
    setInspection(matchedInspection || "");
    setBrake(matchedInspection?.Brake || {});
    setElectricity(matchedInspection?.Electricity || {});
    setWater(matchedInspection?.Water || {});
    setAir(matchedInspection?.Air || {});
    setGasoline(matchedInspection?.Gasoline || {});
    setOils(matchedInspection?.Oils || {});
    setNoise(matchedInspection?.Noise || {});
  }, [matchedTruck, matchedInspection]);

  const tableRef = useRef();

  const handlePrintNewTab = () => {
    const page1 = document.getElementById(row.RegHead);
    if (!page1) {
      console.error("Element not found");
      return;
    }

    // ดึงเนื้อหา HTML ของ element
    const htmlPage1 = page1.outerHTML;

    // ดึงสไตล์ของ MUI หรือสไตล์อื่นๆ ที่จำเป็น
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("");
        } catch (e) {
          // Ignore errors due to cross-origin restrictions
          return "";
        }
      })
      .join("");

    // สร้างหน้าต่างใหม่สำหรับพิมพ์
    const printWindow = window.open(
      "",
      "SCD-Panda",
      'width="100%",height="100%"',
    );

    // สร้างเนื้อหา HTML สำหรับการพิมพ์ รวมทั้งสไตล์และเนื้อหา
    printWindow.document.write(`
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>การตรวจสอบสภาพรถก่อนนำไปใช้</title>
        <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                font-family: Arial, sans-serif;
              }
              .page {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                page-break-after: always;
              }
              .page:last-child {
                page-break-after: auto;
              }
              .content {
                flex: 1;
                box-sizing: border-box;
                overflow: hidden;
                height: calc(100% - 5cm); /* ปรับขนาดของเนื้อหาคงที่ */
              }
              /* สำหรับแบ่งหน้าถัดไป */
              .page-break {
                page-break-before: always;
              }
            },
          ${styles}
        </style>
      </head>
      <body>
        <div class="page page-break">
            <div class="content">
                ${htmlPage1}
            </div>
        </div>
      </body>
    </html>
  `);

    // รอให้เนื้อหาทั้งหมดโหลดก่อนที่จะสั่งพิมพ์
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleExportPDF = () => {
    const element = document.getElementById(row.RegHead);

    if (!element) {
      console.error("Element not found");
      return;
    }

    const opt = {
      margin: 0,
      filename: `Inspection-${row.RegHead}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "cm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"], // 🔥 รองรับ page-break
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <React.Fragment>
      <IconButtonWarning
        color="warning"
        onClick={handleClickOpen}
        sx={{ marginTop: -1 }}
        size="small"
      >
        <ConstructionIcon />
      </IconButtonWarning>
      <Dialog
        open={open && type === "ตรวจสอบสภาพรถ" ? true : false}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        maxWidth="md"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.panda.dark,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={10}>
              {"จัดการซ่อมทะเบียน " +
                row.RegHead +
                ":" +
                (row.RegTail && row.RegTailName) +
                " ของ" +
                (row.Driver && row.DriverName)}
            </Grid>
            <Grid item xs={2} textAlign="right">
              <IconButtonError size="small" onClick={handleClose}>
                <CloseIcon />
              </IconButtonError>
            </Grid>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent ref={tableRef}>
          <Box
            sx={{
              backgroundColor: "#e0e0e0",
              minHeight: "100vh",
              padding: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            {/* A4 Paper */}
            <Box
              id={row.RegHead}
              sx={{
                width: "210mm",
                minHeight: "297mm",
                backgroundColor: "#ffffff",
                padding: "2mm 5mm",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                boxSizing: "border-box",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
                gutterBottom
              >
                <Box
                  component="span"
                  display="flex"
                  flexWrap="wrap"
                  alignItems="center"
                  gap={1}
                >
                  <span>ชื่อ</span>

                  <Box
                    component="span"
                    sx={{
                      borderBottom: "1px dotted grey",
                      minWidth: { xs: "120px", sm: "180px" },
                      color: "gray",
                      px: 1,
                    }}
                  >
                    {row.Driver && row.DriverName}
                  </Box>

                  <span>ทะเบียนหัว</span>

                  <Box
                    component="span"
                    sx={{
                      borderBottom: "1px dotted grey",
                      minWidth: { xs: "100px", sm: "140px" },
                      color: "gray",
                      px: 1,
                      textAlign: "center",
                    }}
                  >
                    {row.RegHead}
                  </Box>

                  <span>ทะเบียนหาง</span>

                  <Box
                    component="span"
                    sx={{
                      borderBottom: "1px dotted grey",
                      minWidth: { xs: "100px", sm: "140px" },
                      color: "gray",
                      px: 1,
                      textAlign: "center",
                    }}
                  >
                    {row.RegTail && row.RegTailName}
                  </Box>
                </Box>
              </Typography>
              <Grid
                container
                border="solid"
                paddingTop={1}
                paddingLeft={1}
                paddingRight={1}
              >
                <Grid item xs={12} marginTop={-1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    gutterBottom
                  >
                    1).ตรวจสอบระบบเบรก
                  </Typography>
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ก.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ระดับน้ำมันเบรก
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.BrakeFluid === "สูงไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.BrakeFluid === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.BrakeFluid === "ต่ำไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ต่ำไป"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.BrakeFluid === "สภาพใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สภาพใช้ได้"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.BrakeFluid === "ควรเปลี่ยน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ข.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ระดับน้ำมันคลัตช์
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.ClutchOil === "สูงไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.ClutchOil === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.ClutchOil === "ต่ำไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ต่ำไป"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.ClutchOil === "สภาพใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สภาพใช้ได้"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.ClutchOil === "ควรเปลี่ยน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ค.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      รอยรั่วซึมตามจุดต่างๆ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.Leak_B === "ไม่มี" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ไม่มี"
                  />
                </Grid>
                <Grid item xs={7} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      brake.Leak_B === undefined
                        ? false
                        : brake.Leak_B !== "ไม่มี"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="มีรอยรั่ว"
                  />
                  {brake.Leak_B === undefined ? (
                    ""
                  ) : brake.Leak_B !== "ไม่มี" ? (
                    <TextField
                      // placeholder="ระบุ"
                      size="small"
                      variant="standard"
                      value={brake.Leak_B}
                      disabled
                      sx={{ maxWidth: "10vw", marginTop: 1, fontSize: 10 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ง.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      เบรกมือ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.Brake === "เสียงดัง...คลิ๊ก" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="เสียงดัง...คลิ๊ก"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.Brake === "ใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ใช้ได้"
                  />
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={brake.Brake === "ควรปรับตั้ง" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรปรับตั้ง"
                  />
                </Grid>
                <Grid item xs={1} marginTop={-2}></Grid>
              </Grid>
              <Grid
                container
                border="solid"
                paddingTop={1}
                paddingLeft={1}
                paddingRight={1}
              >
                <Grid item xs={12} marginTop={-1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    gutterBottom
                  >
                    2).ตรวจสอบระบบไฟฟ้า
                  </Typography>
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ก.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ระดับน้ำกลั่น
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.DistilledWater === "สูงไป" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.DistilledWater === "ปกติ" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.DistilledWater === "ต่ำไป" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ต่ำไป"
                  />
                </Grid>
                <Grid item xs={4} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.DistilledWater === "ควรเติม" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ควรเติม"
                  />
                </Grid>
                {/* <Grid item xs={2.5} marginTop={-2}></Grid> */}
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ข.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ขั้วแบตเตอร์รี่
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.BatteryTerminals === "แน่นและมีฉนวนหุ่ม"
                        ? true
                        : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="แน่นและมีฉนวนหุ่ม"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.BatteryTerminals === "ไม่แน่น" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ไม่แน่น"
                  />
                </Grid>
                <Grid item xs={4} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.BatteryTerminals === undefined
                        ? false
                        : electricity.BatteryTerminals !==
                              "แน่นและมีฉนวนหุ่ม" &&
                            electricity.BatteryTerminals !== "ไม่แน่น"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="อื่นๆ"
                  />
                  {electricity.BatteryTerminals === undefined ? (
                    ""
                  ) : electricity.BatteryTerminals !== "แน่นและมีฉนวนหุ่ม" &&
                    electricity.BatteryTerminals !== "ไม่แน่น" ? (
                    <TextField
                      // placeholder="ระบุ"
                      size="small"
                      variant="standard"
                      value={electricity.BatteryTerminals}
                      disabled
                      sx={{ maxWidth: "10vw", marginTop: 1, fontSize: 10 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ค.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      สายรัดและแทนรองแบตเตอรี่
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.BatteryStrap === "แน่นและมีฉนวนหุ่ม"
                        ? true
                        : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="แน่นและมีฉนวนหุ่ม"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.BatteryStrap === "ไม่แน่น" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ไม่แน่น"
                  />
                </Grid>
                <Grid item xs={4} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.BatteryStrap === undefined
                        ? false
                        : electricity.BatteryStrap !== "แน่นและมีฉนวนหุ่ม" &&
                            electricity.BatteryStrap !== "ไม่แน่น"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="อื่นๆ"
                  />
                  {electricity.BatteryStrap === undefined ? (
                    ""
                  ) : electricity.BatteryStrap !== "แน่นและมีฉนวนหุ่ม" &&
                    electricity.BatteryStrap !== "ไม่แน่น" ? (
                    <TextField
                      // placeholder="ระบุ"
                      size="small"
                      variant="standard"
                      value={electricity.BatteryStrap}
                      disabled
                      sx={{ maxWidth: "10vw", marginTop: 1, fontSize: 10 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ง.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ไฟสูง-ต่ำ/ไฟท้าย/ไฟเบรก
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={electricity.Light === "ใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ใช้ได้"
                  />
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={electricity.Light === "ควรปรับตั้ง" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรปรับตั้ง"
                  />
                </Grid>
                <Grid item xs={2.5} marginTop={-2}></Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (จ.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      แตร/ที่ปัดน้ำฝน/ที่ฉีดน้ำล้างกระจก
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={electricity.Horn === "ใช้ได้หมด" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ใช้ได้หมด"
                  />
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      electricity.Horn === undefined
                        ? false
                        : electricity.Horn !== "ใช้ได้หมด"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ใช้ไม่ได้"
                  />
                  {electricity.Horn === undefined ? (
                    ""
                  ) : electricity.Horn !== "ใช้ได้หมด" ? (
                    <TextField
                      // placeholder="ระบุจุด"
                      size="small"
                      variant="standard"
                      value={electricity.Horn}
                      disabled
                      sx={{ maxWidth: "10vw", marginTop: 1, fontSize: 10 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={2.5} marginTop={-2}></Grid>
              </Grid>
              <Grid
                container
                border="solid"
                paddingTop={1}
                paddingLeft={1}
                paddingRight={1}
              >
                <Grid item xs={12} marginTop={-1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    gutterBottom
                  >
                    3).ตรวจสอบระบบน้ำหล่อเย็น
                  </Typography>
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ก.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      น้ำในหม้อน้ำและถังพักน้ำสำรอง
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Radiator === "สูงไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Radiator === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Radiator === "ต่ำไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ต่ำไป"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Radiator === "สภาพใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สภาพใช้ได้"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Radiator === "ควรเปลี่ยน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ข.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ระดับน้ำฉีดกระจก
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.WasherFluid === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={7} marginTop={-2}>
                  <FormCheckBox
                    checked={water.WasherFluid === "ควรเติม" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเติม"
                  />
                </Grid>
                {/* <Grid item xs={5.5} marginTop={-2}></Grid> */}
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ค.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ฝาปิดหม้อน้ำ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.RadiatorCap === "ใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ใช้ได้"
                  />
                </Grid>
                <Grid
                  item
                  xs={
                    water.RadiatorCap === "ใช้ได้" ||
                    water.RadiatorCap === "ควรเปลี่ยน"
                      ? 3
                      : 2
                  }
                  marginTop={-2}
                >
                  <FormCheckBox
                    checked={water.RadiatorCap === "ควรเปลี่ยน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid
                  item
                  xs={
                    water.RadiatorCap === "ใช้ได้" ||
                    water.RadiatorCap === "ควรเปลี่ยน"
                      ? 4
                      : 5
                  }
                  marginTop={-2}
                >
                  <FormCheckBox
                    checked={
                      water.RadiatorCap === undefined
                        ? false
                        : water.RadiatorCap !== "ใช้ได้" &&
                            water.RadiatorCap !== "ควรเปลี่ยน"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ความดันสปริงฝาหม้อน้ำ"
                  />
                  {water.RadiatorCap === undefined ? (
                    ""
                  ) : water.RadiatorCap !== "ใช้ได้" &&
                    water.RadiatorCap !== "ควรเปลี่ยน" ? (
                    <FormTypography
                      variant="subtile1"
                      sx={{ marginTop: 1 }}
                      gutterBottom
                    >
                      <TextField
                        placeholder="กรอก.."
                        size="small"
                        value={water.RadiatorCap}
                        disabled
                        variant="standard"
                        sx={{ maxWidth: "10vw", marginTop: 1, fontSize: 10 }}
                        InputLabelProps={{
                          style: { fontFamily: "Arial, sans-serif" },
                        }}
                      />
                      กก/ชม.2
                    </FormTypography>
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ง.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      สายพานทุกเส้น
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Belt === "ตึง" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ตึง"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Belt === "พอดี" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="พอดี"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Belt === "หย่อน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="หย่อน"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Belt === "สภาพดี" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สภาพดี"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={water.Belt === "ควรเปลี่ยน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (จ.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ท่อยางหม้อน้ำ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={water.RadiatorHose === "ใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ใช้ได้"
                  />
                </Grid>
                <Grid item xs={7} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      water.RadiatorHose === undefined
                        ? false
                        : water.RadiatorHose !== "ใช้ได้"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ใช้ไม่ได้"
                  />
                  {water.RadiatorHose === undefined ? (
                    ""
                  ) : water.RadiatorHose !== "ใช้ได้" ? (
                    <TextField
                      // placeholder="ระบุจุด"
                      size="small"
                      value={water.RadiatorHose}
                      disabled
                      variant="standard"
                      sx={{ maxWidth: "10vw", marginTop: 1, fontSize: 10 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                {/* <Grid item xs={4} marginTop={-2}></Grid> */}
              </Grid>
              <Grid
                container
                border="solid"
                paddingTop={1}
                paddingLeft={1}
                paddingRight={1}
              >
                <Grid item xs={12} marginTop={-1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    gutterBottom
                  >
                    4).ตรวจลมยางและกระทะล้อ
                  </Typography>
                </Grid>
                <Grid item xs={12} marginTop={-1}>
                  <Box display="flex" justifyContent="left">
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ก.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ขนาดยางที่ใช้
                      <u
                        style={{
                          textDecoration: "none",
                          borderBottom: "1px dotted grey",
                          width: "50px",
                          display: "inline-block",
                          textAlign: "center",
                          color: "gray",
                        }}
                      >
                        {air.TireSize}
                      </u>
                      ลมยางสูงสุด
                      <u
                        style={{
                          textDecoration: "none",
                          borderBottom: "1px dotted grey",
                          width: "50px",
                          display: "inline-block",
                          textAlign: "center",
                          color: "gray",
                        }}
                      >
                        {air.TirePressureMax}
                      </u>
                      ปอนด์/ตารางนิ้ว น้ำหนักบรรทุกสูงสุด
                      <u
                        style={{
                          textDecoration: "none",
                          borderBottom: "1px dotted grey",
                          width: "50px",
                          display: "inline-block",
                          textAlign: "center",
                          color: "gray",
                        }}
                      >
                        {air.WeightTruck}
                      </u>
                      กิโลกรัม/เส้น ความเร็วสูงสุด
                      <u
                        style={{
                          textDecoration: "none",
                          borderBottom: "1px dotted grey",
                          width: "50px",
                          display: "inline-block",
                          textAlign: "center",
                          color: "gray",
                        }}
                      >
                        {air.Speed}
                      </u>
                      กม./ชม. วันผลิตยาง
                      <u
                        style={{
                          textDecoration: "none",
                          borderBottom: "1px dotted grey",
                          width: "100px",
                          display: "inline-block",
                          textAlign: "center",
                          color: "gray",
                        }}
                      >
                        {air.DateTire}
                      </u>
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ข.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ความลึกของดอกยาง
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      air.TreadDepth === "มากกว่า 1.6 มม." ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="มากกว่า 1.6 มม."
                  />
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      air.TreadDepth === "น้อยกว่า 1.6 มม." ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="น้อยกว่า 1.6 มม."
                  />
                </Grid>
                <Grid item xs={2.5} marginTop={-2}></Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ค.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      สภาพแก้มยาง
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={air.CheekRubber === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={5.5} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      air.CheekRubber === undefined
                        ? false
                        : air.CheekRubber !== "ปกติ"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ผิดปกติ"
                  />
                  {air.CheekRubber === undefined ? (
                    ""
                  ) : air.CheekRubber !== "ปกติ" ? (
                    <TextField
                      // placeholder="ระบุล้อ"
                      size="small"
                      variant="standard"
                      value={air.CheekRubber}
                      disabled
                      sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ง.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ความดันลมยาง
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={air.TirePressure === "ถูกต้องตามคู่มือรถ" ? 5.5 : 3}
                  marginTop={-2}
                >
                  <FormCheckBox
                    checked={
                      air.TirePressure === "ถูกต้องตามคู่มือรถ" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ถูกต้องตามคู่มือรถ"
                  />
                </Grid>
                <Grid
                  item
                  xs={air.TirePressure === "ถูกต้องตามคู่มือรถ" ? 1.5 : 3}
                  marginTop={-2}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "left",
                  }}
                >
                  <FormCheckBox
                    checked={
                      air.TirePressure === undefined
                        ? false
                        : air.TirePressure !== "ถูกต้องตามคู่มือรถ"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                  {air.TirePressure === undefined ? (
                    ""
                  ) : air.TirePressure !== "ถูกต้องตามคู่มือรถ" ? (
                    <TextField
                      // placeholder="ระบุล้อ"
                      size="small"
                      variant="standard"
                      value={air.TirePressure}
                      disabled
                      fullWidth
                      sx={{ marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid
                  item
                  xs={air.TirePressure === "ถูกต้องตามคู่มือรถ" ? 1.5 : 2.5}
                  marginTop={-2}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "left",
                  }}
                >
                  <FormCheckBox
                    checked={
                      air.TirePressure === undefined
                        ? false
                        : air.TirePressure !== "ถูกต้องตามคู่มือรถ"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="น้อยไป"
                  />
                  {air.TirePressure === undefined ? (
                    ""
                  ) : air.TirePressure !== "ถูกต้องตามคู่มือรถ" ? (
                    <TextField
                      // placeholder="ระบุล้อ"
                      size="small"
                      variant="standard"
                      value={air.TirePressure}
                      fullWidth
                      disabled
                      sx={{ marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (จ.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ฝาปิดจปเติมลม
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={air.AirCap === "มีครบ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="มีครบ"
                  />
                </Grid>
                <Grid item xs={3} marginTop={-2}>
                  <FormCheckBox
                    checked={air.AirCap === "มีไม่ครบ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="มีไม่ครบ"
                  />
                </Grid>
                <Grid item xs={2.5} marginTop={-2}></Grid>
              </Grid>
              <Grid
                container
                border="solid"
                paddingTop={1}
                paddingLeft={1}
                paddingRight={1}
              >
                <Grid item xs={12} marginTop={-1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    gutterBottom
                  >
                    5).ตรวจระบบน้ำมันเชื้อเพลิง
                  </Typography>
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ก.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      รอยรั่วซึมตามจุดต่างๆ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={gasoline.Leak_G === "ไม่มี" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ไม่มี"
                  />
                </Grid>
                <Grid item xs={7} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      gasoline.Leak_G === undefined
                        ? false
                        : gasoline.Leak_G !== "ไม่มี"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="มีรอยรั่ว"
                  />
                  {gasoline.Leak_G === undefined ? (
                    ""
                  ) : gasoline.Leak_G !== "ไม่มี" ? (
                    <TextField
                      // placeholder="ระบุจุดที่รั่ว"
                      size="small"
                      value={gasoline.Leak_G}
                      disabled
                      variant="standard"
                      sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ข.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      กรอกดักน้ำ(รถดีเซล)
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={gasoline.WaterFilter === "มีน้ำ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="มีน้ำ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={gasoline.WaterFilter === "ไม่มีน้ำ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ไม่มีน้ำ"
                  />
                </Grid>
                <Grid item xs={5.5} marginTop={-2}>
                  <FormCheckBox
                    checked={gasoline.WaterFilter === "ไม่แน่ใจ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ไม่แน่ใจ"
                  />
                </Grid>
                {/* <Grid item xs={4} marginTop={-2}></Grid> */}
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ค.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      กรองอากาศ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={gasoline.AirFilter === "สภาพดี" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สภาพดี"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={gasoline.AirFilter === "พอใช้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="พอใช้"
                  />
                </Grid>
                <Grid item xs={5.5} marginTop={-2}>
                  <FormCheckBox
                    checked={gasoline.AirFilter === "ควรเปลี่ยน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                {/* <Grid item xs={2.5} marginTop={-2}></Grid> */}
              </Grid>
              <Grid
                container
                border="solid"
                paddingTop={1}
                paddingLeft={1}
                paddingRight={1}
              >
                <Grid item xs={12} marginTop={-1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    gutterBottom
                  >
                    6).ตรวจน้ำมันหล่อลื่นต่างๆ
                  </Typography>
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ก.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ระดับน้ำมันเครื่อง
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.EngineOil === "สูงไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.EngineOil === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.EngineOil === "ต่ำไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ต่ำไป"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.EngineOil === "สภาพใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สภาพใช้ได้"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.EngineOil === "ควรเปลี่ยน" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ข.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ระดับน้ำมันพวงมาลัยพาวเวอร์
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.PowerSteeringOil === "สูงไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.PowerSteeringOil === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.PowerSteeringOil === "ต่ำไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ต่ำไป"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      oils.PowerSteeringOil === "สภาพใช้ได้" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="สภาพใช้ได้"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      oils.PowerSteeringOil === "ควรเปลี่ยน" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ค.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ระดับน้ำเกียร์อัตโนมัติ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.TransmissionFluid === "สูงไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="สูงไป"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.TransmissionFluid === "ปกติ" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ปกติ"
                  />
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.TransmissionFluid === "ต่ำไป" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ต่ำไป"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      oils.TransmissionFluid === "สภาพใช้ได้" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="สภาพใช้ได้"
                  />
                </Grid>
                <Grid item xs={2} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      oils.TransmissionFluid === "ควรเปลี่ยน" ? true : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ง.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      รอบรั่วซึมตามจุดต่างๆ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={oils.Leak_O === "ไม่มี" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ไม่มี"
                  />
                </Grid>
                <Grid item xs={7} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      oils.Leak_O === undefined
                        ? false
                        : oils.Leak_O !== "ไม่มี"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="มีรอยรั่ว"
                  />
                  {oils.Leak_O === undefined ? (
                    ""
                  ) : oils.Leak_O !== "ไม่มี" ? (
                    <TextField
                      // placeholder="ระบุจุดที่รั่ว"
                      size="small"
                      value={oils.Leak_O}
                      disabled
                      variant="standard"
                      sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
              </Grid>
              <Grid
                container
                border="solid"
                paddingTop={1}
                paddingLeft={1}
                paddingRight={1}
              >
                <Grid item xs={12} marginTop={-1}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    gutterBottom
                  >
                    7).เสียงดังต่างๆ
                  </Typography>
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ก.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      เสียงดังผิดปรกติอื่นๆ
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={noise.UnusualNoise === "ไม่มี" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ไม่มี"
                  />
                </Grid>
                <Grid item xs={7} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      noise.UnusualNoise === undefined
                        ? false
                        : noise.UnusualNoise !== "ไม่มี"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="มี"
                  />
                  {noise.UnusualNoise === undefined ? (
                    ""
                  ) : noise.UnusualNoise !== "ไม่มี" ? (
                    <TextField
                      // placeholder="ระบุจุด"
                      size="small"
                      value={noise.UnusualNoise}
                      disabled
                      variant="standard"
                      sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ข.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ยางแท่นเครื่อง
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={noise.MountRubber === "ใช้ได้" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ใช้ได้"
                  />
                </Grid>
                <Grid item xs={4.5} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      noise.MountRubber === undefined
                        ? false
                        : noise.MountRubber !== "ใช้ได้"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="ควรเปลี่ยน"
                  />
                  {noise.MountRubber === undefined ? (
                    ""
                  ) : noise.MountRubber !== "ใช้ได้" ? (
                    <TextField
                      // placeholder="ระบุจุด"
                      size="small"
                      value={noise.MountRubber}
                      disabled
                      variant="standard"
                      sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
                <Grid item xs={1.5} marginTop={-2}></Grid>
                <Grid item xs={3.5} marginTop={-2}>
                  <Box
                    display="flex"
                    justifyContent="left"
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <FormTypography
                      variant="subtitle2"
                      sx={{ marginRight: 1 }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      (ค.){" "}
                    </FormTypography>
                    <FormTypography variant="subtitle2" gutterBottom>
                      ท่อไอเสีย
                    </FormTypography>
                  </Box>
                </Grid>
                <Grid item xs={1.5} marginTop={-2}>
                  <FormCheckBox
                    checked={noise.Intake === "ไม่รั่ว" ? true : false}
                    disabled
                    control={<Checkbox />}
                    label="ไม่รั่ว"
                  />
                </Grid>
                <Grid item xs={7} marginTop={-2}>
                  <FormCheckBox
                    checked={
                      noise.Intake === undefined
                        ? false
                        : noise.Intake !== "ไม่รั่ว"
                          ? true
                          : false
                    }
                    disabled
                    control={<Checkbox />}
                    label="รั่ว"
                  />
                  {noise.Intake === undefined ? (
                    ""
                  ) : noise.Intake !== "ไม่รั่ว" ? (
                    <TextField
                      // placeholder="ระบุจุดที่รั่ว"
                      size="small"
                      value={noise.Intake}
                      disabled
                      variant="standard"
                      sx={{ maxWidth: "10vw", marginLeft: 1, marginTop: 1 }}
                      InputLabelProps={{
                        style: { fontFamily: "Arial, sans-serif" },
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Grid>
              </Grid>
              <Grid container spacing={2} marginTop={-1.5}>
                <Grid item xs={9}></Grid>
                <Grid item xs={3} textAlign="center">
                  <TextField
                    placeholder="ลงชื่อ"
                    size="small"
                    variant="standard"
                    value={inspection.EmployeeName || ""}
                    InputLabelProps={{
                      style: {
                        textAlign: "center",
                        width: "100%",
                        fontFamily: "Arial, sans-serif",
                      }, // จัดให้ label อยู่ตรงกลาง
                    }}
                    inputProps={{
                      style: {
                        textAlign: "center",
                        fontFamily: "Arial, sans-serif",
                      }, // จัดให้ input text อยู่ตรงกลาง (ถ้าต้องการ)
                    }}
                    disabled
                  />
                  <FormTypography
                    variant="subtitle1"
                    textAlign="center"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {`( ${dayjs(inspection.Date).locale("th").format("DD/MM/YYYY")} )`}
                  </FormTypography>
                  <FormTypography
                    variant="subtitle1"
                    textAlign="center"
                    fontWeight="bold"
                    marginTop={-1}
                    gutterBottom
                  >
                    ลงชื่อผู้ตรวจสภาพรถ
                  </FormTypography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
        <Box textAlign="center" marginBottom={2}>
          <Button
            variant="contained"
            color="info"
            sx={{ marginRight: 1 }}
            onClick={handleExportPDF}
          >
            export PDF
          </Button>
        </Box>
      </Dialog>
    </React.Fragment>
  );
};

export default TruckRepair;
