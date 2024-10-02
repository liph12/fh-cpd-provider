import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import * as Icons from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useState } from "react";
import AxiosInstance from "../../config/AxiosInstance";
import Toast from "../Toast";

export default function ConfirmationModal({
  handleClose,
  open,
  data,
  setRows,
  rows,
  alert,
  showAlert,
  handleCloseAlert,
}) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { email, mobile, name, salesTeam, designation, fileURLs, id } = data;
  const files = JSON.parse(fileURLs);
  const [status, setStatus] = useState("approved");
  const [remarks, setRemarks] = useState("");
  const [onProgressUpdate, setOnProgressUpdate] = useState(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: desktop ? 500 : 250,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  const updateRowStatus = () => {
    const rowIndex = rows.findIndex((row) => row.id === id);
    const tmpRows = [...rows];

    tmpRows[rowIndex].status = status;

    setRows(tmpRows);
  };

  const handleUpdateStatus = async () => {
    try {
      setOnProgressUpdate(true);
      updateRowStatus();
      const params = {
        status: status,
        remarks: remarks,
        entryId: id,
      };
      const jsonParams = JSON.stringify(params);

      const response = await AxiosInstance.put(
        "update-entry-status",
        jsonParams,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        showAlert("success", "Status updated successfully!");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setOnProgressUpdate(false);
      handleClose();
    }
  };

  return (
    <div>
      <Toast
        message={alert.message}
        open={alert.open}
        severinty={alert.type}
        handleClose={handleCloseAlert}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="div">
            {name}
            <Typography variant="caption" component="h6">
              {designation}
            </Typography>
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: 1 }}>
            <Typography component="span" color="gray">
              Team:
            </Typography>
            <Typography component="span"> {salesTeam}</Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography component="span" color="gray">
              Email:
            </Typography>
            <Typography component="span"> {email}</Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography component="span" color="gray">
              Contact:
            </Typography>
            <Typography component="span"> {mobile}</Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography component="span" color="gray">
              Uploaded Files:
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                overflow: "auto",
              }}
            >
              {files.map((file) => (
                <Box sx={{ mx: 1, border: "1px solid gray" }}>
                  <a href={file} target="_blank">
                    {file.includes(".pdf") || file.includes(".docx") ? (
                      <Typography component="div">
                        {
                          file.split(
                            "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/fh-docs/cpd-reg/requirements/"
                          )[1]
                        }
                      </Typography>
                    ) : (
                      <img
                        loading="lazy"
                        width={120}
                        role="presentation"
                        src={`${file}`}
                      />
                    )}
                  </a>
                </Box>
              ))}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: 1, mb: 2 }}>
            <ButtonGroup>
              <Button
                variant={status === "pending" ? "contained" : "outlined"}
                color="warning"
                size="small"
                onClick={() => setStatus("pending")}
              >
                Pending
              </Button>
              <Button
                variant={status === "approved" ? "contained" : "outlined"}
                color="success"
                size="small"
                onClick={() => setStatus("approved")}
              >
                Approve
              </Button>
              <Button
                variant={status === "disapproved" ? "contained" : "outlined"}
                color="error"
                size="small"
                onClick={() => setStatus("disapproved")}
              >
                Disapprove
              </Button>
            </ButtonGroup>
          </Box>
          {status === "disapproved" && (
            <Box>
              <TextField
                name="remarks"
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                color="error"
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <LoadingButton
              loadingIndicator="Updating..."
              loading={onProgressUpdate}
              variant="contained"
              color={
                status === "approved"
                  ? "success"
                  : status === "pending"
                  ? "warning"
                  : "error"
              }
              size="small"
              onClick={handleUpdateStatus}
              fullWidth
              startIcon={<Icons.Update />}
            >
              Update Status
            </LoadingButton>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
