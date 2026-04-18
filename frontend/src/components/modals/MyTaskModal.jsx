import {useState} from 'react';
import './MyTaskModal.css';
import useTaskManager from '../../hooks/useTaskManager';
import {mockTasks} from '../../data/mockTasks';
import Toolbar from '../toolbar/Toolbar';
import TaskGrid from '../task/TaskGrid';
import CreateEditForm from '../task/CreateEditForm';

const myTaskData = mockTasks.filter((t) => t.type === 'mytask');


function MyTaskModal() {
  const {
    filteredTasks,
    filterStatus, setFilterStatus,
    sortBy, setSortBy,
    isEditMode, toggleEditMode,
    isDeleteMode, toggleDeleteMode,
    createTask, updateTask, deleteTask,
  } = useTaskManager(myTaskData);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

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

  return (
    <>
      <div className="mytask-toolbar-row">
        {(isEditMode || isDeleteMode) && (
          <p className="mode-hint">
            {isEditMode
              ? '✏ Move cursor to the card to edit'
              : '🗑 Move cursor to the card to delete'}
          </p>
        )}
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
        onCreateClick={handleCreate}
        isEditMode={isEditMode}
        isDeleteMode={isDeleteMode}
        onEditCard={handleEdit}
        onDeleteCard={deleteTask}
      />

      {showForm && (
        <CreateEditForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          initialData={editingTask}
        />
      )}

      {showHelp && (
        <div className="modal-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-help-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-help-title">How My Tasks Works</h3>
            <ul className="modal-help-list">
              <li>Create personal tasks to track your goals</li>
              <li>Click Edit mode then hover a card to edit it</li>
              <li>Click Delete mode then hover a card to delete it</li>
              <li>Filter by status to find specific tasks</li>
              <li>Sort tasks by reward, time limit, or expiry date</li>
            </ul>
            <button className="modal-help-close" onClick={() => setShowHelp(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MyTaskModal;
