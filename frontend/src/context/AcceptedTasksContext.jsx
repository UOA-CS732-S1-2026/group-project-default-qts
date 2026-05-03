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

  // Pessimistic for p2p (withdraw application via API before updating local state).
  // Community tasks have direct assignments — no application to withdraw — so we
  // only clean up local state without calling the backend.
  const cancelTask = async (id, taskType) => {
    if (taskType !== 'community') {
      await taskService.withdrawApplication(id);
    }
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

  return (
    <AcceptedTasksContext.Provider value={{ acceptedIds, acceptTask, cancelTask, submittedIds, submitTask }}>
      {children}
    </AcceptedTasksContext.Provider>
  );
}

export function useAcceptedTasks() {
  return useContext(AcceptedTasksContext);
}
