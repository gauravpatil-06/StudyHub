import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const { user, isSessionValid, fetchMe } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        if (!user) return;
        const startTime = Date.now();
        setIsLoading(true);
        try {
            const { data } = await api.get(`/tasks/${user._id}`);
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isSessionValid) {
            fetchTasks();
        } else {
            setTasks([]);
            setIsLoading(false);
        }
    }, [isSessionValid, fetchTasks]);

    const addTask = async (title, description = '', pdfUrl = '', fileName = '') => {
        if (!user) return;
        try {
            const { data } = await api.post('/tasks', { title, description, pdfUrl, fileName });
            setTasks(prev => [data, ...prev]); // Add to top
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    };

    const updateTask = async (id, updates) => {
        if (!user) return;
        try {
            // updates could contain fileName
            const { data } = await api.put(`/tasks/${id}`, updates);
            setTasks(prev => prev.map(t => t._id === id ? data : t));
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    };

    const deleteTask = async (id) => {
        if (!user) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    };

    const toggleTaskStatus = async (id) => {
        if (!user) return;
        const task = tasks.find(t => t._id === id);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        try {
            const { data } = await api.put(`/tasks/${id}`, { status: newStatus });
            setTasks(prev => prev.map(t => t._id === id ? data : t));
            if (newStatus === 'completed' && fetchMe) {
                // Background update user context to catch new streaks
                fetchMe();
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            throw error;
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            isLoading,
            addTask,
            updateTask,
            deleteTask,
            toggleTaskStatus,
            fetchTasks
        }}>
            {children}
        </TaskContext.Provider>
    );
};
