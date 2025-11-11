import {
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Box,
  Autocomplete,
  TextField,
  LinearProgress,
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useState, useEffect } from "react";
import AxiosInstance from "../config/AxiosInstance";
import logo from "../assets/logo.png";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { LoadingButton } from "@mui/lab";
import Toast from "../components/Toast";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CPDConfirmationModal from "../components/cpd/ConfirmationModal";
import NewEntryConfirmationModal from "../components/new-entry/ConfirmationModal";
import { useParams } from "react-router-dom";

export default function Admin() {
  const { admin_type, prog_id } = useParams();
  const NEW_ENTRY = "new-entry";
  const CPD = "cpd";

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const jsonUserData = localStorage.getItem("cpdUserData");
  const jsonData = jsonUserData !== null ? JSON.parse(jsonUserData) : null;
  const [userData, setUserData] = useState(jsonData);
  const [entries, setEntries] = useState([]);
  const [rows, setRows] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [authFields, setAuthFields] = useState({
    email: "filipinohomes.cpdprovider@gmail.com",
    password: "",
  });
  const [onSubmitProgress, setOnSubmitProgress] = useState(false);
  const [onFetchProgress, setOnFetchProgress] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [selectedEntryData, setSelectedEntryData] = useState(null);

  const handleCloseConfirmation = () => setOpenConfirmation(false);
  const handleOpenConfirmation = (idx) => {
    const selectedData = rows.find((row) => row.id === idx);
    console.log(selectedData);

    setSelectedEntryData(selectedData);
    setOpenConfirmation(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "Firstname", width: 150 },
    { field: "middleName", headerName: "Middlename", width: 150 },
    { field: "lastName", headerName: "Lastname", width: 150 },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "createdAt",
      headerName: "Reg. Date",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        let color = "warning";

        switch (params.row.status) {
          case "approved":
            color = "success";
            break;
          case "disapproved":
            color = "danger";
            break;
        }

        return (
          <Typography
            sx={{
              display: "inline-block",
              px: 1,
              borderRadius: 5,
              backgroundColor: `${color}.main`,
            }}
            color="white"
            variant="body2"
            component="div"
          >
            {params.row.status}
          </Typography>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleOpenConfirmation(params.id)}
          size="small"
        >
          View
        </Button>
      ),
    },
  ];

  const handleCloseAlert = () => setAlert((prev) => ({ ...prev, open: !open }));

  const showAlert = (type, message) =>
    setAlert({ open: true, type: type, message: message });

  const handleSubmitSignIn = async () => {
    try {
      setOnSubmitProgress(true);

      const jsonParams = JSON.stringify(authFields);
      const response = await AxiosInstance.post("sign-in", jsonParams, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const { user, auth_token } = response.data[0];
        const jsonUser = JSON.stringify(user);

        localStorage.setItem("auth_token", auth_token);
        localStorage.setItem("cpdUserData", jsonUser);
        setUserData(user);
        initData();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setOnSubmitProgress(false);
    }
  };

  const fetchCPDEntries = async () => {
    try {
      setOnFetchProgress(true);
      const response = await AxiosInstance.get(`cpd-entries?id=${prog_id}`);
      const { data } = response.data;
      const entriesData = data.cpd_entries;

      const rowsEntry = entriesData.map((entry) => {
        const {
          first_name,
          middle_name,
          last_name,
          email,
          designation,
          sales_team,
          mobile_number,
          uploaded_file,
          status,
          createdAt,
          id,
        } = entry;

        return {
          id: id,
          firstName: first_name,
          middleName: middle_name,
          lastName: last_name,
          email: email,
          createdAt: createdAt,
          status: status,
          designation: designation,
          salesTeam: sales_team,
          mobile: mobile_number,
          fileURLs: uploaded_file,
        };
      });

      setRows(rowsEntry);
      setEntries(entriesData);
    } catch (e) {
      console.log(e);
    } finally {
      setOnFetchProgress(false);
    }
  };

  const fetchNewEntries = async () => {
    try {
      setOnFetchProgress(true);
      const response = await AxiosInstance.get(`new-entries?id=${prog_id}`);
      const { data } = response.data;
      const newEntriesData = data.newEntries;

      const rowsEntry = newEntriesData.map((entry) => {
        const {
          first_name,
          middle_name,
          last_name,
          email,
          sales_team,
          mobile_number,
          uploaded_files,
          status,
          createdAt,
          id,
        } = entry;

        return {
          id: id,
          firstName: first_name,
          middleName: middle_name,
          lastName: last_name,
          email: email,
          createdAt: createdAt,
          status: status,
          salesTeam: sales_team,
          mobile: mobile_number,
          fileURLs: JSON.stringify(uploaded_files),
        };
      });

      setRows(rowsEntry);
      setEntries(newEntriesData);
    } catch (e) {
      console.log(e);
    } finally {
      setOnFetchProgress(false);
    }
  };

  const initData = () => {
    switch (admin_type) {
      case NEW_ENTRY:
        fetchNewEntries();
        break;
      case CPD:
        fetchCPDEntries();
        break;
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <>
      {userData === null ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: desktop ? "25vw" : 400, m: 10 }}>
            <Paper sx={{ minHeight: "auto", m: 2, p: 3, textAlign: "center" }}>
              <Icons.AdminPanelSettings sx={{ fontSize: 50 }} color="error" />
              <Typography
                variant={desktop ? "h5" : "h6"}
                color="gray"
                component="div"
                sx={{ my: 1 }}
              >
                Sign In
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                name="email"
                variant="outlined"
                color="error"
                label="Email"
                size="small"
                value={authFields.email}
                disabled
                sx={{ my: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                name="password"
                variant="outlined"
                color="error"
                label="Password"
                size="small"
                onChange={(e) =>
                  setAuthFields((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                value={authFields.password}
                sx={{ my: 2 }}
              />
              <LoadingButton
                fullWidth
                variant="contained"
                size="small"
                color="error"
                loading={onSubmitProgress}
                loadingIndicator="Submitting..."
                startIcon={<Icons.Login />}
                onClick={handleSubmitSignIn}
                sx={{ my: 2 }}
              >
                Submit
              </LoadingButton>
              <Typography
                color="gray"
                variant="body1"
                sx={{ textAlign: "center", mt: 2 }}
              >
                CPD Provider | Filipino Homes © 2024
              </Typography>
            </Paper>
          </Box>
        </Box>
      ) : (
        <>
          {selectedEntryData !== null && (
            <>
              {admin_type === NEW_ENTRY ? (
                <NewEntryConfirmationModal
                  open={openConfirmation}
                  handleClose={handleCloseConfirmation}
                  data={selectedEntryData}
                  setRows={setRows}
                  rows={rows}
                  showAlert={showAlert}
                  alert={alert}
                  handleCloseAlert={handleCloseAlert}
                />
              ) : (
                <CPDConfirmationModal
                  open={openConfirmation}
                  handleClose={handleCloseConfirmation}
                  data={selectedEntryData}
                  setRows={setRows}
                  rows={rows}
                  showAlert={showAlert}
                  alert={alert}
                  handleCloseAlert={handleCloseAlert}
                  programId={prog_id}
                />
              )}
            </>
          )}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: desktop ? "83vw" : "100vw" }}>
              <Paper sx={{ minHeight: "70vh", m: 2, p: 3 }}>
                <Typography
                  variant={desktop ? "h5" : "h6"}
                  color="gray"
                  component="div"
                  sx={{ my: 1 }}
                >
                  List of{" "}
                  {admin_type === CPD
                    ? "CPD Entries"
                    : "Registrants for New Entry Level"}
                </Typography>
                <Box sx={{ m: desktop ? 6 : 0 }}>
                  <Box sx={{ width: "auto" }}>
                    {onFetchProgress && <LinearProgress color="error" />}
                    <DataGrid
                      rows={rows}
                      sx={{ borderRadius: 0 }}
                      columns={columns}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 10 },
                        },
                      }}
                      pageSizeOptions={[10, 15, 20]}
                      checkboxSelection
                      slots={{ toolbar: GridToolbar }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}
