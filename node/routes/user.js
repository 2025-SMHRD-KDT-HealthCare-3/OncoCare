const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

// 1. 이메일 중복 체크
router.post('/emailCheck', async (req, res) => {
    const { email } = req.body;
    console.log("프론트에서 보낸 이메일:", email);

    const sql = 'SELECT COUNT(*) as count FROM t_user WHERE id = ?';
    
    try {
        const [results] = await db.query(sql, [email]);
        console.log("DB 조회 결과:", results[0]);

        if (results[0].count === 0) {
            res.send('1'); 
        } else {
            res.send('0');
        }
    } catch (err) {
        console.error("이메일 중복 체크 에러:", err);
        res.status(500).send('0');
    }
});

// 2. 회원가입 (비밀번호 암호화)
router.post('/register', async (req, res) => {
    console.log("회원가입 요청 데이터:", req.body); 
    const { email, password, name, gender, birthdate, phone } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const mappedGender = gender ? gender.charAt(0).toUpperCase() : 'M';
        

        const formattedBirthdate = (birthdate && birthdate !== "") ? birthdate : "1900-01-01";

        const sql = `INSERT INTO t_user (id, pw, name, gender, birthdate, phone) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [
            email, 
            hashedPassword, 
            name, 
            mappedGender, 
            formattedBirthdate, 
            phone
        ]);

        res.send('1');
    } catch (error) {
        console.error("회원가입 서버 에러:", error);
        res.status(500).send('0');
    }
});

// 3. 로그인 (암호화 비교)
router.post('/login', async (req, res) => {
    const { id, pw } = req.body; 
    const sql = 'SELECT * FROM t_user WHERE id = ?';
    try {
        const [results] = await db.query(sql, [id]);
        if (results.length === 0) return res.send('0'); 

        const user = results[0];
        const isMatch = await bcrypt.compare(pw, user.pw);

        if (isMatch) {
            // 기존 세션ID 파기 후 새 세션ID 발급
            req.session.regenerate((err) => {
                if (err) throw err;

                // 세션에 유저 정보 기록
                req.session.user = {
                    id: user.id,
                    name: user.name
                };

                res.json({ 
                    result: '1', 
                    user_name: user.name
                });
            });
        } else {
            res.send('0'); 
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('0');
    }
});

// 4. 세션 로그인 유지 확인 API (리액트 새로고침 대비)
router.get('/check', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, name: req.session.user.name });
    } else {
        res.json({ loggedIn: false });
    }
});

// 5. 로그아웃 (세션 파기)
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("세션 삭제 에러:", err);
        }
        res.clearCookie('connect.sid'); // 세션 쿠키 강제 삭제
        res.send('1');
    });
});

module.exports = router;