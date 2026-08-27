import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/th';
import { database } from "../../server/firebase";
import { TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellSelling, TableCellPWD } from "../../theme/style";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";
import QuotationDetail from "./QuotationDetail";
import QuotationUpdate from "./QuotationUpdate";

const Quotation = () => {
    const navigate = useNavigate();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleBack = () => {
        navigate("/choose");
    }

    return (
        <Container
            sx={{
                paddingLeft: { xs: 1, sm: 2, md: 3 },
                paddingRight: { xs: 1, sm: 2, md: 3 },
                marginTop: { xs: 0, sm: 0, md: 1 },
                maxWidth: { xs: "lg", sm: "lg", md: "lg" }
            }}>
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
                    <Box textAlign="right" marginTop={-6.5} marginBottom={4} sx={{ marginRight: { xs: -2, sm: -3, md: -4 } }}>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{
                                border: "3px solid white",
                                borderTopRightRadius: 15,
                                borderTopLeftRadius: 6,
                                borderBottomRightRadius: 6,
                                borderBottomLeftRadius: 6
                            }}
                            endIcon={
                                <ReplyAllIcon fontSize="small" />
                            }
                            onClick={handleBack}
                        >
                            กลับหน้าแรก
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={4}>
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                marginTop={-3}
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
                        </Grid>
                        <Grid item xs={12} sm={12} md={8}>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                textAlign="center"
                                color={theme.palette.panda.main}
                                sx={{ marginTop: 5, marginLeft: 1 }}
                                gutterBottom
                            >
                                ยินดีต้อนรับเข้าสู่หน้าใบเสนอราคาลูกค้า
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider />
                    {
                        open ? <QuotationDetail setOpen={setOpen} /> : <QuotationUpdate setOpen={setOpen} />
                    }
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
        </Container >
    );
};

export default Quotation;
