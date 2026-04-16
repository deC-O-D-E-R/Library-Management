import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getAllConfigs, updateConfig } from '../../api/adminApi';

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
    }
};

const AdminConfig = () => {
    const [configs, setConfigs] = useState([]);
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const [saved, setSaved] = useState('');

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
                    {configs.map((config) => {
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

            </div>
        </Layout>
    );
};

export default AdminConfig;