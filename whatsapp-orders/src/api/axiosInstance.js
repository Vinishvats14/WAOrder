import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5009/api',
    withCredentials: true,
});

// Agar localStorage mein token hai, toh har request mein bhej do
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;