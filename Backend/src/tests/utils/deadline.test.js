const { transitionSubmittedApplications } = require('../../../src/utils/deadline');
const { getPool } = require('../../../src/config/mysql');

jest.mock('../../../src/config/mysql');

describe('Deadline Utils - Status Transitions', () => {
    let mockQuery;

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuery = jest.fn();
        getPool.mockReturnValue({ query: mockQuery });
    });

    it('UT-14: Submitted application should move to Under Review after deadline', async () => {
        // Arrange
        // First query gets deadline
        mockQuery.mockResolvedValueOnce([[{ value: new Date(Date.now() - 10000).toISOString() }]]);
        // Second query updates status
        mockQuery.mockResolvedValueOnce([{ affectedRows: 5 }]);

        // Act
        await transitionSubmittedApplications();

        // Assert
        expect(mockQuery).toHaveBeenNthCalledWith(2, 
            "UPDATE applications SET status = 'Under Review' WHERE status = 'Submitted'"
        );
    });

    it('should NOT move to Under Review if deadline has not passed', async () => {
        // Arrange
        // Future deadline
        mockQuery.mockResolvedValueOnce([[{ value: new Date(Date.now() + 100000).toISOString() }]]);

        // Act
        await transitionSubmittedApplications();

        // Assert
        // The update query should not be called
        expect(mockQuery).toHaveBeenCalledTimes(1); 
    });
});
