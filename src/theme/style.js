import { styled } from "@mui/material/styles";
import "@fontsource/sarabun";
import {
  Button,
  FormControlLabel,
  IconButton,
  Paper,
  TableCell,
  Typography,
} from "@mui/material";
import theme from "./theme";

const TablecellHeader = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.panda.light,
  color: theme.palette.primary.contrastText,
  textAlign: "center",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellSelling = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.panda.main,
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellTickets = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.success.dark,
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellSetting = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.warning.dark,
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellFinancial = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#689f38",
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellFinancialHead = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#558b2f",
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellCustomers = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.info.main,
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellYellow = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.yellow.dark,
  color: "black",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellPink = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.pink.dark,
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellGray = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#616161",
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TablecellInfo = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.info.main,
  color: theme.palette.primary.contrastText,
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "1px solid " + theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const TableCellG95 = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#FFC000",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "3px solid white",
  fontWeight: "bold",
}));

const TableCellG91 = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#92D050",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "3px solid white",
  fontWeight: "bold",
}));

const TableCellB7 = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#FFFF99",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "3px solid white",
  fontWeight: "bold",
}));

const TableCellB95 = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#B7DEE8",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "3px solid white",
  fontWeight: "bold",
}));

const TableCellE20 = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#C4BD97",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "3px solid white",
  fontWeight: "bold",
}));

const TableCellPWD = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#F141D8",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "3px solid white",
  fontWeight: "bold",
}));

const TableCellB20 = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#FF7F50",
  borderRightColor: theme.palette.primary.contrastText,
  borderLeft: "3px solid white",
  fontWeight: "bold",
}));

const RateOils = styled(Paper)(({ theme }) => ({
  height: 150,
  color: theme.palette.primary.contrastText,
  boxShadow: "1px 1px 2px 2px" + theme.palette.grey[300],
  borderRadius: 15,
}));

const ChooseButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.panda.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.panda.dark,
    color: theme.palette.primary.contrastText,
  },
  boxShadow: "3px 3px 6px 6px" + theme.palette.dark,
  borderRadius: 15,
}));

const FormCheckBox = styled(FormControlLabel)(({ theme }) => ({
  "& .MuiFormControlLabel-label": {
    fontSize: "13px", // ปรับขนาด font ที่นี่
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
  },
}));

const FormTypography = styled(Typography)(({ theme }) => ({
  fontFamily: "Arial, sans-serif",
  fontWeight: "bold",
  fontSize: "13px",
}));

const TablecellBody = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  borderLeft: "1px solid " + theme.palette.grey[500],
}));

const IconButtonInfo = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.panda.main,
    color: theme.palette.primary.contrastText,
  },
}));

const IconButtonOnNavbar = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.panda.dark,
  "&:hover": {
    backgroundColor: theme.palette.primary.contrastText,
    color: theme.palette.panda.dark,
  },
}));

const IconButtonError = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.primary.contrastText,
  },
}));

const IconButtonWarning = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.primary.contrastText,
  },
}));

const IconButtonSuccess = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.primary.contrastText,
  },
}));

const TablecellNoData = styled(TableCell)(({ theme }) => ({
  height: 200,
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: theme.palette.panda.dark,
  backgroundColor: theme.palette.panda.contrastText,
  opacity: 0.6,
}));

export {
  RateOils,
  FormCheckBox,
  FormTypography,
  ChooseButton,
  TablecellBody,
  TablecellHeader,
  TablecellNoData,
  IconButtonOnNavbar,
  IconButtonError,
  IconButtonWarning,
  IconButtonSuccess,
  IconButtonInfo,
  TablecellSelling,
  TablecellYellow,
  TablecellPink,
  TablecellGray,
  TablecellInfo,
  TableCellG95,
  TableCellG91,
  TableCellB7,
  TableCellB95,
  TableCellE20,
  TableCellPWD,
  TableCellB20,
  TablecellTickets,
  TablecellCustomers,
  TablecellFinancial,
  TablecellFinancialHead,
  TablecellSetting
};
