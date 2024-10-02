import { forwardRef } from "react";
import SnackBar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const TransitionLeft = (props) => {
  return <Slide {...props} direction="left" />;
};

const Toast = ({ message, severinty, open, handleClose }) => {
  return (
    <SnackBar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={TransitionLeft}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      key={"top" + "right"}
    >
      <Alert onClose={handleClose} severity={severinty}>
        {message}
      </Alert>
    </SnackBar>
  );
};

export default Toast;
