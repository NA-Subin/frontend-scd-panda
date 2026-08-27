// import React, { useEffect, useState } from 'react';
// import { Button, CircularProgress } from '@mui/material';
// import { database } from '../../server/firebase';

// const UpdateDatabase = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       const snapshot = await database.ref('/primarydata/customersid').once('value');
//       const fetchedData = snapshot.val();
//       setData(fetchedData);
//     };

//     fetchData();
//   }, []);

//   const updateKeys = async () => {
//     if (!data) return;

//     setLoading(true);

//     try {
//       // แปลงข้อมูลเป็น array และจัดเรียงใหม่
//       const updatedData = Object.values(data).reduce((acc, item, index) => {
//         acc[index] = item; // เปลี่ยน key เป็นลำดับใหม่ (0, 1, 2, ...)
//         return acc;
//       }, {});

//       // ลบข้อมูลเก่า
//       await database.ref('/primarydata/customersid').remove();

//       // อัปเดตข้อมูลใหม่
//       await database.ref('/primarydata/customersid').set(updatedData);

//       // อัปเดต state
//       setData(updatedData);
//       alert('อัปเดตข้อมูลสำเร็จ!');
//     } catch (error) {
//       console.error('Error updating keys:', error);
//       alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
//     }

//     setLoading(false);
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>แก้ไขข้อมูลใน Firebase</h1>
//       {data ? (
//         <pre>{JSON.stringify(data, null, 2)}</pre>
//       ) : (
//         <CircularProgress />
//       )}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={updateKeys}
//         disabled={loading}
//         style={{ marginTop: 20 }}
//       >
//         {loading ? 'กำลังอัปเดต...' : 'แก้ไขข้อมูล'}
//       </Button>
//     </div>
//   );
// };

// export default UpdateDatabase;
