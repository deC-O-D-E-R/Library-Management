import { useState, useEffect } from 'react';
import { BookCheck, RotateCcw, AlertTriangle, Banknote } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import {
    getIssuedCirculations, getOverdueCirculations, getPendingFines
} from '../../api/userApi';
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

const LibrarianDashboard = () => {
    const [issued, setIssued] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [pendingFines, setPendingFines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [issuedRes, overdueRes, finesRes] = await Promise.all([
                    getIssuedCirculations(),
                    getOverdueCirculations(),
                    getPendingFines(),
                ]);
                setIssued(issuedRes.data);
                setOverdue(overdueRes.data);
                setPendingFines(finesRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const circulationColumns = [
        { header: 'Book', key: 'bookTitle' },
        { header: 'Borrower', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        { header: 'Due Date', render: (row) => formatDate(row.dueDate) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
    ];

    const overdueColumns = [
        { header: 'Book', key: 'bookTitle' },
        { header: 'Borrower', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Due Date', render: (row) => formatDate(row.dueDate) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Dashboard</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Library circulation overview
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={BookCheck}
                        label="Currently Issued"
                        value={issued.length}
                        color="bg-accent"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Overdue Books"
                        value={overdue.length}
                        color="bg-danger"
                    />
                    <StatCard
                        icon={Banknote}
                        label="Pending Fines"
                        value={pendingFines.length}
                        color="bg-warning"
                    />
                </div>

                {/* Issued Books */}
                <Card title="Currently Issued Books">
                    <Table
                        columns={circulationColumns}
                        data={issued.slice(0, 5)}
                        emptyMessage="No books currently issued"
                    />
                </Card>

                {/* Overdue Books */}
                <Card title="Overdue Books">
                    <Table
                        columns={overdueColumns}
                        data={overdue.slice(0, 5)}
                        emptyMessage="No overdue books"
                    />
                </Card>

            </div>
        </Layout>
    );
};

export default LibrarianDashboard;