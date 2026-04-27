import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { searchBooks, getBookById, reserveBook } from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Button from '../../components/ui/Button';

const SearchBooksLibrarian = () => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('title');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reserving, setReserving] = useState(false);
    const [reserveMessage, setReserveMessage] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 10;

    const handleSearch = async () => {
        if (!query.trim() && searchType !== 'all') return;
        setLoading(true);
        setSearched(true);
        setCurrentPage(1);
        setSelectedMonth('');
        try {
            const params = searchType === 'all' && !query.trim()
                ? {}
                : searchType === 'all'
                    ? { title: query.trim(), author: query.trim(), isbn: query.trim(), callNumber: query.trim() }
                    : { [searchType]: query.trim() };
            const res = await searchBooks(params);
            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (bookId) => {
        try {
            const res = await getBookById(bookId);
            setSelectedBook(res.data);
            setShowModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReserve = async (bookId) => {
        setReserving(true);
        setReserveMessage('');
        try {
            await reserveBook(bookId);
            setReserveMessage('Book reserved successfully! You will be notified when it becomes available.');
        } catch (err) {
            setReserveMessage(err.response?.data || 'Failed to reserve book');
        } finally {
            setReserving(false);
        }
    };

    const columns = [
        {
            header: 'Title',
            render: (row) => (
                <button
                    onClick={() => handleViewDetail(row.bookId)}
                    className="text-accent hover:underline text-left font-medium"
                >
                    {row.title}
                </button>
            )
        },
        { header: 'Author', key: 'author' },
        { header: 'Category', key: 'categoryName' },
        { header: 'Call No.', key: 'callNumber' },
        { header: 'ISBN', render: (row) => row.isbn || '—' },
        {
            header: 'Availability',
            render: (row) => (
                <div className="flex gap-2 text-xs">
                    <span className="text-success font-semibold">{row.availableCopies} available</span>
                    <span className="text-text-secondary">/ {row.totalCopies} total</span>
                </div>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <Badge text={row.availableCopies > 0 ? 'available' : 'issued'} />
            )
        }
    ];

    const applyReceiptDateFilter = (rows) => {
        if (!selectedMonth || !rows) return rows;
        const parts = selectedMonth.split('-');
        const year = Number(parts[0]);
        const month = parts[1] ? Number(parts[1]) : null;
        return rows.filter(r => {
            if (!r.receiptDate) return false;
            const d = new Date(r.receiptDate);
            if (month) return d.getFullYear() === year && (d.getMonth() + 1) === month;
            return d.getFullYear() === year;
        });
    };

    const totalPages = Math.ceil(applyReceiptDateFilter(results).length / ROWS_PER_PAGE);
    const paginatedResults = applyReceiptDateFilter(results).slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Search Books</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Search the library catalogue by title, author, ISBN or call number
                    </p>
                </div>

                {/* Search Bar */}
                <Card>
                    <div className="flex flex-col gap-3">
                        {/* Search Row */}
                        <div className="flex gap-3">
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                            >
                                <option value="all">All</option>
                                <option value="title">Title</option>
                                <option value="author">Author</option>
                                <option value="isbn">ISBN</option>
                                <option value="callNumber">Call Number</option>
                            </select>
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Enter search query and press Enter..."
                                    className="w-full bg-sidebar border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="bg-accent text-primary font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-60"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Receipt Date Filter Row */}
                        <div className="flex items-center gap-3">
                            <span className="text-text-secondary text-sm">Receipt Date</span>
                            <select
                                value={selectedMonth ? selectedMonth.split('-')[1] : ''}
                                onChange={(e) => {
                                    const year = selectedMonth?.split('-')[0] || new Date().getFullYear();
                                    setSelectedMonth(e.target.value ? `${year}-${e.target.value}` : '');
                                    setCurrentPage(1);
                                }}
                                className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
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
                                className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                            >
                                <option value="">All Years</option>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Results */}
                {loading && <Loader />}

                {!loading && searched && (
                    <Card title={`Results (${applyReceiptDateFilter(results).length})`}>
                        <Table
                            columns={columns}
                            data={paginatedResults}
                            emptyMessage="No books found matching your search"
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                <p className="text-text-secondary text-xs">
                                    Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, results.length)} of {results.length}
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
                                            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                                                addPage(i);
                                            }
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
                )}

                {!searched && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <BookOpen size={48} className="text-border" />
                        <p className="text-text-secondary text-sm">
                            Search by title, author, ISBN or call number to find books
                        </p>
                    </div>
                )}

            </div>

            {/* Book Detail Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
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
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Category</p>
                                <p className="text-text-primary mt-1">{selectedBook.categoryName}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Call Number</p>
                                <p className="text-text-primary mt-1">{selectedBook.callNumber}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">ISBN</p>
                                <p className="text-text-primary mt-1">{selectedBook.isbn || '—'}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Price</p>
                                <p className="text-text-primary mt-1">{formatCurrency(selectedBook.price)}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Vendor</p>
                                <p className="text-text-primary mt-1">{selectedBook.vendorName || '—'}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary text-xs uppercase tracking-wider">Receipt Date</p>
                                <p className="text-text-primary mt-1">{formatDate(selectedBook.receiptDate)}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="bg-sidebar rounded-lg px-4 py-3 flex-1 text-center">
                                <p className="text-text-secondary text-xs">Total Copies</p>
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

                        {selectedBook?.availableCopies === 0 && (
                            <div className="flex flex-col gap-3 mt-2">
                                {reserveMessage && (
                                    <div className={`rounded-lg px-4 py-3 text-sm ${reserveMessage.includes('successfully')
                                        ? 'bg-green-900 bg-opacity-30 border border-success text-success'
                                        : 'bg-red-900 bg-opacity-30 border border-danger text-danger'
                                        }`}>
                                        {reserveMessage}
                                    </div>
                                )}
                                <Button
                                    onClick={() => handleReserve(selectedBook.bookId)}
                                    disabled={reserving}
                                    variant="secondary"
                                >
                                    {reserving ? 'Reserving...' : 'Reserve This Book'}
                                </Button>
                            </div>
                        )}

                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default SearchBooksLibrarian;