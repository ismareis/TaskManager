const GetTaskUseCase = require('@src/application/use-cases/tasks/GetTaskUseCase');
const TaskRepository = require('@src/infra/database/repositories/TaskRepository');
const AccessLevel = require('@src/domain/enums/AccessLevel');
const TaskStatus = require('@src/domain/enums/TaskStatus');
const TaskPriority = require('@src/domain/enums/TaskPriority');
const NotFoundError = require('@src/domain/errors/NotFoundError');
const ValidationError = require('@src/domain/errors/ValidationError');
const ForbiddenError = require('@src/domain/errors/ForbiddenError');

jest.mock('@src/infra/database/repositories/TaskRepository');

jest.mock('@src/domain/enums/TaskStatus', () => ({
    toPresentation: jest.fn(),
}));
jest.mock('@src/domain/enums/TaskPriority', () => ({
    toPresentation: jest.fn(),
}));

function buildTask(overrides = {}) {
    return {
        id: 1,
        userId: 10,
        title: 'Task title',
        description: 'Task description',
        status: 1,
        priority: 1,
        dueDate: new Date('2026-01-01T00:00:00Z'),
        completionDate: null,
        ...overrides,
    };
}

describe('GetTaskUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('id validation', () => {
        it.each([undefined, null, 0, ''])('should return ValidationError when id is invalid', async (id) => {
            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(GetTaskUseCase.execute(authenticatedUser, id)).rejects.toThrow(ValidationError);

            expect(TaskRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('non existent task', () => {
        it('should return NotFoundError', async () => {
            TaskRepository.findById.mockResolvedValue(null);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(GetTaskUseCase.execute(authenticatedUser, 1)).rejects.toThrow(NotFoundError);
            expect(TaskRepository.findById).toHaveBeenCalledWith(1);
        });
    });

    describe('permissions', () => {
        it('should return ForbiddenError when user is not owner or admin', async () => {
            const task = buildTask({ userId: 99 });
            TaskRepository.findById.mockResolvedValue(task);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(GetTaskUseCase.execute(authenticatedUser, task.id)).rejects.toThrow(ForbiddenError);
        });

        it('should return task when authenticated user is owner', async () => {
            const task = buildTask({ userId: 1 });
            TaskRepository.findById.mockResolvedValue(task);
            TaskStatus.toPresentation.mockReturnValue('pending');
            TaskPriority.toPresentation.mockReturnValue('low');

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            const result = await GetTaskUseCase.execute(authenticatedUser, task.id);

            expect(result.id).toBe(task.id);
            expect(result.userId).toBe(task.userId);
        });

        it('should return task when user is authenticated user is admin but not owner', async () => {
            const task = buildTask({ userId: 99 });
            TaskRepository.findById.mockResolvedValue(task);
            TaskStatus.toPresentation.mockReturnValue('pending');
            TaskPriority.toPresentation.mockReturnValue('low');

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.ADMIN };

            const result = await GetTaskUseCase.execute(authenticatedUser, task.id);

            expect(result.id).toBe(task.id);
            expect(result.userId).toBe(task.userId);
        });
    });

    describe('response presentation', () => {
        it('should return task on expected format', async () => {
            const task = buildTask({
                id: 5,
                userId: 1,
                title: 'My Task',
                description: 'My description',
                status: 2,
                priority: 3,
                dueDate: new Date('2026-02-01T00:00:00Z'),
                completionDate: new Date('2026-02-05T00:00:00Z'),
            });

            TaskRepository.findById.mockResolvedValue(task);
            TaskStatus.toPresentation.mockReturnValue('in_progress');
            TaskPriority.toPresentation.mockReturnValue('high');

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            const result = await GetTaskUseCase.execute(authenticatedUser, task.id);

            expect(TaskStatus.toPresentation).toHaveBeenCalledWith(task.status);
            expect(TaskPriority.toPresentation).toHaveBeenCalledWith(task.priority);

            expect(result).toEqual({
                id: task.id,
                userId: task.userId,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                completionDate: task.completionDate,
                priority: 'high',
                status: 'in_progress',
            });
        });
    });
});