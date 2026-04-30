import axiosInstance from './axios';

// auth
export const systemLogin = (data) =>
    axiosInstance.post('/system/auth/login', data);

export const systemForgotPassword = (username) =>
    axiosInstance.post(`/system/auth/forgot-password?username=${username}`);

export const systemVerifyOtp = (username, otp) =>
    axiosInstance.post(`/system/auth/verify-otp?username=${username}&otp=${otp}`);

export const systemResetPassword = (username, otp, newPassword) =>
    axiosInstance.post(`/system/auth/reset-password?username=${username}&otp=${otp}&newPassword=${newPassword}`);

export const getMySystemAccount = () =>
    axiosInstance.get('/system/auth/me');

// system accounts
export const getAllSystemAccounts = () =>
    axiosInstance.get('/admin/system-accounts');

export const createSystemAccount = (data) =>
    axiosInstance.post('/admin/system-accounts', data);

export const deactivateSystemAccount = (accountId) =>
    axiosInstance.patch(`/admin/system-accounts/${accountId}/deactivate`);

export const updateSystemAccountPermissions = (accountId, permissions) =>
    axiosInstance.patch(`/admin/system-accounts/${accountId}/permissions`, permissions);