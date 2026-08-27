import React, { useState } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { saveAs } from "file-saver";

export default function JsonUploader() {
    const [fileName, setFileName] = useState("");
    const [jsonData1, setJsonData1] = useState(null); // JSON ตัวแรก
    const [jsonData2, setJsonData2] = useState(null); // JSON ตัวสอง

    // สำหรับอัปโหลด JSON ตัวแรก
    const handleUpload1 = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                setJsonData1(data);
            } catch (error) {
                alert("ไฟล์ JSON ตัวแรกไม่ถูกต้อง");
            }
        };
        reader.readAsText(file);
    };

    // สำหรับอัปโหลด JSON ตัวที่สอง
    const handleUpload2 = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                setJsonData2(data);
            } catch (error) {
                alert("ไฟล์ JSON ตัวที่สองไม่ถูกต้อง");
            }
        };
        reader.readAsText(file);
    };

    // ฟังก์ชันแปลง resetNoAndTrip + รวม JSON2 โดย map TicketNo
    const resetNoAndTripWithJson2 = () => {
        if (!jsonData1 || !jsonData2) return;

        const tripMap = {};
        let tripCounter = 0;

        // Map No เก่า → No ใหม่ (index)
        const noMap = {};

        // แปลง JSON ตัวแรกเพื่อหาการแมป No เดิม → No ใหม่
        jsonData1.forEach((item, index) => {
            const originalTrip = item.Trip;
            const isCancelled = item.Status === "ยกเลิก";

            if (!(originalTrip in tripMap) && !isCancelled) {
                tripMap[originalTrip] = tripCounter++;
            }

            noMap[item.No] = index; // No ใหม่ = index ของ item ตัวแรก
        });

        // แปลง JSON ตัวที่สอง โดยปรับ TicketNo ตาม noMap และปรับ id ใหม่เรียงลำดับ 0...
        const updated2 = jsonData2.map((item, index) => {
            const oldTicketNo = item.TicketNo;
            const newTicketNo = noMap.hasOwnProperty(oldTicketNo) ? noMap[oldTicketNo] : oldTicketNo;

            return {
                ...item,
                TicketNo: newTicketNo,
                id: index, // id ใหม่เรียง 0,1,2,...
            };
        });

        downloadJson(updated2, "updated_json2_" + fileName);
    };


    const downloadJson = (data, fileName) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        saveAs(blob, fileName);
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
                อัปโหลดไฟล์ JSON และแปลงข้อมูล
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="contained" component="label">
                    เลือกไฟล์ JSON ตัวแรก
                    <input type="file" hidden accept=".json" onChange={handleUpload1} />
                </Button>

                <Button variant="contained" component="label">
                    เลือกไฟล์ JSON ตัวที่สอง (ถ้ามี)
                    <input type="file" hidden accept=".json" onChange={handleUpload2} />
                </Button>

                {jsonData1 && (
                    <>
                        <Typography color="success.main">✔️ อัปโหลด JSON ตัวแรกสำเร็จ: {fileName}</Typography>

                        <Button variant="outlined" color="secondary" onClick={resetNoAndTripWithJson2}>
                            ดาวน์โหลด (รีเซ็ต No และ Trip พร้อม JSON ตัวสอง)
                        </Button>
                    </>
                )}
            </Box>
        </Container>
    );
}
