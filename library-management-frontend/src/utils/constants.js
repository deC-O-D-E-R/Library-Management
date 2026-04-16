export const ROLES = {
    ADMIN: 'ADMIN',
    LIBRARIAN: 'LIBRARIAN',
    EMPLOYEE: 'EMPLOYEE',
};

export const BOOK_STATUS = {
    AVAILABLE: 'available',
    ISSUED: 'issued',
    MISSING: 'missing',
    DAMAGED: 'damaged',
};

export const CIRCULATION_STATUS = {
    ISSUED: 'issued',
    RETURNED: 'returned',
    OVERDUE: 'overdue',
};

export const FINE_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    WAIVED: 'waived',
};

export const SCOPE_TYPES = {
    FULL: 'full',
    CATEGORY: 'category',
    CALL_NUMBER: 'call_number',
};