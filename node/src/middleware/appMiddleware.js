const express = require('express');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const dbErrorHandler = require('./dbErrorHandler');

const setupMiddleware = (app) => {
    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:8000'],
        methods: ['GET', 'POST'],
        credentials: true
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        store: new FileStore({ logFn: function(){} }),
        cookie: {
            httpOnly: true,
            secure: false, 
            maxAge: 1000 * 60 * 60
        }
    }));
};

const setupErrorMiddleware = (app, notFound) => {
    app.use(notFound);

    app.use((err, req, res, next) => {
        const timestamp = new Date().toLocaleString();
        const { statusCode, errorMessage } = dbErrorHandler(err);

        console.error(`\n[${timestamp}] ----- [ERROR DETECTED] -----`);
        console.error(`Method/Path: ${req.method} ${req.url}`);
        console.error(`Status: ${statusCode}`);
        console.error(`Message: ${errorMessage}`);

        if (statusCode === 500) console.error(`Stack: ${err.stack}`); 
        console.error("------------------------------------------\n");

        res.status(statusCode).json({
            result: '0',
            message: statusCode === 500 ? "서버 내부 오류가 발생했습니다." : errorMessage,
            path: req.url
        });
    });
};

module.exports = { setupMiddleware, setupErrorMiddleware };