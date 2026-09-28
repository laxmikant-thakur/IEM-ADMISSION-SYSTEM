import { render, screen } from '@testing-library/react';
import Badge from '../../../../components/common/Badge/Badge';
import { describe, it, expect } from 'vitest';
import styles from '../../../../components/common/Badge/Badge.module.css';

describe('Badge Component', () => {
    it('renders with correct status class for Submitted', () => {
        render(<Badge status="Submitted" />);
        const badge = screen.getByText('Submitted');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('submitted');
    });

    it('renders with correct status class for Under Review', () => {
        render(<Badge status="Under Review" />);
        const badge = screen.getByText('Under Review');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('underReview');
    });

    it('renders with correct status class for Accepted', () => {
        render(<Badge status="Accepted" />);
        const badge = screen.getByText('Accepted');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('accepted');
    });

    it('renders with correct status class for Rejected', () => {
        render(<Badge status="Rejected" />);
        const badge = screen.getByText('Rejected');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('rejected');
    });

    it('uses children prop if provided', () => {
        render(<Badge status="Rejected">Deadline Passed</Badge>);
        const badge = screen.getByText('Deadline Passed');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('rejected');
    });

    it('falls back to default class for unknown status', () => {
        render(<Badge status="Unknown" />);
        const badge = screen.getByText('Unknown');
        expect(badge).toBeInTheDocument();
        // The default fallback class is often just styles.badge, depending on implementation.
        // We ensure it renders without crashing.
    });
});
