require('dotenv').config();

const express = require("express");
const app = express();

const authRoutes = require('./interface/routes/auth.routes');
const userRoutes = require('./interface/routes/user.routes');
const taskRoutes = require('./interface/routes/task.routes');

const errorHandlerMiddleware = require('./interface/middleware/errorHandler');

app.use(express.json());

app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
});

app.use('/auth', authRoutes);

app.use('/users', userRoutes);

app.use('/tasks', taskRoutes);

app.use(errorHandlerMiddleware);

module.exports = app;