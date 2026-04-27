import { useState, useMemo, useEffect } from 'react';
import '../../styles/components/MyTaskModal.css';
import useTaskManager from '../../hooks/useTaskManager';
import { useTasks } from '../../context/TasksContext';
import { useAcceptedTasks } from '../../context/AcceptedTasksContext';
import { CURRENT_USER_ID } from '../../constants/mockUser';
import Toolbar from '../toolbar/Toolbar';
import loadIconSmall from '../../assets/load-icon-small.png';
import TaskGrid from '../task/TaskGrid';
import CreateEditForm from '../task/CreateEditForm';

const devToggleStyle = {
  position: 'fixed', bottom: 12, right: 12,
  fontSize: 10, opacity: 0.35, padding: '2px 6px',
  cursor: 'pointer', zIndex: 9999,
};

function MyTaskModal({ onNavigate }) {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const [isLoadingCreated, setIsLoadingCreated] = useState(true);
  const [isLoadingQuest, setIsLoadingQuest] = useState(false);
  const [error, setError] = useState(false); // set to true to test error UI

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
  } = useTaskManager(createdTasks);

  const [activeSubTab, setActiveSubTab] = useState('created');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const { acceptedIds, cancelTask, submittedIds, submitTask } = useAcceptedTasks();
  const [questSource, setQuestSource] = useState(null);
  const [questStatus, setQuestStatus] = useState(null);
  const [questCategory, setQuestCategory] = useState(null);
  const [questSort, setQuestSort] = useState('');
  const [cancelledQuestIds, setCancelledQuestIds] = useState(new Set());

  const fetchData = () => {
    setError(false);
    setIsLoadingCreated(true);
    setIsLoadingQuest(true);
    // TODO: replace setTimeout with axios.get('/api/tasks') when integrating backend
    setTimeout(() => {
      setIsLoadingCreated(false);
      setIsLoadingQuest(false);
    }, 1000);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    if (tab === 'created' && !isLoadingCreated) {
      setIsLoadingCreated(true);
      setTimeout(() => setIsLoadingCreated(false), 1000);
    } else if (tab === 'quest' && !isLoadingQuest) {
      setIsLoadingQuest(true);
      setTimeout(() => setIsLoadingQuest(false), 1000);
    }
  };

  const handleCancelQuest = (id) => {
    cancelTask(id);
    setCancelledQuestIds((prev) => new Set([...prev, id]));
    const task = tasks.find((t) => t.id === id);
    if (task?.type === 'p2p') {
      updateTask(id, { status: 'cancelled', assignee: null });
    }
    // community: no global status change — other players are unaffected
  };

  const handleUpdateCard = (id, fields) => {
    updateTask(id, fields);
    if (fields.status === 'open' && fields.assignee === null) {
      cancelTask(id);
    }
  };

  const handleQuestUpdate = (id, fields) => {
    const task = tasks.find((t) => t.id === id);
    // Community tasks: track submission locally only — never change global status
    // (multiple players can accept the same task; one submit must not affect others)
    if (task?.type === 'community' && fields.status === 'pending_review') {
      submitTask(id);
    } else {
      updateTask(id, fields);
    }
  };

  const ACTIVE_QUEST_STATUSES = ['open', 'active', 'pending_review', 'disputed'];

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
      result = result.filter((t) => t.status === 'pending_review' || submittedIds.has(t.id));
    } else if (questStatus === 'active') {
      // Community tasks stay 'open' globally when locally accepted — match both
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

  const handleFormSubmit = (taskData) => {
    if (editingTask) {
      updateTask(taskData.id, taskData);
    } else {
      createTask(taskData);
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
      <button className="task-error-retry" onClick={fetchData}>Try Again</button>
    </div>
  );

  const renderContent = () => {
    if (error) return errorState;

    if (activeSubTab === 'created') {
      if (isLoadingCreated) return skeletonLoader;
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
      />
    );
  };

  return (
    <>
      <div className="mytask-toolbar-row">
        {subtabButtons}
        {!isLoadingCreated && !error && activeSubTab === 'created' && (
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

      {activeSubTab === 'created' && (isEditMode || isDeleteMode) && !isLoadingCreated && !error && (
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

      {process.env.NODE_ENV === 'development' && (
        <button style={devToggleStyle} onClick={() => setError((e) => !e)}>
          Toggle Error
        </button>
      )}
    </>
  );
}

export default MyTaskModal;
