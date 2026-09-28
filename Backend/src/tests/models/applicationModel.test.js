const ApplicationModel = require('../../../src/models/applicationModel');
const { getPool } = require('../../../src/config/mysql');

jest.mock('../../../src/config/mysql');

describe('ApplicationModel - Filters', () => {
    let mockQuery;

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuery = jest.fn();
        getPool.mockReturnValue({ query: mockQuery });
        mockQuery.mockResolvedValue([[]]); // Default mock return
    });

    it('UT-26: Accepted filter displays accepted students', async () => {
        await ApplicationModel.findStudents({ status: 'Accepted' });
        
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE a.status = ?'),
            ['Accepted']
        );
    });

    it('UT-27: Rejected filter displays rejected students', async () => {
        await ApplicationModel.findStudents({ status: 'Rejected' });
        
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE a.status = ?'),
            ['Rejected']
        );
    });

    it('UT-28: Awaiting Review filter displays only pending-review applications', async () => {
        await ApplicationModel.findStudents({ status: 'Under Review' });
        
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE a.status = ?'),
            ['Under Review']
        );
    });

    it('UT-29: Department filter displays only students from selected department', async () => {
        await ApplicationModel.findStudents({ department_id: 101 });
        
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE a.department_id = ?'),
            [101]
        );
    });

    it('UT-30: Status + department filtering works together', async () => {
        await ApplicationModel.findStudents({ status: 'Accepted', department_id: 101 });
        
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE a.status = ? AND a.department_id = ?'),
            ['Accepted', 101]
        );
    });
});
