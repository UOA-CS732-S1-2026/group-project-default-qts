import { useState } from 'react';
import '../../styles/components/TaskCard.css';
import TaskCardFront from './TaskCardFront';
import TaskCardBack from './TaskCardBack';
import CoinBadge from '../ui/CoinBadge';
import StatusBadge from '../ui/StatusBadge';

const CARD_COLORS = [
  'var(--color-card-1)',
  'var(--color-card-2)',
  'var(--color-card-3)',
  'var(--color-card-4)',
];

function TaskCard({ task, index, isEditMode = false, isDeleteMode = false, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cardColor = CARD_COLORS[index % CARD_COLORS.length];

  const handleClose = () => {
    setIsExpanded(false);
    setIsFlipped(false);
  };

  const expiredDate = new Date(task.expiredAt).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <>
      <div
        className="task-card-small"
        style={{ backgroundColor: cardColor }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowDeleteConfirm(false); }}
      >
        <div className="task-card-header">
          <StatusBadge status={task.status} />
        </div>

        <h3 className="task-card-title">{task.title}</h3>
        <p className="task-card-instructions">{task.instructions}</p>
        <p className="task-card-expired">Expired: {expiredDate}</p>

        <div className="task-card-footer">
          <CoinBadge amount={task.rewardCoins} />
          <button className="task-card-btn" onClick={() => setIsExpanded(true)}>
            Details
          </button>
        </div>

        {isEditMode && isHovered && (
          <div className="task-card-mode-overlay">
            <button
              className="task-card-overlay-btn task-card-overlay-btn--edit"
              onClick={() => onEdit(task)}
            >
              Edit
            </button>
          </div>
        )}

        {isDeleteMode && isHovered && !showDeleteConfirm && (
          <div className="task-card-mode-overlay">
            <button
              className="task-card-overlay-btn task-card-overlay-btn--delete"
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑
            </button>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="task-card-mode-overlay task-card-mode-overlay--confirm">
            <p className="task-card-confirm-text">Delete this task?</p>
            <div className="task-card-confirm-actions">
              <button
                className="task-card-confirm-btn task-card-confirm-btn--yes"
                onClick={() => onDelete(task.id)}
              >
                Yes
              </button>
              <button
                className="task-card-confirm-btn task-card-confirm-btn--no"
                onClick={() => setShowDeleteConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="task-card-overlay" onClick={handleClose}>
          <div className="task-card-expanded-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className={`task-card-inner ${isFlipped ? 'flipped' : ''}`}>
              <TaskCardFront
                task={task}
                cardColor={cardColor}
                onFlip={() => setIsFlipped(true)}
                onClose={handleClose}
              />
              <TaskCardBack
                task={task}
                cardColor={cardColor}
                onFlip={() => setIsFlipped(false)}
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskCard;
