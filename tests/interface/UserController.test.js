const request = require("supertest");
const app = require("@src/app");
const knex = require("@src/infra/database/knex/connection");
const PasswordHasher = require("@src/infra/services/PasswordHasher");
const AccessLevel = require("@src/domain/enums/AccessLevel");

describe("UserController", () => {
    let userToken;
    let adminToken;
    let userId;
    let otherUserId;

    const testUser = {
        username: "controlleruser",
        password: "testpassword",
    };

    const adminUser = {
        username: "controlleradmin",
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

    async function login(user) {
        const res = await request(app)
            .post("/auth/login")
            .send(user);

        return res.body.token;
    }

    beforeAll(async () => {
        await knex.migrate.latest();
    });

    beforeEach(async () => {
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
            username: "othercontrolleruser",
            password: "otherpassword",
            accessLevel: AccessLevel.USER
        });

        userToken = await login(testUser);
        adminToken = await login(adminUser);
    });

    afterAll(async () => {
        await knex("tasks").del();
        await knex("users").del();
        await knex.destroy();
    });

    describe("GET /users/:id", () => {
        it("should return 200 when user exists", async () => {
            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(userId);
            expect(res.body.username).toBe(testUser.username);
        });

        it("should return 404 when user does not exist", async () => {
            const res = await request(app)
                .get("/users/999999")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(404);
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app)
                .get(`/users/${userId}`);

            expect(res.status).toBe(401);
        });
    });

    describe("POST /users", () => {
        it("should return 201 and user id when user is created", async () => {
            const res = await request(app)
                .post("/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Created User",
                    username: "createduser",
                    password: "createdpassword",
                    role: "employee"
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        it("should return 400 when required fields are missing", async () => {
            const res = await request(app)
                .post("/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Invalid User"
                });

            expect(res.status).toBe(400);
        });

        it("should return 409 when username already exists", async () => {
            const res = await request(app)
                .post("/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Duplicated User",
                    username: testUser.username,
                    password: "123456",
                    role: "employee"
                });

            expect(res.status).toBe(409);
        });
    });

    describe("PUT /users/:id", () => {
        it("should return 200 when user updates himself", async () => {
            const res = await request(app)
                .put(`/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    name: "Updated User"
                });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(userId);
            expect(res.body.name).toBe("Updated User");
        });

        it("should return 200 when admin updates another user", async () => {
            const res = await request(app)
                .put(`/users/${otherUserId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Admin Updated User"
                });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(otherUserId);
            expect(res.body.name).toBe("Admin Updated User");
        });

        it("should return 403 when user tries to update another user", async () => {
            const res = await request(app)
                .put(`/users/${otherUserId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    name: "Invalid Update"
                });

            expect(res.status).toBe(403);
        });

        it("should return 400 when body is empty", async () => {
            const res = await request(app)
                .put(`/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe("DELETE /users/:id", () => {
        it("should return 204 when user deletes himself", async () => {
            const res = await request(app)
                .delete(`/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(204);
        });

        it("should return 204 when admin deletes another user", async () => {
            const res = await request(app)
                .delete(`/users/${otherUserId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(204);
        });

        it("should return 403 when user tries to delete another user", async () => {
            const res = await request(app)
                .delete(`/users/${otherUserId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });

        it("should return 404 when user does not exist", async () => {
            const res = await request(app)
                .delete("/users/999999")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
        });
    });
});