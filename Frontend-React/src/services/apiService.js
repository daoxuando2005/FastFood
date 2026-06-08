import axios from 'axios';

const GATEWAY_URL = "http://localhost:8080";

export const API_ENDPOINTS = {
    AUTH:       `${GATEWAY_URL}/api/auth`,
    LOGIN:      `${GATEWAY_URL}/api/auth/login`,
    REGISTER:   `${GATEWAY_URL}/api/auth/register`,
    RESTAURANT: `${GATEWAY_URL}/api/v1/restaurants`,
    ORDER:      `${GATEWAY_URL}/api/v1/orders`,
    CUSTOMER:   `${GATEWAY_URL}/api/v1/customers`,
    PAYMENT:    `${GATEWAY_URL}/api/v1/payments`,
    DELIVERY:   `${GATEWAY_URL}/api/deliveries`
};

const apiService = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

apiService.interceptors.request.use((config) => {
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (authData?.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiService.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response?.status === 401) {
        if (!error.config.url.includes('/login')) {
            alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem("foodhub_auth");
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
});

export default apiService;
