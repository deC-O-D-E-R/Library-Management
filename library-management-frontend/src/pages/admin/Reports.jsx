import { useState } from 'react';
import { BarChart3, Users, BookOpen, AlertTriangle, PackageSearch } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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

// tabs where date filter is not applicable
const NO_DATE_FILTER = ['inventory', 'holding', 'stock'];

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('circulation');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [userIdInput, setUserIdInput] = useState('');
    const [verificationIdInput, setVerificationIdInput] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

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

    // ─── Date Filter ──────────────────────────────────────────────────────
    const applyDateFilter = (rows, dateKey) => {
        if (!selectedMonth || !rows) return rows;
        const [year, month] = selectedMonth.split('-').map(Number);
        return rows.filter(r => {
            if (!r[dateKey]) return false;
            const d = new Date(r[dateKey]);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
        });
    };

    const getFilteredData = () => {
        if (!data) return data;
        switch (activeTab) {
            case 'circulation': return applyDateFilter(data, 'issueDate');
            case 'overdue': return applyDateFilter(data, 'dueDate');
            case 'user': return {
                ...data,
                circulationHistory: applyDateFilter(data.circulationHistory || [], 'issueDate'),
            };
            default: return data; // inventory, holding, stock — no date filter
        }
    };

    const filteredData = getFilteredData();

    // ─── Shared ───────────────────────────────────────────────────────────
    const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—';

    const monthLabel = selectedMonth
        ? new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
        : 'All Time';

    // ─── PDF Download ─────────────────────────────────────────────────────
    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const title = reportTabs.find(t => t.key === activeTab)?.label + ' Report';
        const generated = `Generated: ${new Date().toLocaleString()} | Period: ${monthLabel}`;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Library Report — ' + title, 14, 18);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120);
        doc.text(generated, 14, 25);
        doc.setTextColor(0);

        let startY = 32;

        const addMeta = (pairs) => {
            pairs.forEach(([label, value], i) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(String(value), 14 + i * 32, startY + 5);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(120);
                doc.text(label, 14 + i * 32, startY + 9);
                doc.setTextColor(0);
            });
            startY += 16;
        };

        const tableStyle = {
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 40, 40] },
        };

        const d = filteredData;

        const configs = {
            circulation: {
                subtitle: `Status: ${statusFilter || 'All'} | Period: ${monthLabel} | Records: ${d.length}`,
                head: [['Book', 'Borrower', 'Staff No.', 'Issue Date', 'Due Date', 'Return Date', 'Status']],
                body: d.map(r => [r.bookTitle, r.userName, r.staffNumber, fmt(r.issueDate), fmt(r.dueDate), fmt(r.returnDate), r.status]),
            },
            inventory: {
                subtitle: `Total Books: ${d.length}`,
                head: [['Title', 'Author', 'Category', 'Call No.', 'Total', 'Available', 'Issued', 'Missing']],
                body: d.map(r => [r.title, r.author, r.categoryName, r.callNumber, r.totalCopies, r.availableCopies, r.issuedCopies, r.missingDamagedCopies]),
            },
            holding: {
                subtitle: `Categories: ${d.length}`,
                head: [['Category', 'Total Books', 'Total Copies', 'Available', 'Issued', 'Missing/Damaged']],
                body: d.map(r => [r.categoryName, r.totalBooks, r.totalCopies, r.available, r.issued, r.missingDamaged]),
            },
            overdue: {
                subtitle: `Period: ${monthLabel} | Total Overdue: ${d.length}`,
                head: [['Book', 'Staff No.', 'Borrower', 'Email', 'Due Date', 'Days Overdue', 'Est. Fine']],
                body: d.map(r => [r.bookTitle, r.staffNumber, r.userName, r.email, fmt(r.dueDate), r.daysOverdue, `₹${parseFloat(r.estimatedFine).toFixed(2)}`]),
            },
        };

        if (activeTab === 'user') {
            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text(`${d.name} | ${d.staffNumber} | Period: ${monthLabel}`, 14, startY);
            doc.setTextColor(0);
            startY += 6;
            addMeta([
                ['Name', d.name], ['Staff No.', d.staffNumber],
                ['Total Borrowed', d.totalBorrowed], ['Currently Issued', d.currentlyIssued],
                ['Returned', d.returned], ['Pending Fines', d.pendingFines],
            ]);
            autoTable(doc, {
                startY,
                head: [['Book', 'Borrower', 'Staff No.', 'Issue Date', 'Due Date', 'Return Date', 'Status']],
                body: (d.circulationHistory || []).map(r => [r.bookTitle, r.userName, r.staffNumber, fmt(r.issueDate), fmt(r.dueDate), fmt(r.returnDate), r.status]),
                ...tableStyle,
            });
        } else if (activeTab === 'stock') {
            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text(`Verification ID: ${verificationIdInput}`, 14, startY);
            doc.setTextColor(0);
            startY += 6;
            addMeta([
                ['Total Scanned', d.totalScanned], ['Available', d.availableCount],
                ['Missing', d.missingCount], ['Damaged', d.damagedCount],
            ]);
            autoTable(doc, {
                startY,
                head: [['Accession No.', 'Title', 'Call No.', 'Previous Status', 'Marked Status', 'Changed']],
                body: (d.details || []).map(r => [r.accessionNumber, r.bookTitle, r.callNumber, r.previousStatus, r.markedStatus, r.statusChanged ? 'Yes' : 'No']),
                ...tableStyle,
            });
        } else {
            const cfg = configs[activeTab];
            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text(cfg.subtitle, 14, startY);
            doc.setTextColor(0);
            startY += 6;
            autoTable(doc, { startY, head: cfg.head, body: cfg.body, ...tableStyle });
        }

        doc.save(`${title.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.pdf`);
    };

    // ─── Excel Download ───────────────────────────────────────────────────
    const handleDownloadExcel = () => {
        const title = reportTabs.find(t => t.key === activeTab)?.label;
        const d = filteredData;

        const builders = {
            circulation: () => d.map(r => ({
                'Book': r.bookTitle, 'Borrower': r.userName, 'Staff No.': r.staffNumber,
                'Issue Date': fmt(r.issueDate), 'Due Date': fmt(r.dueDate),
                'Return Date': fmt(r.returnDate), 'Status': r.status,
            })),
            user: () => (d.circulationHistory || []).map(r => ({
                'Book': r.bookTitle, 'Borrower': r.userName, 'Staff No.': r.staffNumber,
                'Issue Date': fmt(r.issueDate), 'Due Date': fmt(r.dueDate),
                'Return Date': fmt(r.returnDate), 'Status': r.status,
            })),
            inventory: () => d.map(r => ({
                'Title': r.title, 'Author': r.author, 'Category': r.categoryName,
                'Call No.': r.callNumber, 'Total': r.totalCopies,
                'Available': r.availableCopies, 'Issued': r.issuedCopies,
                'Missing/Damaged': r.missingDamagedCopies,
            })),
            holding: () => d.map(r => ({
                'Category': r.categoryName, 'Total Books': r.totalBooks,
                'Total Copies': r.totalCopies, 'Available': r.available,
                'Issued': r.issued, 'Missing/Damaged': r.missingDamaged,
            })),
            overdue: () => d.map(r => ({
                'Book': r.bookTitle, 'Staff No.': r.staffNumber, 'Borrower': r.userName,
                'Email': r.email, 'Due Date': fmt(r.dueDate),
                'Days Overdue': r.daysOverdue, 'Est. Fine': r.estimatedFine,
            })),
            stock: () => (d.details || []).map(r => ({
                'Accession No.': r.accessionNumber, 'Title': r.bookTitle,
                'Call No.': r.callNumber, 'Previous Status': r.previousStatus,
                'Marked Status': r.markedStatus, 'Changed': r.statusChanged ? 'Yes' : 'No',
            })),
        };

        const rows = builders[activeTab]?.();
        if (!rows) return;

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title);
        XLSX.writeFile(wb, `${title?.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.xlsx`);
    };

    // ─── Table Columns ────────────────────────────────────────────────────
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

                        {/* Month Filter — shown for all tabs except inventory, holding, stock */}
                        {!NO_DATE_FILTER.includes(activeTab) && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Month & Year
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedMonth ? selectedMonth.split('-')[1] : ''}
                                        onChange={(e) => {
                                            const year = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear();
                                            setSelectedMonth(e.target.value ? `${year}-${e.target.value}` : '');
                                            setData(null);
                                        }}
                                        className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                    >
                                        <option value="">All Months</option>
                                        {['January', 'February', 'March', 'April', 'May', 'June',
                                            'July', 'August', 'September', 'October', 'November', 'December']
                                            .map((m, i) => (
                                                <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
                                            ))}
                                    </select>
                                    <select
                                        value={selectedMonth ? selectedMonth.split('-')[0] : ''}
                                        onChange={(e) => {
                                            const month = selectedMonth ? selectedMonth.split('-')[1] : '01';
                                            setSelectedMonth(e.target.value ? `${e.target.value}-${month}` : '');
                                            setData(null);
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
                        )}

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

                {filteredData && !loading && (
                    <Card title={`${reportTabs.find(t => t.key === activeTab)?.label} Report — ${monthLabel}`}>

                        {/* Download Buttons */}
                        <div className="flex gap-2 mb-4">
                            <Button size="sm" onClick={handleDownloadPDF}>
                                Download PDF
                            </Button>
                            <Button size="sm" variant="secondary" onClick={handleDownloadExcel}>
                                Download Excel
                            </Button>
                        </div>

                        {/* Circulation */}
                        {activeTab === 'circulation' && (
                            <Table columns={circulationColumns} data={filteredData} emptyMessage="No records found" />
                        )}

                        {/* User Borrowing */}
                        {activeTab === 'user' && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                    {[
                                        { label: 'Name', value: filteredData.name },
                                        { label: 'Staff No.', value: filteredData.staffNumber },
                                        { label: 'Total Borrowed', value: filteredData.totalBorrowed },
                                        { label: 'Currently Issued', value: filteredData.currentlyIssued },
                                        { label: 'Returned', value: filteredData.returned },
                                        { label: 'Pending Fines', value: filteredData.pendingFines },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-sidebar rounded-lg p-3 text-center">
                                            <p className="text-text-secondary text-xs">{stat.label}</p>
                                            <p className="text-text-primary font-bold mt-1">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <Table columns={circulationColumns} data={filteredData.circulationHistory || []} emptyMessage="No history found" />
                            </div>
                        )}

                        {/* Inventory */}
                        {activeTab === 'inventory' && (
                            <Table columns={inventoryColumns} data={filteredData} emptyMessage="No books found" />
                        )}

                        {/* Holding Summary */}
                        {activeTab === 'holding' && (
                            <Table columns={holdingColumns} data={filteredData} emptyMessage="No data found" />
                        )}

                        {/* Overdue */}
                        {activeTab === 'overdue' && (
                            <Table columns={overdueColumns} data={filteredData} emptyMessage="No overdue books" />
                        )}

                        {/* Stock Verification */}
                        {activeTab === 'stock' && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Total Scanned', value: filteredData.totalScanned },
                                        { label: 'Available', value: filteredData.availableCount, color: 'text-success' },
                                        { label: 'Missing', value: filteredData.missingCount, color: 'text-danger' },
                                        { label: 'Damaged', value: filteredData.damagedCount, color: 'text-warning' },
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
                                    data={filteredData.details || []}
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