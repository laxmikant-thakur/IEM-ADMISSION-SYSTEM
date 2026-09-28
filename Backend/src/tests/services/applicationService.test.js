const ApplicationService = require('../../../src/services/applicationService');
const ApplicationModel = require('../../../src/models/applicationModel');
const DepartmentModel = require('../../../src/models/departmentModel');
const DocumentService = require('../../../src/services/documentService');
const { isDeadlinePassed } = require('../../../src/utils/deadline');

jest.mock('../../../src/models/applicationModel');
jest.mock('../../../src/models/departmentModel');
jest.mock('../../../src/services/documentService');
jest.mock('../../../src/utils/deadline');
jest.mock('../../../src/utils/validation', () => ({
    validateApplication: jest.fn().mockReturnValue(null) // Valid by default
}));

describe('ApplicationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        isDeadlinePassed.mockResolvedValue(false);
    });

    describe('submitApplication', () => {
        it('UT-17: Submitting an application must not reduce seats', async () => {
            // Arrange
            ApplicationModel.findByApplicantId.mockResolvedValue(null); // No existing app
            DepartmentModel.findById.mockResolvedValue({ id: 101, name: 'CSE', availableSeats: 6 });
            ApplicationModel.create.mockResolvedValue(1);
            DocumentService.uploadMultipleDocuments.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
            
            const files = {
                photo: [{}], tenth_marksheet: [{}], twelfth_marksheet: [{}], aadhaar_card: [{}]
            };

            // Act
            const result = await ApplicationService.submitApplication(1, { department_id: 101 }, files);

            // Assert
            expect(result.status).toBe('Submitted');
            expect(ApplicationModel.create).toHaveBeenCalled();
            // Crucially, decrementSeats should NOT be called on submit
            expect(DepartmentModel.decrementSeats).not.toHaveBeenCalled();
        });
    });
});
