import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import {
    getAllVerifications, initiateVerification,
    scanCopy, completeVerification, getDiscrepancyReport
} from '../../api/userApi';
import { formatDateTime } from '../../utils/helpers';

const StockVerification = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeVerification, setActiveVerification] = useState(null);
    const [report, setReport] = useState(null);
    const [scopeType, setScopeType] = useState('full');
    const [scopeValue, setScopeValue] = useState('');
    const [accessionNumber, setAccessionNumber] = useState('');
    const [markedStatus, setMarkedStatus] = useState('available');
    const [scanResult, setScanResult] = useState(null);
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

    const handleInitiate = async () => {
        if (scopeType !== 'full' && !scopeValue.trim()) {
            setError('Scope value is required');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await initiateVerification({
                scopeType,
                scopeValue: scopeType === 'full' ? null : scopeValue
            });
            setShowInitiateModal(false);
            setScopeType('full');
            setScopeValue('');
            fetchVerifications();
        } catch (err) {
            setError(err.response?.data || 'Failed to initiate verification');
        } finally {
            setSaving(false);
        }
    };

    const handleScan = async () => {
        if (!accessionNumber.trim()) {
            setError('Accession number is required');
            return;
        }
        setSaving(true);
        setError('');
        setScanResult(null);
        try {
            const res = await scanCopy(activeVerification.verificationId, {
                accessionNumber: accessionNumber.trim(),
                markedStatus
            });
            setScanResult(res.data);
            setAccessionNumber('');
        } catch (err) {
            setError(err.response?.data || 'Failed to scan copy');
        } finally {
            setSaving(false);
        }
    };

    const handleComplete = async (verificationId) => {
        if (!window.confirm('Mark this verification as complete?')) return;
        try {
            await completeVerification(verificationId);
            fetchVerifications();
        } catch (err) {
            alert(err.response?.data || 'Failed to complete verification');
        }
    };

    const handleViewReport = async (verificationId) => {
        try {
            const res = await getDiscrepancyReport(verificationId);
            setReport(res.data);
            setShowReportModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        { header: 'ID', key: 'verificationId' },
        { header: 'Initiated By', key: 'initiatedByName' },
        {
            header: 'Scope',
            render: (row) => (
                <span className="text-text-primary">
                    {row.scopeType} {row.scopeValue ? `— ${row.scopeValue}` : ''}
                </span>
            )
        },
        { header: 'Scanned', render: (row) => row.totalScanned },
        { header: 'Started', render: (row) => formatDateTime(row.startedAt) },
        { header: 'Completed', render: (row) => formatDateTime(row.completedAt) },
        { header: 'Status', render: (row) => <Badge text={row.status.replace('_', ' ')} /> },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    {row.status === 'in_progress' && (
                        <>
                            <Button
                                size="sm"
                                onClick={() => { setActiveVerification(row); setScanResult(null); setError(''); setShowScanModal(true); }}
                            >
                                <Search size={13} /> Scan
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleComplete(row.verificationId)}
                            >
                                <CheckCircle size={13} /> Complete
                            </Button>
                        </>
                    )}
                    {row.status === 'completed' && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewReport(row.verificationId)}
                        >
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

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">Stock Verification</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            Initiate and manage library stock verifications
                        </p>
                    </div>
                    <Button onClick={() => { setError(''); setShowInitiateModal(true); }}>
                        <Plus size={15} /> Start Verification
                    </Button>
                </div>

                {/* Table */}
                <Card title={`Verification Runs (${verifications.length})`}>
                    <Table
                        columns={columns}
                        data={verifications}
                        emptyMessage="No verification runs yet"
                    />
                </Card>

            </div>

            {/* Initiate Modal */}
            <Modal
                isOpen={showInitiateModal}
                onClose={() => setShowInitiateModal(false)}
                title="Start Stock Verification"
                size="sm"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Scope Type
                        </label>
                        <select
                            value={scopeType}
                            onChange={(e) => { setScopeType(e.target.value); setScopeValue(''); }}
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                        >
                            <option value="full">Full Library</option>
                            <option value="category">By Category</option>
                            <option value="call_number">By Call Number</option>
                        </select>
                    </div>

                    {scopeType !== 'full' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                                {scopeType === 'category' ? 'Category Name' : 'Call Number'}
                            </label>
                            <input
                                type="text"
                                value={scopeValue}
                                onChange={(e) => setScopeValue(e.target.value)}
                                placeholder={scopeType === 'category' ? 'e.g. Science' : 'e.g. PHY-001'}
                                className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                            />
                        </div>
                    )}

                    {error && <p className="text-danger text-sm">{error}</p>}

                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowInitiateModal(false)}>Cancel</Button>
                        <Button onClick={handleInitiate} disabled={saving}>
                            {saving ? 'Starting...' : 'Start'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Scan Modal */}
            <Modal
                isOpen={showScanModal}
                onClose={() => setShowScanModal(false)}
                title={`Scan Copy — Verification #${activeVerification?.verificationId}`}
                size="sm"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Accession Number
                        </label>
                        <input
                            type="text"
                            value={accessionNumber}
                            onChange={(e) => setAccessionNumber(e.target.value)}
                            placeholder="e.g. ACC-001"
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                            Mark As
                        </label>
                        <select
                            value={markedStatus}
                            onChange={(e) => setMarkedStatus(e.target.value)}
                            className="bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                        >
                            <option value="available">Available</option>
                            <option value="issued">Issued</option>
                            <option value="missing">Missing</option>
                            <option value="damaged">Damaged</option>
                        </select>
                    </div>

                    {error && <p className="text-danger text-sm">{error}</p>}

                    {scanResult && (
                        <div className="bg-green-900 bg-opacity-30 border border-success rounded-lg px-3 py-2">
                            <p className="text-success text-xs font-semibold">
                                Scanned {scanResult.totalScanned} copies so far
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowScanModal(false)}>Close</Button>
                        <Button onClick={handleScan} disabled={saving}>
                            <Search size={14} />
                            {saving ? 'Scanning...' : 'Scan'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Discrepancy Report Modal */}
            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                title="Discrepancy Report"
                size="xl"
            >
                {report && (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Scanned', value: report.totalScanned, color: 'text-text-primary' },
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

                        <Table
                            columns={[
                                { header: 'Accession No.', key: 'accessionNumber' },
                                { header: 'Title', key: 'bookTitle' },
                                { header: 'Call No.', key: 'callNumber' },
                                { header: 'Previous', render: (row) => <Badge text={row.previousStatus} /> },
                                { header: 'Marked', render: (row) => <Badge text={row.markedStatus} /> },
                                {
                                    header: 'Changed',
                                    render: (row) => row.statusChanged
                                        ? <span className="text-danger text-xs font-semibold">Yes</span>
                                        : <span className="text-success text-xs">No</span>
                                },
                            ]}
                            data={report.details || []}
                            emptyMessage="No discrepancies found"
                        />
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default StockVerification;