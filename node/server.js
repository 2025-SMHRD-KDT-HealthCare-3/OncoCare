const express = require('express');
const setupMiddleware = require('./src/middleware/appMiddleware');
const combinedRouter = require('./src/features/index');
const notFound = require('./src/middleware/notFound');
const dbErrorHandler = require('./src/middleware/dbErrorHandler');
const app = express();

setupMiddleware(app);

app.use('/api', combinedRouter);

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

app.listen(3000);