import { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import CoinBadge from '../ui/CoinBadge';
import * as taskService from '../../services/taskService';

export default function AdminDisputeList() {
    const { tasks, updateTask } = useTasks();
    const [confirmAction, setConfirmAction] = useState(null);
    const [resolvedId, setResolvedId] = useState(null);
    const [isResolvingId, setIsResolvingId] = useState(null);
    const [resolveError, setResolveError] = useState(null);

    const disputedTasks = tasks.filter((t) => t.status === 'disputed');

    async function handleResolve(taskId, favorOf) {
        setIsResolvingId(taskId);
        setResolveError(null);
        try {
            if (favorOf === 'creator') {
                await taskService.cancelTask(taskId);
            } else {
                await taskService.confirmTask(taskId);
            }
            updateTask(taskId, { status: favorOf === 'creator' ? 'cancelled' : 'completed' });
            setResolvedId(taskId);
            setConfirmAction(null);
            setTimeout(() => setResolvedId(null), 1200);
        } catch {
            setResolveError('Failed to resolve dispute. Please try again.');
            setConfirmAction(null);
        } finally {
            setIsResolvingId(null);
        }
    }

    return (
        <div>
            <h2 className="admin-page-title">Dispute Management</h2>
            <p className="admin-page-desc">
                Review and resolve disputes raised by players on P2P tasks.
            </p>

            {resolveError && (
                <div className="admin-error-banner">
                    <span>{resolveError}</span>
                    <button className="admin-error-banner-close" onClick={() => setResolveError(null)}>✕</button>
                </div>
            )}

            <p className="admin-dispute-count">{disputedTasks.length} active disputes</p>

            {disputedTasks.length === 0 ? (
                <div className="admin-empty-state">
                    <p className="admin-empty-title">No active disputes</p>
                    <p className="admin-empty-sub">All clear for now. The backend dispute flow is not connected yet, so this view may stay empty.</p>
                </div>
            ) : (
                <div className="admin-dispute-list">
                    <div className="admin-dispute-list-header">
                        <span className="admin-dispute-col admin-dispute-col--title">Task</span>
                        <span className="admin-dispute-col admin-dispute-col--reward">Reward</span>
                        <span className="admin-dispute-col admin-dispute-col--creator">Creator</span>
                        <span className="admin-dispute-col admin-dispute-col--assignee">Assignee</span>
                        <span className="admin-dispute-col admin-dispute-col--raised">Raised By</span>
                        <span className="admin-dispute-col admin-dispute-col--reason">Reason</span>
                        <span className="admin-dispute-col admin-dispute-col--actions">Actions</span>
                    </div>

                    {disputedTasks.map((task) => (
                        <div className="admin-dispute-row" key={task.id}>
                            <span className="admin-dispute-col admin-dispute-col--title">
                                {task.title}
                            </span>
                            <span className="admin-dispute-col admin-dispute-col--reward">
                                <CoinBadge amount={task.rewardCoins} />
                            </span>
                            <span className="admin-dispute-col admin-dispute-col--creator">
                                {task.createdBy.name}
                            </span>
                            <span className="admin-dispute-col admin-dispute-col--assignee">
                                {task.assignee?.name ?? 'Unknown'}
                            </span>
                            <span className="admin-dispute-col admin-dispute-col--raised">
                                {task.disputeRaisedBy ? (
                                    <span className={`admin-dispute-raised-by admin-dispute-raised-by--${task.disputeRaisedBy}`}>
                                        {task.disputeRaisedBy === 'creator' ? 'Creator' : 'Assignee'}
                                    </span>
                                ) : (
                                    <span className="admin-dispute-raised-by admin-dispute-raised-by--unknown">Unknown</span>
                                )}
                            </span>
                            <span className="admin-dispute-col admin-dispute-col--reason">
                                {task.disputeReason ?? <em className="admin-dispute-no-reason">No reason provided</em>}
                                {task.disputeDetails && (
                                    <span className="admin-dispute-reason-details"> — {task.disputeDetails}</span>
                                )}
                            </span>
                            <span className="admin-dispute-col admin-dispute-col--actions">
                                <button
                                    className="admin-dispute-btn admin-dispute-btn--creator"
                                    disabled={isResolvingId === task.id}
                                    onClick={() => setConfirmAction({ taskId: task.id, favorOf: 'creator' })}
                                >
                                    {isResolvingId === task.id ? '...' : 'Favor Creator'}
                                </button>
                                <button
                                    className="admin-dispute-btn admin-dispute-btn--assignee"
                                    disabled={isResolvingId === task.id}
                                    onClick={() => setConfirmAction({ taskId: task.id, favorOf: 'assignee' })}
                                >
                                    {isResolvingId === task.id ? '...' : 'Favor Assignee'}
                                </button>
                            </span>

                            {confirmAction !== null && confirmAction.taskId === task.id && (
                                <div className="admin-dispute-confirm-overlay">
                                    <p className="admin-dispute-confirm-text">
                                        {confirmAction.favorOf === 'creator'
                                            ? 'Favor Creator — task cancelled, coins returned.'
                                            : 'Favor Assignee — task completed, coins sent.'}
                                    </p>
                                    <div className="admin-dispute-confirm-actions">
                                        <button
                                            className="admin-dispute-confirm-btn admin-dispute-confirm-btn--yes"
                                            disabled={isResolvingId === task.id}
                                            onClick={() => handleResolve(task.id, confirmAction.favorOf)}
                                        >
                                            Yes, Resolve
                                        </button>
                                        <button
                                            className="admin-dispute-confirm-btn admin-dispute-confirm-btn--no"
                                            onClick={() => setConfirmAction(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {resolvedId === task.id && (
                                <div className="admin-dispute-resolved-toast">
                                    <span className="admin-dispute-resolved-icon">✓</span>
                                    <span className="admin-dispute-resolved-text">Resolved</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
