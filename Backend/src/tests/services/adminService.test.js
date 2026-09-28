const AdminService = require('../../../src/services/adminService');
const ApplicationModel = require('../../../src/models/applicationModel');
const DepartmentModel = require('../../../src/models/departmentModel');
const { transitionSubmittedApplications } = require('../../../src/utils/deadline');
const { getPool } = require('../../../src/config/mysql');

// Mock dependencies
jest.mock('../../../src/models/applicationModel');
jest.mock('../../../src/models/departmentModel');
jest.mock('../../../src/utils/deadline');
jest.mock('../../../src/config/mysql');

describe('AdminService Decision Logic', () => {
    let mockConnection;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock connection for transaction
        mockConnection = {
            beginTransaction: jest.fn(),
            query: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn()
        };

        getPool.mockReturnValue({
            getConnection: jest.fn().mockResolvedValue(mockConnection)
        });

        // Mock lazy transition
        transitionSubmittedApplications.mockResolvedValue();
    });

    describe('acceptApplication', () => {
        it('UT-23: Admin accepts valid application and seat decreases', async () => {
            // Arrange
            ApplicationModel.findById.mockResolvedValue({
                id: 1,
                status: 'Under Review',
                department_id: 101,
                department_name: 'CSE'
            });
            DepartmentModel.decrementSeats.mockResolvedValue();

            // Act
            const result = await AdminService.acceptApplication(1);

            // Assert
            expect(result.status).toBe('Accepted');
            
            // Should start transaction
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            // Should update status to Accepted
            expect(mockConnection.query).toHaveBeenCalledWith(
                'UPDATE applications SET status = ? WHERE id = ?',
                ['Accepted', 1]
            );
            // Should decrement seats
            expect(DepartmentModel.decrementSeats).toHaveBeenCalledWith(101, mockConnection);
            // Should commit
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('UT-25: Cannot accept an application when selected department has no seats', async () => {
            // Arrange
            ApplicationModel.findById.mockResolvedValue({
                id: 1,
                status: 'Under Review',
                department_id: 101,
                department_name: 'CSE'
            });
            
            // Mock decrementSeats throwing error due to no seats
            DepartmentModel.decrementSeats.mockRejectedValue(new Error('No seats available'));

            // Act & Assert
            await expect(AdminService.acceptApplication(1)).rejects.toThrow('No seats available in CSE');
            
            // Transaction should rollback
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should block accepting an application that is not Under Review', async () => {
            // Arrange
            ApplicationModel.findById.mockResolvedValue({
                id: 1,
                status: 'Submitted'
            });

            // Act & Assert
            await expect(AdminService.acceptApplication(1)).rejects.toThrow(/Only "Under Review" applications/);
            
            // Transaction should not even start
            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
        });
    });

    describe('rejectApplication', () => {
        it('UT-24: Admin rejects application with a rejection reason (seat unchanged)', async () => {
            // Arrange
            ApplicationModel.findById.mockResolvedValue({
                id: 2,
                status: 'Under Review'
            });
            ApplicationModel.updateStatus.mockResolvedValue();

            // Act
            const result = await AdminService.rejectApplication(2, 'Marks below criteria');

            // Assert
            expect(result.status).toBe('Rejected');
            expect(result.rejectionReason).toBe('Marks below criteria');
            
            // Should update status
            expect(ApplicationModel.updateStatus).toHaveBeenCalledWith(2, 'Rejected', 'Marks below criteria');
            
            // Seats should NOT be decremented
            expect(DepartmentModel.decrementSeats).not.toHaveBeenCalled();
        });

        it('should block rejecting if no reason provided', async () => {
            // Arrange
            ApplicationModel.findById.mockResolvedValue({
                id: 2,
                status: 'Under Review'
            });

            // Act & Assert
            await expect(AdminService.rejectApplication(2, '')).rejects.toThrow('Rejection reason is required');
        });
    });
});
