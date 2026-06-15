const DeleteTaskUseCase = require('@src/application/use-cases/tasks/DeleteTaskUseCase');
const TaskRepository = require('@src/infra/database/repositories/TaskRepository');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const GoogleCalendarService = require('@src/infra/services/GoogleCalendarService');
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
        disabled: false,
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

describe('DeleteTaskUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('id validation', () => {
        it.each([undefined, null, 0, ''])('should return ValidationError when id is invalid', async (id) => {
            await expect(DeleteTaskUseCase.execute({ id: 1 }, id)).rejects.toThrow(ValidationError);

            expect(TaskRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('task validation', () => {
        it('should return NotFoundError when task doesnt exist', async () => {
            TaskRepository.findById.mockResolvedValue(null);

            await expect(DeleteTaskUseCase.execute({ id: 1 }, 1)).rejects.toThrow(NotFoundError);

            expect(TaskRepository.findById).toHaveBeenCalledWith(1);
            expect(TaskRepository.update).not.toHaveBeenCalled();
        });

        it('should return ForbiddenError when user is not owner or admin', async () => {
            const task = buildTask({ userId: 99 });
            TaskRepository.findById.mockResolvedValue(task);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(DeleteTaskUseCase.execute(authenticatedUser, task.id)).rejects.toThrow(ForbiddenError);

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

            await expect(DeleteTaskUseCase.execute(authenticatedUser, task.id)).rejects.toThrow(ValidationError);

            expect(task.disabled).toBe(true);
            expect(TaskRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('task deletion', () => {
        it('should disable task when authenticated user is owner', async () => {
            const task = buildTask({ id: 10, userId: 1 });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(buildUser());

            await DeleteTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id
            );

            expect(task.disabled).toBe(true);
            expect(task.validate).toHaveBeenCalled();
            expect(TaskRepository.update).toHaveBeenCalledWith(task);
        });

        it('should disable task when authenticated user is admin', async () => {
            const task = buildTask({ id: 11, userId: 99 });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(buildUser());

            await DeleteTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.ADMIN },
                task.id
            );

            expect(task.disabled).toBe(true);
            expect(TaskRepository.update).toHaveBeenCalledWith(task);
        });

        it('should not search user when repository update returns falsy', async () => {
            const task = buildTask({ id: 12, userId: 1 });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(null);

            await DeleteTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id
            );

            expect(UserRepository.findById).not.toHaveBeenCalled();
            expect(GoogleCalendarService.deleteEvent).not.toHaveBeenCalled();
        });
    });

    describe('Google Calendar integration', () => {
        it('should not call GoogleCalendarService when user is not google authenticated', async () => {
            const task = buildTask({ googleEventId: 'google-event-id' });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(buildUser());

            await DeleteTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id
            );

            expect(GoogleCalendarService.deleteEvent).not.toHaveBeenCalled();
            expect(TaskRepository.updateCalendarEventId).not.toHaveBeenCalled();
        });

        it('should not call GoogleCalendarService when task does not have googleEventId', async () => {
            const task = buildTask({ googleEventId: null });
            const user = buildUser({
                isGoogleAuthenticated: jest.fn().mockReturnValue(true)
            });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(user);

            await DeleteTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id
            );

            expect(GoogleCalendarService.deleteEvent).not.toHaveBeenCalled();
            expect(TaskRepository.updateCalendarEventId).not.toHaveBeenCalled();
        });

        it('should delete google event and clear googleEventId', async () => {
            const task = buildTask({ googleEventId: 'google-event-id' });
            const user = buildUser({
                isGoogleAuthenticated: jest.fn().mockReturnValue(true)
            });

            TaskRepository.findById.mockResolvedValue(task);
            TaskRepository.update.mockResolvedValue(task);
            UserRepository.findById.mockResolvedValue(user);

            await DeleteTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id
            );

            expect(GoogleCalendarService.deleteEvent).toHaveBeenCalledWith(user, task);
            expect(TaskRepository.updateCalendarEventId).toHaveBeenCalledWith(task.id, null);
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
            GoogleCalendarService.deleteEvent.mockRejectedValue(error);

            await DeleteTaskUseCase.execute(
                { id: 1, accessLevel: AccessLevel.USER },
                task.id
            );

            expect(TaskRepository.updateCalendarEventId).toHaveBeenCalledWith(task.id, null);
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });
});