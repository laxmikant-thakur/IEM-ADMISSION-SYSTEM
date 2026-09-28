const DepartmentModel = require('../../../src/models/departmentModel');

describe('DepartmentModel - Seat Logic', () => {
    describe('decrementSeats', () => {
        it('UT-19 & UT-20: Decrements seat for specific department only', async () => {
            // Arrange
            const mockQuery = jest.fn()
                .mockResolvedValueOnce([[{ available_seats: 5 }]]) // First query: SELECT FOR UPDATE
                .mockResolvedValueOnce([{ affectedRows: 1 }]);     // Second query: UPDATE

            const mockConnection = { query: mockQuery };

            // Act
            await DepartmentModel.decrementSeats(101, mockConnection);

            // Assert
            expect(mockQuery).toHaveBeenNthCalledWith(2,
                'UPDATE departments SET available_seats = available_seats - 1 WHERE id = ? AND available_seats > 0',
                [101]
            );
        });

        it('UT-21 & UT-22: Rejects when no seats available (prevents negative seats)', async () => {
            // Arrange
            const mockConnection = {
                query: jest.fn().mockResolvedValue([{ affectedRows: 0 }]) // 0 rows updated means no seats
            };

            // Act & Assert
            await expect(DepartmentModel.decrementSeats(101, mockConnection))
                .rejects.toThrow('No seats available');
        });
    });
});
