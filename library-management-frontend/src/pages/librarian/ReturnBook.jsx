import { useState, useEffect } from 'react';
import { RotateCcw, Search, BookOpen } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { getIssuedCirculations, returnBook, getLibrarianBookById } from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ReturnBook = () => {
    const [circulations, setCirculations] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returning, setReturning] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [showBookModal, setShowBookModal] = useState(false);

    const fetchIssued = async () => {
        try {
            const res = await getIssuedCirculations();
            setCirculations(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIssued(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(circulations.filter(c =>
            c.bookTitle.toLowerCase().includes(q) ||
            c.userName.toLowerCase().includes(q) ||
            c.staffNumber.toLowerCase().includes(q) ||
            c.accessionNumber.toLowerCase().includes(q)
        ));
    }, [search, circulations]);

    const handleViewBook = async (bookId) => {
        try {
            const res = await getLibrarianBookById(bookId);
            setSelectedBook(res.data);
            setShowBookModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReturn = async (circulationId) => {
        setReturning(circulationId);
        setError('');
        setSuccess(null);
        try {
            const res = await returnBook(circulationId);
            setSuccess(res.data);
            fetchIssued();
        } catch (err) {
            setError(err.response?.data || 'Failed to return book');
        } finally {
            setReturning(null);
        }
    };

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
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        {
            header: 'Due Date',
            render: (row) => (
                <span className={isOverdue(row.dueDate) ? 'text-danger font-semibold' : 'text-text-primary'}>
                    {formatDate(row.dueDate)}
                </span>
            )
        },
        { header: 'Status', render: (row) => <Badge text={isOverdue(row.dueDate) ? 'overdue' : row.status} /> },
        {
            header: 'Action',
            render: (row) => (
                <Button
                    size="sm"
                    onClick={() => handleReturn(row.circulationId)}
                    disabled={returning === row.circulationId}
                >
                    <RotateCcw size={13} />
                    {returning === row.circulationId ? 'Returning...' : 'Return'}
                </Button>
            )
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Return Book</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Process book returns and calculate fines
                    </p>
                </div>

                {/* Success */}
                {success && (
                    <div className="bg-green-900 bg-opacity-30 border border-success rounded-xl px-5 py-4">
                        <p className="text-success font-semibold text-sm">Book returned successfully!</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                            <div>
                                <p className="text-text-secondary text-xs">Book</p>
                                <p className="text-text-primary text-sm font-medium mt-0.5">{success.bookTitle}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs">Borrower</p>
                                <p className="text-text-primary text-sm font-medium mt-0.5">{success.userName}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs">Return Date</p>
                                <p className="text-text-primary text-sm font-medium mt-0.5">{formatDate(success.returnDate)}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs">Status</p>
                                <Badge text={success.status} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-900 bg-opacity-30 border border-danger rounded-lg px-4 py-3">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by book title, borrower, staff number or accession number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                    />
                </div>

                {/* Table */}
                <Card title={`Currently Issued (${filtered.length})`}>
                    <Table
                        columns={columns}
                        data={filtered}
                        emptyMessage="No books currently issued"
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

export default ReturnBook;