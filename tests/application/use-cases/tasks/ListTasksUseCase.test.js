const ListTasksUseCase = require('@src/application/use-cases/tasks/ListTasksUseCase');
const TaskRepository = require('@src/infra/database/repositories/TaskRepository');
const TaskStatus = require('@src/domain/enums/TaskStatus');
const TaskPriority = require('@src/domain/enums/TaskPriority');
const ValidationError = require('@src/domain/errors/ValidationError');

jest.mock('@src/infra/database/repositories/TaskRepository');

function buildTask(overrides = {}) {
    return {
        id: 1,
        userId: 1,
        title: 'Task title',
        description: 'Task description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        dueDate: new Date('2026-01-01T00:00:00Z'),
        completionDate: null,
        ...overrides,
    };
}

describe('ListTasksUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('filter validation', () => {
        it('should return ValidationError when status filter is invalid', async () => {
            await expect(
                ListTasksUseCase.execute({ id: 1 }, { status: 'invalid' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should return ValidationError when priority filter is invalid', async () => {
            await expect(
                ListTasksUseCase.execute({ id: 1 }, { priority: 'invalid' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should return ValidationError when date filter is invalid', async () => {
            await expect(
                ListTasksUseCase.execute({ id: 1 }, { dueBefore: 'not-a-date' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should return ValidationError when completed filter is invalid', async () => {
            await expect(
                ListTasksUseCase.execute({ id: 1 }, { completed: 'maybe' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should return ValidationError when sortBy filter is invalid', async () => {
            await expect(
                ListTasksUseCase.execute({ id: 1 }, { sortBy: 'invalidField' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should return ValidationError when order filter is invalid', async () => {
            await expect(
                ListTasksUseCase.execute({ id: 1 }, { order: 'invalidOrder' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findByUserId).not.toHaveBeenCalled();
        });
    });

    describe('task listing', () => {
        it('should call repository with authenticated user id and empty filters', async () => {
            TaskRepository.findByUserId.mockResolvedValue([]);

            const result = await ListTasksUseCase.execute({ id: 1 });

            expect(TaskRepository.findByUserId).toHaveBeenCalledWith(1, {});
            expect(result).toEqual({ tasks: [] });
        });

        it('should parse filters and send them to repository', async () => {
            TaskRepository.findByUserId.mockResolvedValue([]);

            await ListTasksUseCase.execute({ id: 1 }, {
                status: 'completed',
                priority: 'high',
                dueBefore: '2026-02-01',
                dueAfter: '2026-01-01',
                completed: 'false',
                title: '  Study  ',
                sortBy: 'dueDate',
                order: 'desc'
            });

            expect(TaskRepository.findByUserId).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    status: TaskStatus.COMPLETED,
                    priority: TaskPriority.HIGH,
                    completed: false,
                    title: 'Study',
                    sortBy: 'due_date',
                    order: 'desc'
                })
            );

            const filters = TaskRepository.findByUserId.mock.calls[0][1];

            expect(filters.dueBefore).toBeInstanceOf(Date);
            expect(filters.dueAfter).toBeInstanceOf(Date);
        });

        it('should parse numeric status and priority filters', async () => {
            TaskRepository.findByUserId.mockResolvedValue([]);

            await ListTasksUseCase.execute({ id: 1 }, {
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.MEDIUM
            });

            expect(TaskRepository.findByUserId).toHaveBeenCalledWith(1, {
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.MEDIUM
            });
        });

        it('should ignore empty title filter', async () => {
            TaskRepository.findByUserId.mockResolvedValue([]);

            await ListTasksUseCase.execute({ id: 1 }, {
                title: '   '
            });

            expect(TaskRepository.findByUserId).toHaveBeenCalledWith(1, {});
        });

        it('should return tasks on expected format', async () => {
            const task = buildTask({
                id: 5,
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH
            });

            TaskRepository.findByUserId.mockResolvedValue([task]);

            const result = await ListTasksUseCase.execute({ id: 1 });

            expect(result).toEqual({
                tasks: [
                    {
                        id: task.id,
                        userId: task.userId,
                        title: task.title,
                        description: task.description,
                        dueDate: task.dueDate,
                        completionDate: task.completionDate,
                        priority: TaskPriority.toPresentation(task.priority),
                        status: TaskStatus.toPresentation(task.status)
                    }
                ]
            });
        });
    });
});