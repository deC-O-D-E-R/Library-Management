import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, AlertTriangle, PackageSearch } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import {
    getCirculationReport, getUserBorrowingReport, getInventoryReport,
    getHoldingSummary, getOverdueReport, getStockVerificationReport,
    searchUserByStaffNumber
} from '../../api/adminApi';
import { getLibrarianBookById } from '../../api/userApi';
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
const NO_DATE_FILTER = ['holding', 'stock', 'inventory'];

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('circulation');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [userIdInput, setUserIdInput] = useState('');
    const [verificationIdInput, setVerificationIdInput] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [showBookModal, setShowBookModal] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [invFromDate, setInvFromDate] = useState('');
    const [invToDate, setInvToDate] = useState('');
    const [invFilters, setInvFilters] = useState({ callNo: true, accNo: false, price: false });
    const [invSort, setInvSort] = useState('callNo');
    const [stockSort, setStockSort] = useState('callNo');
    const [stockIncludeRemarks, setStockIncludeRemarks] = useState(false);
    const [callNoFrom, setCallNoFrom] = useState('');
    const [callNoTo, setCallNoTo] = useState('');

    // Stock verification filter: 'all' | 'changed' | 'unchanged'
    const [stockFilter, setStockFilter] = useState('all');

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchReport();
        }
    }, [activeTab]);

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
        if (!rows) return rows;
        if (!fromDate && !toDate) return rows;

        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate + 'T23:59:59') : null;

        return rows.filter(r => {
            if (!r[dateKey]) return false;
            const d = new Date(r[dateKey]);
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
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
            default: return data;
        }
    };

    const filteredData = getFilteredData();

    // ─── Shared ───────────────────────────────────────────────────────────
    const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—';

    const monthLabel = fromDate || toDate
        ? `${fromDate || '...'} to ${toDate || '...'}`
        : 'All Time';


    // ─── Inventory Data Preparation ───────────────────────────────────────
    const getInventoryRows = () => {
        if (!data) return { rows: [], summary: null };

        let books = data;
        if (invFromDate || invToDate) {
            const from = invFromDate ? new Date(invFromDate) : null;
            const to = invToDate ? new Date(invToDate + 'T23:59:59') : null;
            books = books.filter(b => {
                if (!b.receiptDate) return false;
                const d = new Date(b.receiptDate);
                if (from && d < from) return false;
                if (to && d > to) return false;
                return true;
            });
        }

        if (invFilters.callNo && (callNoFrom || callNoTo)) {
            books = books.filter(b => {
                const cn = (b.callNumber || '').toLowerCase();
                if (callNoFrom && cn < callNoFrom.toLowerCase()) return false;
                if (callNoTo && cn > callNoTo.toLowerCase()) return false;
                return true;
            });
        }

        const useAccNo = invFilters.accNo;
        const useCallNo = invFilters.callNo || (!invFilters.accNo && !invFilters.callNo);
        const usePrice = invFilters.price;

        let rows = [];

        if (useAccNo) {
            books.forEach(book => {
                (book.copies || []).forEach(copy => {
                    rows.push({
                        title: book.title,
                        author: book.author,
                        accNo: copy.accessionNumber,
                        callNo: book.callNumber,
                        status: copy.status,
                        price: book.price,
                    });
                });
            });
        } else {
            books.forEach(book => {
                rows.push({
                    title: book.title,
                    author: book.author,
                    callNo: book.callNumber,
                    totalCopies: book.totalCopies,
                    available: book.availableCopies,
                    issued: book.issuedCopies,
                    missing: book.missingDamagedCopies,
                    price: book.price,
                });
            });
        }

        rows.sort((a, b) => {
            if (invSort === 'accNo' && useAccNo) return (a.accNo || '').localeCompare(b.accNo || '');
            if (invSort === 'price' && usePrice) return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
            return (a.callNo || '').localeCompare(b.callNo || '');
        });

        const totalTitles = books.length;
        const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
        const totalAvailable = books.reduce((s, b) => s + b.availableCopies, 0);
        const totalIssued = books.reduce((s, b) => s + b.issuedCopies, 0);
        const totalMissing = books.reduce((s, b) => s + b.missingDamagedCopies, 0);
        const totalValue = usePrice
            ? books.reduce((s, b) => s + (parseFloat(b.price) || 0) * b.totalCopies, 0)
            : null;

        return { rows, useAccNo, useCallNo, usePrice, summary: { totalTitles, totalCopies, totalAvailable, totalIssued, totalMissing, totalValue } };
    };


    // ─── PDF Download ─────────────────────────────────────────────────────
    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const title = reportTabs.find(t => t.key === activeTab)?.label + ' Report';
        const invDateLabel = invFromDate || invToDate
            ? `${invFromDate || '...'} to ${invToDate || '...'}`
            : 'All Time';

        const generated = `Generated: ${new Date().toLocaleString()} | Period: ${activeTab === 'inventory' ? invDateLabel : monthLabel}`;

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

        let configs = {};

        if (Array.isArray(d)) {
            configs = {
                circulation: {
                    subtitle: `Status: ${statusFilter || 'All'} | Period: ${monthLabel} | Records: ${d.length}`,
                    head: [['Book', 'Borrower', 'Staff No.', 'Issue Date', 'Due Date', 'Return Date', 'Status']],
                    body: d.map(r => [r.bookTitle, r.userName, r.staffNumber, fmt(r.issueDate), fmt(r.dueDate), fmt(r.returnDate), r.status]),
                },
                holding: {
                    subtitle: `Categories: ${d.length}`,
                    head: [['Category', 'Titles', 'Total Copies', 'Available', 'Issued', 'Missing/Damaged']],
                    body: d.map(r => [r.categoryName, r.totalBooks, r.totalCopies, r.available, r.issued, r.missingDamaged]),
                },
                overdue: {
                    subtitle: `Period: ${monthLabel} | Total Overdue: ${d.length}`,
                    head: [['Book', 'Staff No.', 'Borrower', 'Email', 'Due Date', 'Days Overdue', 'Est. Fine']],
                    body: d.map(r => [r.bookTitle, r.staffNumber, r.userName, r.email, fmt(r.dueDate), r.daysOverdue, `₹${parseFloat(r.estimatedFine).toFixed(2)}`]),
                },
            };
        }

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
            const allDetails = [...(d.details || [])].sort((a, b) =>
                stockSort === 'accNo'
                    ? (a.accessionNumber || '').localeCompare(b.accessionNumber || '')
                    : (a.callNumber || '').localeCompare(b.callNumber || '')
            );
            const changedCount = allDetails.filter(r => r.statusChanged).length;
            const noChangeCount = allDetails.length - changedCount;

            const scopeLabel =
                d.scopeType === 'call_number_range' ? d.scopeValue
                    : d.scopeType === 'category' ? `Category: ${d.scopeValue}`
                        : 'Full Library';

            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text(`Verification ID: ${verificationIdInput} | Scope: ${scopeLabel}`, 14, startY);
            doc.setTextColor(0);
            startY += 8;

            // Verifiers
            doc.setFontSize(9);
            doc.text('Verifiers:', 14, startY);
            startY += 6;
            (d.assignments || []).forEach((a, i) => {
                const scope =
                    a.scopeType === 'call_number_range' ? `${a.scopeFrom} => ${a.scopeTo}`
                        : a.scopeType === 'category' ? `Category: ${a.scopeFrom}`
                            : 'Full Library';
                doc.setFont('helvetica', 'bold');
                doc.text(`${i + 1}. ${a.name}`, 14, startY);
                doc.setFont('helvetica', 'normal');
                doc.text(`(${a.empId}) - ${a.designation}`, 80, startY);
                startY += 5;
                doc.setTextColor(100);
                doc.text(`Scope: ${scope}`, 18, startY);
                doc.setTextColor(0);
                startY += 7;
            });

            // Table first
            autoTable(doc, {
                startY,
                head: [['Accession No.', 'Title', 'Call No.', 'Verified By', 'Previous Status', 'Marked Status', 'Changed', ...(stockIncludeRemarks ? ['Remarks'] : [])]],
                body: allDetails.map(r => [
                    r.accessionNumber,
                    r.bookTitle,
                    r.callNumber,
                    r.verifierName || '',
                    r.previousStatus,
                    r.markedStatus || r.previousStatus,
                    r.statusChanged ? 'Yes' : 'No',
                    ...(stockIncludeRemarks ? [r.remarks || ''] : [])
                ]),
                columnStyles: stockIncludeRemarks ? {
                    7: { cellWidth: 16, overflow: 'linebreak' }
                } : {},
                didParseCell: (data) => {
                    if (data.row.raw && data.row.raw[6] === 'Yes') {
                        data.cell.styles.fillColor = [80, 20, 20];
                        data.cell.styles.textColor = [255, 255, 255];
                    }
                },
                ...tableStyle,
            });

            // Summary AFTER the table
            const finalY = doc.lastAutoTable.finalY + 10;
            [
                ['Total Records', allDetails.length],
                ['Available', d.availableCount],
                ['Missing', d.missingCount],
                ['Damaged', d.damagedCount],
                ['Changed', changedCount],
                ['No Change', noChangeCount],
            ].forEach(([label, value], i) => {
                const x = 14 + i * 32;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.text(String(value), x, finalY + 5);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(120);
                doc.text(label, x, finalY + 9);
                doc.setTextColor(0);
            });
        } else if (activeTab === 'inventory') {
            const { rows, useAccNo, useCallNo, usePrice, summary } = getInventoryRows();

            const dateLabel = invFromDate || invToDate
                ? `${invFromDate || '...'} to ${invToDate || '...'}`
                : 'All Time';

            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text(`Receipt Date: ${dateLabel} | Total Titles: ${summary.totalTitles} | Total Copies: ${summary.totalCopies}`, 14, startY);
            doc.setTextColor(0);
            startY += 6;

            let head, body;

            if (useAccNo && useCallNo) {
                head = [['Title', 'Author', 'Acc No.', 'Call No.', 'Status', ...(usePrice ? ['Price'] : [])]];
                body = rows.map(r => [r.title, r.author, r.accNo, r.callNo, r.status, ...(usePrice ? [`₹${parseFloat(r.price || 0).toFixed(2)}`] : [])]);
            } else if (useAccNo) {
                head = [['Title', 'Author', 'Acc No.', 'Status', ...(usePrice ? ['Price'] : [])]];
                body = rows.map(r => [r.title, r.author, r.accNo, r.status, ...(usePrice ? [`₹${parseFloat(r.price || 0).toFixed(2)}`] : [])]);
            } else {
                head = [['Title', 'Author', 'Call No.', 'Total', 'Available', 'Issued', 'Missing', ...(usePrice ? ['Price'] : [])]];
                body = rows.map(r => [r.title, r.author, r.callNo, r.totalCopies, r.available, r.issued, r.missing, ...(usePrice ? [`₹${parseFloat(r.price || 0).toFixed(2)}`] : [])]);
            }

            autoTable(doc, { startY, head, body, ...tableStyle });

            const finalY = doc.lastAutoTable.finalY + 8;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);

            const summaryItems = [
                ['Total Titles', summary.totalTitles],
                ['Total Copies', summary.totalCopies],
                ['Available', summary.totalAvailable],
                ['Issued', summary.totalIssued],
                ['Missing/Damaged', summary.totalMissing],
                ...(usePrice ? [['Total Collection Value', `₹${summary.totalValue.toFixed(2)}`]] : []),
            ];

            summaryItems.forEach(([label, value], i) => {
                const x = 14 + i * 32;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.text(String(value), x, finalY + 5);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(120);
                doc.text(label, x, finalY + 9);
                doc.setTextColor(0);
            });

            doc.save(`Inventory_Report_${dateLabel.replace(/\s+/g, '_')}.pdf`);
            return;

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
            inventory: () => {
                const { rows, useAccNo, useCallNo, usePrice, summary } = getInventoryRows();

                const dataRows = rows.map(r => {
                    if (useAccNo && useCallNo) {
                        return { 'Title': r.title, 'Author': r.author, 'Acc No.': r.accNo, 'Call No.': r.callNo, 'Status': r.status, ...(usePrice ? { 'Price (₹)': parseFloat(r.price || 0).toFixed(2) } : {}) };
                    } else if (useAccNo) {
                        return { 'Title': r.title, 'Author': r.author, 'Acc No.': r.accNo, 'Status': r.status, ...(usePrice ? { 'Price (₹)': parseFloat(r.price || 0).toFixed(2) } : {}) };
                    } else {
                        return { 'Title': r.title, 'Author': r.author, 'Call No.': r.callNo, 'Total': r.totalCopies, 'Available': r.available, 'Issued': r.issued, 'Missing/Damaged': r.missing, ...(usePrice ? { 'Price (₹)': parseFloat(r.price || 0).toFixed(2) } : {}) };
                    }
                });

                dataRows.push({});
                dataRows.push({ 'Title': '— SUMMARY —' });
                dataRows.push({ 'Title': 'Total Titles', 'Author': summary.totalTitles });
                dataRows.push({ 'Title': 'Total Copies', 'Author': summary.totalCopies });
                dataRows.push({ 'Title': 'Available', 'Author': summary.totalAvailable });
                dataRows.push({ 'Title': 'Issued', 'Author': summary.totalIssued });
                dataRows.push({ 'Title': 'Missing/Damaged', 'Author': summary.totalMissing });
                if (usePrice) dataRows.push({ 'Title': 'Total Collection Value (₹)', 'Author': summary.totalValue.toFixed(2) });

                return dataRows;
            },
            holding: () => d.map(r => ({
                'Category': r.categoryName, 'Titles': r.totalBooks,
                'Total Copies': r.totalCopies, 'Available': r.available,
                'Issued': r.issued, 'Missing/Damaged': r.missingDamaged,
            })),
            overdue: () => d.map(r => ({
                'Book': r.bookTitle, 'Staff No.': r.staffNumber, 'Borrower': r.userName,
                'Email': r.email, 'Due Date': fmt(r.dueDate),
                'Days Overdue': r.daysOverdue, 'Est. Fine': r.estimatedFine,
            })),
            // Full report: all entries, not just discrepancies
            stock: () => {
                const allDetails = [...(d.details || [])].sort((a, b) =>
                    stockSort === 'accNo'
                        ? (a.accessionNumber || '').localeCompare(b.accessionNumber || '')
                        : (a.callNumber || '').localeCompare(b.callNumber || '')
                );
                const rows = allDetails.map(r => ({
                    'Accession No.': r.accessionNumber,
                    'Title': r.bookTitle,
                    'Call No.': r.callNumber,
                    'Verified By': r.verifierName || '',
                    'Previous Status': r.previousStatus,
                    'Marked Status': r.markedStatus || r.previousStatus,
                    'Status Changed': r.statusChanged ? 'Yes' : 'No',
                    ...(stockIncludeRemarks ? { 'Remarks': r.remarks || '' } : {}),
                }));

                // Summary rows at the bottom
                const changedCount = allDetails.filter(r => r.statusChanged).length;
                rows.push({});
                rows.push({ 'Accession No.': '— SUMMARY —' });
                rows.push({ 'Accession No.': 'Total Records', 'Title': allDetails.length });
                rows.push({ 'Accession No.': 'Status Changed', 'Title': changedCount });
                rows.push({ 'Accession No.': 'No Change', 'Title': allDetails.length - changedCount });
                rows.push({ 'Accession No.': 'Available', 'Title': d.availableCount });
                rows.push({ 'Accession No.': 'Missing', 'Title': d.missingCount });
                rows.push({ 'Accession No.': 'Damaged', 'Title': d.damagedCount });

                return rows;
            },
        };

        const rows = builders[activeTab]?.();
        if (!rows) return;

        const ws = XLSX.utils.json_to_sheet(rows);

        if (stockIncludeRemarks) {
            const remarksColIndex = 7;
            const colLetter = 'H';
            if (!ws['!cols']) ws['!cols'] = [];
            ws['!cols'][remarksColIndex] = { wch: 35 };
            Object.keys(ws).filter(k => k.startsWith(colLetter) && k !== '!cols').forEach(k => {
                if (ws[k].v) ws[k].s = { alignment: { wrapText: true } };
            });
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title);

        const dateLabel = activeTab === 'inventory'
            ? (invFromDate || invToDate ? `${invFromDate || '...'}_to_${invToDate || '...'}` : 'All_Time')
            : monthLabel;

        XLSX.writeFile(wb, `${title?.replace(/\s+/g, '_')}_${dateLabel.replace(/\s+/g, '_')}.xlsx`);
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

    const holdingColumns = [
        { header: 'Category', key: 'categoryName' },
        { header: 'Titles', key: 'totalBooks' },
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

    const handleViewBook = async (bookId) => {
        try {
            const res = await getLibrarianBookById(bookId);
            setSelectedBook(res.data);
            setShowBookModal(true);
        } catch (err) {
            console.error(err);
        }
    };

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
                            onClick={() => { setActiveTab(tab.key); setData(null); setFromDate(''); setToDate(''); setStockFilter('all'); setStockSort('callNo'); setStockIncludeRemarks(false); setCallNoFrom(''); setCallNoTo(''); }}
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

                        {!NO_DATE_FILTER.includes(activeTab) && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                    Date Range
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => { setFromDate(e.target.value); setData(null); }}
                                        className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                    />
                                    <span className="text-text-secondary text-sm">to</span>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => { setToDate(e.target.value); setData(null); }}
                                        className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                    />
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

                        {activeTab !== 'inventory' && (
                            <Button onClick={fetchReport} disabled={loading}>
                                {loading ? 'Loading...' : 'Generate Report'}
                            </Button>
                        )}

                    </div>
                </Card>

                {/* Report Results */}
                {loading && <Loader />}

                {filteredData && !loading && (
                    <Card title={`${reportTabs.find(t => t.key === activeTab)?.label} Report${activeTab === 'inventory'
                        ? ` — ${invFromDate || invToDate ? `${invFromDate || '...'} to ${invToDate || '...'}` : 'All Time'}`
                        : ` — ${monthLabel}`
                        }`}>

                        {/* Download Buttons */}
                        {activeTab !== 'inventory' && activeTab !== 'stock' && (
                            <div className="flex gap-2 mb-4">
                                <Button size="sm" onClick={handleDownloadPDF}>
                                    Download PDF
                                </Button>
                                <Button size="sm" variant="secondary" onClick={handleDownloadExcel}>
                                    Download Excel
                                </Button>
                            </div>
                        )}

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

                        {/* Inventory Export Panel */}
                        {activeTab === 'inventory' && (
                            <div className="flex flex-col gap-5">

                                <div className="flex flex-col gap-2">
                                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Receipt Date Range</span>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="date"
                                            value={invFromDate}
                                            onChange={(e) => setInvFromDate(e.target.value)}
                                            className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                        />
                                        <span className="text-text-secondary text-sm">to</span>
                                        <input
                                            type="date"
                                            value={invToDate}
                                            onChange={(e) => setInvToDate(e.target.value)}
                                            className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-border" />

                                <div className="flex flex-col gap-2">
                                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Include Columns</span>
                                    <div className="flex gap-6">
                                        {[
                                            { key: 'callNo', label: 'Call Number' },
                                            { key: 'accNo', label: 'Accession No.' },
                                            { key: 'price', label: 'Price' },
                                        ].map(({ key, label }) => (
                                            <label key={key} className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={invFilters[key]}
                                                    onChange={(e) => setInvFilters({ ...invFilters, [key]: e.target.checked })}
                                                    className="accent-accent w-4 h-4"
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {invFilters.callNo && (
                                    <>
                                        <div className="h-px bg-border" />
                                        <div className="flex flex-col gap-2">
                                            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Call Number Range</span>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="From (e.g. 100.1)"
                                                    value={callNoFrom}
                                                    onChange={(e) => setCallNoFrom(e.target.value)}
                                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary flex-1"
                                                />
                                                <span className="text-text-secondary text-sm">to</span>
                                                <input
                                                    type="text"
                                                    placeholder="To (e.g. 100.8)"
                                                    value={callNoTo}
                                                    onChange={(e) => setCallNoTo(e.target.value)}
                                                    className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary flex-1"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="h-px bg-border" />

                                <div className="flex flex-col gap-2">
                                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Sort By</span>
                                    <div className="flex gap-6">
                                        {[
                                            { value: 'callNo', label: 'Call No.', disabled: false },
                                            { value: 'accNo', label: 'Acc No.', disabled: !invFilters.accNo },
                                            { value: 'price', label: 'Price', disabled: !invFilters.price },
                                        ].map(({ value, label, disabled }) => (
                                            <label key={value} className={`flex items-center gap-2 text-sm ${disabled ? 'text-text-secondary opacity-40 cursor-not-allowed' : 'text-text-primary cursor-pointer'}`}>
                                                <input
                                                    type="radio"
                                                    name="invSort"
                                                    value={value}
                                                    checked={invSort === value}
                                                    onChange={() => !disabled && setInvSort(value)}
                                                    disabled={disabled}
                                                    className="accent-accent w-4 h-4"
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border" />

                                <div className="flex gap-3">
                                    <Button onClick={handleDownloadPDF}>Download PDF</Button>
                                    <Button variant="secondary" onClick={handleDownloadExcel}>Download Excel</Button>
                                </div>

                            </div>
                        )}

                        {/* Holding Summary */}
                        {activeTab === 'holding' && (
                            <Table
                                columns={holdingColumns}
                                data={[...filteredData]
                                    .sort((a, b) => {
                                        const aIsTotal = a.categoryName?.toLowerCase().includes('total');
                                        const bIsTotal = b.categoryName?.toLowerCase().includes('total');
                                        if (aIsTotal) return 1;
                                        if (bIsTotal) return -1;
                                        return a.categoryName?.localeCompare(b.categoryName);
                                    })
                                }
                                emptyMessage="No data found"
                            />
                        )}

                        {/* Overdue */}
                        {activeTab === 'overdue' && (
                            <Table columns={overdueColumns} data={filteredData} emptyMessage="No overdue books" />
                        )}

                        {/* ── Stock Verification — Full Report ── */}
                        {activeTab === 'stock' && (() => {
                            const allDetails = filteredData.details || [];
                            const changedCount = allDetails.filter(r => r.statusChanged).length;
                            const noChangeCount = allDetails.length - changedCount;

                            return (
                                <div className="flex flex-col gap-5">

                                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                                        {[
                                            { label: 'Total Records', value: allDetails.length, color: 'text-text-primary' },
                                            { label: 'Available', value: filteredData.availableCount, color: 'text-success' },
                                            { label: 'Missing', value: filteredData.missingCount, color: 'text-danger' },
                                            { label: 'Damaged', value: filteredData.damagedCount, color: 'text-warning' },
                                            { label: 'Status Changed', value: changedCount, color: 'text-danger' },
                                            { label: 'No Change', value: noChangeCount, color: 'text-success' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-sidebar rounded-lg p-3 text-center">
                                                <p className="text-text-secondary text-xs">{stat.label}</p>
                                                <p className={`font-bold text-xl mt-1 ${stat.color}`}>{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Sort By</span>
                                        <div className="flex gap-6">
                                            {[
                                                { value: 'callNo', label: 'Call No.' },
                                                { value: 'accNo', label: 'Acc No.' },
                                            ].map(({ value, label }) => (
                                                <label key={value} className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="stockSort"
                                                        value={value}
                                                        checked={stockSort === value}
                                                        onChange={() => setStockSort(value)}
                                                        className="accent-accent w-4 h-4"
                                                    />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Include Columns (Only if Remarks are required)</span>
                                        <label className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={stockIncludeRemarks}
                                                onChange={(e) => setStockIncludeRemarks(e.target.checked)}
                                                className="accent-accent w-4 h-4"
                                            />
                                            Remarks
                                        </label>
                                    </div>

                                    <div className="h-px bg-border" />

                                    <div className="flex gap-3">
                                        <Button onClick={handleDownloadPDF}>Download PDF</Button>
                                        <Button variant="secondary" onClick={handleDownloadExcel}>Download Excel</Button>
                                    </div>

                                </div>
                            );
                        })()}

                    </Card>
                )}

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

export default AdminReports;