import { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import StatusBadge from '../ui/StatusBadge';
import CoinBadge from '../ui/CoinBadge';
import AdminCreateForm from './AdminCreateForm';
import AdminEditForm from './AdminEditForm';
import loadIconSmall from '../../assets/load-icon-small.png';

export default function AdminTaskList() {
    const { tasks, isLoading, error, refetch, createTask, updateTask, deleteTask } = useTasks();
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [createError, setCreateError] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const communityTasks = tasks.filter((t) => t.type === 'community');

    function getDisplayStatus(task) {
        return new Date(task.expiredAt) < new Date() ? 'expired' : 'open';
    }

    const filtered = communityTasks.filter((t) => {
        if (categoryFilter !== null && t.category !== categoryFilter) return false;
        if (statusFilter !== 'all' && getDisplayStatus(t) !== statusFilter) return false;
        return true;
    });

    function handleCategoryClick(value) {
        setCategoryFilter((prev) => (prev === value ? null : value));
    }

    async function handleCreateSubmit(taskData) {
        setIsCreating(true);
        setCreateError(null);
        try {
            await createTask(taskData);
            setShowCreateForm(false);
        } catch {
            setCreateError('Failed to create task. Please try again.');
        } finally {
            setIsCreating(false);
        }
    }

    function handleEditSubmit(fields) {
        updateTask(editTask.id, fields);
        setEditTask(null);
    }

    function handleDeleteConfirm() {
        deleteTask(confirmDeleteId);
        setConfirmDeleteId(null);
    }

    if (isLoading) {
        return (
            <div className="admin-loading-state">
                <img src={loadIconSmall} alt="" className="admin-loading-icon" />
                <p className="admin-loading-text">Loading tasks...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error-state">
                <p className="admin-error-title">⚠️ Failed to load tasks</p>
                <p className="admin-error-msg">{error}</p>
                <button className="admin-error-retry" onClick={refetch}>Try Again</button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="admin-page-title">System Task Management</h2>
            <p className="admin-page-desc">
                Manage system-wide tasks for all players. Tasks auto-expire after 5 days.
            </p>
            <p className="admin-gap-note">
                Delete is temporarily disabled because the backend endpoint does not exist yet.
            </p>

            <div className="admin-toolbar">
                <div className="admin-toolbar-filters">
                    <button
                        className={'admin-filter-btn' + (categoryFilter === null ? ' admin-filter-btn--active' : '')}
                        onClick={() => setCategoryFilter(null)}
                    >
                        All
                    </button>
                    <button
                        className={'admin-filter-btn admin-filter-btn--org' + (categoryFilter === 'organization' ? ' admin-filter-btn--active' : '')}
                        onClick={() => handleCategoryClick('organization')}
                    >
                        Organization
                    </button>
                    <button
                        className={'admin-filter-btn admin-filter-btn--act' + (categoryFilter === 'activity' ? ' admin-filter-btn--active' : '')}
                        onClick={() => handleCategoryClick('activity')}
                    >
                        Activity
                    </button>
                    <select
                        className="admin-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                <button className="admin-create-btn" onClick={() => setShowCreateForm(true)}>
                    + Create Task
                </button>
            </div>

            <p className="admin-task-count">Showing {filtered.length} tasks</p>

            {filtered.length === 0 ? (
                <div className="admin-empty-state">
                    <p className="admin-empty-title">No system tasks found</p>
                    <p className="admin-empty-sub">Try adjusting your filters or create a new task.</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Difficulty</th>
                                <th>Reward</th>
                                <th>Accepted</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((task) => (
                                <tr key={task.id}>
                                    <td>{task.title}</td>
                                    <td>
                                        <span className={`admin-category-badge admin-category-badge--${task.category}`}>
                                            {task.category === 'organization'
                                                ? 'Organization'
                                                : task.category === 'activity'
                                                ? 'Activity'
                                                : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`admin-difficulty-badge admin-difficulty-badge--${task.difficulty?.toLowerCase()}`}>
                                            {task.difficulty ?? '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <CoinBadge amount={task.rewardCoins} />
                                    </td>
                                    <td>
                                        <span className="admin-accepted-count">—</span>
                                    </td>
                                    <td>
                                        <StatusBadge status={getDisplayStatus(task)} />
                                    </td>
                                    <td>
                                        {new Date(task.createdAt).toLocaleDateString('en-NZ', {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </td>
                                    <td>
                                        <div className="admin-action-btns">
                                            <button
                                                className="admin-edit-btn"
                                                onClick={() => setEditTask(task)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="admin-delete-btn"
                                                disabled
                                                title="Delete endpoint not available yet"
                                                onClick={() => setConfirmDeleteId(task.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateForm && (
                <AdminCreateForm
                    onClose={() => { setShowCreateForm(false); setCreateError(null); }}
                    onSubmit={handleCreateSubmit}
                    submitError={createError}
                    isSubmitting={isCreating}
                />
            )}

            {editTask && (
                <AdminEditForm
                    task={editTask}
                    onClose={() => setEditTask(null)}
                    onSubmit={handleEditSubmit}
                />
            )}

            {confirmDeleteId && (
                <div className="admin-delete-overlay" onClick={() => setConfirmDeleteId(null)}>
                    <div className="admin-delete-dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="admin-delete-dialog-title">Delete Task?</p>
                        <p className="admin-delete-dialog-desc">
                            "{tasks.find((t) => t.id === confirmDeleteId)?.title}" will be permanently removed.
                            This cannot be undone.
                        </p>
                        <div className="admin-delete-dialog-actions">
                            <button
                                className="admin-delete-dialog-btn admin-delete-dialog-btn--confirm"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                            <button
                                className="admin-delete-dialog-btn admin-delete-dialog-btn--cancel"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
