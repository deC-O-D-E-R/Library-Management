import { createContext, useState, useEffect } from 'react';
import { getMySystemAccount } from '../api/systemApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            if (isTokenExpired(storedToken)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        }

        setLoading(false);
    }, []);

    //polling for Librarian permissions upload
    useEffect(() => {
        if (!user || !user.roles?.includes('LIBRARIAN')) return;

        const poll = async () => {
            try {
                const res = await getMySystemAccount();
                const freshPermissions = res.data.permissions;

                const current = user.permissions || [];
                const same = current.length === freshPermissions.length &&
                    current.every(p => freshPermissions.includes(p));

                if (!same) {
                    const updatedUser = { ...user, permissions: freshPermissions };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            } catch {
                //silently ignore
            }
        };

        poll();
        const interval = setInterval(poll, 30000);
        return () => clearInterval(interval);
    }, [user?.roles]);

    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };


    const login = (userData, jwtToken) => {
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const apiPrefix = () => {
        if (user?.roles?.includes('ADMIN')) return 'admin';
        if (user?.roles?.includes('LIBRARIAN')) return 'librarian';
        return 'employee';
    };

    const isAdmin = () => user?.roles?.includes('ADMIN');
    const isLibrarian = () => user?.roles?.includes('LIBRARIAN');
    const isEmployee = () => user?.roles?.includes('EMPLOYEE');

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isAdmin,
            isLibrarian,
            isEmployee,
            apiPrefix
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};