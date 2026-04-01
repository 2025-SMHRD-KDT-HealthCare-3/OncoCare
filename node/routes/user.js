// const express = require('express');
// const router = express.Router();
// const conn = require('../config/database');
// const bcrypt = require('bcrypt');
// const saltRounds = 10; 

// // 1. 이메일 중복 체크
// router.post('/emailCheck', async (req, res) => {
//     const { email } = req.body;
//     const sql = 'SELECT COUNT(*) as count FROM t_user WHERE id = ?';
    
//     try {
//         // db.query 대신 conn.query 사용
//         const [results] = await conn.query(sql, [email]);

//         if (results[0].count === 0) {
//             res.send('1'); 
//         } else {
//             res.send('0');
//         }
//     } catch (err) {
//         console.error("이메일 중복 체크 에러:", err);
//         res.status(500).send('0');
//     }
// });

// // 2. 회원가입
// router.post('/register', async (req, res) => {
//     const { email, password, name, gender, birthdate, phone } = req.body;

//     try {
//         const hashedPassword = await bcrypt.hash(password, saltRounds);
//         const mappedGender = gender ? gender.charAt(0).toUpperCase() : 'M';
//         const formattedBirthdate = (birthdate && birthdate !== "") ? birthdate : "1900-01-01";

//         const sql = `INSERT INTO t_user (id, pw, name, gender, birthdate, phone) 
//                      VALUES (?, ?, ?, ?, ?, ?)`;

//         // conn.query 사용
//         await conn.query(sql, [
//             email, 
//             hashedPassword, 
//             name, 
//             mappedGender, 
//             formattedBirthdate, 
//             phone
//         ]);

//         res.send('1');
//     } catch (error) {
//         console.error("회원가입 서버 에러:", error);
//         res.status(500).send('0');
//     }
// });

// // 3. 로그인
// router.post('/login', async (req, res) => {
//     const { id, pw } = req.body; 
//     const sql = 'SELECT * FROM t_user WHERE id = ?';
//     try {
//         // conn.query 사용
//         const [results] = await conn.query(sql, [id]);
//         if (results.length === 0) return res.send('0'); 

//         const user = results[0];
//         const isMatch = await bcrypt.compare(pw, user.pw);

//         if (isMatch) {
//             req.session.regenerate((err) => {
//                 if (err) throw err;

//                 req.session.user = {
//                     user_idx: user.user_idx,
//                     id: user.id,
//                     name: user.name
//                 };

//                 res.json({ 
//                     result: '1',
//                     user_idx: user.user_idx,
//                     user_name: user.name
//                 });
//             });
//         } else {
//             res.send('0'); 
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('0');
//     }
// });

// // 4. 세션 로그인 유지 확인
// router.get('/check', (req, res) => {
//     if (req.session.user) {
//         res.json({ loggedIn: true, name: req.session.user.name });
//     } else {
//         res.json({ loggedIn: false });
//     }
// });

// // 5. 로그아웃
// router.post('/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) console.error("세션 삭제 에러:", err);
//         res.clearCookie('connect.sid'); 
//         res.send('1');
//     });
// });

// module.exports = router;