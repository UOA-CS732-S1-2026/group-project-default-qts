import {useState} from 'react';
import useTaskManager from '../../hooks/useTaskManager';
import {mockTasks} from '../../data/mockTasks';
import Toolbar from '../toolbar/Toolbar';
import TaskGrid from '../task/TaskGrid';

const p2pData = mockTasks.filter((t) => t.type === 'p2p');

function P2PModal() {
  const {
    filteredTasks,
    filterStatus, setFilterStatus,
    sortBy, setSortBy,
  } = useTaskManager(p2pData);

  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Toolbar
        taskType="p2p"
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onHelpClick={() => setShowHelp(true)}
      />

      <TaskGrid
        tasks={filteredTasks}
        taskType="p2p"
      />

      {showHelp && (
        <div className="task-modal-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="task-modal-help-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="task-modal-help-title">How P2P Tasks Works</h3>
            <ul className="task-modal-help-list">
              <li>Browse tasks created by other players</li>
              <li>Click Details then Accept to take a task</li>
              <li>Filter by status to find open tasks</li>
              <li>Sort by reward to find the best tasks</li>
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

export default P2PModal;
