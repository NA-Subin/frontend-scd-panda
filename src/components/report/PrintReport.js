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
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2, // เพิ่มความคมชัด
          useCORS: true, // รองรับภาพจาก URL ต่างโดเมน (ถ้ามี)
        },
        jsPDF: {
          unit: "cm", // ใช้หน่วยเดียวกับ CSS
          format: "a4",
          orientation: "portrait",
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

  const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));
  if (!invoiceData) return <div>กำลังโหลด...</div>;

  // const formatAddress = (address) => {
  //   // แยกข้อมูลจาก address โดยใช้ , หรือ เว้นวรรคเป็นตัวแบ่ง
  //   const parts = address.split(/,|\s+/).filter(Boolean);

  //   if (parts.length < 5) return "รูปแบบที่อยู่ไม่ถูกต้อง";

  //   const [houseNo, moo, subdistrict, district, province, postalCode] = parts;

  //   return `${houseNo} หมู่ ${moo} ต.${subdistrict} อ.${district} จ.${province} ${postalCode}`;
  // };
  const formatAddress = (address) => {
    // ---------- กรณี object ----------
    if (typeof address === "object" && address !== null) {
      const { no, village, subDistrict, district, province, zipCode } = address;

      if (!no || !subDistrict || !district || !province) return "-";

      return village && zipCode
        ? `${no} หมู่ ${village} ต.${subDistrict} อ.${district} จ.${province} ${zipCode}`
        : `${no} ต.${subDistrict} อ.${district} จ.${province}`;
    }

    // ---------- กรณี string ----------
    if (typeof address === "string") {
      const parts = address.trim().split(/\s+/);

      if (parts.length < 4) return "-";

      // 🔹 ตรวจ zipCode
      const last = parts[parts.length - 1];
      const hasZip = /^\d{5}$/.test(last);

      if (hasZip) {
        const zipCode = parts.pop();
        const province = parts.pop();
        const district = parts.pop();
        const subDistrict = parts.pop();
        const village = parts.pop();
        const no = parts.join(" ");

        // ถ้า village เป็นตัวเลข → หมู่
        if (/^\d+$/.test(village)) {
          return `${no} หมู่ ${village} ต.${subDistrict} อ.${district} จ.${province} ${zipCode}`;
        }

        // ไม่ใช่หมู่
        return `${no} ${village} ต.${subDistrict} อ.${district} จ.${province} ${zipCode}`;
      }

      // 🔹 ไม่มี zip (เช่น มีถนน)
      const province = parts.pop();
      const district = parts.pop();
      const subDistrict = parts.pop();
      const no = parts.join(" ");

      return `${no} ต.${subDistrict} อ.${district} จ.${province}`;
    }

    return "-";
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

  const formatPhoneNumber = (phone) => {
    if (!phone || phone === "-") {
      return "-";
    }
    return String(phone).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
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

  const handleDownloadImage = () => {
    const content = document.querySelector("#invoiceContent"); // เลือก div ที่คุณต้องการแปลงเป็นรูปภาพ

    // ใช้ html2canvas เพื่อแปลงเนื้อหา HTML เป็นรูปภาพ
    html2canvas(content).then((canvas) => {
      // แปลง canvas ให้เป็น URL รูปภาพ
      const imageUrl = canvas.toDataURL("image/png");

      // สร้างลิงก์ดาวน์โหลด
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "report.png"; // ตั้งชื่อไฟล์
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

  const groupByDate = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const date = item.Date;
      const rate = item.Rate;
      if (!grouped[date]) {
        grouped[date] = {
          date,
          rate,
          products: {
            G95: 0,
            B95: 0,
            B7: 0,
            G91: 0,
            E20: 0,
            E85: 0,
            PWD: 0,
            B20: 0,
          },
          totalVolume: 0,
          totalAmount: 0, // สมมติยอดเงินรวม
          transportFee: 0, // สมมติค่าบรรทุกรวม
        };
      }

      // map product เข้าไปในช่องที่ถูกต้อง
      grouped[date].products[item.ProductName] =
        (grouped[date].products[item.ProductName] || 0) + item.Volume;

      // รวมปริมาณ/เงิน
      grouped[date].totalVolume += item.Volume;
      grouped[date].totalAmount += item.Amount ?? 0;
      grouped[date].transportFee += (item.Rate ?? 0) * item.Volume;
    });

    return Object.values(grouped);
  };

  const rows = groupByDate(invoiceData?.Report);

  const totals = rows.reduce(
    (acc, row) => {
      // รวม product
      Object.keys(row.products).forEach((key) => {
        acc.products[key] += row.products[key];
      });

      // รวมยอดรวม
      acc.totalVolume += row.totalVolume;
      acc.transportFee += row.transportFee;
      acc.totalAmount += row.totalAmount;

      return acc;
    },
    {
      products: {
        G95: 0,
        B95: 0,
        B7: 0,
        G91: 0,
        E20: 0,
        E85: 0,
        PWD: 0,
        B20: 0,
      },
      totalVolume: 0,
      transportFee: 0,
      totalAmount: 0,
    },
  );

  // const calculateDueDate = (dateString, creditDays) => {
  //   if (!dateString || !creditDays) return "ไม่พบข้อมูลวันที่";

  //   const [day, month, year] = dateString.split("/").map(Number);
  //   const date = new Date(year, month - 1, day);

  //   date.setDate(date.getDate() + Number(creditDays));

  //   const thaiMonths = [
  //     "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  //     "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  //   ];

  //   const dueDay = date.getDate();
  //   const dueMonth = thaiMonths[date.getMonth()];
  //   const dueYear = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

  //   return `วันที่ ${dueDay} เดือน${dueMonth} พ.ศ.${dueYear}`;
  // };

  const calculateDueDate = (dateString, creditDays) => {
    if (!dateString || creditDays == null) return "-";

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() + Number(creditDays));

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

    return `${dd}/${mm}/${yyyy}`;
  };

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

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const paginateRows = (rows) => {
    const pages = [];
    let i = 0;

    while (i < rows.length) {
      // 👉 ถ้าเหลือไม่เกิน 16 แถว แสดงเป็น "หน้าสุดท้าย"
      if (rows.length - i <= 13) {
        pages.push(rows.slice(i, i + 13));
        i += 13;
      } else {
        // 👉 หน้าอื่น ๆ ให้ 20 แถว
        pages.push(rows.slice(i, i + 15));
        i += 15;
      }
    }

    return pages;
  };

  const pages = paginateRows(rows);

  console.log("invoiceData : ", invoiceData);
  console.log("Tickets Order : ", invoiceData?.Report);
  console.log("Total Order : ", invoiceData?.Total);

  return (
    <Box display="flex" justifyContent="center" mt={5} overflow="auto">
      <Box
        sx={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <Box id="invoiceContent">
          {pages.map((pageRows, pageIndex) => (
            <Box
              key={pageIndex}
              sx={{
                width: "21cm",
                minHeight: "29.6cm", // ใช้ minHeight เผื่อเนื้อหาเกิน
                backgroundColor: "#fff",
                paddingTop: "1cm",
                paddingBottom: "1cm",
                paddingLeft: "0.9cm",
                paddingRight: "0.5cm",
                boxSizing: "border-box",
                border: "1px solid lightgray",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  {invoiceData && (
                    <React.Fragment>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {invoiceData?.Company &&
                        invoiceData?.Company.includes("นาครา ปิโตรเลียม")
                          ? "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)"
                          : invoiceData?.Company}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ marginTop: -1 }}
                        gutterBottom
                      >
                        {formatAddressStandard(invoiceData?.Address)}
                        {/* เบอร์โทร : {formatPhoneNumber(invoiceData?.Phone)} */}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        เลขประจำตัวผู้เสียภาษีอากร :{" "}
                        {invoiceData?.Company &&
                        invoiceData?.Company.includes("นาครา ปิโตรเลียม")
                          ? "051 5559 00102 9"
                          : formatTaxID(invoiceData?.CardID)}
                      </Typography>
                    </React.Fragment>
                  )}
                </Grid>
                <Grid item xs={3} textAlign="right">
                  <Typography
                    variant="h6"
                    sx={{ marginRight: 2, fontSize: "18px" }}
                  >
                    ใบวางบิล/ใบแจ้งหนี้
                  </Typography>
                </Grid>
              </Grid>
              {invoiceData && (
                <Grid container spacing={2} marginTop={2} sx={{ px: 2 }}>
                  {/* ส่วนข้อมูลบริษัท */}
                  <Grid
                    item
                    xs={10}
                    sx={{ border: "2px solid black", height: "140px" }}
                  >
                    <Box sx={{ padding: 0.5 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="left"
                      >
                        <Typography variant="subtitle2">
                          <b>ชื่อลูกค้า:</b>
                        </Typography>
                        <Typography variant="subtitle2" marginLeft={1}>
                          {/* {
                            invoiceData?.Company === "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" ? "บริษัท นาครา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)"
                              : "ห้างหุ้นส่วน พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)"
                          } */}
                          {/* {invoiceData?.TicketName ? invoiceData?.TicketName.split(":")[1] : "-"} */}
                          {invoiceData?.CompanyName || "-"}
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
                          {formatAddressStandard(invoiceData?.CompanyAddress)}
                        </Typography>
                        {/* <Typography variant="subtitle2" marginLeft={4}>{formatAddress(invoiceData?.Address)}</Typography> */}
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
                          {formatTaxID(invoiceData?.CodeIDCustomer)}
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
                          height: "30px",
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
                          height: "40px",
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
                                return formatThai(dayjs(new Date()));
                              }

                              // ✅ ถ้า valid — แปลงตามปกติ
                              return formatThai(parsed.format("DD/MM/YYYY"));
                            } catch (err) {
                              // ✅ fallback กรณีเกิด error
                              return formatThai(dayjs(new Date()));
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
                          height: "30px",
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
                          height: "40px",
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

                  <Table
                    size="small"
                    sx={{
                      tableLayout: "fixed",
                      "& .MuiTableCell-root": { padding: "5px" },
                      border: "2px solid black",
                      marginTop: 3,
                    }}
                  >
                    <TableHead>
                      <TableRow sx={{ height: "35px" }}>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "70px",
                          }}
                          rowSpan={2}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            วันที่
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                          }}
                          colSpan={8}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            รายการ
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "50px",
                          }}
                          rowSpan={2}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            รวมลิตร
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "55px",
                          }}
                          rowSpan={2}
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
                          >
                            ค่าบรรทุก
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "80px",
                          }}
                          rowSpan={2}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            ยอดเงิน
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ height: "35px" }}>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            G95
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            B95
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            B7
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            G91
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            E20
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            E85
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            PWD
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            borderLeft: "2px solid black",
                            borderBottom: "2px solid black",
                            width: "75px",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              lineHeight: 1,
                              margin: 0,
                              fontWeight: "bold",
                            }}
                            gutterBottom
                          >
                            B20
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageRows.map((row, index) => (
                        <TableRow key={index} sx={{ height: "35px" }}>
                          <TableCell
                            sx={{ textAlign: "center", width: "80px" }}
                          >
                            {/* {formatThaiSlash(dayjs(row.date).format("DD/MM/YYYY"))} */}
                            {formatThai(row.date)}
                          </TableCell>

                          {/* แสดงตาม product name */}
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.G95 || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.B95 || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.B7 || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.G91 || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.E20 || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.E85 || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.PWD || 0,
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ lineHeight: 1, margin: 0 }}
                              gutterBottom
                            >
                              {new Intl.NumberFormat("en-US").format(
                                row.products.B20 || 0,
                              )}
                            </Typography>
                          </TableCell>

                          {/* รวมลิตร */}
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            {new Intl.NumberFormat("en-US").format(
                              row.totalVolume,
                            )}
                          </TableCell>

                          {/* ค่าบรรทุก */}
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            {row.rate}
                          </TableCell>

                          {/* ยอดเงิน */}
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderLeft: "2px solid black",
                            }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(row.transportFee)}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* ✅ แถวสรุปผลรวม */}
                      {pageIndex === pages.length - 1 && (
                        <React.Fragment>
                          <TableRow sx={{ height: "35px" }}>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              รวม
                            </TableCell>

                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.G95,
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.B95,
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.B7,
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.G91,
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.E20,
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.E85,
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.PWD,
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                borderTop: "2px solid black",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.products.B20,
                              )}
                            </TableCell>

                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                borderTop: "2px solid black",
                                fontWeight: "bold",
                              }}
                            >
                              {new Intl.NumberFormat("en-US").format(
                                totals.totalVolume,
                              )}
                            </TableCell>

                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                borderTop: "2px solid black",
                                fontWeight: "bold",
                              }}
                            >
                              เป็นเงิน
                            </TableCell>

                            <TableCell
                              sx={{
                                textAlign: "right",
                                borderTop: "2px solid black",
                                borderLeft: "2px solid black",
                                fontWeight: "bold",
                                paddingLeft: "10px !important",
                                paddingRight: "10px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                              }}
                            >
                              {new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(totals.transportFee)}
                            </TableCell>
                          </TableRow>

                          <TableRow sx={{ height: "25px" }}>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                borderTop: "2px solid black",
                              }}
                              colSpan={9}
                              rowSpan={2}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "left",
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    lineHeight: 1,
                                    margin: 0,
                                    fontWeight: "bold",
                                    marginRight: 1,
                                  }}
                                  gutterBottom
                                >
                                  กำหนดชำระเงิน :{" "}
                                </Typography>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    lineHeight: 1,
                                    margin: 0,
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                  }}
                                  gutterBottom
                                >
                                  {calculateDueDate(invoiceData?.Date, 3)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                borderBottom: "2px solid black",
                                borderTop: "2px solid black",
                              }}
                              colSpan={2}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  lineHeight: 1,
                                  margin: 0,
                                  fontWeight: "bold",
                                }}
                                gutterBottom
                              >
                                หัก ณ ที่จ่าย
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "right",
                                borderLeft: "2px solid black",
                                borderBottom: "2px solid black",
                                borderTop: "2px solid black",
                                paddingLeft: "10px !important",
                                paddingRight: "10px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  lineHeight: 1,
                                  margin: 0,
                                  fontWeight: "bold",
                                }}
                                gutterBottom
                              >
                                {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(invoiceData?.Total.totalTax)}
                              </Typography>
                            </TableCell>
                          </TableRow>

                          <TableRow sx={{ height: "25px" }}>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                              }}
                              colSpan={2}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  lineHeight: 1,
                                  margin: 0,
                                  fontWeight: "bold",
                                }}
                                gutterBottom
                              >
                                ยอดชำระ
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "right",
                                borderLeft: "2px solid black",
                                paddingLeft: "10px !important",
                                paddingRight: "10px !important",
                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  lineHeight: 1,
                                  margin: 0,
                                  fontWeight: "bold",
                                }}
                                gutterBottom
                              >
                                {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(invoiceData?.Total.totalPayment)}
                              </Typography>
                            </TableCell>
                          </TableRow>

                          <TableRow sx={{ height: "25px" }}>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                borderLeft: "2px solid black",
                                borderTop: "2px solid black",
                                borderBottom: "2px solid black",
                              }}
                              colSpan={12}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  lineHeight: 1,
                                  margin: 0,
                                  fontWeight: "bold",
                                }}
                                gutterBottom
                              >
                                {`( ${numberToThaiText(invoiceData?.Total.totalPayment)} )`}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      )}

                      {/* 
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
                */}
                    </TableBody>
                  </Table>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          โอนเงินเข้าบัญชี
                          {/* {
                            invoiceData?.Company === "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" ? "บริษัท นาครา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)"
                              : "ห้างหุ้นส่วน พิชยา ทรานสปอร์ต จำกัด (สำนักงานใหญ่)"
                          } */}
                          {invoiceData?.Company &&
                          invoiceData?.Company.includes("นาครา ปิโตรเลียม")
                            ? "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)"
                            : invoiceData?.Company}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          {/* {
                            invoiceData?.Company === "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" ? "1. KBANK สาขา เฟสติเวล 663-1-00798-6"
                              : "1. KBANK สาขา เฟสติเวล 663-1-00629-7"
                          } */}
                          {invoiceData?.Company &&
                          invoiceData?.Company.includes("นาครา ปิโตรเลียม")
                            ? "1. KBANK สาขา เฟสติเวล 663-1-00798-6"
                            : "1. KBANK สาขา เฟสติเวล 663-1-00629-7"}
                        </Typography>
                        {/* <Typography variant="subtitle2" gutterBottom>2. KBANK สาขาป่าแดด 064-8-29539-1</Typography> */}
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        sx={{ textAlign: "center", marginTop: 4 }}
                      >
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
          ))}
        </Box>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {/* <Button variant="contained" onClick={handleDownloadImage}>
            บันทึกรูปภาพ
          </Button> */}
        </div>
      </Box>
    </Box>
  );
};

export default PrintReport;
