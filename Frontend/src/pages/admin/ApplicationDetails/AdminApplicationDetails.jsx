import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import { useSeats } from '../../../hooks/useSeats';
import { SeatSummary } from '../../../components/admin/SeatChart/SeatChart';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';
import Alert from '../../../components/common/Alert/Alert';
import Modal from '../../../components/common/Modal/Modal';
import Loader from '../../../components/common/Loader/Loader';
import styles from './AdminApplicationDetails.module.css';

export default function AdminApplicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { departments } = useSeats();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => { fetchDetails(); }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await adminService.getApplicationDetails(id);
            if (res.success) setApplication(res.data.application);
        } catch {
            setMessage({ type: 'error', text: 'Failed to load application' });
        }
        setLoading(false);
    };

    const handleAcceptClick = () => {
        setShowAcceptModal(true);
    };

    const handleAcceptConfirm = async () => {
        setShowAcceptModal(false);
        setActionLoading(true);
        try {
            const res = await adminService.acceptApplication(id);
            if (res.success) {
                setMessage({ type: 'success', text: 'Application accepted successfully!' });
                fetchDetails();
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to accept' });
        }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (rejectionReason.trim().length < 5) {
            setMessage({ type: 'error', text: 'Please provide a detailed rejection reason (minimum 5 characters)' });
            return;
        }
        setActionLoading(true);
        try {
            const res = await adminService.rejectApplication(id, rejectionReason);
            if (res.success) {
                setMessage({ type: 'success', text: 'Application rejected' });
                setShowRejectModal(false);
                setRejectionReason('');
                fetchDetails();
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject' });
        }
        setActionLoading(false);
    };

    if (loading) return <Loader fullPage />;
    if (!application) {
        return (
            <div className="page-container">
                <Alert type="error">Application not found</Alert>
            </div>
        );
    }

    const a = application;

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => navigate('/admin/applications')}>
                ← Back to Applications
            </button>

            <div className={styles.headerRow}>
                <h1 className={styles.title}>Application #{a.id}</h1>
                <Badge status={a.status} />
            </div>

            <div className={styles.section}>
                <SeatSummary departments={departments} />
            </div>

            {message.text && (
                <Alert type={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </Alert>
            )}

            {/* Applicant Info */}
            <Card title="Applicant Information" className={styles.section}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Full Name</div>
                        <div className={styles.infoValue}>{a.applicant_name}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Email</div>
                        <div className={styles.infoValue}>{a.applicant_email}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Phone</div>
                        <div className={styles.infoValue}>{a.applicant_phone}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Date of Birth</div>
                        <div className={styles.infoValue}>{new Date(a.date_of_birth).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Gender</div>
                        <div className={styles.infoValue}>{a.gender}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Category</div>
                        <div className={styles.infoValue}>{a.category}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Nationality</div>
                        <div className={styles.infoValue}>{a.nationality}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Blood Group</div>
                        <div className={styles.infoValue}>{a.blood_group || '—'}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Aadhaar Number</div>
                        <div className={styles.infoValue}>{a.aadhaar_number}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Guardian Name</div>
                        <div className={styles.infoValue}>{a.guardian_name}</div>
                    </div>
                </div>
            </Card>

            {/* Address */}
            <Card title="Address" className={styles.section}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Address</div>
                        <div className={styles.infoValue}>
                            {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>City</div>
                        <div className={styles.infoValue}>{a.city}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>State</div>
                        <div className={styles.infoValue}>{a.state}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Pincode</div>
                        <div className={styles.infoValue}>{a.pincode}</div>
                    </div>
                </div>
            </Card>

            {/* Academic */}
            <Card title="Academic Information" className={styles.section}>
                <div className={styles.infoGrid} style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>10th Board</div>
                        <div className={styles.infoValue}>{a.tenth_board}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>10th Year</div>
                        <div className={styles.infoValue}>{a.tenth_year}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>10th Percentage</div>
                        <div className={styles.infoValue}>{a.tenth_percentage}%</div>
                    </div>
                </div>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>12th Board</div>
                        <div className={styles.infoValue}>{a.twelfth_board}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>12th Year</div>
                        <div className={styles.infoValue}>{a.twelfth_year}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>12th Percentage</div>
                        <div className={styles.infoValue}>{a.twelfth_percentage}%</div>
                    </div>
                </div>
            </Card>

            {/* Department */}
            <Card title="Department Selection" className={styles.section}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Selected Department</div>
                        <div className={styles.infoValue}>{a.department_name}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>Submitted On</div>
                        <div className={styles.infoValue}>{new Date(a.submitted_at).toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </Card>

            {/* Documents */}
            <Card title="Uploaded Documents" className={styles.section}>
                <div className={styles.documentsGrid}>
                    {a.documents && a.documents.length > 0 ? (
                        Object.values(a.documents.reduce((acc, doc) => {
                            acc[doc.documentType] = doc; // Keep the latest upload for each type
                            return acc;
                        }, {})).map(doc => {
                            let docTypeLabel = doc.documentType.replace(/_/g, ' ');
                            docTypeLabel = docTypeLabel.replace(/\btenth\b/i, '10th');
                            docTypeLabel = docTypeLabel.replace(/\btwelfth\b/i, '12th');
                            
                            return (
                                <div key={doc._id} className={styles.docCard}>
                                    <div className={styles.docType}>{docTypeLabel}</div>
                                    <div className={styles.docName}>{doc.originalName}</div>
                                    <a href={adminService.getDocumentUrl(doc._id)}
                                       target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                                        View Document →
                                    </a>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ color: 'var(--gray-500)' }}>No documents uploaded</p>
                    )}
                </div>
            </Card>

            {/* Rejection Reason (if rejected) */}
            {a.status === 'Rejected' && a.rejection_reason && (
                <div className={styles.rejectionBox}>
                    <p className={styles.rejectionLabel}>Rejection Reason:</p>
                    <p className={styles.rejectionText}>{a.rejection_reason}</p>
                </div>
            )}

            {/* Action Buttons */}
            {a.status === 'Under Review' && (
                <div className={styles.actions}>
                    <Button variant="success" size="lg" onClick={handleAcceptClick} loading={actionLoading}>
                        ✓ Accept Application
                    </Button>
                    <Button variant="danger" size="lg" onClick={() => setShowRejectModal(true)}>
                        ✗ Reject Application
                    </Button>
                </div>
            )}

            {/* Submitted Notice */}
            {a.status === 'Submitted' && (
                <div className={styles.actions}>
                    <div style={{ width: '100%' }}>
                        <Alert type="info">
                            <strong>Review Unavailable:</strong> The application period is currently active. Accept and Reject actions will become available once the submission deadline has passed.
                        </Alert>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Application">
                <div className={styles.rejectForm}>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                        Please provide a reason for rejecting this application. This will be visible to the applicant.
                    </p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows={4}
                        style={{
                            width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-base)',
                            fontFamily: 'var(--font-family)', resize: 'vertical', outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button>
                    </div>
                </div>
            </Modal>

            {/* Accept Modal */}
            <Modal isOpen={showAcceptModal} onClose={() => setShowAcceptModal(false)} title="Accept Application">
                <div className={styles.rejectForm}>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                        Are you sure you want to accept this application?
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>Cancel</Button>
                        <Button variant="success" onClick={handleAcceptConfirm} loading={actionLoading}>Accept</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
