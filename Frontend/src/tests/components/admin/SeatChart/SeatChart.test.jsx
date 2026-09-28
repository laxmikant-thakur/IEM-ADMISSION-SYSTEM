import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SeatChart, { SeatSummary } from '../../../../components/admin/SeatChart/SeatChart';

// Mock chart.js to prevent canvas errors during test
vi.mock('react-chartjs-2', () => ({
    Doughnut: () => <div data-testid="mock-doughnut"></div>
}));

describe('SeatChart Component', () => {
    const mockDept = { name: 'CSE', availableSeats: 2, totalSeats: 6 };

    it('UT-31: Seat chart displays department name', () => {
        render(<SeatChart department={mockDept} />);
        expect(screen.getByText('CSE')).toBeInTheDocument();
    });

    it('UT-32: Seat chart displays Available / Total', () => {
        render(<SeatChart department={mockDept} />);
        expect(screen.getByText((content, element) => element.textContent.replace(/\s+/g, '') === '2/6')).toBeInTheDocument();
        expect(screen.getByText('seats')).toBeInTheDocument();
    });
});

describe('SeatSummary Component', () => {
    const mockDepartments = [
        { id: 1, name: 'CSE', availableSeats: 2, totalSeats: 6 },
        { id: 2, name: 'ECE', availableSeats: 6, totalSeats: 6 }
    ];

    it('UT-33: Seat chart updates correctly when seat data changes', () => {
        const { rerender } = render(
            <SeatSummary departments={mockDepartments} />
        );
        
        expect(screen.getByText((content, element) => element.textContent.replace(/\s+/g, '') === '2/6')).toBeInTheDocument();
        
        // Rerender with updated data
        const updatedDepartments = [
            { id: 1, name: 'CSE', availableSeats: 1, totalSeats: 6 },
            { id: 2, name: 'ECE', availableSeats: 6, totalSeats: 6 }
        ];
        
        rerender(<SeatSummary departments={updatedDepartments} />);
        
        // Old text should be gone, new one should appear
        expect(screen.queryByText((content, element) => element.textContent.replace(/\s+/g, '') === '2/6')).not.toBeInTheDocument();
        expect(screen.getByText((content, element) => element.textContent.replace(/\s+/g, '') === '1/6')).toBeInTheDocument();
    });
});
