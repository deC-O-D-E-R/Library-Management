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
    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 10;
    const [selectedMonth, setSelectedMonth] = useState('');

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

    const applyDateFilter = (rows) => {
        if (!selectedMonth || !rows) return rows;
        const parts = selectedMonth.split('-');
        const year = Number(parts[0]);
        const month = parts[1] ? Number(parts[1]) : null;
        return rows.filter(c => {
            const dateToUse = c.returnDate ? new Date(c.returnDate) : new Date(c.issueDate);
            if (month) return dateToUse.getFullYear() === year && (dateToUse.getMonth() + 1) === month;
            return dateToUse.getFullYear() === year;
        });
    };

    const filtered = applyDateFilter(getTabData()).filter(c => {
        const q = search.toLowerCase();
        return (
            c.bookTitle.toLowerCase().includes(q) ||
            c.userName.toLowerCase().includes(q) ||
            c.staffNumber.toLowerCase().includes(q) ||
            c.accessionNumber.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
    const paginatedResults = filtered.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

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
                            onClick={() => { setActiveTab(tab.key); setSearch(''); setCurrentPage(1); }}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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

                {/* Date Filter */}
                <div className="flex gap-2">
                    <select
                        value={selectedMonth ? selectedMonth.split('-')[1] : ''}
                        onChange={(e) => {
                            const year = selectedMonth?.split('-')[0] || new Date().getFullYear();
                            setSelectedMonth(e.target.value ? `${year}-${e.target.value}` : '');
                            setCurrentPage(1);
                        }}
                        className="bg-surface border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm"
                    >
                        <option value="">All Months</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                            .map((m, i) => (
                                <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
                            ))}
                    </select>
                    <select
                        value={selectedMonth ? selectedMonth.split('-')[0] : ''}
                        onChange={(e) => {
                            const month = selectedMonth?.split('-')[1] || '';
                            setSelectedMonth(e.target.value ? (month ? `${e.target.value}-${month}` : `${e.target.value}`) : '');
                            setCurrentPage(1);
                        }}
                        className="bg-surface border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm"
                    >
                        <option value="">All Years</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
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
                        data={paginatedResults}
                        emptyMessage="No circulation records found"
                    />

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <p className="text-text-secondary text-xs">
                                Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs rounded-lg border border-border text-text-primary hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>

                                {(() => {
                                    const pages = [];
                                    const addPage = (page) => pages.push(
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${page === currentPage
                                                    ? 'bg-accent text-primary border-accent font-semibold'
                                                    : 'border-border text-text-primary hover:border-accent'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                    const addDots = (key) => pages.push(
                                        <span key={key} className="px-2 py-1.5 text-xs text-text-secondary">...</span>
                                    );
                                    if (totalPages <= 5) {
                                        for (let i = 1; i <= totalPages; i++) addPage(i);
                                    } else {
                                        addPage(1);
                                        if (currentPage > 3) addDots('dots-start');
                                        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) addPage(i);
                                        if (currentPage < totalPages - 2) addDots('dots-end');
                                        addPage(totalPages);
                                    }
                                    return pages;
                                })()}

                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-xs rounded-lg border border-border text-text-primary hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Receipt Date</p>
                                <p className="text-text-primary mt-1">
                                    {selectedBook.receiptDate ? new Date(selectedBook.receiptDate).toLocaleDateString() : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Total Copies</p>
                                <p className="text-text-primary mt-1">{selectedBook.totalCopies}</p>
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