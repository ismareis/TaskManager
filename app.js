require('dotenv').config();

const express = require("express");
const app = express();

const authRoutes = require('./infra/http/routes/auth.routes');

const errorHandlerMiddleware = require('./infra/http/middleware/errorHandler');

app.use(express.json());

app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
});

app.use('/auth', authRoutes);

app.use(errorHandlerMiddleware);

module.exports = app;