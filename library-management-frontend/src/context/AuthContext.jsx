import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

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
            isEmployee
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};