import { useState } from 'react';
import useTaskManager from '../../hooks/useTaskManager';
import { mockTasks } from '../../data/mockTasks';
import Toolbar from '../toolbar/Toolbar';
import TaskGrid from '../task/TaskGrid';

const communityData = mockTasks.filter((t) => t.type === 'community');

function CommunityModal() {
  const {
    filteredTasks,
    filterStatus, setFilterStatus,
    sortBy, setSortBy,
  } = useTaskManager(communityData);

  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Toolbar
        taskType="community"
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onHelpClick={() => setShowHelp(true)}
      />

      <TaskGrid
        tasks={filteredTasks}
        taskType="community"
      />

      {showHelp && (
        <div className="task-modal-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="task-modal-help-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="task-modal-help-title">How Community Tasks Works</h3>
            <ul className="task-modal-help-list">
              <li>Browse tasks created by GrowFriend admins</li>
              <li>Click Details then Accept to take a task</li>
              <li>Community tasks have a difficulty rating</li>
              <li>Higher difficulty means higher reward</li>
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

export default CommunityModal;
