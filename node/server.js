const express = require('express');
const cors = require('cors');
const path = require('path');

// 라우터 가져오기
const userRouter = require('./routes/user');
const recipeRouter = require('./routes/recipeRouter'); // 추가
const registerRouter = require('./routes/registerRouter'); // 추가
const userDailyRouter = require('./routes/userDailyRouter'); // 추가
const reportRouter = require('./routes/ReportRouter');
const mainRouter = require('./routes/mainRouter');
const llmRouter = require('./routes/llmRouter');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 경로 설정

app.use('/', mainRouter);
app.use('/user', userRouter);
app.use('/recipe', recipeRouter);
app.use('/register', registerRouter);
app.use('/daily', userDailyRouter);
app.use('/report', reportRouter);
app.use('/api', llmRouter);

app.listen(3000);