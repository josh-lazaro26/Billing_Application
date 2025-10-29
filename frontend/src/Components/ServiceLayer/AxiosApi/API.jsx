import axios from "axios";
import { getApiBaseUrl } from "../../../../../backend/config/API_BASE_URL";

const apiClient = axios.create({
  baseURL: `${getApiBaseUrl()}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
