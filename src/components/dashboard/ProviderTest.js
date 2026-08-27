import React, { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
import { useData } from "../../server/provider";
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import {
    ref,
    get,
    query,
    orderByKey,
    limitToFirst,
    startAfter,
    onValue,
} from "firebase/database";
import { BasicDataProvider } from "../../server/provider/BasicDataProvider";

export default function DriverTable() {
    // const {
    //     driverData,
    //     counts,
    //     rowsPerPage,
    //     driverPage,
    //     handleDriverPageChange,
    //     handleChangeRowsPerPage,
    // } = useData();

    // const { data,counts, rowsPerPage, pages, pageHandlers, handleChangeRowsPerPage } = useData();
    //const driverArray = Object.entries(drivers);
    

    // const [drivers, setDrivers] = useState(0);
    // console.log("drivers", drivers);

    //const [count, setCount] = useState(0);

    // useEffect(() => {
    //     // ref ไปยัง path ที่ต้องการนับจำนวน เช่น "/customers/transports"
    //     const dataRef = ref(database, "/employee/drivers");

    //     // ตั้ง listener ฟังข้อมูล realtime
    //     const unsubscribe = onValue(dataRef, (snapshot) => {
    //         const data = snapshot.val();
    //         if (data) {
    //             // data เป็น object map id => data
    //             // นับจำนวน key เพื่อหา length
    //             const length = Object.keys(data).length;
    //             setDrivers(length);
    //         } else {
    //             setDrivers(0);
    //         }
    //     });

    //     // cleanup ลบ listener เมื่อ component unmount
    //     return () => unsubscribe();
    // }, []);

    const { officers, drivers, loading } = BasicDataProvider();

if (loading) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
      <CircularProgress />
    </Box>
  );
}

const driverArray = Object.values(drivers || {});
console.log("🚀 driverArray", driverArray);
console.log("🚀 drivers", drivers);

    return (
        <>
            {/* แสดงตาราง */}
            {/* <Box>
                {drivers}
            </Box> */}
            <TableContainer
                component={Paper}
                sx={{ marginTop: 2 }}
            >
                <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                    <TableHead sx={{ height: "7vh" }}>
                        <TableRow>
                            <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                ชื่อ-สกุล
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                เลขประจำตัวผู้เสียภาษี
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                ทะเบียนรถ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                ประเภทรถ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                เลขที่ธนาคาร
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                ธนาคาร
                            </TablecellHeader>
                            <TablecellHeader sx={{ width: 50 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            driverArray.map((row, index) => ( 
                                <TableRow key={index}>
                                    <TableCell sx={{ textAlign: "center" }}>{Number(index) + 1}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.Name || "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.IDCard || "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{/* {row.Registration.split(":")[1]} */}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.TruckType || "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.BankID || "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.BankName || "-"}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                {/* <TablePagination
                    component="div"
                    count={counts.driver}
                    page={pages.driver}
                    rowsPerPage={rowsPerPage}
                    onPageChange={pageHandlers.driver}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="แสดงจำนวนแถว:"
                /> */}
            </TableContainer>
            {/* <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>ข้อมูล</th>
                    </tr>
                </thead>
                <tbody>
                    {/* {Object.entries(driverPageData).map(([key, value]) => (
             <tr key={key}>
               <td>{Number(key)+1}</td>
               <td>{value.Name}</td>
             </tr>
           ))}
                </tbody>
            </table>

            <TablePagination
                component="div"
                count={counts.driver}
                page={driverPage}
                rowsPerPage={rowsPerPage}
                onPageChange={handleDriverPageChange}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="แสดงจำนวนแถว:"
            /> */}
        </>
    );
}