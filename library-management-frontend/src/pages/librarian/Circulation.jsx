import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import {
    getAllCirculations, getOverdueCirculations,
    getIssuedCirculations, getLibrarianBookById
} from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';

const tabs = [
    { key: 'all', label: 'All' },
    { key: 'issued', label: 'Issued' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'returned', label: 'Returned' },
];

const Circulation = () => {
    const [all, setAll] = useState([]);
    const [issued, setIssued] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [showBookModal, setShowBookModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allRes, issuedRes, overdueRes] = await Promise.all([
                    getAllCirculations(),
                    getIssuedCirculations(),
                    getOverdueCirculations(),
                ]);
                setAll(allRes.data);
                setIssued(issuedRes.data);
                setOverdue(overdueRes.data);
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

    const getTabData = () => {
        switch (activeTab) {
            case 'issued': return issued;
            case 'overdue': return overdue;
            case 'returned': return all.filter(c => c.status === 'returned');
            default: return all;
        }
    };

    const filtered = getTabData().filter(c => {
        const q = search.toLowerCase();
        return (
            c.bookTitle.toLowerCase().includes(q) ||
            c.userName.toLowerCase().includes(q) ||
            c.staffNumber.toLowerCase().includes(q) ||
            c.accessionNumber.toLowerCase().includes(q)
        );
    });

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    const columns = [
        {
            header: 'Book Title',
            render: (row) => (
                <button
                    onClick={() => handleViewBook(row.bookId)}
                    className="hover:underline text-left font-medium"
                >
                    {row.bookTitle}
                </button>
            )
        },
        { header: 'Accession No.', key: 'accessionNumber' },
        { header: 'Borrower', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Issued By', key: 'issuedByName' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        {
            header: 'Due Date',
            render: (row) => (
                <span className={
                    row.status !== 'returned' && isOverdue(row.dueDate)
                        ? 'text-danger font-semibold'
                        : 'text-text-primary'
                }>
                    {formatDate(row.dueDate)}
                </span>
            )
        },
        { header: 'Return Date', render: (row) => formatDate(row.returnDate) },
        {
            header: 'Status',
            render: (row) => (
                <Badge text={
                    row.status !== 'returned' && isOverdue(row.dueDate)
                        ? 'overdue'
                        : row.status
                } />
            )
        },
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Circulation Records</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        View all book issue and return records
                    </p>
                </div>

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
                            {tab.key === 'overdue' && overdue.length > 0 && (
                                <span className="ml-2 bg-danger text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {overdue.length}
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
                        placeholder="Search by book, borrower, staff number or accession number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                    />
                </div>

                {/* Table */}
                <Card title={`${tabs.find(t => t.key === activeTab)?.label} Records (${filtered.length})`}>
                    <Table
                        columns={columns}
                        data={filtered}
                        emptyMessage="No circulation records found"
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

export default Circulation;