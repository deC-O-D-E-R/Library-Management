import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getAllConfigs, updateConfig, uploadRulesPdf, uploadBookRequestPdf } from '../../api/adminApi';

const configLabels = {
    max_books_per_user: {
        label: 'Max Books Per User',
        description: 'Maximum number of books a user can borrow at one time',
        suffix: 'books'
    },
    loan_period_days: {
        label: 'Loan Period',
        description: 'Default number of days a book can be borrowed',
        suffix: 'days'
    },
    fine_per_day: {
        label: 'Fine Per Day',
        description: 'Fine amount charged per day for overdue books',
        suffix: 'Rs.'
    },
    reminder_days_before: {
        label: 'Reminder Days Before',
        description: 'Number of days before due date to send reminder',
        suffix: 'days'
    },
    fine_system_enabled: {
        label: 'Fine System',
        description: 'Enable or disable automatic fine generation on overdue returns',
        suffix: ''
    }
};

const AdminConfig = () => {
    const [configs, setConfigs] = useState([]);
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const [saved, setSaved] = useState('');
    const [showToggleConfirm, setShowToggleConfirm] = useState(false);
    const [uploading, setUploading] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({ rules: null, 'book-request': null });
    const [confirmUpload, setConfirmUpload] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState('');


    const fetchConfigs = async () => {
        try {
            const res = await getAllConfigs();
            setConfigs(res.data);
            const vals = {};
            res.data.forEach(c => { vals[c.configKey] = c.configValue; });
            setValues(vals);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConfigs(); }, []);

    const handleSave = async (key) => {
        setSaving(key);
        setSaved('');
        try {
            await updateConfig(key, values[key]);
            setSaved(key);
            setTimeout(() => setSaved(''), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving('');
        }
    };

    const handleToggleFineSystem = async () => {
        const newValue = values['fine_system_enabled'] === 'true' ? 'false' : 'true';
        setSaving('fine_system_enabled');
        try {
            await updateConfig('fine_system_enabled', newValue);
            setValues({ ...values, fine_system_enabled: newValue });
            setSaved('fine_system_enabled');
            setTimeout(() => setSaved(''), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving('');
            setShowToggleConfirm(false);
        }
    };

    const handleFileSelect = (type, file) => {
        if (!file) return;
        setSelectedFiles({ rules: null, 'book-request': null, [type]: file });
        setConfirmUpload(null);
        setUploadSuccess('');
    };

    const handleUpload = async () => {
        const type = confirmUpload;
        const file = selectedFiles[type];
        if (!file) return;

        setUploading(type);
        setConfirmUpload(null);
        try {
            if (type === 'rules') await uploadRulesPdf(file);
            else await uploadBookRequestPdf(file);
            setUploadSuccess(type);
            setSelectedFiles(prev => ({ ...prev, [type]: null }));
            setTimeout(() => setUploadSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading('');
        }
    };

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">System Config</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Configure library rules and settings
                    </p>
                </div>

                {/* Config Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {configs
                        .filter(c => c.configKey !== 'fine_system_enabled'
                            && c.configKey !== 'rules_pdf_path'
                            && c.configKey !== 'book_request_pdf_path')
                        .map((config) => {
                            const meta = configLabels[config.configKey] || {
                                label: config.configKey,
                                description: '',
                                suffix: ''
                            };

                            return (
                                <div
                                    key={config.configKey}
                                    className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 bg-opacity-40 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Settings size={20} className="text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-text-primary font-semibold text-sm">
                                                {meta.label}
                                            </p>
                                            <p className="text-text-secondary text-xs mt-0.5">
                                                {meta.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={values[config.configKey] || ''}
                                                onChange={(e) => setValues({
                                                    ...values,
                                                    [config.configKey]: e.target.value
                                                })}
                                                className="w-full bg-sidebar border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <span className="text-text-secondary text-sm min-w-fit">
                                            {meta.suffix}
                                        </span>
                                        <Button
                                            onClick={() => handleSave(config.configKey)}
                                            disabled={saving === config.configKey}
                                            size="sm"
                                        >
                                            <Save size={14} />
                                            {saving === config.configKey
                                                ? 'Saving...'
                                                : saved === config.configKey
                                                    ? 'Saved!'
                                                    : 'Save'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Fine System Toggle */}
                <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between col-span-full">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Settings size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-text-primary font-semibold text-sm">Fine System</p>
                            <p className="text-text-secondary text-xs mt-0.5">
                                Enable or disable automatic fine generation on overdue returns
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold ${values['fine_system_enabled'] === 'true' ? 'text-success' : 'text-text-secondary'}`}>
                            {values['fine_system_enabled'] === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                            onClick={() => setShowToggleConfirm(true)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${values['fine_system_enabled'] === 'true' ? 'bg-success' : 'bg-border'
                                }`}
                        >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${values['fine_system_enabled'] === 'true' ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* PDF Configs */}
                {/* PDF Configs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { type: 'book-request', label: 'Book Request Form PDF', description: 'Upload updated request form (replaces existing file)' },
                        { type: 'rules', label: 'Library Rules PDF', description: 'Upload updated rules document (replaces existing file)' },
                    ].map(({ type, label, description }) => (
                        <div key={type} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-opacity-40 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Settings size={20} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-semibold text-sm">{label}</p>
                                    <p className="text-text-secondary text-xs mt-0.5">{description}</p>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 border border-dashed border-border hover:border-accent/50 rounded-lg px-4 py-3 cursor-pointer transition-colors">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(type, e.target.files[0])}
                                />
                                <span className="text-xs text-text-secondary flex-1 truncate">
                                    {selectedFiles[type] ? selectedFiles[type].name : 'Choose a PDF file...'}
                                </span>
                                <span className="text-xs text-accent font-semibold shrink-0">Browse</span>
                            </label>

                            {selectedFiles[type] && confirmUpload !== type && (
                                <Button size="sm" onClick={() => setConfirmUpload(type)}>
                                    <Save size={14} /> Upload
                                </Button>
                            )}

                            {confirmUpload === type && (
                                <div className="border border-border rounded-lg px-4 py-3 flex flex-col gap-3">
                                    <p className="text-text-secondary text-xs">
                                        Replace the existing <span className="text-text-primary font-medium">{label}</span> with <span className="text-text-primary font-medium">{selectedFiles[type]?.name}</span>?
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleUpload} disabled={uploading === type}>
                                            {uploading === type ? 'Uploading...' : 'Confirm'}
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => { setConfirmUpload(null); setSelectedFiles(prev => ({ ...prev, [type]: null })); }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {uploadSuccess === type && (
                                <p className="text-success text-xs">Uploaded successfully!</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Confirmation Dialog */}
                {showToggleConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-surface border border-border rounded-xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-xl">
                            <h2 className="text-text-primary font-bold text-lg">
                                {values['fine_system_enabled'] === 'true' ? 'Disable Fine System?' : 'Enable Fine System?'}
                            </h2>
                            <p className="text-text-secondary text-sm">
                                {values['fine_system_enabled'] === 'true'
                                    ? 'Fines will no longer be generated when books are returned overdue. Existing fines are not affected.'
                                    : 'Fines will be automatically generated when books are returned after their due date.'
                                }
                            </p>
                            <div className="flex gap-3 pt-1">
                                <Button
                                    className="flex-1"
                                    onClick={handleToggleFineSystem}
                                    disabled={saving === 'fine_system_enabled'}
                                >
                                    {saving === 'fine_system_enabled' ? 'Saving...' : 'Confirm'}
                                </Button>
                                <Button variant="secondary" onClick={() => setShowToggleConfirm(false)}>
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

export default AdminConfig;