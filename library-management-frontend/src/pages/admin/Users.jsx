import { useState, useEffect } from 'react';
import { Plus, Upload, UserX, Pencil, Search, UploadIcon } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import {
    getAllUsers, addUser, editUser, deactivateUser, bulkUploadUsers
} from '../../api/adminApi';
import { formatDate } from '../../utils/helpers';

const emptyForm = {
    name: '', staffNumber: '', password: '', designation: '',
    email: '', dateOfJoining: '', dateOfSuperannuation: '',
    dateOfResignation: '', roles: ['EMPLOYEE']
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkResult, setBulkResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.staffNumber.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        ));
    }, [search, users]);

    const openAdd = () => {
        setEditingUser(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            staffNumber: user.staffNumber,
            password: '',
            designation: user.designation,
            email: user.email,
            dateOfJoining: user.dateOfJoining || '',
            dateOfSuperannuation: user.dateOfSuperannuation || '',
            dateOfResignation: user.dateOfResignation || '',
            roles: user.roles || ['EMPLOYEE']
        });
        setError('');
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setForm({ ...form, roles: [e.target.value] });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.staffNumber || !form.designation || !form.email || !form.dateOfJoining) {
            setError('Please fill all required fields');
            return;
        }
        if (!editingUser && !form.password) {
            setError('Password is required for new users');
            return;
        }

        setSaving(true);
        try {
            if (editingUser) {
                await editUser(editingUser.userId, form);
            } else {
                await addUser(form);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await deactivateUser(userId);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return;
        setSaving(true);
        try {
            const res = await bulkUploadUsers(bulkFile);
            setBulkResult(res.data);
            fetchUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { header: 'Name', key: 'name' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Designation', key: 'designation' },
        { header: 'Email', key: 'email' },
        { header: 'Joined', render: (row) => formatDate(row.dateOfJoining) },
        { header: 'Role', render: (row) => row.roles?.map((r, i) => <Badge key={i} text={r} type="role" />) },
        { header: 'Status', render: (row) => <Badge text={row.isActive ? 'active' : 'inactive'} /> },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEdit(row)}
                        className="text-text-secondary hover:text-accent transition-colors"
                    >
                        <Pencil size={15} />
                    </button>
                    {row.isActive && (
                        <button
                            onClick={() => handleDeactivate(row.userId)}
                            className="text-text-secondary hover:text-danger transition-colors"
                        >
                            <UserX size={15} />
                        </button>
                    )}
                </div>
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
                        <h1 className="text-text-primary text-2xl font-bold">Users</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            Manage all library members and staff
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setBulkResult(null); setShowBulkModal(true); }}>
                            <Upload size={15} /> Bulk Upload
                        </Button>
                        <Button onClick={openAdd}>
                            <Plus size={15} /> Add User
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by name, staff number or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                    />
                </div>

                {/* Table */}
                <Card>
                    <Table columns={columns} data={filtered} emptyMessage="No users found" />
                </Card>

            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? 'Edit User' : 'Add New User'}
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                    <Input label="Staff Number" name="staffNumber" value={form.staffNumber} onChange={handleChange} required />
                    <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required={!editingUser} placeholder={editingUser ? 'Leave blank to keep current' : ''} />
                    <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} required />
                    <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required className="col-span-2" />
                    <Input label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} required />
                    <Input label="Date of Superannuation" name="dateOfSuperannuation" type="date" value={form.dateOfSuperannuation} onChange={handleChange} />
                    <Input label="Date of Resignation" name="dateOfResignation" type="date" value={form.dateOfResignation} onChange={handleChange} />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Role</label>
                        <select
                            value={form.roles[0]}
                            onChange={handleRoleChange}
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                        >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="LIBRARIAN">Librarian</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>

                {error && <p className="text-danger text-sm mt-3">{error}</p>}

                <div className="flex justify-end gap-3 mt-5">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Add User'}
                    </Button>
                </div>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                title="Bulk Upload Users"
            >
                {!bulkResult ? (
                    <div className="flex flex-col gap-4">
                        <p className="text-text-secondary text-sm">
                            Upload a CSV or Excel file with columns: name, staffNumber, password, designation,
                            email, dateOfJoining, dateOfSuperannuation, dateOfResignation, roles
                        </p>

                        <label
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
        ${bulkFile
                                    ? 'border-success bg-background-success text-success'
                                    : 'border-border-secondary text-text-secondary hover:border-border-primary hover:bg-background-secondary'
                                }`}
                        >
                            <UploadIcon className="w-4 h-4" />
                            <span>{bulkFile ? bulkFile.name : 'Choose file'}</span>

                            <input
                                type="file"
                                accept=".csv,.xlsx"
                                className="hidden"
                                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                            />
                        </label>

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
                                Cancel
                            </Button>

                            <Button onClick={handleBulkUpload} disabled={!bulkFile || saving}>
                                {saving ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-sidebar rounded-lg p-3 text-center">
                                <p className="text-text-secondary text-xs">Total</p>
                                <p className="text-text-primary text-xl font-bold">{bulkResult.totalRows}</p>
                            </div>
                            <div className="bg-sidebar rounded-lg p-3 text-center">
                                <p className="text-success text-xs">Success</p>
                                <p className="text-success text-xl font-bold">{bulkResult.successRows}</p>
                            </div>
                            <div className="bg-sidebar rounded-lg p-3 text-center">
                                <p className="text-danger text-xs">Failed</p>
                                <p className="text-danger text-xl font-bold">{bulkResult.failedRows}</p>
                            </div>
                        </div>
                        {bulkResult.errors?.length > 0 && (
                            <div className="bg-sidebar rounded-lg p-3 max-h-40 overflow-y-auto">
                                {bulkResult.errors.map((e, i) => (
                                    <p key={i} className="text-danger text-xs py-1 border-b border-border">
                                        Row {e.row} — {e.staffNumber}: {e.reason}
                                    </p>
                                ))}
                            </div>
                        )}
                        <Button onClick={() => setShowBulkModal(false)}>Done</Button>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default AdminUsers;