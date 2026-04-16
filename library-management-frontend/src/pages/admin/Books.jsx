import { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Pencil, Search, BookOpen, UploadIcon } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import {
    getAllBooks, addBook, editBook, deleteBook,
    getAllCategories, bulkUploadBooks, addCopy, deleteCopy
} from '../../api/adminApi';
import { formatCurrency } from '../../utils/helpers';

const emptyForm = {
    categoryId: '', title: '', author: '', isbn: '',
    callNumber: '', vendorName: '', invoiceNo: '',
    price: '', receiptDate: '', accessionNumbers: ''
};

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkResult, setBulkResult] = useState(null);
    const [newAccession, setNewAccession] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [booksRes, catsRes] = await Promise.all([getAllBooks(), getAllCategories()]);
            setBooks(booksRes.data);
            setFiltered(booksRes.data);
            setCategories(catsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(books.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            (b.isbn && b.isbn.toLowerCase().includes(q)) ||
            b.callNumber.toLowerCase().includes(q)
        ));
    }, [search, books]);

    const openAdd = () => {
        setEditingBook(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (book) => {
        setEditingBook(book);
        setForm({
            categoryId: book.categoryId,
            title: book.title,
            author: book.author,
            isbn: book.isbn || '',
            callNumber: book.callNumber,
            vendorName: book.vendorName || '',
            invoiceNo: book.invoiceNo || '',
            price: book.price || '',
            receiptDate: book.receiptDate || '',
            accessionNumbers: ''
        });
        setError('');
        setShowModal(true);
    };

    const openDetail = (book) => {
        setSelectedBook(book);
        setNewAccession('');
        setShowDetailModal(true);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.categoryId || !form.title || !form.author || !form.callNumber) {
            setError('Please fill all required fields');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                categoryId: parseInt(form.categoryId),
                price: form.price ? parseFloat(form.price) : null,
                accessionNumbers: editingBook
                    ? []
                    : form.accessionNumbers
                        ? form.accessionNumbers.split(',').map(a => a.trim()).filter(a => a)
                        : []
            };
            if (editingBook) {
                await editBook(editingBook.bookId, payload);
            } else {
                await addBook(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            await deleteBook(bookId);
            fetchData();
        } catch (err) {
            alert(err.response?.data || 'Cannot delete book');
        }
    };

    const handleAddCopy = async () => {
        if (!newAccession.trim()) return;
        try {
            await addCopy(selectedBook.bookId, newAccession.trim());
            setNewAccession('');
            const res = await getAllBooks();
            const updated = res.data.find(b => b.bookId === selectedBook.bookId);
            setSelectedBook(updated);
            setBooks(res.data);
            setFiltered(res.data);
        } catch (err) {
            alert(err.response?.data || 'Cannot add copy');
        }
    };

    const handleDeleteCopy = async (copyId) => {
        if (!window.confirm('Delete this copy?')) return;
        try {
            await deleteCopy(copyId);
            const res = await getAllBooks();
            const updated = res.data.find(b => b.bookId === selectedBook.bookId);
            setSelectedBook(updated);
            setBooks(res.data);
            setFiltered(res.data);
        } catch (err) {
            alert(err.response?.data || 'Cannot delete copy');
        }
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return;
        setSaving(true);
        try {
            const res = await bulkUploadBooks(bulkFile);
            setBulkResult(res.data);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            header: 'Title',
            render: (row) => (
                <button
                    onClick={() => openDetail(row)}
                    className="text-accent hover:underline text-left font-medium"
                >
                    {row.title}
                </button>
            )
        },
        { header: 'Author', key: 'author' },
        { header: 'ISBN', render: (row) => row.isbn || '—' },
        { header: 'Call No.', key: 'callNumber' },
        { header: 'Category', key: 'categoryName' },
        { header: 'Price', render: (row) => formatCurrency(row.price) },
        {
            header: 'Copies',
            render: (row) => (
                <div className="flex gap-1.5 text-xs">
                    <span className="text-success">{row.availableCopies} avail</span>
                    <span className="text-text-secondary">/</span>
                    <span className="text-text-secondary">{row.totalCopies} total</span>
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => openEdit(row)} className="text-text-secondary hover:text-accent transition-colors">
                        <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(row.bookId)} className="text-text-secondary hover:text-danger transition-colors">
                        <Trash2 size={15} />
                    </button>
                </div>
            )
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">Books</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            Manage books and their copies
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setBulkResult(null); setShowBulkModal(true); }}>
                            <Upload size={15} /> Bulk Upload
                        </Button>
                        <Button onClick={openAdd}>
                            <Plus size={15} /> Add Book
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by title, author, ISBN or call number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                    />
                </div>

                {/* Table */}
                <Card>
                    <Table columns={columns} data={filtered} emptyMessage="No books found" />
                </Card>

            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingBook ? 'Edit Book' : 'Add New Book'}
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Category <span className="text-danger">*</span>
                        </label>
                        <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                        >
                            <option value="">Select category</option>
                            {categories.map(c => (
                                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Call Number" name="callNumber" value={form.callNumber} onChange={handleChange} required />
                    <Input label="Title" name="title" value={form.title} onChange={handleChange} required className="col-span-2" />
                    <Input label="Author" name="author" value={form.author} onChange={handleChange} required className="col-span-2" />
                    <Input label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} />
                    <Input label="Price" name="price" type="number" value={form.price} onChange={handleChange} />
                    <Input label="Vendor Name" name="vendorName" value={form.vendorName} onChange={handleChange} />
                    <Input label="Invoice No." name="invoiceNo" value={form.invoiceNo} onChange={handleChange} />
                    <Input label="Receipt Date" name="receiptDate" type="date" value={form.receiptDate} onChange={handleChange} />
                    {!editingBook && (
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                Accession Numbers
                            </label>
                            <input
                                name="accessionNumbers"
                                value={form.accessionNumbers}
                                onChange={handleChange}
                                placeholder="e.g. ACC-001, ACC-002, ACC-003"
                                className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                            />
                            <p className="text-text-secondary text-xs">Separate multiple accession numbers with commas</p>
                        </div>
                    )}
                </div>

                {error && <p className="text-danger text-sm mt-3">{error}</p>}

                <div className="flex justify-end gap-3 mt-5">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Book'}
                    </Button>
                </div>
            </Modal>

            {/* Book Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
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
                            <div className="bg-sidebar rounded-lg px-4 py-3 flex-1 text-center">
                                <p className="text-danger text-xs">Missing</p>
                                <p className="text-danger text-xl font-bold">{selectedBook.missingDamagedCopies}</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-text-primary font-semibold text-sm">Copies</p>
                            </div>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="New accession number"
                                    value={newAccession}
                                    onChange={(e) => setNewAccession(e.target.value)}
                                    className="flex-1 bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                                <Button onClick={handleAddCopy} size="sm">
                                    <Plus size={14} /> Add Copy
                                </Button>
                            </div>
                            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                {selectedBook.copies?.map((copy) => (
                                    <div key={copy.copyId} className="flex items-center justify-between bg-sidebar px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={14} className="text-text-secondary" />
                                            <span className="text-text-primary text-sm">{copy.accessionNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge text={copy.status} />
                                            {copy.status === 'available' && (
                                                <button
                                                    onClick={() => handleDeleteCopy(copy.copyId)}
                                                    className="text-text-secondary hover:text-danger transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                title="Bulk Upload Books"
            >
                {!bulkResult ? (
                    <div className="flex flex-col gap-4">
                        <p className="text-text-secondary text-sm">
                            Upload a CSV or Excel file with columns: categoryId, title, author, isbn,
                            callNumber, vendorName, invoiceNo, price, receiptDate, accessionNumbers
                        </p>

                        <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                            ${bulkFile
                            ? 'border-success bg-background-success text-success'
                            : 'border-border-secondary text-text-secondary hover:border-border-primary hover:bg-background-secondary'}`}>
                            <UploadIcon className="w-4 h-4" />
                            <span>{bulkFile ? bulkFile.name : 'Choose file'}</span>
                            <input type="file" accept=".csv,.xlsx" className="hidden"
                            onChange={(e) => setBulkFile(e.target.files[0])} />
                        </label>

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>Cancel</Button>
                            <Button onClick={handleBulkUpload} disabled={!bulkFile || saving}>
                            {saving ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-sidebar rounded-lg p-3 text-center">
                                <p className="text-text-secondary text-xs">Total</p>
                                <p className="text-text-primary text-xl font-bold">{bulkResult.totalRows}</p>
                            </div>
                            <div className="bg-sidebar rounded-lg p-3 text-center">
                                <p className="text-success text-xs">Success</p>
                                <p className="text-success text-xl font-bold">{bulkResult.successRows}</p>
                            </div>
                            <div className="bg-sidebar rounded-lg p-3 text-center">
                                <p className="text-danger text-xs">Failed</p>
                                <p className="text-danger text-xl font-bold">{bulkResult.failedRows}</p>
                            </div>
                        </div>
                        {bulkResult.errors?.length > 0 && (
                            <div className="bg-sidebar rounded-lg p-3 max-h-40 overflow-y-auto">
                                {bulkResult.errors.map((e, i) => (
                                    <p key={i} className="text-danger text-xs py-1 border-b border-border">
                                        Row {e.row} — {e.staffNumber}: {e.reason}
                                    </p>
                                ))}
                            </div>
                        )}
                        <Button onClick={() => setShowBulkModal(false)}>Done</Button>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default AdminBooks;