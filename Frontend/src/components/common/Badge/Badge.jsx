import styles from './Badge.module.css';

const variantMap = {
    'Submitted': styles.submitted,
    'Under Review': styles.underReview,
    'Accepted': styles.accepted,
    'Rejected': styles.rejected
};

export default function Badge({ status, children, className = '' }) {
    const variantClass = variantMap[status] || styles.submitted;

    return (
        <span className={`${styles.badge} ${variantClass} ${className}`}>
            {children || status}
        </span>
    );
}
