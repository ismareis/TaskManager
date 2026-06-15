const request = require("supertest");
const app = require("@src/app");
const knex = require("@src/infra/database/knex/connection");
const PasswordHasher = require("@src/infra/services/PasswordHasher");
const AccessLevel = require("@src/domain/enums/AccessLevel");
const TaskStatus = require("@src/domain/enums/TaskStatus");
const TaskPriority = require("@src/domain/enums/TaskPriority");

describe("TaskController", () => {
    let userToken;
    let adminToken;
    let userId;
    let otherUserId;
    let userTaskId;
    let otherUserTaskId;

    const testUser = {
        username: "taskuser",
        password: "testpassword",
    };

    const adminUser = {
        username: "taskadmin",
        password: "adminpassword",
    };

    async function createUser({ username, password, accessLevel }) {
        await knex("users").insert({
            username,
            password: await PasswordHasher.hash(password),
            name: username,
            role: "employee",
            access_level: accessLevel,
            token_version: 1,
            disabled: false
        });

        const user = await knex("users")
            .where({ username })
            .first();

        return user.id;
    }

    async function createTask(userId, title) {
        await knex("tasks").insert({
            user_id: userId,
            title,
            description: "Task description",
            status: TaskStatus.PENDING,
            priority: TaskPriority.LOW,
            due_date: new Date("2026-01-01T00:00:00Z"),
            completion_date: null,
            disabled: false
        });

        const task = await knex("tasks")
            .where({ title })
            .first();

        return task.id;
    }

    beforeAll(async () => {
        await knex.migrate.latest();

        await knex("tasks").del();
        await knex("users").del();

        userId = await createUser({
            username: testUser.username,
            password: testUser.password,
            accessLevel: AccessLevel.USER
        });

        await createUser({
            username: adminUser.username,
            password: adminUser.password,
            accessLevel: AccessLevel.ADMIN
        });

        otherUserId = await createUser({
            username: "othertaskuser",
            password: "otherpassword",
            accessLevel: AccessLevel.USER
        });

        const userLogin = await request(app)
            .post("/auth/login")
            .send(testUser);

        userToken = userLogin.body.token;

        const adminLogin = await request(app)
            .post("/auth/login")
            .send(adminUser);

        adminToken = adminLogin.body.token;
    });

    beforeEach(async () => {
        await knex("tasks").del();

        userTaskId = await createTask(userId, "User task");
        otherUserTaskId = await createTask(otherUserId, "Other user task");
    });

    afterAll(async () => {
        await knex("tasks").del();
        await knex("users").del();
        await knex.destroy();
    });

    describe("GET /tasks", () => {
        it("should return 200 and authenticated user tasks", async () => {
            const res = await request(app)
                .get("/tasks")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("tasks");
            expect(Array.isArray(res.body.tasks)).toBe(true);
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app)
                .get("/tasks");

            expect(res.status).toBe(401);
        });
    });

    describe("GET /tasks/:id", () => {
        it("should return 200 when user is task owner", async () => {
            const res = await request(app)
                .get(`/tasks/${userTaskId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(userTaskId);
        });

        it("should return 200 when user is admin", async () => {
            const res = await request(app)
                .get(`/tasks/${otherUserTaskId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(otherUserTaskId);
        });

        it("should return 403 when user is not owner or admin", async () => {
            const res = await request(app)
                .get(`/tasks/${otherUserTaskId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });

        it("should return 404 when task does not exist", async () => {
            const res = await request(app)
                .get("/tasks/999999")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe("POST /tasks", () => {
        it("should return 201 and task id when task is created", async () => {
            const res = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "New task",
                    description: "New task description",
                    dueDate: "2026-02-01T00:00:00Z"
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        it("should return 400 when required fields are missing", async () => {
            const res = await request(app)
                .post("/tasks")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    description: "Missing title"
                });

            expect(res.status).toBe(400);
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app)
                .post("/tasks")
                .send({
                    title: "New task",
                    description: "New task description",
                    dueDate: "2026-02-01T00:00:00Z"
                });

            expect(res.status).toBe(401);
        });
    });

    describe("PUT /tasks/:id", () => {
        it("should return 200 when user is task owner", async () => {
            const res = await request(app)
                .put(`/tasks/${userTaskId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Updated task"
                });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(userTaskId);
            expect(res.body.title).toBe("Updated task");
        });

        it("should return 403 when user is not owner or admin", async () => {
            const res = await request(app)
                .put(`/tasks/${otherUserTaskId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Invalid update"
                });

            expect(res.status).toBe(403);
        });

        it("should return 400 when body is empty", async () => {
            const res = await request(app)
                .put(`/tasks/${userTaskId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe("DELETE /tasks/:id", () => {
        it("should return 204 when user is task owner", async () => {
            const res = await request(app)
                .delete(`/tasks/${userTaskId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(204);
        });

        it("should return 403 when user is not owner or admin", async () => {
            const res = await request(app)
                .delete(`/tasks/${otherUserTaskId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });

        it("should return 404 when task does not exist", async () => {
            const res = await request(app)
                .delete("/tasks/999999")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(404);
        });
    });
});