import { useState, useMemo } from 'react';
import '../../styles/components/MyTaskModal.css';
import useTaskManager from '../../hooks/useTaskManager';
import { useTasks } from '../../context/TasksContext';
import { useAcceptedTasks } from '../../context/AcceptedTasksContext';
import { CURRENT_USER_ID } from '../../constants/mockUser';
import Toolbar from '../toolbar/Toolbar';
import TaskGrid from '../task/TaskGrid';
import CreateEditForm from '../task/CreateEditForm';

function MyTaskModal() {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();

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

  const { acceptedIds, cancelTask } = useAcceptedTasks();
  const [questSource, setQuestSource] = useState(null);
  const [questCategory, setQuestCategory] = useState(null);
  const [questSort, setQuestSort] = useState('');
  const [cancelledQuestIds, setCancelledQuestIds] = useState(new Set());

  const handleCancelQuest = (id) => {
    cancelTask(id);
    setCancelledQuestIds((prev) => new Set([...prev, id]));
  };

  const filteredQuest = useMemo(() => {
    let result = tasks.filter((t) => {
      if (t.type !== 'p2p' && t.type !== 'community') return false;
      if (cancelledQuestIds.has(t.id)) return false;
      const iExplicitlyAccepted = acceptedIds.has(t.id);
      const isAssignedToMe = t.assignee?.id === CURRENT_USER_ID;
      return iExplicitlyAccepted || isAssignedToMe;
    });
    if (questSource) result = result.filter((t) => t.type === questSource);
    if (questCategory && questSource !== 'p2p') result = result.filter((t) => t.category === questCategory);
    if (questSort === 'reward-high') result.sort((a, b) => b.rewardCoins - a.rewardCoins);
    if (questSort === 'reward-low') result.sort((a, b) => a.rewardCoins - b.rewardCoins);
    if (questSort === 'timelimit-long') result.sort((a, b) => b.timeLimit - a.timeLimit);
    if (questSort === 'timelimit-short') result.sort((a, b) => a.timeLimit - b.timeLimit);
    if (questSort === 'expiry-early') result.sort((a, b) => new Date(a.expiredAt) - new Date(b.expiredAt));
    if (questSort === 'expiry-late') result.sort((a, b) => new Date(b.expiredAt) - new Date(a.expiredAt));
    return result;
  }, [tasks, questSource, questCategory, questSort, cancelledQuestIds, acceptedIds]);

  const handleQuestSourceFilter = (source) => {
    const next = questSource === source ? null : source;
    setQuestSource(next);
    if (next === 'p2p') setQuestCategory(null);
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
        onClick={() => setActiveSubTab('created')}
      >
        Created
      </button>
      <button
        className={`subtab-btn ${activeSubTab === 'quest' ? 'subtab-btn--active' : ''}`}
        onClick={() => setActiveSubTab('quest')}
      >
        Quest
      </button>
    </div>
  );

  return (
    <>
      {activeSubTab === 'created' && (
        <>
          <div className="mytask-toolbar-row">
            {(isEditMode || isDeleteMode) && (
              <p className="mode-hint">
                {isEditMode
                  ? '✏ Move cursor to the card to edit'
                  : '🗑 Move cursor to the card to delete'}
              </p>
            )}
            {subtabButtons}
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
          </div>

          <TaskGrid
            tasks={filteredTasks}
            taskType="mytask"
            isCreatorView={true}
            onCreateClick={handleCreate}
            isEditMode={isEditMode}
            isDeleteMode={isDeleteMode}
            onEditCard={handleEdit}
            onDeleteCard={deleteTask}
            onUpdateCard={updateTask}
          />
        </>
      )}

      {activeSubTab === 'quest' && (
        <>
          <div className="mytask-toolbar-row">
            {subtabButtons}
            <Toolbar
              taskType="quest"
              questMode
              filterStatus="all"
              onFilterChange={() => {}}
              sortBy={questSort}
              onSortChange={setQuestSort}
              sourceFilter={questSource}
              onSourceFilter={handleQuestSourceFilter}
              categoryFilter={questSource !== 'p2p' ? questCategory : null}
              onCategoryFilter={(cat) => setQuestCategory((prev) => (prev === cat ? null : cat))}
              onHelpClick={() => setShowHelp(true)}
            />
          </div>

          {filteredQuest.length === 0 ? (
            <div className="quest-empty-state">
              <p className="quest-empty-title">No active quests</p>
              <p className="quest-empty-sub">Accept tasks from the P2P or Community tab to see them here.</p>
            </div>
          ) : (
            <TaskGrid
              tasks={filteredQuest}
              taskType="quest"
              acceptedIds={acceptedIds}
              onCancelCard={handleCancelQuest}
            />
          )}
        </>
      )}

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
