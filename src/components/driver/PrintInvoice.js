import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box, Divider } from "@mui/material";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { formatThaiSlash } from "../../theme/DateTH";

const PdaPrinter = () => {
  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("invoiceData") || "{}");

    const timer = setTimeout(() => {
      const element = document.querySelector("#invoiceContent");

      const opt = {
        margin: 0,
        filename: `O-${data?.order?.Code}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "mm",
          format: [80, 200], // ✅ กว้าง 80mm / สูง auto (ประมาณไว้ก่อน)
          orientation: "portrait",
        },
      };

      html2pdf().set(opt).from(element).save();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const data = JSON.parse(sessionStorage.getItem("invoiceData") || "{}");

  const formatAddress = (addr) => {
    if (!addr || addr === "-") return "-";
    return `${addr.no || ""} หมู่ ${addr.village || ""} ${addr.subDistrict || ""} ${addr.district || ""} ${addr.province || ""}`;
  };

  const getCustomerName = (ticketName) => {
    if (!ticketName) return "-";
    return ticketName.split(":")[1]?.trim() || "-";
  };

  const mapProducts = (product) => {
    if (!product) return [];

    return Object.entries(product)
      .filter(([_, val]) => val?.Volume > 0)
      .map(([key, val]) => ({
        name: key,
        qty: val.Volume * 1000, // 🔥 แปลงเป็นลิตร
      }));
  };

  const products = mapProducts(data?.order?.Product);

  console.log("🚀 ~ file: PrintInvoice.js:92 ~ PdaPrinter ~ products:", products);
  console.log("🚀 ~ file: PrintInvoice.js:92 ~ PdaPrinter ~ data:", data);

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Box
        id="invoiceContent"
        sx={{
          width: "72mm",
          backgroundColor: "#fff",
          padding: "6mm 4mm",
          fontSize: "11px",
          lineHeight: 1.4,
          border: "1px solid #000",
        }}
      >
        {/* 🔹 บริษัท */}
        <Box textAlign="center" mb={1}>
          <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
            {data?.order?.CompanyName || "-"}
          </Typography>
          <Typography sx={{ fontSize: "10px" }}>
            {formatAddress(data?.order?.Address)}
          </Typography>
          <Typography sx={{ fontSize: "10px" }}>
            เลขผู้เสียภาษี: {data?.order?.CodeID || "-"}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 🔹 ลูกค้า */}
        <Box mb={1}>
          <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
            ลูกค้า
          </Typography>
          <Typography sx={{ fontSize: "11px" }}>
            {getCustomerName(data?.order?.TicketName)}
          </Typography>
          <Typography sx={{ fontSize: "10px" }}>
            ทะเบียน: {data?.order?.Registration?.split(":")[1] || "-"}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 🔹 สินค้า */}
        <Box mb={1}>
          <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
            รายการสินค้า
          </Typography>

          <Grid container>
            <Grid item xs={7}>
              <Typography sx={{ fontSize: "10px", fontWeight: "bold" }}>
                รายการ
              </Typography>
            </Grid>
            <Grid item xs={5} textAlign="right">
              <Typography sx={{ fontSize: "10px", fontWeight: "bold" }}>
                ลิตร
              </Typography>
            </Grid>
          </Grid>

          {products.map((item, index) => (
            <Grid container key={index}>
              <Grid item xs={7}>
                <Typography sx={{ fontSize: "10px" }}>
                  {item.name}
                </Typography>
              </Grid>
              <Grid item xs={5} textAlign="right">
                <Typography sx={{ fontSize: "10px" }}>
                  {item.qty.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          ))}
          <Grid container>
              <Grid item xs={7}>
                <Typography sx={{ fontSize: "10px" }}>
                  รวม
                </Typography>
              </Grid>
              <Grid item xs={5} textAlign="right">
                <Typography sx={{ fontSize: "10px" }}>
                  {products.reduce((sum, item) => sum + item.qty, 0).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 🔹 ข้อมูลเพิ่ม */}
        <Box sx={{ fontSize: "10px" }}>
          <Typography>วันที่: {data?.order?.Date}</Typography>
          <Typography>คนขับ: {data?.order?.Driver?.split(":")[1]}</Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 🔹 ลายเซ็น */}
        <Box mt={2}>
          <Box sx={{ height: "35mm" }} />
          <Box
            sx={{
              borderTop: "1px solid #000",
              textAlign: "center",
              fontSize: "11px",
              pt: 0.5,
            }}
          >
            ลายเซ็นผู้รับสินค้า
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PdaPrinter;