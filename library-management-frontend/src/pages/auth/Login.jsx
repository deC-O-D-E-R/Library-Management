import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { login } from '../../api/adminApi';

const Login = () => {
    const navigate = useNavigate();
    const { login: setAuth } = useAuth();

    const [form, setForm] = useState({ staffNumber: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.staffNumber || !form.password) {
            setError('Please enter staff number and password');
            return;
        }

        setLoading(true);
        try {
            const res = await login(form);
            const data = res.data;

            setAuth(
                {
                    name: data.name,
                    staffNumber: data.staffNumber,
                    email: data.email,
                    roles: data.roles,
                },
                data.token
            );

            if (data.roles.includes('ADMIN')) {
                navigate('/admin/dashboard');
            } else if (data.roles.includes('LIBRARIAN')) {
                navigate('/librarian/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4">
                        <BookOpen size={28} className="text-primary" />
                    </div>
                    <h1 className="text-text-primary text-2xl font-bold tracking-tight">
                        CDOT Library
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Sign in to your account
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface border border-border rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Staff Number */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                Staff Number
                            </label>
                            <input
                                type="text"
                                name="staffNumber"
                                value={form.staffNumber}
                                onChange={handleChange}
                                placeholder="e.g. EMP001"
                                className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-900 bg-opacity-40 border border-danger rounded-lg px-4 py-3">
                                <p className="text-danger text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent text-primary font-semibold rounded-lg py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-text-secondary text-xs mt-6">
                    CDOT Library Management System © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default Login;