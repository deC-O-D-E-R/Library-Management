import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getAllFines, getPendingFines, markFineAsPaid, markFineAsWaived, isFineSystemEnabled } from '../../api/userApi';
import { formatDate, formatCurrency } from '../../utils/helpers';

const tabs = [
    { key: 'all', label: 'All Fines' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'waived', label: 'Waived' },
];

const Fines = () => {
    const [all, setAll] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(null);
    const [error, setError] = useState('');

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState('month');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [empSearch, setEmpSearch] = useState('');
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [fineSystemEnabled, setFineSystemEnabled] = useState(true);

    const fetchData = async () => {
        try {
            const [allRes, pendingRes, fineConfigRes] = await Promise.all([
                getAllFines(),
                getPendingFines(),
                isFineSystemEnabled(),
            ]);
            setAll(allRes.data);
            setPending(pendingRes.data);
            setFineSystemEnabled(fineConfigRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getTabData = () => {
        switch (activeTab) {
            case 'pending': return pending;
            case 'paid': return all.filter(f => f.status === 'paid');
            case 'waived': return all.filter(f => f.status === 'waived');
            default: return all;
        }
    };

    const applyDateFilter = (rows) => {
        if (!selectedMonth || !rows) return rows;

        const parts = selectedMonth.split('-');
        const year = Number(parts[0]);
        const month = parts[1] ? Number(parts[1]) : null;

        return rows.filter(f => {
            const dateToUse = f.returnDate ? new Date(f.returnDate) : new Date(f.issueDate);

            if (month) {
                return dateToUse.getFullYear() === year && (dateToUse.getMonth() + 1) === month;
            }
            return dateToUse.getFullYear() === year;
        });
    };

    const filtered = applyDateFilter(getTabData()).filter(f => {
        const q = search.toLowerCase();
        return (
            f.userName.toLowerCase().includes(q) ||
            f.staffNumber.toLowerCase().includes(q) ||
            f.bookTitle.toLowerCase().includes(q)
        );
    });

    const handlePay = async (fineId) => {
        setProcessing(fineId);
        setError('');
        try {
            await markFineAsPaid(fineId);
            fetchData();
        } catch (err) {
            setError(err.response?.data || 'Failed to mark fine as paid');
        } finally {
            setProcessing(null);
        }
    };

    const handleWaive = async (fineId) => {
        if (!window.confirm('Are you sure you want to waive this fine?')) return;
        setProcessing(fineId);
        setError('');
        try {
            await markFineAsWaived(fineId);
            fetchData();
        } catch (err) {
            setError(err.response?.data || 'Failed to waive fine');
        } finally {
            setProcessing(null);
        }
    };

    const employeeList = Object.values(
        all.reduce((acc, f) => {
            if (!acc[f.staffNumber]) {
                acc[f.staffNumber] = { staffNumber: f.staffNumber, userName: f.userName };
            }
            return acc;
        }, {})
    );

    const filteredEmps = employeeList.filter(e =>
        e.userName.toLowerCase().includes(empSearch.toLowerCase()) ||
        e.staffNumber.toLowerCase().includes(empSearch.toLowerCase())
    );

    const printReport = (html) => {
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
    };

    const buildReportShell = (title, subtitle, bodyHtml, summaryHtml) => `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 12px; }
    .header h1 { font-size: 20px; font-weight: bold; }
    .header p { font-size: 12px; color: #555; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f0f0f0; font-weight: bold; padding: 8px 10px; border: 1px solid #ccc; text-align: left; font-size: 12px; }
    td { padding: 7px 10px; border: 1px solid #ddd; font-size: 12px; }
    tr:nth-child(even) td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: bold; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-paid { background: #d1e7dd; color: #0a5d36; }
    .badge-waived { background: #e2e3e5; color: #41464b; }
    .summary { margin-top: 24px; border-top: 2px solid #111; padding-top: 12px; display: flex; gap: 32px; }
    .summary-item { text-align: center; }
    .summary-item .label { font-size: 11px; color: #555; text-transform: uppercase; }
    .summary-item .value { font-size: 18px; font-weight: bold; margin-top: 2px; }
    .generated { margin-top: 20px; font-size: 11px; color: #888; text-align: right; }
    @media print {
      @page { size: A4 portrait; margin: 20mm; }
      body { padding: 16px; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Library Fines Report</h1>
    <p>${subtitle}</p>
  </div>
  ${bodyHtml}
  <div class="summary">${summaryHtml}</div>
  <p class="generated">Generated on ${new Date().toLocaleString()}</p>
</body>
</html>`;

    const fineRow = (f) => `
  <tr>
    <td>${f.userName}</td>
    <td>${f.staffNumber}</td>
    <td>${f.bookTitle}</td>
    <td>${f.issueDate ? new Date(f.issueDate).toLocaleDateString() : '—'}</td>
    <td>${f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
    <td>${f.returnDate ? new Date(f.returnDate).toLocaleDateString() : '—'}</td>
    <td>₹${parseFloat(f.amount).toFixed(2)}</td>
    <td><span class="badge badge-${f.status}">${f.status}</span></td>
    <td>${f.paidDate ? new Date(f.paidDate).toLocaleDateString() : '—'}</td>
    <td>${f.collectedByName || '—'}</td>
  </tr>`;

    const summaryBlock = (data) => {
        const total = data.length;
        const collected = data.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount), 0);
        const pendingAmount = data.filter(f => f.status === 'pending').reduce((s, f) => s + parseFloat(f.amount), 0);
        return `
      <div class="summary-item"><div class="label">Total Fines</div><div class="value">${total}</div></div>
      <div class="summary-item"><div class="label">Collected</div><div class="value" style="color:#0a5d36">₹${collected.toFixed(2)}</div></div>
      <div class="summary-item"><div class="label">Pending</div><div class="value" style="color:#856404">₹${pendingAmount.toFixed(2)}</div></div>
    `;
    };

    const tableWrap = (rows) => `
  <table>
    <thead>
      <tr>
        <th>Borrower</th><th>Staff No.</th><th>Book</th>
        <th>Issue Date</th><th>Due Date</th><th>Return Date</th>
        <th>Amount</th><th>Status</th><th>Paid Date</th><th>Collected By</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;

    const handleMonthReport = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const data = all.filter(f => {
            const d = f.returnDate ? new Date(f.returnDate) : new Date(f.issueDate);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
        });
        if (!data.length) return alert('No fines found for the selected month.');
        const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        const html = buildReportShell(
            `Fines Report - ${monthLabel}`,
            `Month: ${monthLabel}`,
            tableWrap(data.map(fineRow).join('')),
            summaryBlock(data)
        );
        printReport(html);
    };

    const handleEmployeeReport = () => {
        if (!selectedEmp) return alert('Please select an employee.');
        const data = all.filter(f => f.staffNumber === selectedEmp.staffNumber);
        if (!data.length) return alert('No fines found for this employee.');
        const html = buildReportShell(
            `Fines Report - ${selectedEmp.userName}`,
            `Employee: ${selectedEmp.userName} | Staff No: ${selectedEmp.staffNumber}`,
            tableWrap(data.map(fineRow).join('')),
            summaryBlock(data)
        );
        printReport(html);
    };

    const columns = [
        { header: 'Borrower', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        { header: 'Book', key: 'bookTitle' },
        { header: 'Issue Date', render: (row) => formatDate(row.issueDate) },
        { header: 'Due Date', render: (row) => <span className="text-danger">{formatDate(row.dueDate)}</span> },
        { header: 'Return Date', render: (row) => formatDate(row.returnDate) },
        {
            header: 'Amount',
            render: (row) => (
                <span className="text-warning font-semibold">{formatCurrency(row.amount)}</span>
            )
        },
        { header: 'Status', render: (row) => <Badge text={row.status} /> },
        { header: 'Paid Date', render: (row) => formatDate(row.paidDate) },
        { header: 'Collected By', render: (row) => row.collectedByName || '—' },
        {
            header: 'Actions',
            render: (row) => row.status === 'pending' ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => handlePay(row.fineId)}
                        disabled={processing === row.fineId}
                    >
                        {processing === row.fineId ? '...' : 'Mark Paid'}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleWaive(row.fineId)}
                        disabled={processing === row.fineId}
                    >
                        Waive
                    </Button>
                </div>
            ) : <span className="text-text-secondary text-xs">—</span>
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    if (!fineSystemEnabled) {
        return (
            <Layout>
                <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-text-primary text-2xl font-bold">Fines</h1>
                            <p className="text-text-secondary text-sm mt-1">
                                Manage overdue fines and payments
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <span className="text-5xl">⚠️</span>
                        <p className="text-text-primary font-semibold text-lg">Fine System is Disabled</p>
                        <p className="text-text-secondary text-sm text-center max-w-sm">
                            Fines are not being generated for overdue returns. Contact your admin to enable it from System Config.
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">Fines</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            Manage overdue fines and payments
                        </p>
                    </div>
                    <Button onClick={() => setShowReportModal(true)}>
                        Download Report
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-text-secondary text-xs uppercase tracking-wider">Total Fines</p>
                        <p className="text-text-primary text-2xl font-bold mt-1">{all.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-warning text-xs uppercase tracking-wider">Pending</p>
                        <p className="text-warning text-2xl font-bold mt-1">{pending.length}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 text-center">
                        <p className="text-success text-xs uppercase tracking-wider">Collected</p>
                        <p className="text-success text-2xl font-bold mt-1">
                            {formatCurrency(all.filter(f => f.status === 'paid')
                                .reduce((sum, f) => sum + parseFloat(f.amount), 0))}
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-900 bg-opacity-30 border border-danger rounded-lg px-4 py-3">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

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
                            {tab.key === 'pending' && pending.length > 0 && (
                                <span className="ml-2 bg-warning text-primary text-xs px-1.5 py-0.5 rounded-full">
                                    {pending.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>


                <div className="flex gap-2">
                    {/* Month */}
                    <select
                        value={selectedMonth ? selectedMonth.split('-')[1] : ''}
                        onChange={(e) => {
                            const year = selectedMonth?.split('-')[0] || new Date().getFullYear();
                            setSelectedMonth(e.target.value ? `${year}-${e.target.value}` : '');
                        }}
                        className="bg-surface border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm"
                    >
                        <option value="">All Months</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                            .map((m, i) => (
                                <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
                            ))}
                    </select>

                    {/* Year */}
                    <select
                        value={selectedMonth ? selectedMonth.split('-')[0] : ''}
                        onChange={(e) => {
                            const month = selectedMonth?.split('-')[1] || '';
                            setSelectedMonth(
                                e.target.value
                                    ? (month ? `${e.target.value}-${month}` : `${e.target.value}`)
                                    : ''
                            );
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
                        placeholder="Search by borrower, staff number or book title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border text-text-primary rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                    />
                </div>

                {/* Table */}
                <Card title={`${tabs.find(t => t.key === activeTab)?.label} (${filtered.length})`}>
                    <Table
                        columns={columns}
                        data={filtered}
                        emptyMessage="No fines found"
                    />
                </Card>

                {showReportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 flex flex-col gap-5 shadow-xl">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-text-primary text-lg font-bold">Download Fines Report</h2>
                                <button
                                    onClick={() => { setShowReportModal(false); setSelectedEmp(null); setEmpSearch(''); }}
                                    className="text-text-secondary hover:text-text-primary text-xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Report Type Toggle */}
                            <div className="flex gap-2">
                                {[{ key: 'month', label: 'Month-wise' }, { key: 'employee', label: 'Employee-wise' }].map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => { setReportType(t.key); setSelectedEmp(null); setEmpSearch(''); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                            ${reportType === t.key
                                                ? 'bg-accent text-primary'
                                                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Month Picker */}
                            {reportType === 'month' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-secondary text-xs uppercase tracking-wider">Select Month</label>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="bg-surface border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                            )}

                            {/* Employee Picker */}
                            {reportType === 'employee' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-secondary text-xs uppercase tracking-wider">Select Employee</label>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or staff no..."
                                            value={empSearch}
                                            onChange={(e) => { setEmpSearch(e.target.value); setSelectedEmp(null); }}
                                            className="w-full bg-surface border border-border text-text-primary rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                                        />
                                    </div>

                                    {/* Employee List */}
                                    {empSearch && !selectedEmp && (
                                        <div className="border border-border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                                            {filteredEmps.length === 0
                                                ? <p className="text-text-secondary text-xs px-3 py-2">No employees found</p>
                                                : filteredEmps.map(e => (
                                                    <button
                                                        key={e.staffNumber}
                                                        onClick={() => { setSelectedEmp(e); setEmpSearch(e.userName); }}
                                                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-accent hover:text-primary transition-colors flex justify-between"
                                                    >
                                                        <span>{e.userName}</span>
                                                        <span className="text-text-secondary text-xs">{e.staffNumber}</span>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}

                                    {selectedEmp && (
                                        <div className="flex items-center justify-between bg-accent bg-opacity-10 border border-accent rounded-lg px-3 py-2">
                                            <span className="text-text-primary text-sm font-medium">{selectedEmp.userName}</span>
                                            <span className="text-text-secondary text-xs">{selectedEmp.staffNumber}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <Button
                                    className="flex-1"
                                    onClick={reportType === 'month' ? handleMonthReport : handleEmployeeReport}
                                >
                                    Print / Download
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => { setShowReportModal(false); setSelectedEmp(null); setEmpSearch(''); }}
                                >
                                    Cancel
                                </Button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default Fines;