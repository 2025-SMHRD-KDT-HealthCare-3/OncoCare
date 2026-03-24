const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cors = require('cors'); // CORS 라이브러리 추가
const path = require('path');
const userRouter = require('./routes/user'); // user 라우터

const app = express();

// 1. CORS 설정 (리액트 연결의 핵심)
app.use(cors({
    origin: 'http://localhost:3000', // 리액트가 실행되는 주소
    // credentials: true,               // 리액트와 세션 쿠키를 주고받으려면 반드시 true
    methods: ['GET', 'POST']         // 허용할 HTTP 메서드
}));

// 1. 미들웨어 설정
app.use(express.json()); // JSON 데이터 파싱
app.use(express.urlencoded({ extended: true })); // Form 데이터 파싱

// 2. 세션 및 보안 설정
// app.use(session({
//     secret: 'secret', // 세션 암호화 키 (복잡하게 작성)
//     resave: false,               // 세션 수정사항이 없어도 다시 저장할지 여부
//     saveUninitialized: false,    // 초기화되지 않은 세션을 저장할지 여부 (로그인 전엔 생성 안 함)
//     store: new FileStore({
//         path: './sessions',      // 세션 파일 저장 경로
//         reapInterval: 3600       // 만료된 세션 제거 주기 (초)
//     }),
//     cookie: {
//         httpOnly: true,          // JS를 통한 쿠키 탈취 방지 (보안 필수)
//         secure: false,           // HTTPS 환경이라면 true로 변경 필수
//         sameSite: 'lax',         // CSRF 방어 및 세션 공유 정책
//         maxAge: 1000 * 60 * 60 * 2 // 쿠키 유효 기간 (2시간)
//     },
//     name: 'session-id'           // 기본 이름인 connect.sid를 변경하여 서버 종류 은폐
// }));

// 3. 라우터 연결
app.use('/user', userRouter);


// 5. 서버 실행
app.listen(3000);