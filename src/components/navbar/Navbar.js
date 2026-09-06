import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import HomeIcon from "@mui/icons-material/Home";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ApartmentIcon from '@mui/icons-material/Apartment';
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import GroupsIcon from "@mui/icons-material/Groups";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Groups2Icon from '@mui/icons-material/Groups2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Collapse,
  CssBaseline,
  Divider,
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { IconButtonOnNavbar, TablecellHeader } from "../../theme/style";
import Logo from "../../theme/img/logoPanda.jpg";
import {
  ShowError,
  showLogout,
  ShowSuccess,
  showWelcome,
} from "../sweetalert/sweetalert";
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import ListIcon from '@mui/icons-material/List';
import PaidIcon from '@mui/icons-material/Paid';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import BadgeIcon from '@mui/icons-material/Badge';
import SummarizeIcon from '@mui/icons-material/Summarize';
import Cookies from 'js-cookie';
import { BasicDataProvider, useBasicData } from "../../server/provider/BasicDataProvider";
import FullPageLoading from "./Loading";
const drawerWidth = 200;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  overflowY: 'auto',
  height: '100vh', // 👈 เพิ่มตรงนี้
  display: 'flex',
  flexDirection: 'column',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  overflowY: 'auto',
  height: '100vh', // 👈 เพิ่มตรงนี้
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  display: 'flex',
  flexDirection: 'column',
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Navbar({ open, onOpenChange }) {
  const [pendingPath, setPendingPath] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useBasicData();
  const { positions, officers, drivers, creditors } = useBasicData();
  const [isLoading, setIsLoading] = useState(true);
  const [showBasicData, setShowBasicData] = useState(false);
  const [showBigTruck, setShowBigTruck] = useState(false);
  const [showSmallTruck, setShowSmallTruck] = useState(false);
  const [showOperation, setShowOperation] = useState(false);
  const [showFinancial, setShowFinancial] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // const dataToSend = { position: "admin" };
  const theme = useTheme();
  //const [open, setOpen] = React.useState(true);
  const [setting, setSetting] = React.useState(false);
  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [show3, setShow3] = React.useState(false);
  const [show4, setShow4] = React.useState(false);
  const [show5, setShow5] = React.useState(false);
  const [logo, setLogo] = React.useState(false);
  const [notify, setNotify] = React.useState(false);
  const [openData, setOpenData] = useState(true);
  const [operation, setOperation] = useState(false);
  const [report, setReport] = useState(false);
  const [financial, setFinacieal] = useState(false);
  const [trucksmall, setTrucksmall] = useState(showSmallTruck ? true : false);

  const isMobileMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const isMobileSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // ปรับค่า open ตามขนาดหน้าจอเมื่อโหลดครั้งแรก
  React.useEffect(() => {
    onOpenChange(!isMobileMD); // true ถ้า desktop, false ถ้า mobile

    if (isMobileMD) {
      setOpenData(false);
      setOperation(false);
      setReport(false);
      setFinacieal(false);
    }
  }, [isMobileMD]);

  const shouldDrawerOpen = React.useMemo(() => {
    return open;
  }, [open]);

  useEffect(() => {
    if (!loading && pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [loading, pendingPath, navigate]);

  // Which sidebar item is "active" (show1..show5) used to be tracked purely
  // by which item was last clicked - so on a page refresh, a direct link, or
  // the browser back/forward buttons, nothing was highlighted at all (or the
  // wrong, stale item stayed highlighted from before). Re-deriving the
  // active item from the actual URL on every route change keeps the
  // highlight correctly "stuck" on whichever menu you're really on. The
  // path lists below mirror each group's own to={...} exactly.
  useEffect(() => {
    const path = location.pathname;

    const group1Paths = ["/dashboard", "/employee", "/trucks", "/trucks-transport", "/depots", "/ticket", "/transports", "/customer-bigtrucks", "/customer-smalltrucks", "/creditor", "/deductible-income", "/expense-items", "/company-payment"];
    const group2Paths = ["/gasstations", "/report-gasstations", "/trips-bigtruck"];
    const group3Paths = ["/invoice", "/report"];
    const group4Paths = ["/summary-oil-balance", "/report-driver-trip", "/report-fuel-payment", "/report-transport-payment", "/expenses", "/salary", "/close-financial", "/profit-loss"];
    const group5Paths = ["/trips-smalltruck", "/invoice-smalltruck", "/oil-balance-smalltruck", "/payment-smalltruck", "/report-smalltruck", "/close-financial-smalltruck", "/profit-loss-smalltruck"];

    const idx1 = group1Paths.indexOf(path);
    const idx2 = group2Paths.indexOf(path);
    const idx3 = group3Paths.indexOf(path);
    const idx4 = group4Paths.indexOf(path);
    const idx5 = group5Paths.indexOf(path);

    setShow1(idx1 !== -1 ? idx1 : null);
    setShow2(idx2 !== -1 ? idx2 : null);
    setShow3(idx3 !== -1 ? idx3 : null);
    setShow4(idx4 !== -1 ? idx4 : null);
    setShow5(idx5 !== -1 ? idx5 : null);

    // Also expand whichever section the current page actually belongs to,
    // so the highlighted item isn't hiding inside a collapsed group.
    if (idx1 !== -1) setOpenData(true);
    if (idx2 !== -1) setOperation(true);
    if (idx3 !== -1) setFinacieal(true);
    if (idx4 !== -1) setReport(true);
    if (idx5 !== -1) setTrucksmall(true);
  }, [location.pathname]);

  const creditorsDetail = Object.values(creditors || {});
  const driversDetail = Object.values(drivers || {});
  const officersDetail = Object.values(officers || {});
  const positionsDetail = Object.values(positions || {});

  useEffect(() => {
    const user = Cookies.get("user");
    if (!user) return;

    const isDataReady =
      officersDetail.length > 0 &&
      driversDetail.length > 0 &&
      creditorsDetail.length > 0 &&
      positionsDetail.length > 0;

    if (!isDataReady) return;

    const allUsers = [...officersDetail, ...driversDetail, ...creditorsDetail];
    const matchedUser = allUsers.find((emp) => emp.User === user);
    if (!matchedUser || !matchedUser.Position) return;

    const positionId = matchedUser.Position;
    const position = positionsDetail.find((pos) => pos.uuid === positionId);
    if (!position) return;

    if (position.OprerationData === 1) setShowOperation(true);
    if (position.FinancialData === 1) setShowFinancial(true);
    if (position.ReportData === 1) setShowReport(true);
    if (position.BigTruckData === 1) setShowBigTruck(true);
    if (position.SmallTruckData === 1) setShowSmallTruck(true);
    if (position.BasicData === 1) setShowBasicData(true);

    setIsLoading(false);
  }, [officersDetail, driversDetail, creditorsDetail, positionsDetail]);

  useEffect(() => {
    // Session is now JWT-based (backend + Postgres) instead of Firebase Auth;
    // App.js's central session guard already verifies the token against the
    // backend, this is just a presence check for the navbar-wrapped routes.
    if (!Cookies.get("token")) {
      ShowError("กรุณาเข้าสู่ระบบ");
      navigate("/");
    }
  }, []);

  console.log("OpenData : ", openData);

  // debug
  console.log("Open : ", open);
  console.log("shouldDrawerOpen : ", shouldDrawerOpen);

  const handleDrawerOpen = () => {
    onOpenChange((prev) => !prev);
    setOpenData(false);
    setOperation(false);
    setReport(false);
    setFinacieal(false);
  };

  const handleDrawerClose = () => {
    onOpenChange(false);
  };

  const handleSetting = () => {
    setSetting(true);
    setShow1(null);
    setShow2(null);
    setShow3(null);
    navigate("/setting");
  };

  const handleNotify = () => {
    setNotify(true);
  };

  const handleNotifyClose = () => {
    setNotify(false);
  };

  const handleHomepage = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    navigate("/"); // นำผู้ใช้ไปยังหน้า login
  };

  // const handleLogout = () => {
  //   showLogout("ออกจากระบบเรียบร้อย"),
  //   Cookies.remove('token');
  //   navigate("/")
  // }

  const [anchorEl, setAnchorEl] = React.useState(null);
  const menu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const UserSignOut = () => {
    withReactContent(Swal)
      .fire({
        title: "ต้องการออกจากระบบใช่หรือไม่",
        icon: "error",
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
        showCancelButton: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          Cookies.remove('user');
          Cookies.remove('sessionToken');
          Cookies.remove('token');
          navigate("/");
          Swal.fire("ออกจากระบบเรียบร้อย", "", "success");
        } else if (result.isDenied) {
          Swal.fire("ออกจากระบบล้มเหลว", "", "error");
        }
      });
  };

  const handleBack = () => {
    navigate("/choose");
  }

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(1.5)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  }));

  if (isLoading) {
    return <FullPageLoading />;
  }

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={shouldDrawerOpen}
        sx={{ backgroundColor: theme.palette.panda.dark, height: 70, zIndex: 900 }}
      >
        <Box textAlign="right" marginBottom={-3.5} marginRight={2}>
          <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" gutterBottom>เข้าสู่ระบบโดย {Cookies.get('user')}</Typography>
        </Box>
        <Toolbar variant="dense"
          sx={{
            display: isMobileSM ? "flex" : "", // ใช้ flexbox
            justifyContent: isMobileSM ? "center" : "", // จัดให้อยู่กึ่งกลางแนวนอน
            alignItems: isMobileSM ? "center" : "", // จัดให้อยู่กึ่งกลางแนวตั้ง
            flexGrow: isMobileSM ? 1 : 0,
            marginLeft: isMobileSM ? -2 : 0,
            marginRight: isMobileSM ? -2 : 0,
            paddingTop: 2,
          }}
        >
          {
            isMobileSM ? (
              // แสดงเฉพาะ IconButton สำหรับจอโทรศัพท์
              <Box
                width="100%"
                sx={{
                  display: 'flex',
                  overflowX: 'auto', // Enable horizontal scrolling if the content overflows
                  whiteSpace: 'nowrap', // Prevent wrapping of buttons to the next line
                }}
              >
                <ButtonGroup
                  variant="text"
                  color="inherit"
                  size="large"
                  fullWidth
                  aria-label="Basic button group"
                  sx={{
                    flexGrow: 1,
                    marginTop: 1,
                    height: 50,
                  }}
                >
                  {[
                    // กลุ่มเทา
                    { to: "/dashboard", icon: <HomeIcon />, color: theme.palette.grey[700] },
                    { to: "/employee", icon: <AccountCircleIcon />, color: theme.palette.grey[700] },
                    { to: "/trucks", icon: <LocalShippingIcon />, color: theme.palette.grey[700] },
                    { to: "/trucks-transport", icon: <LocalShippingIcon />, color: theme.palette.grey[700] },
                    { to: "/depots", icon: <StoreMallDirectoryIcon />, color: theme.palette.grey[700] },
                    { to: "/ticket", icon: <BookOnlineIcon sx={{ transform: "rotate(90deg)" }} />, color: theme.palette.grey[700] },
                    { to: "/transports", icon: <BookOnlineIcon sx={{ transform: "rotate(90deg)" }} />, color: theme.palette.grey[700] },
                    { to: "/customer-bigtrucks", icon: <GroupsIcon />, color: theme.palette.grey[700] },
                    { to: "/customer-smalltrucks", icon: <GroupsIcon />, color: theme.palette.grey[700] },
                    { to: "/creditor", icon: <CurrencyExchangeIcon />, color: theme.palette.grey[700] },

                    // กลุ่มเขียว
                    { to: "/gasstations", icon: <LocalGasStationIcon />, color: theme.palette.success.main },
                    { to: "/trips-bigtruck", icon: <ListAltIcon />, color: theme.palette.success.main },

                    // กลุ่มเหลือง
                    { to: "/invoice", icon: <PaidIcon />, color: theme.palette.yellow.dark },
                    { to: "/report", icon: <PaidIcon />, color: theme.palette.yellow.dark },

                    // กลุ่มชมพู (เที่ยววิ่งรถเล็ก)
                    { to: "/trips-smalltruck", icon: <ListAltIcon />, color: theme.palette.pink.main },
                    { to: "/invoice-smalltruck", icon: <PaidIcon />, color: theme.palette.pink.main },
                    { to: "/oil-balance-smalltruck", icon: <SummarizeIcon />, color: theme.palette.pink.main },
                    { to: "/payment-smalltruck", icon: <PaidIcon />, color: theme.palette.pink.main },
                    { to: "/report-smalltruck", icon: <SummarizeIcon />, color: theme.palette.pink.main },

                    // กลุ่มฟ้า
                    { to: "/summary-oil-balance", icon: <SummarizeIcon fontSize="medium" />, color: theme.palette.info.main },
                    { to: "/report-driver-trip", icon: <SummarizeIcon fontSize="medium" />, color: theme.palette.info.main },
                    { to: "/report-fuel-payment", icon: <SummarizeIcon fontSize="medium" />, color: theme.palette.info.main },
                    { to: "/financial-deduction", icon: <SummarizeIcon fontSize="medium" />, color: theme.palette.info.main },
                    { to: "/invoice-financial", icon: <SummarizeIcon fontSize="medium" />, color: theme.palette.info.main },
                    { to: "/close-financial", icon: <SummarizeIcon fontSize="medium" />, color: theme.palette.info.main },


                    // การตั้งค่า
                    { to: "/setting", icon: <SettingsIcon />, color: theme.palette.panda.dark },
                  ].map((item, index) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Button
                        key={index}
                        component={Link}
                        to={item.to}
                        sx={{
                          backgroundColor: isActive ? "white" : "inherit",
                          color: isActive ? item.color : "inherit",
                          fontWeight: isActive ? "bold" : "normal",
                          paddingLeft: 4,
                          paddingRight: 4
                        }}
                      >
                        {item.icon}
                      </Button>
                    );
                  })}

                  {/* ปุ่มย้อนกลับ */}
                  <Button
                    sx={{
                      paddingLeft: 4,
                      backgroundColor: theme.palette.panda.light,
                      paddingRight: 4,
                      marginTop: 1
                    }}
                    onClick={handleBack}
                  >
                    <ReplyAllIcon sx={{ marginTop: -1 }} />
                  </Button>

                  {/* ปุ่มออกจากระบบ */}
                  <Button
                    sx={{
                      paddingLeft: 4,
                      backgroundColor: theme.palette.panda.light,
                      paddingRight: 4,
                      marginTop: 1
                    }}
                    onClick={UserSignOut}
                  >
                    <MeetingRoomIcon sx={{ marginTop: -1 }} />
                  </Button>
                </ButtonGroup>

              </Box>
            )
              : isMobileMD ? (
                <>
                  <Grid container spacing={2} paddingTop={1}>
                    <Grid item xs={6}>
                      <IconButton
                        color={open ? "inherit" : theme.palette.panda.dark}
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                          ...(shouldDrawerOpen && { display: "none" }),
                        }}
                      >
                        <MenuIcon color="inherit" fontSize="large" />
                      </IconButton>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      justifyContent="right"
                      display="flex"
                      alignItems="center"
                    >
                      <Tooltip title="แจ้งเตือน">
                        <IconButtonOnNavbar
                          sx={{
                            backgroundColor: !notify
                              ? theme.palette.panda.dark
                              : "white",
                            marginRight: 1,
                            marginLeft: 1,
                          }}
                          color={!notify ? "inherit" : theme.palette.panda.dark}
                          onClick={handleNotify}
                        >
                          <Badge
                            badgeContent={20}
                            color="error"
                            max={9}
                            sx={{
                              "& .MuiBadge-badge": {
                                fontSize: 11, // ขนาดตัวเลขใน Badge
                                minWidth: 15, // ความกว้างของ Badge
                                height: 15, // ความสูงของ Badge
                                right: -2,
                              },
                            }}
                          >
                            <NotificationsActiveIcon />
                          </Badge>
                          <Snackbar
                            open={notify}
                            onClose={handleNotifyClose}
                            autoHideDuration={5000}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Position at top-right
                          >
                            <Alert onClose={handleNotifyClose} severity="info" sx={{ width: "100%", marginTop: 5 }}>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>แจ้งเตือน</Typography>
                              <Divider sx={{ marginTop: 1 }} />
                              <TableContainer
                                component={Paper}
                                style={{ maxHeight: "50vh" }}
                              >
                                <Table stickyHeader size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.dark }}>
                                        ลำดับ
                                      </TablecellHeader>
                                      <TablecellHeader sx={{ textAlign: "center", fontSize: 14 }}>
                                        แจ้งเตือน
                                      </TablecellHeader>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>1</TableCell>
                                      <TableCell>มีการอนุมัติเที่ยววิ่งแล้ว</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Alert>
                          </Snackbar>
                        </IconButtonOnNavbar>
                      </Tooltip>
                      <Divider
                        orientation="vertical"
                        variant="fullWidth"
                        flexItem
                        sx={{ border: "1px solid white" }}
                      />
                      <Tooltip title="เมนู">
                        <IconButtonOnNavbar
                          sx={{
                            backgroundColor: !menu ? theme.palette.panda.dark : "white",
                            marginRight: 1,
                            marginLeft: 1,
                          }}
                          color={!menu ? "inherit" : theme.palette.panda.dark}
                          id="demo-positioned-button"
                          aria-controls={!menu ? "demo-positioned-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={!menu ? "true" : undefined}
                          onClick={handleClick}
                        >
                          <ListIcon />
                        </IconButtonOnNavbar>
                      </Tooltip>
                      <Divider
                        orientation="vertical"
                        variant="fullWidth"
                        flexItem
                        sx={{ border: "1px solid white" }}
                      />
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={handleSetting}>
                          <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>ตั้งค่า</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleBack}>
                          <ListItemIcon>
                            <ReplyAllIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>กลับหน้าแรก</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={UserSignOut}>
                          <ListItemIcon>
                            <MeetingRoomIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>ออกจากระบบ</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Grid>
                  </Grid>
                </>

              )
                : (
                  // แสดงเนื้อหาทั้งหมดสำหรับหน้าจอที่ไม่ใช่โทรศัพท์
                  <>
                    {!open ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        marginLeft={-3}
                        marginTop={logo ? 0 : 0.5}
                        sx={{
                          backgroundColor: "white",
                          borderTopRightRadius: logo ? 35 : 25,
                          borderBottomRightRadius: logo ? 35 : 25,
                        }}
                        onMouseEnter={() => setLogo(true)}
                        onMouseLeave={() => setLogo(false)}
                      >
                        <IconButton
                          color={shouldDrawerOpen ? "inherit" : theme.palette.panda.dark}
                          aria-label="open drawer"
                          onClick={handleDrawerOpen}
                          edge="start"
                          sx={{
                            marginLeft: 2,
                            mr: 1.5,
                            ...(shouldDrawerOpen && { display: "none" }),
                            marginRight: logo ? 3 : 0,
                          }}
                        >
                          <MenuIcon />
                        </IconButton>
                        <img
                          src={Logo}
                          width={logo ? "60" : "50"}
                          onClick={handleHomepage}
                        />
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          marginTop={1}
                          marginLeft={-1.5}
                          paddingRight={logo ? 2 : 1}
                          onClick={handleHomepage}
                        >
                          <Typography
                            variant={logo ? "h4" : "h5"}
                            color={theme.palette.error.main}
                            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                            fontWeight="bold"
                            gutterBottom
                          >
                            S
                          </Typography>
                          <Typography
                            variant={logo ? "h4" : "h5"}
                            color={theme.palette.warning.light}
                            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                            fontWeight="bold"
                            gutterBottom
                          >
                            C
                          </Typography>
                          <Typography
                            variant={logo ? "h4" : "h5"}
                            color={theme.palette.info.dark}
                            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                            fontWeight="bold"
                            gutterBottom
                          >
                            D
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      ""
                    )}
                    <Grid container spacing={2} paddingTop={1}>
                      <Grid item xs={6}></Grid>
                      <Grid
                        item
                        xs={6}
                        justifyContent="right"
                        display="flex"
                        alignItems="center"
                      >
                        <Tooltip title="แจ้งเตือน">
                          <IconButtonOnNavbar
                            sx={{
                              backgroundColor: !notify
                                ? theme.palette.panda.dark
                                : "white",
                              marginRight: 1,
                              marginLeft: 1,
                            }}
                            color={!notify ? "inherit" : theme.palette.panda.dark}
                            onClick={handleNotify}
                          >
                            <Badge
                              badgeContent={20}
                              color="error"
                              max={9}
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: 11, // ขนาดตัวเลขใน Badge
                                  minWidth: 15, // ความกว้างของ Badge
                                  height: 15, // ความสูงของ Badge
                                  right: -2,
                                },
                              }}
                            >
                              <NotificationsActiveIcon />
                            </Badge>
                            <Snackbar
                              open={notify}
                              onClose={handleNotifyClose}
                              autoHideDuration={5000}
                              anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Position at top-right
                            >
                              <Alert onClose={handleNotifyClose} severity="info" sx={{ width: "100%", marginTop: 5 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>แจ้งเตือน</Typography>
                                <Divider sx={{ marginTop: 1 }} />
                                <TableContainer
                                  component={Paper}
                                  style={{ maxHeight: "50vh" }}
                                >
                                  <Table stickyHeader size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 14, backgroundColor: theme.palette.panda.dark }}>
                                          ลำดับ
                                        </TablecellHeader>
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 14 }}>
                                          แจ้งเตือน
                                        </TablecellHeader>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>1</TableCell>
                                        <TableCell>มีการอนุมัติเที่ยววิ่งแล้ว</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Alert>
                            </Snackbar>
                          </IconButtonOnNavbar>
                        </Tooltip>
                        <Divider
                          orientation="vertical"
                          variant="fullWidth"
                          flexItem
                          sx={{ border: "1px solid white" }}
                        />
                        <Tooltip title="เมนู">
                          <IconButtonOnNavbar
                            sx={{
                              backgroundColor: !menu ? theme.palette.panda.dark : "white",
                              marginRight: 1,
                              marginLeft: 1,
                            }}
                            color={!menu ? "inherit" : theme.palette.panda.dark}
                            id="demo-positioned-button"
                            aria-controls={!menu ? "demo-positioned-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={!menu ? "true" : undefined}
                            onClick={handleClick}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <StyledBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                variant="dot"
                              >
                                <Avatar
              /*alt={token.split("#")[0]}*/ src="/static/images/avatar/2.jpg"
                                  sx={{ width: 30, height: 30 }}
                                />
                              </StyledBadge>
                            </Box>
                            {/* <ListIcon /> */}
                          </IconButtonOnNavbar>
                        </Tooltip>
                        <Divider
                          orientation="vertical"
                          variant="fullWidth"
                          flexItem
                          sx={{ border: "1px solid white" }}
                        />
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                        >
                          <MenuItem onClick={handleSetting}>
                            <ListItemIcon>
                              <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>ตั้งค่า</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={handleBack}>
                            <ListItemIcon>
                              <ReplyAllIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>กลับหน้าแรก</ListItemText>
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={UserSignOut}>
                            <ListItemIcon>
                              <MeetingRoomIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>ออกจากระบบ</ListItemText>
                          </MenuItem>
                        </Menu>
                      </Grid>
                    </Grid>
                  </>
                )
          }
        </Toolbar>
      </AppBar>
      {
        isMobileSM ?
          ""
          :
          <Drawer variant="permanent" open={shouldDrawerOpen}
            sx={{
              zIndex: 800,
              '& .MuiDrawer-paper': {
                overflowY: 'auto',
                height: '100vh', // ✅ ใส่ตรงนี้
              },
            }}
          >
            <DrawerHeader sx={{ height: 70 }}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img src={Logo} width="50" />
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  marginTop={1}
                  marginLeft={-1.5}
                >
                  <Typography
                    variant="h5"
                    color={theme.palette.error.main}
                    sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                    fontWeight="bold"
                    gutterBottom
                  >
                    S
                  </Typography>
                  <Typography
                    variant="h5"
                    color={theme.palette.warning.light}
                    sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                    fontWeight="bold"
                    gutterBottom
                  >
                    C
                  </Typography>
                  <Typography
                    variant="h5"
                    color={theme.palette.info.dark}
                    sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                    fontWeight="bold"
                    gutterBottom
                  >
                    D
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleDrawerOpen}
                size="small"
                sx={{ marginLeft: 4 }}
              >
                {theme.direction === "ltr" ? (
                  <ChevronLeftIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </IconButton>
            </DrawerHeader>
            <Divider />
            {/* {
              ([!openData, !operation, !report, !financial].filter(Boolean).length === 1) &&
              <>
                <Box
                  sx={{
                    height: shouldDrawerOpen ? 60 : 60,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 1
                  }}
                >
                  <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar
              //alt={token.split("#")[0]} 
              src="/static/images/avatar/2.jpg"
                      sx={{ width: shouldDrawerOpen ? 60 : 40, height: shouldDrawerOpen ? 60 : 40 }}
                    />
                  </StyledBadge>
                </Box>
                {
                  shouldDrawerOpen &&
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>User : {Cookies.get('user')}</Typography>
                  </Box>
                }
              </>
            } */}
            {/* {
              shouldDrawerOpen &&
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>User : {Cookies.get('user')}</Typography>
              </Box>
            } */}
            <Box sx={{ overflowY: 'auto', flex: 1, marginLeft: shouldDrawerOpen ? 0 : -3, marginRight: shouldDrawerOpen ? 0 : -3 }}>
              {(
                showBasicData &&
                <>
                  <List
                    sx={
                      !open ? {
                        backgroundColor: "gray",
                        color: theme.palette.primary.contrastText,
                      }
                        : {
                          marginTop: -1
                        }
                    }
                  >
                    <Collapse in={!openData} unmountOnExit={false}>
                      {
                        open &&
                        <ListItem
                          key={"ข้อมูล"}
                          disablePadding
                          sx={{
                            height: 40, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            onClick={() => setOpenData(true)}
                            sx={{
                              height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                              px: 2,      // padding แนวนอน
                            }}
                          >
                            {/* ไอคอนซ้าย */}
                            <ListItemIcon sx={{ minWidth: 30, color: theme.palette.dark }}>
                              <BadgeIcon />
                            </ListItemIcon>

                            {/* ข้อความ */}
                            <ListItemText
                              primary="ข้อมูลทั่วไป"
                              primaryTypographyProps={{
                                fontSize: "16px",
                              }}
                              sx={{
                                marginLeft: 1,
                              }}
                            />

                            {/* ไอคอนขวา */}
                            <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.dark }}>
                              <KeyboardArrowDownIcon />
                            </ListItemIcon>
                          </ListItemButton>

                        </ListItem>
                      }
                    </Collapse>
                    <Collapse in={openData} unmountOnExit={false}>
                      {
                        open &&
                        <ListItem
                          key={"ข้อมูล"}
                          disablePadding
                          sx={{
                            height: 40, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            onClick={() => setOpenData(false)}
                            sx={{
                              height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                              px: 2,      // padding แนวนอน
                            }}
                          >
                            {/* ไอคอนซ้าย */}
                            <ListItemIcon sx={{ minWidth: 30, color: theme.palette.dark }}>
                              <BadgeIcon />
                            </ListItemIcon>

                            {/* ข้อความ */}
                            <ListItemText
                              primary="ข้อมูลทั่วไป"
                              primaryTypographyProps={{
                                fontSize: "16px",
                              }}
                              sx={{
                                marginLeft: 1,
                              }}
                            />

                            {/* ไอคอนขวา */}
                            <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.dark }}>
                              <KeyboardArrowUpIcon />
                            </ListItemIcon>
                          </ListItemButton>

                        </ListItem>
                      }
                    </Collapse>
                    <Collapse in={!openData} unmountOnExit={false}>
                      {["หน้าหลัก", "พนักงาน", "รถบรรทุก", "รถรับจ้างขนส่ง", "คลังรับน้ำมัน", "ตั๋วน้ำมัน", "ลูกค้ารับจ้างขนส่ง", "ลูกค้ารถใหญ่", "ลูกค้ารถเล็ก", "เจ้าหนี้น้ำมัน", "รายได้รายหัก", "รายการค่าใช้จ่าย", "บริษัทที่สั่งจ่าย"].map((text, index) => (
                        <ListItem
                          key={text}
                          disablePadding
                          sx={{
                            backgroundColor: show1 === index && "gray",
                            height: 35, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            onClick={() => {
                              setShow1(index);
                              setSetting(false);
                              setShow2(null);
                              setShow3(null);
                              setShow4(null);
                              setShow5(null);
                              const path =
                                index === 0 ? "/dashboard"
                                  : index === 1 ? "/employee"
                                    : index === 2 ? "/trucks"
                                      : index === 3 ? "/trucks-transport"
                                        : index === 4 ? "/depots"
                                          : index === 5 ? "/ticket"
                                            : index === 6 ? "/transports"
                                              : index === 7 ? "/customer-bigtrucks"
                                                : index === 8 ? "/customer-smalltrucks"
                                                  : index === 9 ? "/creditor"
                                                    : index === 10 ? "/deductible-income"
                                                      : index === 11 ? "/expense-items"
                                                        : "/company-payment";

                              setPendingPath(path); // ขอไปหน้านั้น
                            }}
                          >
                            {
                              shouldDrawerOpen ?
                                <ListItemIcon
                                  sx={{
                                    color: !open || show1 === index ? theme.palette.primary.contrastText : theme.palette.dark,
                                    mr: !open || show1 === index ? -3 : -2,
                                    ml: !open || show1 === index ? 3 : 2,
                                  }}
                                >
                                  {index === 0 ? (
                                    <HomeIcon />
                                  ) : index === 1 ? (
                                    <AccountCircleIcon />
                                  ) : index === 2 ? (
                                    <LocalShippingIcon />
                                  ) : index === 3 ? (
                                    <LocalShippingOutlinedIcon />
                                  ) : index === 4 ? (
                                    <WarehouseIcon />
                                  ) : index === 5 ? (
                                    <ConfirmationNumberIcon />
                                  ) : index === 6 ? (
                                    <HandshakeIcon />
                                  ) : index === 7 ? (
                                    <GroupsIcon />
                                  ) : index === 8 ? (
                                    <Groups2Icon />
                                  ) : index === 9 ? (
                                    <CurrencyExchangeIcon />
                                  ) : index === 10 ? (
                                    <ReceiptLongIcon />
                                  ) : index === 11 ? (
                                    <PaymentsIcon />
                                  ) : (
                                    <ApartmentIcon />
                                  )}
                                </ListItemIcon>
                                :
                                <Tooltip
                                  title={text}
                                  placement="right"
                                  PopperProps={{
                                    modifiers: [
                                      {
                                        name: 'offset',
                                        options: {
                                          offset: [0, -25], // ขยับ tooltip เข้าไปทางซ้าย (ติด icon มากขึ้น)
                                        },
                                      },
                                    ],
                                  }}
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        fontSize: '15px', // ปรับขนาดตัวอักษร
                                        textAlign: 'left', // จัดข้อความชิดซ้าย
                                        backgroundColor: theme.palette.panda.dark,
                                      },
                                    },
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{
                                      color: !open || show1 === index ? theme.palette.primary.contrastText : theme.palette.dark,
                                      mr: !open || show1 === index ? -3 : -2,
                                      ml: !open || show1 === index ? 3 : 2,
                                    }}
                                  >
                                    {index === 0 ? (
                                      <HomeIcon />
                                    ) : index === 1 ? (
                                      <AccountCircleIcon />
                                    ) : index === 2 ? (
                                      <LocalShippingIcon />
                                    ) : index === 3 ? (
                                      <LocalShippingOutlinedIcon />
                                    ) : index === 4 ? (
                                      <WarehouseIcon />
                                    ) : index === 5 ? (
                                      <ConfirmationNumberIcon />
                                    ) : index === 6 ? (
                                      <HandshakeIcon />
                                    ) : index === 7 ? (
                                      <GroupsIcon />
                                    ) : index === 8 ? (
                                      <Groups2Icon />
                                    ) : index === 9 ? (
                                      <CurrencyExchangeIcon />
                                    ) : index === 10 ? (
                                      <ReceiptLongIcon />
                                    ) : index === 11 ? (
                                      <PaymentsIcon />
                                    ) : (
                                      <ApartmentIcon />
                                    )}
                                  </ListItemIcon>
                                </Tooltip>
                            }
                            <ListItemText
                              primary={shouldDrawerOpen ? text : ""}
                              sx={{
                                color: show1 === index && theme.palette.primary.contrastText, fontSize: "15px"
                              }}
                              primaryTypographyProps={{
                                fontSize: "14px", // กำหนดขนาดตัวอักษรที่นี่

                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </Collapse>
                  </List>
                </>
              )}
              {(
                showOperation &&
                <>
                  <Divider sx={{ marginTop: -1, marginBottom: 1, border: `1px solid ${theme.palette.success.main}` }} />
                  <List
                    sx={
                      !open ? {
                        backgroundColor: theme.palette.success.main,
                        color: theme.palette.primary.contrastText,
                      }
                        : {
                          marginTop: -1
                        }
                    }
                  >
                    <Collapse in={!operation} unmountOnExit={false}>
                      {
                        open &&
                        <ListItem
                          key={"ข้อมูล"}
                          disablePadding
                          sx={{
                            height: 40, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            onClick={() => setOperation(true)}
                            sx={{
                              height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                              px: 2,      // padding แนวนอน
                            }}
                          >
                            {/* ไอคอนซ้าย */}
                            <ListItemIcon sx={{ minWidth: 30, color: theme.palette.success.main }}>
                              <ContactPageIcon />
                            </ListItemIcon>

                            {/* ข้อความ */}
                            <ListItemText
                              primary="ปฎิบัติงาน"
                              primaryTypographyProps={{
                                fontSize: "16px",
                              }}
                              sx={{
                                marginLeft: 1,
                              }}
                            />

                            {/* ไอคอนขวา */}
                            <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.success.main }}>
                              <KeyboardArrowDownIcon />
                            </ListItemIcon>
                          </ListItemButton>

                        </ListItem>
                      }
                    </Collapse>
                    <Collapse in={operation} unmountOnExit={false}>
                      {
                        open &&
                        <ListItem
                          key={"ปฎิบัติงาน"}
                          disablePadding
                          sx={{
                            height: 40, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            onClick={() => setOperation(false)}
                            sx={{
                              height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                              px: 2,      // padding แนวนอน
                            }}
                          >
                            {/* ไอคอนซ้าย */}
                            <ListItemIcon sx={{ minWidth: 30, color: theme.palette.success.main }}>
                              <ContactPageIcon />
                            </ListItemIcon>

                            {/* ข้อความ */}
                            <ListItemText
                              primary="ปฎิบัติงาน"
                              primaryTypographyProps={{
                                fontSize: "16px",
                              }}
                              sx={{
                                marginLeft: 1,
                              }}
                            />

                            {/* ไอคอนขวา */}
                            <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.success.main }}>
                              <KeyboardArrowUpIcon />
                            </ListItemIcon>
                          </ListItemButton>

                        </ListItem>
                      }
                    </Collapse>
                    <Collapse in={!operation} unmountOnExit={false}>
                      {["สต็อกหน้าลาน", "รายงานสต๊อก", "เที่ยววิ่งรถใหญ่"].map((text, index) => (
                        <ListItem
                          key={text}
                          disablePadding
                          sx={{
                            backgroundColor: show2 === index && theme.palette.success.main,
                            height: 35, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            component={Link}
                            to={
                              index === 0 ? "/gasstations" : index === 1 ? "/report-gasstations" : "/trips-bigtruck"
                            }
                            sx={{
                              height: 35, // กำหนดความสูงให้ ListItem
                            }}
                            onClick={() => (setShow2(index), setSetting(false))}
                            onMouseUp={() => (setShow2(index), setSetting(false))}
                            onMouseDown={() => (setShow1(null), setShow3(null), setShow4(null), setShow5(null))}
                          >
                            {
                              shouldDrawerOpen ?
                                <ListItemIcon
                                  sx={{
                                    color: !open || show2 === index ? theme.palette.primary.contrastText : theme.palette.success.main,
                                    mr: !open || show2 === index ? -3 : -2,
                                    ml: !open || show2 === index ? 3 : 2,
                                  }}
                                >
                                  {index === 0 ? (
                                    <LocalGasStationIcon />
                                  ) :
                                    index === 1 ? (
                                      <LocalGasStationIcon />
                                    )
                                      :
                                      (
                                        <ModeOfTravelIcon />
                                      )}
                                </ListItemIcon>
                                :
                                <Tooltip
                                  title={text}
                                  placement="right"
                                  PopperProps={{
                                    modifiers: [
                                      {
                                        name: 'offset',
                                        options: {
                                          offset: [0, -25], // ขยับ tooltip เข้าไปทางซ้าย (ติด icon มากขึ้น)
                                        },
                                      },
                                    ],
                                  }}
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        fontSize: '15px', // ปรับขนาดตัวอักษร
                                        textAlign: 'left', // จัดข้อความชิดซ้าย
                                        backgroundColor: theme.palette.success.dark,
                                      },
                                    },
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{
                                      color: !open || show2 === index ? theme.palette.primary.contrastText : theme.palette.success.main,
                                      mr: !open || show2 === index ? -3 : -2,
                                      ml: !open || show2 === index ? 3 : 2,
                                    }}
                                  >
                                    {index === 0 ? (
                                      <LocalGasStationIcon />
                                    ) : (
                                      <ModeOfTravelIcon />
                                    )}
                                  </ListItemIcon>
                                </Tooltip>
                            }
                            <ListItemText
                              primary={shouldDrawerOpen ? text : ""}
                              sx={{
                                color: show2 === index && theme.palette.primary.contrastText, fontSize: "15px"
                              }}
                              primaryTypographyProps={{
                                fontSize: "14px", // กำหนดขนาดตัวอักษรที่นี่

                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </Collapse>
                  </List>
                </>
              )}
              {(
                showFinancial &&
                <>
                  <Divider sx={{ marginTop: -1, marginBottom: 1, border: `1px solid ${theme.palette.yellow.dark}` }} />
                  <Collapse in={!financial} unmountOnExit={false}>
                    {
                      open &&
                      <ListItem
                        key={"การชำระเงิน"}
                        disablePadding
                        sx={{
                          height: 40, // กำหนดความสูงให้ ListItem
                          paddingY: 1,
                        }}
                      >
                        <ListItemButton
                          onClick={() => setFinacieal(true)}
                          sx={{
                            height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                          }}
                        >
                          {/* ไอคอนซ้าย */}
                          <ListItemIcon sx={{ minWidth: 30, color: theme.palette.yellow.dark }}>
                            <PaidIcon />
                          </ListItemIcon>

                          {/* ข้อความ */}
                          <ListItemText
                            primary="การชำระเงิน"
                            primaryTypographyProps={{
                              fontSize: "16px",
                            }}
                            sx={{
                              marginLeft: 1,
                            }}
                          />

                          {/* ไอคอนขวา */}
                          <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.yellow.dark }}>
                            <KeyboardArrowDownIcon />
                          </ListItemIcon>
                        </ListItemButton>

                      </ListItem>
                    }
                  </Collapse>
                  <Collapse in={financial} unmountOnExit={false}>
                    {
                      open &&
                      <ListItem
                        key={"การชำระเงิน"}
                        disablePadding
                        sx={{
                          height: 40, // กำหนดความสูงให้ ListItem
                          paddingY: 1,
                        }}
                      >
                        <ListItemButton
                          onClick={() => setFinacieal(false)}
                          sx={{
                            height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                          }}
                        >
                          {/* ไอคอนซ้าย */}
                          <ListItemIcon sx={{ minWidth: 30, color: theme.palette.yellow.dark }}>
                            <PaidIcon />
                          </ListItemIcon>

                          {/* ข้อความ */}
                          <ListItemText
                            primary="การชำระเงิน"
                            primaryTypographyProps={{
                              fontSize: "16px",
                            }}
                            sx={{
                              marginLeft: 1,
                            }}
                          />

                          {/* ไอคอนขวา */}
                          <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.yellow.dark }}>
                            <KeyboardArrowUpIcon />
                          </ListItemIcon>
                        </ListItemButton>

                      </ListItem>
                    }
                  </Collapse>
                  <List
                    sx={
                      !open ? {
                        backgroundColor: theme.palette.yellow.dark,
                        color: theme.palette.primary.contrastText,
                      }
                        : {
                          marginTop: -1
                        }
                    }
                  >
                    <Collapse in={!financial} unmountOnExit={false}>
                      {["ชำระค่าน้ำมัน", "ชำระค่าขนส่ง"].map((text, index) => (
                        <ListItem
                          key={text}
                          disablePadding
                          sx={{
                            backgroundColor: show3 === index && theme.palette.yellow.dark,
                            height: 35, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            component={Link}
                            to={
                              index === 0 ? "/invoice" : "/report"
                            }
                            sx={{
                              height: 35, // กำหนดความสูงให้ ListItem
                            }}
                            onClick={() => (setShow3(index), setSetting(false))}
                            onMouseUp={() => (setShow3(index), setSetting(false))}
                            onMouseDown={() => (setShow1(null), setShow2(null), setShow4(null), setShow5(null))}
                          >
                            {
                              shouldDrawerOpen ?
                                <ListItemIcon
                                  sx={{
                                    color: !open || show3 === index ? theme.palette.primary.contrastText : theme.palette.yellow.dark,
                                    mr: !open || show3 === index ? -3 : -2,
                                    ml: !open || show3 === index ? 3 : 2,
                                  }}
                                >
                                  {index === 0 ? (
                                    <PaidIcon />
                                  ) : (
                                    <PaidIcon />
                                  )}
                                </ListItemIcon>
                                :
                                <Tooltip
                                  title={text}
                                  placement="right"
                                  PopperProps={{
                                    modifiers: [
                                      {
                                        name: 'offset',
                                        options: {
                                          offset: [0, -25], // ขยับ tooltip เข้าไปทางซ้าย (ติด icon มากขึ้น)
                                        },
                                      },
                                    ],
                                  }}
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        fontSize: '15px', // ปรับขนาดตัวอักษร
                                        textAlign: 'left', // จัดข้อความชิดซ้าย
                                        backgroundColor: theme.palette.yellow.dark
                                      },
                                    },
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{
                                      color: !open || show3 === index ? theme.palette.primary.contrastText : theme.palette.yellow.dark,
                                      mr: !open || show3 === index ? -3 : -2,
                                      ml: !open || show3 === index ? 3 : 2,
                                    }}
                                  >
                                    {index === 0 ? (
                                      <PaidIcon />
                                    ) : (
                                      <PaidIcon />
                                    )}
                                  </ListItemIcon>
                                </Tooltip>
                            }
                            <ListItemText
                              primary={shouldDrawerOpen ? text : ""}
                              sx={{
                                color: show3 === index && theme.palette.primary.contrastText, fontSize: "15px"
                              }}
                              primaryTypographyProps={{
                                fontSize: "14px", // กำหนดขนาดตัวอักษรที่นี่

                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </Collapse>
                  </List>
                </>
              )}
              {(
                showReport &&
                <>
                  <Divider sx={{ marginTop: -1, marginBottom: 1, border: `1px solid ${theme.palette.info.main}` }} />
                  <Collapse in={!report} unmountOnExit={false}>
                    {
                      open &&
                      <ListItem
                        key={"รายงาน"}
                        disablePadding
                        sx={{
                          height: 40, // กำหนดความสูงให้ ListItem
                          paddingY: 1,
                        }}
                      >
                        <ListItemButton
                          onClick={() => setReport(true)}
                          sx={{
                            height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                          }}
                        >
                          {/* ไอคอนซ้าย */}
                          <ListItemIcon sx={{ minWidth: 30, color: theme.palette.info.main }}>
                            <SummarizeIcon />
                          </ListItemIcon>

                          {/* ข้อความ */}
                          <ListItemText
                            primary="รายงาน"
                            primaryTypographyProps={{
                              fontSize: "16px",
                            }}
                            sx={{
                              marginLeft: 1,
                            }}
                          />

                          {/* ไอคอนขวา */}
                          <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.info.main }}>
                            <KeyboardArrowDownIcon />
                          </ListItemIcon>
                        </ListItemButton>

                      </ListItem>
                    }
                  </Collapse>
                  <Collapse in={report} unmountOnExit={false}>
                    {
                      open &&
                      <ListItem
                        key={"รายงาน"}
                        disablePadding
                        sx={{
                          height: 40, // กำหนดความสูงให้ ListItem
                          paddingY: 1,
                        }}
                      >
                        <ListItemButton
                          onClick={() => setReport(false)}
                          sx={{
                            height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                          }}
                        >
                          {/* ไอคอนซ้าย */}
                          <ListItemIcon sx={{ minWidth: 30, color: theme.palette.info.main }}>
                            <SummarizeIcon />
                          </ListItemIcon>

                          {/* ข้อความ */}
                          <ListItemText
                            primary="รายงาน"
                            primaryTypographyProps={{
                              fontSize: "16px",
                            }}
                            sx={{
                              marginLeft: 1,
                            }}
                          />

                          {/* ไอคอนขวา */}
                          <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.info.main }}>
                            <KeyboardArrowUpIcon />
                          </ListItemIcon>
                        </ListItemButton>

                      </ListItem>
                    }
                  </Collapse>
                  <List
                    sx={
                      !open ? {
                        backgroundColor: theme.palette.info.main,
                        color: theme.palette.primary.contrastText,
                      }
                        : {
                          marginTop: -1
                        }
                    }
                  >
                    <Collapse in={!report} unmountOnExit={false}>
                      {["สรุปยอดส่งน้ำมัน", "สรุปค่าเที่ยว", "การชำระค่าน้ำมัน", "การชำระค่าขนส่ง", "ค่าใช้จ่าย", "เงินเดือน", "ปิดงบบัญชีการเงิน", "กำไรขายส่งน้ำมัน"].map((text, index) => (
                        <ListItem
                          key={text}
                          disablePadding
                          sx={{
                            backgroundColor: show4 === index && theme.palette.info.main,
                            height: 35, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            component={Link}
                            to={
                              index === 0 ? "/summary-oil-balance" : index === 1 ? "/report-driver-trip" : index === 2 ? "/report-fuel-payment" : index === 3 ? "/report-transport-payment" : index === 4 ? "/expenses" : index === 5 ? "/salary" : index === 6 ? "/close-financial" : "/profit-loss"
                            }
                            state={{ opennavbar: open }}   // 👈 ส่ง state แบบนี้
                            sx={{
                              height: 35, // กำหนดความสูงให้ ListItem
                            }}
                            onClick={() => (setShow4(index), setSetting(false))}
                            onMouseUp={() => (setShow4(index), setSetting(false))}
                            onMouseDown={() => (setShow1(null), setShow2(null), setShow3(null), setShow5(null))}
                          >
                            {
                              shouldDrawerOpen ?
                                <ListItemIcon
                                  sx={{
                                    color: !open || show4 === index ? theme.palette.primary.contrastText : theme.palette.info.main,
                                    mr: !open || show4 === index ? -3 : -2,
                                    ml: !open || show4 === index ? 3 : 2,
                                  }}
                                >
                                  {index === 0 ? (
                                    <SummarizeIcon />
                                  ) : (
                                    <SummarizeIcon />
                                  )}
                                </ListItemIcon>
                                :
                                <Tooltip
                                  title={text}
                                  placement="right"
                                  PopperProps={{
                                    modifiers: [
                                      {
                                        name: 'offset',
                                        options: {
                                          offset: [0, -25], // ขยับ tooltip เข้าไปทางซ้าย (ติด icon มากขึ้น)
                                        },
                                      },
                                    ],
                                  }}
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        fontSize: '15px', // ปรับขนาดตัวอักษร
                                        textAlign: 'left', // จัดข้อความชิดซ้าย
                                        backgroundColor: theme.palette.info.main,
                                      },
                                    },
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{
                                      color: !open || show4 === index ? theme.palette.primary.contrastText : theme.palette.info.main,
                                      mr: !open || show4 === index ? -3 : -2,
                                      ml: !open || show4 === index ? 3 : 2,
                                    }}
                                  >
                                    {index === 0 ? (
                                      <SummarizeIcon />
                                    ) : (
                                      <SummarizeIcon />
                                    )}
                                  </ListItemIcon>
                                </Tooltip>
                            }
                            <ListItemText
                              primary={shouldDrawerOpen ? text : ""}
                              sx={{
                                color: show4 === index && theme.palette.primary.contrastText, fontSize: "15px"
                              }}
                              primaryTypographyProps={{
                                fontSize: "14px", // กำหนดขนาดตัวอักษรที่นี่

                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </Collapse>
                  </List>
                </>
              )}
              {(
                showSmallTruck &&
                <>
                  <Divider sx={{ marginTop: -1, marginBottom: 1, border: `1px solid ${theme.palette.pink.main}` }} />
                  <Collapse in={!trucksmall} unmountOnExit={false}>
                    {
                      open &&
                      <ListItem
                        key={"รถเล็ก"}
                        disablePadding
                        sx={{
                          height: 40, // กำหนดความสูงให้ ListItem
                          paddingY: 1,
                        }}
                      >
                        <ListItemButton
                          onClick={() => setTrucksmall(true)}
                          sx={{
                            height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                          }}
                        >
                          {/* ไอคอนซ้าย */}
                          <ListItemIcon sx={{ minWidth: 30, color: theme.palette.pink.main }}>
                            <LocalShippingIcon />
                          </ListItemIcon>

                          {/* ข้อความ */}
                          <ListItemText
                            primary="รถเล็ก"
                            primaryTypographyProps={{
                              fontSize: "16px",
                            }}
                            sx={{
                              marginLeft: 1,
                            }}
                          />

                          {/* ไอคอนขวา */}
                          <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.pink.main }}>
                            <KeyboardArrowDownIcon />
                          </ListItemIcon>
                        </ListItemButton>

                      </ListItem>
                    }
                  </Collapse>
                  <Collapse in={trucksmall} unmountOnExit={false}>
                    {
                      open &&
                      <ListItem
                        key={"รถเล็ก"}
                        disablePadding
                        sx={{
                          height: 40, // กำหนดความสูงให้ ListItem
                          paddingY: 1,
                        }}
                      >
                        <ListItemButton
                          onClick={() => setTrucksmall(false)}
                          sx={{
                            height: 40, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                          }}
                        >
                          {/* ไอคอนซ้าย */}
                          <ListItemIcon sx={{ minWidth: 30, color: theme.palette.pink.main }}>
                            <LocalShippingIcon />
                          </ListItemIcon>

                          {/* ข้อความ */}
                          <ListItemText
                            primary="รถเล็ก"
                            primaryTypographyProps={{
                              fontSize: "16px",
                            }}
                            sx={{
                              marginLeft: 1,
                            }}
                          />

                          {/* ไอคอนขวา */}
                          <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.pink.main }}>
                            <KeyboardArrowUpIcon />
                          </ListItemIcon>
                        </ListItemButton>

                      </ListItem>
                    }
                  </Collapse>
                  <List
                    sx={
                      !open ? {
                        backgroundColor: theme.palette.pink.main,
                        color: theme.palette.primary.contrastText,
                      }
                        : {
                          marginTop: -1
                        }
                    }
                  >
                    <Collapse in={!trucksmall} unmountOnExit={false}>
                      {["จัดเที่ยววิ่ง", "ชำระค่าน้ำมัน", "สรุปยอดน้ำมัน", "รายงานชำระน้ำมัน", "รายงานเที่ยววิ่ง", "ปิดงบบัญชีการเงิน", "กำไรขายส่งน้ำมัน"].map((text, index) => (
                        <ListItem
                          key={text}
                          disablePadding
                          sx={{
                            backgroundColor: show5 === index && theme.palette.pink.main,
                            height: 35, // กำหนดความสูงให้ ListItem
                            paddingY: 1,
                          }}
                        >
                          <ListItemButton
                            component={Link}
                            to={
                              index === 0 ? "/trips-smalltruck" : index === 1 ? "/invoice-smalltruck" : index === 2 ? "/oil-balance-smalltruck" : index === 3 ? "/payment-smalltruck" : index === 4 ? "/report-smalltruck": index === 5 ? "/close-financial-smalltruck" : "/profit-loss-smalltruck"
                            }
                            sx={{
                              height: 35, // กำหนดความสูงให้ ListItem
                            }}
                            onClick={() => (setShow5(index), setSetting(false))}
                            onMouseUp={() => (setShow5(index), setSetting(false))}
                            onMouseDown={() => (setShow1(null), setShow2(null), setShow3(null), setShow4(null))}
                          >
                            {
                              shouldDrawerOpen ?
                                <ListItemIcon
                                  sx={{
                                    color: !open || show5 === index ? theme.palette.primary.contrastText : theme.palette.pink.main,
                                    mr: !open || show5 === index ? -3 : -2,
                                    ml: !open || show5 === index ? 3 : 2,
                                  }}
                                >
                                  {index === 0 ? (
                                    <ModeOfTravelIcon />
                                  ) : index === 1 ? (
                                    <PaidIcon />
                                  ) : (
                                    <SummarizeIcon />
                                  )}
                                </ListItemIcon>
                                :
                                <Tooltip
                                  title={text}
                                  placement="right"
                                  PopperProps={{
                                    modifiers: [
                                      {
                                        name: 'offset',
                                        options: {
                                          offset: [0, -25], // ขยับ tooltip เข้าไปทางซ้าย (ติด icon มากขึ้น)
                                        },
                                      },
                                    ],
                                  }}
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        fontSize: '15px', // ปรับขนาดตัวอักษร
                                        textAlign: 'left', // จัดข้อความชิดซ้าย
                                        backgroundColor: theme.palette.pink.light,
                                      },
                                    },
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{
                                      color: !open || show5 === index ? theme.palette.primary.contrastText : theme.palette.pink.main,
                                      mr: !open || show5 === index ? -3 : -2,
                                      ml: !open || show5 === index ? 3 : 2,
                                    }}
                                  >
                                    {index === 0 ? (
                                      <SummarizeIcon />
                                    ) : (
                                      <SummarizeIcon />
                                    )}
                                  </ListItemIcon>
                                </Tooltip>
                            }
                            <ListItemText
                              primary={shouldDrawerOpen ? text : ""}
                              sx={{
                                color: show5 === index && theme.palette.primary.contrastText, fontSize: "15px"
                              }}
                              primaryTypographyProps={{
                                fontSize: "14px", // กำหนดขนาดตัวอักษรที่นี่

                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </Collapse>
                  </List>
                </>

              )}
            </Box>
          </Drawer >
      }
    </>
  );
}
