import { createContext, useContext, useState } from 'react';
import { mockTasks } from '../data/mockTasks';

const TasksContext = createContext();
const TASKS_KEY = 'gf_tasks';
const TASKS_VERSION_KEY = 'gf_tasks_version';
const TASKS_VERSION = '2';

function loadTasks() {
    try {
        const storedVersion = localStorage.getItem(TASKS_VERSION_KEY);
        if (storedVersion !== TASKS_VERSION) {
            localStorage.removeItem(TASKS_KEY);
            localStorage.setItem(TASKS_VERSION_KEY, TASKS_VERSION);
            return mockTasks;
        }
        const stored = localStorage.getItem(TASKS_KEY);
        return stored ? JSON.parse(stored) : mockTasks;
    } catch {
        return mockTasks;
    }
}

function saveTasks(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function TasksProvider({ children }) {
    const [tasks, setTasks] = useState(loadTasks);

    const createTask = (task) => {
        setTasks((prev) => {
            const next = [...prev, task];
            saveTasks(next);
            return next;
        });
    };

    const updateTask = (id, fields) => {
        setTasks((prev) => {
            const next = prev.map((t) => (t.id === id ? { ...t, ...fields } : t));
            saveTasks(next);
            return next;
        });
    };

    const deleteTask = (id) => {
        setTasks((prev) => {
            const next = prev.filter((t) => t.id !== id);
            saveTasks(next);
            return next;
        });
    };

    return (
        <TasksContext.Provider value={{ tasks, createTask, updateTask, deleteTask }}>
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    return useContext(TasksContext);
}
