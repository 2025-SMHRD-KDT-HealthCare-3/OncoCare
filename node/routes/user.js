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
    const { email, password, name, gender, birthdate, phone, allergy } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 1. 성별 처리: 'Male' -> 'M', 'Female' -> 'F' (첫 글자만 자르기)
        const mappedGender = gender ? gender.charAt(0).toUpperCase() : null;

        const sql = `INSERT INTO t_user (id, pw, name, gender, birthdate, phone) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [
            email, 
            hashedPassword, 
            name, 
            mappedGender, // 'M' 또는 'F'
            birthdate, 
            phone
        ]);

        res.send('1');
    } catch (error) {
        console.error("회원가입 에러 상세:", error);
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
                res.json({ 
                result: '1', 
                user_idx: user.user_idx,
                user_name: user.name
            });
        } else {
            res.send('0'); 
        }
    } catch (err) {
        res.status(500).send('0');
    }
});

module.exports = router;