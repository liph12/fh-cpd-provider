import { Paper, Box, Typography, Button, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import * as Icons from "@mui/icons-material";

export default function Confirmation({ email, admin_type }) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper
        sx={{
          textAlign: "center",
          p: 3,
          width: desktop ? "30vw" : "100vw",
          m: 3,
        }}
      >
        <Icons.CheckCircle sx={{ fontSize: 60, mb: 2 }} color="success" />
        <Typography variant="h6" component="div">
          Our team is currently reviewing your submission to ensure all
          necessary information and documentation have been provided.
        </Typography>
        <br />
        <Typography variant="body1" component="div" color="gray">
          Once the review is complete, we will notify you of your registration
          status via email you provided ({email}).
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" component="div" color="gray">
          In the meantime, if you have any questions or need further assistance,
          please do not hesitate to contact us at
          filipinohomes.cpdprovider@gmail.com.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <a href={`/${admin_type}/registration`}>
            <Button variant="contained" color="error" size="small">
              Continue
            </Button>
          </a>
        </Box>
      </Paper>
    </Box>
  );
}
