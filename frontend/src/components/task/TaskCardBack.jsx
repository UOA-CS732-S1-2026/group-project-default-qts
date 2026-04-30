import CoinBadge from '../ui/CoinBadge'
import { CURRENT_USER_ID } from '../../constants/mockUser'

function TaskCardBack({ task, cardColor, onFlip, onClose, isQuest = false, isAccepted = false, isCreatorView = false }) {
  const getTakenByName = () => {
    if (isAccepted) return 'You'
    if (!task.assignee) return null
    if (isCreatorView) return task.assignee.name
    if (task.assignee.id === CURRENT_USER_ID) return 'You'
    return task.assignee.name
  }

  const takenByName = getTakenByName()

  return (
    <div className="task-card-face task-card-back" style={{ backgroundColor: cardColor }}>

      <div className="task-card-header">
        <span className="task-card-back-label">Details</span>
        <button className="task-card-close" onClick={onClose}>✕</button>
      </div>

      <div className="task-card-detail">
        <span className="task-card-detail-label">Time Limit</span>
        <span>{task.timeLimit} hours</span>
      </div>

      <div className="task-card-detail">
        <span className="task-card-detail-label">Objectives</span>
        <ul className="task-card-objectives">
          {task.objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </div>

      {!isQuest && task.type === 'p2p' && takenByName && (
        <div className="task-card-detail">
          <span className="task-card-detail-label">Taken by</span>
          <span>{takenByName}</span>
        </div>
      )}

      {task.type === 'community' && task.difficulty && (
        <div className="task-card-detail">
          <span className="task-card-detail-label">Difficulty</span>
          <span className={`task-card-difficulty task-card-difficulty--${task.difficulty.toLowerCase()}`}>
            {task.difficulty}
          </span>
        </div>
      )}

      <div className="task-card-footer">
        <CoinBadge amount={task.rewardCoins} />
        <button className="task-card-btn task-card-btn--flip" onClick={onFlip}>↺</button>
      </div>

    </div>
  )
}

export default TaskCardBack
