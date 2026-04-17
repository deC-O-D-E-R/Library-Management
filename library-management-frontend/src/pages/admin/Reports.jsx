import { useState } from 'react';
import { BarChart3, Users, BookOpen, AlertTriangle, PackageSearch } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import {
    getCirculationReport, getUserBorrowingReport, getInventoryReport,
    getHoldingSummary, getOverdueReport, getStockVerificationReport,
    searchUserByStaffNumber
} from '../../api/adminApi';
import { formatDate, formatCurrency } from '../../utils/helpers';

const reportTabs = [
    { key: 'circulation', label: 'Circulation', icon: BarChart3 },
    { key: 'user', label: 'User Borrowing', icon: Users },
    { key: 'inventory', label: 'Inventory', icon: BookOpen },
    { key: 'holding', label: 'Holding Summary', icon: BookOpen },
    { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
    { key: 'stock', label: 'Stock Verification', icon: PackageSearch },
];

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('circulation');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [userIdInput, setUserIdInput] = useState('');
    const [verificationIdInput, setVerificationIdInput] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        setData(null);
        try {
            let res;
            switch (activeTab) {
                case 'circulation': res = await getCirculationReport(statusFilter); break;
                case 'user':
                    const userRes = await searchUserByStaffNumber(userIdInput);
                    res = await getUserBorrowingReport(userRes.data.userId);
                    break;
                case 'inventory': res = await getInventoryReport(); break;
                case 'holding': res = await getHoldingSummary(); break;
                case 'overdue': res = await getOverdueReport(); break;
                case 'stock': res = await getStockVerificationReport(verificationIdInput); break;
                default: break;
            }
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const circulationColumns = [
        { header: 'Book', key: 'bookTitle' },
        { header: 'Borrower', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        { header: 'Due Date', render: (row) => formatDate(row.dueDate) },
        { header: 'Return Date', render: (row) => formatDate(row.returnDate) },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
    ];

    const inventoryColumns = [
        { header: 'Title', key: 'title' },
        { header: 'Author', key: 'author' },
        { header: 'Category', key: 'categoryName' },
        { header: 'Call No.', key: 'callNumber' },
        { header: 'Total', render: (row) => row.totalCopies },
        { header: 'Available', render: (row) => <span className="text-success">{row.availableCopies}</span> },
        { header: 'Issued', render: (row) => <span className="text-warning">{row.issuedCopies}</span> },
        { header: 'Missing', render: (row) => <span className="text-danger">{row.missingDamagedCopies}</span> },
    ];

    const holdingColumns = [
        { header: 'Category', key: 'categoryName' },
        { header: 'Total Books', key: 'totalBooks' },
        { header: 'Total Copies', key: 'totalCopies' },
        { header: 'Available', render: (row) => <span className="text-success">{row.available}</span> },
        { header: 'Issued', render: (row) => <span className="text-warning">{row.issued}</span> },
        { header: 'Missing/Damaged', render: (row) => <span className="text-danger">{row.missingDamaged}</span> },
    ];

    const overdueColumns = [
        { header: 'Book', key: 'bookTitle' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Borrower', key: 'userName' },
        { header: 'Email', key: 'email' },
        { header: 'Due Date', render: (row) => formatDate(row.dueDate) },
        { header: 'Days Overdue', render: (row) => <span className="text-danger font-semibold">{row.daysOverdue}</span> },
        { header: 'Est. Fine', render: (row) => <span className="text-warning">{formatCurrency(row.estimatedFine)}</span> },
    ];

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Reports</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Generate and view library reports
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {reportTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setData(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeTab === tab.key
                                    ? 'bg-accent text-primary'
                                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <div className="flex items-end gap-4 flex-wrap">
                        {activeTab === 'circulation' && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Filter by Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                >
                                    <option value="">All</option>
                                    <option value="issued">Issued</option>
                                    <option value="returned">Returned</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                        )}

                        {activeTab === 'user' && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Staff Number
                                </label>
                                <input
                                    type="text"
                                    value={userIdInput}
                                    onChange={(e) => setUserIdInput(e.target.value)}
                                    placeholder="Enter Staff No."
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                            </div>
                        )}

                        {activeTab === 'stock' && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Verification ID
                                </label>
                                <input
                                    type="number"
                                    value={verificationIdInput}
                                    onChange={(e) => setVerificationIdInput(e.target.value)}
                                    placeholder="Enter verification ID"
                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                />
                            </div>
                        )}

                        <Button onClick={fetchReport} disabled={loading}>
                            {loading ? 'Loading...' : 'Generate Report'}
                        </Button>
                    </div>
                </Card>

                {/* Report Results */}
                {loading && <Loader />}

                {data && !loading && (
                    <Card title={reportTabs.find(t => t.key === activeTab)?.label + ' Report'}>

                        {/* Circulation */}
                        {activeTab === 'circulation' && (
                            <Table columns={circulationColumns} data={data} emptyMessage="No records found" />
                        )}

                        {/* User Borrowing */}
                        {activeTab === 'user' && data && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                    {[
                                        { label: 'Name', value: data.name },
                                        { label: 'Staff No.', value: data.staffNumber },
                                        { label: 'Total Borrowed', value: data.totalBorrowed },
                                        { label: 'Currently Issued', value: data.currentlyIssued },
                                        { label: 'Returned', value: data.returned },
                                        { label: 'Pending Fines', value: data.pendingFines },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-sidebar rounded-lg p-3 text-center">
                                            <p className="text-text-secondary text-xs">{stat.label}</p>
                                            <p className="text-text-primary font-bold mt-1">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <Table columns={circulationColumns} data={data.circulationHistory || []} emptyMessage="No history found" />
                            </div>
                        )}

                        {/* Inventory */}
                        {activeTab === 'inventory' && (
                            <Table columns={inventoryColumns} data={data} emptyMessage="No books found" />
                        )}

                        {/* Holding Summary */}
                        {activeTab === 'holding' && (
                            <Table columns={holdingColumns} data={data} emptyMessage="No data found" />
                        )}

                        {/* Overdue */}
                        {activeTab === 'overdue' && (
                            <Table columns={overdueColumns} data={data} emptyMessage="No overdue books" />
                        )}

                        {/* Stock Verification */}
                        {activeTab === 'stock' && data && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Total Scanned', value: data.totalScanned },
                                        { label: 'Available', value: data.availableCount, color: 'text-success' },
                                        { label: 'Missing', value: data.missingCount, color: 'text-danger' },
                                        { label: 'Damaged', value: data.damagedCount, color: 'text-warning' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-sidebar rounded-lg p-3 text-center">
                                            <p className="text-text-secondary text-xs">{stat.label}</p>
                                            <p className={`font-bold text-xl mt-1 ${stat.color || 'text-text-primary'}`}>
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <Table
                                    columns={[
                                        { header: 'Accession No.', key: 'accessionNumber' },
                                        { header: 'Title', key: 'bookTitle' },
                                        { header: 'Call No.', key: 'callNumber' },
                                        { header: 'Previous Status', render: (row) => <Badge text={row.previousStatus} /> },
                                        { header: 'Marked Status', render: (row) => <Badge text={row.markedStatus} /> },
                                        {
                                            header: 'Changed', render: (row) => row.statusChanged
                                                ? <span className="text-danger text-xs font-semibold">Yes</span>
                                                : <span className="text-success text-xs">No</span>
                                        },
                                    ]}
                                    data={data.details || []}
                                    emptyMessage="No discrepancies found"
                                />
                            </div>
                        )}
                    </Card>
                )}

            </div>
        </Layout>
    );
};

export default AdminReports;