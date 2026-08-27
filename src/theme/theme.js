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
    // panda: {
    //     main: '#5C8374',
    //     light: '#9EC8B9',
    //     dark: '#183D3D',
    //     contrastText: '#C7C8CC', //oldgreen
    // },
    // panda: {
    //     main: '#176B87',
    //     light: '#64CCC5',
    //     dark: '#04364A',
    //     contrastText: '#C7C8CC', //bluesea
    // },
    // panda: {
    //     main: '#C38154',
    //     light: '#FFC26F',
    //     dark: '#884A39',
    //     contrastText: '#C7C8CC', //brown
    // },
    // panda: {
    //     main: '#4A403A',
    //     light: '#454545',
    //     dark: '#1B1A17',
    //     contrastText: '#C7C8CC', //black
    // },
    // panda: {
    //     main: '#C7253E',
    //     light: '#E85C0D',
    //     dark: '#821131',
    //     contrastText: '#C7C8CC', //red
    // },
    // panda: {
    //     main: '#227B94',
    //     light: '#78B7D0',
    //     dark: '#16325B',
    //     contrastText: '#C7C8CC', //bluedark
    // },
    // panda: {
    //     main: '#EA5455',
    //     light: '#FFD460',
    //     dark: '#2D4059',
    //     contrastText: '#C7C8CC', //redyellowblue
    // },
    // panda: {
    //     main: '#30475E',
    //     light: '#F05454',
    //     dark: '#222831',
    //     contrastText: '#C7C8CC', //bluered
    // },
    // panda: {
    //     main: '#118AB2',
    //     light: '#06D6A0',
    //     dark: '#073B4C',
    //     contrastText: '#C7C8CC', //bluegreen
    // },
    // panda: {
    //     main: '#F78C6B',
    //     light: '#FFD166',
    //     dark: '#EF476F',
    //     contrastText: '#C7C8CC', //redandorange
    // },
    // panda: {
    //     main: '#42a2b9',
    //     light: '#96cfd5',
    //     dark: '#43435b',
    //     contrastText: '#C7C8CC', //bluelight
    // },
    // panda: {
    //     main: '#f36972',
    //     light: '#d5939e',
    //     dark: '#9e4c53',
    //     contrastText: '#C7C8CC', //pink
    // },
    // panda: {
    //     main: '#715e8e',
    //     light: '#B692C2',
    //     dark: '#49487a',
    //     contrastText: '#C7C8CC', //perple
    // },
    // panda: {
    //     main: '#79a887',
    //     light: '#aac7a1',
    //     dark: '#506656',
    //     contrastText: '#C7C8CC', //green
    // },
  },
});

export default theme;
