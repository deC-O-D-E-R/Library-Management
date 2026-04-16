export const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'available':   return 'bg-green-900 text-green-400';
        case 'issued':      return 'bg-amber-900 text-amber-400';
        case 'overdue':     return 'bg-red-900 text-red-400';
        case 'returned':    return 'bg-blue-900 text-blue-400';
        case 'missing':     return 'bg-red-900 text-red-400';
        case 'damaged':     return 'bg-orange-900 text-orange-400';
        case 'pending':     return 'bg-amber-900 text-amber-400';
        case 'paid':        return 'bg-green-900 text-green-400';
        case 'waived':      return 'bg-blue-900 text-blue-400';
        case 'active':      return 'bg-green-900 text-green-400';
        case 'inactive':    return 'bg-red-900 text-red-400';
        default:            return 'bg-gray-900 text-gray-400';
    }
};

export const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
        case 'ADMIN':       return 'bg-purple-900 text-purple-400';
        case 'LIBRARIAN':   return 'bg-blue-900 text-blue-400';
        case 'EMPLOYEE':    return 'bg-green-900 text-green-400';
        default:            return 'bg-gray-900 text-gray-400';
    }
};

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '—';
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
};

export const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
};