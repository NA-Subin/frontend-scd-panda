import React, { useContext, useEffect, useState } from "react";
import {
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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { IconButtonError, TablecellHeader } from "../../theme/style";
import EditNoteIcon from '@mui/icons-material/EditNote';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";

const TicketsStock = () => {
    const [update, setUpdate] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [ticket, setTicket] = React.useState([]);
    const [open, setOpen] = useState(1);
    const [setting, setSetting] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const getTicket = async () => {
        database.ref("/ticket-stock/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] })
            }
            setTicket(dataList);
        });
    };

    useEffect(() => {
        getTicket();
    }, []);

    const handleSetting = (rowId, TicketsName) => {
        setSetting(true);
        setNewName(TicketsName);
        setUpdate(rowId);
    };

    const handleSave = async () => {
        // บันทึกสถานะใหม่ไปยัง Firebase
        await database.ref(`/ticket-stock/${update - 1}`).update({ TicketsName: newName });
        setSetting(false);
        setNewName("");
    };

    return (
        <React.Fragment>
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light }}>
                <Grid container spacing={2}>
                    <Grid item xs={10}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตั๋วขายย่อย</Typography>
                    </Grid>
                    <Grid item xs={2} marginTop={-2}>
                        
                    </Grid>
                    <Grid item xs={12} marginTop={-2}>
                        <Divider />
                    </Grid>
                </Grid>
                <TableContainer
                    component={Paper}
                    style={{ maxHeight: "70vh" }}
                    sx={{ marginTop: 2 }}
                >
                    <Table stickyHeader size="small">
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                    รหัสตั๋ว
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ชื่อตั๋ว
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ที่อยู่
                                </TablecellHeader>
                                <TablecellHeader sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                ticket.sort((a, b) => a.Name.localeCompare(b.Name)).map((row,index) => (
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", fontSize: 16 }}>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                {
                                                    !setting ?
                                                        row.Name
                                                        :
                                                        <>
                                                            <Typography variant="subtitle2" gutterBottom sx={{ whiteSpace: 'nowrap', marginRight: 1 }}>ชื่อตั๋ว</Typography>
                                                            <TextField size="small" fullWidth value={newName} onChange={(e) => setNewName(e.target.value)} />
                                                        </>
                                                }
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", fontSize: 16 }}>
                                            {row.Address}
                                        </TableCell>
                                        <TableCell sx={{ width: 50 }} >
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {
                                                !setting ?
                                                    <Button variant="contained" color="warning" startIcon={<EditNoteIcon />} onClick={() => handleSetting(row.id, row.TicketsName)}>แก้ไข</Button>
                                                    :
                                                    <>
                                                        <Button variant="contained" color="error" onClick={() => setSetting(false)} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                        <Button variant="contained" color="success" onClick={handleSave}>บันทึก</Button>
                                                    </>
                                            }
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </React.Fragment>
    );
};

export default TicketsStock;
