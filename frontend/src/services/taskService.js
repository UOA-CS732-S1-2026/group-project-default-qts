import api from './api';
import { TYPE_F2B, STATUS_F2B } from '../utils/taskMapper';

// ─── Read ────────────────────────────────────────────────────────────────────

/** GET /api/tasks
 * Accepts frontend-convention strings — mapping to backend enums is done here.
 * @param {object} params - optional query params: type, status, mine
 * Examples:
 *   getTasks({ type: 'community' })            → GET /api/tasks?type=SYSTEM
 *   getTasks({ type: 'p2p', status: 'open' })  → GET /api/tasks?type=P2P&status=OPEN
 *   getTasks({ mine: true })                   → tasks created by or assigned to current user
 */
export const getTasks = (params = {}) => {
  const mapped = { ...params };
  if (mapped.type)   mapped.type   = TYPE_F2B[mapped.type]   ?? mapped.type;
  if (mapped.status) mapped.status = STATUS_F2B[mapped.status] ?? mapped.status;
  return api.get('/tasks', { params: mapped });
};

/** GET /api/tasks/:id */
export const getTask = (id) =>
  api.get(`/tasks/${id}`);

/** GET /api/tasks/:id/applications  (task creator / admin only) */
export const getApplications = (id) =>
  api.get(`/tasks/${id}/applications`);

// ─── Write ───────────────────────────────────────────────────────────────────

/** POST /api/tasks
 * body must be already mapped via adminCreateToBackend() or userCreateToBackend()
 */
export const createTask = (body) =>
  api.post('/tasks', body);

/** POST /api/tasks/:id/apply
 * - SYSTEM (requiresApplication=false) → direct assignment
 * - SYSTEM (requiresApplication=true) / P2P → creates application (PENDING)
 */
export const applyForTask = (id) =>
  api.post(`/tasks/${id}/apply`);

/** DELETE /api/tasks/:id/apply  — withdraw a PENDING application */
export const withdrawApplication = (id) =>
  api.delete(`/tasks/${id}/apply`);

/** PATCH /api/tasks/:id/applications/:appId/decide
 * @param {string} action - 'ACCEPT' | 'REJECT'
 */
export const decideApplication = (id, appId, action) =>
  api.patch(`/tasks/${id}/applications/${appId}/decide`, { action });

/** POST /api/tasks/:id/submit
 * - PERSONAL → auto-completes
 * - SYSTEM / P2P → moves to PENDING_CONFIRMATION
 */
export const submitTask = (id) =>
  api.post(`/tasks/${id}/submit`);

/** POST /api/tasks/:id/confirm
 * - SYSTEM: admin only
 * - P2P: task creator only (or admin)
 * Awards coins to assignee.
 */
export const confirmTask = (id) =>
  api.post(`/tasks/${id}/confirm`);

/** POST /api/tasks/:id/cancel
 * Creator or admin. Refunds P2P escrow if still HELD.
 */
export const cancelTask = (id) =>
  api.post(`/tasks/${id}/cancel`);

/** PATCH /api/tasks/:id
 * body: { title?, description?, endAt?, rewardCoins? }
 * P2P: rewardCoins ignored by backend (escrow locked at create time).
 * Only when OPEN (P2P/SYSTEM) or IN_PROGRESS (PERSONAL).
 */
export const patchTask = (id, body) =>
  api.patch(`/tasks/${id}`, body);

/** DELETE /api/tasks/:id
 * SYSTEM: admin only. P2P/PERSONAL: creator only.
 * Only when status OPEN or CANCELLED. P2P auto-refunds escrow.
 */
export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);
