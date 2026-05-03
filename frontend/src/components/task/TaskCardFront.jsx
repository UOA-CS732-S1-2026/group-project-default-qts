import { useState, useEffect } from 'react'
import CoinBadge from '../ui/CoinBadge'
import StatusBadge from '../ui/StatusBadge'
import { CURRENT_USER_ID } from '../../constants/mockUser'
import { getDisplayStatus } from '../../utils/taskUtils'
import DisputeForm from './DisputeForm'

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
  const [showAcceptSuccess, setShowAcceptSuccess] = useState(false)
  const [showReassignConfirm, setShowReassignConfirm] = useState(false)
  const [showConfirmReview, setShowConfirmReview] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputePov, setDisputePov] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 3000)
    return () => clearTimeout(t)
  }, [toastMsg])

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

  const openDisputeForm = (pov) => {
    setDisputePov(pov)
    setShowDisputeForm(true)
  }

  const handleDisputeSubmit = ({ reason, details }) => {
    if (!reason || !disputePov) return
    onUpdateTask(task.id, {
      status: 'disputed',
      disputeRaisedBy: disputePov,
      disputeReason: reason,
      disputeDetails: details || '',
    })
    setShowDisputeForm(false)
    setToastMsg('Dispute raised. Awaiting admin review.')
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
        return null
      case 'pending_review':
        return (
          <>
            <button
              className="task-card-btn task-card-btn--confirm"
              onClick={() => setShowConfirmReview(true)}
            >
              Confirm
            </button>
            <button
              className="task-card-btn task-card-btn--delete"
              onClick={() => setShowRejectConfirm(true)}
            >
              Reject
            </button>
            <button
              className="task-card-btn task-card-btn--dispute"
              onClick={() => openDisputeForm('creator')}
            >
              Dispute
            </button>
          </>
        )
      case 'pending_confirmation':
        return (
          <>
            <button
              className="task-card-btn task-card-btn--confirm"
              onClick={() => setShowConfirmReview(true)}
            >
              Confirm
            </button>
            <button
              className="task-card-btn task-card-btn--delete"
              onClick={() => setShowRejectConfirm(true)}
            >
              Reject
            </button>
            <button
              className="task-card-btn task-card-btn--dispute"
              onClick={() => openDisputeForm('creator')}
            >
              Dispute
            </button>
          </>
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

  const isAssigneeActive = hideAccept && isAcceptable && !isSubmitted &&
    (task.status === 'active' || (isAccepted && task.status === 'open'))

  return (
    <div className="task-card-face task-card-front" style={{ backgroundColor: cardColor }}>

      <div className="task-card-header">
        {!hideAccept && (task.status !== 'cancelled' || task.type !== 'community') && (
          <StatusBadge status={task.type === 'community' ? 'open' : getDisplayStatus(task, isAccepted)} />
        )}
        {hideAccept && (
          <StatusBadge status={
            isSubmitted && task.type === 'community' ? 'completed' :
            isSubmitted ? 'pending_review' :
            getDisplayStatus(task, isAccepted)
          } />
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
                  title={
                    isOwnTask ? "You can't accept your own task" :
                    task.status !== 'open' ? 'This task has already been taken' :
                    undefined
                  }
                  onClick={() => !isAccepted && task.status === 'open' && !isOwnTask && setShowAcceptConfirm(true)}
                >
                  {isAccepted ? 'Accepted!' : 'Accept'}
                </button>
              )}
              {isAssigneeActive && (
                <button
                  className="task-card-btn task-card-btn--cancel"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel
                </button>
              )}
              {isAssigneeActive && (
                <button
                  className="task-card-btn task-card-btn--confirm"
                  onClick={() => setShowSubmitConfirm(true)}
                >
                  Submit
                </button>
              )}
              {isAssigneeActive && task.type === 'p2p' && task.rejectedAt && (
                <button
                  className="task-card-btn task-card-btn--dispute"
                  onClick={() => openDisputeForm('assignee')}
                >
                  Raise Dispute
                </button>
              )}
              {hideAccept && (task.status === 'pending_review' || task.status === 'pending_confirmation' || (isSubmitted && task.type !== 'community')) && (
                <p className="task-card-waiting-text">
                  Waiting for creator confirmation...
                </p>
              )}
              {hideAccept && isSubmitted && task.type === 'community' && (
                <p className="task-card-waiting-text">
                  Task completed! Coins will be rewarded.
                </p>
              )}
              {hideAccept && task.status === 'disputed' && (
                <p className="task-card-waiting-text">
                  Task is under review. Awaiting admin decision.
                </p>
              )}
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
              onClick={() => {
                onAccept(task.id)
                setShowAcceptConfirm(false)
                setShowAcceptSuccess(true)
                setTimeout(() => onClose(), 1500)
              }}
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

      {showAcceptSuccess && (
        <div className="task-card-mode-overlay task-card-accept-success">
          <p className="task-card-accept-success-icon">✓</p>
          <p className="task-card-accept-success-title">Quest Accepted!</p>
          <p className="task-card-accept-success-sub">Good luck!</p>
        </div>
      )}

      {showSubmitSuccess && (
        <div className="task-card-mode-overlay task-card-accept-success">
          <p className="task-card-accept-success-icon">🎉</p>
          <p className="task-card-accept-success-title">Task Completed!</p>
          <p className="task-card-accept-success-sub">Coins will be rewarded to your account.</p>
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

      {showRejectConfirm && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            Reject this submission? The assignee will be asked to redo the task.
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={() => { onUpdateTask(task.id, { status: 'active', rejectedAt: new Date().toISOString() }); setShowRejectConfirm(false) }}
            >
              Yes
            </button>
            <button
              className="task-card-confirm-btn task-card-confirm-btn--no"
              onClick={() => setShowRejectConfirm(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="task-card-mode-overlay">
          <p className="task-card-confirm-text">
            {task.type === 'community'
              ? 'Mark this task as completed? Coins will be rewarded to your account.'
              : 'Are you sure you want to submit this task? You cannot cancel after submission.'}
          </p>
          <div className="task-card-confirm-actions">
            <button
              className="task-card-confirm-btn task-card-confirm-btn--yes"
              onClick={() => {
                const newStatus = task.type === 'p2p' ? 'pending_confirmation' : 'pending_review'
                onUpdateTask(task.id, { status: newStatus, submittedAt: new Date().toISOString() })
                setShowSubmitConfirm(false)
                if (task.type === 'community') {
                  setShowSubmitSuccess(true)
                  setTimeout(() => onClose(), 2000)
                }
              }}
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

      {toastMsg && (
        <div className="task-card-toast">
          {toastMsg}
        </div>
      )}

      <DisputeForm
        isOpen={showDisputeForm}
        onClose={() => setShowDisputeForm(false)}
        onSubmit={handleDisputeSubmit}
        pov={disputePov}
      />

    </div>
  )
}

export default TaskCardFront
