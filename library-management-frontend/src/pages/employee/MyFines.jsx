import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { getMyFines, isFineSystemEnabledForUser } from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';

const tabs = [
    { key: 'all', label: 'All Fines' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'waived', label: 'Waived' },
];

const MyFines = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [fineSystemEnabled, setFineSystemEnabled] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [res, fineConfigRes] = await Promise.all([
                    getMyFines(),
                    isFineSystemEnabledForUser(),
                ]);
                setFines(res.data);
                setFineSystemEnabled(fineConfigRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTabData = () => {
        if (activeTab === 'all') return fines;
        return fines.filter(f => f.status === activeTab);
    };

    const pending = fines.filter(f => f.status === 'pending');
    const totalPending = pending.reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const columns = [
        { header: 'Book Title', key: 'bookTitle' },
        {
            header: 'Fine Amount',
            render: (row) => (
                <span className={`font-semibold ${row.status === 'pending' ? 'text-warning' : 'text-text-secondary'}`}>
                    {formatCurrency(row.amount)}
                </span>
            )
        },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        {
            header: 'Due Date',
            render: (row) => <span className="text-danger">{formatDate(row.dueDate)}</span>
        },
        { header: 'Return Date', render: (row) => formatDate(row.returnDate) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
        { header: 'Paid Date', render: (row) => formatDate(row.paidDate) },
    ];

    if (loading) return <Layout><Loader /></Layout>;

    if (!fineSystemEnabled) {
        return (
            <Layout>
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">My Fines</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            View your fine history and outstanding payments
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <span className="text-5xl">⚠️</span>
                        <p className="text-text-primary font-semibold text-lg">Fine System is Disabled</p>
                        <p className="text-text-secondary text-sm text-center max-w-sm">
                            The library has not enabled the fine system yet. No fines are being charged for overdue returns.
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">My Fines</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        View your fine history and outstanding payments
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Total Fines</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">{fines.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-warning text-xs uppercase tracking-wider">Pending Amount</p>
                        <p className="text-warning text-2xl font-bold mt-1">{formatCurrency(totalPending)}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-success text-xs uppercase tracking-wider">Paid Fines</p>
                        <p className="text-success text-2xl font-bold mt-1">
                            {fines.filter(f => f.status === 'paid').length}
                        </p>
                    </div>
                </div>

                {/* Pending Alert */}
                {pending.length > 0 && (
                    <div className="bg-amber-900 bg-opacity-30 border border-warning rounded-xl px-5 py-4">
                        <p className="text-warning font-semibold text-sm">
                            You have {pending.length} pending {pending.length === 1 ? 'fine' : 'fines'} totalling {formatCurrency(totalPending)}
                        </p>
                        <p className="text-warning text-xs mt-1 opacity-80">
                            Please visit the library counter to pay your outstanding fines.
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
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

                {/* Table */}
                <Card>
                    <Table
                        columns={columns}
                        data={getTabData()}
                        emptyMessage="No fines found"
                    />
                </Card>

            </div>
        </Layout>
    );
};

export default MyFines;