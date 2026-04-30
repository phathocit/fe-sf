import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về response.data là đúng, nhưng nên dùng optional chaining cho chắc chắn
    return response?.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    // --- SỬA LỖI TẠI ĐÂY ---
    // Khi Offline, error.response sẽ bị undefined.
    // Việc truy cập error.response.data.message sẽ gây ra lỗi "reading property of undefined"
    const message =
      error.response?.data?.message || error.message || "Lỗi kết nối mạng";
    const code = error.response?.data?.code || "NETWORK_ERROR";

    console.error("API Error:", message, "Error Code: ", code);

    // Trả về một object lỗi có cấu trúc để các hàm .catch() hoặc try-catch bên ngoài không bị crash
    return Promise.reject({
      message,
      code,
      isNetworkError: !error.response,
    });
  },
);

export default axiosClient;
