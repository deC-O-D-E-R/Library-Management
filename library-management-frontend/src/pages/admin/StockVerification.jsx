import { useState, useEffect, useRef } from 'react';
import { Plus, CheckCircle, Printer, Trash2, ClipboardList, ChevronDown } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import {
    getAllVerifications, initiateVerification, scanCopy,
    completeVerification, getDiscrepancyReport,
    getVerificationUsers, getPrintSheetData, getAllCategories
} from '../../api/userApi';
import { formatDateTime } from '../../utils/helpers';

const inputClass = 'bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary w-full';
const labelClass = 'text-text-secondary text-xs font-semibold uppercase tracking-wider';

const formatScope = (a) => {
    if (!a) return '—';
    if (a.scopeType === 'call_number_range') return `${a.scopeFrom} → ${a.scopeTo}`;
    if (a.scopeType === 'category') return a.scopeFrom || '—';
    return 'Full Library';
};

// ── Scope dropdown cell ───────────────────────────────────────────────────
const ScopeCell = ({ assignments }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!assignments || assignments.length === 0) {
        return <span className="text-text-secondary text-xs">—</span>;
    }

    // 👇 Show first assignment scope as summary
    const a = assignments[0];

    const scopeLabel =
        a.scopeType === 'call_number_range'
            ? `Call No: ${a.scopeFrom} → ${a.scopeTo}`
            : a.scopeType === 'category'
                ? `Category: ${a.scopeFrom}`
                : 'Full Library';

    return (
        <div className="relative" ref={ref}>
            {/* Scope + count */}
            <button
                onClick={() => setOpen(p => !p)}
                className="flex flex-col items-start text-left"
            >
                <span className="text-text-primary text-xs font-semibold">
                    {scopeLabel}
                </span>

                <span className="text-text-secondary text-[11px] flex items-center gap-1">
                    {assignments.length} verifier{assignments.length > 1 ? 's' : ''}
                    <ChevronDown
                        size={12}
                        className={`transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="
                    absolute left-0 top-10 -translate-y-4 z-[9999]
                    w-64 max-h-60 overflow-y-auto
                    bg-sidebar border border-border rounded-xl shadow-lg
                ">
                    {assignments.map((a, i) => (
                        <div key={i} className="px-3 py-2 border-b border-border last:border-0">
                            <p className="text-text-primary text-xs font-semibold">{a.name}</p>
                            <p className="text-text-secondary text-xs">
                                {a.empId} · {a.designation}
                            </p>
                            <p className="text-accent text-xs font-medium">
                                {formatScope(a)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StockVerification = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initiate modal
    const [categories, setCategories] = useState([]);
    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [assignForm, setAssignForm] = useState({
        userId: '', scopeType: 'call_number_range', scopeFrom: '', scopeTo: ''
    });

    // Print modal
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printVerification, setPrintVerification] = useState(null);

    // Enter results modal
    const [showScanModal, setShowScanModal] = useState(false);
    const [activeVerification, setActiveVerification] = useState(null);
    const [activeAssignments, setActiveAssignments] = useState([]);
    const [accessionNumber, setAccessionNumber] = useState('');
    const [markedStatus, setMarkedStatus] = useState('missing');
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [scanResult, setScanResult] = useState(null);

    // Report modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [report, setReport] = useState(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchVerifications = async () => {
        try {
            const res = await getAllVerifications();
            setVerifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVerifications(); }, []);

    // ── Initiate ──────────────────────────────────────────────────────────

    const openInitiateModal = async () => {
        setError('');
        setAssignments([]);
        setAssignForm({
            userId: '',
            scopeType: 'call_number_range',
            scopeFrom: '',
            scopeTo: ''
        });

        try {
            const [usersRes, categoriesRes] = await Promise.all([
                getVerificationUsers(),
                getAllCategories()
            ]);

            setAvailableUsers(usersRes.data);
            setCategories(categoriesRes.data);

        } catch (err) {
            console.error(err);
        }

        setShowInitiateModal(true);
    };

    const handleAddAssignment = () => {
        if (!assignForm.userId) { setError('Select a verifier'); return; }
        if (assignForm.scopeType !== 'full' && !assignForm.scopeFrom.trim()) {
            setError(assignForm.scopeType === 'call_number_range' ? 'Call No. From is required' : 'Category is required');
            return;
        }
        if (assignForm.scopeType === 'call_number_range' && !assignForm.scopeTo.trim()) {
            setError('Call No. To is required');
            return;
        }
        const user = availableUsers.find(u => u.userId === parseInt(assignForm.userId));
        setAssignments(prev => [...prev, {
            userId: parseInt(assignForm.userId),
            scopeType: assignForm.scopeType,
            scopeFrom: assignForm.scopeType === 'full' ? null : assignForm.scopeFrom.trim(),
            scopeTo: assignForm.scopeType === 'call_number_range' ? assignForm.scopeTo.trim() : null,
            userName: user?.name,
            staffNumber: user?.staffNumber,
            designation: user?.designation,
        }]);
        setAssignForm({ userId: '', scopeType: 'call_number_range', scopeFrom: '', scopeTo: '' });
        setError('');
    };

    const handleRemoveAssignment = (index) => {
        setAssignments(prev => prev.filter((_, i) => i !== index));
    };

    const handleInitiate = async () => {
        if (assignments.length === 0) { setError('Add at least one verifier'); return; }
        setSaving(true);
        setError('');
        try {
            await initiateVerification({
                scopeType: 'full',
                scopeValue: null,
                assignments: assignments.map(a => ({
                    userId: a.userId,
                    scopeType: a.scopeType,
                    scopeFrom: a.scopeFrom,
                    scopeTo: a.scopeTo,
                }))
            });
            setShowInitiateModal(false);
            fetchVerifications();
        } catch (err) {
            setError(err.response?.data || 'Failed to initiate verification');
        } finally {
            setSaving(false);
        }
    };

    // ── Print ─────────────────────────────────────────────────────────────

    const openPrintModal = (row) => {
        setPrintVerification(row);
        setShowPrintModal(true);
    };

    const handlePrint = async (verificationId, assignmentId, verifierName) => {
        try {
            const res = await getPrintSheetData(verificationId, assignmentId);
            const d = res.data;
            const scopeLabel = d.scopeType === 'call_number_range'
                ? `${d.scopeFrom} → ${d.scopeTo}`
                : d.scopeType === 'category'
                    ? `Category: ${d.scopeFrom}`
                    : 'Full Library';
            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                <head>
                    <title>Verification Sheet — ${verifierName}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; padding: 32px; font-size: 11px; color: #111; }
                        .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
                        .header h1 { font-size: 16px; font-weight: bold; }
                        .header p { font-size: 11px; color: #555; margin-top: 2px; }
                        .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
                        .meta-item label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 2px; }
                        .meta-item span { font-size: 12px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
                        thead tr { background: #111; color: #fff; }
                        th { padding: 7px 10px; text-align: left; font-size: 10px; }
                        td { padding: 7px 10px; border-bottom: 1px solid #e5e5e5; }
                        tr:nth-child(even) td { background: #f9f9f9; }
                        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
                        .sig-line { border-top: 1px solid #111; width: 180px; padding-top: 6px; font-size: 10px; color: #555; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>CDOT Library — Stock Verification Sheet</h1>
                        <p>Verification #${d.verificationId} &nbsp;·&nbsp; ${new Date(d.startedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div class="meta">
                        <div class="meta-item"><label>Verifier</label><span>${d.verifierName}</span></div>
                        <div class="meta-item"><label>Staff No.</label><span>${d.verifierEmpId}</span></div>
                        <div class="meta-item"><label>Designation</label><span>${d.verifierDesignation}</span></div>
                        <div class="meta-item"><label>Scope</label><span>${scopeLabel}</span></div>
                        <div class="meta-item"><label>Total Books</label><span>${(d.rows || []).length}</span></div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width:28px">#</th>
                                <th>Accession No.</th>
                                <th>Title</th>
                                <th>Call No.</th>
                                <th>Expected Status</th>
                                <th style="width:70px;text-align:center">Found ✓/✗</th>
                                <th style="width:120px">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(d.rows || []).map((r, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td><strong>${r.accessionNumber}</strong></td>
                                    <td>${r.title}</td>
                                    <td>${r.callNumber}</td>
                                    <td>${r.expectedStatus}</td>
                                    <td></td>
                                    <td></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <div>
                            <p>Total books: <strong>${(d.rows || []).length}</strong></p>
                            <p style="margin-top:6px">Verified on: _______________</p>
                        </div>
                        <div class="sig-line">Signature of Verifier</div>
                    </div>
                </body>
                </html>
            `);
            win.document.close();
            win.print();
        } catch (err) {
            alert('Failed to load print sheet');
        }
    };

    // ── Enter Results ─────────────────────────────────────────────────────

    const openScanModal = (row) => {
        setActiveVerification(row);
        setActiveAssignments(row.assignments || []);
        setSelectedAssignmentId(row.assignments?.[0]?.assignmentId?.toString() || '');
        setScanResult(null);
        setAccessionNumber('');
        setMarkedStatus('missing');
        setError('');
        setShowScanModal(true);
    };

    const handleScan = async () => {
        if (!accessionNumber.trim()) { setError('Accession number is required'); return; }
        setSaving(true);
        setError('');
        setScanResult(null);
        try {
            const res = await scanCopy(activeVerification.verificationId, {
                accessionNumber: accessionNumber.trim(),
                markedStatus,
                assignmentId: selectedAssignmentId ? parseInt(selectedAssignmentId) : null,
            });
            setScanResult(res.data);
            setAccessionNumber('');
        } catch (err) {
            setError(err.response?.data || 'Failed to record entry');
        } finally {
            setSaving(false);
        }
    };

    // ── Complete ──────────────────────────────────────────────────────────

    const handleComplete = async (verificationId) => {
        if (!window.confirm('Mark this verification as complete? This cannot be undone.')) return;
        try {
            await completeVerification(verificationId);
            fetchVerifications();
        } catch (err) {
            alert(err.response?.data || 'Failed to complete verification');
        }
    };

    // ── Report ────────────────────────────────────────────────────────────

    const handleViewReport = async (verificationId) => {
        try {
            const res = await getDiscrepancyReport(verificationId);
            setReport(res.data);
            setShowReportModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    // ── Table columns ─────────────────────────────────────────────────────

    const columns = [
        { header: 'ID', key: 'verificationId' },
        { header: 'Initiated By', key: 'initiatedByName' },
        {
            header: 'Scope',
            render: (row) => (
                <ScopeCell assignments={row.assignments} />
            )
        },
        { header: 'Entries', render: (row) => <span className="text-text-primary">{row.totalScanned}</span> },
        { header: 'Started', render: (row) => formatDateTime(row.startedAt) },
        { header: 'Completed', render: (row) => row.completedAt ? formatDateTime(row.completedAt) : '—' },
        { header: 'Status', render: (row) => <Badge text={row.status.replace('_', ' ')} /> },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2 flex-wrap">
                    {row.status === 'in_progress' && (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => openPrintModal(row)} title="Print sheets">
                                <Printer size={13} />
                            </Button>
                            <Button size="sm" onClick={() => openScanModal(row)}>
                                <ClipboardList size={13} /> Enter Results
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleComplete(row.verificationId)}>
                                <CheckCircle size={13} /> Complete
                            </Button>
                        </>
                    )}
                    {row.status === 'completed' && (
                        <Button size="sm" variant="secondary" onClick={() => handleViewReport(row.verificationId)}>
                            View Report
                        </Button>
                    )}
                </div>
            )
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">Stock Verification</h1>
                        <p className="text-text-secondary text-sm mt-1">Initiate and manage library stock verifications</p>
                    </div>
                    <Button onClick={openInitiateModal}>
                        <Plus size={15} /> Start Verification
                    </Button>
                </div>

                <Card title={`Verification Runs (${verifications.length})`}>
                    <Table columns={columns} data={verifications} emptyMessage="No verification runs yet" />
                </Card>

            </div>

            {/* ── Initiate Modal ── */}
            <Modal isOpen={showInitiateModal} onClose={() => setShowInitiateModal(false)} title="Start Stock Verification" size="md">
                <div className="flex flex-col gap-5">

                    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
                        <p className={labelClass}>Assign Verifier</p>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Staff Member</label>
                            <select
                                value={assignForm.userId}
                                onChange={(e) => setAssignForm(p => ({ ...p, userId: e.target.value }))}
                                className={inputClass}
                            >
                                <option value="">— Select —</option>
                                {availableUsers.map(u => (
                                    <option key={u.userId} value={u.userId}>
                                        {u.name} ({u.staffNumber}) · {u.designation}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Assign Scope</label>
                            <select
                                value={assignForm.scopeType}
                                onChange={(e) => setAssignForm(p => ({ ...p, scopeType: e.target.value, scopeFrom: '', scopeTo: '' }))}
                                className={inputClass}
                            >
                                <option value="call_number_range">Call No. Range</option>
                                <option value="category">Category</option>
                                <option value="full">Full Library</option>
                            </select>
                        </div>

                        {assignForm.scopeType === 'call_number_range' && (
                            <div className="flex gap-3">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className={labelClass}>Call No. From</label>
                                    <input
                                        type="text"
                                        value={assignForm.scopeFrom}
                                        onChange={(e) => setAssignForm(p => ({ ...p, scopeFrom: e.target.value }))}
                                        placeholder="101.4"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className={labelClass}>Call No. To</label>
                                    <input
                                        type="text"
                                        value={assignForm.scopeTo}
                                        onChange={(e) => setAssignForm(p => ({ ...p, scopeTo: e.target.value }))}
                                        placeholder="204.3"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}

                        {assignForm.scopeType === 'category' && (
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Category</label>
                                <select
                                    value={assignForm.scopeFrom}
                                    onChange={(e) => setAssignForm(p => ({ ...p, scopeFrom: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="">— Select Category —</option>
                                    {categories.map((c) => (
                                        <option key={c.categoryId} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {assignForm.scopeType === 'full' && (
                            <p className="text-text-secondary text-xs">
                                This verifier will be responsible for the entire library collection.
                            </p>
                        )}

                        {error && <p className="text-danger text-sm">{error}</p>}

                        <Button size="sm" onClick={handleAddAssignment}>
                            <Plus size={13} /> Add to List
                        </Button>
                    </div>

                    {assignments.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className={labelClass}>Assigned ({assignments.length})</p>
                            {assignments.map((a, i) => (
                                <div key={i} className="flex items-center justify-between bg-sidebar border border-border rounded-lg px-3 py-2.5">
                                    <div>
                                        <p className="text-text-primary text-sm font-semibold">{a.userName}</p>
                                        <p className="text-text-secondary text-xs mt-0.5">
                                            {a.staffNumber} · {a.designation} · <span className="text-accent">{formatScope(a)}</span>
                                        </p>
                                    </div>
                                    <button onClick={() => handleRemoveAssignment(i)} className="text-text-secondary hover:text-danger transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowInitiateModal(false)}>Cancel</Button>
                        <Button onClick={handleInitiate} disabled={saving}>
                            {saving ? 'Starting...' : 'Start Verification'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── Print Modal ── */}
            <Modal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} title={`Print Sheets — #${printVerification?.verificationId}`} size="sm">
                <div className="flex flex-col gap-3">
                    <p className="text-text-secondary text-sm">Choose a verifier to generate their sheet.</p>
                    {(printVerification?.assignments || []).map((a, i) => (
                        <div key={i} className="flex items-center justify-between bg-sidebar border border-border rounded-xl px-4 py-3">
                            <div>
                                <p className="text-text-primary text-sm font-semibold">{a.name}</p>
                                <p className="text-text-secondary text-xs mt-0.5">{a.empId} · {a.designation}</p>
                                <p className="text-accent text-xs mt-0.5 font-medium">{formatScope(a)}</p>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => handlePrint(printVerification.verificationId, a.assignmentId, a.name)}>
                                <Printer size={13} /> Print
                            </Button>
                        </div>
                    ))}
                    <div className="flex justify-end pt-1">
                        <Button variant="secondary" onClick={() => setShowPrintModal(false)}>Close</Button>
                    </div>
                </div>
            </Modal>

            {/* ── Enter Results Modal ── */}
            <Modal isOpen={showScanModal} onClose={() => setShowScanModal(false)} title={`Enter Results — #${activeVerification?.verificationId}`} size="sm">
                <div className="flex flex-col gap-4">

                    <div className="bg-surface border border-border rounded-lg px-3 py-2.5">
                        <p className="text-text-secondary text-xs">
                            Enter only books whose status has changed. Books not entered are assumed to be in their expected state.
                        </p>
                    </div>

                    {activeAssignments.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Verifier</label>
                            <select
                                value={selectedAssignmentId}
                                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                                className={inputClass}
                            >
                                {activeAssignments.map(a => (
                                    <option key={a.assignmentId} value={a.assignmentId}>
                                        {a.name} · {formatScope(a)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Accession No.</label>
                        <input
                            type="text"
                            value={accessionNumber}
                            onChange={(e) => setAccessionNumber(e.target.value)}
                            placeholder="H102"
                            className={inputClass}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Found Status</label>
                        <select value={markedStatus} onChange={(e) => setMarkedStatus(e.target.value)} className={inputClass}>
                            <option value="missing">Missing</option>
                            <option value="damaged">Damaged</option>
                            <option value="available">Available</option>
                            <option value="issued">Issued</option>
                        </select>
                    </div>

                    {error && <p className="text-danger text-sm">{error}</p>}

                    {scanResult && (
                        <div className="bg-green-900 bg-opacity-30 border border-success rounded-lg px-3 py-2">
                            <p className="text-success text-xs font-semibold">
                                Recorded. Total entries: {scanResult.totalScanned}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowScanModal(false)}>Close</Button>
                        <Button onClick={handleScan} disabled={saving}>
                            {saving ? 'Saving...' : 'Record'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── Report Modal ── */}
            <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Discrepancy Report" size="xl">
                {report && (
                    <div className="flex flex-col gap-6">

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Entries', value: report.totalScanned, color: 'text-text-primary' },
                                { label: 'Available', value: report.availableCount, color: 'text-success' },
                                { label: 'Missing', value: report.missingCount, color: 'text-danger' },
                                { label: 'Damaged', value: report.damagedCount, color: 'text-warning' },
                            ].map((s, i) => (
                                <div key={i} className="bg-sidebar rounded-lg p-3 text-center">
                                    <p className="text-text-secondary text-xs">{s.label}</p>
                                    <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {report.assignments?.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className={labelClass}>Verifiers</p>
                                <div className="border border-border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-surface border-b border-border">
                                                {['Name', 'Staff No.', 'Designation', 'Scope', 'Entries'].map((h, i) => (
                                                    <th key={i} className="text-left px-4 py-2.5 text-text-secondary text-xs font-semibold uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.assignments.map((a, i) => (
                                                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                                                    <td className="px-4 py-2.5 text-text-primary font-medium">{a.name}</td>
                                                    <td className="px-4 py-2.5 text-text-secondary">{a.empId}</td>
                                                    <td className="px-4 py-2.5 text-text-secondary">{a.designation}</td>
                                                    <td className="px-4 py-2.5 text-accent text-xs font-medium">{formatScope(a)}</td>
                                                    <td className="px-4 py-2.5 text-text-primary font-semibold">{a.scannedCount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <p className={labelClass}>Discrepancies</p>
                            <Table
                                columns={[
                                    { header: 'Accession No.', key: 'accessionNumber' },
                                    { header: 'Title', key: 'bookTitle' },
                                    { header: 'Call No.', key: 'callNumber' },
                                    { header: 'Verifier', render: (row) => <span className="text-text-secondary text-xs">{row.verifierName ?? '—'}</span> },
                                    { header: 'Was', render: (row) => <Badge text={row.previousStatus} /> },
                                    {
                                        header: 'Found As',
                                        render: (row) => row.markedStatus === 'misplaced'
                                            ? <span className="text-orange-400 text-xs font-semibold">Misplaced</span>
                                            : <Badge text={row.markedStatus} />
                                    },
                                ]}
                                data={report.details || []}
                                emptyMessage="No discrepancies found"
                            />
                        </div>

                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default StockVerification;