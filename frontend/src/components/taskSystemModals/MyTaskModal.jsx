import { useState, useMemo, useEffect, useRef } from 'react';
import '../../styles/components/MyTaskModal.css';
import useTaskManager from '../../hooks/useTaskManager';
import { useTasks } from '../../context/TasksContext';
import { useAcceptedTasks } from '../../context/AcceptedTasksContext';
import { CURRENT_USER_ID } from '../../constants/mockUser';
import { STATUS_B2F } from '../../utils/taskMapper';
import Toolbar from '../toolbar/Toolbar';
import loadIconSmall from '../../assets/load-icon-small.png';
import TaskGrid from '../task/TaskGrid';
import CreateEditForm from '../task/CreateEditForm';

function MyTaskModal({ onNavigate, questTargetId }) {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();

  // Quest tab has its own loading state for the "navigate to quest" animation only.
  const [isLoadingQuest, setIsLoadingQuest] = useState(false);
  const [error] = useState(false);

  const createdTasks = useMemo(() =>
    tasks.filter((t) =>
      t.type === 'mytask' ||
      (t.type === 'p2p' && t.createdBy?.id === CURRENT_USER_ID)
    ), [tasks]);

  const {
    filteredTasks,
    filterStatus, setFilterStatus,
    sortBy, setSortBy,
    isEditMode, toggleEditMode,
    isDeleteMode, toggleDeleteMode,
    resetModes,
  } = useTaskManager(createdTasks);

  const [activeSubTab, setActiveSubTab] = useState('created');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const handledTargetRef = useRef(null);

  useEffect(() => {
    if (questTargetId && questTargetId !== handledTargetRef.current) {
      handledTargetRef.current = questTargetId;
      setActiveSubTab('quest');
      setIsLoadingQuest(true);
      setExpandedTaskId(questTargetId);
      setTimeout(() => {
        setIsLoadingQuest(false);
        setTimeout(() => setExpandedTaskId(null), 50);
      }, 1000);
    }
  }, [questTargetId]);

  const { acceptedIds, cancelTask, submittedIds, submitTask } = useAcceptedTasks();
  const [questSource, setQuestSource] = useState(null);
  const [questStatus, setQuestStatus] = useState(null);
  const [questCategory, setQuestCategory] = useState(null);
  const [questSort, setQuestSort] = useState('');
  const [cancelledQuestIds, setCancelledQuestIds] = useState(new Set());

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    resetModes();
  };

  // P2P: withdraw application via API (pessimistic in AcceptedTasksContext).
  // Community: direct assignment — no application to withdraw, clean up local state only.
  const handleCancelQuest = async (id) => {
    const task = tasks.find((t) => t.id === id);
    try {
      await cancelTask(id, task?.type);
    } catch {
      // Withdrawal failed (e.g. application already accepted) — still hide from quest view
    }
    setCancelledQuestIds((prev) => new Set([...prev, id]));
  };

  const handleUpdateCard = (id, fields) => {
    updateTask(id, fields);
    if (fields.status === 'open' && fields.assignee === null) {
      cancelTask(id);
    }
  };

  // Submit action: call API and sync returned task status to local state.
  // All other field updates are local-only (no PATCH endpoint in backend yet).
  const handleQuestUpdate = async (id, fields) => {
    if (fields.status === 'pending_review') {
      try {
        const data = await submitTask(id);
        if (data?.task?.status) {
          updateTask(id, { status: STATUS_B2F[data.task.status] ?? data.task.status });
        }
      } catch {
        // Submit failed — task stays in current state
      }
    } else {
      updateTask(id, fields);
    }
  };

  const ACTIVE_QUEST_STATUSES = ['open', 'active', 'pending_confirmation', 'pending_review', 'disputed'];

  const filteredQuest = useMemo(() => {
    let result = tasks.filter((t) => {
      if (t.type !== 'p2p' && t.type !== 'community') return false;
      if (cancelledQuestIds.has(t.id)) return false;
      if (!ACTIVE_QUEST_STATUSES.includes(t.status)) return false;
      const iExplicitlyAccepted = acceptedIds.has(t.id);
      const isAssignedToMe = t.assignee?.id === CURRENT_USER_ID;
      return iExplicitlyAccepted || isAssignedToMe;
    });
    if (questSource) result = result.filter((t) => t.type === questSource);
    if (questStatus === 'pending_review') {
      result = result.filter((t) =>
        t.status === 'pending_review' ||
        t.status === 'pending_confirmation'
      );
    } else if (questStatus === 'active') {
      result = result.filter((t) => t.status === 'active' || (t.status === 'open' && acceptedIds.has(t.id)));
    } else if (questStatus) {
      result = result.filter((t) => t.status === questStatus);
    }
    if (questCategory && questSource !== 'p2p') result = result.filter((t) => t.category === questCategory);
    if (questSort === 'reward-high') result.sort((a, b) => b.rewardCoins - a.rewardCoins);
    if (questSort === 'reward-low') result.sort((a, b) => a.rewardCoins - b.rewardCoins);
    if (questSort === 'timelimit-long') result.sort((a, b) => b.timeLimit - a.timeLimit);
    if (questSort === 'timelimit-short') result.sort((a, b) => a.timeLimit - b.timeLimit);
    if (questSort === 'expiry-early') result.sort((a, b) => new Date(a.expiredAt) - new Date(b.expiredAt));
    if (questSort === 'expiry-late') result.sort((a, b) => new Date(b.expiredAt) - new Date(a.expiredAt));
    return result;
  }, [tasks, questSource, questStatus, questCategory, questSort, cancelledQuestIds, acceptedIds, submittedIds]);

  const handleQuestSourceFilter = (source) => {
    const next = questSource === source ? null : source;
    setQuestSource(next);
    if (next === 'p2p') setQuestCategory(null);
  };

  const handleQuestStatusFilter = (status) => {
    setQuestStatus(status === 'all' ? null : status);
  };

  const handleCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = async (taskData) => {
    if (editingTask) {
      updateTask(taskData.id, taskData);
    } else {
      try {
        await createTask(taskData);
      } catch {
        // Creation failed — form stays open, user can retry
      }
    }
  };

  const subtabButtons = (
    <div className="subtab-row">
      <button
        className={`subtab-btn ${activeSubTab === 'created' ? 'subtab-btn--active' : ''}`}
        onClick={() => handleSubTabChange('created')}
      >
        Created
      </button>
      <button
        className={`subtab-btn ${activeSubTab === 'quest' ? 'subtab-btn--active' : ''}`}
        onClick={() => handleSubTabChange('quest')}
      >
        Quest
      </button>
    </div>
  );

  const skeletonLoader = (
    <div className="task-loading-state">
      <img src={loadIconSmall} alt="" className="task-loading-icon" />
      <p className="task-loading-title">Loading...</p>
      <p className="task-loading-sub">Fetching tasks...</p>
    </div>
  );

  const errorState = (
    <div className="task-error-state">
      <p className="task-error-icon">⚠️</p>
      <p className="task-error-title">Oops!</p>
      <p className="task-error-msg">Failed to load tasks</p>
    </div>
  );

  const renderContent = () => {
    if (error) return errorState;

    if (activeSubTab === 'created') {
      if (isLoading) return skeletonLoader;
      if (filteredTasks.length === 0) {
        const hasFilter = filterStatus !== 'all' || sortBy !== '';
        if (hasFilter) {
          return (
            <div className="task-empty-state">
              <p className="task-empty-title">🔍 No tasks found</p>
              <p className="task-empty-sub">No tasks match the current filter.</p>
            </div>
          );
        }
        return (
          <div className="task-empty-state">
            <p className="task-empty-title">📝 No tasks created yet</p>
            <p className="task-empty-sub">Tap + to create your first task!</p>
            <button className="task-empty-create-btn" onClick={handleCreate}>+</button>
          </div>
        );
      }
      return (
        <TaskGrid
          tasks={filteredTasks}
          taskType="mytask"
          isCreatorView={true}
          onCreateClick={handleCreate}
          isEditMode={isEditMode}
          isDeleteMode={isDeleteMode}
          onEditCard={handleEdit}
          onDeleteCard={deleteTask}
          onUpdateCard={handleUpdateCard}
        />
      );
    }

    if (isLoadingQuest) return skeletonLoader;

    if (filteredQuest.length === 0) {
      const hasFilter = questStatus !== null || questSource !== null || questCategory !== null;
      if (hasFilter) {
        return (
          <div className="task-empty-state">
            <p className="task-empty-title">🔍 No quests found</p>
            <p className="task-empty-sub">No quests match the current filter.</p>
          </div>
        );
      }
      return (
        <div className="task-empty-state">
          <p className="task-empty-title">🎯 No active quests</p>
          <p className="task-empty-sub">Accept a task from P2P or System to get started!</p>
          <div className="task-empty-nav-btns">
            <button className="task-empty-nav-btn" onClick={() => onNavigate?.('p2p')}>P2P Tasks</button>
            <button className="task-empty-nav-btn" onClick={() => onNavigate?.('community')}>System Tasks</button>
          </div>
        </div>
      );
    }

    return (
      <TaskGrid
        tasks={filteredQuest}
        taskType="quest"
        acceptedIds={acceptedIds}
        submittedIds={submittedIds}
        onCancelCard={handleCancelQuest}
        onUpdateCard={handleQuestUpdate}
        expandedTaskId={expandedTaskId}
      />
    );
  };

  return (
    <>
      <div className="mytask-toolbar-row">
        {subtabButtons}
        {!isLoading && !error && activeSubTab === 'created' && (
          <Toolbar
            taskType="mytask"
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onCreateClick={handleCreate}
            isEditMode={isEditMode}
            onEditToggle={toggleEditMode}
            isDeleteMode={isDeleteMode}
            onDeleteToggle={toggleDeleteMode}
            onHelpClick={() => setShowHelp(true)}
          />
        )}
        {!isLoadingQuest && !error && activeSubTab === 'quest' && (
          <Toolbar
            taskType="quest"
            questMode
            filterStatus={questStatus}
            onFilterChange={handleQuestStatusFilter}
            sortBy={questSort}
            onSortChange={setQuestSort}
            sourceFilter={questSource}
            onSourceFilter={handleQuestSourceFilter}
            categoryFilter={questSource !== 'p2p' ? questCategory : null}
            onCategoryFilter={(cat) => setQuestCategory((prev) => (prev === cat ? null : cat))}
            onHelpClick={() => setShowHelp(true)}
          />
        )}
      </div>

      {activeSubTab === 'created' && (isEditMode || isDeleteMode) && !isLoading && !error && (
        <p className="mode-hint">
          {isEditMode
            ? '✏ Move cursor to the card to edit'
            : '🗑 Move cursor to the card to delete'}
        </p>
      )}

      {renderContent()}

      {showForm && (
        <CreateEditForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          initialData={editingTask}
        />
      )}

      {showHelp && (
        <div className="task-modal-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="task-modal-help-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="task-modal-help-title">How My Tasks Works</h3>
            <ul className="task-modal-help-list">
              <li>Create personal tasks to track your goals</li>
              <li>Click Edit mode then hover a card to edit it</li>
              <li>Click Delete mode then hover a card to delete it</li>
              <li>Filter by status to find specific tasks</li>
              <li>Sort tasks by reward, time limit, or expiry date</li>
            </ul>
            <button className="task-modal-help-close" onClick={() => setShowHelp(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MyTaskModal;
