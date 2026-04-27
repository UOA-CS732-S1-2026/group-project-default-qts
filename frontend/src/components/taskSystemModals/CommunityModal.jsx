// Note: this file handles SystemTask (previously called Community)
import { useState, useEffect } from 'react';
import useTaskManager from '../../hooks/useTaskManager';
import { mockTasks } from '../../data/mockTasks';
import Toolbar from '../toolbar/Toolbar';
import TaskGrid from '../task/TaskGrid';
import { useAcceptedTasks } from '../../context/AcceptedTasksContext';
import loadIconSmall from '../../assets/load-icon-small.png';

const communityData = mockTasks.filter((t) => t.type === 'community');

const devToggleStyle = {
  position: 'fixed', bottom: 12, right: 12,
  fontSize: 10, opacity: 0.35, padding: '2px 6px',
  cursor: 'pointer', zIndex: 9999,
};

function CommunityModal() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false); // set to true to test error UI

  const {
    filteredTasks,
    filterStatus, setFilterStatus,
    sortBy, setSortBy,
    categoryFilter, setCategoryFilter,
  } = useTaskManager(communityData);

  const { acceptedIds, acceptTask } = useAcceptedTasks();
  const [showHelp, setShowHelp] = useState(false);

  const fetchData = () => {
    setError(false);
    setIsLoading(true);
    // TODO: replace setTimeout with axios.get('/api/tasks') when integrating backend
    setTimeout(() => setIsLoading(false), 1000);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <>
      {isLoading && (
        <div className="task-loading-state">
          <img src={loadIconSmall} alt="" className="task-loading-icon" />
          <p className="task-loading-title">Loading...</p>
          <p className="task-loading-sub">Fetching tasks...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="task-error-state">
          <p className="task-error-icon">⚠️</p>
          <p className="task-error-title">Oops!</p>
          <p className="task-error-msg">Failed to load tasks</p>
          <button className="task-error-retry" onClick={fetchData}>Try Again</button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <Toolbar
            taskType="community"
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categoryFilter={categoryFilter}
            onCategoryFilter={setCategoryFilter}
            onHelpClick={() => setShowHelp(true)}
          />

          {filteredTasks.length === 0 ? (
            <div className="task-empty-state">
              <p className="task-empty-title">🏛️ No system tasks available</p>
              <p className="task-empty-sub">New system tasks will appear here soon!</p>
            </div>
          ) : (
            <TaskGrid
              tasks={filteredTasks}
              taskType="community"
              acceptedIds={acceptedIds}
              onAcceptCard={acceptTask}
            />
          )}
        </>
      )}

      {showHelp && (
        <div className="task-modal-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="task-modal-help-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="task-modal-help-title">How System Tasks Works</h3>
            <ul className="task-modal-help-list">
              <li>Browse tasks created by GrowFriend admins</li>
              <li>Click Details then Accept to take a task</li>
              <li>System tasks have a difficulty rating</li>
              <li>Higher difficulty means higher reward</li>
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

export default CommunityModal;
