import { createTheme } from "@mui/material";
import "@fontsource/noto-sans-thai";

const theme = createTheme({
  typography: {
    fontFamily: '"Sarabun", sans-serif',
    fontWeight: 800,
    fontStyle: "normal",
  },
  palette: {
    panda: {
      main: "#244873",
      light: "#cf444a",
      dark: "#172e4a",
      contrastText: "#C7C8CC",
    },
    info: {
      main: "#244873",
      light: "#417fca",
      dark: "#172e4a",
      contrastText: "#ffffff",
    },
    pink: {
      main: "#f06d99ff",
      light: "#f8bbd0",
      dark: "#e34c7ef0",
      contrastText: "#ffffff",
    },
    yellow: {
      main: "#fdd835",
      light: "#ffee58",
      dark: "#fbc02d",
      contrastText: "#000000ff",
    },
  },
});

export default theme;
