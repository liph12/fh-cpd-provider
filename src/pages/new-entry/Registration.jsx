import {
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Box,
  Autocomplete,
  TextField,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  Badge,
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useState, useEffect } from "react";
import AxiosInstance from "../../config/AxiosInstance";
import logo from "../../assets/logo.png";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { LoadingButton } from "@mui/lab";
import Toast from "../../components/Toast";
import Confirmation from "../../components/Confirmation";
import { salesTeams } from "../data/teams";
import endorsementLetter from "../../assets/endorsement-letter-new-entry-level.jpg";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Registration() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [teams, setTeams] = useState(salesTeams);
  const [programs, setPrograms] = useState(null);
  const [onSubmitProgress, setOnSubmitProgress] = useState(false);
  const [isCutOff, setIsCutOff] = useState(false);
  const [gender, setGender] = useState([
    {
      id: 1,
      label: "Male",
      selected: false,
    },
    {
      id: 2,
      label: "Female",
      selected: false,
    },
  ]);
  const [entryData, setEntryData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    birthDate: "2000-01-01",
    address: "",
    gender: "Male",
    endorsementLetter: null,
    fireCerts: null,
    govId: null,
    rebPrcId: null,
    rebFullName: "",
    programId: null,
    salesTeam: null,
    onSuccess: false,
  });
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const handleCloseAlert = () => setAlert((prev) => ({ ...prev, open: !open }));

  const showAlert = (type, message) =>
    setAlert({ open: true, type: type, message: message });

  const setEntryByKey = (k, v) => setEntryData((prev) => ({ ...prev, [k]: v }));

  const handleChangeByKey = (k, v) => setEntryByKey(k, v);

  const handleChangeFields = (e) => {
    const key = e.target.name;
    const value = e.target.value;

    setEntryByKey(key, value);
  };

  const handleSubmitEntry = async () => {
    try {
      const formData = new FormData();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const acceptedFileTypes = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      let fileTypeCheckerCtr = 0;
      let fieldCheckerCtr = 0;

      Object.keys(entryData).forEach((k) => {
        const field = entryData[k];
        const validField = field !== "";
        const isNotFile =
          k !== "endorsementLetter" ||
          k !== "fireCerts" ||
          k !== "govId" ||
          k !== "rebPrcId";

        if (validField && isNotFile) {
          formData.append(k, field);
        } else {
          if (isNotFile) {
            fieldCheckerCtr++;
          }
        }

        if (field === null && k !== "rebPrcId") {
          fieldCheckerCtr++;
        }
      });

      console.log(fieldCheckerCtr);

      const hasEmptyField_s = fieldCheckerCtr > 0;

      if (hasEmptyField_s) {
        showAlert("error", "Please fill up empty fields.");

        return;
      }

      if (!emailRegex.test(entryData.email)) {
        showAlert("error", "Email provided is not valid.");

        return;
      }

      if (entryData.rebPrcId !== null) {
        if (acceptedFileTypes.includes(entryData.rebPrcId[0].type)) {
          formData.append(`rebPrcIdFile`, entryData.rebPrcId[0]);
        } else {
          fileTypeCheckerCtr++;
        }
      }

      if (acceptedFileTypes.includes(entryData.endorsementLetter[0].type)) {
        formData.append(
          `endorsementLetterFile`,
          entryData.endorsementLetter[0]
        );
      } else {
        fileTypeCheckerCtr++;
      }

      if (acceptedFileTypes.includes(entryData.govId[0].type)) {
        formData.append(`govIdFile`, entryData.govId[0]);
      } else {
        fileTypeCheckerCtr++;
      }

      Array.from(entryData.fireCerts).map((file, index) => {
        if (acceptedFileTypes.includes(file.type)) {
          formData.append(`fireCertFiles[${index}]`, file);
        } else {
          fileTypeCheckerCtr++;
        }
      });

      if (fileTypeCheckerCtr > 0) {
        showAlert(
          "error",
          "Files should be in .png, .jpg, jpeg, and .docx format only."
        );

        return;
      }

      setOnSubmitProgress(true);
      const response = await AxiosInstance.post("store-new-entry", formData, {
        headers: {
          "Content-Type": "enctype/form-data",
        },
      });

      if (response.status === 200) {
        showAlert("success", "CPD Registration successfully submitted.");
        setEntryByKey("onSuccess", true);
      }
    } catch (e) {
      if (!e?.response) {
        console.log(e);

        return;
      }

      if (e.response.status === 403) {
        const message = e.response.data.message;

        showAlert("warning", message);
      } else {
        showAlert("error", "Something went wrong.");
      }
    } finally {
      setOnSubmitProgress(false);
    }
  };

  const resetSelection = () => {
    const tmpPrograms = [...programs];

    for (let idx in tmpPrograms) {
      tmpPrograms[idx].selected = false;
    }

    setPrograms(tmpPrograms);
  };

  const handleSelectProgram = (idx) => {
    const tmpPrograms = [...programs];
    const prog = tmpPrograms[idx];

    if (prog.entries !== prog.slots) {
      resetSelection();

      tmpPrograms[idx].selected = true;

      setEntryByKey("programId", parseInt(tmpPrograms[idx].id));
      setPrograms(tmpPrograms);
    }
  };

  useEffect(() => {
    const cutoffDate = "2024-06-20";
    const cutoffTime = "12:00:00";
    const cutoffDateTime = new Date(`${cutoffDate}T${cutoffTime}+08:00`);
    const now = new Date();
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const formattedNow = formatter.format(now);
    const [month, day, year, hour, minute, second] = formattedNow.match(/\d+/g);
    const manilaNow = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`
    );

    if (manilaNow >= cutoffDateTime) {
      setIsCutOff(true);
    }

    const fetchCPDPrograms = async () => {
      const response = await AxiosInstance.get("new-entry-programs");
      const { data } = response.data;
      const { newEntryPrograms } = data;
      const updatedPrograms = newEntryPrograms.map((program) => ({
        ...program,
        selected: false,
      }));

      setPrograms(updatedPrograms);
    };

    fetchCPDPrograms();
  }, []);

  return (
    <>
      <Toast
        message={alert.message}
        open={alert.open}
        severinty={alert.type}
        handleClose={handleCloseAlert}
      />
      {entryData.onSuccess ? (
        <Confirmation email={entryData.email} admin_type={"new-entry"} />
      ) : (
        <Box sx={{ justifyContent: "center", display: "flex" }}>
          <Box sx={{ width: desktop ? "50vw" : 400, m: 10 }}>
            <Paper sx={{ minHeight: "auto", m: 2, p: 3 }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <img src={logo} alt="Logo" height={desktop ? 180 : 100} />{" "}
              </Box>
              <Divider sx={{ mb: 5 }} />
              <Box sx={{ mb: desktop ? 5 : 3 }}>
                <Typography
                  variant={desktop ? "h4" : "h5"}
                  color="gray"
                  component="div"
                  sx={{ mt: 3, mb: 1, textAlign: "center" }}
                >
                  New Entry Level Registration
                </Typography>
                <Box>
                  {programs !== null && (
                    <Box sx={{ overflow: desktop ? "none" : "auto" }}>
                      <Table
                        size="small"
                        sx={{
                          my: 2,
                          width: desktop ? "100%" : "100vw",
                        }}
                      >
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#3333" }}>
                            <TableCell align="left">
                              <b>TITLE</b>
                            </TableCell>
                            <TableCell align="left">
                              <b>SCHEDULE</b>
                            </TableCell>
                            <TableCell align="left">
                              <b>UNITS</b>
                            </TableCell>
                            <TableCell align="left">
                              <b>SLOTS</b>
                            </TableCell>
                            <TableCell align="left">
                              <b>STATUS</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {programs.map((program, idx) => (
                            <TableRow
                              key={idx}
                              sx={{
                                transition: "background-color 0.3s ease",
                                "&:hover": {
                                  backgroundColor: "#ed3954",
                                  cursor: "pointer",
                                  "& .MuiTableCell-root": {
                                    color: "#fff",
                                  },
                                },
                                "& .MuiTableCell-root": {
                                  color: program.selected ? "#fff" : "#000",
                                },
                                backgroundColor: program.selected
                                  ? "#ed3954"
                                  : "none",
                              }}
                              onClick={() => handleSelectProgram(idx)}
                            >
                              <TableCell align="left">
                                {program.title}
                              </TableCell>
                              <TableCell align="left">
                                {program.date_from} - {program.date_to}
                              </TableCell>
                              <TableCell align="left">
                                {program.credit_units}
                              </TableCell>
                              <TableCell align="left">
                                {program.entries} / {program.slots}
                              </TableCell>
                              <TableCell align="center">
                                {program.entries === program.slots ? (
                                  <Badge color="error" badgeContent="closed" />
                                ) : (
                                  <Badge
                                    color="success"
                                    badgeContent="available"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    color="gray"
                    component="div"
                    sx={{ my: 2 }}
                  >
                    Please click a row to select a program.
                  </Typography>
                  <Typography
                    variant="body2"
                    color="gray"
                    component="div"
                    sx={{ my: 2 }}
                  >
                    Don't have the endrosement letter yet?{" "}
                    <a href={endorsementLetter} download>
                      Please click here to download.
                    </a>
                    <br />
                    Print and complete the form, then upload it as a scanned
                    copy or photo.
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={3}>
                <Grid item lg={6} md={6} xs={12}>
                  <TextField
                    fullWidth
                    name="firstName"
                    variant="outlined"
                    color="error"
                    label="First Name"
                    size="small"
                    value={entryData.firstName}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <TextField
                    fullWidth
                    name="middleName"
                    variant="outlined"
                    color="error"
                    label="Middle Name (Put N/A if not applicable)"
                    size="small"
                    value={entryData.middleName}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <TextField
                    fullWidth
                    name="lastName"
                    variant="outlined"
                    color="error"
                    label="Last Name"
                    size="small"
                    value={entryData.lastName}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <TextField
                    fullWidth
                    name="email"
                    variant="outlined"
                    color="error"
                    label="Email Address"
                    size="small"
                    value={entryData.email}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <TextField
                    fullWidth
                    name="mobileNumber"
                    variant="outlined"
                    color="error"
                    label="Mobile Number"
                    size="small"
                    value={entryData.mobileNumber}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    name="birthDate"
                    variant="outlined"
                    color="error"
                    label="Birth Date"
                    size="small"
                    value={entryData.birthDate}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Autocomplete
                    fullWidth
                    size="small"
                    color="error"
                    options={gender}
                    onChange={(e, v) => handleChangeByKey("gender", v?.label)}
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === "" ||
                      option.label === value
                    }
                    value={entryData.gender}
                    renderInput={(params) => (
                      <TextField {...params} label="Gender" color="error" />
                    )}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Autocomplete
                    fullWidth
                    size="small"
                    color="error"
                    options={teams}
                    onChange={(e, v) =>
                      handleChangeByKey("salesTeam", v?.label)
                    }
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === "" ||
                      option.label === value
                    }
                    value={entryData.salesTeam}
                    renderInput={(params) => (
                      <TextField {...params} label="Sales Team" color="error" />
                    )}
                  />
                </Grid>
                <Grid item lg={12} md={12} xs={12}>
                  <TextField
                    fullWidth
                    name="address"
                    variant="outlined"
                    color="error"
                    label="Address"
                    size="small"
                    value={entryData.address}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={12} md={12} xs={12}>
                  <TextField
                    fullWidth
                    name="rebFullName"
                    variant="outlined"
                    color="error"
                    label="REB Full Name"
                    size="small"
                    value={entryData.rebFullName}
                    onChange={handleChangeFields}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Button
                    component="label"
                    role={undefined}
                    color="error"
                    startIcon={<Icons.CloudUpload />}
                    variant={
                      entryData.endorsementLetter?.length
                        ? "contained"
                        : "outlined"
                    }
                    fullWidth
                  >
                    Endorsement Letter* (
                    {entryData.endorsementLetter?.length ?? 0})
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e) =>
                        handleChangeByKey("endorsementLetter", e.target.files)
                      }
                    />
                  </Button>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Button
                    component="label"
                    role={undefined}
                    color="error"
                    startIcon={<Icons.CloudUpload />}
                    variant={entryData.govId?.length ? "contained" : "outlined"}
                    fullWidth
                  >
                    Valid Government ID* ({entryData.govId?.length ?? 0})
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e) =>
                        handleChangeByKey("govId", e.target.files)
                      }
                    />
                  </Button>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Button
                    component="label"
                    role={undefined}
                    color="error"
                    startIcon={<Icons.CloudUpload />}
                    variant={
                      entryData.fireCerts?.length ? "contained" : "outlined"
                    }
                    fullWidth
                  >
                    FIRE Certificates* ({entryData.fireCerts?.length ?? 0})
                    <VisuallyHiddenInput
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleChangeByKey("fireCerts", e.target.files)
                      }
                    />
                  </Button>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Button
                    component="label"
                    role={undefined}
                    color="error"
                    startIcon={<Icons.CloudUpload />}
                    variant={
                      entryData.rebPrcId?.length ? "contained" : "outlined"
                    }
                    fullWidth
                  >
                    REB PRC ID ({entryData.rebPrcId?.length ?? 0})
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e) =>
                        handleChangeByKey("rebPrcId", e.target.files)
                      }
                    />
                  </Button>
                </Grid>
              </Grid>
              <Box sx={{ my: 3 }}>
                <LoadingButton
                  fullWidth
                  startIcon={<Icons.PersonAdd />}
                  loading={onSubmitProgress}
                  variant="contained"
                  loadingIndicator="Submitting..."
                  color="error"
                  disableElevation
                  disabled={entryData.programId === null}
                  onClick={handleSubmitEntry}
                >
                  Submit
                </LoadingButton>
              </Box>
              <Typography
                color="gray"
                variant="body1"
                sx={{ textAlign: "center" }}
              >
                CPD Provider | Filipino Homes © 2024
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}
    </>
  );
}
