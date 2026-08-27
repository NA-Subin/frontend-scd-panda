import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
  ShowError,
  ShowInfo,
  ShowSuccess,
  ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, database, googleProvider } from "../../server/firebase";
import Cookies from 'js-cookie';
import UpdateDatabase from "../dashboard/test";
import CryptoJS from "crypto-js";
import { useBasicData } from "../../server/provider/BasicDataProvider";

function createData(No, Email, Password, Position) {
  return {
    No,
    Email,
    Password,
    Position,
  };
}

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const { positions, officers, drivers, creditors } = useBasicData();
  const creditorsDetail = Object.values(creditors || {});
  const driversDetail = Object.values(drivers || {});
  const officersDetail = Object.values(officers || {});
  const positionsDetail = Object.values(positions || {});

  // ฟังก์ชันสำหรับเข้ารหัสรหัสผ่าน
  const encryptPassword = (password) => {
    const encrypted = CryptoJS.AES.encrypt(password, 'your-secret-key').toString();
    return encrypted;
  };

  // ฟังก์ชันสำหรับถอดรหัสรหัสผ่าน
  const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, 'your-secret-key');
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    return originalPassword;
  };

  const loginUser = async (event) => {
    event.preventDefault();

    if (!user || !password) {
      ShowWarning("กรุณากรอก User และ Password");
      return;
    }

    try {
      const encryptedPassword = encryptPassword(password);

      // เข้าสู่ระบบ Firebase
      await signInWithEmailAndPassword(auth, `${user}@gmail.com`, password);

      // 🔍 ค้นหาผู้ใช้จาก local data (officers, creditors, drivers)
      const matchedUser =
        officersDetail.find(emp => emp.User === user && emp.Password === password) ||
        creditorsDetail.find(emp => emp.User === user && emp.Password === password) ||
        driversDetail.find(emp => emp.User === user && emp.Password === password);

      if (!matchedUser) {
        ShowError("ไม่พบ User ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง");
        return;
      }

      // 🔍 ค้นหาข้อมูลตำแหน่งงานของผู้ใช้
      const position = positionsDetail.find(pos => pos.id === Number(matchedUser.Position.split(":")[0]));

      if (!position) {
        ShowError("ตำแหน่งของคุณไม่ถูกต้องในระบบ");
        return;
      }

      // ✅ เก็บสิทธิ์ที่มีในตำแหน่งงานนี้
      const accessRights = Object.entries(position)
        .filter(([key, value]) =>
          [
            "DriverData",
            "GasStationData",
            "BasicData",
            "OprerationData",
            "FinancialData",
            "ReportData",
            "SmallTruckData",
            "BigTruckData"
          ].includes(key) && value === 1
        )
        .map(([key]) => key);

      // ✅ ตั้งค่า Cookies
      Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
      Cookies.set("sessionToken", `${user}$${matchedUser.id}`, { expires: 30, secure: true, sameSite: "Lax" });
      Cookies.set("password", encryptedPassword, { expires: 30, secure: true, sameSite: "Lax" });

      // ✅ นำทางตามสิทธิ์
      if (accessRights.length === 1 && accessRights[0] === "DriverData") {
        navigate("/driver-detail", { state: { Employee: matchedUser } });
      } else if (accessRights.length === 1 && accessRights[0] === "GasStationData") {
        navigate("/gasstation-attendant", { state: { Employee: matchedUser } });
      } else {
        navigate("/choose", { state: { Employee: matchedUser } });
      }

    } catch (error) {
      console.error("Login Error:", error);
      ShowError("User หรือ Password ไม่ถูกต้อง");
    }
  };


  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Email และ Password
  // const loginUser = async (event) => {
  //   event.preventDefault();

  //   if (!user || !password) {
  //     ShowWarning("กรุณากรอก User และ Password");
  //     return;
  //   }

  //   try {
  //     // เข้ารหัสรหัสผ่านก่อนเก็บใน Cookie
  //     const encryptedPassword = encryptPassword(password);

  //     // เข้าสู่ระบบ Firebase ด้วยรหัสผ่านที่เข้ารหัส
  //     const userCredential = await signInWithEmailAndPassword(
  //       auth,
  //       `${user}@gmail.com`,
  //       password // ใช้รหัสผ่านที่ไม่ได้เข้ารหัสสำหรับ Firebase
  //     );

  //     console.log("creditorsDetail", creditorsDetail);
  //     console.log("driversDetail", driversDetail);
  //     console.log("officersDetail", officersDetail);
  //     console.log("positionsDetail", positionsDetail);
  //     const snapshot = await database
  //       .ref("/employee/officers")
  //       .orderByChild("User")
  //       .equalTo(user)
  //       .once("value");

  //     const datas = snapshot.val();

  //     if (datas) {
  //       for (let id in datas) {
  //         if (datas[id].Password === password) {
  //           // บันทึก Cookies โดยใช้รหัสผ่านที่เข้ารหัส
  //           Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
  //           Cookies.set("sessionToken", `${user}$${datas[id].id}`, { expires: 30, secure: true, sameSite: "Lax" });
  //           Cookies.set("password", encryptedPassword, { expires: 30, secure: true, sameSite: "Lax" });

  //           if (datas[id].Rights === "หน้าลาน") {
  //             navigate("/gasstation-attendant", { state: { Employee: datas[id] } });
  //           } else if (datas[id].Rights === "แอดมิน") {
  //             navigate("/choose");
  //           } else {
  //             navigate("/financial");
  //           }
  //           return;
  //         }
  //       }
  //       ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
  //       return;
  //     }

  //     // ถ้าไม่เจอใน officers ให้เช็ค creditors
  //     const creditorSnapshot = await database
  //       .ref("/employee/creditors")
  //       .orderByChild("User")
  //       .equalTo(user)
  //       .once("value");

  //     const creditorDatas = creditorSnapshot.val();
  //     if (creditorDatas) {
  //       for (let id in creditorDatas) {
  //         if (creditorDatas[id].Password === password) {
  //           // บันทึก Cookies โดยใช้รหัสผ่านที่เข้ารหัส
  //           Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
  //           Cookies.set("sessionToken", `${user}$${creditorDatas[id].id}`, { expires: 30, secure: true, sameSite: "Lax" });
  //           Cookies.set("password", encryptedPassword, { expires: 30, secure: true, sameSite: "Lax" });

  //           navigate("/trade-payable", { state: { Creditor: creditorDatas[id] } });
  //           return;
  //         }
  //       }
  //       ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
  //       return;
  //     }

  //     // ถ้าไม่เจอใน officers ให้เช็ค creditors
  //     const driverSnapshot = await database
  //       .ref("/employee/drivers")
  //       .orderByChild("User")
  //       .equalTo(user)
  //       .once("value");

  //     const driverDatas = driverSnapshot.val();
  //     if (driverDatas) {
  //       for (let id in driverDatas) {
  //         if (driverDatas[id].Password === password) {
  //           // บันทึก Cookies โดยใช้รหัสผ่านที่เข้ารหัส
  //           Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
  //           Cookies.set("sessionToken", `${user}$${driverDatas[id].id}`, { expires: 30, secure: true, sameSite: "Lax" });
  //           Cookies.set("password", encryptedPassword, { expires: 30, secure: true, sameSite: "Lax" });

  //           navigate("/driver-detail", { state: { Creditor: driverDatas[id] } });
  //           return;
  //         }
  //       }
  //       ShowError("กรุณากรอกรหัสผ่านใหม่อีกครั้ง");
  //       return;
  //     }

  //     // ถ้าไม่เจอทั้งสองฐานข้อมูล
  //     ShowError("ไม่พบ User ในระบบ กรุณาตรวจสอบข้อมูลอีกครั้ง");
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     ShowError("User หรือ Password ไม่ถูกต้อง");
  //   }
  // };

  // useEffect(() => {
  //   const token = Cookies.get("user");
  //   const encryptedPassword = Cookies.get("password");

  //   if (token && encryptedPassword) {
  //     const password = decryptPassword(encryptedPassword);

  //     signInWithEmailAndPassword(auth, `${token}@gmail.com`, password)
  //       .then(() => {
  //         // ฟังก์ชันช่วยสำหรับค้นหาข้อมูลจาก path ต่าง ๆ
  //         const checkPaths = async () => {
  //           const paths = [
  //             {
  //               ref: "/employee/officers/", route: (data) =>
  //                 data.Position === "พนักงานขายหน้าลาน"
  //                   ? { path: "/gasstation-attendant", state: { Employee: data } }
  //                   : { path: "/choose" }
  //             },
  //             { ref: "/employee/creditors/", route: () => ({ path: "/trade-payable" }) },
  //             { ref: "/employee/drivers/", route: () => ({ path: "/driver-Detail" }) },
  //           ];

  //           for (const { ref, route } of paths) {
  //             try {
  //               const snapshot = await database
  //                 .ref(ref)
  //                 .orderByChild("User")
  //                 .equalTo(token)
  //                 .once("value");

  //               const datas = snapshot.val();
  //               if (datas) {
  //                 for (let id in datas) {
  //                   const target = route(datas[id]);
  //                   navigate(target.path, { state: target.state });
  //                   return;
  //                 }
  //               }
  //             } catch (error) {
  //               console.error(`Error fetching data from ${ref}:`, error);
  //             }
  //           }

  //           // ถ้าไม่เจอในทุก path
  //           navigate("/");
  //         };

  //         checkPaths();
  //       })
  //       .catch((error) => {
  //         console.error("Error signing in:", error);
  //         navigate("/");
  //       });
  //   } else {
  //     navigate("/");
  //   }
  // }, [navigate]);

  // const [isRedirected, setIsRedirected] = useState(false);

  // useEffect(() => {
  //   if (isRedirected) return;

  //   const user = Cookies.get("user");
  //   const encryptedPassword = Cookies.get("password");
  //   if (!user || !encryptedPassword) return;

  //   const password = decryptPassword(encryptedPassword);

  //   const allUsers = [...officersDetail, ...creditorsDetail, ...driversDetail];
  //   const matchedUser = allUsers.find((emp) => emp.User === user && emp.Password === password);

  //   if (!matchedUser || !matchedUser.Position) return;

  //   const positionId = Number(matchedUser.Position.split(":")[0]);
  //   const position = positionsDetail.find((pos) => pos.id === positionId);
  //   if (!position) return;

  //   const accessRights = [
  //     "DriverData",
  //     "GasStationData",
  //     "BasicData",
  //     "OprerationData",
  //     "FinancialData",
  //     "ReportData",
  //     "SmallTruckData",
  //     "BigTruckData"
  //   ].filter(key => position[key] === 1);

  //   setIsRedirected(true); // ✅ ป้องกันการวิ่งซ้ำ

  //   if (accessRights.length === 1 && accessRights[0] === "DriverData") {
  //     navigate("/driver-detail", { state: { Employee: matchedUser } });
  //   } else if (accessRights.length === 1 && accessRights[0] === "GasStationData") {
  //     navigate("/gasstation-attendant", { state: { Employee: matchedUser } });
  //   } else {
  //     navigate("/choose", { state: { Employee: matchedUser } });
  //   }
  // }, [officersDetail, creditorsDetail, driversDetail, positionsDetail, navigate]);

  return (
    <Container sx={{ p: { xs: 3, sm: 6, md: 9 }, maxWidth: { xs: "lg", sm: "md", md: "sm" } }}>
      <Paper
        sx={{
          borderRadius: 5,
          boxShadow: "1px 1px 2px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          height={50}
          sx={{
            backgroundColor: theme.palette.panda.main,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        />
        <Box sx={{
          p: { xs: 3, sm: 4, md: 5 },
          marginTop: { xs: -2, sm: -3, md: -4 },
          marginBottom: { xs: -1, sm: -2, md: -3 },
        }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.panda.main}
            gutterBottom
          >
            ยินดีต้อนรับเข้าสู่ระบบ
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginTop={-1}
          >
            <img src={Logo} width="150" />
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginLeft={-4.7}
              marginTop={3.7}
            >
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.error.main}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                S
              </Typography>
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.warning.light}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                C
              </Typography>
              <Typography
                variant="h2"
                fontSize={70}
                color={theme.palette.info.dark}
                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                fontWeight="bold"
                gutterBottom
              >
                D
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2} marginTop={-2} component="form"
            onSubmit={loginUser}>
            <Grid item xs={12}>
              <TextField
                label="User"
                size="small"
                type="user"
                variant="filled"
                fullWidth
                defaultValue={user}
                onChange={(e) => setUser(e.target.value)}
                sx={{ backgroundColor: theme.palette.primary.contrastText }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                size="small"
                type="password"
                variant="filled"
                fullWidth
                defaultValue={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ backgroundColor: theme.palette.primary.contrastText }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Button variant="contained" color="info" type="submit">
                เข้าสู่ระบบ
              </Button>
            </Grid>
            {/* <Grid item xs={3} textAlign="left"></Grid>
              <Grid item xs={12}><Divider/></Grid>
              <Grid item xs={3} textAlign="left"></Grid>
              <Grid item xs={6} textAlign="center">
                <Button variant="contained" color="info" onClick={handleGoogleSignIn}>เข้าสู่ระบบด้วย Google</Button>
              </Grid>
              <Grid item xs={3} textAlign="left"></Grid> */}
          </Grid>
        </Box>
        <Box
          height={50}
          sx={{
            backgroundColor: theme.palette.panda.light,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />
      </Paper>
      {/* <UpdateDatabase /> */}
    </Container>
  );
};

export default Login;
