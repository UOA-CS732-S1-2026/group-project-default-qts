export function getDisplayStatus(task, isAccepted = false) {
  if (task.status === 'active' && task.rejectedAt) return 'rejected'
  if (isAccepted && task.status === 'open') return 'active'
  return task.status
}
