import React, { useState } from "react";
import { ref, set } from "firebase/database";
import { Box, Button, Checkbox, List, ListItem, ListItemText, Typography } from "@mui/material";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";

const EditFirebase = () => {
    const { regtail } = useData(); // ใช้ useData() ดึงข้อมูล
    const datadrivers = Object.values(regtail || {}); // แปลงเป็น Array
    const [selectedIndexes, setSelectedIndexes] = useState([]);

    // ฟังก์ชันเลือก index เพื่อลบ
    const toggleSelection = (index) => {
        setSelectedIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    // ฟังก์ชันยืนยันการลบ
    const handleDelete = () => {
        // กรองข้อมูลที่ไม่ได้ถูกเลือกให้ลบ
        let filteredTrucks = datadrivers.filter((_, index) => !selectedIndexes.includes(index));

        // จัดเรียง index ใหม่
        let newTruckData = Object.fromEntries(
            filteredTrucks.map((item, index) => [index, {
                id: index+1,
                Company: item.Company,
                RegTail: item.RegTail,
                Weight: item.Weight,
                Cap: item.Cap,
                Cap1: item.Cap1 === undefined ? "-" : item.Cap1,
                Cap2: item.Cap2 === undefined ? "-" : item.Cap2,
                Cap3: item.Cap3 === undefined ? "-" : item.Cap3,
                Cap4: item.Cap4 === undefined ? "-" : item.Cap4,
                Cap5: item.Cap5 === undefined ? "-" : item.Cap5,
                Cap6: item.Cap6 === undefined ? "-" : item.Cap6,
                Cap7: item.Cap7 === undefined ? "-" : item.Cap7,
                Cap8: item.Cap8 === undefined ? "-" : item.Cap8,
                Insurance: item.Insurance,
                Status: item.Status,
                Driver: item.Driver,
                VehicleRegistration: item.VehicleRegistration,
                DateEndTax: "-",
                DateEndInsurance: "-",
                VehPicture: item.VehPicture
            }])
        );

        // อัปเดตกลับไปที่ Firebase โดยใช้ database ที่นำเข้ามา
        set(ref(database, "truck/registrationTail"), newTruckData)
            .then(() => {
                console.log("Updated successfully");
                setSelectedIndexes([]); // เคลียร์รายการที่เลือก
            })
            .catch((error) => console.error("Update failed: ", error));
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", textAlign: "center", mt: 5 }}>
            <Typography variant="h5" gutterBottom>
                drivers Management
            </Typography>
            <List>
                {datadrivers.map((row, index) => (
                    <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Checkbox checked={selectedIndexes.includes(index)} onChange={() => toggleSelection(index)} />
                        <ListItemText primary={`Index: ${index} - Name: ${row.RegTail}`} />
                    </ListItem>
                ))}
            </List>
            <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={selectedIndexes.length === 0}
            >
                Confirm Delete
            </Button>
        </Box>
    );
};

export default EditFirebase;
