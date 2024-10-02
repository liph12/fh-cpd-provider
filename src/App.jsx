import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";
import AxiosInstance from "./config/AxiosInstance";
import CPDRegistration from "./pages/cpd/Registration";
import NewEntryRegistration from "./pages/new-entry/Registration";
import Admin from "./pages/Admin";

AxiosInstance.defaults.withCredentials = false;
AxiosInstance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("auth_token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

export default function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Google Sans, sans-serif",
      body1: {
        fontFamily: "Google Sans, sans-serif",
      },
    },
    palette: {
      type: "light",
      primary: {
        main: "#2d50d3",
      },
      secondary: {
        main: "#secondary",
      },
      success: {
        main: "#0F5818",
      },
      danger: {
        main: "#db2a2a",
      },
      dark: {
        main: "#0E0E0E",
      },
      warning: {
        main: "#cb9f00",
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/cpd/registration" element={<CPDRegistration />} />
        <Route
          path="/new-entry/registration"
          element={<NewEntryRegistration />}
        />
        <Route path="/:admin_type/master/:prog_id" element={<Admin />} />
      </Routes>
    </ThemeProvider>
  );
}
