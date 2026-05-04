import { createContext, useContext, useState } from 'react';
import * as taskService from '../services/taskService';

const AcceptedTasksContext = createContext();

export function AcceptedTasksProvider({ children }) {
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [submittedIds, setSubmittedIds] = useState(new Set());

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
    if (taskType === 'community') {
      await taskService.withdrawAssignment(id);
    } else {
      await taskService.withdrawApplication(id);
    }
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
    <AcceptedTasksContext.Provider value={{ acceptedIds, acceptTask, cancelTask, withdrawTask, cleanupCancelledTask, submittedIds, submitTask }}>
      {children}
    </AcceptedTasksContext.Provider>
  );
}

export function useAcceptedTasks() {
  return useContext(AcceptedTasksContext);
}
