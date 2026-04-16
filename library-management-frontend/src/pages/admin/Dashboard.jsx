import { useState, useEffect } from 'react';
import { Users, BookOpen, BookCheck, AlertTriangle, Banknote } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { getAllUsers } from '../../api/adminApi';
import { getAllBooks } from '../../api/adminApi';
import { getIssuedCirculations, getOverdueCirculations, getPendingFines } from '../../api/userApi';
import { formatDate } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-primary" />
        </div>
        <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-text-primary text-2xl font-bold mt-0.5">{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBooks: 0,
        issuedBooks: 0,
        overdueBooks: 0,
        pendingFines: 0,
    });
    const [recentCirculations, setRecentCirculations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [users, books, issued, overdue, fines] = await Promise.all([
                    getAllUsers(),
                    getAllBooks(),
                    getIssuedCirculations(),
                    getOverdueCirculations(),
                    getPendingFines(),
                ]);

                setStats({
                    totalUsers: users.data.length,
                    totalBooks: books.data.length,
                    issuedBooks: issued.data.length,
                    overdueBooks: overdue.data.length,
                    pendingFines: fines.data.length,
                });

                setRecentCirculations(issued.data.slice(0, 5));
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        { header: 'Book Title', key: 'bookTitle' },
        { header: 'Borrower', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        { header: 'Due Date', render: (row) => formatDate(row.dueDate) },
        {
            header: 'Status',
            render: (row) => <Badge text={row.status} />
        },
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Dashboard</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Welcome back. Here's what's happening in the library today.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        icon={Users}
                        label="Total Users"
                        value={stats.totalUsers}
                        color="bg-accent"
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Total Books"
                        value={stats.totalBooks}
                        color="bg-accent"
                    />
                    <StatCard
                        icon={BookCheck}
                        label="Issued"
                        value={stats.issuedBooks}
                        color="bg-accent"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Overdue"
                        value={stats.overdueBooks}
                        color="bg-danger"
                    />
                    <StatCard
                        icon={Banknote}
                        label="Pending Fines"
                        value={stats.pendingFines}
                        color="bg-warning"
                    />
                </div>

                {/* Recent Issued Books */}
                <Card title="Recently Issued Books">
                    <Table
                        columns={columns}
                        data={recentCirculations}
                        emptyMessage="No books currently issued"
                    />
                </Card>

            </div>
        </Layout>
    );
};

export default AdminDashboard;