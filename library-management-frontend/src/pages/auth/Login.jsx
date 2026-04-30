import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { login, forgotPassword, verifyOtp, resetPassword } from '../../api/adminApi';
import { systemLogin, systemForgotPassword, systemVerifyOtp, systemResetPassword } from '../../api/systemApi';

const Login = () => {
    const navigate = useNavigate();
    const { login: setAuth } = useAuth();

    const [loginType, setLoginType] = useState('employee'); // 'employee' | 'system'
    const [step, setStep] = useState('login');
    const [form, setForm] = useState({ staffNumber: '', username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [fpIdentifier, setFpIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const switchLoginType = (type) => {
        setLoginType(type);
        setStep('login');
        setForm({ staffNumber: '', username: '', password: '' });
        setError('');
    };

    // ── Employee Login ──
    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        if (!form.staffNumber || !form.password) { setError('Please enter staff number and password'); return; }
        setLoading(true);
        try {
            const res = await login({ staffNumber: form.staffNumber, password: form.password });
            const data = res.data;
            setAuth({ name: data.name, staffNumber: data.staffNumber, email: data.email, roles: data.roles }, data.token);
            navigate('/employee/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── System Login ──
    const handleSystemSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) { setError('Please enter username and password'); return; }
        setLoading(true);
        try {
            const res = await systemLogin({ username: form.username, password: form.password });
            const data = res.data;
            setAuth({
                name: data.accountName,
                username: data.username,
                email: data.email,
                roles: [data.role],
                permissions: data.permissions
            }, data.token);
            if (data.role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/librarian/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot Password ──
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!fpIdentifier.trim()) { setError('Please enter your ' + (loginType === 'employee' ? 'staff number' : 'username')); return; }
        setLoading(true); setError('');
        try {
            if (loginType === 'employee') await forgotPassword(fpIdentifier.trim());
            else await systemForgotPassword(fpIdentifier.trim());
            setStep('otp');
        } catch (err) {
            setError(err.response?.data || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) { setError('Please enter the OTP'); return; }
        setLoading(true); setError('');
        try {
            if (loginType === 'employee') await verifyOtp(fpIdentifier.trim(), otp.trim());
            else await systemVerifyOtp(fpIdentifier.trim(), otp.trim());
            setStep('reset');
        } catch (err) {
            setError(err.response?.data || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) { setError('Please fill all fields'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        try {
            if (loginType === 'employee') await resetPassword(fpIdentifier.trim(), otp.trim(), newPassword);
            else await systemResetPassword(fpIdentifier.trim(), otp.trim(), newPassword);
            setStep('success');
        } catch (err) {
            setError(err.response?.data || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const resetForgotFlow = () => {
        setStep('login');
        setFpIdentifier('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };

    const ErrorBox = ({ msg }) => (
        <div className="border border-danger rounded-lg px-4 py-3">
            <p className="text-danger text-sm">{msg}</p>
        </div>
    );

    const Logo = () => (
        <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4">
                <BookOpen size={28} className="text-primary" />
            </div>
            <h1 className="text-text-primary text-2xl font-bold tracking-tight">CDOT Library</h1>
        </div>
    );

    const Toggle = () => (
        <div className="flex bg-sidebar border border-border rounded-xl p-1 mb-6">
            <button
                onClick={() => switchLoginType('employee')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors
                    ${loginType === 'employee' ? 'bg-accent text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                Employee
            </button>
            <button
                onClick={() => switchLoginType('system')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors
                    ${loginType === 'system' ? 'bg-accent text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                Admin / Librarian
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Logo />

                {/* ── Login ── */}
                {step === 'login' && (
                    <div className="bg-surface border border-border rounded-2xl p-8">
                        <Toggle />
                        <p className="text-text-secondary text-sm mb-6 text-center">
                            {loginType === 'employee' ? 'Sign in to your account' : 'Sign in to system account'}
                        </p>
                        <form onSubmit={loginType === 'employee' ? handleEmployeeSubmit : handleSystemSubmit}
                            className="flex flex-col gap-5">

                            {loginType === 'employee' ? (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Staff Number</label>
                                    <input type="text" name="staffNumber" value={form.staffNumber}
                                        onChange={handleChange} placeholder="e.g. EMP001"
                                        className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary transition-colors" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Username</label>
                                    <input type="text" name="username" value={form.username}
                                        onChange={handleChange} placeholder="e.g. LIB001"
                                        className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary transition-colors" />
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} name="password"
                                        value={form.password} onChange={handleChange} placeholder="Enter your password"
                                        className="w-full bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary transition-colors pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && <ErrorBox msg={error} />}

                            <button type="submit" disabled={loading}
                                className="w-full bg-accent text-primary font-semibold rounded-lg py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>

                            <button type="button" onClick={() => { setStep('forgot'); setError(''); }}
                                className="text-text-secondary text-xs hover:text-accent transition-colors text-center">
                                Forgot Password?
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Forgot ── */}
                {step === 'forgot' && (
                    <div className="bg-surface border border-border rounded-2xl p-8">
                        <button onClick={resetForgotFlow} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm mb-5 transition-colors">
                            <ArrowLeft size={15} /> Back to Login
                        </button>
                        <p className="text-text-primary font-semibold mb-1">Forgot Password</p>
                        <p className="text-text-secondary text-sm mb-5">
                            Enter your {loginType === 'employee' ? 'staff number' : 'username'} and we'll send an OTP to your registered email.
                        </p>
                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    {loginType === 'employee' ? 'Staff Number' : 'Username'}
                                </label>
                                <input type="text" value={fpIdentifier}
                                    onChange={(e) => { setFpIdentifier(e.target.value); setError(''); }}
                                    placeholder={loginType === 'employee' ? 'e.g. EMP001' : 'e.g. LIB001'}
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary" />
                            </div>
                            {error && <ErrorBox msg={error} />}
                            <button type="submit" disabled={loading}
                                className="w-full bg-accent text-primary font-semibold rounded-lg py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── OTP ── */}
                {step === 'otp' && (
                    <div className="bg-surface border border-border rounded-2xl p-8">
                        <button onClick={() => { setStep('forgot'); setError(''); }} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm mb-5 transition-colors">
                            <ArrowLeft size={15} /> Back
                        </button>
                        <p className="text-text-primary font-semibold mb-1">Enter OTP</p>
                        <p className="text-text-secondary text-sm mb-5">A 6-digit OTP has been sent to your registered email. It is valid for 10 minutes.</p>
                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">OTP</label>
                                <input type="text" value={otp} maxLength={6}
                                    onChange={(e) => { setOtp(e.target.value); setError(''); }}
                                    placeholder="Enter 6-digit OTP"
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary tracking-widest" />
                            </div>
                            {error && <ErrorBox msg={error} />}
                            <button type="submit" disabled={loading}
                                className="w-full bg-accent text-primary font-semibold rounded-lg py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Reset ── */}
                {step === 'reset' && (
                    <div className="bg-surface border border-border rounded-2xl p-8">
                        <p className="text-text-primary font-semibold mb-1">Reset Password</p>
                        <p className="text-text-secondary text-sm mb-5">Enter your new password below.</p>
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                        placeholder="Min. 6 characters"
                                        className="w-full bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary pr-10" />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Confirm Password</label>
                                <input type="password" value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    placeholder="Re-enter new password"
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary" />
                            </div>
                            {error && <ErrorBox msg={error} />}
                            <button type="submit" disabled={loading}
                                className="w-full bg-accent text-primary font-semibold rounded-lg py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Success ── */}
                {step === 'success' && (
                    <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 bg-green-900 bg-opacity-30 border border-success rounded-full flex items-center justify-center">
                            <span className="text-success text-2xl">✓</span>
                        </div>
                        <p className="text-text-primary font-semibold">Password Reset Successfully</p>
                        <p className="text-text-secondary text-sm">You can now sign in with your new password.</p>
                        <button onClick={resetForgotFlow}
                            className="w-full bg-accent text-primary font-semibold rounded-lg py-2.5 text-sm hover:bg-amber-400 transition-colors mt-2">
                            Back to Login
                        </button>
                    </div>
                )}

                <p className="text-center text-text-secondary text-xs mt-6">
                    CDOT Library Management System © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default Login;