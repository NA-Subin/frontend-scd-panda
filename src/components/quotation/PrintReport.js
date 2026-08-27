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
  Divider,
} from "@mui/material";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatThaiSlash } from "../../theme/DateTH";
import bangchak from "../../theme/img/Bangchak_logo.png";
import caltex from "../../theme/img/Caltex_logo.png";

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

  const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));
  if (!invoiceData) return <div>กำลังโหลด...</div>;

  let deliveryDate = "-";

  if (invoiceData?.DateB) {
    const credit = invoiceData?.Customer?.CreditTime || 0; // ถ้าเป็น undefined หรือ 0 → ไม่บวก
    deliveryDate = dayjs(invoiceData.DateB)
      .add(credit, "day")
      .format("DD/MM/YYYY");
  }

  const formatThai = (date) => {
    if (!date) return "";

    let d;
    if (typeof date === "string") {
      // ลอง parse เป็น DD/MM/YYYY ก่อน
      const parts = date.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        d = new Date(`${year}-${month}-${day}`);
      } else {
        d = new Date(date); // fallback
      }
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear() + 543; // ✅ เพิ่ม 543

    return `${day}/${month}/${year}`;
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

  const formatTaxID = (taxID) => {
    if (!taxID || taxID === "-") {
      return "-";
    }
    return String(taxID).replace(/(\d{3})(\d{4})(\d{5})(\d{1})/, "$1 $2 $3 $4");
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

  const companyName = invoiceData?.Company?.Name?.trim() || "";

  const isBangchak = companyName.includes("นาครา ปิโตรเลียม 2016");
  let no = 0;

  // ยอดรวมก่อน VAT
  const totalWithVat =
    invoiceData?.Products?.reduce((sum, p) => {
      const data = invoiceData?.Product[p.code];
      return sum + (data ? data.RateOil * data.Volume : 0);
    }, 0) || 0;

  const beforeVat = totalWithVat / 1.07; // ยอดก่อน VAT
  const vat = totalWithVat - beforeVat; // ยอด VAT 7%

  const handleDownloadImage = async () => {
    const content = document.querySelector("#invoiceContent");
    if (!content) return;

    // 1. เก็บค่าเดิมไว้ก่อน
    const originalTransform = content.style.transform;

    // 2. คำนวณ scale ให้พอดีจอ (กันหลุด)
    const scale = Math.min(window.innerWidth / 794, 1);

    // 3. apply scale ชั่วคราว
    content.style.transform = `scale(${scale})`;
    content.style.transformOrigin = "top left";

    // wait ให้ DOM render ก่อน capture
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(content, {
        scale: 2, // เพิ่มความคมของรูป
        useCORS: true,
        backgroundColor: "#fff",
      });

      const imageUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `ใบเสนอราคา${dayjs().format("DD-MM-YY-HH-mm-ss")}.png`;
      link.click();
    } finally {
      // 4. restore กลับเหมือนเดิม
      content.style.transform = originalTransform;
    }
  };

  console.log("invoiceData : ", invoiceData);

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
            width: "21cm", // ✅ กว้างตามแนวนอน A5
            height: "100%", // ✅ สูงตาม A5 แนวนอน
            backgroundColor: "#fff",
            padding: "0.7cm", // เว้น margin ภายในเนื้อหา
            paddingRight: 1,
            boxSizing: "border-box",
            border: "1px solid lightgray",
          }}
        >
          <Grid container sx={{ pr: 1.5 }} marginTop={-1.5}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
              >
                <Box textAlign="center" sx={{ marginLeft: 1 }}>
                  <img
                    src={isBangchak ? bangchak : caltex}
                    alt="Company Logo"
                    style={{
                      width: isBangchak ? "120px" : "150px",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Box textAlign="left" sx={{ marginLeft: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    textAlign="left"
                  >
                    {invoiceData?.Company.Name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    textAlign="left"
                  >
                    {formatAddress(invoiceData?.Company.Address)}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    textAlign="left"
                  >
                    เลขภาษี {formatTaxID(invoiceData?.Company.CardID)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                border: "2px solid rgba(0, 0, 0, 0.7)",
                backgroundColor: "lightgray",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                textAlign="center"
                sx={{ marginTop: 0.5 }}
              >
                ใบเสนอราคา/ใบแจ้งหนี้
              </Typography>
            </Grid>
            <Grid
              item
              xs={8.5}
              sx={{
                borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                pb: 0.5,
                pt: 0.5,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1, mt: -0.5 }}
              >
                <Typography variant="subtitle2">
                  <b>เรียน/Attention : </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={1}>
                  {invoiceData?.Customer.CompanyName}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1 }}
              >
                <Typography variant="subtitle2">
                  <b>เลขที่ :</b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={2}>
                  {formatAddressStandard(invoiceData?.Customer.Address)}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1, mb: -0.5 }}
              >
                <Typography variant="subtitle2">
                  <b>โทร :</b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={2}>
                  {invoiceData?.Customer.Phone}
                </Typography>
              </Box>
            </Grid>

            {/* ส่วนวันที่และเลขที่เอกสาร */}
            <Grid
              item
              xs={3.5}
              sx={{
                borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                pb: 0.5,
                pt: 0.5,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1, borderBottom: "1px solid gray", mt: -0.5 }}
              >
                <Typography variant="subtitle2">
                  <b>เลขที่/No : </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={4}>
                  {invoiceData?.Code}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1, borderBottom: "1px solid gray" }}
              >
                <Typography variant="subtitle2">
                  <b>วันที่ Date : </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={4}>
                  {formatThai(dayjs(invoiceData?.DateB).format("DD/MM/YYYY"))}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1, mb: -0.5 }}
              >
                <Typography variant="subtitle2">
                  <b>ส่งวันที่ : </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={4}>
                  {/* {formatThai(deliveryDate)} */}
                  {formatThai(dayjs(invoiceData?.DateD).format("DD/MM/YYYY"))}
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                marginTop={0.5}
                sx={{ pl: 1 }}
              >
                <Typography variant="subtitle2">
                  <b>เลขประจำตัวผู้เสียภาษีอากร </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={1}>
                  {formatTaxID(invoiceData?.Customer.CodeID)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ mb: -0.5, ml: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                ขอเสนอราคาและเงื่อนไขสำหรับท่านดังนี้
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: -1 }} gutterBottom>
                We are please to submit you the following described here in at
                price. items and terms stated
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  "& .MuiTableCell-root": { padding: "2px" },
                }}
              >
                <TableHead>
                  <TableRow sx={{ height: "35px" }}>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                        width: 50,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }}
                        gutterBottom
                      >
                        ลำดับที่
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0.5, fontWeight: "bold" }}
                        gutterBottom
                      >
                        ITEM
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }}
                        gutterBottom
                      >
                        รายการ
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0.5, fontWeight: "bold" }}
                        gutterBottom
                      >
                        DESCRIPTION
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                        width: 100,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }}
                        gutterBottom
                      >
                        ราคา/ลิตร
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0.5, fontWeight: "bold" }}
                        gutterBottom
                      >
                        Price
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                        width: 100,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          lineHeight: 1,
                          margin: 0,
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                        gutterBottom
                      >{`จำนวน(ลิตร)`}</Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0.5, fontWeight: "bold" }}
                        gutterBottom
                      >
                        Quantity
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                        borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                        width: 100,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }}
                        gutterBottom
                      >
                        จำนวนเงิน
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ lineHeight: 1, margin: 0.5, fontWeight: "bold" }}
                        gutterBottom
                      >
                        Amount
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceData?.Products.map((p, index) => {
                    const data = invoiceData?.Product[p.code]; // ดึงข้อมูลจาก key เช่น B7, G95
                    if (!data) return null; // ถ้าไม่มีข้อมูลของสินค้านั้น ข้ามไป

                    const total = data.RateOil * data.Volume; // ✅ จำนวนเงินทั้งหมด

                    return (
                      <TableRow key={p.code}>
                        {/* ✅ ลำดับ */}
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                          }}
                        >
                          {(no = no + 1)}
                        </TableCell>

                        {/* ✅ ชื่อสินค้า */}
                        <TableCell
                          sx={{
                            textAlign: "left",
                            borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                          }}
                        >
                          <Box sx={{ ml: 2 }}>{p.name}</Box>
                        </TableCell>

                        {/* ✅ ราคา (บาท/ลิตร) */}
                        <TableCell
                          align="right"
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                          }}
                        >
                          {new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(data.RateOil)}
                        </TableCell>

                        {/* ✅ จำนวน (ลิตร) */}
                        <TableCell
                          align="right"
                          sx={{ borderLeft: "2px solid rgba(0, 0, 0, 0.7)" }}
                        >
                          <Box sx={{ mr: 1 }}>
                            {new Intl.NumberFormat("en-US").format(data.Volume)}
                          </Box>
                        </TableCell>

                        {/* ✅ จำนวนเงิน (บาท) */}
                        <TableCell
                          sx={{
                            textAlign: "right",
                            borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                            borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                          }}
                        >
                          <Box sx={{ mr: 1 }}>
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(total)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* ✅ เพิ่มแถวว่าง 3 แถว */}
                  {Array.from({ length: 2 }).map((_, i) => (
                    <TableRow
                      key={`empty-${i}`}
                      sx={{ borderBottom: "1px solid lightgray" }}
                    >
                      <TableCell
                        sx={{
                          border: "none",
                          height: "20px",
                          borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        }}
                      ></TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          height: "20px",
                          borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        }}
                      ></TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          height: "20px",
                          borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        }}
                      ></TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          height: "20px",
                          borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        }}
                      ></TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          height: "20px",
                          borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                          borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                        }}
                      ></TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ borderTop: "2px solid rgba(0, 0, 0, 0.7)" }}>
                    <TableCell
                      sx={{ textAlign: "left", border: "none" }}
                      colSpan={3}
                    >
                      <Grid container sx={{ pl: 0.5, pr: 0.5 }}>
                        <Grid item xs={1.5}>
                          <Typography
                            variant="subtitle2"
                            fontSize="13px"
                            sx={{ fontWeight: "bold" }}
                            gutterBottom
                          >
                            หมายเหตุ :
                          </Typography>
                        </Grid>
                        <Grid item xs={10.5}>
                          <Typography
                            variant="subtitle2"
                            fontSize="13px"
                            gutterBottom
                          >
                            {invoiceData?.items}
                          </Typography>
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      รวมเป็นเงิน
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <Box sx={{ mr: 1 }}>
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(beforeVat)}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      sx={{ textAlign: "left", border: "none" }}
                      colSpan={3}
                    >
                      <Grid container sx={{ pl: 0.5, pr: 0.5 }}>
                        {/* <Grid item xs={1.5}>
                            <Typography variant="subtitle2" fontSize="13px" sx={{ fontWeight: "bold" }} gutterBottom>หมายเหตุ :</Typography>
                          </Grid>
                          <Grid item xs={10.5}>
                            <Typography variant="subtitle2" fontSize="13px" gutterBottom>
                              {invoiceData?.items}
                            </Typography>
                          </Grid> */}
                        <Grid item xs={1.5}>
                          <Typography
                            variant="subtitle2"
                            fontSize="13px"
                            sx={{ fontWeight: "bold" }}
                            gutterBottom
                          >
                            เพิ่มเติม :
                          </Typography>
                        </Grid>
                        <Grid item xs={10.5}>
                          <Typography
                            variant="subtitle2"
                            fontSize="13px"
                            gutterBottom
                          >
                            {invoiceData?.Note}
                          </Typography>
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      Vat 7%
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <Box sx={{ mr: 1 }}>
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(vat)}
                      </Box>
                    </TableCell>
                    {/* <TableCell sx={{ textAlign: "center", fontWeight: "bold", borderLeft: "2px solid rgba(0, 0, 0, 0.7)" }}>
                        รวมเป็นเงิน
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", borderLeft: "2px solid rgba(0, 0, 0, 0.7)", borderRight: "2px solid rgba(0, 0, 0, 0.7)" }}>
                        <Box sx={{ mr: 1 }}>
                          {new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(beforeVat)}
                        </Box>
                      </TableCell> */}
                  </TableRow>

                  {/* <TableRow>
                      <TableCell sx={{ textAlign: "center", fontWeight: "bold", borderTop: "2px solid rgba(0, 0, 0, 0.7)", borderLeft: "2px solid rgba(0, 0, 0, 0.7)" }}>
                        Vat 7%
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", borderTop: "2px solid rgba(0, 0, 0, 0.7)", borderLeft: "2px solid rgba(0, 0, 0, 0.7)", borderRight: "2px solid rgba(0, 0, 0, 0.7)" }}>
                        <Box sx={{ mr: 1 }}>
                          {new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(vat)}
                        </Box>
                      </TableCell>
                    </TableRow> */}

                  <TableRow>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        backgroundColor: "#ffe0b2",
                        fontWeight: "bold",
                      }}
                      colSpan={3}
                    >
                      {`( ${numberToThaiText(totalWithVat)} )`}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        borderLeft: "2px solid rgba(0, 0, 0, 0.7)",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                        borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      รวมทั้งสิ้น
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        border: "2px solid rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <Box sx={{ mr: 1 }}>
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(totalWithVat)}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
            <Grid
              item
              xs={6}
              sx={{
                border: "2px solid rgba(0, 0, 0, 0.7)",
                pb: 0.5,
                pt: 0.5,
                mt: 2,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1 }}
              >
                <Typography variant="subtitle2">
                  <b>
                    <u>ข้อกำหนดและเงื่อนไขการขอใบเสนอราคา </u>
                  </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={1}></Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1 }}
              >
                <Typography variant="subtitle2">
                  <b>ราคาที่เสนอ เงินบาทไทย ราคานี้รวมภาษีมูลค่าเพิ่มแล้ว</b>
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1 }}
              >
                <Typography variant="subtitle2">
                  <b>ชำระเงิน </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={1}>
                  {invoiceData?.Company.Name.split("(")[0]}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="left"
                sx={{ pl: 1 }}
              >
                <Typography variant="subtitle2">
                  <b>ธนาคาร </b>
                </Typography>
                <Typography variant="subtitle2" marginLeft={1}>
                  {isBangchak
                    ? "กสิกรไทย 663-100-9768"
                    : "กสิกรไทย 663-101-3579"}
                </Typography>
              </Box>
              <Typography variant="subtitle2" marginLeft={7.5}>
                {isBangchak ? "" : " กรุงไทย   357-300-2259"}
              </Typography>
            </Grid>

            {/* ส่วนวันที่และเลขที่เอกสาร */}
            <Grid
              item
              xs={6}
              sx={{
                borderRight: "2px solid rgba(0, 0, 0, 0.7)",
                borderTop: "2px solid rgba(0, 0, 0, 0.7)",
                borderBottom: "2px solid rgba(0, 0, 0, 0.7)",
                pb: 0.5,
                pt: 0.5,
                mt: 2,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography variant="subtitle2">
                  ข้าพเจ้ารับรองว่าจะส่งมอบของดังกล่าวข้างต้นได้ภายในกำหนด
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                marginTop={0.5}
              >
                <Typography variant="subtitle2">
                  <b>ผู้เสนอราคา : </b>
                </Typography>
                <Box
                  sx={{
                    pl: 1,
                    borderBottom: "1px solid black", // เส้นใต้
                    pb: 0.5, // เพิ่มระยะห่างระหว่างข้อความกับเส้น
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    marginLeft={3}
                    marginRight={3}
                  >
                    <b>{invoiceData?.Employee.Name}</b>
                  </Typography>
                </Box>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                marginTop={2}
              >
                <Typography variant="subtitle2">
                  <b>ผู้สั่งซื้อ : </b>
                </Typography>
                <Typography variant="subtitle2">
                  ____________________________________
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          {/* <Button variant="contained" onClick={handleDownloadImage}>
            บันทึกรูปภาพ
          </Button> */}
        </div>
      </Box>
    </Box>
  );
};

export default PrintReport;
