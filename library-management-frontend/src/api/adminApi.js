import axiosInstance from './axios';
import { getApiPrefix } from '../utils/apiPrefix';

//auth
export const login = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

export const forgotPassword = (staffNumber) =>
    axiosInstance.post(`/auth/forgot-password?staffNumber=${staffNumber}`);

export const verifyOtp = (staffNumber, otp) =>
    axiosInstance.post(`/auth/verify-otp?staffNumber=${staffNumber}&otp=${otp}`);

export const resetPassword = (staffNumber, otp, newPassword) =>
    axiosInstance.post(`/auth/reset-password?staffNumber=${staffNumber}&otp=${otp}&newPassword=${newPassword}`);

//users
export const getAllUsers = () =>
    axiosInstance.get(`/${getApiPrefix()}/users`);

export const getUserById = (userId) =>
    axiosInstance.get(`/${getApiPrefix()}/users/${userId}`);

export const searchUserByStaffNumber = (staffNumber) =>
    axiosInstance.get(`/${getApiPrefix()}/users/search/${staffNumber}`);

export const getActiveUsers = () =>
    axiosInstance.get(`/${getApiPrefix()}/users/active`);

export const addUser = (data) =>
    axiosInstance.post(`/${getApiPrefix()}/users`, data);

export const editUser = (userId, data) =>
    axiosInstance.put(`/${getApiPrefix()}/users/${userId}`, data);

export const deactivateUser = (userId) =>
    axiosInstance.patch(`/${getApiPrefix()}/users/${userId}/deactivate`);

export const bulkUploadUsers = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/${getApiPrefix()}/users/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

//categories
export const getAllCategories = () =>
    axiosInstance.get(`/${getApiPrefix()}/books/categories`);

export const addCategory = (data) =>
    axiosInstance.post('/admin/categories', data);

export const updateCategory = (id, data) =>
  axiosInstance.put(`/admin/categories/${id}`, data);

//books
export const getAllBooks = () =>
    axiosInstance.get(`/${getApiPrefix()}/books`);

export const getBookById = (bookId) =>
    axiosInstance.get(`/${getApiPrefix()}/books/${bookId}`);

export const searchBooks = (params) =>
    axiosInstance.get(`/${getApiPrefix()}/books/search`, { params });

export const getBooksByCategory = (categoryId) =>
    axiosInstance.get(`/${getApiPrefix()}/books/category/${categoryId}`);

export const addBook = (data) =>
    axiosInstance.post(`/${getApiPrefix()}/books`, data);

export const editBook = (bookId, data) =>
    axiosInstance.put(`/${getApiPrefix()}/books/${bookId}`, data);

export const addCopy = (bookId, accessionNumber) =>
    axiosInstance.post(`/${getApiPrefix()}/books/${bookId}/copies`, null, {
        params: { accessionNumber }
    });

export const deleteCopy = (copyId) =>
    axiosInstance.delete(`/${getApiPrefix()}/books/copies/${copyId}`);

export const bulkUploadBooks = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/${getApiPrefix()}/books/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

//notifications
export const getAllNotifications = () =>
    axiosInstance.get('/admin/notifications');

export const getNotificationsByUser = (userId) =>
    axiosInstance.get(`/admin/notifications/user/${userId}`);

export const triggerReminders = () =>
    axiosInstance.post('/admin/notifications/trigger-reminders');

export const triggerOverdue = () =>
    axiosInstance.post('/admin/notifications/trigger-overdue');

//system config
export const getAllConfigs = () =>
    axiosInstance.get('/admin/config');

export const updateConfig = (key, value) =>
    axiosInstance.patch(`/admin/config/${key}`, null, {
        params: { value }
    });

//reports
export const getCirculationReport = (status) =>
    axiosInstance.get('/admin/reports/circulation', {
        params: status ? { status } : {}
    });

export const getUserBorrowingReport = (userId) =>
    axiosInstance.get(`/admin/reports/user/${userId}`);

export const getInventoryReport = () =>
    axiosInstance.get('/admin/reports/inventory');

export const getHoldingSummary = () =>
    axiosInstance.get('/admin/reports/holding-summary');

export const getOverdueReport = () =>
    axiosInstance.get('/admin/reports/overdue');

export const getStockVerificationReport = (verificationId) =>
    axiosInstance.get(`/admin/reports/stock-verification/${verificationId}`);

//file handling
export const uploadRulesPdf = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/admin/config/files/rules', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const uploadBookRequestPdf = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/admin/config/files/book-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};