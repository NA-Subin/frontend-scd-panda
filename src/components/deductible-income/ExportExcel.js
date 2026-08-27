import * as XLSX from "xlsx";
import { database } from "../../server/firebase";
import { useState } from "react";

const ImportExcel = () => {
    const [companyData, setCompanyData] = useState([]);

    // เลือกไฟล์ Excel
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            console.log("Raw Excel Data:", data);

            if (data.length < 2) {
                alert("ไฟล์ไม่มีข้อมูล");
                return;
            }

            // หาว่าหัวข้อ "ชื่อบริษัท" อยู่คอลัมน์ไหน
            const headerRow = data[0];
            const colIndex = headerRow.findIndex(
                (h) => h && h.toString().trim() === "ชื่อบริษัท"
            );

            if (colIndex === -1) {
                alert("ไม่พบหัวข้อ 'ชื่อบริษัท' ในไฟล์ Excel");
                return;
            }

            const names = data
                .slice(1) // ข้ามหัวตาราง
                .map((row) => row[colIndex] || "") // ดึงตามคอลัมน์ที่เจอ
                .filter((name) => name && name.trim() !== "");

            console.log("Names Extracted:", names);
            setCompanyData(names);
        };
        reader.readAsBinaryString(file);
    };

    // กดยืนยันบันทึกเข้า Firebase
    const handleConfirmImport = () => {
        if (companyData.length === 0) {
            alert("ไม่มีข้อมูลให้นำเข้า");
            return;
        }

        database.ref("/companypayment/").once("value").then((snapshot) => {
            const existing = snapshot.val() || {};
            let startId = Object.keys(existing).length;

            const updates = {};
            companyData.forEach((name, idx) => {
                const id = startId + idx; // เริ่มจาก 0
                updates[id] = {
                    id: id,
                    Name: name,
                    Status: "อยู่ในระบบ"
                };
            });

            database
                .ref("/companypayment/")
                .update(updates)
                .then(() => {
                    alert("นำเข้าข้อมูลสำเร็จ");
                    setCompanyData([]); // ล้าง state
                })
                .catch((err) => console.error("Error saving:", err));
        });
    };

    return (
        <div>
            <h3>นำเข้าบริษัทจาก Excel</h3>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

            {companyData.length > 0 && (
                <>
                    <h4>ตัวอย่างข้อมูลที่จะนำเข้า:</h4>
                    <ul>
                        {companyData.slice(0, 5).map((name, idx) => (
                            <li key={idx}>{name}</li>
                        ))}
                        {companyData.length > 5 && (
                            <li>... (รวม {companyData.length} รายการ)</li>
                        )}
                    </ul>
                    <button onClick={handleConfirmImport}>ยืนยันนำเข้า</button>
                </>
            )}
        </div>
    );
};

export default ImportExcel;
