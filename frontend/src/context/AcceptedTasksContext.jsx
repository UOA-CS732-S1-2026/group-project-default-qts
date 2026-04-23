import { createContext, useContext, useState } from 'react';

const AcceptedTasksContext = createContext();

export function AcceptedTasksProvider({ children }) {
  const [acceptedIds, setAcceptedIds] = useState(new Set());

  const acceptTask = (id) => setAcceptedIds((prev) => new Set([...prev, id]));

  const cancelTask = (id) => setAcceptedIds((prev) => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });

  return (
    <AcceptedTasksContext.Provider value={{ acceptedIds, acceptTask, cancelTask }}>
      {children}
    </AcceptedTasksContext.Provider>
  );
}

export function useAcceptedTasks() {
  return useContext(AcceptedTasksContext);
}
