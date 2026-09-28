import { useRef } from 'react';
import styles from './FileUpload.module.css';

export default function FileUpload({
    label,
    name,
    accept = '*',
    onChange,
    error,
    file = null,
    required = false,
    className = ''
}) {
    const inputRef = useRef(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && onChange) {
            onChange(name, selectedFile);
        }
    };

    const dropzoneClasses = [
        styles.dropzone,
        error ? styles.hasError : '',
        file ? styles.hasFile : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={`${styles.uploadGroup} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={dropzoneClasses} onClick={handleClick}>
                <span className={styles.icon}>{file ? '✓' : '📄'}</span>
                {file ? (
                    <span className={styles.fileName}>{file.name}</span>
                ) : (
                    <span className={styles.text}>Click to upload file</span>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept={accept}
                onChange={handleChange}
                className={styles.hiddenInput}
            />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
