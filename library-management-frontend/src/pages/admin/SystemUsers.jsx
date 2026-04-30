import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Eye, EyeOff, AlertTriangle, Save } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import useAuth from '../../hooks/useAuth';
import {
    getAllSystemAccounts, createSystemAccount,
    deactivateSystemAccount, updateSystemAccountPermissions
} from '../../api/systemApi';

const ALL_PERMISSIONS = [
    { key: 'SEARCH_BOOKS', label: 'Search Books', description: 'Can search and view books' },
    { key: 'ISSUE_RETURN_BOOKS', label: 'Issue & Return Books', description: 'Can issue, return books and view circulation' },
    { key: 'MANAGE_RESERVATIONS', label: 'Manage Reservations', description: 'Can manage book reservations' },
    { key: 'MANAGE_FINES', label: 'Manage Fines', description: 'Can manage and collect fines' },
    { key: 'MANAGE_BOOKS', label: 'Manage Books', description: 'Can add and manage books' },
    { key: 'MANAGE_USERS', label: 'Manage Users', description: 'Can add and manage users' },
];

const DEFAULT_PERMISSIONS = ['SEARCH_BOOKS', 'ISSUE_RETURN_BOOKS'];

const emptyForm = (email = '') => ({
    accountName: '',
    username: '',
    email,
    role: 'LIBRARIAN',
    password: '',
    permissions: [...DEFAULT_PERMISSIONS]
});

const SystemUsers = () => {
    const { user } = useAuth(); 

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState(emptyForm(user?.email || ''));

    // permissions editing in details panel
    const [editingPermissions, setEditingPermissions] = useState([]);
    const [permSaving, setPermSaving] = useState(false);
    const [permSuccess, setPermSuccess] = useState('');

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

    // toggle permission in create form
    const toggleFormPermission = (key) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(key)
                ? prev.permissions.filter(k => k !== key)
                : [...prev.permissions, key]
        }));
    };

    // toggle permission in details panel
    const toggleEditPermission = (key) => {
        setEditingPermissions(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
        setPermSuccess('');
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

    const handleSavePermissions = async () => {
        setPermSaving(true);
        setPermSuccess('');
        try {
            const res = await updateSystemAccountPermissions(selectedAccount.accountId, editingPermissions);
            setSelectedAccount(res.data);
            setAccounts(prev => prev.map(a =>
                a.accountId === res.data.accountId ? res.data : a
            ));
            setPermSuccess('Permissions saved successfully');
        } catch (err) {
            alert(err.response?.data || 'Failed to save permissions');
        } finally {
            setPermSaving(false);
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
        if (selectedAccount?.accountId === account.accountId) {
            setSelectedAccount(null);
            return;
        }
        setSelectedAccount(account);
        setEditingPermissions(account.permissions || []);
        setPermSuccess('');
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(emptyForm(user?.email || ''));
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
        { header: 'Role', render: (row) => <Badge text={row.role} type="role" /> },
        { header: 'Status', render: (row) => <Badge text={row.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
        {
            header: 'Created At',
            render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            })
        },
        {
            header: 'Action',
            render: (row) => row.isActive ? (
                <button onClick={(e) => { e.stopPropagation(); confirmDeactivate(row); }}
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
                        <p className="text-text-secondary text-sm mt-1">Manage admin and librarian accounts.</p>
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

                {/* Details Panel */}
                {selectedAccount && (
                    <Card title="Login Details">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                            <ShieldCheck size={16} className="text-accent" />
                            <span className="text-text-secondary text-sm">Viewing account —</span>
                            <span className="text-emerald-400 font-semibold text-sm">{selectedAccount.username}</span>
                            <Badge text={selectedAccount.role} type="role" />
                        </div>

                        {/* Account Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Account Name</p>
                                <p className="text-text-primary font-medium mt-1">{selectedAccount.accountName}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Email</p>
                                <p className="text-text-primary font-medium mt-1">{selectedAccount.email || '—'}</p>
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

                        {/* Permissions Section */}
                        <div className="border-t border-border pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    {selectedAccount.role === 'ADMIN' ? 'Permissions' : 'Librarian Permissions'}
                                </p>
                                {selectedAccount.role === 'LIBRARIAN' && (
                                    <button
                                        onClick={handleSavePermissions}
                                        disabled={permSaving}
                                        className="flex items-center gap-1.5 bg-accent text-primary text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-60">
                                        <Save size={12} />
                                        {permSaving ? 'Saving...' : 'Save'}
                                    </button>
                                )}
                            </div>

                            {selectedAccount.role === 'ADMIN' ? (
                                <p className="text-text-secondary text-sm">
                                    Admin accounts have full access to all features by default.
                                </p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {ALL_PERMISSIONS.map((perm) => (
                                            <label key={perm.key}
                                                className="flex items-start gap-3 bg-sidebar border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-accent/40 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={editingPermissions.includes(perm.key)}
                                                    onChange={() => toggleEditPermission(perm.key)}
                                                    className="mt-0.5 accent-amber-400"
                                                />
                                                <div>
                                                    <p className="text-text-primary text-sm font-medium">{perm.label}</p>
                                                    <p className="text-text-secondary text-xs mt-0.5">{perm.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {permSuccess && (
                                        <p className="text-success text-xs mt-3">{permSuccess}</p>
                                    )}
                                </>
                            )}
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

                    {/* Permissions in create modal — only for librarian */}
                    {form.role === 'LIBRARIAN' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Permissions</label>
                            <div className="flex flex-col gap-2">
                                {ALL_PERMISSIONS.map((perm) => (
                                    <label key={perm.key}
                                        className="flex items-center gap-3 bg-sidebar border border-border rounded-lg px-3 py-2.5 cursor-pointer hover:border-accent/40 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={form.permissions.includes(perm.key)}
                                            onChange={() => toggleFormPermission(perm.key)}
                                            className="accent-amber-400"
                                        />
                                        <div>
                                            <p className="text-text-primary text-sm font-medium">{perm.label}</p>
                                            <p className="text-text-secondary text-xs">{perm.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

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