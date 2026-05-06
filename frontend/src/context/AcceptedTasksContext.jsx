import { createContext, useContext, useState, useCallback } from 'react';
import * as taskService from '../services/taskService';

const AcceptedTasksContext = createContext();

export function AcceptedTasksProvider({ children }) {
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [submittedIds, setSubmittedIds] = useState(new Set());

  // Called by TasksContext after fetch to hydrate acceptedIds from backend data.
  const initAcceptedIds = useCallback((tasks) => {
    const ids = tasks.filter((t) => t.isAcceptedByMe).map((t) => t.id);
    if (ids.length > 0) {
      setAcceptedIds((prev) => new Set([...prev, ...ids]));
    }
  }, []);

  // Optimistic: add to set immediately, rollback on API failure.
  // Returns the assignment or application object from the backend.
  const acceptTask = async (id) => {
    setAcceptedIds((prev) => new Set([...prev, id]));
    try {
      const res = await taskService.applyForTask(id);
      return res.data.data;
    } catch (err) {
      setAcceptedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      throw err;
    }
  };

  // Optimistic: add to set immediately, rollback on API failure.
  // Returns { task, assignment } from the backend.
  const submitTask = async (id) => {
    setSubmittedIds((prev) => new Set([...prev, id]));
    try {
      const res = await taskService.submitTask(id);
      return res.data.data;
    } catch (err) {
      setSubmittedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      throw err;
    }
  };

  // API call only — does NOT touch acceptedIds/submittedIds.
  // Caller is responsible for calling cleanupCancelledTask after showing success UI.
  const withdrawTask = async (id, taskType) => {
    await taskService.withdrawAssignment(id);
  };

  // State cleanup only — call this after success overlay finishes.
  const cleanupCancelledTask = (id) => {
    setAcceptedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSubmittedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Legacy combined helper kept for any callers that don't need the success overlay.
  const cancelTask = async (id, taskType) => {
    await withdrawTask(id, taskType);
    cleanupCancelledTask(id);
  };

  return (
    <AcceptedTasksContext.Provider value={{ acceptedIds, acceptTask, cancelTask, withdrawTask, cleanupCancelledTask, submittedIds, submitTask, initAcceptedIds }}>
      {children}
    </AcceptedTasksContext.Provider>
  );
}

export function useAcceptedTasks() {
  return useContext(AcceptedTasksContext);
}
