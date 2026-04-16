import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { getMyBooks, getMyHistory } from '../../api/userApi';
import { formatDate } from '../../utils/helpers';

const tabs = [
    { key: 'issued', label: 'Currently Issued' },
    { key: 'history', label: 'Full History' },
];

const MyBooks = () => {
    const [issued, setIssued] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('issued');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [issuedRes, historyRes] = await Promise.all([
                    getMyBooks(),
                    getMyHistory(),
                ]);
                setIssued(issuedRes.data);
                setHistory(historyRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    const issuedColumns = [
        { header: 'Book Title', key: 'bookTitle' },
        { header: 'Accession No.', key: 'accessionNumber' },
        { header: 'Call No.', key: 'callNumber' },
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

    const historyColumns = [
        { header: 'Book Title', key: 'bookTitle' },
        { header: 'Accession No.', key: 'accessionNumber' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        { header: 'Due Date', render: (row) => formatDate(row.dueDate) },
        { header: 'Return Date', render: (row) => formatDate(row.returnDate) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">My Books</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        View your currently issued books and borrowing history
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Currently Issued</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">{issued.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-danger text-xs uppercase tracking-wider">Overdue</p>
                        <p className="text-danger text-2xl font-bold mt-1">
                            {issued.filter(b => isOverdue(b.dueDate)).length}
                        </p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Total Borrowed</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">{history.length}</p>
                    </div>
                </div>

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
                        </button>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    {activeTab === 'issued' ? (
                        <Table
                            columns={issuedColumns}
                            data={issued}
                            emptyMessage="You have no books currently issued"
                        />
                    ) : (
                        <Table
                            columns={historyColumns}
                            data={history}
                            emptyMessage="No borrowing history found"
                        />
                    )}
                </Card>

            </div>
        </Layout>
    );
};

export default MyBooks;