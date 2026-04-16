import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogOut, Bell, Sun, Moon, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { getAllNotifications } from '../../api/adminApi';
import { formatDateTime } from '../../utils/helpers';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    );
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (isAdmin()) {
            fetchNotifications();
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await getAllNotifications();
            const data = res.data.slice(0, 10);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isSent).length);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBellClick = () => {
        setShowNotifications(prev => !prev);
        setUnreadCount(0);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'due_reminder': return 'text-warning';
            case 'overdue': return 'text-danger';
            case 'issued': return 'text-success';
            case 'returned': return 'text-blue-400';
            case 'fine': return 'text-orange-400';
            default: return 'text-text-secondary';
        }
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-border h-16 flex items-center justify-between px-6 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">

            {/* Left — Brand */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center ring-2 ring-accent/20">
                    <Link to="/"><BookOpen size={16} className="text-primary" /></Link>
                </div>
                <span className="text-text-primary font-bold text-lg tracking-tight">
                    CDOT Library
                </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

                <button
                    onClick={toggleTheme}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent hover:bg-surface border border-transparent hover:border-border transition-all duration-150"
                    title="Toggle theme"
                >
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>

                {/* Bell with dropdown */}
                {isAdmin() && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={handleBellClick}
                            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent hover:bg-surface border border-transparent hover:border-border transition-all duration-150"
                        >
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-white text-xs flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-10 w-80 bg-sidebar border border-border rounded-xl shadow-lg z-50 overflow-hidden">

                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                    <p className="text-text-primary text-sm font-semibold">Notifications</p>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* List */}
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <p className="text-text-secondary text-sm">No notifications yet</p>
                                        </div>
                                    ) : (
                                        [...notifications]
                                            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                                            .map((n, i) => (
                                                <div
                                                    key={i}
                                                    className="px-4 py-3 border-b border-border hover:bg-surface transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className={`text-xs font-semibold uppercase tracking-wide ${getTypeColor(n.type)}`}>
                                                            {n.type?.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-text-secondary text-xs flex-shrink-0">
                                                            {formatDateTime(n.sentAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-text-secondary text-xs mt-1 opacity-60">
                                                        {n.userName}
                                                    </p>
                                                </div>
                                            ))
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-2.5 border-t border-border">
                                    <button
                                        onClick={() => { navigate('/admin/notifications'); setShowNotifications(false); }}
                                        className="text-accent text-xs font-semibold hover:underline"
                                    >
                                        View all notifications →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                <div className="w-px h-6 bg-border mx-1" />

                {/* Avatar + Name + Role + Logout */}
                <div className="flex items-center gap-3 pl-1">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-success text-xs font-semibold flex-shrink-0">
                        {initials}
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="text-text-primary text-sm font-semibold leading-tight">
                            {user?.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            {user?.roles?.map((role, i) => (
                                <Badge key={i} text={role} type="role" />
                            ))}
                        </div>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all duration-150"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;