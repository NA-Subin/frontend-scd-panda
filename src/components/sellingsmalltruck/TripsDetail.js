import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
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
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import UpdateTrip from "./UpdateTrip";
import { formatThaiSlash } from "../../theme/DateTH";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const TripsDetail = (props) => {
    const { trips, windowWidth, index, maxOrder } = props;
    const [approve, setApprove] = React.useState(false);
    const {small} = useBasicData();

    const smalls = Object.values(small || {}).filter((item) => item.StatusTruck !== "ยกเลิก");

    const handleApprove = () => {
        database
            .ref("trip/")
            .child(trips.id - 1)
            .update({
                Status: "อนุมัติแล้ว",
            })
            .then(() => {
                ShowSuccess("อนุมัติเที่ยววิ่งเรียบร้อย");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("อนุมัติเที่ยววิ่งไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleNonApprove = () => {
        database
            .ref("trip/")
            .child(trips.id - 1)
            .update({
                Status: "ไม่อนุมัติ",
            })
            .then(() => {
                ShowSuccess("ไม่อนุมัติเที่ยววิ่งเรียบร้อย");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("ไม่อนุมัติเที่ยววิ่งไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const ShortName = smalls.find((t) => t.id === Number(trips.Registration.split(":")[0]))?.ShortName || "-";

    console.log("trips:", trips);

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{formatThaiSlash(dayjs(trips.DateReceive, "DD/MM/YYYY"))}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{formatThaiSlash(dayjs(trips.DateDelivery, "DD/MM/YYYY"))}</TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                    <Box sx={{ marginLeft: 2 }}>
                        {
                            trips.Driver?.split(":")[1] !== undefined
                                ? trips.Driver.split(":")[1]
                                : trips.Driver
                        }
                        {" / "}
                        <Typography
                            component="span"
                            variant="body2"
                            sx={{
                                color:
                                    trips?.Registration?.split(":")[1] === "0" ?
                                        theme.palette.error.dark
                                        : "black"
                            }}
                        >
                            {(() => {
                                const reg = trips?.Registration ?? "";
                                const value = reg.split(":")[1];

                                if (!value || value === "0") {
                                    return "(ยังไม่ได้เลือกทะเบียนรถ)";
                                }

                                // return `${ShortName} (${value})`;
                                return `${value}`;
                            })()}
                        </Typography>
                    </Box>
                    {/* {trips.Driver}/{trips.Registration} */}
                </TableCell>
                {/* ✅ Order dynamic */}
                {Array.from({ length: maxOrder }, (_, i) => {
                    const key = `Order${i + 1}`;
                    return (
                        <TableCell key={key} sx={{ textAlign: "left" }}>
                            <Box sx={{ marginLeft: 2 }}>
                                {trips[key]
                                    ? (trips[key].split(":")[1] ?? trips[key])
                                    : "-"}
                            </Box>
                        </TableCell>
                    );
                })}
                <TableCell
                    sx={{
                        textAlign: "right",
                        paddingLeft: "20px !important",
                        paddingRight: "20px !important",
                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                    }}
                >
                    {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(trips.CostTrip)}
                </TableCell>
                <TableCell
                    sx={{
                        textAlign: "right",
                        paddingLeft: "20px !important",
                        paddingRight: "20px !important",
                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                    }}
                >
                    {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(parseFloat(trips.WeightOil))}
                </TableCell>
                {/* <TableCell
                    sx={{
                        textAlign: "right",
                        paddingLeft: "20px !important",
                        paddingRight: "20px !important",
                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                    }}
                >
                    {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(trips.WeightTruck)}
                </TableCell>
                <TableCell
                    sx={{
                        textAlign: "right",
                        paddingLeft: "20px !important",
                        paddingRight: "20px !important",
                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                    }}
                >
                    {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(trips.TotalWeight)}
                </TableCell> */}
                <TableCell sx={{ textAlign: "center" }}>
                    {trips.StatusTrip}
                </TableCell>
                <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                    <UpdateTrip
                        trip={trips}
                        tripID={trips.id}
                        dateStart={trips.DateStart}
                        dateReceive={trips.DateReceive}
                        dateDelivery={trips.DateDelivery}
                        weightHigh={trips.WeightHigh}
                        weightLow={trips.WeightLow}
                        totalWeight={trips.TotalWeight}
                        weightTruck={trips.WeightTruck}
                        depotTrip={trips.Depot}
                        registrations={trips.Registration}
                        driversdetail={trips.Driver}
                    />
                </TableCell>
                {/* <TableCell sx={{
                    textAlign: "center",
                    color: "white",
                    backgroundColor:
                        trips.Status === "รออนุมัติ" ? "yellowgreen"
                            : trips.Status === "ไม่อนุมัติ" ? "orangered"
                                : trips.Status === "อนุมัติแล้ว" ? "blue"
                                    : trips.Status === "ยกเลิก" ? "red"
                                        : "green",
                    position: "sticky",
                    right: windowWidth <= 900 ? 0 : "200px", // ติดซ้ายสุด
                    zIndex: windowWidth <= 900 ? 2 : 4,
                }}>{trips.Status}</TableCell>
                <TableCell sx={
                    windowWidth <= 900 ?
                        { textAlign: "center" }
                        :
                        (trips.Status === "รออนุมัติ" ?
                            { textAlign: "center" }
                            :
                            {
                                textAlign: "center",
                                position: "sticky",
                                right: 0, // ระยะที่ชิดซ้ายต่อจากเซลล์ก่อนหน้า
                                backgroundColor: "#fff", // ใส่พื้นหลังเพื่อไม่ให้โปร่งใส
                                zIndex: 1,
                            })
                }>{trips.Creditor}</TableCell>
                <TableCell
                    sx={
                        windowWidth <= 900 ?
                            {
                                textAlign: "center",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }
                            :
                            trips.Status === "รออนุมัติ" ?
                                {
                                    textAlign: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    position: "sticky",
                                    right: 0, // ระยะที่ชิดซ้ายต่อจากเซลล์ก่อนหน้า
                                    backgroundColor: "#fff", // ใส่พื้นหลังเพื่อไม่ให้โปร่งใส
                                    zIndex: 1,
                                }
                                :
                                {
                                    textAlign: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }
                    }>
                    {
                        trips.Status === "รออนุมัติ" ?
                            <>
                                <Button variant="contained" color="warning" size="small" onClick={handleApprove} sx={{ marginRight: 1 }} fullWidth>อนุมัติ</Button>
                                <Button variant="contained" color="error" size="small" onClick={handleNonApprove} fullWidth>ไม่อนุมัติ</Button>
                            </>
                            :
                            <Button variant="text" size="small" fullWidth>-</Button>
                    }
                </TableCell> */}
            </TableRow>
        </React.Fragment>

    );
};

export default TripsDetail;
