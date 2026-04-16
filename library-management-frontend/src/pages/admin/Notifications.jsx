import { useState, useEffect } from 'react';
import { Bell, Send, AlertTriangle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import {
    getAllNotifications, triggerReminders, triggerOverdue
} from '../../api/adminApi';
import { formatDateTime } from '../../utils/helpers';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState('');
    const [message, setMessage] = useState('');

    const fetchNotifications = async () => {
        try {
            const res = await getAllNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleTriggerReminders = async () => {
        setTriggering('reminders');
        setMessage('');
        try {
            const res = await triggerReminders();
            setMessage(res.data);
            fetchNotifications();
        } catch (err) {
            setMessage('Failed to trigger reminders');
        } finally {
            setTriggering('');
        }
    };

    const handleTriggerOverdue = async () => {
        setTriggering('overdue');
        setMessage('');
        try {
            const res = await triggerOverdue();
            setMessage(res.data);
            fetchNotifications();
        } catch (err) {
            setMessage('Failed to trigger overdue alerts');
        } finally {
            setTriggering('');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'due_reminder': return 'text-warning bg-amber-900 bg-opacity-30';
            case 'overdue': return 'text-danger bg-red-900 bg-opacity-30';
            case 'issued': return 'text-success bg-green-900 bg-opacity-30';
            case 'returned': return 'text-blue-400 bg-blue-900 bg-opacity-30';
            case 'fine': return 'text-orange-400 bg-orange-900 bg-opacity-30';
            default: return 'text-text-secondary bg-surface';
        }
    };

    const columns = [
        { header: 'User', key: 'userName' },
        { header: 'Staff No.', key: 'staffNumber' },
        {
            header: 'Type',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(row.type)}`}>
                    {row.type?.replace('_', ' ')}
                </span>
            )
        },
        { header: 'Message', render: (row) => (
            <span className="text-text-secondary text-xs line-clamp-2">{row.message}</span>
        )},
        {
            header: 'Sent',
            render: (row) => (
                <span className={row.isSent ? 'text-success text-xs' : 'text-danger text-xs'}>
                    {row.isSent ? 'Yes' : 'No'}
                </span>
            )
        },
        { header: 'Sent At', render: (row) => (
            <span className="text-text-secondary text-xs">{formatDateTime(row.sentAt)}</span>
        )},
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">Notifications</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            Manage and trigger system notifications
                        </p>
                    </div>
                </div>

                {/* Manual Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-900 bg-opacity-50 rounded-lg flex items-center justify-center">
                                <Bell size={18} className="text-warning" />
                            </div>
                            <div>
                                <p className="text-text-primary font-semibold text-sm">Due Reminders</p>
                                <p className="text-text-secondary text-xs mt-0.5">
                                    Send reminders for books due tomorrow
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleTriggerReminders}
                            disabled={triggering === 'reminders'}
                            size="sm"
                        >
                            <Send size={14} />
                            {triggering === 'reminders' ? 'Sending...' : 'Trigger'}
                        </Button>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-900 bg-opacity-50 rounded-lg flex items-center justify-center">
                                <AlertTriangle size={18} className="text-danger" />
                            </div>
                            <div>
                                <p className="text-text-primary font-semibold text-sm">Overdue Alerts</p>
                                <p className="text-text-secondary text-xs mt-0.5">
                                    Mark and alert all overdue books
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="danger"
                            onClick={handleTriggerOverdue}
                            disabled={triggering === 'overdue'}
                            size="sm"
                        >
                            <AlertTriangle size={14} />
                            {triggering === 'overdue' ? 'Processing...' : 'Trigger'}
                        </Button>
                    </div>
                </div>

                {/* Result Message */}
                {message && (
                    <div className="bg-surface border border-border rounded-lg px-4 py-3">
                        <p className="text-success text-sm">{message}</p>
                    </div>
                )}

                {/* Notifications Table */}
                <Card title={`All Notifications (${notifications.length})`}>
                    <Table
                        columns={columns}
                        data={notifications}
                        emptyMessage="No notifications yet"
                    />
                </Card>

            </div>
        </Layout>
    );
};

export default AdminNotifications;