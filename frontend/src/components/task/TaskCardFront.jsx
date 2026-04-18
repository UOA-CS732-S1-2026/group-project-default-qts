import CoinBadge from '../shared/CoinBadge'
import StatusBadge from '../shared/StatusBadge'

function TaskCardFront({ task, cardColor, onFlip, onClose }) {
  const expiredDate = new Date(task.expiredAt).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="task-card-face task-card-front" style={{ backgroundColor: cardColor }}>

      <div className="task-card-header">
        <StatusBadge status={task.status} />
        <button className="task-card-close" onClick={onClose}>✕</button>
      </div>

      <h3 className="task-card-title">{task.title}</h3>

      <p className="task-card-instructions">{task.instructions}</p>

      <p className="task-card-expired">Expired: {expiredDate}</p>

      <div className="task-card-footer">
        <CoinBadge amount={task.rewardCoins} />
        <div className="task-card-actions">
          {(task.type === 'p2p' || task.type === 'community') && (
            <button className="task-card-btn task-card-btn--accept">Accept</button>
          )}
          <button className="task-card-btn task-card-btn--flip" onClick={onFlip}>↺</button>
        </div>
      </div>

    </div>
  )
}

export default TaskCardFront
