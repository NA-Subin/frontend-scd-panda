import React, { useContext, useEffect, useState } from "react";
import {
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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { database } from "../../server/firebase";

const InsertType = (props) => {
    const { typeFinancial } = props;
    const [open, setOpen] = React.useState(true);
    const [name, setName] = React.useState("");

    const handleSave = () => {
        database.ref("financial/type").child(typeFinancial.length).set(name)
        setOpen(true);
        setName("");
    }

    return (
        <React.Fragment>
            {
                !open ?
                    <>
                        <Paper sx={{ width: "150px", height: "30px", marginTop: 0.5 }}>
                            <TextField
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                InputProps={{
                                    sx: {
                                        fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                        height: "30px",  // ความสูงของ Input
                                        padding: "10px", // Padding ภายใน Input
                                        fontWeight: "bold",
                                    },
                                }}
                            />
                        </Paper>
                        <Tooltip title="ยกเลิก" placement="left">
                            <IconButton color="error" onClick={() => setOpen(true)}>
                                <CancelIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="บันทึก" placement="right">
                            <IconButton color="success" onClick={handleSave}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                    :
                    <Tooltip title="เพิ่มประเภท" placement="right">
                        <IconButton color="primary" onClick={() => setOpen(false)}>
                            <AddCircleIcon />
                        </IconButton>
                    </Tooltip>
            }
        </React.Fragment>

    );
};

export default InsertType;
