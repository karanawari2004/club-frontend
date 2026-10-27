import axios from "axios";

const api = axios.create({
baseURL: " https://club-backend-bsxq.onrender.com/api",
withCredentials: true,
});

export default api;
