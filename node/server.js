const express = require('express');
const setupMiddleware = require('./src/middleware/appMiddleware');
const combinedRouter = require('./src/features/index');
const notFound = require('./src/middleware/notFound');
const app = express();


setupMiddleware(app);

app.use('/api', combinedRouter);
app.use(notFound);
app.use((err, req, res, next) => {
    const timestamp = new Date().toLocaleString();
    
    console.error(`\n[${timestamp}] ----- [ERROR DETECTED] -----`);
    console.error(`Method/Path: ${req.method} ${req.url}`);
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`); 
    console.error("------------------------------------------\n");

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        result: '0', 
        message: statusCode === 500 ? "서버 내부 오류가 발생했습니다." : err.message,
        path: req.url
    });
});

app.listen(3000);