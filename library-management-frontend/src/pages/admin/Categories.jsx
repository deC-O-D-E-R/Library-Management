import { useState, useEffect } from 'react';
import { Plus, Pencil } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { getAllCategories, addCategory, updateCategory } from '../../api/adminApi';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);

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
            if (editId) {
                await updateCategory(editId, { name: name.trim() });
            } else {
                await addCategory({ name: name.trim() });
            }

            setShowModal(false);
            setName('');
            setEditId(null);
            setError('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { header: '#', render: (row, i) => i + 1 },
        { header: 'Category Name', key: 'name' },
        {
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => {
                        setEditId(row.categoryId);
                        setName(row.name);
                        setError('');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-1 text-text-secondary hover:text-accent transition-colors"
                >
                    <span>Edit</span>
                    <Pencil size={15} />
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
                    <Button onClick={() => { setName(''); setError(''); setEditId(null); setShowModal(true); }}>
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
                title={editId ? "Edit Category" : "Add Category"}
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
                            {saving
                                ? 'Saving...'
                                : editId
                                    ? 'Update Category'
                                    : 'Add Category'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default AdminCategories;