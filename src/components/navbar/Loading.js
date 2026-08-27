import { LinearProgress, Box } from "@mui/material";
import Logo from "../../theme/img/logoPanda.jpg"
import theme from "../../theme/theme";


const FullPageLoading = () => (
    <Box
        sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "white",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column", // ✅ เรียงแนวตั้ง
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        {/* โลโก้อยู่ตรงกลางบน */}
        <img src={Logo} width="400" style={{ marginBottom: 24 }} />

        {/* แถบโหลดอยู่ด้านล่างโลโก้ */}
        <Box sx={{ width: "50%" }}>
            <LinearProgress
                variant="indeterminate"
                sx={{
                    height: 15,
                    borderRadius: 5,
                    backgroundColor: "#eee",
                    "& .MuiLinearProgress-bar": {
                        background: `linear-gradient(90deg, black, ${theme.palette.error.main})`,
                    },
                }}
            />
        </Box>
    </Box>

);

export default FullPageLoading;