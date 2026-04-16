import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getAllReservations, getPendingReservations, fulfillReservation } from '../../api/userApi';
import { formatDateTime } from '../../utils/helpers';

const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'notified', label: 'Notified' },
    { key: 'fulfilled', label: 'Fulfilled' },
    { key: 'cancelled', label: 'Cancelled' },
];

const Reservations = () => {
    const [all, setAll] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [fulfilling, setFulfilling] = useState(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [allRes, pendingRes] = await Promise.all([
                getAllReservations(),
                getPendingReservations(),
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
        if (activeTab === 'all') return all;
        return all.filter(r => r.status === activeTab);
    };

    const filtered = getTabData().filter(r => {
        const q = search.toLowerCase();
        return (
            r.bookTitle.toLowerCase().includes(q) ||
            r.userName.toLowerCase().includes(q) ||
            r.staffNumber.toLowerCase().includes(q)
        );
    });

    const handleFulfill = async (reservationId) => {
        setFulfilling(reservationId);
        setError('');
        try {
            await fulfillReservation(reservationId);
            fetchData();
        } catch (err) {
            setError(err.response?.data || 'Failed to fulfill reservation');
        } finally {
            setFulfilling(null);
        }
    };

    const columns = [
        { header: 'Book Title', key: 'bookTitle' },
        { header: 'Call No.', key: 'callNumber' },
        { header: 'User', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Reserved At', render: (row) => formatDateTime(row.reservedAt) },
        { header: 'Notified At', render: (row) => formatDateTime(row.notifiedAt) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
        {
            header: 'Action',
            render: (row) => (row.status === 'pending' || row.status === 'notified') ? (
                <Button
                    size="sm"
                    onClick={() => handleFulfill(row.reservationId)}
                    disabled={fulfilling === row.reservationId}
                >
                    {fulfilling === row.reservationId ? '...' : 'Fulfill'}
                </Button>
            ) : <span className="text-text-secondary text-xs">—</span>
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Reservations</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Manage book reservations and notify users
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Total</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">{all.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-warning text-xs uppercase tracking-wider">Pending</p>
                        <p className="text-warning text-2xl font-bold mt-1">{pending.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-success text-xs uppercase tracking-wider">Notified</p>
                        <p className="text-success text-2xl font-bold mt-1">
                            {all.filter(r => r.status === 'notified').length}
                        </p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Fulfilled</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">
                            {all.filter(r => r.status === 'fulfilled').length}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-900 bg-opacity-30 border border-danger rounded-lg px-4 py-3">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-2 flex-wrap">
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

                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by book title, user or staff number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                    />
                </div>

                <Card title={`${tabs.find(t => t.key === activeTab)?.label} Reservations (${filtered.length})`}>
                    <Table
                        columns={columns}
                        data={filtered}
                        emptyMessage="No reservations found"
                    />
                </Card>

            </div>
        </Layout>
    );
};

export default Reservations;