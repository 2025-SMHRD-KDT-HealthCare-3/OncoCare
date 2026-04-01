// 서버 실행 시 필요한 미들웨어
// 2026.04.01: server.js에서 미들웨어 분리

// const express = require('express');
// const cors = require('cors');
// const session = require('express-session');
// const FileStore = require('session-file-store')(session);

// const setupMiddleware = (app) => {
//     app.use(cors({
//         origin: ['http://localhost:5173',
//                  'http://localhost:8000'
//                 ],
//         methods: ['GET', 'POST'],
//         credentials: true
//     }));

//     app.use(express.json());
//     app.use(express.urlencoded({ extended: true }));

//     app.use(session({
//         secret: 'secret',
//         resave: false,
//         saveUninitialized: false,
//         store: new FileStore({ logFn: function(){} }),
//         cookie: {
//             httpOnly: true,
//             secure: false, 
//             maxAge: 1000 * 60 * 60
//         }
//     }));
// };

// module.exports = setupMiddleware;