import { useState } from 'react'
import CoinBadge from '../ui/CoinBadge'
import StatusBadge from '../ui/StatusBadge'
import { CURRENT_USER_ID } from '../../constants/mockUser'
import { getDisplayStatus } from '../../utils/taskUtils'

const REPORT_REASONS = [
  'Task not completed',
  'Poor quality work',
  'No communication',
  'Wrong delivery',
]

function TaskCardFront({
  task,
  cardColor,
  onFlip,
  onClose,
  hideAccept = false,
  onCancel,
  isAccepted = false,
  isSubmitted = false,
  onAccept,
  isCreatorView = false,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false)
  const [showReassignConfirm, setShowReassignConfirm] = useState(false)
  const [showConfirmReview, setShowConfirmReview] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showReportChecklist, setShowReportChecklist] = useState(false)
  const [reportReasons, setReportReasons] = useState([])

  const isOwnTask = task.type === 'p2p' && task.createdBy?.id === CURRENT_USER_ID

  const expiredDate = new Date(task.expiredAt).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
  })

  const handleConfirmCancel = () => {
    onCancel(task.id)
    onClose()
  }

  const handleDeleteConfirmed = () => {
    onDeleteTask(task.id)
  }

  const handleReassign = () => {
    onUpdateTask(task.id, { status: 'open', assignee: null })
  }

  const toggleReason = (reason) => {
    setReportReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    )
  }

  const handleSubmitReport = () => {
    if (reportReasons.length === 0) return
    onUpdateTask(task.id, { status: 'disputed' })
    setShowReportChecklist(false)
    setReportReasons([])
  }

  const isAcceptable = task.type === 'p2p' || task.type === 'community'

  const renderCreatorButtons = () => {
    switch (task.status) {
        case 'open':
          return (
            <>
              <button
                className="task-card-btn task-card-btn--flip"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={onEditTask}
              >
                Edit
              </button>
              <button
                className="task-card-btn task-card-btn--delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </>
          )
        case 'active':
          return (
            <button
              className="task-card-btn task-card-btn--report"
              onClick={() => setShowReportChecklist(true)}
            >
              Report
            </button>
          )
        case 'pending_review':
          // TODO: Dispute button — nice-to-have, implement later
          return (
            <button
              className="task-card-btn task-card-btn--confirm"
              onClick={() => setShowConfirmReview(true)}
            >
              Confirm
            </button>
          )
        case 'disputed':
          return null
        case 'completed':
          return (
            <button
              className="task-card-btn task-card-btn--delete"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </button>
          )
        case 'cancelled':
        case 'expired':
          return (
            <>
              <button
                className="task-card-btn task-card-btn--flip"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={onEditTask}
              >
                Edit
              </button>
              <button
                className="task-card-btn task-card-btn--reassign"
                onClick={() => setShowReassignConfirm(true)}
              >
                Re-assign
              </button>
              <button
                className="task-card-btn task-card-btn--delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </>
          )
        default:
          return null
    }
  }

  return (
    <div className="task-card-face task-card-front" style={{ backgroundColor: cardColor }}>

      <div className="task-card-header">
        {!hideAccept && (task.status !== 'cancelled' || task.type !== 'community') && (
          <StatusBadge status={getDisplayStatus(task, isAccepted)} />
        )}
        {hideAccept && (task.status === 'pending_review' || isSubmitted) && (
          <span className="task-card-submitted-badge">Submitted</span>
        )}
        <button className="task-card-close" onClick={onClose}>✕</button>
      </div>

      {task.type === 'community' && task.category && (
        <span className={`task-card-category task-card-category--${task.category}`}>
          {task.category === 'organization' ? 'Organization' : 'Activity'}
        </span>
      )}

      <h3 className="task-card-title">{task.title}</h3>

      <p className="task-card-instructions">{task.instructions}</p>

      {task.type === 'p2p' && !isCreatorView && !hideAccept && (
        <p className="task-card-posted-by">
          👤 Posted by: {task.createdBy?.id === CURRENT_USER_ID ? 'Me' : (task.createdBy?.name ?? 'Unknown')}
        </p>
      )}

      <p className="task-card-expired">Expired: {expiredDate}</p>

      <div className="task-card-footer">
        <CoinBadge amount={task.rewardCoins} />
        <div className="task-card-actions">
          {isCreatorView ? (
            renderCreatorButtons()
          ) : (
            <>
              {!hideAccept && isAcceptable && (
                <button
                  className={`task-card-btn ${isAccepted ? 'task-card-btn--accepted' : 'task-card-btn--accept'}`}
                  disabled={isAccepted || task.status !== 'open' || isOwnTask}
                  style={(isAccepted || task.status !== 'open' || isOwnTask) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                  title={isOwnTask ? "You can't accept your own task" : undefined}
                  onClick={() => !isAccepted && task.status === 'open' && !isOwnTask && setShowAcceptConfirm(true)}
                >
                  {isAccepted ? 'Accepted!' : 'Accept'}
                </button>
              )}
              {hideAccept && isAcceptable && !isSubmitted && (task.status === 'active' || (isAccepted && task.status === 'open')) && (
                <button
                  className="task-card-btn task-card-btn--cancel"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel
                </button>
              )}
              {hideAccept && isAcceptable && !isSubmitted && (task.status === 'active' || (isAccepted && task.status === 'open')) && (
                <button
                  className="task-card-btn task-card-btn--confirm"
                  onClick={() => setShowSubmitConfirm(true)}
                >
                  Submit
                </button>
              )}
              {hideAccept && (task.status === 'pending_review' || isSubmitted) && (
                <p className="task-card-waiting-text">
                  {task.type === 'community'
                    ? 'Waiting for admin confirmation...'
                    : 'Waiting for creator confirmation...'}
                </p>
              )}
              {/* TODO: Report button — nice-to-have, implement later when dispute system is ready */}
            </>
          )}
          <button className="task-card-btn task-card-btn--flip" onClick={onFlip}>↺</button>
        </div>
      </div>

      {showAcceptConfirm && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            Are you sure want to accept this task?
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={() => { onAccept(task.id); setShowAcceptConfirm(false) }}
            >
              Yes
            </button>
            <button
              className="task-card-confirm-btn task-card-confirm-btn--no"
              onClick={() => setShowAcceptConfirm(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            Are you sure want to cancel this quest?{'\n'}
            It will be removed from your quest list.
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={handleConfirmCancel}
            >
              Yes
            </button>
            <button
              className="task-card-confirm-btn task-card-confirm-btn--no"
              onClick={() => setShowCancelConfirm(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            Are you sure want to delete this task?
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={handleDeleteConfirmed}
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

      {showReassignConfirm && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            Re-assign this task? The current assignee will be removed.
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={() => { handleReassign(); setShowReassignConfirm(false) }}
            >
              Yes
            </button>
            <button
              className="task-card-confirm-btn task-card-confirm-btn--no"
              onClick={() => setShowReassignConfirm(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {showConfirmReview && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            Are you sure you want to confirm this task as completed? Coins will be sent to the assignee.
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={() => { onUpdateTask(task.id, { status: 'completed' }); setShowConfirmReview(false) }}
            >
              Yes
            </button>
            <button
              className="task-card-confirm-btn task-card-confirm-btn--no"
              onClick={() => setShowConfirmReview(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            Are you sure you want to submit this task? You cannot cancel after submission.
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={() => { onUpdateTask(task.id, { status: 'pending_review' }); setShowSubmitConfirm(false) }}
            >
              Yes
            </button>
            <button
              className="task-card-confirm-btn task-card-confirm-btn--no"
              onClick={() => setShowSubmitConfirm(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {showReportChecklist && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">Select reason(s):</p>
          <div className="task-card-report-list">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="task-card-report-item">
                <input
                  type="checkbox"
                  checked={reportReasons.includes(reason)}
                  onChange={() => toggleReason(reason)}
                />
                {reason}
              </label>
            ))}
          </div>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={handleSubmitReport}
              disabled={reportReasons.length === 0}
              style={reportReasons.length === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              Submit
            </button>
            <button
              className="task-card-confirm-btn task-card-confirm-btn--no"
              onClick={() => { setShowReportChecklist(false); setReportReasons([]) }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default TaskCardFront
