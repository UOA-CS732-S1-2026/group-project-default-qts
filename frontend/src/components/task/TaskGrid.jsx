import TaskCard from './TaskCard';
import '../../styles/components/TaskGrid.css';

function TaskGrid({
  tasks,
  taskType,
  onCreateClick,
  isEditMode = false,
  isDeleteMode = false,
  onEditCard,
  onDeleteCard,
}) {
  const MAX_CARDS = 7;
  const showCreateSlot = taskType === 'mytask' && tasks.length < MAX_CARDS;

  return (
    <div className="task-grid">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          index={index}
          isEditMode={isEditMode}
          isDeleteMode={isDeleteMode}
          onEdit={onEditCard}
          onDelete={onDeleteCard}
        />
      ))}

      {showCreateSlot && (
        <button className="task-grid-create-slot" onClick={onCreateClick}>
          <span className="task-grid-create-icon">+</span>
        </button>
      )}
    </div>
  );
}

export default TaskGrid;
