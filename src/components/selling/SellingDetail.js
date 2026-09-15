import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
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
import { IconButtonError, RateOils, TableCellB20, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD } from "../../theme/style";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import theme from "../../theme/theme";

const SellingDetail = (props) => {
    const {
        detail,
        ticketsTrip,
        orders,
        onSendBack,
        onDelete,
        onAddProduct,
        onUpdateOrder,
        editMode,
        depots
    } = props;

    const orderG91 = detail.Product?.G91 || {};
    const orderG95 = detail.Product?.G95 || {};
    const orderB7 = detail.Product?.B7 || {};
    const orderB95 = detail.Product?.B95 || {};
    const orderE20 = detail.Product?.E20 || {};
    const orderPWD = detail.Product?.PWD || {};

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 50, padding: "1px 4px", backgroundColor: theme.palette.info.main, color: "white" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.id + 1}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 350, padding: "1px 4px" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                        {
                            detail.TicketNameName
                        }
                    </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 100, padding: "1px 4px" }}>
                    {
                        editMode ?
                            (
                                depots.split(":")[1] === "ลำปาง" ?
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
                                            type="number"
                                            inputProps={{
                                                step: 0.01,
                                                min: 0
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px',
                                                },
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '22px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    padding: '2px 6px',
                                                    textAlign: 'center',
                                                    paddingLeft: 2
                                                },
                                            }}
                                            value={detail.Rate1 ?? 0.75}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onUpdateOrder("Rate1", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onUpdateOrder("Rate1", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onUpdateOrder("Rate1", 0.75);
                                            }}
                                        />
                                    </Paper>
                                    : depots.split(":")[1] === "พิจิตร" ?
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: 0.01,
                                                    min: 0
                                                }}
                                                InputLabelProps={{
                                                    sx: {
                                                        fontSize: '12px',
                                                    },
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        padding: '2px 6px',
                                                        textAlign: 'center',
                                                        paddingLeft: 2
                                                    },
                                                }}
                                                value={detail.Rate2 ?? 0.75}
                                                onChange={(e) => {
                                                    let newValue = e.target.value;
                                                    onUpdateOrder("Rate2", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") onUpdateOrder("Rate2", "");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") onUpdateOrder("Rate2", 0.75);
                                                }}
                                            />
                                        </Paper>
                                        :
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: 0.01,
                                                    min: 0
                                                }}
                                                InputLabelProps={{
                                                    sx: {
                                                        fontSize: '12px',
                                                    },
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        padding: '2px 6px',
                                                        textAlign: 'center',
                                                        paddingLeft: 2
                                                    },
                                                }}
                                                value={detail.Rate3 ?? 0.75}
                                                onChange={(e) => {
                                                    let newValue = e.target.value;
                                                    onUpdateOrder("Rate3", newValue === "" ? "" : Number(newValue.replace(/^0+(?=\d)/, "")));
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") onUpdateOrder("Rate3", "");
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") onUpdateOrder("Rate3", 0.75);
                                                }}
                                            />
                                        </Paper>
                            )
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Rate || 0.75}</Typography>
                    }
                </TableCell>
                <TableCellG95 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            textAlign: 'center',
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.G95?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("G95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("G95", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("G95", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G95?.Volume || "-"}</Typography>
                    }
                </TableCellG95>
                <TableCellB95 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            textAlign: 'center',
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B95?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B95", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B95", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B95?.Volume || "-"}</Typography>
                    }
                </TableCellB95>
                <TableCellB7 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            textAlign: 'center',
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B7?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B7", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B7", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B7", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B7?.Volume || "-"}</Typography>
                    }
                </TableCellB7>
                <TableCellG91 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            textAlign: 'center',
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.G91?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("G91", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("G91", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("G91", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G91?.Volume || "-"}</Typography>
                    }
                </TableCellG91>
                <TableCellE20 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            textAlign: 'center',
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.E20?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("E20", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("E20", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("E20", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.E20?.Volume || "-"}</Typography>
                    }
                </TableCellE20>
                <TableCellPWD sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            textAlign: 'center',
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.PWD?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("PWD", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("PWD", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("PWD", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.PWD?.Volume || "-"}</Typography>
                    }
                </TableCellPWD>
                <TableCellB20 sx={{ textAlign: "center", height: "20px", width: 60 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth type="number"
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            textAlign: 'center',
                                            paddingLeft: 2
                                        },
                                    }}
                                    value={detail.Product?.B20?.Volume || ""}
                                    onChange={(e) => {
                                        let newValue = e.target.value;
                                        onAddProduct("B20", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0") onAddProduct("B20", "Volume", "");
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") onAddProduct("B20", "Volume", 0);
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B20?.Volume || "-"}</Typography>
                    }
                </TableCellB20>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 80 }} >
                    {
                        editMode ?
                            <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }} onClick={onDelete}>ยกเลิก</Button>
                            : ""
                    }
                </TableCell>
            </TableRow>
        </React.Fragment>

    );
};

export default SellingDetail;
