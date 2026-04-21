import { useState, useEffect } from 'react';
import { BookCheck, AlertTriangle, Banknote, BookOpen } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import {
    getIssuedCirculations, getOverdueCirculations,
    getPendingFines, getLibrarianBookById
} from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';

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
    const [selectedBook, setSelectedBook] = useState(null);
    const [showBookModal, setShowBookModal] = useState(false);

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

    const handleViewBook = async (bookId) => {
        try {
            const res = await getLibrarianBookById(bookId);
            setSelectedBook(res.data);
            setShowBookModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const circulationColumns = [
        {
            header: 'Book',
            render: (row) => (
                <button
                    onClick={() => handleViewBook(row.bookId)}
                    className="hover:underline text-left font-medium"
                >
                    {row.bookTitle}
                </button>
            )
        },
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

            <Modal
                isOpen={showBookModal}
                onClose={() => setShowBookModal(false)}
                title="Book Details"
                size="lg"
            >
                {selectedBook && (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Title</p>
                                <p className="text-text-primary font-semibold mt-1">{selectedBook.title}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Author</p>
                                <p className="text-text-primary mt-1">{selectedBook.author}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">ISBN</p>
                                <p className="text-text-primary mt-1">{selectedBook.isbn || '—'}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Call Number</p>
                                <p className="text-text-primary mt-1">{selectedBook.callNumber}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Category</p>
                                <p className="text-text-primary mt-1">{selectedBook.categoryName}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Price</p>
                                <p className="text-text-primary mt-1">{formatCurrency(selectedBook.price)}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="bg-sidebar rounded-lg px-4 py-3 flex-1 text-center">
                                <p className="text-text-secondary text-xs">Total</p>
                                <p className="text-text-primary text-xl font-bold">{selectedBook.totalCopies}</p>
                            </div>
                            <div className="bg-sidebar rounded-lg px-4 py-3 flex-1 text-center">
                                <p className="text-success text-xs">Available</p>
                                <p className="text-success text-xl font-bold">{selectedBook.availableCopies}</p>
                            </div>
                            <div className="bg-sidebar rounded-lg px-4 py-3 flex-1 text-center">
                                <p className="text-warning text-xs">Issued</p>
                                <p className="text-warning text-xl font-bold">{selectedBook.issuedCopies}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-text-primary font-semibold text-sm mb-2">All Copies</p>
                            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                {selectedBook.copies?.map((copy) => (
                                    <div key={copy.copyId} className="flex items-center justify-between bg-sidebar px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={14} className="text-text-secondary" />
                                            <span className="text-text-primary text-sm">{copy.accessionNumber}</span>
                                        </div>
                                        <Badge text={copy.status} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

        </Layout>
    );
};

export default LibrarianDashboard;