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

app.listen(3000);