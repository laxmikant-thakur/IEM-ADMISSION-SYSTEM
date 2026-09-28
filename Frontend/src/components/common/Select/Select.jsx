import styles from './Select.module.css';

export default function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    placeholder = 'Select an option',
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className={`${styles.selectGroup} ${className}`}>
            {label && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`${styles.select} ${error ? styles.hasError : ''}`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
