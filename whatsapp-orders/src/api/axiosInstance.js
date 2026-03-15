import axios from 'axios';

const axiosInstance = axios.create({
    // Agar environment variable hai to wo lo, nahi to check karo: 
    // Kya hum development mein hain? Agar haan to localhost, warna live URL.
    baseURL: import.meta.env.VITE_API_URL || 
             (import.meta.env.MODE === 'development' 
              ? 'http://localhost:10000/api' 
              : 'https://wa-order-backend.onrender.com/api'),
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