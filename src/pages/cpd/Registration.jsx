import {
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Box,
  Autocomplete,
  TextField,
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
import { useParams } from "react-router-dom";

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
  const { prog_id } = useParams();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [teams, setTeams] = useState(salesTeams);
  const [CPDPrograms, setCPDPrograms] = useState([]);
  const [program, setProgram] = useState(null);
  const [onSubmitProgress, setOnSubmitProgress] = useState(false);
  const [isCutOff, setIsCutOff] = useState(false);
  const [designations, setDesignations] = useState([
    {
      id: 1,
      label: "Real Estate Salesperson",
      selected: false,
    },
    {
      id: 2,
      label: "Real Estate Broker",
      selected: false,
    },
  ]);
  const [entryData, setEntryData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    designation: "Real Estate Salesperson",
    files: null,
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

      console.log(entryData.files);

      Object.keys(entryData).forEach((k) => {
        const field = entryData[k];
        const validField = field !== "";

        if (validField && k !== "files") {
          formData.append(k, field);
        } else {
          if (k !== "files") {
            fieldCheckerCtr++;
          }
        }

        if (field === null) {
          fieldCheckerCtr++;
        }
      });

      const hasEmptyField_s = fieldCheckerCtr > 0;

      if (hasEmptyField_s) {
        showAlert("error", "Please fill up empty fields.");

        return;
      }

      if (!emailRegex.test(entryData.email)) {
        showAlert("error", "Email provided is not valid.");

        return;
      }

      Array.from(entryData.files).map((file, index) => {
        if (acceptedFileTypes.includes(file.type)) {
          formData.append(`files[${index}]`, file);
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
      const response = await AxiosInstance.post("store-entry", formData, {
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

  const initializeRegistration = async (cutoffDate, closed) => {
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
    const isCutOff = manilaNow >= cutoffDateTime || closed;
    setIsCutOff(isCutOff);
  };

  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetch(
        "https://api.leuteriorealty.com/lr/v1/public/api/teams"
      );
      const data = await response.json();

      data.push({ id: data.length + 1, teamname: "Non-Filipino Homes" });

      const teamAutoComplete = data.map((team) => ({
        ...team,
        label: team.teamname,
      }));

      setTeams(teamAutoComplete);
    };

    const fetchCPDPrograms = async () => {
      const programId = parseInt(prog_id) - 1;
      const response = await AxiosInstance.get("cpd-programs");
      const { data } = response.data;
      const programs = data.cpd_programs.map((program) => {
        return {
          ...program,
          label: program.title,
        };
      });
      const currentProgram = programs[programId];
      setCPDPrograms(programs);
      setProgram(currentProgram);
      setEntryByKey("programId", parseInt(currentProgram.id));
      initializeRegistration(
        currentProgram.date_from,
        currentProgram.status === "closed"
      );
    };

    // fetchTeams();
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
        <Confirmation email={entryData.email} />
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
                  sx={{ mt: 3, mb: 1 }}
                >
                  CPD Registration
                </Typography>
                <Box>
                  {program !== null && (
                    <>
                      <br />
                      <Typography variant="h5" component="div" color="gray">
                        Program Details:
                      </Typography>
                      <Typography variant="body1" component="div">
                        <span style={{ color: "gray" }}>Title :</span>{" "}
                        {program.title}
                      </Typography>
                      <br />
                      <Typography variant="body1" component="div">
                        <span style={{ color: "gray" }}>
                          Accreditation No. :
                        </span>{" "}
                        {program.accreditation_number}
                      </Typography>
                      <Typography variant="body1" component="div">
                        <span style={{ color: "gray" }}>Provider No. :</span>{" "}
                        {program.provider_number}
                      </Typography>
                      <Typography variant="body1" component="div">
                        <span style={{ color: "gray" }}>Date :</span>{" "}
                        {program.date_from}
                      </Typography>
                      <Typography variant="body1" component="div">
                        <span style={{ color: "gray" }}>Credit Units :</span>{" "}
                        {program.credit_units}
                      </Typography>
                      <Typography variant="body1" component="div">
                        <span style={{ color: "gray" }}>Slots :</span>{" "}
                        {program.entries} / {program.slots}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" component="div" color="error">
                    <span style={{ color: "gray" }}>Note :</span> Fill-out name
                    as registered in PRC
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
                    onChange={handleChangeFields}
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
                <Grid item lg={6} md={6} xs={12}>
                  <Autocomplete
                    fullWidth
                    size="small"
                    color="error"
                    options={designations}
                    onChange={(e, v) =>
                      handleChangeByKey("designation", v?.label)
                    }
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === "" ||
                      option.label === value
                    }
                    value={entryData.designation}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Designation"
                        color="error"
                      />
                    )}
                  />
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Button
                    component="label"
                    role={undefined}
                    color="error"
                    startIcon={<Icons.CloudUpload />}
                    // disabled={!onEdit}
                    variant="outlined"
                    fullWidth
                  >
                    {entryData.designation === "Real Estate Salesperson"
                      ? `PRC Cert/Reso. No.${
                          entryData.files !== null
                            ? `(${entryData.files.length})`
                            : ``
                        }`
                      : `PRC Reb ID${
                          entryData.files !== null
                            ? `(${entryData.files.length})`
                            : ``
                        }`}
                    <VisuallyHiddenInput
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleChangeByKey("files", e.target.files)
                      }
                    />
                  </Button>
                </Grid>
              </Grid>
              <Box sx={{ my: 3 }}>
                {isCutOff ? (
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" component="div" color="error">
                      CPD REGISTRATION IS NOW CLOSED.
                    </Typography>
                  </Box>
                ) : (
                  <LoadingButton
                    fullWidth
                    startIcon={<Icons.PersonAdd />}
                    loading={onSubmitProgress}
                    variant="contained"
                    loadingIndicator="Submitting..."
                    color="error"
                    disableElevation
                    disabled={
                      CPDPrograms.length === 0 ||
                      program.entries === program.slots ||
                      isCutOff
                    }
                    onClick={handleSubmitEntry}
                  >
                    Submit
                  </LoadingButton>
                )}
              </Box>
              <Typography
                color="gray"
                variant="body1"
                sx={{ textAlign: "center" }}
              >
                CPD Provider | Filipino Homes © {new Date().getFullYear()}
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}
    </>
  );
}
