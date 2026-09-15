import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Grid,
  TableHead,
  TableCell,
  TableRow,
  Table,
  Paper,
  TableContainer,
  TableBody,
  Box,
} from "@mui/material";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { formatThaiSlash } from "../../theme/DateTH";

const PrintInvoice = () => {
  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("invoiceData"));

    // หน่วงให้ DOM render ก่อน
    const timer = setTimeout(() => {
      const element = document.querySelector("#invoiceContent");

      const isA4 = data?.PaperSize === "แนวตั้ง";

      const opt = {
        margin: 0,
        filename: `O-${data.Code}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "cm",
          format: isA4 ? "a4" : "a5", // ✅ สลับ A4/A5
          orientation: isA4 ? "portrait" : "landscape", // ✅ แนวตั้ง / แนวนอน
        },
      };

      html2pdf().set(opt).from(element).save();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const s = Math.min(window.innerWidth / 794, 1);
      setScale(s);
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const { customerbigtruck, customersmalltruck, company } = useBasicData();
  const customerB = Object.values(customerbigtruck || {});
  const customerS = Object.values(customersmalltruck || {});
  const companyDetail = Object.values(company || {});

  const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));
  if (!invoiceData) return <div>กำลังโหลด...</div>;

  const customer = customerB.find(
    (row) => row.uuid === invoiceData?.Order[0].TicketName,
  );
  const invoiceC = companyDetail.find((row) => row.uuid === customer?.Company);

  // Step 1: จัดกลุ่มข้อมูล
  const groupedData = [];
  const seenKeys = {};

  invoiceData.Report.forEach((row, index) => {
    const key = `${row.Date}_${row.Driver}_${row.Registration}`;
    if (seenKeys[key]) {
      seenKeys[key].count += 1;
    } else {
      seenKeys[key] = { index: groupedData.length, count: 1 };
      groupedData.push({ ...row, key }); // เพิ่ม key ไว้เช็คตอน render
    }
  });

  const formatAddressStandard = (address) => {
    if (!address) return "-";

    let addr = {
      no: "",
      village: "",
      subDistrict: "",
      district: "",
      province: "",
      zipCode: "",
      road: "",
    };

    // ======================
    // 1️⃣ normalize object
    // ======================
    if (typeof address === "object") {
      addr = {
        no: address.no ?? "",
        village: address.village ?? "",
        subDistrict: address.subDistrict ?? "",
        district: address.district ?? "",
        province: address.province ?? "",
        zipCode: address.zipCode ?? "",
        road: "",
      };
    }

    // ======================
    // 2️⃣ normalize string (legacy)
    // ======================
    if (typeof address === "string") {
      let parts = address.trim().split(/\s+/);

      // หา "ถ."
      const roadIndex = parts.findIndex((p) => p.startsWith("ถ."));
      if (roadIndex !== -1) {
        addr.road = parts[roadIndex];
        parts.splice(roadIndex, 1);
      }

      // zip
      if (/^\d{5}$/.test(parts.at(-1))) {
        addr.zipCode = parts.pop();
      }

      addr.province = parts.pop() ?? "";
      addr.district = parts.pop() ?? "";
      addr.subDistrict = parts.pop() ?? "";

      const maybeVillage = parts.at(-1);
      if (/^\d+$/.test(maybeVillage)) {
        addr.village = parts.pop();
      }

      addr.no = parts.join(" ");
    }

    // ======================
    // 3️⃣ clean ค่า "-", null, ""
    // ======================
    const clean = (v) => (v && v !== "-" && String(v).trim() !== "" ? v : "");

    addr = Object.fromEntries(
      Object.entries(addr).map(([k, v]) => [k, clean(v)]),
    );

    // ======================
    // 4️⃣ ตรวจจับ "ถ." ที่หลงผิดช่อง
    // ======================
    // ถ้า village เป็นถนน
    if (addr.village.startsWith("ถ.")) {
      addr.road = addr.village;
      addr.village = "";
    }

    // ถ้า subDistrict เป็นถนน
    if (addr.subDistrict.startsWith("ถ.")) {
      addr.road = addr.subDistrict;
      addr.subDistrict = "";
    }

    // ======================
    // 5️⃣ ต้องมีขั้นต่ำ
    // ======================
    if (!addr.no || !addr.district || !addr.province) return "-";

    // ======================
    // 6️⃣ format มาตรฐาน
    // ======================
    return [
      `บ้านเลขที่ ${addr.no}`,
      addr.village && `หมู่ ${addr.village}`,
      addr.road && addr.road,
      addr.subDistrict && `ต.${addr.subDistrict}`,
      `อ.${addr.district}`,
      `จ.${addr.province}`,
      addr.zipCode,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const numberToThaiText = (num) => {
    const thaiNumbers = [
      "ศูนย์",
      "หนึ่ง",
      "สอง",
      "สาม",
      "สี่",
      "ห้า",
      "หก",
      "เจ็ด",
      "แปด",
      "เก้า",
    ];
    const thaiPlaces = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

    let text = "";
    let numberStr = parseFloat(num).toFixed(2).toString(); // แปลงเป็น string พร้อมทศนิยม
    let [integerPart, decimalPart] = numberStr.split("."); // แยกส่วนจำนวนเต็มและทศนิยม

    // 🟢 แปลงส่วนจำนวนเต็ม
    let intLen = integerPart.length;
    for (let i = 0; i < intLen; i++) {
      let digit = parseInt(integerPart[i]);
      let place = intLen - i - 1;

      if (digit !== 0) {
        if (place === 1 && digit === 1) {
          text += "สิบ"; // "หนึ่งสิบ" → "สิบ"
        } else if (place === 1 && digit === 2) {
          text += "ยี่สิบ"; // "สองสิบ" → "ยี่สิบ"
        } else if (place === 0 && digit === 1 && intLen > 1) {
          text += "เอ็ด"; // "หนึ่ง" → "เอ็ด" ในหลักหน่วย
        } else {
          text += thaiNumbers[digit] + thaiPlaces[place];
        }
      }
    }

    text += "บาท"; // หน่วยเงินไทย

    // 🟢 แปลงส่วนทศนิยม (สตางค์)
    if (decimalPart && decimalPart !== "00") {
      text += " " + thaiNumbers[parseInt(decimalPart[0])] + "สิบ";
      if (decimalPart[1] !== "0") {
        text += thaiNumbers[parseInt(decimalPart[1])];
      }
      text += "สตางค์";
    } else {
      text += "ถ้วน";
    }

    return text;
  };

  const formatThaiDate = (inputDate) => {
    if (!inputDate) return "ไม่พบข้อมูลวันที่";

    let dateObj;

    // ✅ ตรวจชนิดของ input
    if (typeof inputDate === "string") {
      // รองรับรูปแบบ DD/MM/YYYY หรือ YYYY-MM-DD
      const parts = inputDate.includes("/")
        ? inputDate.split("/")
        : inputDate.split("-");
      if (parts.length === 3) {
        // แยกตามรูปแบบ DD/MM/YYYY
        if (inputDate.includes("/")) {
          const [day, month, year] = parts.map(Number);
          dateObj = dayjs(new Date(year, month - 1, day));
        } else {
          // รูปแบบ YYYY-MM-DD
          const [year, month, day] = parts.map(Number);
          dateObj = dayjs(new Date(year, month - 1, day));
        }
      }
    } else if (dayjs.isDayjs(inputDate)) {
      // ถ้าเป็น dayjs object อยู่แล้ว
      dateObj = inputDate;
    } else {
      // fallback กรณีไม่รู้ชนิด
      dateObj = dayjs(inputDate);
    }

    // ถ้าแปลงไม่ได้
    if (!dateObj || !dateObj.isValid()) return "รูปแบบวันที่ไม่ถูกต้อง";

    const day = dateObj.date().toString().padStart(2, "0");
    const month = (dateObj.month() + 1).toString().padStart(2, "0");
    const buddhistYear = dateObj.year() + 543;

    return `${day}/${month}/${buddhistYear}`;
  };

  const formatAddress = (address) => {
    let addrObj = null;

    // ถ้าเป็น string
    if (typeof address === "string") {
      const parts = address.trim().split(/\s+/);
      if (parts.length < 5) return "-";

      addrObj = {
        no: parts[0],
        village: parts[1],
        subDistrict: parts[2],
        district: parts[3],
        province: parts[4],
        zipCode: parts[5] || "",
        road: "",
      };
    }
    // ถ้าเป็น object
    else if (typeof address === "object" && address !== null) {
      addrObj = address;
    } else {
      return "-";
    }

    // ตรวจสอบค่าที่จำเป็น
    if (
      !addrObj.no ||
      !addrObj.village ||
      !addrObj.subDistrict ||
      !addrObj.district ||
      !addrObj.province
    ) {
      return "-";
    }

    // ฟอร์แมต address
    const roadPart =
      addrObj.road && addrObj.road !== "-" ? ` ถ.${addrObj.road}` : "";
    const zipPart = addrObj.zipCode ? ` ${addrObj.zipCode}` : "";

    return `${addrObj.no} หมู่ ${addrObj.village}${roadPart} ต.${addrObj.subDistrict} อ.${addrObj.district} จ.${addrObj.province}${zipPart}`;
  };

  const formatTaxID = (taxID) => {
    if (!taxID || taxID === "-") {
      return "-";
    }
    return String(taxID).replace(/(\d{3})(\d{4})(\d{5})(\d{1})/, "$1 $2 $3 $4");
  };

  const formatPhoneNumber = (phone) => {
    if (!phone || phone === "-") {
      return "-";
    }
    return String(phone).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  const handleDownloadImage = () => {
    const content = document.querySelector("#invoiceContent"); // เลือก div ที่คุณต้องการแปลงเป็นรูปภาพ

    // ใช้ html2canvas เพื่อแปลงเนื้อหา HTML เป็นรูปภาพ
    html2canvas(content).then((canvas) => {
      // แปลง canvas ให้เป็น URL รูปภาพ
      const imageUrl = canvas.toDataURL("image/png");

      // สร้างลิงก์ดาวน์โหลด
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "invoice.png"; // ตั้งชื่อไฟล์
      link.click(); // คลิกเพื่อดาวน์โหลด
    });
  };

  return (
    <Box display="flex" justifyContent="center" mt={5} overflow="auto">
      <Box
        sx={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <Box
          id="invoiceContent"
          sx={{
            width: invoiceData?.PaperSize === "แนวตั้ง" ? "21cm" : "21cm", // ✅ กว้างตามแนวนอน A5
            height: invoiceData?.PaperSize === "แนวตั้ง" ? "29.5cm" : "14.7cm", // ✅ สูงตาม A5 แนวนอน
            backgroundColor: "#fff",
            padding: "0.7cm", // เว้น margin ภายในเนื้อหา
            paddingRight: 1,
            boxSizing: "border-box",
            border: "1px solid lightgray",
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={8}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {invoiceData.Company}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ marginTop: -1 }}
                gutterBottom
              >
                {formatAddress(invoiceData?.Address)}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ marginTop: -1 }}
                gutterBottom
              >
                เลขประจำตัวผู้เสียภาษีอากร : {formatTaxID(invoiceData?.CardID)}
              </Typography>
            </Grid>
            <Grid item xs={4} textAlign="right">
              <Typography
                variant="h6"
                sx={{ marginRight: 2, fontWeight: "Light" }}
              >
                ใบวางบิล / ใบแจ้งหนี้
              </Typography>
            </Grid>
          </Grid>
          {invoiceData && (
            <Grid container spacing={2} marginTop={1} sx={{ px: 2 }}>
              {/* ส่วนข้อมูลบริษัท */}
              <Grid
                item
                xs={10}
                sx={{ border: "2px solid black", height: "120px" }}
              >
                <Box sx={{ padding: 0.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="left">
                    <Typography variant="subtitle2">
                      <b>ชื่อบริษัท:</b>
                    </Typography>
                    <Typography variant="subtitle2" marginLeft={1}>
                      {invoiceData?.Order[0].CompanyNameNew}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="left"
                    marginTop={0.5}
                  >
                    <Typography variant="subtitle2">
                      <b>ที่อยู่:</b>
                    </Typography>
                    <Typography variant="subtitle2" marginLeft={4}>
                      {formatAddressStandard(invoiceData?.CustomerAddress)}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="left"
                    marginTop={0.5}
                  >
                    <Typography variant="subtitle2">
                      <b>เลขประจำตัวผู้เสียภาษีอากร:</b>
                    </Typography>
                    <Typography variant="subtitle2" marginLeft={1}>
                      {formatTaxID(invoiceData?.Order[0].CodeIDNew)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* ส่วนวันที่และเลขที่เอกสาร */}
              <Grid item xs={2}>
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      borderTop: "2px solid black",
                      borderRight: "2px solid black",
                      textAlign: "center",
                      height: "25px",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        marginTop: -1.5,
                        marginLeft: -2,
                      }}
                      gutterBottom
                    >
                      วันที่
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      borderTop: "2px solid black",
                      borderRight: "2px solid black",
                      textAlign: "center",
                      height: "35px",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ marginTop: -1, marginLeft: -2 }}
                      gutterBottom
                    >
                      {(() => {
                        try {
                          const rawDate = invoiceData?.Date;
                          const parsed = dayjs(rawDate, "DD/MM/YYYY", true); // true = strict parsing

                          // ✅ ถ้าไม่มีวันที่ หรือ parsing ผิด (invalid)
                          if (!rawDate || !parsed.isValid()) {
                            return formatThaiDate(dayjs(new Date()));
                          }

                          // ✅ ถ้า valid — แปลงตามปกติ
                          return formatThaiDate(parsed.format("DD/MM/YYYY"));
                        } catch (err) {
                          // ✅ fallback กรณีเกิด error
                          return formatThaiDate(dayjs(new Date()));
                        }
                      })()}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      borderTop: "2px solid black",
                      borderRight: "2px solid black",
                      textAlign: "center",
                      height: "25px",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        marginTop: -1.5,
                        marginLeft: -2,
                      }}
                      gutterBottom
                    >
                      เลขที่เอกสาร
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      borderTop: "2px solid black",
                      borderRight: "2px solid black",
                      textAlign: "center",
                      borderBottom: "2px solid black",
                      height: "35px",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ marginTop: -1, marginLeft: -2 }}
                      gutterBottom
                    >
                      {invoiceData?.Code}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* ตารางใบวางบิล */}
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  "& .MuiTableCell-root": { padding: "1px" },
                  marginTop: 2,
                  border: "2px solid black",
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{ borderBottom: "2px solid black", height: "50px" }}
                  >
                    <TableCell
                      sx={{
                        borderRight: "2px solid black",
                        borderBottom: "1px solid black",
                        textAlign: "center",
                        width: "75px",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }}
                        gutterBottom
                      >
                        วันที่
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: "2px solid black",
                        borderBottom: "1px solid black",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }}
                        gutterBottom
                      >
                        ผู้ขับ/ป้ายทะเบียน
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: "2px solid black",
                        borderBottom: "1px solid black",
                        textAlign: "center",
                        width: "60px",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, fontSize: "15px", margin: -0.5 }}
                        gutterBottom
                      >
                        ชนิดน้ำมัน
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: "2px solid black",
                        borderBottom: "1px solid black",
                        textAlign: "center",
                        width: "80px",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }}
                        gutterBottom
                      >
                        จำนวนลิตร
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: "2px solid black",
                        borderBottom: "1px solid black",
                        textAlign: "center",
                        width: "80px",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }}
                        gutterBottom
                      >
                        ราคาต่อลิตร
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        width: "90px",
                        borderBottom: "1px solid black",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }}
                        gutterBottom
                      >
                        ยอดเงิน
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceData?.Report.map((row, index) => {
                    const key = `${row.Date}_${row.Driver}_${row.Registration}`;
                    const group = seenKeys[key];

                    // ถ้า index ไม่ตรงกับ index แรกของกลุ่ม ให้ skip cell ที่ซ้ำ
                    const isFirstRowInGroup = group.index === index;

                    return (
                      <TableRow key={index} sx={{ height: "30px" }}>
                        {isFirstRowInGroup && (
                          <TableCell
                            rowSpan={group.count}
                            sx={{
                              borderRight: "2px solid black",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {formatThaiDate(
                                dayjs(row.DateDelivery, "DD/MM/YYYY").format(
                                  "DD/MM/YYYY",
                                ),
                              )}
                            </Typography>
                          </TableCell>
                        )}

                        {isFirstRowInGroup && (
                          <TableCell
                            rowSpan={group.count}
                            sx={{
                              borderRight: "2px solid black",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {`${row.Driver} : ${row.Registration} / ${row.RegTail}`}
                            </Typography>
                          </TableCell>
                        )}

                        {/* คอลัมน์อื่น ๆ render ทุกแถวตามปกติ */}
                        <TableCell
                          sx={{
                            borderRight: "2px solid black",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {row.ProductName}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "2px solid black",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {new Intl.NumberFormat("en-US").format(row.Volume)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "2px solid black",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(row.RateOil)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ lineHeight: 1, margin: 0 }}
                            gutterBottom
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(row.Amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow sx={{ height: "30px" }}>
                    <TableCell
                      colSpan={2}
                      sx={{
                        borderTop: "2px solid black",
                        textAlign: "left",
                        borderRight: "2px solid black",
                        verticalAlign: "middle", // ✅ เพิ่มบรรทัดนี้
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          fontSize="15px"
                          sx={{ lineHeight: 1, margin: 0, marginLeft: 1 }}
                          gutterBottom
                        >
                          กำหนดชำระเงิน :
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ lineHeight: 1, margin: 0, marginLeft: 1 }}
                          gutterBottom
                        >
                          {invoiceData?.DateEnd}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderTop: "2px solid black",
                        textAlign: "center",
                        borderRight: "2px solid black",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, margin: 0 }}
                      >
                        รวม
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        borderTop: "2px solid black",
                        textAlign: "center",
                        borderRight: "2px solid black",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, margin: 0 }}
                      >
                        {new Intl.NumberFormat("en-US").format(
                          invoiceData?.Volume,
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderRight: "2px solid black",
                        borderTop: "2px solid black",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, margin: 0 }}
                        gutterBottom
                      >
                        รวมเป็นเงิน
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        borderTop: "2px solid black",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, margin: 0 }}
                        gutterBottom
                      >
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(invoiceData?.Amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    sx={{ borderTop: "2px solid black", height: "30px" }}
                  >
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid black",
                      }}
                      colSpan={6}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ lineHeight: 1, margin: 0 }}
                        gutterBottom
                      >{`( ${numberToThaiText(invoiceData?.Amount)} )`}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Grid item xs={12}>
                <Grid
                  container
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid item xs={8}>
                    {invoiceData?.BankCompany?.includes("นาครา ปิโตรเลียม") ? (
                      <Box marginTop={-2}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            ชื่อบัญชี :
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ marginLeft: 2 }}
                            gutterBottom
                          >
                            {invoiceData?.Company}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            กสิกรไทย :
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ marginLeft: 1 }}
                            gutterBottom
                          >
                            เซ็นทรัล...เฟสติเวลเชียงใหม่ 663-1-00976-8
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            กรุงไทย :
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ marginLeft: 1 }}
                            gutterBottom
                          >
                            เซ็นทรัล...เฟสติเวลเชียงใหม่ 017-0-70850-0
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box marginTop={-2}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            ชื่อบัญชี :
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ marginLeft: 2 }}
                            gutterBottom
                          >
                            บริษัท แพนด้า สตาร์ ออยล์ จำกัด
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            กสิกรไทย :
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ marginLeft: 1 }}
                            gutterBottom
                          >
                            เซ็นทรัล...เฟสติเวลเชียงใหม่ 663-1-01357-9
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Box
                      width="100%"
                      borderTop="2px solid black"
                      sx={{ marginTop: 3.5 }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ marginTop: 0.5 }}
                        gutterBottom
                      >
                        ผู้วางบิล
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
        </div>
      </Box>
    </Box>
  );
};

export default PrintInvoice;
