const express = require('express');
const { setupMiddleware, setupErrorMiddleware } = require('./src/middleware/appMiddleware');
const combinedRouter = require('./src/features/index'); 
const notFound = require('./src/middleware/notFound');

const app = express();

setupMiddleware(app);

app.use('/api', combinedRouter);

setupErrorMiddleware(app, notFound);

app.listen(3000).on('error', err => {
    console.error('서버 실행 에러:', err.message);
    process.exit(1);
});