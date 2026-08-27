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
    List,
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
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { IconButtonError, TablecellSelling } from "../../theme/style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useData } from "../../server/path";
import dayjs from "dayjs";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../sweetalert/sweetalert";
import InsertSpendingAbout from "./InsertSpendingAbout";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { Details, Edit, Group } from "@mui/icons-material";
import { formatThaiFull, formatThaiShort, formatThaiSlash } from "../../theme/DateTH";
import FileUploadCard from "../../theme/FileUploadCard";
import FilePreview from "../truck/UploadButton";

const UpdateFinancial = (props) => {
    // const { reghead, regtail, small, report, reportType } = useData();
    const { reghead, regtail, small, companypayment, expenseitems } = useBasicData();
    const { report, reportType } = useTripData();
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(regtail);
    const registrationS = Object.values(small);
    const reportDetail = Object.values(report);
    const companypaymentDetail = Object.values(companypayment);
    const expenseitem = Object.values(expenseitems);
    const { row, open, FinancialID, onClose } = props;

    const [registrationTruck, setRegistrationTruck] = React.useState(row.Registration || null);
    const [invoiceID, setInvoiceID] = React.useState(row.InvoiceID || "");
    const [note, setNote] = React.useState(row.Note || "");
    const [details, setDetails] = React.useState(row.Details || "");
    const [company, setCompany] = React.useState(companypaymentDetail.find((item) => item.id === Number(row.Company?.split(":")[0])) || null);
    const [bank, setBank] = React.useState(expenseitem.find((item) => item.id === Number(row.Bank?.split(":")[0])) || null);
    const [price, setPrice] = useState(row.Price.toString());
    const [vat, setVat] = useState(row.Vat.toString());
    const [total, setTotal] = useState(row.Total.toString());
    const [resultPrice, setResultPrice] = useState(row.Group === "กลุ่ม" ? (row.Price / row.MergedDetails?.length) : row.Price);
    const [resultVat, setResultVat] = useState(row.Group === "กลุ่ม" ? (row.Vat / row.MergedDetails?.length) : row.Vat);
    const [resultTotal, setResultTotal] = useState(row.Group === "กลุ่ม" ? (row.Total / row.MergedDetails?.length).toFixed(2) : row.Total);
    const [manualTotal, setManualTotal] = useState(false); // เช็คว่าผู้ใช้แก้ total โดยตรง

    let initialFile = "ไม่แนบไฟล์";
    let initialFileType = 1;

    if (row?.Path) {
        const lower = row.Path.toLowerCase();

        if (lower.endsWith(".pdf")) {
            initialFile = row.Path;
            initialFileType = 2;
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) {
            initialFile = row.Path;
            initialFileType = 3;
        }
    }

    const [file, setFile] = useState(initialFile);
    const [fileType, setFileType] = useState(initialFileType);

    // const [file, setFile] = useState(files);
    // const [fileType, setFileType] = useState(fileTypes);

    const [edit, setEdit] = useState(false);

    const [errors, setErrors] = useState({
        invoiceID: false,
        selectedDateInvoice: false,
        selectedDateTransfer: false,
        company: false,
        bank: false,
        price: false,
        details: false,
        file: false,   // เผื่ออยากบังคับแนบไฟล์
        list: false,
        total: false,
        registration: {
            "หัวรถ": false,
            "หางรถ": false,
            "รถเล็ก": false,
        }
    });

    console.log("P : ", price);
    console.log("V : ", vat);
    console.log("T : ", total);
    console.log("M : ", manualTotal);

    console.log("RP : ", resultPrice);
    console.log("RV : ", resultVat);
    console.log("RT : ", resultTotal);

    const parseNumber = (val) => {
        if (typeof val === "string") {
            return parseFloat(val.replace(/,/g, "")) || 0;
        }
        return Number(val) || 0;
    };


    // คำนวณ total เมื่อ price หรือ vat เปลี่ยน และ total ไม่ได้แก้เอง
    useEffect(() => {
        if (manualTotal) {
            const priceNum = parseNumber(price);
            const vatNum = parseNumber(vat);
            setTotal((priceNum + vatNum).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }));
        }
    }, [price, vat]);

    const [selectedDateInvoice, setSelectedDateInvoice] = useState(dayjs(row.SelectedDateInvoice, "DD/MM/YYYY"));
    const [selectedDateTransfer, setSelectedDateTransfer] = useState(dayjs(row.SelectedDateTransfer, "DD/MM/YYYY"));
    const [result, setResult] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [type, setType] = useState(row.TruckType === "หัวรถใหญ่" ? "หัวรถ" : row.TruckType === "หางรถใหญ่" ? "หางรถ" : "รถเล็ก");
    const [group, setGroup] = useState(row.Group !== "กลุ่ม" ? "เดี่ยว" : "กลุ่ม");

    // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
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

    const handleReceiveData = (data) => {
        console.log('Data from child:', data);
        setResult(data);
    };

    const getRegistration = () => {
        const registartion = [
            ...registrationH.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "หัวรถใหญ่" })),
            ...registrationT.map((item) => ({ ...item, Registration: item.RegTail, TruckType: "หางรถใหญ่" })),
            ...registrationS.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "รถเล็ก" })),
        ];

        return registartion;
    };

    console.log("Show Registration : ", getRegistration());
    console.log("company : ", company);

    const truckTypeMap = {
        "หัวรถ": "หัวรถใหญ่",
        "หางรถ": "หางรถใหญ่",
        "รถเล็ก": "รถเล็ก"
    };

    console.log("Date Invoice : ", dayjs(selectedDateInvoice));
    console.log("Date Transfer : ", dayjs(selectedDateTransfer));

    const handleDateChangeDateInvoice = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateInvoice(formattedDate);
        }
    };

    const handleDateChangeDateTransfer = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateTransfer(formattedDate);
        }
    };

    const sourceData =
        row.Group === "กลุ่ม"
            ? row.MergedDetails || []
            : [row];

    const formattedList = sourceData.map(item => {

        const price = parseNumber(item.Price);
        const vat = parseNumber(item.Vat);

        return {
            id: item.id,
            invoiceID: item.InvoiceID,
            dateInvoice: item.SelectedDateInvoice,
            dateTranfer: item.SelectedDateTransfer,
            registration: item.Registration,
            company: item.Company,
            details: item.Details,
            Group: group,
            bank: item.Bank,
            note: item.Note,
            price: price,
            vat: vat,
            total: price + vat,
            truckType: item.TruckType,
            type: "old"
        };
    });

    const [list, setList] = useState(formattedList);

    const [selectedValue, setSelectedValue] = useState(row.Group !== "กลุ่ม" ? (
        getRegistration().find((item) =>
            item.TruckType === row.TruckType && item.id === Number(row.Registration?.split(":")[0]))) : null
    );

    console.log("List : ", list);
    console.log("Selected Value : ", selectedValue);

    const handleAdd = () => {
        if (!registrationTruck) return;
        const reg =
            type === "หัวรถ" || type === "รถเล็ก"
                ? registrationTruck?.RegHead
                : registrationTruck?.RegTail;

        setList((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                registration: reg,
                truckType: registrationTruck?.TruckType,
            },
        ]);
        setRegistrationTruck("");
    };

    const handleDelete = (item) => {
        ShowConfirm(
            `ต้องการลบทะเบียนรถ ${item.registration} ใช่หรือไม่`,
            async () => {
                try {
                    if (item.type === "old") {
                        await database
                            .ref("report/invoice/" + item.id)
                            .update({ Status: "ยกเลิก" });
                    }

                    setList(prev => {
                        const newList = prev.filter(i => i.id !== item.id);

                        const newLength = newList.length || 1; // กันหาร 0

                        setResultPrice(price / newLength);
                        setResultVat(vat / newLength);
                        setResultTotal((price + vat) / newLength);

                        return newList;
                    });

                    ShowSuccess("ลบข้อมูลสำเร็จ");

                } catch (error) {
                    console.error(error);
                    ShowError("ลบข้อมูลไม่สำเร็จ");
                }
            },
            () => {
                console.log(`ยกเลิกลบทะเบียนรถ ${item.registration}`);
            }
        );
    };

    // useEffect(() => {
    //     if (manualTotal) {
    //         if (row.Group === "กลุ่ม") {
    //             const priceNum = parseNumber(price);
    //             const vatNum = parseNumber(vat);
    //             const totalNum = parseNumber(total);
    //             setResultPrice((priceNum / list.length).toLocaleString("en-US", {
    //                 minimumFractionDigits: 2,
    //                 maximumFractionDigits: 2,
    //             }))
    //             setResultVat((vatNum / list.length).toLocaleString("en-US", {
    //                 minimumFractionDigits: 2,
    //                 maximumFractionDigits: 2,
    //             }))
    //             setResultTotal((totalNum / list.length).toLocaleString("en-US", {
    //                 minimumFractionDigits: 2,
    //                 maximumFractionDigits: 2,
    //             }))
    //         } else {
    //             setResultPrice(price);
    //             setResultVat(vat);
    //             setResultTotal(total);
    //         }
    //     }
    // }, [price, vat, list]);  // 👈 เพิ่ม list เข้าไป

    const handleCloseTab = () => {
        if (edit) {
            ShowWarning("คุณมีการแก้ไขข้อมูลอยู่ กรุณาบันทึกรายการให้เรียบร้อยก่อนปิดหน้าต่าง");
        } else {
            onClose();
        }
    }

    const handleClose = () => {
        setEdit(false);
        setRegistrationTruck(row.Registration || null);
        setInvoiceID(row.InvoiceID || "");
        setNote(row.Note || "");
        setDetails(row.Details || "");
        setCompany(companypaymentDetail.find((item) => item.id === Number(row.Company?.split(":")[0])) || null);
        setBank(expenseitem.find((item) => item.id === Number(row.Bank?.split(":")[0])) || null);
        setPrice(row.Price);
        setVat(row.Vat);
        setTotal(row.Total);
        setResultPrice(row.Group === "กลุ่ม" ? (row.Price / row.MergedDetails?.length) : row.Price);
        setResultVat(row.Group === "กลุ่ม" ? (row.Vat / row.MergedDetails?.length) : row.Vat);
        setResultTotal(row.Group === "กลุ่ม" ? (row.Total / row.MergedDetails?.length).toFixed(2) : row.Total);
        setFile(initialFile);
        setFileType(initialFileType);
        setSelectedDateInvoice(dayjs(row.SelectedDateInvoice, "DD/MM/YYYY"));
        setSelectedDateTransfer(dayjs(row.SelectedDateTransfer, "DD/MM/YYYY"));
        setSelectedValue(row.Group !== "กลุ่ม" ? (
            getRegistration().find((item) =>
                item.TruckType === row.TruckType && item.id === Number(row.Registration?.split(":")[0]))) : null
        );
        setList(formattedList);
        setGroup(row.Group !== "กลุ่ม" ? "เดี่ยว" : "กลุ่ม");
        setType(row.TruckType === "หัวรถใหญ่" ? "หัวรถ" : row.TruckType === "หางรถใหญ่" ? "หางรถ" : "รถเล็ก");
    };

    console.log("Banks : ", bank);

    const validateBeforeSave = () => {
        const newErrors = {
            invoiceID: false,
            selectedDateInvoice: false,
            selectedDateTransfer: false,
            company: false,
            bank: false,
            price: false,
            file: false,
            list: false,
            total: false,
            registration: {
                "หัวรถ": false,
                "หางรถ": false,
                "รถเล็ก": false,
            },
            details: false,
        };

        let hasError = false;

        if (!selectedDateInvoice) {
            newErrors.selectedDateInvoice = true;
            hasError = true;
        }

        if (!selectedDateTransfer) {
            newErrors.selectedDateTransfer = true;
            hasError = true;
        }

        if (!company) {
            newErrors.company = true;
            hasError = true;
        }

        if (!bank) {
            newErrors.bank = true;
            hasError = true;
        }

        if (!list || list.length === 0) {
            newErrors.list = true;
            hasError = true;
        }

        if (!details || details.trim() === "") {
            newErrors.details = true;
            hasError = true;
        }

        if (group === "เดี่ยว") {
            if (!selectedValue) {
                newErrors.registration[type] = true;
                hasError = true;
            }
        }

        if (price === "0.00" || price === "") {
            newErrors.price = true;
            hasError = true;
        }

        if (total === "0.00" || total === "") {
            newErrors.total = true;
            hasError = true;
        }

        // กรณีมีแค่ 1 คัน ต้องกรอกราคาเอง
        if (list.length <= 1 && (!price || Number(price) === 0)) {
            newErrors.price = true;
            hasError = true;
        }

        // 🔴 ถ้าต้อง “บังคับแนบไฟล์”
        // if (file === "ไม่แนบไฟล์") {
        //   newErrors.file = true;
        //   hasError = true;
        // }

        setErrors(newErrors);
        return !hasError;
    };

    const handlePost = async () => {
        if (!list || list.length === 0) {
            ShowError("ไม่มีข้อมูลที่จะบันทึก");
            return;
        }

        if (!validateBeforeSave()) return;
        if (!file) return alert("กรุณาเลือกไฟล์ก่อน");

        let img = "ไม่แนบไฟล์";

        if (file !== "ไม่แนบไฟล์") {
            const formData = new FormData();
            formData.append("pic", file);

            try {
                const response = await fetch("https://upload.happysoftth.com/panda/uploads", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                img = data.file_path;
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }

        const ref = database.ref("report/invoice");
        const updates = {};

        list.forEach((item) => {
            let id;

            if (item.type === "new") {
                const newRef = ref.push(); // ✅ สร้าง key จาก Firebase
                id = newRef.key;
            } else {
                id = item.id; // ของเดิมใช้ id เดิม
            }

            updates[id] = {
                id,
                InvoiceID: invoiceID,
                SelectedDateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                Registration: item.registration,
                Company: `${company?.id}:${company?.Name}`,
                Details: details,
                Bank: `${bank?.id}:${bank?.Name}`,
                Group: group,
                Note: note,
                Price: list.length <= 1 ? parseNumber(price) : parseNumber(resultPrice),
                Vat: list.length <= 1 ? parseNumber(vat) : parseNumber(resultVat),
                Total: list.length <= 1 ? parseNumber(total) : parseNumber(resultTotal),
                TruckType: item.truckType,
                Status: "อยู่ในระบบ",
                Path: img,
            };
        });

        console.log("updates : ", updates);

        database
            .ref("report/invoice")
            .update(updates)
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");

                setList([]);
                setInvoiceID("");
                setSelectedDateInvoice(dayjs().format("DD/MM/YYYY"));
                setSelectedDateTransfer(dayjs().format("DD/MM/YYYY"));
                setCompany("");
                setDetails("");
                setBank("");
                setNote("");
                setPrice("");
                setVat("");
                onClose();
                setFile("ไม่แนบไฟล์");
                setFileType(1);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    console.log("registrationTruck: ", registrationTruck);
    console.log("Group : ", group);
    console.log("List : ", list);
    console.log("File : ", file);

    return (
        <React.Fragment>
            <Dialog
                open={open && FinancialID === row.id}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleCloseTab}
                maxWidth="sm"
                sx={
                    (!result && group === "เดี่ยว") ?
                        {
                            zIndex: 900,
                        }
                        :
                        {
                            '& .MuiDialog-container': {
                                justifyContent: 'flex-start', // 👈 ชิดซ้าย
                                alignItems: 'center',
                                marginLeft: windowWidth <= 900 ? 0 : 15
                            },
                            zIndex: 900,
                        }
                }
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >เพิ่มบิล</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleCloseTab} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={0.5} marginBottom={-0.5}>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                    sx={{
                                        whiteSpace: "nowrap",
                                        marginRight: 1,
                                        marginLeft: 4.5,
                                        color: !edit ? "gray" : "black"
                                    }} gutterBottom>เลขที่บิล</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={invoiceID} onChange={(e) => setInvoiceID(e.target.value)}
                                        disabled={!edit}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 5, color: !edit ? "gray" : "black" }} gutterBottom>วันที่บิล</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(selectedDateInvoice, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                            format="DD/MM/YYYY"
                                            onChange={handleDateChangeDateInvoice}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: formatThaiSlash(selectedDateInvoice), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                },
                                            }}
                                            disabled={!edit}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 0.5, color: !edit ? "gray" : "black" }} gutterBottom>วันที่โอน</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(selectedDateTransfer, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                            format="DD/MM/YYYY"
                                            onChange={handleDateChangeDateTransfer}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: formatThaiSlash(selectedDateTransfer), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
                                                },
                                            }}
                                            disabled={!edit}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5, color: !edit ? "gray" : "black" }} gutterBottom>ชื่อบริษัท</Typography>
                                {/* <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={company} onChange={(e) => setCompany(e.target.value)} />
                                </Paper> */}
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={companypaymentDetail.filter((item) => item.Status === "อยู่ในระบบ").sort((a, b) => (a?.Name || "").localeCompare(b?.Name || "", "th"))}
                                        getOptionLabel={(option) => option?.Name || ""}
                                        value={company} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setCompany(newValue); // เก็บทั้ง object
                                            } else {
                                                setCompany(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200, // ความสูงสูงสุดของ list
                                                overflow: 'auto',
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!company ? "เลือกบริษัทที่ต้องการเพิ่ม" : ""}
                                                variant="outlined"
                                                size="small"
                                                error={errors.company}
                                                helperText={errors.company ? "กรุณาเลือกบริษัท" : ""}
                                            //   sx={{
                                            //     "& .MuiOutlinedInput-root": { height: "30px" },
                                            //     "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                            //   }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {option.Name}
                                                </Typography>
                                            </li>
                                        )}
                                        disabled={!edit}
                                    />

                                </Paper>
                                <Tooltip title="เพิ่มข้อมูลประเภทค่าใช้จ่าย" placement="top">
                                    <InsertSpendingAbout onSend={handleReceiveData} />
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: -1.5, marginBottom: -1.5 }} >
                                <FormGroup row>
                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 3, marginLeft: 0.5, marginTop: 1, color: !edit ? "gray" : "black" }} gutterBottom>เลือกประเภทรถ</Typography>
                                    <FormControlLabel control={<Checkbox checked={type === "หัวรถ" ? true : false} color="info" onChange={() => { setType("หัวรถ"); setSelectedValue(null) }} disabled={!edit} />} label="หัวรถ" />
                                    <FormControlLabel control={<Checkbox checked={type === "หางรถ" ? true : false} color="info" onChange={() => { setType("หางรถ"); setSelectedValue(null) }} disabled={!edit} />} label="หางรถ" />
                                    <FormControlLabel control={<Checkbox checked={type === "รถเล็ก" ? true : false} color="info" onChange={() => { setType("รถเล็ก"); setSelectedValue(null) }} disabled={!edit} />} label="รถเล็ก" />
                                </FormGroup>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1, color: !edit ? "gray" : "black" }} gutterBottom>ป้ายทะเบียน</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        sx={{ flex: 1 }}
                                        options={(getRegistration() || []).filter(
                                            (option) => option?.TruckType === truckTypeMap[type]
                                        )}
                                        getOptionLabel={(option) => { return `${option?.Registration} (${option?.TruckType})`; }}
                                        value={selectedValue}  // แสดงค่าที่เลือกปัจจุบัน
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setSelectedValue(newValue);

                                                setList((prev) => {
                                                    const newItem = {
                                                        id: group === "เดี่ยว" ? prev[0]?.id || 0 : prev.length,
                                                        invoiceID: invoiceID,
                                                        dateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                                                        dateTranfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                                                        registration: `${newValue.id}:${newValue.Registration}`,
                                                        company: company,
                                                        details: details,
                                                        Group: group,
                                                        bank: bank,
                                                        note: note,
                                                        price: parseNumber(price),
                                                        vat: parseNumber(vat),
                                                        total: parseNumber(price) + parseNumber(vat),
                                                        truckType: newValue?.TruckType,
                                                        type: group === "เดี่ยว" ? "old" : "new"
                                                    };

                                                    if (group === "เดี่ยว") {
                                                        return [newItem]; // ให้มีแค่ 1 รายการ
                                                    } else {
                                                        setResultPrice(price / (prev.length + 1));
                                                        setResultVat(vat / (prev.length + 1));
                                                        setResultTotal((parseNumber(price) + parseNumber(vat)) / (prev.length + 1));
                                                        return [...prev, newItem]; // เพิ่มได้หลายรายการ
                                                    }
                                                });
                                                // setResultPrice((Number(price) / list.length).toLocaleString("en-US", {
                                                //     minimumFractionDigits: 2,
                                                //     maximumFractionDigits: 2,
                                                // }))
                                                // setResultVat((Number(vat) / list.length).toLocaleString("en-US", {
                                                //     minimumFractionDigits: 2,
                                                //     maximumFractionDigits: 2,
                                                // }))
                                                // setResultTotal(((Number(price) + Number(vat)) / list.length).toLocaleString("en-US", {
                                                //     minimumFractionDigits: 2,
                                                //     maximumFractionDigits: 2,
                                                // }))
                                            } else {
                                                setSelectedValue(null);  // เคลียร์ถ้าเลือกลบค่า
                                            }
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200,
                                                overflow: "auto",
                                            },
                                        }}
                                        renderInput={(params) => (
                                            group === "เดี่ยว" ? (
                                                <TextField
                                                    {...params}
                                                    label={`กรุณาเลือก${type}`}
                                                    variant="outlined"
                                                    size="small"
                                                    error={errors.registration?.[type] || false}
                                                    helperText={
                                                        errors.registration?.[type]
                                                            ? `กรุณาเลือก${type}`
                                                            : ""
                                                    }
                                                />
                                            )
                                                :
                                                (
                                                    <TextField
                                                        {...params}
                                                        label={`กรุณาเลือก${type}`}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                )
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {(type === "หัวรถ" || type === "รถเล็ก") &&
                                                        `${option?.RegHead} (${option?.TruckType})`}
                                                    {type === "หางรถ" &&
                                                        `${option?.RegTail} (${option?.TruckType})`}
                                                </Typography>
                                            </li>
                                        )}
                                        disabled={!edit}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center"
                                sx={{ marginTop: -1.5, marginBottom: -1.5, color: !edit ? "gray" : "black" }} >
                                <FormGroup row>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        textAlign="right"
                                        sx={{ whiteSpace: "nowrap", marginRight: 3, marginLeft: 0.5, marginTop: 1 }}
                                        gutterBottom
                                    >
                                        เลือกการเพิ่มข้อมูลรถ
                                    </Typography>

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={group === "เดี่ยว"}
                                                color="info"
                                                onChange={() => {
                                                    setGroup("เดี่ยว");
                                                    setList([]);
                                                    setSelectedValue(null);
                                                    setPrice("0.00");
                                                    setVat("0.00");
                                                }}
                                                disabled={!edit}
                                            />
                                        }
                                        label="เดี่ยว"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={group === "กลุ่ม"}
                                                color="info"
                                                onChange={() => {
                                                    setGroup("กลุ่ม");
                                                    setList([]);
                                                    setSelectedValue(null);
                                                    setPrice("0.00");
                                                    setVat("0.00");
                                                }}
                                                disabled={!edit}
                                            />
                                        }
                                        label="กลุ่ม"
                                    />
                                </FormGroup>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1.5, color: !edit ? "gray" : "black" }} gutterBottom>รายละเอียด</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        error={errors.details}
                                        helperText={errors.details ? "กรุณากรอกรายละเอียด" : ""}
                                        disabled={!edit}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4.5, color: !edit ? "gray" : "black" }} gutterBottom>ชื่อบัญชี</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={expenseitem.filter((item) => item.Status === "อยู่ในระบบ") // ✅ filter ตาม Status
                                            .sort((a, b) => a.Name.localeCompare(b.Name))}
                                        getOptionLabel={(option) => option?.Name || ""}
                                        value={bank} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setBank(newValue); // เก็บทั้ง object
                                            } else {
                                                setBank(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200, // ความสูงสูงสุดของ list
                                                overflow: 'auto',
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!bank ? "เลือกชื่อบัญชีที่ต้องการเพิ่ม" : ""}
                                                variant="outlined"
                                                size="small"
                                                error={errors.bank}
                                                helperText={errors.bank ? "กรุณาเลือกชื่อบัญชี" : ""}
                                            //   sx={{
                                            //     "& .MuiOutlinedInput-root": { height: "30px" },
                                            //     "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                            //   }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {option.Name}
                                                </Typography>
                                            </li>
                                        )}
                                        disabled={!edit}
                                    />

                                </Paper>
                                {/* <TextField size="small" fullWidth value={bank} onChange={(e) => setBank(e.target.value)} />*/}
                            </Box>
                        </Grid>
                        {
                            (group !== "กลุ่ม") &&
                            <React.Fragment>
                                <Grid item md={6} xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                            sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 0.5, color: !edit ? "gray" : "black" }} gutterBottom>ยอดก่อน Vat</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            {/* <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={price}
                                                onChange={(e) => {
                                                    setPrice(e.target.value);
                                                    setManualTotal(false); // price เปลี่ยน → total คำนวณอัตโนมัติ
                                                }}
                                                onFocus={(e) => e.target.value === "0" && setPrice("")}
                                                onBlur={(e) => e.target.value === "" && setPrice(0)}
                                            /> */}
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={price}
                                                onChange={(e) => {
                                                    // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                        setPrice(raw);
                                                    }
                                                    setManualTotal(true);
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseFloat(price);
                                                    if (isNaN(val)) {
                                                        setPrice("0" || "0.00");
                                                    } else {
                                                        setPrice(
                                                            val.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })
                                                        );
                                                    }
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0" || e.target.value === "0.00") {
                                                        setPrice("");
                                                    } else {
                                                        setPrice(price.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                    }
                                                }}
                                                error={errors.price}
                                                helperText={errors.price ? "กรุณากรอกยอดก่อน Vat" : ""}
                                                disabled={!edit}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>

                                <Grid item md={6} xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                            sx={{ whiteSpace: "nowrap", marginRight: 1, color: !edit ? "gray" : "black" }} gutterBottom>ยอด Vat</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            {/* <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={vat}
                                                onChange={(e) => {
                                                    setVat(e.target.value);
                                                    setManualTotal(false); // vat เปลี่ยน → total คำนวณอัตโนมัติ
                                                }}
                                                onFocus={(e) => e.target.value === "0" && setVat("")}
                                                onBlur={(e) => e.target.value === "" && setVat(0)}
                                            /> */}
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={vat}
                                                onChange={(e) => {
                                                    // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                        setVat(raw);
                                                    }
                                                    setManualTotal(true);
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseFloat(vat);
                                                    if (isNaN(val)) {
                                                        setVat("0" || "0.00");
                                                    } else {
                                                        setVat(
                                                            val.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })
                                                        );
                                                    }
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0" || e.target.value === "0.00") {
                                                        setVat("");
                                                    } else {
                                                        setVat(vat.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                    }
                                                }}
                                                error={errors.vat}
                                                helperText={errors.vat ? "กรุณากรอกยอด Vat" : ""}
                                                disabled={!edit}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>

                                <Grid item md={12} xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                            sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4, color: !edit ? "gray" : "black" }} gutterBottom>ยอดรวม</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField
                                                size="small"
                                                type="text"
                                                fullWidth
                                                value={total}
                                                onChange={(e) => {
                                                    // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                        setTotal(raw);
                                                    }
                                                    setManualTotal(true);
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseFloat(total);
                                                    if (isNaN(val)) {
                                                        setTotal("0" || "0.00");
                                                    } else {
                                                        setTotal(
                                                            val.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })
                                                        );
                                                    }
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0" || e.target.value === "0.00") {
                                                        setTotal("");
                                                    } else {
                                                        setTotal(total.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                    }
                                                }}
                                                error={errors.total}
                                                helperText={errors.total ? "กรุณากรอกยอดรวม" : ""}
                                                disabled={!edit}
                                            />
                                            {/* <TextField
                                                size="small"
                                                type="text" // ❗ ต้องใช้ text ไม่ใช่ number เพื่อให้ format 1,234.56 แสดงได้
                                                fullWidth
                                                value={Number(total).toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                                onChange={(e) => {
                                                    // ลบ comma ออกก่อนแล้ว parse เป็น float
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    const val = parseFloat(raw);
                                                    setTotal(isNaN(val) ? 0 : val);
                                                    setManualTotal(true); // ผู้ใช้แก้ total โดยตรง
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0.00") setTotal("");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") setTotal(0);
                                                }}
                                            /> */}
                                        </Paper>
                                    </Box>
                                </Grid>
                            </React.Fragment>
                        }
                        {/* <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3 }} gutterBottom>หมายเหตุ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </Paper>
                            </Box>
                        </Grid> */}
                        {
                            (!result && group === "กลุ่ม") &&
                            <Grid item xs={12}>
                                <Paper
                                    sx={{
                                        position: 'fixed',
                                        top: '50%',            // กึ่งกลางแนวตั้ง
                                        right: 100,              // ชิดขวาสุด
                                        transform: 'translateY(-50%)',  // เลื่อนขึ้นครึ่งความสูงเพื่อกึ่งกลางจริงๆ
                                        width: '650px',
                                        height: '80vh',
                                        zIndex: 1300,
                                    }}
                                >
                                    <Grid container sx={{ backgroundColor: theme.palette.panda.dark, height: "50px", borderTopLeftRadius: 5, borderTopRightRadius: 5 }} >
                                        <Grid item xs={10}>
                                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: 1, marginLeft: 2 }} >รายการทะเบียนรถ</Typography>
                                        </Grid>
                                        <Grid item xs={2} textAlign="right">
                                            <IconButtonError onClick={handleCloseTab} sx={{ marginTop: 1, marginRight: 2 }}>
                                                <CancelIcon fontSize="small" />
                                            </IconButtonError>
                                        </Grid>
                                    </Grid>
                                    {/* <Typography variant="h6" fontWeight="bold" textAlign="center" marginTop={0.5} gutterBottom>รายการทะเบียนรถ</Typography> */}
                                    <Box sx={{ p: 4 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ fontSize: "12px", color: theme.palette.error.main }}>*โปรดทราบ: หากมีการลบข้อมูลทะเบียนรถ กรุณากดบันทึกข้อมูลเพื่อยืนยัน มิฉะนั้นข้อมูลการคำนวณจะผิดพลาด*</Typography>
                                        <TableContainer component={Paper} sx={{ width: "100%", height: "35vh" }}>
                                            <Table
                                                stickyHeader
                                                size="small"
                                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                            >
                                                <TableHead sx={{ height: "5vh" }}>
                                                    <TableRow>
                                                        <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                            ลำดับ
                                                        </TablecellSelling>
                                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                            ทะเบียนรถ
                                                        </TablecellSelling>
                                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                                            ประเภท
                                                        </TablecellSelling>
                                                        <TablecellSelling sx={{ textAlign: "center", width: 50, position: "sticky", right: 0 }} />
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {list.map((item, index) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell sx={{ textAlign: "center", color: !edit ? "gray" : "black" }}>{index + 1}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", color: !edit ? "gray" : "black" }}>
                                                                {item.registration?.includes(":")
                                                                    ? item.registration.split(":")[1]
                                                                    : item.registration}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center", color: !edit ? "gray" : "black" }}>{item.truckType}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {
                                                                    edit &&
                                                                    <IconButton size="small" color="error" onClick={() => handleDelete(item)} sx={{ marginTop: -0.5, marginBottom: -0.5 }}>
                                                                        <DeleteForeverIcon fontSize="small" />
                                                                    </IconButton>
                                                                }

                                                            </TableCell>
                                                        </TableRow>
                                                    ))}

                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Paper sx={{ backgroundColor: "lightgray", p: 2, marginTop: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item md={5} xs={5}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center" sx={{ marginBottom: 0.5, marginTop: -1, color: theme.palette.panda.light }}>กรอกข้อมูลตรงนี้</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                                                    sx={{ whiteSpace: "nowrap", marginRight: 1, color: !edit ? "gray" : "black" }} gutterBottom>ยอดก่อน Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField size="small" type="number" fullWidth
                                                                        value={price}
                                                                        onChange={(e) => {
                                                                            setPrice(e.target.value);
                                                                            setManualTotal(false); // vat เปลี่ยน → total คำนวณอัตโนมัติ
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0") {
                                                                                setPrice(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === "") {
                                                                                setPrice(0); // ถ้าค่าว่างให้เป็น 0
                                                                            }
                                                                        }}
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={price}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setPrice(raw);
                                                                            }
                                                                            setManualTotal(true);

                                                                            setList(prev => {
                                                                                // const newList = prev.filter(i => i.id !== item.id);

                                                                                const newLength = prev.length || 1; // กันหาร 0

                                                                                setResultPrice(Number(raw) / newLength);
                                                                                setResultVat(Number(vat) / newLength);
                                                                                setResultTotal((Number(raw) + Number(vat)) / newLength);

                                                                                return prev;
                                                                            });
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(price);
                                                                            if (isNaN(val)) {
                                                                                setPrice("0" || "0.00");
                                                                            } else {
                                                                                setPrice(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setPrice("");
                                                                            } else {
                                                                                setPrice(price.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                        disabled={!edit}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5, color: !edit ? "gray" : "black" }} gutterBottom>ยอด Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField size="small" type="number" fullWidth
                                                                        value={vat}
                                                                        onChange={(e) => {
                                                                            setVat(e.target.value);
                                                                            setManualTotal(false); // vat เปลี่ยน → total คำนวณอัตโนมัติ
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0") {
                                                                                setVat(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === "") {
                                                                                setVat(0); // ถ้าค่าว่างให้เป็น 0
                                                                            }
                                                                        }}
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={vat}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setVat(raw);
                                                                            }
                                                                            setManualTotal(true);

                                                                            setList(prev => {
                                                                                // const newList = prev.filter(i => i.id !== item.id);

                                                                                const newLength = prev.length || 1; // กันหาร 0

                                                                                setResultPrice(Number(price) / newLength);
                                                                                setResultVat(Number(raw) / newLength);
                                                                                setResultTotal((Number(raw) + Number(price)) / newLength);

                                                                                return prev;
                                                                            });
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(vat);
                                                                            if (isNaN(val)) {
                                                                                setVat("0" || "0.00");
                                                                            } else {
                                                                                setVat(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setVat("");
                                                                            } else {
                                                                                setVat(vat.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                        disabled={!edit}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5, color: !edit ? "gray" : "black" }} gutterBottom>ยอดรวม</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField size="small" type="number" fullWidth
                                                                        value={total}
                                                                        onChange={(e) => {
                                                                            setTotal(e.target.value);
                                                                            setManualTotal(true); // ผู้ใช้แก้ total โดยตรง
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0") {
                                                                                setTotal(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                                                            }
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === "") {
                                                                                setTotal(0); // ถ้าค่าว่างให้เป็น 0
                                                                            }
                                                                        }}
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={total}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setTotal(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(total);
                                                                            if (isNaN(val)) {
                                                                                setTotal("0" || "0.00");
                                                                            } else {
                                                                                setTotal(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setTotal("");
                                                                            } else {
                                                                                setTotal(total.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                        disabled={!edit}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item md={2} xs={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Typography
                                                        fontWeight="bold"
                                                        sx={{
                                                            fontSize: "60px",     // ขนาดพื้นฐาน
                                                            display: "inline-block",
                                                            transform: "scaleY(3.5)", // ยืดแนวตั้ง 2 เท่า
                                                            transformOrigin: "center",
                                                            marginTop: -3,
                                                            marginRight: -3,
                                                            color: theme.palette.panda.dark
                                                        }}
                                                    >
                                                        {"➤"}
                                                    </Typography>
                                                </Grid>
                                                <Grid item md={5} xs={5}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center" sx={{ marginBottom: 0.5, marginTop: -1, color: theme.palette.panda.light }}>ผลการคำนวณ</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                                                    sx={{ whiteSpace: "nowrap", marginRight: 1, color: !edit ? "gray" : "black" }} gutterBottom>ยอดก่อน Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={price / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={resultPrice}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setResultPrice(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(resultPrice);
                                                                            if (isNaN(val)) {
                                                                                setResultPrice("0" || "0.00");
                                                                            } else {
                                                                                setResultPrice(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setResultPrice("");
                                                                            } else {
                                                                                setResultPrice(resultPrice.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                        disabled={!edit}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5, color: !edit ? "gray" : "black" }} gutterBottom>ยอด Vat</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={vat / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={resultVat}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setResultVat(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(resultVat);
                                                                            if (isNaN(val)) {
                                                                                setResultVat("0" || "0.00");
                                                                            } else {
                                                                                setResultVat(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setResultVat("");
                                                                            } else {
                                                                                setResultVat(resultVat.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                        disabled={!edit}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1}
                                                                    sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5, color: !edit ? "gray" : "black" }} gutterBottom>ยอดรวม</Typography>
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    {/* <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        fullWidth
                                                                        value={(Number(price) + Number(vat)) / (list.length !== 0 && list.length)}
                                                                        disabled
                                                                    /> */}
                                                                    <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={resultTotal}
                                                                        onChange={(e) => {
                                                                            // อนุญาตให้พิมพ์ว่างหรือทศนิยมได้
                                                                            const raw = e.target.value.replace(/,/g, "");
                                                                            if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
                                                                                setResultTotal(raw);
                                                                            }
                                                                            setManualTotal(true);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(resultTotal);
                                                                            if (isNaN(val)) {
                                                                                setResultTotal("0" || "0.00");
                                                                            } else {
                                                                                setResultTotal(
                                                                                    val.toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 2,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                );
                                                                            }
                                                                        }}
                                                                        onFocus={(e) => {
                                                                            if (e.target.value === "0" || e.target.value === "0.00") {
                                                                                setResultTotal("");
                                                                            } else {
                                                                                setResultTotal(resultTotal.replace(/,/g, "")); // ลบ comma ออกตอนแก้ไข
                                                                            }
                                                                        }}
                                                                        disabled={!edit}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                </Paper>

                            </Grid>
                        }
                        <Grid item md={12} xs={12}>
                            <Divider>
                                <Chip label="ไฟล์เพิ่มเติม" size="small" sx={{ marginTop: -1, marginBottom: 1 }} />
                            </Divider>
                            {
                                !edit ?
                                    (
                                        <Box textAlign="center">
                                            {/* <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={file.name}
                                                                        sx={{ marginRight: 2 }}
                                                                    /> */}

                                            <Box display="flex" alignItems="center" justifyContent="center" >
                                                {
                                                    file === "ไม่แนบไฟล์" ?
                                                        <ImageNotSupportedIcon fontSize="small" color="disabled" sx={{ width: 200, height: 200 }} />
                                                        :
                                                        <FilePreview file={file} />
                                                }
                                            </Box>
                                            <Box textAlign="center">
                                                {file instanceof File ? (
                                                    // ✅ กรณีเป็น File object
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        {file.name}
                                                    </Typography>
                                                ) : (
                                                    // ✅ กรณีเป็น path (string)
                                                    file === "ไม่แนบไฟล์" ? null :
                                                        <Typography
                                                            variant="subtitle2"
                                                            gutterBottom
                                                            component="a"
                                                            href={file.startsWith("http") ? file : `https://${file}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                wordBreak: "break-all",
                                                                textDecoration: "underline",
                                                                color: "primary.main",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            {file}
                                                        </Typography>

                                                )}
                                            </Box>
                                        </Box>
                                    )
                                    :
                                    (
                                        <React.Fragment>
                                            {
                                                file === "ไม่แนบไฟล์" ?
                                                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingLeft: 3, paddingRight: 3 }}>
                                                        <Button
                                                            variant="contained"
                                                            component="label"
                                                            size="small"
                                                            fullWidth
                                                            sx={{
                                                                height: "50px",
                                                                backgroundColor: fileType === 1 ? "#5552ffff" : "#eeeeee",
                                                                borderRadius: 2,
                                                            }}
                                                            onClick={() => { setFileType(1); setFile("ไม่แนบไฟล์"); }}
                                                        >
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight="bold"
                                                                color={fileType === 1 ? "white" : "lightgray"}
                                                                sx={{ whiteSpace: "nowrap", marginTop: 0.5 }}
                                                                gutterBottom
                                                            >
                                                                ไม่แนบไฟล์
                                                            </Typography>
                                                            <FolderOffIcon
                                                                sx={{
                                                                    fontSize: 30,
                                                                    color: fileType === 1 ? "white" : "lightgray",
                                                                    marginLeft: 0.5,
                                                                }}
                                                            />
                                                        </Button>
                                                        {/* <Chip label="หรือ" size="small" sx={{ marginLeft: 3, marginRight: 3 }} /> */}
                                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 3, marginRight: 3, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                                        <Button
                                                            variant="contained"
                                                            component="label"
                                                            size="small"
                                                            fullWidth
                                                            sx={{
                                                                height: "50px",
                                                                backgroundColor: fileType === 2 ? "#ff5252" : "#eeeeee",
                                                                borderRadius: 2,
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                            }}
                                                            onClick={() => setFileType(2)}
                                                        >
                                                            <Typography
                                                                variant="h6"
                                                                fontWeight="bold"
                                                                color={fileType === 2 ? "white" : "lightgray"}
                                                                gutterBottom
                                                            >
                                                                PDF
                                                            </Typography>
                                                            <PictureAsPdfIcon
                                                                sx={{
                                                                    fontSize: 40,
                                                                    color: fileType === 2 ? "white" : "lightgray",
                                                                    marginLeft: 0.5,
                                                                }}
                                                            />
                                                            <input
                                                                type="file"
                                                                hidden
                                                                accept="application/pdf"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) setFile(file);
                                                                }}
                                                            />
                                                        </Button>
                                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 3, marginRight: 3, marginTop: 0.5 }} gutterBottom>หรือ</Typography>
                                                        <Button
                                                            variant="contained"
                                                            component="label"
                                                            size="small"
                                                            fullWidth
                                                            sx={{
                                                                height: "50px",
                                                                backgroundColor: fileType === 3 ? "#29b6f6" : "#eeeeee",
                                                                borderRadius: 2,
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                            }}
                                                            onClick={() => setFileType(3)}
                                                        >
                                                            <Typography
                                                                variant="h6"
                                                                fontWeight="bold"
                                                                color={fileType === 3 ? "white" : "lightgray"}
                                                                gutterBottom
                                                            >
                                                                รูปภาพ
                                                            </Typography>
                                                            <ImageIcon
                                                                sx={{
                                                                    fontSize: 40,
                                                                    color: fileType === 3 ? "white" : "lightgray",
                                                                    marginLeft: 0.5,
                                                                }}
                                                            />
                                                            <input
                                                                type="file"
                                                                hidden
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) setFile(file);
                                                                }}
                                                            />
                                                        </Button>
                                                    </Box>
                                                    :
                                                    <Box textAlign="center">
                                                        {/* <TextField
                                                                        size="small"
                                                                        type="text"
                                                                        fullWidth
                                                                        value={file.name}
                                                                        sx={{ marginRight: 2 }}
                                                                    /> */}

                                                        <Box display="flex" alignItems="center" justifyContent="center" >
                                                            <FilePreview file={file} />
                                                            <Button variant="outlined" color="error" size="small" sx={{ marginLeft: 2 }} onClick={() => { setFileType(1); setFile("ไม่แนบไฟล์"); }}>
                                                                <DeleteForeverIcon />
                                                            </Button>
                                                        </Box>
                                                        <Box textAlign="center">
                                                            <Typography variant="subtitle1" gutterBottom>{file.name}</Typography>
                                                        </Box>
                                                    </Box>
                                            }
                                        </React.Fragment>
                                    )
                                // <Box sx={{
                                //     display: "flex",
                                //     alignItems: "center",
                                //     justifyContent: "space-between", // ช่วยแยกซ้ายขวา
                                //     paddingLeft: 12,
                                // }}>
                                //     <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                //         File : {file.name}
                                //     </Typography>
                                //     {/* <IconButton color="error" onClick={() => { setFile(null); setFileType(null); }}>
                                //         <DeleteForeverIcon />
                                //     </IconButton> */}
                                //     <Button variant="outlined" color="error" size="small" onClick={() => { setFile(null); setFileType(null); }}>
                                //         ลบไฟล์
                                //     </Button>
                                // </Box>
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    {
                        edit ?
                            <React.Fragment>
                                <Button onClick={handlePost} variant="contained" fullWidth color="success">บันทึก</Button>
                                <Button onClick={handleClose} variant="contained" fullWidth color="error">ยกเลิก</Button>
                            </React.Fragment>
                            :
                            <Button onClick={() => setEdit(true)} variant="contained" fullWidth color="warning">แก้ไข</Button>
                    }

                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default UpdateFinancial;
