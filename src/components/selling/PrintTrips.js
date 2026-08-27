import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box } from "@mui/material";
import html2canvas from 'html2canvas';
import dayjs from "dayjs";
import "dayjs/locale/th";


const PrintTrips = () => {
  const [trips, setTrips] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage
    const storedData = sessionStorage.getItem("Trips");

    if (storedData) {
      try {
        setTrips(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing trips:", error);
      }
    }
  }, []);

  //   const formatThaiDate = (dateString) => {
  //     if (!dateString) return "-";
  //     const date = new Date(dateString);
  //     const day = date.getDate();
  //     const monthNames = [
  //         "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  //         "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  //     ];
  //     const month = monthNames[date.getMonth()];
  //     const year = date.getFullYear() + 543; // แปลงจาก ค.ศ. เป็น พ.ศ.

  //     return `วันที่ ${day} เดือน${month} พ.ศ.${year}`;
  // };

  const formatThaiDate = (dateString) => {
    if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

    const formattedDate = new Intl.DateTimeFormat("th-TH", {
      month: "long",
    }).format(date); // ดึงชื่อเดือนภาษาไทย

    const buddhistYear = year + 543; // แปลงปี ค.ศ. เป็น พ.ศ.

    return `วันที่ ${day} เดือน ${formattedDate} พ.ศ. ${buddhistYear}`;
  };

  console.log("Ticket : ", trips?.Tickets);
  console.log("Order : ", trips?.Orders);
  console.log("TotalVolumeTicket : ", trips?.TotalVolumeTicket);
  console.log("TotalVolumeTicket : ", trips?.TotalVolumeOrder);
  // console.log("WeightHigh : ", trips?.TotalVolumeTicket);
  // console.log("WeightLow : ", trips?.WeightLow);
  // console.log("TotalWeight : ", trips?.TotalWeight);
  console.log("CostTrip : ", trips?.CostTrip);

  const handleDownloadImage = () => {
    const content = document.querySelector("#invoiceContent"); // เลือก div ที่คุณต้องการแปลงเป็นรูปภาพ

    // ใช้ html2canvas เพื่อแปลงเนื้อหา HTML เป็นรูปภาพ
    html2canvas(content).then((canvas) => {
      // แปลง canvas ให้เป็น URL รูปภาพ
      const imageUrl = canvas.toDataURL("image/png");

      // สร้างลิงก์ดาวน์โหลด
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'invoice.png'; // ตั้งชื่อไฟล์
      link.click(); // คลิกเพื่อดาวน์โหลด
    });
  };

  return (
    <Box
          id="invoiceContent"
          sx={{
            width: "21cm",  // ใช้หน่วย cm
            height: "14.8cm",
            backgroundColor: "#f9f9f9", // สีพื้นหลังอ่อนๆ
            p: 2
          }}
        >
      {/* <Grid container spacing={2}>
        <Grid item xs={8}>
          {
            trips &&
            (
              <React.Fragment>
                <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: -1 }} gutterBottom>บริษัท แพนด้า สตาร์ ออยล์ จำกัด (สำนักงานใหญ่)</Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: -1 }} gutterBottom>261 หมู่ 2 ต.สันพระเนตร อ.สันทราย จ.เชียงใหม่ 50210</Typography>
                <Typography variant="subtitle1" gutterBottom>เลขประจำตัวผู้เสียภาษีอากร : 050 5562 00472 6</Typography>
              </React.Fragment>
            )
          }
        </Grid>
        <Grid item xs={4} textAlign="right">
          <Typography variant="subtitle1" fontWeight="bold" sx={{ marginRight: 2 }}>
            รายการจัดเที่ยววิ่ง
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 2 }}>
            พิมพ์วันที่ {dayjs(new Date).format("DD/MM/YYYY")}
          </Typography>
        </Grid>
      </Grid> */}
      <Grid container spacing={2}>
        <Grid item xs={12} marginBottom={-2}>
          <Typography variant="subtitle1" fontWeight="bold">จัดการตั๋ว : วันที่รับ : {formatThaiDate(trips?.DateReceive)} พนักงานขับรถ : {trips?.Driver}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Table size="small" sx={{ "& .MuiTableCell-root": { padding: "2px" }, border: "1px solid black" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                <TableCell width={50} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>ลำดับ</TableCell>
                <TableCell width={350} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>ตั๋ว</TableCell>
                <TableCell width={150} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>เลขที่ออเดอร์</TableCell>
                <TableCell width={100} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>ค่าบรรทุก</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>G95</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>B95</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>B7(D)</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>G91</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>E20</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>PWD</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                trips?.Tickets.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.id + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>
                      {
                        // (() => {
                        //   const branches = [
                        //     "( สาขาที่  00001)/",
                        //     "( สาขาที่  00002)/",
                        //     "( สาขาที่  00003)/",
                        //     "(สำนักงานใหญ่)/"
                        //   ];

                        //   for (const branch of branches) {
                        //     if (row.TicketName.includes(branch)) {
                        //       return row.TicketName.split(branch)[1];
                        //     }
                        //   }

                        //   return row.TicketName;
                        // })()
                        row.TicketName.split(":")[1]
                      }
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.OrderID}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>
                      {
                        trips?.Depot.split(":")[0] === "ลำปาง" ? row.Rate1
                          : trips?.Depot.split(":")[0] === "พิจิตร" ? row.Rate2
                            : trips?.Depot.split(":")[0] === "สระบุรี" || trips?.Depot.split(":")[0] === "บางปะอิน" || trips?.Depot.split(":")[0] === "IR" ? row.Rate3
                              : row.Rate
                      }
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.G95 ? row.Product.G95.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.B95 ? row.Product.B95.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.B7 ? row.Product.B7.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.G91 ? row.Product.G91.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.E20 ? row.Product.E20.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.PWD ? row.Product.PWD.Volume : "-"}</TableCell>
                  </TableRow>
                ))
              }
              <TableRow>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", backgroundColor: "#e0e0e0", fontWeight: "bold" }} colSpan={4}>ปริมาตรรวม</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.G95}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.B95}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.B7}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.G91}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.E20}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.PWD}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table size="small" sx={{ "& .MuiTableCell-root": { padding: "2px" }, border: "1px solid black" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                <TableCell sx={{ textAlign: "center", height: "20px", borderLeft: "1px solid black", fontWeight: "bold", width: 80 }}>น้ำมันหนัก : </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", fontWeight: "bold" }}>{new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(trips?.WeightHigh)}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", borderLeft: "1px solid black", fontWeight: "bold", width: 80 }}>น้ำมันเบา : </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", fontWeight: "bold" }}>{new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(trips?.WeightLow)}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", borderLeft: "1px solid black", fontWeight: "bold", width: 80 }}>น้ำหนักรถ : </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", fontWeight: "bold" }}>{new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(trips?.WeightTruck)}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", borderLeft: "1px solid black", fontWeight: "bold", width: 80 }}>น้ำหนักรวม : </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", fontWeight: "bold" }}>{new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(trips?.TotalWeight)}</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </Grid>
        <Grid item xs={12} marginBottom={-2}>
          <Typography variant="subtitle1" fontWeight="bold">จัดการเที่ยววิ่ง : วันที่ส่ง : {formatThaiDate(trips?.DateDelivery)} พนักงานขับรถ : {trips?.Driver}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Table size="small" sx={{ "& .MuiTableCell-root": { padding: "2px" }, border: "1px solid black" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                <TableCell width={50} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>ลำดับ</TableCell>
                <TableCell width={350} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>ตั๋ว</TableCell>
                <TableCell width={100} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>ค่าบรรทุก</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>G95</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>B95</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>B7(D)</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>G91</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>E20</TableCell>
                <TableCell width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "1px solid black", fontWeight: "bold" }}>PWD</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                trips?.Orders.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.id + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>
                      {
                        // (() => {
                        //   const branches = [
                        //     "( สาขาที่  00001)/",
                        //     "( สาขาที่  00002)/",
                        //     "( สาขาที่  00003)/",
                        //     "(สำนักงานใหญ่)/"
                        //   ];

                        //   for (const branch of branches) {
                        //     if (row.TicketName.includes(branch)) {
                        //       return row.TicketName.split(branch)[1];
                        //     }
                        //   }

                        //   return row.TicketName;
                        // })()
                        row.TicketName.split(":")[1]
                      }
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>
                    {
                        trips?.Depot.split(":")[0] === "ลำปาง" ? row.Rate1
                          : trips?.Depot.split(":")[0] === "พิจิตร" ? row.Rate2
                            : trips?.Depot.split(":")[0] === "สระบุรี" || trips?.Depot.split(":")[0] === "บางปะอิน" || trips?.Depot.split(":")[0] === "IR" ? row.Rate3
                              : row.Rate
                      }
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.G95 ? row.Product.G95.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.B95 ? row.Product.B95.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.B7 ? row.Product.B7.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.G91 ? row.Product.G91.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.E20 ? row.Product.E20.Volume : "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black" }}>{row.Product.PWD ? row.Product.PWD.Volume : "-"}</TableCell>
                  </TableRow>
                ))
              }
              <TableRow>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", backgroundColor: "#e0e0e0", fontWeight: "bold" }} colSpan={3}>ปริมาตรรวม</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeOrder.G95}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeOrder.B95}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeOrder.B7}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeOrder.G91}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeOrder.E20}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeOrder.PWD}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", backgroundColor: "#e0e0e0", fontWeight: "bold" }} colSpan={3}>คงเหลือ</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.G95 - trips?.TotalVolumeOrder.G95}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.B95 - trips?.TotalVolumeOrder.B95}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.B7 - trips?.TotalVolumeOrder.B7}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.G91 - trips?.TotalVolumeOrder.G91}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.E20 - trips?.TotalVolumeOrder.E20}</TableCell>
                <TableCell sx={{ textAlign: "center", borderLeft: "1px solid black", fontWeight: "bold" }}>{trips?.TotalVolumeTicket.PWD - trips?.TotalVolumeOrder.PWD}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table size="small" sx={{ "& .MuiTableCell-root": { padding: "2px" }, border: "1px solid black" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                <TableCell sx={{ textAlign: "center", height: "20px", borderLeft: "1px solid black", fontWeight: "bold", width: 80 }}>คลังรับน้ำมัน :</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", fontWeight: "bold", width: 200 }}>{trips?.Depot.split(":")[0]}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", borderLeft: "1px solid black", fontWeight: "bold", width: 80 }}>ค่าเที่ยว :</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", fontWeight: "bold", width: 100 }}>{trips?.CostTrip}</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", borderLeft: "1px solid black", fontWeight: "bold", width: 80 }}>สถานะ :</TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", fontWeight: "bold" }}>{trips?.Status}</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrintTrips;
