import { describe, it, expect } from 'vitest'
import { getDisplayStatus } from '../taskUtils'

describe('getDisplayStatus', () => {
  it('returns "rejected" when active task has rejectedAt', () => {
    const task = { status: 'active', rejectedAt: '2026-05-01' }
    expect(getDisplayStatus(task)).toBe('rejected')
  })

  it('returns "rejected" in creator view when assignee has lastRejectedAt', () => {
    const task = { status: 'active', assignee: { id: 'u2' }, lastRejectedAt: '2026-05-01' }
    expect(getDisplayStatus(task, false, true)).toBe('rejected')
  })

  it('does not return "rejected" for creator view without lastRejectedAt', () => {
    const task = { status: 'active', assignee: { id: 'u2' } }
    expect(getDisplayStatus(task, false, true)).toBe('active')
  })

  it('returns "active" when task is open and the user has accepted it', () => {
    const task = { status: 'open' }
    expect(getDisplayStatus(task, true, false)).toBe('active')
  })

  it('returns the raw task status as a fallback', () => {
    expect(getDisplayStatus({ status: 'completed' })).toBe('completed')
    expect(getDisplayStatus({ status: 'disputed' })).toBe('disputed')
    expect(getDisplayStatus({ status: 'cancelled' })).toBe('cancelled')
  })

  it('prioritises rejectedAt check over isAccepted', () => {
    const task = { status: 'active', rejectedAt: '2026-05-01' }
    expect(getDisplayStatus(task, true)).toBe('rejected')
  })
})
