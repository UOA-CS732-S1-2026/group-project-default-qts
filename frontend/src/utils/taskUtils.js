export function getDisplayStatus(task, isAccepted = false) {
  if (isAccepted && task.status === 'open') return 'active'
  return task.status
}
