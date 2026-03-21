import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const MaterialContext = createContext();

export const useMaterials = () => useContext(MaterialContext);

export const MaterialProvider = ({ children }) => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMaterials = async () => {
        const startTime = Date.now();
        try {
            setIsLoading(true);
            const { data } = await api.get('/materials');
            setMaterials(data);
        } catch (error) {
            console.error('Fetch materials error:', error);
            toast.error('Failed to load study materials');
        } finally {
            setIsLoading(false);
        }
    };

    const addMaterial = async (title, description, fileUrl, fileType, fileName) => {
        try {
            const { data } = await api.post('/materials', { title, description, fileUrl, fileType, fileName });
            setMaterials(prev => [data, ...prev]);
            return data;
        } catch (error) {
            console.error('Add material error:', error);
            throw error;
        }
    };

    const updateMaterial = async (id, materialData) => {
        try {
            const { data } = await api.put(`/materials/${id}`, materialData);
            setMaterials(prev => prev.map(m => m._id === id ? data : m));
            return data;
        } catch (error) {
            console.error('Update material error:', error);
            throw error;
        }
    };

    const deleteMaterial = async (id) => {
        try {
            await api.delete(`/materials/${id}`);
            setMaterials(prev => prev.filter(m => m._id !== id));
            toast.success('Material deleted');
        } catch (error) {
            console.error('Delete material error:', error);
            toast.error('Failed to delete material');
            throw error;
        }
    };

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchMaterials();
        } else {
            setMaterials([]);
            setIsLoading(false);
        }
    }, [user]);

    return (
        <MaterialContext.Provider value={{
            materials,
            isLoading,
            fetchMaterials,
            addMaterial,
            updateMaterial,
            deleteMaterial
        }}>
            {children}
        </MaterialContext.Provider>
    );
};
