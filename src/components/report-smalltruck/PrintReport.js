import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box } from "@mui/material";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatThaiSlash } from "../../theme/DateTH";

const PrintReport = () => {

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("invoiceData"));

    // หน่วงให้ DOM render ก่อน
    const timer = setTimeout(() => {
      const element = document.querySelector("#invoiceContent");

      const opt = {
        margin: 0, // ไม่ต้องเว้น margin นอก page ถ้าใน element มี padding แล้ว
        filename: `T-${data.Code}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,           // เพิ่มความคมชัด
          useCORS: true       // รองรับภาพจาก URL ต่างโดเมน (ถ้ามี)
        },
        jsPDF: {
          unit: 'cm',         // ใช้หน่วยเดียวกับ CSS
          format: 'a4',
          orientation: 'portrait'
        }
      };

      html2pdf().set(opt).from(element).save();
    }, 500);


    return () => clearTimeout(timer);
  }, []);

  const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));
  if (!invoiceData) return <div>กำลังโหลด...</div>;

  const formatAddress = (address) => {
    // แยกข้อมูลจาก address โดยใช้ , หรือ เว้นวรรคเป็นตัวแบ่ง
    const parts = address.split(/,|\s+/).filter(Boolean);

    if (parts.length < 5) return "รูปแบบที่อยู่ไม่ถูกต้อง";

    const [houseNo, moo, subdistrict, district, province, postalCode] = parts;

    return `${houseNo} หมู่ ${moo} ต.${subdistrict} อ.${district} จ.${province} ${postalCode}`;
  };

  const formatAddressStandard = (address) => {
    if (!address) return "-";

    let addr = {
      no: "",
      village: "",
      subDistrict: "",
      district: "",
      province: "",
      zipCode: "",
      road: ""
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
        road: ""
      };
    }

    // ======================
    // 2️⃣ normalize string (legacy)
    // ======================
    if (typeof address === "string") {
      let parts = address.trim().split(/\s+/);

      // หา "ถ."
      const roadIndex = parts.findIndex(p => p.startsWith("ถ."));
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
    const clean = (v) =>
      v && v !== "-" && String(v).trim() !== "" ? v : "";

    addr = Object.fromEntries(
      Object.entries(addr).map(([k, v]) => [k, clean(v)])
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
      addr.zipCode
    ].filter(Boolean).join(" ");
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

  const numberToThaiText = (num) => {
    const thaiNumbers = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
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

  const handleDownloadImage = () => {
    const content = document.querySelector("#invoiceContent"); // เลือก div ที่คุณต้องการแปลงเป็นรูปภาพ

    // ใช้ html2canvas เพื่อแปลงเนื้อหา HTML เป็นรูปภาพ
    html2canvas(content).then((canvas) => {
      // แปลง canvas ให้เป็น URL รูปภาพ
      const imageUrl = canvas.toDataURL("image/png");

      // สร้างลิงก์ดาวน์โหลด
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'report.png'; // ตั้งชื่อไฟล์
      link.click(); // คลิกเพื่อดาวน์โหลด
    });
  };

  const rowSpanMap = invoiceData?.Report.reduce((acc, row) => {
    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  let mergedCells = {};
  let displayIndex = 0;

  console.log("invoiceData : ", invoiceData);
  console.log("Tickets Order : ", invoiceData?.Report);
  console.log("Total Order : ", invoiceData?.Total);

  return (
    <React.Fragment>
      <Box
        id="invoiceContent"
        sx={{
          width: "21cm",
          minHeight: "27cm", // ใช้ minHeight เผื่อเนื้อหาเกิน
          backgroundColor: "#fff",
          padding: "1cm",      // เว้น margin ภายในเนื้อหา
          boxSizing: "border-box"
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={9}>
            {
              invoiceData &&
              (
                <React.Fragment>
                  <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: -1 }} gutterBottom>{invoiceData?.Company}</Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: -1 }} gutterBottom>
                    {formatAddressStandard(invoiceData?.Address)}
                    {/* เบอร์โทร : {formatPhoneNumber(invoiceData?.Phone)} */}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>เลขประจำตัวผู้เสียภาษีอากร : {formatTaxID(invoiceData?.CardID)}</Typography>
                </React.Fragment>
              )
            }
          </Grid>
          <Grid item xs={3} textAlign="right">
            <Typography variant="h6" sx={{ marginRight: 2 }}>
              ใบวางบิล/ใบแจ้งหนี้
            </Typography>
          </Grid>
        </Grid>
        {invoiceData && (
          <Grid container spacing={2} marginTop={2} sx={{ px: 2 }}>
            {/* ส่วนข้อมูลบริษัท */}
            <Grid item xs={10} sx={{ border: "2px solid black", height: "140px" }}>
              <Typography variant="subtitle2"><b>ชื่อบริษัท:</b> {invoiceData?.Company}</Typography>
              <Typography variant="subtitle2"><b>ที่อยู่:</b> {formatAddressStandard(invoiceData?.Address)}</Typography>
              <Typography variant="subtitle2"><b>เลขประจำตัวผู้เสียภาษีอากร:</b> {formatTaxID(invoiceData?.CardID)}</Typography>
            </Grid>

            {/* ส่วนวันที่และเลขที่เอกสาร */}
            <Grid item xs={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "30px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", marginTop: -1.5, marginLeft: -2 }} gutterBottom>วันที่</Typography>
                </Grid>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "40px" }}>
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
                          return formatThaiSlash(dayjs(new Date()));
                        }

                        // ✅ ถ้า valid — แปลงตามปกติ
                        return formatThaiSlash(parsed.format("DD/MM/YYYY"));
                      } catch (err) {
                        // ✅ fallback กรณีเกิด error
                        return formatThaiSlash(dayjs(new Date()));
                      }
                    })()}
                  </Typography>

                </Grid>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "30px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", marginTop: -1.5, marginLeft: -2 }} gutterBottom>เลขที่เอกสาร</Typography>
                </Grid>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", borderBottom: "2px solid black", height: "40px" }}>
                  <Typography variant="subtitle2" sx={{ marginTop: -1, marginLeft: -2 }} gutterBottom>{invoiceData?.Code}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" }, border: "2px solid black", marginTop: 3 }}>
              <TableHead>
                <TableRow sx={{ borderBottom: "2px solid black", height: "35px" }}>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: "80px" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>วันที่</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: "60px" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>ชนิดน้ำมัน</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: "80px" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>จำนวนลิตร</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: "60px" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>ค่าบรรทุก</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: "100px" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>ยอดเงิน</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  invoiceData?.Report.map((row, index) => {
                    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
                    const rowSpan = rowSpanMap[key] && !mergedCells[key] ? rowSpanMap[key] : 0;
                    if (rowSpan) {
                      mergedCells[key] = true;
                      displayIndex++;
                    }

                    return (
                      <TableRow sx={{ height: "30px" }}>
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan}
                            sx={{ textAlign: "center", height: '30px', width: "80px", verticalAlign: "middle" }}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Date}</Typography>
                          </TableCell>
                        )}
                        {rowSpan > 0 && (
                          <TableCell
                            rowSpan={rowSpan}
                            sx={{ textAlign: "center", height: '30px', verticalAlign: "middle" }}
                          >
                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Driver.split(":")[1]} : {row.Registration.split(":")[1]}</Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.ProductName}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{new Intl.NumberFormat("en-US").format(row.Volume)}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{new Intl.NumberFormat("en-US").format(row.Rate)}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{new Intl.NumberFormat("en-US").format(row.Volume * row.Rate)}</Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })
                }
                <TableRow sx={{ borderBottom: "2px solid black", borderTop: "2px solid black", height: "25px" }}>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} colSpan={3}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>รวม</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>
                      {new Intl.NumberFormat("en-US").format(invoiceData?.Total.totalVolume)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} colSpan={2}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>
                      {new Intl.NumberFormat("en-US").format(invoiceData?.Total.totalAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ height: "25px" }}>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} colSpan={3} rowSpan={2}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>{invoiceData?.DateEnd}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", borderBottom: "2px solid black" }} >
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>
                      หัก ณ ที่จ่าย
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", borderBottom: "2px solid black" }} colSpan={2}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>
                      {new Intl.NumberFormat("en-US").format(invoiceData?.Total.totalTax)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ height: "25px" }}>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>
                      ยอดชำระ
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} colSpan={2}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>
                      {new Intl.NumberFormat("en-US").format(invoiceData?.Total.totalPayment)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ borderBottom: "2px solid black", borderTop: "2px solid black", height: "25px" }}>
                  <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} colSpan={6}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>
                      {numberToThaiText(invoiceData?.Total.totalPayment)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>โอนเงินเข้าบัญชี
                    {
                      invoiceData?.Company === "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" ? "บริษัท นาครา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)"
                        : "ห้างหุ้นส่วน พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)"
                    }
                  </Typography>
                  {
                    invoiceData?.Company === "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" ? "1. KBANK สาขา เฟสติเวล 663-1-00798-6"
                      : "1. KBANK สาขา เฟสติเวล 663-1-00629-7"
                  }
                </Grid>
                <Grid item xs={4} sx={{ textAlign: "center", marginTop: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>_________________________</Typography>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ผู้วางบิล</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button variant="contained" onClick={handleDownloadImage}>
          บันทึกรูปภาพ
        </Button>
      </div>
    </React.Fragment>
  );
};

export default PrintReport;
