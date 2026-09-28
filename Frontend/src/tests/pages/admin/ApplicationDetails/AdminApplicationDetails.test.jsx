import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdminApplicationDetails from '../../../../pages/admin/ApplicationDetails/AdminApplicationDetails';
import adminService from '../../../../services/adminService';
import { useSeats } from '../../../../hooks/useSeats';

// Mock dependencies
vi.mock('../../../../services/adminService');
vi.mock('../../../../hooks/useSeats');

const renderWithRouter = (ui) => {
    return render(
        <MemoryRouter initialEntries={['/admin/applications/1']}>
            <Routes>
                <Route path="/admin/applications/:id" element={ui} />
            </Routes>
        </MemoryRouter>
    );
};

describe('AdminApplicationDetails Page', () => {
    const mockApplication = {
        id: 1,
        applicant_name: 'John Doe',
        department_name: 'CSE',
        status: 'Under Review',
        tenth_percentage: 85,
        twelfth_percentage: 90,
        documents: [
            { _id: 1, originalName: '10th_marksheet.pdf', documentType: '10th_marksheet', mimeType: 'application/pdf' },
            { _id: 2, originalName: '12th_marksheet.pdf', documentType: '12th_marksheet', mimeType: 'application/pdf' },
            { _id: 3, originalName: 'photo.jpg', documentType: 'photo', mimeType: 'image/jpeg' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        adminService.getApplicationDetails.mockResolvedValue({ 
            success: true, 
            data: { application: mockApplication } 
        });
        useSeats.mockReturnValue({ departments: [], loading: false });
    });

    it('UT-37: Application details are displayed correctly', async () => {
        renderWithRouter(<AdminApplicationDetails />);
        
        // Wait for data to load
        await screen.findByText('John Doe');
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Application #1')).toBeInTheDocument();
        expect(screen.getByText('CSE')).toBeInTheDocument();
        expect(screen.getByText('Under Review')).toBeInTheDocument();
    });

    it('UT-38: Documents are displayed for admin review', async () => {
        renderWithRouter(<AdminApplicationDetails />);
        
        await screen.findByText('John Doe');
        
        expect(screen.getByText('10th_marksheet.pdf')).toBeInTheDocument();
        expect(screen.getByText('12th_marksheet.pdf')).toBeInTheDocument();
        expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    });

    it('Accept button works', async () => {
        adminService.acceptApplication.mockResolvedValue({ success: true });
        
        renderWithRouter(<AdminApplicationDetails />);
        await screen.findByText('John Doe');
        
        // Click primary Accept button
        const acceptBtn = screen.getByRole('button', { name: /Accept Application/i });
        fireEvent.click(acceptBtn);
        
        // Click Accept button inside modal
        const confirmAcceptBtn = screen.getAllByRole('button', { name: 'Accept' }).find(btn => !btn.textContent.includes('Accept Application'));
        fireEvent.click(confirmAcceptBtn);
        
        await waitFor(() => {
            expect(adminService.acceptApplication).toHaveBeenCalledWith("1");
        });
    });

    it('Reject button works', async () => {
        adminService.rejectApplication.mockResolvedValue({ success: true });
        
        renderWithRouter(<AdminApplicationDetails />);
        await screen.findByText('John Doe');
        
        // Click primary Reject button
        const rejectBtn = screen.getByRole('button', { name: /Reject Application/i });
        fireEvent.click(rejectBtn);
        
        // Find textarea and enter reason
        const reasonInput = screen.getByPlaceholderText('Enter rejection reason...');
        fireEvent.change(reasonInput, { target: { value: 'Marks too low' } });
        
        // Click Reject button inside modal
        const confirmRejectBtn = screen.getAllByRole('button', { name: 'Reject' }).find(btn => !btn.textContent.includes('Reject Application'));
        fireEvent.click(confirmRejectBtn);
        
        await waitFor(() => {
            expect(adminService.rejectApplication).toHaveBeenCalledWith("1", 'Marks too low');
        });
    });
});
