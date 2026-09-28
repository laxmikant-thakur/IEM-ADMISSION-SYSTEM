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
        it('Accept decreases selected department seat by 1', async () => {
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
            // Should decrement seats for selected department only
            expect(DepartmentModel.decrementSeats).toHaveBeenCalledWith(101, mockConnection);
            // Should commit
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('Accept does not decrease other departments', async () => {
            // Implicitly tested above, but explicitly adding a test block
            // Arrange
            ApplicationModel.findById.mockResolvedValue({
                id: 1,
                status: 'Under Review',
                department_id: 101,
                department_name: 'CSE'
            });
            DepartmentModel.decrementSeats.mockResolvedValue();

            // Act
            await AdminService.acceptApplication(1);

            // Assert
            // It ONLY calls decrement for department 101, proving it doesn't touch others.
            expect(DepartmentModel.decrementSeats).toHaveBeenCalledTimes(1);
            expect(DepartmentModel.decrementSeats).not.toHaveBeenCalledWith(102, expect.anything());
        });

        it('Cannot accept when available seats = 0', async () => {
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

        it('Seat count never goes below 0', async () => {
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
            
            // Seat reduction logic does not happen since it throws
            expect(mockConnection.commit).not.toHaveBeenCalled();
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
        it('Reject does not decrease seats', async () => {
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

        it('Reject requires/stores reason', async () => {
            // Arrange
            ApplicationModel.findById.mockResolvedValue({
                id: 2,
                status: 'Under Review'
            });

            // Act & Assert
            await expect(AdminService.rejectApplication(2, '')).rejects.toThrow('Rejection reason is required');
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
