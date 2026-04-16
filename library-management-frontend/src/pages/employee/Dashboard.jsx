import { useState, useEffect } from 'react';
import { BookMarked, Clock, Receipt, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getMyBooks, getMyFines } from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-surface border border-border rounded-xl p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:border-accent transition-colors' : ''}`}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-primary" />
        </div>
        <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-text-primary text-2xl font-bold mt-0.5">{value}</p>
        </div>
    </div>
);

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myBooks, setMyBooks] = useState([]);
    const [myFines, setMyFines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [booksRes, finesRes] = await Promise.all([
                    getMyBooks(),
                    getMyFines(),
                ]);
                setMyBooks(booksRes.data);
                setMyFines(finesRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const pendingFines = myFines.filter(f => f.status === 'pending');
    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    const booksColumns = [
        { header: 'Book Title', key: 'bookTitle' },
        { header: 'Accession No.', key: 'accessionNumber' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        {
            header: 'Due Date',
            render: (row) => (
                <span className={isOverdue(row.dueDate) ? 'text-danger font-semibold' : 'text-text-primary'}>
                    {formatDate(row.dueDate)}
                </span>
            )
        },
        {
            header: 'Status',
            render: (row) => <Badge text={isOverdue(row.dueDate) ? 'overdue' : row.status} />
        },
    ];

    const finesColumns = [
        { header: 'Book', key: 'bookTitle' },
        { header: 'Amount', render: (row) => <span className="text-warning font-semibold">{formatCurrency(row.amount)}</span> },
        { header: 'Due Date', render: (row) => formatDate(row.dueDate) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Welcome */}
                <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">
                            Welcome, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {user?.staffNumber} — {user?.roles?.join(', ')}
                        </p>
                    </div>
                    <Button onClick={() => navigate('/employee/search')}>
                        <Search size={15} /> Search Books
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={BookMarked}
                        label="Currently Issued"
                        value={myBooks.length}
                        color="bg-accent"
                        onClick={() => navigate('/employee/my-books')}
                    />
                    <StatCard
                        icon={Clock}
                        label="Overdue Books"
                        value={myBooks.filter(b => isOverdue(b.dueDate)).length}
                        color="bg-danger"
                        onClick={() => navigate('/employee/my-books')}
                    />
                    <StatCard
                        icon={Receipt}
                        label="Pending Fines"
                        value={pendingFines.length}
                        color="bg-warning"
                        onClick={() => navigate('/employee/my-fines')}
                    />
                </div>

                {/* Currently Issued */}
                <Card
                    title="My Issued Books"
                    action={
                        <Button size="sm" variant="secondary" onClick={() => navigate('/employee/my-books')}>
                            View All
                        </Button>
                    }
                >
                    <Table
                        columns={booksColumns}
                        data={myBooks.slice(0, 5)}
                        emptyMessage="You have no books currently issued"
                    />
                </Card>

                {/* Pending Fines */}
                {pendingFines.length > 0 && (
                    <Card
                        title="Pending Fines"
                        action={
                            <Button size="sm" variant="secondary" onClick={() => navigate('/employee/my-fines')}>
                                View All
                            </Button>
                        }
                    >
                        <Table
                            columns={finesColumns}
                            data={pendingFines.slice(0, 3)}
                            emptyMessage="No pending fines"
                        />
                    </Card>
                )}

            </div>
        </Layout>
    );
};

export default EmployeeDashboard;