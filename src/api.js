import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // FastAPI Backend
console.log("API BASE URL:", API_BASE_URL);
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000, // 120 seconds timeout (astrology reports and RAG can be slow)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle session expiration / authentication errors
        if (error.response) {
            const status = error.response.status;
            const isAuthRoute = error.config?.url?.includes('/auth/');

            // Redirect to login on 401, 403, or 404 from auth routes (user not found)
            if (status === 401 || status === 403 || (status === 404 && isAuthRoute)) {
                console.warn('Session expired or user not found. Redirecting to login...');

                // Clear local storage
                localStorage.clear();

                // Redirect to login page
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export const sendOtp = (mobile) => api.post('/auth/send-otp', { mobile });
export const verifyOtp = (mobile, otp) => api.post('/auth/verify-otp', { mobile, otp });
export const registerUser = (data) => api.post('/auth/register', data);
export const updateProfile = (data) => api.post('/auth/update-profile', data);


export const sendMessage = (mobile, message, history, sessionId) => api.post('/auth/chat', { mobile, message, history, session_id: sessionId });
export const endChat = (mobile, history, sessionId) => api.post('/auth/end-chat', { mobile, history, session_id: sessionId });
export const getChatHistory = (mobile) => api.get(`/auth/history/${mobile}`);
export const submitFeedback = (data) => api.post('/auth/feedback', data);
export const getDailyPrediction = (mobile) => api.get(`/auth/daily-prediction/${mobile}`);

// Admin Endpoints
export const adminLogin = (username, password) => api.post('/admin/login', { username, password });
export const getAllUsers = () => api.get('/admin/users');
export const getUserDetails = (mobile) => api.get(`/admin/user-details/${mobile}`);
export const getSystemPrompt = () => api.get('/admin/system-prompt');
export const updateSystemPrompt = (prompt) => api.post('/admin/system-prompt', { prompt });
export const getLoginLogs = (params) => api.get('/admin/login-logs', { params });

export const getMayaPrompt = () => api.get('/admin/maya-prompt');
export const updateMayaPrompt = (prompt) => api.post('/admin/maya-prompt', { prompt });

export const getReportPrompt = () => api.get('/admin/report-prompt');
export const updateReportPrompt = (prompt) => api.post('/admin/report-prompt', { prompt });

// Chat Tester Endpoints
export const testUpload = (formData) => api.post('/admin/test-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const testProcess = (filename) => {
    const formData = new FormData();
    formData.append('filename', filename);
    return api.post('/admin/test-process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const testChat = (message, docId, model = "gpt-4o-mini") => api.post('/admin/test-chat', { message, doc_id: docId, model });

// Wallet Endpoints
export const getWalletStatus = () => api.get('/wallet/status');
export const getBalance = (mobile) => api.get(`/wallet/balance/${mobile}`);
export const getTransactionHistory = (mobile) => api.get(`/wallet/history/${mobile}`);
export const rechargeWallet = (data) => api.post('/wallet/recharge', data);
export const generateReport = (mobile, category) => api.post('/wallet/generate-report', { mobile, category }, { responseType: 'blob' });
export const toggleWalletSystem = (enabled) => api.post(`/wallet/toggle-system?enabled=${enabled}`);
export const getDashboardStats = (range = '7D') => api.get(`/admin/stats?range=${range}`);
export const getUserReports = (mobile) => api.get(`/wallet/reports/${mobile}`);
export const downloadReportById = (reportId) => api.get(`/wallet/report/${reportId}`, { responseType: 'blob' });

// Payment Module Endpoints
export const createPaymentOrder = (amount, mobile) => api.post('/payment/create-order', { amount, mobile });
export const verifyPayment = (data) => api.post('/payment/verify', data);
export const getSystemSettings = () => api.get('/admin/settings');
export const updateSystemSettings = (key, value) => api.post('/admin/settings', { key, value });

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
