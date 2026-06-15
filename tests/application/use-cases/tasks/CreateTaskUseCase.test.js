const CreateTaskUseCase = require('@src/application/use-cases/tasks/CreateTaskUseCase'); // ajuste o caminho conforme a localização real do use case
const TaskRepository = require('@src/infra/database/repositories/TaskRepository');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const GoogleCalendarService = require('@src/infra/services/GoogleCalendarService');
const User = require('@src/domain/entities/User');
const TaskStatus = require('@src/domain/enums/TaskStatus');
const TaskPriority = require('@src/domain/enums/TaskPriority');
const AccessLevel = require('@src/domain/enums/AccessLevel');
const ValidationError = require('@src/domain/errors/ValidationError');

jest.mock('@src/infra/database/repositories/TaskRepository');
jest.mock('@src/infra/database/repositories/UserRepository');
jest.mock('@src/infra/services/GoogleCalendarService');

const authenticatedUser = { id: 1 };

function buildUser(overrides = {}) {
    return new User({
        id: 1,
        name: 'John Doe',
        username: 'johndoe',
        password: 'hashed_password_123',
        role: 'employee',
        accessLevel: AccessLevel.USER,
        disabled: false,
        tokenVersion: 1,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        ...overrides,
    });
}

function buildValidData(overrides = {}) {
    return {
        title: 'New Task',
        description: 'Some description',
        dueDate: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('CreateTaskUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('payload validation', () => {
        it('should return ValidationError when data is undefined', async () => {
            await expect(CreateTaskUseCase.execute(authenticatedUser, undefined)).rejects.toThrow(ValidationError);

            expect(UserRepository.findById).not.toHaveBeenCalled();
            expect(TaskRepository.create).not.toHaveBeenCalled();
        });

        it('should return ValidationError when data is null', async () => {
            await expect(CreateTaskUseCase.execute(authenticatedUser, null)).rejects.toThrow(ValidationError);
        });

        it('should return ValidationError when data is empty object', async () => {
            await expect(CreateTaskUseCase.execute(authenticatedUser, {})).rejects.toThrow(ValidationError);
        });
    });

    describe('user validation', () => {
        it('should return ValidationError when authenticated user doesnt exist', async () => {
            UserRepository.findById.mockResolvedValue(null);

            await expect(CreateTaskUseCase.execute(authenticatedUser, buildValidData())).rejects.toThrow(ValidationError);

            expect(UserRepository.findById).toHaveBeenCalledWith(authenticatedUser.id);
            expect(TaskRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('task validation', () => {
        beforeEach(() => {
            UserRepository.findById.mockResolvedValue(buildUser());
        });

        it('should return ValidationError when missing required fields', async () => {
            const data = buildValidData({ title: undefined });

            await expect(CreateTaskUseCase.execute(authenticatedUser, data)).rejects.toThrow(ValidationError);

            expect(TaskRepository.create).not.toHaveBeenCalled();
        });

        it('should return ValidationError when dueDate is invalid', async () => {
            const data = buildValidData({ dueDate: 'not-a-date' });

            await expect(CreateTaskUseCase.execute(authenticatedUser, data)).rejects.toThrow(ValidationError);

            expect(TaskRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('task creation', () => {
        beforeEach(() => {
            UserRepository.findById.mockResolvedValue(buildUser());
        });

        it('should create task with default status and priority', async () => {
            const createdTask = { id: 10, ...buildValidData() };
            TaskRepository.create.mockResolvedValue(createdTask);

            const result = await CreateTaskUseCase.execute(authenticatedUser, buildValidData());

            expect(TaskRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: authenticatedUser.id,
                title: 'New Task',
                description: 'Some description',
                status: TaskStatus.PENDING,
                priority: TaskPriority.LOW,
            }));
            expect(result).toBe(createdTask);
        });

        it('should create task with informed status and priority', async () => {
            const createdTask = { id: 11 };
            TaskRepository.create.mockResolvedValue(createdTask);

            const data = buildValidData({ status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH });

            await CreateTaskUseCase.execute(authenticatedUser, data);

            expect(TaskRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH,
            }));
        });

        it('should set status as COMPLETED when completionDate is informed', async () => {
            const createdTask = { id: 12 };
            TaskRepository.create.mockResolvedValue(createdTask);

            const data = buildValidData({
                status: TaskStatus.PENDING,
                completionDate: '2026-01-02T00:00:00Z',
            });

            await CreateTaskUseCase.execute(authenticatedUser, data);

            expect(TaskRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                status: TaskStatus.COMPLETED,
                completionDate: new Date('2026-01-02T00:00:00Z'),
            }));
        });
    });

    describe('Google Calendar integration', () => {
        it('should not call GoogleCalendarService when user is not google authenticated', async () => {
            UserRepository.findById.mockResolvedValue(buildUser());

            const createdTask = { id: 20 };
            TaskRepository.create.mockResolvedValue(createdTask);

            const result = await CreateTaskUseCase.execute(authenticatedUser, buildValidData());

            expect(GoogleCalendarService.createEvent).not.toHaveBeenCalled();
            expect(TaskRepository.updateCalendarEventId).not.toHaveBeenCalled();
            expect(result).toBe(createdTask);
        });

        it('should call GoogleCalendarService and update task when user is google authenticated', async () => {
            const googleUser = buildUser({
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
                googleTokenExpiry: new Date('2026-01-01T00:00:00Z'),
            });
            UserRepository.findById.mockResolvedValue(googleUser);

            const createdTask = { id: 21 };
            TaskRepository.create.mockResolvedValue(createdTask);
            GoogleCalendarService.createEvent.mockResolvedValue('google-event-id');

            const result = await CreateTaskUseCase.execute(authenticatedUser, buildValidData());

            expect(GoogleCalendarService.createEvent).toHaveBeenCalledWith(googleUser, createdTask);
            expect(TaskRepository.updateCalendarEventId).toHaveBeenCalledWith(createdTask.id, 'google-event-id');
            expect(result).toBe(createdTask);
        });

        it('should not stop task creation when GoogleCalendarService fails', async () => {
            const googleUser = buildUser({
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
                googleTokenExpiry: new Date('2026-01-01T00:00:00Z'),
            });
            UserRepository.findById.mockResolvedValue(googleUser);

            const createdTask = { id: 22 };
            TaskRepository.create.mockResolvedValue(createdTask);
            GoogleCalendarService.createEvent.mockRejectedValue(new Error('Google API error'));

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const result = await CreateTaskUseCase.execute(authenticatedUser, buildValidData());

            expect(result).toBe(createdTask);
            expect(TaskRepository.updateCalendarEventId).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it('should not call GoogleCalendarService when TaskRepository.create returns falsy', async () => {
            const googleUser = buildUser({
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
                googleTokenExpiry: new Date('2026-01-01T00:00:00Z'),
            });
            UserRepository.findById.mockResolvedValue(googleUser);
            TaskRepository.create.mockResolvedValue(null);

            const result = await CreateTaskUseCase.execute(authenticatedUser, buildValidData());

            expect(GoogleCalendarService.createEvent).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });
});