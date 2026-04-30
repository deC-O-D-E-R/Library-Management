export const getApiPrefix = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.roles?.includes('ADMIN')) return 'admin';
        if (user?.roles?.includes('LIBRARIAN')) return 'librarian';
        return 'employee';
    } catch {
        return 'admin';
    }
};