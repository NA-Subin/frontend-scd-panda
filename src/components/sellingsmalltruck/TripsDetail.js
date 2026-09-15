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
import { apiPut } from "../../server/apiClient";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import UpdateTrip from "./UpdateTrip";
import { formatThaiSlash } from "../../theme/DateTH";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const TripsDetail = (props) => {
    const { trips, windowWidth, index, maxOrder } = props;
    const [approve, setApprove] = React.useState(false);
    const {small} = useBasicData();
    const {refetch} = useTripData();

    const smalls = Object.values(small || {}).filter((item) => item.StatusTruck !== "ยกเลิก");

    const handleApprove = async () => {
        try {
            await apiPut(`/api/trip/${trips.uuid}`, { Status: "อนุมัติแล้ว" });
            ShowSuccess("อนุมัติเที่ยววิ่งเรียบร้อย");
            refetch?.();
        } catch (error) {
            ShowError("อนุมัติเที่ยววิ่งไม่สำเร็จ");
            console.error("Error updating data:", error);
        }
    };

    const handleNonApprove = async () => {
        try {
            await apiPut(`/api/trip/${trips.uuid}`, { Status: "ไม่อนุมัติ" });
            ShowSuccess("ไม่อนุมัติเที่ยววิ่งเรียบร้อย");
            refetch?.();
        } catch (error) {
            ShowError("ไม่อนุมัติเที่ยววิ่งไม่สำเร็จ");
            console.error("Error updating data:", error);
        }
    };

    const ShortName = smalls.find((t) => t.uuid === trips.Registration)?.ShortName || "-";

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{formatThaiSlash(dayjs(trips.DateReceive, "DD/MM/YYYY"))}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{formatThaiSlash(dayjs(trips.DateDelivery, "DD/MM/YYYY"))}</TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                    <Box sx={{ marginLeft: 2 }}>
                        {
                            trips.DriverName !== undefined
                                ? trips.DriverName
                                : trips.Driver
                        }
                        {" / "}
                        <Typography
                            component="span"
                            variant="body2"
                            sx={{
                                color: !trips?.Registration ? theme.palette.error.dark : "black"
                            }}
                        >
                            {(() => {
                                if (!trips?.Registration) {
                                    return "(ยังไม่ได้เลือกทะเบียนรถ)";
                                }

                                return trips.RegistrationName
                                    || smalls.find((t) => t.uuid === trips.Registration)?.RegHead
                                    || "-";
                            })()}
                        </Typography>
                    </Box>
                </TableCell>
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
            </TableRow>
        </React.Fragment>

    );
};

export default TripsDetail;
