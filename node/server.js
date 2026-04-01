const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

// 라우터 가져오기
const userRouter = require('./routes/user');
const recipeRouter = require('./routes/recipeRouter');
const registerRouter = require('./routes/registerRouter');
const userDailyRouter = require('./routes/userDailyRouter');
const reportRouter = require('./routes/ReportRouter');
const mainRouter = require('./routes/mainRouter');
const llmRouter = require('./routes/llmRouter');

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:8000'
    ],
    methods: ['GET', 'POST'],
    credentials: true // 쿠키/세션
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 및 쿠키 보안 설정
app.use(session({
    secret: 'secret', // 암호화 키
    resave: false,
    saveUninitialized: false,
    store: new FileStore({ logFn: function(){} }), // sessions 폴더 자동 생성 및 로그 끄기
    cookie: {
        httpOnly: true,
        secure: false,  // 로컬(http) 환경이므로 false. 배포(https) 시 true
        maxAge: 1000 * 60 * 60 // 1시간 유지
    }
}));


// 라우터 경로 설정

app.use('/', mainRouter);
app.use('/user', userRouter);
app.use('/recipe', recipeRouter);
app.use('/register', registerRouter);
app.use('/daily', userDailyRouter);
app.use('/report', reportRouter);
app.use('/api', llmRouter);

/**
 * [전역 에러 핸들러]
 * 
 */
app.use((err, req, res, next) => {
    console.error("----- [ERROR DETECTED] -----");
    console.error("경로:", req.method, req.url);
    console.error("내용:", err.message);
    console.error("위치:", err.stack);
    console.error("----------------------------");

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        result: '0', 
        message: err.message || "서버 내부 오류가 발생했습니다."
    });
});


app.listen(3000);