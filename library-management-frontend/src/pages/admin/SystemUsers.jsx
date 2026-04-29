import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import useAuth from '../../hooks/useAuth';
import { getAllSystemAccounts, createSystemAccount, deactivateSystemAccount } from '../../api/systemApi';

const emptyForm = (email = '') => ({
    accountName: '',
    username: '',
    email: email,
    role: 'LIBRARIAN',
    password: ''
});

const SystemUsers = () => {
    const { auth } = useAuth();

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState(emptyForm(auth?.email || ''));

    useEffect(() => { fetchAccounts(); }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await getAllSystemAccounts();
            setAccounts(res.data);
        } catch {
            // handled by empty state
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormError('');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.accountName || !form.username || !form.password) {
            setFormError('Please fill all required fields'); return;
        }
        if (form.password.length < 6) {
            setFormError('Password must be at least 6 characters'); return;
        }
        setFormLoading(true);
        try {
            await createSystemAccount(form);
            closeModal();
            fetchAccounts();
        } catch (err) {
            setFormError(err.response?.data || 'Failed to create account');
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDeactivate = (account) => {
        setSelectedAccount(account);
        setShowDeactivateModal(true);
    };

    const handleDeactivate = async () => {
        try {
            await deactivateSystemAccount(selectedAccount.accountId);
            setShowDeactivateModal(false);
            setSelectedAccount(null);
            fetchAccounts();
        } catch (err) {
            alert(err.response?.data || 'Failed to deactivate account');
        }
    };

    const handleRowClick = (account) => {
        setSelectedAccount(prev =>
            prev?.accountId === account.accountId ? null : account
        );
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(emptyForm(auth?.email || ''));
        setFormError('');
        setShowPassword(false);
    };

    const formatDate = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const columns = [
        { header: 'Username', key: 'username' },
        { header: 'Email', key: 'email' },
        {
            header: 'Role',
            render: (row) => <Badge text={row.role} type="role" />
        },
        {
            header: 'Status',
            render: (row) => <Badge text={row.isActive ? 'ACTIVE' : 'INACTIVE'} />
        },
        {
            header: 'Created At',
            render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            })
        },
        {
            header: 'Action',
            render: (row) => row.isActive ? (
                <button
                    onClick={(e) => { e.stopPropagation(); confirmDeactivate(row); }}
                    className="text-xs text-danger hover:underline">
                    Deactivate
                </button>
            ) : (
                <span className="text-xs text-text-secondary">—</span>
            )
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">System Users</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            Manage admin and librarian accounts.
                        </p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-accent text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors">
                        <Plus size={15} /> New Account
                    </button>
                </div>

                {/* Table */}
                <Card title="All System Accounts">
                    <Table
                        columns={columns}
                        data={accounts}
                        emptyMessage="No system accounts found"
                        onRowClick={handleRowClick}
                        highlightRow={(row) => selectedAccount?.accountId === row.accountId}
                    />
                </Card>

                {/* Login Details Panel */}
                {selectedAccount && (
                    <Card title={`Login Details: ${selectedAccount.username}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-1">
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Account Name</p>
                                <p className="text-text-primary font-medium mt-1">{selectedAccount.accountName}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Username</p>
                                <p className="text-text-primary font-medium mt-1">{selectedAccount.username}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Email</p>
                                <p className="text-text-primary font-medium mt-1">{selectedAccount.email || '—'}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Role</p>
                                <div className="mt-1"><Badge text={selectedAccount.role} type="role" /></div>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Status</p>
                                <div className="mt-1"><Badge text={selectedAccount.isActive ? 'ACTIVE' : 'INACTIVE'} /></div>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Created By</p>
                                <p className="text-text-primary font-medium mt-1">{selectedAccount.createdBy}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Created At</p>
                                <p className="text-text-primary font-medium mt-1">{formatDate(selectedAccount.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Last Login</p>
                                <p className="text-text-primary font-medium mt-1">{formatDate(selectedAccount.lastLogin)}</p>
                            </div>
                        </div>
                    </Card>
                )}

            </div>

            {/* Create Modal */}
            <Modal isOpen={showModal} onClose={closeModal} title="New System Account">
                <form onSubmit={handleCreate} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Account Name</label>
                        <input type="text" name="accountName" value={form.accountName}
                            onChange={handleChange} placeholder="Full name of the account holder"
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Username</label>
                        <input type="text" name="username" value={form.username}
                            onChange={handleChange} placeholder="Unique login ID e.g. LIB001"
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Email</label>
                        <input type="email" name="email" value={form.email}
                            onChange={handleChange} placeholder="Official email address"
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Role</label>
                        <select name="role" value={form.role} onChange={handleChange}
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent">
                            <option value="LIBRARIAN">Librarian</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} name="password"
                                value={form.password} onChange={handleChange}
                                placeholder="Min. 6 characters"
                                className="w-full bg-sidebar border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {formError && (
                        <div className="border border-danger rounded-lg px-4 py-3">
                            <p className="text-danger text-sm">{formError}</p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-1">
                        <button type="button" onClick={closeModal}
                            className="flex-1 border border-border text-text-secondary font-semibold rounded-lg py-2.5 text-sm hover:text-text-primary transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={formLoading}
                            className="flex-1 bg-accent text-primary font-semibold rounded-lg py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60">
                            {formLoading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Deactivate Confirm Modal */}
            <Modal isOpen={showDeactivateModal} onClose={() => setShowDeactivateModal(false)} title="Deactivate Account">
                <div className="flex flex-col items-center gap-4 text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-danger" />
                    </div>
                    <div>
                        <p className="text-text-primary font-semibold">Are you sure?</p>
                        <p className="text-text-secondary text-sm mt-1">
                            Account <span className="text-text-primary font-medium">"{selectedAccount?.username}"</span> will
                            be deactivated and will no longer be able to log in.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button onClick={() => setShowDeactivateModal(false)}
                            className="flex-1 border border-border text-text-secondary font-semibold rounded-lg py-2.5 text-sm hover:text-text-primary transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleDeactivate}
                            className="flex-1 bg-danger text-white font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity">
                            Deactivate
                        </button>
                    </div>
                </div>
            </Modal>

        </Layout>
    );
};

export default SystemUsers;