const express = require('express');
const setupMiddleware = require('./src/middlewares/appMiddleware');
const combinedRouter = require('./src/features/index');

const app = express();

setupMiddleware(app);

app.use('/api', combinedRouter); 

app.use((err, req, res, next) => {
    console.error("----- [ERROR DETECTED] -----");
    console.error(`Path: ${req.method} ${req.url}`);
    console.error(`Message: ${err.message}`);
    console.error("----------------------------");

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        result: '0', 
        message: err.message || "서버 내부 오류가 발생했습니다."
    });
});

app.listen(3000);