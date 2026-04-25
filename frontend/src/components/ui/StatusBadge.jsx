import '../../styles/components/StatusBadge.css';


const STATUS_LABELS = {
  open: 'Open',
  active: 'Active',
  pending_review: 'Pending Review',
  disputed: 'Disputed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

function StatusBadge({status}){
    return(
        <span className={`status-badge status-badge--${status}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    )
}

export default StatusBadge;