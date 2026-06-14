const knex = require('@src/infra/database/knex/connection');
const TaskRepository = require('@src/infra/database/repositories/TaskRepository');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const Task = require('@src/domain/entities/Task');
const User = require('@src/domain/entities/User');
const TaskStatus = require('@src/domain/enums/TaskStatus');
const TaskPriority = require('@src/domain/enums/TaskPriority');
const AccessLevel = require('../../../../src/domain/enums/AccessLevel');


let testUserId;

function buildTask(overrides = {}) {
    return new Task({
        userId: testUserId,
        title: 'Test Task',
        description: 'Test description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2026-01-01T00:00:00Z'),
        completionDate: null,
        disabled: false,
        googleEventId: null,
        ...overrides,
    });
}

describe('TaskRepository', () => {
    beforeAll(async () => {
        await knex.migrate.latest();

        await knex('tasks').del();
        await knex('users').del();

        const user = await UserRepository.create(new User({
            name: 'Task Owner',
            username: 'taskowner',
            password: 'hashed_password_123',
            role: 'employee',
            accessLevel: AccessLevel.USER,
        }));

        testUserId = user.id;
    });

    afterEach(async () => {
        await knex('tasks').del();
    });

    afterAll(async () => {
        await knex('tasks').del();
        await knex('users').del();
        await knex.destroy();
    });

    describe('create', () => {
        it('should create task and return mapped to domain', async () => {
            const task = buildTask({ title: 'New Task' });

            const created = await TaskRepository.create(task);

            expect(created).toBeTruthy();
            expect(created.id).toBeDefined();
            expect(created.userId).toBe(testUserId);
            expect(created.title).toBe('New Task');
            expect(created.description).toBe(task.description);
            expect(created.status).toBe(task.status);
            expect(created.priority).toBe(task.priority);
            expect(created.disabled).toBe(false);
            expect(created.completionDate).toBeNull();
            expect(created.dueDate).toEqual(task.dueDate);
        });
    });

    describe('findById', () => {
        it('should return task when exists and not disabled', async () => {
            const created = await TaskRepository.create(buildTask({ title: 'FindById Task' }));

            const found = await TaskRepository.findById(created.id);

            expect(found).toBeTruthy();
            expect(found.id).toBe(created.id);
            expect(found.title).toBe('FindById Task');
        });

        it('should not return disabled task', async () => {
            const created = await TaskRepository.create(buildTask({ title: 'Disabled Task', disabled: true }));

            const found = await TaskRepository.findById(created.id);

            expect(found).toBeFalsy();
        });

        it('should return empty when id doesnt exist', async () => {
            const found = await TaskRepository.findById(999999);

            expect(found).toBeFalsy();
        });
    });

    describe('findByUserId', () => {
        let taskA, taskB, taskC;

        beforeEach(async () => {
            taskA = await TaskRepository.create(buildTask({
                title: 'Buy groceries',
                status: TaskStatus.PENDING,
                priority: TaskPriority.LOW,
                dueDate: new Date('2026-01-01T00:00:00Z'),
                completionDate: null,
            }));

            taskB = await TaskRepository.create(buildTask({
                title: 'Finish report',
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH,
                dueDate: new Date('2026-02-01T00:00:00Z'),
                completionDate: null,
            }));

            taskC = await TaskRepository.create(buildTask({
                title: 'Clean house',
                status: TaskStatus.COMPLETED,
                priority: TaskPriority.MEDIUM,
                dueDate: new Date('2026-03-01T00:00:00Z'),
                completionDate: new Date('2026-02-25T00:00:00Z'),
            }));

            await TaskRepository.create(buildTask({
                title: 'Disabled task',
                disabled: true,
            }));
        });

        it('should return all tasks that arent disabled', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId);

            expect(tasks).toHaveLength(3);
            expect(tasks.map((t) => t.title)).toEqual(['Buy groceries', 'Finish report', 'Clean house']);
        });

        it('should filter by status', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, { status: TaskStatus.IN_PROGRESS });

            expect(tasks).toHaveLength(1);
            expect(tasks[0].id).toBe(taskB.id);
        });

        it('should filter by priority', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, { priority: TaskPriority.HIGH });

            expect(tasks).toHaveLength(1);
            expect(tasks[0].id).toBe(taskB.id);
        });

        it('should filter by dueBefore', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, {
                dueBefore: new Date('2026-01-15T00:00:00Z'),
            });

            expect(tasks).toHaveLength(1);
            expect(tasks[0].id).toBe(taskA.id);
        });

        it('should filter by dueAfter', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, {
                dueAfter: new Date('2026-02-01T00:00:00Z'),
            });

            expect(tasks).toHaveLength(2);
            expect(tasks.map((t) => t.id)).toEqual(expect.arrayContaining([taskB.id, taskC.id]));
        });

        it('should filter by completed = true', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, { completed: true });

            expect(tasks).toHaveLength(1);
            expect(tasks[0].id).toBe(taskC.id);
        });

        it('should filter by completed = false', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, { completed: false });

            expect(tasks).toHaveLength(2);
            expect(tasks.map((t) => t.id)).toEqual(expect.arrayContaining([taskA.id, taskB.id]));
        });

        it('should filter by title', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, { title: 'report' });

            expect(tasks).toHaveLength(1);
            expect(tasks[0].id).toBe(taskB.id);
        });

        it('should order by custom field and order desc', async () => {
            const tasks = await TaskRepository.findByUserId(testUserId, { sortBy: 'title', order: 'desc' });

            expect(tasks.map((t) => t.title)).toEqual(['Finish report', 'Clean house', 'Buy groceries']);
        });

        it('should not return another users tasks', async () => {
            const otherUser = await UserRepository.create(new User({
                name: 'Other User',
                username: 'otheruser',
                password: 'hashed_password_123',
                role: 'employee',
                accessLevel: AccessLevel.USER,
            }));

            await TaskRepository.create(buildTask({ userId: otherUser.id, title: 'Other user task' }));

            const tasks = await TaskRepository.findByUserId(testUserId);

            expect(tasks.every((t) => t.userId === testUserId)).toBe(true);
        });
    });

    describe('update', () => {
        it('should update existent task', async () => {
            const created = await TaskRepository.create(buildTask({ title: 'Old title' }));

            const toUpdate = buildTask({
                id: created.id,
                title: 'New title',
                status: TaskStatus.COMPLETED,
                completionDate: new Date('2026-01-10T00:00:00Z'),
            });

            const updated = await TaskRepository.update(toUpdate);

            expect(updated.id).toBe(created.id);
            expect(updated.title).toBe('New title');
            expect(updated.status).toBe(TaskStatus.COMPLETED);
            expect(updated.completionDate).toEqual(new Date('2026-01-10T00:00:00Z'));

            const reloaded = await TaskRepository.findById(created.id);
            expect(reloaded.title).toBe('New title');
            expect(reloaded.completionDate).toEqual(new Date('2026-01-10T00:00:00Z'));
        });
    });

    describe('updateCalendarEventId', () => {
        it('should update google_event_id task', async () => {
            const created = await TaskRepository.create(buildTask());

            await TaskRepository.updateCalendarEventId(created.id, 'google-event-123');

            const reloaded = await TaskRepository.findById(created.id);
            expect(reloaded.googleEventId).toBe('google-event-123');
        });
    });
});