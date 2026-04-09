import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // FastAPI Backend
console.log("API BASE URL:", API_BASE_URL);
const api = axios.create({
    baseURL: API_BASE_URL,
    //  timeout: 120000,
    timeout: 300000, // 300 seconds timeout (astrology reports and RAG can be slow)
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
export const getUserStatus = (mobile) => api.get(`/auth/user-status/${mobile}`);
export const regenerateReport = (mobile) => api.post(`/auth/regenerate-report/${mobile}`);


export const sendMessage = (mobile, message, history, sessionId, paymentId = null, referenceid = null, idempotencyKey = null) =>
    api.post('/auth/chat', { mobile, message, history, session_id: sessionId, payment_id: paymentId, referenceid, idempotency_key: idempotencyKey });
export const getGurujiResponse = (mobile, message, history, sessionId, paymentId = null, referenceid = null, idempotencyKey = null) =>
    api.post('/auth/chat/guruji', { mobile, message, history, session_id: sessionId, payment_id: paymentId, referenceid, idempotency_key: idempotencyKey });
export const endChat = (mobile, history, sessionId, referenceid = null) => api.post('/auth/end-chat', { mobile, history, session_id: sessionId, referenceid });
export const startSession = (mobile, sessionId, referenceid = null) => api.post('/auth/start-session', { mobile, session_id: sessionId, referenceid });
export const getChatHistory = (mobile, referenceid = null) => {
    const params = referenceid ? { referenceid } : {};
    return api.get(`/auth/history/${mobile}`, { params });
};
export const submitFeedback = (data) => api.post('/auth/feedback', data);
export const getDailyPrediction = (mobile) => api.get(`/auth/daily-prediction/${mobile}`);

// Admin Endpoints
export const adminLogin = (username, password) => api.post('/admin/login', { username, password });
export const getAllUsers = () => api.get('/admin/users');
export const getUserDetails = (mobile, referenceid = null) => {
    const params = referenceid ? { referenceid } : {};
    return api.get(`/admin/user-details/${mobile}`, { params });
};
export const updateUserProfile = (data) => api.post('/admin/update-user-profile', data);
export const getSystemPrompt = () => api.get('/admin/system-prompt');
export const updateSystemPrompt = (prompt) => api.post('/admin/system-prompt', { prompt });
export const getSystemPromptHistory = () => api.get('/admin/system-prompt/history');
export const getLoginLogs = (params) => api.get('/admin/login-logs', { params });
export const getSubscriptionPlans = () => api.get('/admin/subscription/plans');
export const toggleUserSubscription = (mobile, planId) => api.post('/admin/subscription/toggle', { mobile, plan_id: planId });

export const getMayaPrompt = () => api.get('/admin/maya-prompt');
export const updateMayaPrompt = (prompt) => api.post('/admin/maya-prompt', { prompt });
export const getMayaPromptHistory = () => api.get('/admin/maya-prompt/history');

export const getReportPrompt = () => api.get('/admin/report-prompt');
export const updateReportPrompt = (prompt) => api.post('/admin/report-prompt', { prompt });
export const getReportPromptHistory = () => api.get('/admin/report-prompt/history');

export const getPsycologyPrompt = () => api.get('/admin/psycology-prompt');
export const updatePsycologyPrompt = (prompt) => api.post('/admin/psycology-prompt', { prompt });
export const getPsycologyPromptHistory = () => api.get('/admin/psycology-prompt/history');

export const getMonetizationRules = () => api.get('/admin/monetization-rules/');
export const createMonetizationRule = (data) => api.post('/admin/monetization-rules/', data);
export const updateMonetizationRule = (id, data) => api.put(`/admin/monetization-rules/${id}`, data);
export const deleteMonetizationRule = (id) => api.delete(`/admin/monetization-rules/${id}`);

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
export const payForChat = (data) => api.post('/wallet/pay-for-chat', data);
export const generateReport = (mobile, category, question = null, sessionId = null, messageId = null, referenceid = null) => api.post('/wallet/generate-report', { mobile, category, question, session_id: sessionId, message_id: messageId, referenceid }, { responseType: 'blob' });
export const toggleWalletSystem = (enabled) => api.post(`/wallet/toggle-system?enabled=${enabled}`);
export const getDashboardStats = (range = '7D') => api.get(`/admin/stats?range=${range}`);
export const getUserReports = (mobile) => api.get(`/wallet/reports/${mobile}`);
export const downloadReportById = (reportId) => api.get(`/wallet/report/${reportId}`, { responseType: 'blob' });
export const getRechargeConfigs = () => api.get('/admin/recharge-configs');
export const createRechargeConfig = (data) => api.post('/admin/recharge-configs', data);
export const updateRechargeConfig = (id, data) => api.put(`/admin/recharge-configs/${id}`, data);
export const deleteRechargeConfig = (id) => api.delete(`/admin/recharge-configs/${id}`);
export const getPublicRechargeConfigs = () => api.get('/wallet/recharge-configs');

// Payment Module Endpoints
// export const createPaymentOrder = (amount, mobile) => api.post('/payment/create-order', { amount, mobile });
export const createPaymentOrder = (amount, mobile, referenceid = null) => api.post('/payment/create-order', { amount, mobile, referenceid });
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
