import { useState } from 'react';
import { useSeats } from '../../../hooks/useSeats';
import adminService from '../../../services/adminService';
import { SeatSummary } from '../../../components/admin/SeatChart/SeatChart';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Alert from '../../../components/common/Alert/Alert';
import Loader from '../../../components/common/Loader/Loader';
import styles from './SeatManagement.module.css';

export default function SeatManagement() {
    const { departments, totalSeats, availableSeats, filledSeats, loading, refresh } = useSeats();
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleEdit = (dept) => {
        setEditingId(dept.id);
        setEditValue(dept.totalSeats.toString());
        setAlert(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleSave = async (deptId) => {
        const newTotal = parseInt(editValue, 10);
        if (isNaN(newTotal) || newTotal < 1) {
            setAlert({ type: 'error', message: 'Total seats must be a positive number' });
            return;
        }

        setSaving(true);
        try {
            const res = await adminService.updateDepartmentSeats(deptId, newTotal);
            if (res.success) {
                setAlert({ type: 'success', message: `Department capacity updated successfully` });
                setEditingId(null);
                refresh();
            }
        } catch (err) {
            setAlert({
                type: 'error',
                message: err.response?.data?.message || 'Failed to update capacity'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Seat Management</h1>
                <p className={styles.subtitle}>Manage department capacities and view seat analytics</p>
            </div>

            {alert && (
                <Alert type={alert.type} onClose={() => setAlert(null)}>
                    {alert.message}
                </Alert>
            )}

            {/* Seat Charts */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Department Overview</h2>
                <SeatSummary
                    departments={departments}
                    showStats={true}
                    totalSeats={totalSeats}
                    availableSeats={availableSeats}
                    filledSeats={filledSeats}
                />
            </div>

            {/* Edit Table */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Manage Capacity</h2>
                <Card>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Total Seats</th>
                                    <th>Filled</th>
                                    <th>Available</th>
                                    <th>Utilization</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(dept => (
                                    <tr key={dept.id}>
                                        <td className={styles.deptName}>{dept.name}</td>
                                        <td>
                                            {editingId === dept.id ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    className={styles.editInput}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className={styles.seatValue}>{dept.totalSeats}</span>
                                            )}
                                        </td>
                                        <td><span className={styles.filled}>{dept.filledSeats}</span></td>
                                        <td><span className={styles.available}>{dept.availableSeats}</span></td>
                                        <td>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{
                                                        width: `${dept.totalSeats > 0 ? (dept.filledSeats / dept.totalSeats) * 100 : 0}%`
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            {editingId === dept.id ? (
                                                <div className={styles.editActions}>
                                                    <Button size="sm" variant="success" onClick={() => handleSave(dept.id)} loading={saving}>
                                                        Save
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(dept)}>
                                                    Edit
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
