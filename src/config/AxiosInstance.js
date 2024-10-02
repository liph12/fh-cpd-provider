import Axios from "axios";

const AxiosInstance = Axios.create({
  baseURL: "https://api.leuteriorealty.com/docs/v1/public/api/",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

export default AxiosInstance;
