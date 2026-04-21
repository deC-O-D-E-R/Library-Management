import axiosInstance from './axios';

//fetch logged user
export const getMyDetails = () =>
    axiosInstance.get('/employee/me');

//books (emoloyees)
export const searchBooks = (params) =>
    axiosInstance.get('/employee/books/search', { params });

export const getBookById = (bookId) =>
    axiosInstance.get(`/employee/books/${bookId}`);

//circulation (employees)
export const getMyBooks = () =>
    axiosInstance.get('/employee/circulation/my');

export const getMyHistory = () =>
    axiosInstance.get('/employee/circulation/history');

//fines (employees)
export const getMyFines = () =>
    axiosInstance.get('/employee/fines/my');

// reservations (employee)
export const reserveBook = (bookId) =>
    axiosInstance.post(`/employee/reservations/${bookId}`);

export const cancelReservation = (reservationId) =>
    axiosInstance.delete(`/employee/reservations/${reservationId}`);

export const getMyReservations = () =>
    axiosInstance.get('/employee/reservations/my');

//circulation (librarian)
export const getAllCirculations = () =>
    axiosInstance.get('/librarian/circulation');

export const getCirculationById = (circulationId) =>
    axiosInstance.get(`/librarian/circulation/${circulationId}`);

export const getCirculationByUser = (userId) =>
    axiosInstance.get(`/librarian/circulation/user/${userId}`);

export const getOverdueCirculations = () =>
    axiosInstance.get('/librarian/circulation/overdue');

export const getIssuedCirculations = () =>
    axiosInstance.get('/librarian/circulation/issued');

export const issueBook = (data) =>
    axiosInstance.post('/librarian/circulation/issue', data);

export const returnBook = (circulationId) =>
    axiosInstance.post(`/librarian/circulation/return/${circulationId}`);

//fines (Librarian)
export const getAllUsers = () =>
    axiosInstance.get('/librarian/circulation/users');

export const getAllBooks = () =>
    axiosInstance.get('/librarian/circulation/books');

export const getAllFines = () =>
    axiosInstance.get('/librarian/fines');

export const getFineById = (fineId) =>
    axiosInstance.get(`/librarian/fines/${fineId}`);

export const getFinesByUser = (userId) =>
    axiosInstance.get(`/librarian/fines/user/${userId}`);

export const getPendingFines = () =>
    axiosInstance.get('/librarian/fines/pending');

export const markFineAsPaid = (fineId) =>
    axiosInstance.patch(`/librarian/fines/${fineId}/pay`);

export const markFineAsWaived = (fineId) =>
    axiosInstance.patch(`/librarian/fines/${fineId}/waive`);

//stock verification (Librarian)
export const getAllVerifications = () =>
    axiosInstance.get('/librarian/stock');

export const getVerificationById = (verificationId) =>
    axiosInstance.get(`/librarian/stock/${verificationId}`);

export const initiateVerification = (data) =>
    axiosInstance.post('/librarian/stock/initiate', data);

export const scanCopy = (verificationId, data) =>
    axiosInstance.post(`/librarian/stock/${verificationId}/scan`, data);

export const completeVerification = (verificationId) =>
    axiosInstance.post(`/librarian/stock/${verificationId}/complete`);

export const getDiscrepancyReport = (verificationId) =>
    axiosInstance.get(`/librarian/stock/${verificationId}/discrepancy`);

// reservations (librarian)
export const getAllReservations = () =>
    axiosInstance.get('/librarian/reservations');

export const getPendingReservations = () =>
    axiosInstance.get('/librarian/reservations/pending');

export const fulfillReservation = (reservationId) =>
    axiosInstance.patch(`/librarian/reservations/${reservationId}/fulfill`);

export const getReservationsByBook = (bookId) =>
    axiosInstance.get(`/librarian/reservations/book/${bookId}`);