// Maps backend task data ↔ frontend task shape.
//
// Backend types : SYSTEM   | P2P | PERSONAL
// Frontend types: community | p2p | mytask
//
// Backend statuses : OPEN | IN_PROGRESS | PENDING_CONFIRMATION | COMPLETED | CANCELLED
// Frontend statuses: open  | active      | pending_confirmation | completed | cancelled
//                    expired (computed — endAt in the past + status OPEN, never stored in DB)
//
// 'pending_review' is a frontend alias for 'pending_confirmation' (same backend value).
// 'disputed' has no backend equivalent — scoped out of current integration.
//
// Fields the backend does NOT store (category, difficulty, objectives, timeLimit)
// are defaulted to null / [] so existing frontend components don't crash.

const TYPE_B2F = { SYSTEM: 'community', P2P: 'p2p', PERSONAL: 'mytask' };
const TYPE_F2B = { community: 'SYSTEM', p2p: 'P2P', mytask: 'PERSONAL' };

const STATUS_B2F = {
  OPEN: 'open',
  IN_PROGRESS: 'active',
  PENDING_CONFIRMATION: 'pending_confirmation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  CLOSED: 'completed',
};
const STATUS_F2B = {
  open: 'OPEN',
  active: 'IN_PROGRESS',
  pending_confirmation: 'PENDING_CONFIRMATION',
  pending_review: 'PENDING_CONFIRMATION',   // alias — same backend value
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

/**
 * Convert a single task from backend response format to frontend format.
 * @param {object} task - raw task object from backend (formatTask output)
 * @returns {object} task shaped for frontend components
 */
export function toFrontend(task) {
  const baseStatus = STATUS_B2F[task.status] ?? task.status?.toLowerCase() ?? 'open';

  // 'expired' is not stored in DB — compute it when endAt has passed and task is still OPEN
  const isExpired = task.endAt && new Date(task.endAt) < new Date() && baseStatus === 'open';
  const status = isExpired ? 'expired' : baseStatus;

  return {
    id: String(task.id),
    type: TYPE_B2F[task.type] ?? task.type?.toLowerCase() ?? 'community',
    title: task.title ?? '',
    instructions: task.description ?? '',
    objectives: [],
    timeLimit: null,
    rewardCoins: task.rewardCoins ?? 0,
    status,
    assignee: null,
    createdBy: { id: String(task.createdBy ?? ''), name: '' },
    createdAt: task.createdAt ?? new Date().toISOString(),
    expiredAt: task.endAt ?? null,
    difficulty: null,
    category: null,
  };
}

/**
 * Convert an array of backend tasks to frontend format.
 */
export function toFrontendList(tasks) {
  return tasks.map(toFrontend);
}

/**
 * Build a backend createTask request body from AdminCreateForm output.
 * Frontend-only fields (category, difficulty, objectives, timeLimit) are dropped
 * since the backend schema does not have them.
 *
 * @param {object} formData - object emitted by AdminCreateForm.handleSubmit
 * @returns {object} body for POST /api/tasks
 */
export function adminCreateToBackend(formData) {
  return {
    type: TYPE_F2B[formData.type] ?? formData.type?.toUpperCase() ?? 'SYSTEM',
    title: formData.title,
    description: formData.instructions ?? formData.description ?? '',
    rewardCoins: Number(formData.rewardCoins) || 0,
    requiresApplication: false,
    endAt: formData.expiredAt ?? null,
  };
}

/**
 * Build a backend createTask request body from the user-facing CreateEditForm
 * (P2P and MyTask).
 *
 * @param {object} formData - object emitted by CreateEditForm
 * @returns {object} body for POST /api/tasks
 */
export function userCreateToBackend(formData) {
  return {
    type: TYPE_F2B[formData.type] ?? formData.type?.toUpperCase(),
    title: formData.title,
    description: formData.instructions ?? formData.description ?? '',
    rewardCoins: Number(formData.rewardCoins) || 0,
    requiresApplication: false,
    endAt: formData.expiredAt ?? null,
  };
}

export { TYPE_B2F, TYPE_F2B, STATUS_B2F, STATUS_F2B };
