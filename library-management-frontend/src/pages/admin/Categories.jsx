import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { getAllCategories, addCategory, deleteCategory } from '../../api/adminApi';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await getAllCategories();
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Category name is required');
            return;
        }
        setSaving(true);
        try {
            await addCategory({ name: name.trim() });
            setShowModal(false);
            setName('');
            setError('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Delete this category? Books under this category may be affected.')) return;
        try {
            await deleteCategory(categoryId);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data || 'Cannot delete category');
        }
    };

    const columns = [
        { header: '#', render: (row, i) => i + 1 },
        { header: 'Category Name', key: 'name' },
        {
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => handleDelete(row.categoryId)}
                    className="text-text-secondary hover:text-danger transition-colors"
                >
                    <Trash2 size={15} />
                </button>
            )
        }
    ];

    if (loading) return <Layout><Loader /></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold">Categories</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            Manage book categories
                        </p>
                    </div>
                    <Button onClick={() => { setName(''); setError(''); setShowModal(true); }}>
                        <Plus size={15} /> Add Category
                    </Button>
                </div>

                <Card>
                    <Table
                        columns={columns}
                        data={categories}
                        emptyMessage="No categories found"
                    />
                </Card>

            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Add Category"
                size="sm"
            >
                <div className="flex flex-col gap-4">
                    <Input
                        label="Category Name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        placeholder="e.g. Science, Fiction, History"
                        required
                        error={error}
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : 'Add Category'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default AdminCategories;