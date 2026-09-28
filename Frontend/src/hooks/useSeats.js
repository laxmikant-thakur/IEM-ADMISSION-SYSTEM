import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

/**
 * Single source of truth for seat data across all admin pages
 */
export function useSeats() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSeats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminService.getDepartmentSeats();
            if (res.success) {
                setDepartments(res.data.departments);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSeats();
    }, [fetchSeats]);

    const totalSeats = departments.reduce((sum, d) => sum + d.totalSeats, 0);
    const availableSeats = departments.reduce((sum, d) => sum + d.availableSeats, 0);
    const filledSeats = departments.reduce((sum, d) => sum + d.filledSeats, 0);

    return {
        departments,
        totalSeats,
        availableSeats,
        filledSeats,
        loading,
        error,
        refresh: fetchSeats
    };
}
