import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from '@mui/icons-material/AddBox';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { apiPost } from "../../server/apiClient";
import theme from "../../theme/theme";
import { IconButtonError, TablecellSelling } from "../../theme/style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertTypeDeduction from "./InsertTypeDeduction";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull } from "../../theme/DateTH";

const InsertDeducetionIncome = ({ year, periodData, periods }) => {
    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("");
    const [check, setCheck] = useState(true); // true = รายได้, false = รายหัก
    const [incomeRows, setIncomeRows] = useState([{ type: null, money: 0 }]);
    const [deductRows, setDeductRows] = useState([{ type: null, money: 0 }]);
    const [errors, setErrors] = useState({
        driver: false,
        period: false,
        note: false,
        rows: [] // error ของแต่ละ row
    });

    // reset เวลาเปลี่ยนประเภท
    useEffect(() => {
        if (check) {
            setIncomeRows([{ type: null, money: 0 }]);
        } else {
            setDeductRows([{ type: null, money: 0 }]);
        }
    }, [check]);

    const handleAddRow = () => {
        if (check) {
            setIncomeRows([...incomeRows, { type: null, money: 0 }]);
        } else {
            setDeductRows([...deductRows, { type: null, money: 0 }]);
        }
    };

    const handleRemoveRow = (index, isIncome) => {
        if (isIncome) {
            const updated = [...incomeRows];
            updated.splice(index, 1);
            setIncomeRows(updated);
        } else {
            const updated = [...deductRows];
            updated.splice(index, 1);
            setDeductRows(updated);
        }
    };
    const [period, setPeriod] = React.useState(periodData || 1);
    const [selectedDate, setSelectedDate] = useState(year || dayjs());

    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setSelectedDate(newValue);
        }
    };
    const { drivers, deductibleincome, reghead, small } = useBasicData();
    const { reportFinancial, refetch: refetchTripData } = useTripData();

    const sortByDriver = (a, b) => {
        const driverA = a?.Name
        const driverB = b?.Name

        return driverA.localeCompare(driverB, "th");
    };

    const regheadSorted = Object.values(drivers)
        .filter((item) => item.TruckType === "รถใหญ่")
        .map((item) => {
            const tail = Object.values(reghead).find((t) => t.uuid === item.Registration);
            return {
                ...item,
                RegTail: tail ? tail.RegTail : "",  // ถ้าเจอใน reghead → ดึงค่า RegTail จริง, ถ้าไม่เจอ → ค่าว่าง
                RegTailName: tail ? tail.RegTailName : "",
            };
        })
        .sort(sortByDriver);

    const smallSorted = Object.values(drivers)
        .filter((item) => item.TruckType === "รถเล็ก")
        .map((item) => {
            const smallD = Object.values(small).find((t) => t.uuid === item.Registration);
            return {
                ...item,
                RegTail: smallD ? smallD.RegTail : "",  // ถ้าเจอใน reghead → ดึงค่า RegTail จริง, ถ้าไม่เจอ → ค่าว่าง
                ShortName: smallD ? smallD.ShortName : "",
            };
        })
        .sort(sortByDriver);


    const driverDetail = [...regheadSorted, ...smallSorted];

    const deductibleincomeDetail = Object.values(deductibleincome);
    const reportFinancialDetail = Object.values(reportFinancial);
    const [result, setResult] = useState(false);
    const [driver, setDriver] = useState("");
    const [income, setIncome] = useState("");
    const [deduction, setDeduction] = useState("");
    const [note, setNote] = useState("");
    const [money, setMoney] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleReceiveData = (data) => {
        setResult(data);
    };

    const handleClickOpen = () => {
        setOpen(true);
        setPeriod(periodData);
        setSelectedDate(year);
    };

    const handleClose = () => {
        setOpen(false);
        setPeriod(periodData);
        setSelectedDate(year);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const validateBeforeSave = (rows) => {
        let hasError = false;

        const newErrors = {
            driver: false,
            period: false,
            note: false,
            rows: rows.map(() => ({ type: false, money: false }))
        };

        // ✅ ตรวจ driver
        if (!driver || !driver.id) {
            newErrors.driver = true;
            hasError = true;
        }

        // ✅ ตรวจ period
        if (!period || String(period).trim() === "") {
            newErrors.period = true;
            hasError = true;
        }

        if (!note || note.trim() === "") {
            newErrors.note = true;
            hasError = true;
        }

        // ✅ ตรวจแต่ละ row
        rows.forEach((row, index) => {
            if (!row.type) {
                newErrors.rows[index].type = true;
                hasError = true;
            }

            if (row.money === "" || row.money === null || Number(row.money) === 0) {
                newErrors.rows[index].money = true;
                hasError = true;
            }
        });

        setErrors(newErrors);
        return !hasError;
    };

    const handlePost = async () => {
        // เลือกว่าจะใช้ incomeRows หรือ deductRows
        const rows = check ? incomeRows : deductRows;

        if (!rows || rows.length === 0) {
            ShowError("ไม่มีข้อมูลสำหรับบันทึก");
            return;
        }

        if (!validateBeforeSave(rows)) return;

        const isBigTruck = driver?.TruckType === "รถใหญ่";

        const updates = rows.map((row, index) => {
            const newId = reportFinancialDetail.length + index; // ให้ id ต่อเนื่อง

            return {
                id: newId,
                Year: selectedDate.format("YYYY"),
                Period: period,
                Date: dayjs(new Date()).format("DD/MM/YYYY"),
                Driver: driver?.uuid,
                DriverName: driver?.Name,
                RegHead: isBigTruck ? (driver?.Registration || null) : null,
                RegHeadName: isBigTruck ? (driver?.RegistrationName || "ไม่มี") : "ไม่มี",
                RegTail: isBigTruck ? (driver?.RegTail || null) : null,
                RegTailName: isBigTruck ? (driver?.RegTailName || "ไม่มี") : "",
                Code: row.type.Code, // ใช้ Code ของ row ถ้ามี ไม่งั้นใช้ type.Code
                Name: `${row.type.id}:${row.type.Name}`, // ใช้ Name ของ row
                Type: check ? "รายได้" : "รายหัก",
                VehicleType: driver?.TruckType,
                ShortName: driver?.ShortName || "",
                Money: row.money, // เงินจาก row
                Note: note,
                Status: "อยู่ในระบบ"
            };
        });

        try {
            await Promise.all(
                updates.map((data) => apiPost("/api/report_financial", data))
            );

            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            refetchTripData?.();

            setDriver("");
            setType("");
            setNote("");
            setMoney(0);
            if (check) {
                setIncomeRows([{ type: null, money: 0 }]);
            } else {
                setDeductRows([{ type: null, money: 0 }]);
            }
        } catch (error) {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
        }
    };

    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                size="small"
                sx={{
                    fontSize: "14px",
                    fontWeight: "bold"
                }}
                onClick={handleClickOpen}
            >
                เพิ่มรายได้รายหัก
            </Button>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleClose}
                maxWidth="sm"
                sx={
                    !result ?
                        {
                            zIndex: 1200,
                        }
                        :
                        {
                            '& .MuiDialog-container': {
                                justifyContent: 'flex-start', // 👈 ชิดซ้าย
                                alignItems: 'center',
                                width: "800px",
                                marginLeft: windowWidth <= 900 ? 0 : 15
                            },
                            zIndex: 1200,
                        }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >เพิ่มรายได้รายหักของพนักงานขับรถ</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Grid container spacing={2} marginTop={1} marginBottom={1}>
                        {
                            windowWidth >= 900 && <Grid item md={6} sx={12} />
                        }
                        <Grid item md={6} xs={12} display="flex" alignItems="center" justifyContent="right" >
                            <Tooltip title="เพิ่มประเภท" placement="top">
                                <InsertTypeDeduction onSend={handleReceiveData} />
                            </Tooltip>
                        </Grid>
                        <Grid item md={6} xs={12} >
                            <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>งวดการจ่ายปี</Typography>
                                <Paper sx={{ width: "100%" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                        <DatePicker
                                            openTo="year"
                                            views={["year"]}
                                            value={selectedDate}
                                            format="YYYY"
                                            onChange={handleDateChangeDate}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: selectedDate ? selectedDate.format("YYYY") : "",
                                                        readOnly: true,
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center" width="100%" >
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: { md: 0, xs: 3 } }} gutterBottom>ลำดับงวด</Typography>
                                <Paper sx={{ width: "100%" }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        value={period}
                                        onChange={(e) => setPeriod(Number(e.target.value))}
                                        size="small"
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12} >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -2 }}>
                                {
                                    periods
                                        .filter((p) => p.no === period)
                                        .map((p) => (
                                            <Typography key={p.id} variant="subtitle1" fontWeight="bold" color="gray" sx={{ marginTop: 0.5, marginLeft: 1, }}>
                                                {`( วันที่ ${formatThaiFull(dayjs(p.start, "DD/MM/YYYY"))} - วันที่ ${formatThaiFull(dayjs(p.end, "DD/MM/YYYY"))} )`}
                                            </Typography>
                                        ))
                                }
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>พนักงานขับรถ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={driverDetail}
                                        getOptionLabel={(option) => {
                                            const driverD = option?.Name || "";

                                            let regHead = "";
                                            if (option?.Registration !== "0:ไม่มี") {
                                                regHead = option?.Registration?.includes(":")
                                                    ? option.RegistrationName
                                                    : option?.Registration || "";
                                            } else {
                                                regHead = "( ไม่ได้ผูกทะเบียนรถ )";
                                            }

                                            let regTail = "";
                                            if (option?.TruckType === "รถใหญ่") {
                                                if (option?.RegTail !== "0:ไม่มี") {
                                                    regTail = option.RegTail.includes(":")
                                                        ? `/${option.RegTailName}`
                                                        : `/${option.RegTail}`;
                                                } else {
                                                    regTail = "( ไม่ได้ผูกทะเบียนหาง )"
                                                }
                                            } else {
                                                regTail = ""
                                            }

                                            // ถ้าทั้งหมดไม่มีค่าเลย
                                            if (!driverD && !regHead && !regTail) return "";

                                            return `${driverD} ${regHead}${regTail}`.trim();
                                        }}
                                        value={driver}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setDriver(newValue);
                                            } else {
                                                setDriver(null);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!driver ? "เลือกพนักงานขับรถ" : ""}
                                                variant="outlined"
                                                size="small"
                                                error={errors.driver}
                                                helperText={errors.driver ? "กรุณาเลือกพนักงานขับรถ" : ""}
                                            />
                                        )}
                                        renderOption={(props, option) => {
                                            const driverD = option?.Name || "";

                                            let regHead = "";
                                            if (option?.Registration !== "0:ไม่มี") {
                                                regHead = option?.Registration?.includes(":")
                                                    ? option.RegistrationName
                                                    : option?.Registration || "";
                                            } else {
                                                regHead = "( ไม่ได้ผูกทะเบียนรถ )";
                                            }

                                            let regTail = "";
                                            if (option?.TruckType === "รถใหญ่") {
                                                if (option?.RegTail !== "0:ไม่มี") {
                                                    regTail = option.RegTail.includes(":")
                                                        ? `/${option.RegTailName}`
                                                        : `/${option.RegTail}`;
                                                } else {
                                                    regTail = "( ไม่ได้ผูกทะเบียนหาง )"
                                                }
                                            } else {
                                                regTail = ""
                                            }

                                            // ถ้าทั้งหมดไม่มีค่าเลย
                                            if (!driverD && !regHead && !regTail) {
                                                return (
                                                    <li {...props}>
                                                        <Typography fontSize="16px"></Typography>
                                                    </li>
                                                );
                                            }

                                            return (
                                                <li {...props}>
                                                    <Typography fontSize="16px">
                                                        {`${driverD} ${regHead}${regTail}`.trim()}
                                                    </Typography>
                                                </li>
                                            );
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <FormGroup row sx={{ marginTop: -1, marginBottom: -1 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                    textAlign="right"
                                    marginTop={1}
                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1 }}
                                    gutterBottom
                                >
                                    เลือกประเภท
                                </Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={check} />}
                                    label="รายได้"
                                    onClick={() => setCheck(true)}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={!check} />}
                                    label="รายหัก"
                                    onClick={() => setCheck(false)}
                                />
                            </FormGroup>
                        </Grid>
                        {check
                            ? incomeRows.map((row, index) => (
                                <React.Fragment key={index}>
                                    <Grid item md={7.5} xs={12}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                marginTop={1}
                                                sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 6.5 }}
                                                gutterBottom
                                            >
                                                รายได้
                                            </Typography>
                                            <Paper sx={{ width: "100%" }}>
                                                <Autocomplete
                                                    options={deductibleincomeDetail
                                                        .filter((row) => row.Type === "รายได้" && row.StatusData === "อยู่ในระบบ")
                                                        .sort((a, b) =>
                                                            (a?.Name || "").localeCompare(b?.Name || "", "th")
                                                        )}
                                                    getOptionLabel={(option) => option?.Name || ""}
                                                    value={row.type}
                                                    onChange={(e, newValue) => {
                                                        const updated = [...incomeRows];
                                                        updated[index].type = newValue;
                                                        setIncomeRows(updated);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={!row.type ? "เลือกรายได้" : ""}
                                                            variant="outlined"
                                                            size="small"
                                                            error={errors.rows[index]?.type}
                                                            helperText={errors.rows[index]?.type ? "เลือกประเภท" : ""}
                                                        />
                                                    )}
                                                />
                                            </Paper>
                                        </Box>
                                    </Grid>

                                    <Grid item md={3.5} xs={10}>
                                        <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginLeft: { md: 0, xs: 6 } }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                marginTop={1}
                                                sx={{ whiteSpace: "nowrap", marginRight: 1 }}
                                                gutterBottom
                                            >
                                                จำนวน
                                            </Typography>
                                            <Paper sx={{ width: "100%" }}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    type="number"
                                                    value={row.money}
                                                    onChange={(e) => {
                                                        const updated = [...incomeRows];
                                                        updated[index].money = e.target.value;
                                                        setIncomeRows(updated);
                                                    }}
                                                    onFocus={(e) => {
                                                        if (e.target.value === "0") {
                                                            const updated = [...incomeRows];
                                                            updated[index].money = "";
                                                            setIncomeRows(updated);
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        if (e.target.value === "") {
                                                            const updated = [...incomeRows];
                                                            updated[index].money = 0;
                                                            setIncomeRows(updated);
                                                        }
                                                    }}
                                                    error={errors.rows[index]?.money}
                                                    helperText={errors.rows[index]?.money ? "กรุณากรอกข้อมูล" : ""}
                                                />
                                            </Paper>
                                        </Box>
                                    </Grid>

                                    {/* ❌ ปุ่มลบ (ถ้ามีเกิน 1 ช่อง) */}
                                    {incomeRows.length > 1 && (
                                        <Grid item md={1} xs={1}>
                                            <Tooltip title="ยกเลิกข้อมูล" placement="left">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveRow(index, true)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                    )}
                                </React.Fragment>
                            ))
                            : deductRows.map((row, index) => (
                                <React.Fragment key={index}>
                                    <Grid item md={7.5} xs={12}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                marginTop={1}
                                                sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 6 }}
                                                gutterBottom
                                            >
                                                รายหัก
                                            </Typography>
                                            <Paper sx={{ width: "100%" }}>
                                                <Autocomplete
                                                    options={deductibleincomeDetail
                                                        .filter((row) => row.Type === "รายหัก" && row.StatusData === "อยู่ในระบบ")
                                                        .sort((a, b) =>
                                                            (a?.Name || "").localeCompare(b?.Name || "", "th")
                                                        )}
                                                    getOptionLabel={(option) => option?.Name || ""}
                                                    value={row.type}
                                                    onChange={(e, newValue) => {
                                                        const updated = [...deductRows];
                                                        updated[index].type = newValue;
                                                        setDeductRows(updated);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={!row.type ? "เลือกรายหัก" : ""}
                                                            variant="outlined"
                                                            size="small"
                                                            error={errors.rows[index]?.type}
                                                            helperText={errors.rows[index]?.type ? "เลือกประเภท" : ""}
                                                        />
                                                    )}
                                                />
                                            </Paper>
                                        </Box>
                                    </Grid>

                                    <Grid item md={3.5} xs={10}>
                                        <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginLeft: { md: 0, xs: 6 } }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                marginTop={1}
                                                sx={{ whiteSpace: "nowrap", marginRight: 1 }}
                                                gutterBottom
                                            >
                                                จำนวน
                                            </Typography>
                                            <Paper sx={{ width: "100%" }}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    type="number"
                                                    value={row.money}
                                                    onChange={(e) => {
                                                        const updated = [...deductRows];
                                                        updated[index].money = e.target.value;
                                                        setDeductRows(updated);
                                                    }}
                                                    onFocus={(e) => {
                                                        if (e.target.value === "0") {
                                                            const updated = [...deductRows];
                                                            updated[index].money = "";
                                                            setDeductRows(updated);
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        if (e.target.value === "") {
                                                            const updated = [...deductRows];
                                                            updated[index].money = 0;
                                                            setDeductRows(updated);
                                                        }
                                                    }}
                                                    error={errors.rows[index]?.money}
                                                    helperText={errors.rows[index]?.money ? "กรุณากรอกข้อมูล" : ""}
                                                />
                                            </Paper>
                                        </Box>
                                    </Grid>

                                    {/* ❌ ปุ่มลบ (ถ้ามีเกิน 1 ช่อง) */}
                                    {deductRows.length > 1 && (
                                        <Grid item md={1} xs={1}>
                                            <Tooltip title="ยกเลิกข้อมูล" placement="left">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveRow(index, false)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                    )}
                                </React.Fragment>
                            ))}
                        <Grid item md={(deductRows.length > 1 || incomeRows.length > 1) ? 12 : 1} xs={1}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right", marginTop: (deductRows.length > 1 || incomeRows.length > 1) && -2 }}>
                                {
                                    (deductRows.length > 1 || incomeRows.length > 1) ?
                                        <Tooltip title="เพิ่มช่องกรอกข้อมูล" placement="left">
                                            <Button variant="contained" size="small" sx={{ marginTop: 1.5, marginBottom: 1.5 }} onClick={handleAddRow} >
                                                เพิ่มช่องกรอกข้อมูล
                                            </Button>
                                        </Tooltip>
                                        :
                                        <Tooltip title="เพิ่มช่องกรอกข้อมูล" placement="top">
                                            <IconButton color="primary" onClick={handleAddRow}>
                                                <AddBoxIcon />
                                            </IconButton>
                                        </Tooltip>
                                }
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: (deductRows.length > 1 || incomeRows.length > 1) && -2 }} >
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4 }} gutterBottom>หมายเหตุ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={note}
                                        multiline
                                        rows={3}
                                        onChange={(e) => setNote(e.target.value)}
                                        error={errors.note}
                                        helperText={errors.note ? "กรุณากรอกข้อมูล" : ""}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" fullWidth color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" fullWidth color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertDeducetionIncome;
