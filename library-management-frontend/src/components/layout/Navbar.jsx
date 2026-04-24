import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Bell, Sun, Moon, X, KeyRound, ChevronDown, Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { getAllNotifications } from '../../api/adminApi';
import { changePassword } from '../../api/userApi';
import { formatDateTime } from '../../utils/helpers';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (isAdmin()) fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
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

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBellClick = () => {
        setShowNotifications(prev => !prev);
        setUnreadCount(0);
    };

    const openPasswordModal = () => {
        setShowUserMenu(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordError('');
        setPasswordSuccess('');
        setShowPasswordModal(true);
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        setChangingPassword(true);
        try {
            await changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordSuccess('Password changed successfully!');
            setTimeout(() => setShowPasswordModal(false), 1500);
        } catch (err) {
            setPasswordError(err.response?.data || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
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
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-border h-16 flex items-center justify-between px-6 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">

                {/* Left — Brand */}
                <Link to="/" className="flex items-center gap-3 group select-none">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-surface border border-border group-hover:border-accent/40 transition-all duration-200">
                        <img src="/CDOT_logo.gif" alt="CDOT Logo" className="h-7 w-auto object-contain" />
                    </div>
                    <div className="flex flex-col justify-center leading-none gap-0.5">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-text-primary font-extrabold text-base tracking-tight">CDOT</span>
                            <span className="text-accent font-semibold text-base tracking-tight">Library</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-px bg-accent/50 rounded-full" />
                            <span className="text-text-secondary text-[10px] tracking-[0.15em] uppercase font-medium">Portal</span>
                        </div>
                    </div>
                </Link>

                {/* Right */}
                <div className="flex items-center gap-2">

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent hover:bg-surface border border-transparent hover:border-border transition-all duration-150"
                        title="Toggle theme"
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>

                    {/* Bell — admin only */}
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

                            {showNotifications && (
                                <div className="absolute right-0 top-10 w-80 bg-sidebar border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                        <p className="text-text-primary text-sm font-semibold">Notifications</p>
                                        <button onClick={() => setShowNotifications(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <p className="text-text-secondary text-sm">No notifications yet</p>
                                            </div>
                                        ) : (
                                            [...notifications]
                                                .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                                                .map((n, i) => (
                                                    <div key={i} className="px-4 py-3 border-b border-border hover:bg-surface transition-colors">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className={`text-xs font-semibold uppercase tracking-wide ${getTypeColor(n.type)}`}>
                                                                {n.type?.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-text-secondary text-xs flex-shrink-0">
                                                                {formatDateTime(n.sentAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-text-secondary text-xs mt-1 line-clamp-2">{n.message}</p>
                                                        <p className="text-text-secondary text-xs mt-1 opacity-60">{n.userName}</p>
                                                    </div>
                                                ))
                                        )}
                                    </div>
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

                    {/* User Menu Dropdown */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(prev => !prev)}
                            className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-all duration-150"
                        >
                            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-success text-xs font-semibold flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex flex-col justify-center text-left">
                                <p className="text-text-primary text-sm font-semibold leading-tight">{user?.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {user?.roles?.map((role, i) => (
                                        <Badge key={i} text={role} type="role" />
                                    ))}
                                </div>
                            </div>
                            <ChevronDown
                                size={14}
                                className={`text-text-secondary transition-transform duration-150 ${showUserMenu ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-12 w-48 bg-sidebar border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                                <button
                                    onClick={openPasswordModal}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                                >
                                    <KeyRound size={15} />
                                    Change Password
                                </button>
                                <div className="border-t border-border" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors"
                                >
                                    <LogOut size={15} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </nav>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-70"
                        onClick={() => setShowPasswordModal(false)}
                    />
                    <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-sm mx-4 z-10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-text-primary font-semibold text-lg">Change Password</h2>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Current Password
                                </label>
                                <input
                                    type={showPassword.old ? "text" : "password"}
                                    value={passwordForm.oldPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
                                    className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary"
                                >
                                    {showPassword.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    New Password
                                </label>
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary"
                                >
                                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary"
                                >
                                    {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {passwordError && (
                                <div className="bg-red-900 bg-opacity-30 border border-danger rounded-lg px-4 py-3">
                                    <p className="text-danger text-sm">{passwordError}</p>
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="bg-green-900 bg-opacity-30 border border-success rounded-lg px-4 py-3">
                                    <p className="text-success text-sm">{passwordSuccess}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-1">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary bg-sidebar border border-border rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={changingPassword}
                                    className="px-4 py-2 text-sm font-semibold bg-accent text-primary rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-60"
                                >
                                    {changingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;