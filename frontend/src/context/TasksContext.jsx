import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as taskService from '../services/taskService';
import { toFrontend, toFrontendList, userCreateToBackend } from '../utils/taskMapper';

const TasksContext = createContext();

export function TasksProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // If user has a token, request "mine=true" so frontend shows
            // personal tasks (created/assigned) rather than only public tasks.
            const token = localStorage.getItem('gf_token');
            const params = token ? { mine: true } : {};
            const res = await taskService.getTasks(params);
            setTasks(toFrontendList(res.data.data.tasks));
        } catch (err) {
            setError(err.response?.data?.error?.message ?? 'Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Creates a task via API, maps response back to frontend shape, prepends to list.
    // Returns the created task or throws on failure.
    const createTask = useCallback(async (formData) => {
        const body = userCreateToBackend(formData);
        const res = await taskService.createTask(body);
        const created = toFrontend(res.data.data.task);
        setTasks((prev) => [created, ...prev]);
        return created;
    }, []);

    // Local-only updater — called by modals after their own API calls to sync UI.
    // Does NOT hit the backend.
    const updateTask = useCallback((id, fields) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));
    }, []);

    // Local-only remove — no DELETE endpoint exists in backend yet.
    const deleteTask = useCallback((id) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <TasksContext.Provider
            value={{ tasks, isLoading, error, createTask, updateTask, deleteTask, refetch: fetchTasks }}
        >
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    return useContext(TasksContext);
}
