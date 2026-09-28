import styles from './Alert.module.css';

export default function Alert({ type = 'info', children, onClose, className = '' }) {
    return (
        <div className={`${styles.alert} ${styles[type]} ${className}`} role="alert">
            <span className={styles.message}>{children}</span>
            {onClose && (
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close alert">
                    ×
                </button>
            )}
        </div>
    );
}
