import axiosInstance from './axios';

//auth
export const login = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

//users
export const getAllUsers = () =>
    axiosInstance.get('/admin/users');

export const getUserById = (userId) =>
    axiosInstance.get(`/admin/users/${userId}`);

export const searchUserByStaffNumber = (staffNumber) =>
    axiosInstance.get(`/admin/users/search/${staffNumber}`);

export const getActiveUsers = () =>
    axiosInstance.get('/admin/users/active');

export const addUser = (data) =>
    axiosInstance.post('/admin/users', data);

export const editUser = (userId, data) =>
    axiosInstance.put(`/admin/users/${userId}`, data);

export const deactivateUser = (userId) =>
    axiosInstance.patch(`/admin/users/${userId}/deactivate`);

export const bulkUploadUsers = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/admin/users/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

//categories
export const getAllCategories = () =>
    axiosInstance.get('/admin/categories');

export const addCategory = (data) =>
    axiosInstance.post('/admin/categories', data);

export const deleteCategory = (categoryId) =>
    axiosInstance.delete(`/admin/categories/${categoryId}`);

//books
export const getAllBooks = () =>
    axiosInstance.get('/admin/books');

export const getBookById = (bookId) =>
    axiosInstance.get(`/admin/books/${bookId}`);

export const searchBooks = (params) =>
    axiosInstance.get('/admin/books/search', { params });

export const getBooksByCategory = (categoryId) =>
    axiosInstance.get(`/admin/books/category/${categoryId}`);

export const addBook = (data) =>
    axiosInstance.post('/admin/books', data);

export const editBook = (bookId, data) =>
    axiosInstance.put(`/admin/books/${bookId}`, data);

export const deleteBook = (bookId) =>
    axiosInstance.delete(`/admin/books/${bookId}`);

export const addCopy = (bookId, accessionNumber) =>
    axiosInstance.post(`/admin/books/${bookId}/copies`, null, {
        params: { accessionNumber }
    });

export const deleteCopy = (copyId) =>
    axiosInstance.delete(`/admin/books/copies/${copyId}`);

export const bulkUploadBooks = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/admin/books/bulk-upload', formData, {
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