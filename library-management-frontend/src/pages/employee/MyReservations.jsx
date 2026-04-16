import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getMyReservations, cancelReservation } from '../../api/userApi';
import { formatDateTime } from '../../utils/helpers';

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);
    const [error, setError] = useState('');

    const fetchReservations = async () => {
        try {
            const res = await getMyReservations();
            setReservations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReservations(); }, []);

    const handleCancel = async (reservationId) => {
        if (!window.confirm('Cancel this reservation?')) return;
        setCancelling(reservationId);
        setError('');
        try {
            await cancelReservation(reservationId);
            fetchReservations();
        } catch (err) {
            setError(err.response?.data || 'Failed to cancel reservation');
        } finally {
            setCancelling(null);
        }
    };

    const pending = reservations.filter(r => r.status === 'pending');
    const notified = reservations.filter(r => r.status === 'notified');

    const columns = [
        { header: 'Book Title', key: 'bookTitle' },
        { header: 'Call No.', key: 'callNumber' },
        { header: 'ISBN', render: (row) => row.isbn || '—' },
        { header: 'Reserved At', render: (row) => formatDateTime(row.reservedAt) },
        { header: 'Notified At', render: (row) => formatDateTime(row.notifiedAt) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
        {
            header: 'Action',
            render: (row) => (row.status === 'pending' || row.status === 'notified') ? (
                <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCancel(row.reservationId)}
                    disabled={cancelling === row.reservationId}
                >
                    <Trash2 size={13} />
                    {cancelling === row.reservationId ? '...' : 'Cancel'}
                </Button>
            ) : <span className="text-text-secondary text-xs">—</span>
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                <div>
                    <h1 className="text-text-primary text-2xl font-bold">My Reservations</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Track your book reservations and availability notifications
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Total</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">{reservations.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-warning text-xs uppercase tracking-wider">Pending</p>
                        <p className="text-warning text-2xl font-bold mt-1">{pending.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-success text-xs uppercase tracking-wider">Available Now</p>
                        <p className="text-success text-2xl font-bold mt-1">{notified.length}</p>
                    </div>
                </div>

                {notified.length > 0 && (
                    <div className="bg-green-900 bg-opacity-30 border border-success rounded-xl px-5 py-4">
                        <p className="text-success font-semibold text-sm">
                            {notified.length} {notified.length === 1 ? 'book is' : 'books are'} available for you to collect!
                        </p>
                        <p className="text-success text-xs mt-1 opacity-80">
                            Please visit the library counter to collect your reserved book.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900 bg-opacity-30 border border-danger rounded-lg px-4 py-3">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                <Card title={`All Reservations (${reservations.length})`}>
                    <Table
                        columns={columns}
                        data={reservations}
                        emptyMessage="You have no reservations"
                    />
                </Card>

            </div>
        </Layout>
    );
};

export default MyReservations;