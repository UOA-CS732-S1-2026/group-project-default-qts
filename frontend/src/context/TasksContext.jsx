import { createContext, useContext, useState } from 'react';
import { mockTasks } from '../data/mockTasks';

const TasksContext = createContext();

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(mockTasks);

  const createTask = (task) => setTasks((prev) => [...prev, task]);
  const updateTask = (id, fields) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));
  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <TasksContext.Provider value={{ tasks, createTask, updateTask, deleteTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}
