const UpdateTaskUseCase = require('@src/application/use-cases/tasks/UpdateTaskUseCase');
const TaskRepository = require('@src/infra/database/repositories/TaskRepository');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const GoogleCalendarService = require('@src/infra/services/GoogleCalendarService');
const TaskStatus = require('@src/domain/enums/TaskStatus');
const TaskPriority = require('@src/domain/enums/TaskPriority');
const AccessLevel = require('@src/domain/enums/AccessLevel');
const NotFoundError = require('@src/domain/errors/NotFoundError');
const ValidationError = require('@src/domain/errors/ValidationError');
const ForbiddenError = require('@src/domain/errors/ForbiddenError');

jest.mock('@src/infra/database/repositories/TaskRepository');
jest.mock('@src/infra/database/repositories/UserRepository');
jest.mock('@src/infra/services/GoogleCalendarService');

function buildTask(overrides = {}) {
    return {
        id: 1,
        userId: 1,
        title: 'Old title',
        description: 'Old description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        dueDate: new Date('2026-01-01T00:00:00Z'),
        completionDate: null,
        googleEventId: null,
        validate: jest.fn().mockReturnValue({
            isValid: true,
            errors: []
        }),
        ...overrides,
    };
}

function buildUser(overrides = {}) {
    return {
        id: 1,
        isGoogleAuthenticated: jest.fn().mockReturnValue(false),
        ...overrides,
    };
}

describe('UpdateTaskUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('payload validation', () => {
        it('should return ValidationError when id is invalid', async () => {
            await expect(
                UpdateTaskUseCase.execute({ id: 1 }, null, { title: 'New title' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findById).not.toHaveBeenCalled();
        });

        it('should return ValidationError when data is empty', async () => {
            await expect(
                UpdateTaskUseCase.execute({ id: 1 }, 1, {})
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('task validation', () => {
        it('should return NotFoundError when task doesnt exist', async () => {
            TaskRepository.findById.mockResolvedValue(null);

            await expect(
                UpdateTaskUseCase.execute({ id: 1 }, 1, { title: 'New title' })
            ).rejects.toThrow(NotFoundError);

            expect(TaskRepository.findById).toHaveBeenCalledWith(1);
            expect(TaskRepository.update).not.toHaveBeenCalled();
        });

        it('should return ForbiddenError when user is not owner or admin', async () => {
            const task = buildTask({ userId: 99 });
            TaskRepository.findById.mockResolvedValue(task);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateTaskUseCase.execute(authenticatedUser, task.id, { title: 'New title' })
            ).rejects.toThrow(ForbiddenError);

            expect(TaskRepository.update).not.toHaveBeenCalled();
        });

        it('should return ValidationError when task entity validation fails', async () => {
            const task = buildTask({
                validate: jest.fn().mockReturnValue({
                    isValid: false,
                    errors: ['Invalid task']
                })
            });

            TaskRepository.findById.mockResolvedValue(task);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateTaskUseCase.execute(authenticatedUser, task.id, { title: '' })
            ).rejects.toThrow(ValidationError);

            expect(TaskRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('task update', () => {
        it('should update task when authenticated user is owner', async () => {
            const task = buildTask({ id: 10, userId: 1 });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockImplementation(async (updatedTask) => updatedTask);
            UserRepository.findById.mockResolvedValue(buildUser());

            const result = await UpdateTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id,
                {
                    title: 'New title',
                    description: 'New description',
                    dueDate: '2026-02-01T00:00:00Z',
                    status: TaskStatus.IN_PROGRESS,
                    priority: TaskPriority.HIGH
                }
            );

            expect(TaskRepository.update).toHaveBeenCalledWith(expect.objectContaining({
                id: task.id,
                title: 'New title',
                description: 'New description',
                dueDate: new Date('2026-02-01T00:00:00Z'),
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH
            }));

            expect(result.title).toBe('New title');
        });

        it('should update task when authenticated user is admin', async () => {
            const task = buildTask({ id: 11, userId: 99 });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockImplementation(async (updatedTask) => updatedTask);
            UserRepository.findById.mockResolvedValue(buildUser());

            const result = await UpdateTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.ADMIN },
                task.id,
                { title: 'Admin updated task' }
            );

            expect(TaskRepository.update).toHaveBeenCalledWith(expect.objectContaining({
                id: task.id,
                title: 'Admin updated task'
            }));

            expect(result.title).toBe('Admin updated task');
        });

        it('should set status as COMPLETED when completionDate is informed', async () => {
            const task = buildTask({
                id: 12,
                userId: 1,
                status: TaskStatus.PENDING
            });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockImplementation(async (updatedTask) => updatedTask);
            UserRepository.findById.mockResolvedValue(buildUser());

            await UpdateTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id,
                { completionDate: '2026-02-05T00:00:00Z' }
            );

            expect(TaskRepository.update).toHaveBeenCalledWith(expect.objectContaining({
                completionDate: new Date('2026-02-05T00:00:00Z'),
                status: TaskStatus.COMPLETED
            }));
        });
    });

    describe('Google Calendar integration', () => {
        it('should not call GoogleCalendarService when user is not google authenticated', async () => {
            const task = buildTask({ googleEventId: 'google-event-id' });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(buildUser());

            await UpdateTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id,
                { title: 'New title' }
            );

            expect(GoogleCalendarService.updateEvent).not.toHaveBeenCalled();
            expect(GoogleCalendarService.createEvent).not.toHaveBeenCalled();
        });

        it('should update google event when task has googleEventId', async () => {
            const task = buildTask({ googleEventId: 'google-event-id' });
            const user = buildUser({
                isGoogleAuthenticated: jest.fn().mockReturnValue(true)
            });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(user);

            await UpdateTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id,
                { title: 'New title' }
            );

            expect(GoogleCalendarService.updateEvent).toHaveBeenCalledWith(user, task);
            expect(GoogleCalendarService.createEvent).not.toHaveBeenCalled();
        });

        it('should create google event when task does not have googleEventId', async () => {
            const task = buildTask({ googleEventId: null });
            const user = buildUser({
                isGoogleAuthenticated: jest.fn().mockReturnValue(true)
            });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(user);
            GoogleCalendarService.createEvent.mockResolvedValue('new-event-id');

            await UpdateTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id,
                { title: 'New title' }
            );

            expect(GoogleCalendarService.createEvent).toHaveBeenCalledWith(user, task);
            expect(TaskRepository.updateCalendarEventId).toHaveBeenCalledWith(task.id, 'new-event-id');
        });

        it('should clear googleEventId when GoogleCalendarService returns 404', async () => {
            const task = buildTask({ googleEventId: 'google-event-id' });
            const user = buildUser({
                isGoogleAuthenticated: jest.fn().mockReturnValue(true)
            });

            const error = new Error('Event not found');
            error.code = 404;

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(user);
            GoogleCalendarService.updateEvent.mockRejectedValue(error);

            await UpdateTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id,
                { title: 'New title' }
            );

            expect(TaskRepository.updateCalendarEventId).toHaveBeenCalledWith(task.id, null);
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });
});