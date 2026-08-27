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
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PasswordIcon from '@mui/icons-material/Password';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { IconButtonError, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import theme from "../../theme/theme";

const SettingA = (props) => {
    const { employee } = props;
    const [setting,setSetting] = React.useState(true);
    console.log("show",employee);


  return (
    <React.Fragment>
        <Grid container spacing={2} marginTop={3}>
            <Grid item xs={12} textAlign="center">
                {
                    setting && 
                    <Button variant="contained" color="warning" onClick={() => setSetting(!setting)}>แก้ไขรหัสผ่าน</Button>
                }
            </Grid>
            {
                !setting &&
                <>
                    <Grid item xs={2}/>
                    <Grid item xs={8}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>รหัสผ่านใหม่</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                    </Grid> 
                    <Grid item xs={2}/>
                    <Grid item xs={2}/>
                    <Grid item xs={8}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>รหัสผ่านอีกครั้ง</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                    </Grid> 
                    <Grid item xs={2}/>
                    <Grid item xs={12} textAlign="center">
                    <Button variant="contained" color="error" onClick={() => setSetting(!setting)} sx={{ marginRight: 1 }} >ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={() => setSetting(!setting)}>บันทึก</Button>
                    </Grid>
                </>
            }
        </Grid>
    </React.Fragment>
  );
};

export default SettingA;
