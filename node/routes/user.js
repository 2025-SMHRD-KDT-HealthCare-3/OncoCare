const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

// 1. 이메일 중복 체크
router.get('/emailCheck', async (req, res) => {
    const { email } = req.query;
    const sql = 'SELECT COUNT(*) as count FROM t_user WHERE id = ?';
    try {
        const [results] = await db.query(sql, [email]);
        res.send(results[0].count === 0 ? '1' : '0');
    } catch (err) {
        res.status(500).send('0');
    }
});

// 2. 회원가입 (비밀번호 암호화)
router.post('/register', async (req, res) => {
    const { email, password, name, gender, birthdate, phone, allergy } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO t_user (id, pw, user_name, user_gender, user_birthdate, user_phone, user_allergy) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [email, hashedPassword, name, gender, birthdate, phone, allergy || '0']);
        res.send('1');
    } catch (error) {
        console.error(error);
        res.status(500).send('0');
    }
});

// 3. 로그인 (암호화 비교)
router.post('/login', async (req, res) => {
    const { id, password } = req.body; 
    const sql = 'SELECT * FROM t_user WHERE id = ?';
    try {
        const [results] = await db.query(sql, [id]);
        if (results.length === 0) return res.send('0'); 

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.pw);

        if (isMatch) {
            // 리액트에서 필요한 유저 정보를 같이 보내주는 것이 좋습니다.
            res.json({ result: '1', user_idx: user.user_idx, user_name: user.user_name });
        } else {
            res.send('0'); 
        }
    } catch (err) {
        res.status(500).send('0');
    }
});

module.exports = router;