const request = require("supertest");
const app = require("@src/app");
const knex = require('@src/infra/database/knex/connection');
const PasswordHasher = require("@src/infra/services/PasswordHasher");
const AccessLevel = require("@src/domain/enums/AccessLevel");

describe("AuthController", () => {
    let authToken;
    const testUser = {
        username: "testuser",
        password: "testpassword",
    };

    beforeAll(async () => {
        await knex.migrate.latest();
        await knex("users").del();
        await knex("users").insert({
            username: testUser.username,
            password: await PasswordHasher.hash(testUser.password),
            name: "test",
            role: "test role",
            access_level: AccessLevel.ADMIN,
            token_version: 1
        });
    });

    afterAll(async () => {
        await knex.destroy();
    });

    describe("POST /auth/login", () => {
        it("should return 200 and a token with valid credentials", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send(testUser);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("token");
            expect(typeof res.body.token).toBe("string");

            authToken = res.body.token;
        });

        it("should return 401 with invalid password", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ username: testUser.username, password: "wrongpassword" });

            expect(res.status).toBe(401);
        });

        it("should return 401 with a non-existent username", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ username: "nobody", password: "irrelevant" });

            expect(res.status).toBe(401);
        });

        it("should return 400 when username is missing", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ password: testUser.password });

            expect(res.status).toBe(400);
        });

        it("should return 400 when password is missing", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ username: testUser.username });

            expect(res.status).toBe(400);
        });
    });

    describe("POST /auth/logout", () => {
        beforeEach(async () => {
            const res = await request(app)
                .post("/auth/login")
                .send(testUser);

            authToken = res.body.token;
        });

        it("should return 200 and a success message with a valid token", async () => {
            const res = await request(app)
                .post("/auth/logout")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: "Logged out successfully" });
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app)
                .post("/auth/logout");

            expect(res.status).toBe(401);
        });

        it("should return 401 when an invalid token is provided", async () => {
            const res = await request(app)
                .post("/auth/logout")
                .set("Authorization", "Bearer invalidtoken");

            expect(res.status).toBe(401);
        });
    });
});