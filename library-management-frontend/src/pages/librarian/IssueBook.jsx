import { useState, useEffect } from 'react';
import { BookCheck, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { issueBook } from '../../api/userApi';
import { getAllUsers, getAllBooks } from '../../api/userApi';
import { formatDate } from '../../utils/helpers';

const IssueBook = () => {
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');

    const [userSearch, setUserSearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCopy, setSelectedCopy] = useState(null);

    const [form, setForm] = useState({
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, booksRes] = await Promise.all([
                    getAllUsers(),
                    getAllBooks()
                ]);
                setUsers(usersRes.data);
                setBooks(booksRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = users.filter(u =>
        u.isActive && (
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.staffNumber.toLowerCase().includes(userSearch.toLowerCase())
        )
    );

    const filteredBooks = books.filter(b =>
        b.availableCopies > 0 && (
            b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
            b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
            b.callNumber.toLowerCase().includes(bookSearch.toLowerCase())
        )
    );

    const handleSubmit = async () => {
        if (!selectedUser || !selectedCopy) {
            setError('Please select a user and a book copy');
            return;
        }
        if (!form.issueDate) {
            setError('Please select an issue date');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess(null);

        try {
            const res = await issueBook({
                userId: selectedUser.userId,
                copyId: selectedCopy.copyId,
                issueDate: form.issueDate,
                dueDate: form.dueDate || null
            });
            setSuccess(res.data);
            setSelectedUser(null);
            setSelectedCopy(null);
            setUserSearch('');
            setBookSearch('');
            setForm({ issueDate: new Date().toISOString().split('T')[0], dueDate: '' });

            const booksRes = await getAllBooks();
            setBooks(booksRes.data);
        } catch (err) {
            setError(err.response?.data || 'Failed to issue book');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Issue Book</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Assign a book to a library member
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Select User */}
                    <Card title="Select User">
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text"
                                    placeholder="Search by name or staff number..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="w-full bg-sidebar border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                            </div>

                            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                                {filteredUsers.slice(0, 10).map((user) => (
                                    <button
                                        key={user.userId}
                                        onClick={() => setSelectedUser(user)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors
                                            ${selectedUser?.userId === user.userId
                                                ? 'bg-accent text-primary'
                                                : 'hover:bg-sidebar text-text-primary'
                                            }`}
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className={`text-xs ${selectedUser?.userId === user.userId ? 'text-primary opacity-70' : 'text-text-secondary'}`}>
                                                {user.staffNumber}
                                            </p>
                                        </div>
                                        {user.roles?.map((r, i) => (
                                            <Badge key={i} text={r} type="role" />
                                        ))}
                                    </button>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="text-text-secondary text-sm text-center py-4">No users found</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Select Book */}
                    <Card title="Select Book">
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text"
                                    placeholder="Search by title, author or call number..."
                                    value={bookSearch}
                                    onChange={(e) => setBookSearch(e.target.value)}
                                    className="w-full bg-sidebar border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                            </div>

                            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                                {filteredBooks.slice(0, 10).map((book) => (
                                    <div key={book.bookId} className="flex flex-col gap-1">
                                        <p className="text-text-primary text-sm font-medium px-1">{book.title}</p>
                                        <div className="flex flex-col gap-1 pl-2">
                                            {book.copies?.filter(c => c.status === 'available').map((copy) => (
                                                <button
                                                    key={copy.copyId}
                                                    onClick={() => setSelectedCopy({ ...copy, bookTitle: book.title })}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors
                                                        ${selectedCopy?.copyId === copy.copyId
                                                            ? 'bg-accent text-primary'
                                                            : 'hover:bg-sidebar'
                                                        }`}
                                                >
                                                    <span className={`text-xs font-medium ${selectedCopy?.copyId === copy.copyId ? 'text-primary' : 'text-text-secondary'}`}>
                                                        {copy.accessionNumber}
                                                    </span>
                                                    <Badge text={copy.status} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {filteredBooks.length === 0 && (
                                    <p className="text-text-secondary text-sm text-center py-4">No available books found</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Issue Details */}
                <Card title="Issue Details">
                    <div className="flex flex-col gap-5">

                        {/* Selected Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-sidebar rounded-lg px-4 py-3">
                                <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Selected User</p>
                                {selectedUser
                                    ? <p className="text-text-primary font-semibold">{selectedUser.name} — {selectedUser.staffNumber}</p>
                                    : <p className="text-text-secondary text-sm">None selected</p>
                                }
                            </div>
                            <div className="bg-sidebar rounded-lg px-4 py-3">
                                <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Selected Copy</p>
                                {selectedCopy
                                    ? <p className="text-text-primary font-semibold">{selectedCopy.bookTitle} — {selectedCopy.accessionNumber}</p>
                                    : <p className="text-text-secondary text-sm">None selected</p>
                                }
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Issue Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.issueDate}
                                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Due Date (optional — defaults to config)
                                </label>
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900 bg-opacity-30 border border-danger rounded-lg px-4 py-3">
                                <p className="text-danger text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-900 bg-opacity-30 border border-success rounded-lg px-4 py-3">
                                <p className="text-success text-sm font-semibold">
                                    Book issued successfully!
                                </p>
                                <p className="text-success text-xs mt-1">
                                    {success.bookTitle} → {success.userName} | Due: {formatDate(success.dueDate)}
                                </p>
                            </div>
                        )}

                        <Button onClick={handleSubmit} disabled={submitting}>
                            <BookCheck size={16} />
                            {submitting ? 'Issuing...' : 'Issue Book'}
                        </Button>
                    </div>
                </Card>

            </div>
        </Layout>
    );
};

export default IssueBook;