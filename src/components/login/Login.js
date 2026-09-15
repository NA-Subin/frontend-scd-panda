import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
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
import Cookies from 'js-cookie';
import { apiPost } from "../../server/apiClient";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const { refetch: refetchBasicData } = useBasicData();

  const loginUser = async (event) => {
    event.preventDefault();

    if (!user || !password) {
      ShowWarning("กรุณากรอก User และ Password");
      return;
    }

    try {
      const { token, user: matchedUser, accessRights } = await apiPost("/api/auth/login", {
        user,
        password,
      });

      Cookies.set("user", user, { expires: 30, secure: true, sameSite: "Lax" });
      Cookies.set("sessionToken", `${user}$${matchedUser.id}`, { expires: 30, secure: true, sameSite: "Lax" });
      Cookies.set("token", token, { expires: 30, secure: true, sameSite: "Lax" });

      // /api/basic-data requires auth now - the pre-login poll(s) 401'd
      // silently, so kick off a fresh authenticated fetch immediately instead
      // of waiting up to POLL_INTERVAL_MS for the next automatic one.
      refetchBasicData();

      if (accessRights.length === 1 && accessRights[0] === "DriverData") {
        navigate("/driver-detail", { state: { Employee: matchedUser } });
      } else if (accessRights.length === 1 && accessRights[0] === "GasStationData") {
        navigate("/gasstation-attendant", { state: { Employee: matchedUser } });
      } else {
        navigate("/choose", { state: { Employee: matchedUser } });
      }

    } catch (error) {
      console.error("Login Error:", error);
      ShowError(error?.data?.error || "User หรือ Password ไม่ถูกต้อง");
    }
  };

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
    </Container>
  );
};

export default Login;
