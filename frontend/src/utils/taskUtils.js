export function getDisplayStatus(task, isAccepted = false) {
  // SystemTask: always show real status (multi-player, no badge override)
  if (task.type === 'community') return task.status

  // P2P: show 'active' if current player has accepted an open task
  if (isAccepted && task.status === 'open') return 'active'

  return task.status
}
