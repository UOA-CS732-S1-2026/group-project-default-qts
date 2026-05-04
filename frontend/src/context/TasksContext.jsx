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

    // Calls PATCH /api/tasks/:id, then merges the returned task into local state.
    // Maps frontend form fields (instructions→description, expiredAt→endAt) before sending.
    // Preserves frontend-only fields (category, difficulty, etc.) that backend doesn't store.
    const patchTask = useCallback(async (id, fields) => {
        const body = {};
        if (fields.title !== undefined) body.title = fields.title;
        if (fields.instructions !== undefined) body.description = fields.instructions;
        else if (fields.description !== undefined) body.description = fields.description;
        if (fields.objectives !== undefined) body.objectives = Array.isArray(fields.objectives) ? fields.objectives.filter(o => String(o).trim()) : [];
        if (fields.timeLimit !== undefined) body.timeLimit = fields.timeLimit ? Number(fields.timeLimit) : null;
        if (fields.category !== undefined) body.category = fields.category;
        if (fields.rewardCoins !== undefined) body.rewardCoins = Number(fields.rewardCoins);
        if (fields.expiredAt !== undefined) body.endAt = fields.expiredAt;
        const res = await taskService.patchTask(id, body);
        const updated = toFrontend(res.data.data.task);
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
        return updated;
    }, []);

    // Calls DELETE /api/tasks/:id, then removes from local state.
    // Throws on API failure so callers can show an error.
    const deleteTask = useCallback(async (id) => {
        await taskService.deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <TasksContext.Provider
            value={{ tasks, isLoading, error, createTask, updateTask, patchTask, deleteTask, refetch: fetchTasks }}
        >
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    return useContext(TasksContext);
}
