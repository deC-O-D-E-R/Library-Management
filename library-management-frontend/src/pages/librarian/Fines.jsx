import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getAllFines, getPendingFines, markFineAsPaid, markFineAsWaived } from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';

const tabs = [
    { key: 'all', label: 'All Fines' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'waived', label: 'Waived' },
];

const Fines = () => {
    const [all, setAll] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [allRes, pendingRes] = await Promise.all([
                getAllFines(),
                getPendingFines(),
            ]);
            setAll(allRes.data);
            setPending(pendingRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getTabData = () => {
        switch (activeTab) {
            case 'pending': return pending;
            case 'paid': return all.filter(f => f.status === 'paid');
            case 'waived': return all.filter(f => f.status === 'waived');
            default: return all;
        }
    };

    const filtered = getTabData().filter(f => {
        const q = search.toLowerCase();
        return (
            f.userName.toLowerCase().includes(q) ||
            f.staffNumber.toLowerCase().includes(q) ||
            f.bookTitle.toLowerCase().includes(q)
        );
    });

    const handlePay = async (fineId) => {
        setProcessing(fineId);
        setError('');
        try {
            await markFineAsPaid(fineId);
            fetchData();
        } catch (err) {
            setError(err.response?.data || 'Failed to mark fine as paid');
        } finally {
            setProcessing(null);
        }
    };

    const handleWaive = async (fineId) => {
        if (!window.confirm('Are you sure you want to waive this fine?')) return;
        setProcessing(fineId);
        setError('');
        try {
            await markFineAsWaived(fineId);
            fetchData();
        } catch (err) {
            setError(err.response?.data || 'Failed to waive fine');
        } finally {
            setProcessing(null);
        }
    };

    const columns = [
        { header: 'Borrower', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Book', key: 'bookTitle' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        { header: 'Due Date', render: (row) => <span className="text-danger">{formatDate(row.dueDate)}</span> },
        { header: 'Return Date', render: (row) => formatDate(row.returnDate) },
        {
            header: 'Amount',
            render: (row) => (
                <span className="text-warning font-semibold">{formatCurrency(row.amount)}</span>
            )
        },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
        { header: 'Paid Date', render: (row) => formatDate(row.paidDate) },
        { header: 'Collected By', render: (row) => row.collectedByName || '—' },
        {
            header: 'Actions',
            render: (row) => row.status === 'pending' ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => handlePay(row.fineId)}
                        disabled={processing === row.fineId}
                    >
                        {processing === row.fineId ? '...' : 'Mark Paid'}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleWaive(row.fineId)}
                        disabled={processing === row.fineId}
                    >
                        Waive
                    </Button>
                </div>
            ) : <span className="text-text-secondary text-xs">—</span>
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Fines</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Manage overdue fines and payments
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Total Fines</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">{all.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-warning text-xs uppercase tracking-wider">Pending</p>
                        <p className="text-warning text-2xl font-bold mt-1">{pending.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-success text-xs uppercase tracking-wider">Collected</p>
                        <p className="text-success text-2xl font-bold mt-1">
                            {formatCurrency(all.filter(f => f.status === 'paid')
                                .reduce((sum, f) => sum + parseFloat(f.amount), 0))}
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-900 bg-opacity-30 border border-danger rounded-lg px-4 py-3">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeTab === tab.key
                                    ? 'bg-accent text-primary'
                                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {tab.label}
                            {tab.key === 'pending' && pending.length > 0 && (
                                <span className="ml-2 bg-warning text-primary text-xs px-1.5 py-0.5 rounded-full">
                                    {pending.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by borrower, staff number or book title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                    />
                </div>

                {/* Table */}
                <Card title={`${tabs.find(t => t.key === activeTab)?.label} (${filtered.length})`}>
                    <Table
                        columns={columns}
                        data={filtered}
                        emptyMessage="No fines found"
                    />
                </Card>

            </div>
        </Layout>
    );
};

export default Fines;