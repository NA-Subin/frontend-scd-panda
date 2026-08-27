import React, { useState } from "react";
import * as XLSX from "xlsx";
import { getDatabase, ref, set } from "firebase/database";
import { database } from "../../server/firebase";

const ExcelUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const handleFileRead = async () => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    
    reader.onload = async (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      jsonData.forEach((row, index) => {
        //รถใหญ่
        // const formattedData = {
        //   id: index + 1,
        //   Name: row["ชื่อจัดเทียววิ่ง"] ?? "-",
        //   TicketsName: row["ชื่อจัดเทียววิ่ง"] ?? "-",
        //   Status: "ลูกค้าประจำ",
        //   Rate1: parseFloat(parseFloat(row["ขนส่งลำปาง"] ?? 0).toFixed(2)),
        //   Rate2: parseFloat(parseFloat(row["พิจิตร"] ?? 0).toFixed(2)),
        //   Rate3: parseFloat(parseFloat(row["บางปะอิน/สระบุรี"] ?? 0).toFixed(2)),
        //   Code: "-",
        //   CompanyName: row["ชื่อ/ใบวางบิล"] ?? "-",
        //   CodeID: row["เลขผู้เสียภาษี"] ?? "-",
        //   Address: `${row["บ้านเลขที่"] ?? ""} ${row["หมู่ที่"] ?? ""} ${row["ตำบล"] ?? ""} ${row["อำเภอ"] ?? ""} ${row["จังหวัด"] ?? ""} ${row["รหัสไปรณีย์"] ?? ""}`.trim(),
        //   lat: row["lat"] ?? 0,
        //   lng: row["long"] ?? 0,
        //   Type: row["แยกฝั่ง"] ?? "-",
        //   CreditTime: row["เวลาเครดิต"] ?? 0,
        //   Phone: row["เบอร์โทร"] ?? "-"
        // };

        //รับจ้างขนส่ง
        // const formattedData = {
        //     id: index + 1,
        //     Name: row["ชื่อจัดเทียววิ่ง"] ?? "-",
        //     TicketsName: row["ชื่อจัดเทียววิ่ง"] ?? "-",
        //     Status: "ตั๋ว/ผู้รับ",
        //     Rate1: parseFloat(parseFloat(row["ขนส่งลำปาง"] ?? 0).toFixed(2)),
        //     Rate2: parseFloat(parseFloat(row["พิจิตร"] ?? 0).toFixed(2)),
        //     Rate3: parseFloat(parseFloat(row["บางปะอิน/สระบุรี"] ?? 0).toFixed(2)),
        //     Code: "-",
        //     CompanyName: row["ชื่อ/ใบวางบิล"] ?? "-",
        //     CodeID: row["เลขผู้เสียภาษี"] ?? "-",
        //     Address: `${row["บ้านเลขที่"] ?? ""} ${row["หมู่ที่"] ?? ""} ${row["ตำบล"] ?? ""} ${row["อำเภอ"] ?? ""} ${row["จังหวัด"] ?? ""} ${row["รหัสไปรณีย์"] ?? ""}`.trim(),
        //     lat: row["lat"] ?? 0,
        //     lng: row["long"] ?? 0,
        //     Type: row["ประเภท ลูกค้าค้า"] ?? "-",
        //     CreditTime: row["รอบวางบิล "] ?? 0,
        //     Phone: row["เบอร์โทร"] ?? "-"
        //   };

          // ลูกค้ารถเล็ก
          const formattedData = {
            id: index + 1,
            Name: row["ชื่อ...จัดเทียววิ่ง"] ?? "-",
            TicketsName: row["ชื่อ...จัดเทียววิ่ง"] ?? "-",
            Status: "ลูกค้าประจำ",
            Code: "-",
            CompanyName: row["ชื่อ...ใบวางบิล"] ?? "-",
            CodeID: row["เลขบัตรประชาชน/เลขผู้เสี่ยภาษี"] ?? "-",
            Address: `${row["บ้านเลขที่"] ?? ""} ${row["หมู่ที่"] ?? ""} ${row["ตำบล"] ?? ""} ${row["อำเภอ"] ?? ""} ${row["จังหวัด"] ?? ""} ${row["รหัสไปรณีย์"] ?? ""}`.trim(),
            lat: row["lat"] ?? 0,
            lng: row["long"] ?? 0,
            Type: row["ฝั่ง"] === "NP" ? "บ้านโฮ่ง" : "เชียงใหม่",
            Phone: row["เบอร์โทร"] ?? "-",
            Credit: row["เครดิต"] ?? "-",
            CreditTime: row["เวลาเครดิต"] ?? 0
          };
          

        set(ref(database, `/customers/smalltruck/${formattedData.id-1}`), formattedData)
          .then(() => console.log("Added: ", formattedData))
          .catch((error) => console.error("Error adding document: ", error));
      });
    };
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={handleFileRead}>Upload to Firebase</button>
    </div>
  );
};

export default ExcelUploader;
