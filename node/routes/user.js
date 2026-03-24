const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10; // 암호화 강도

// 1. 이메일 중복 체크 (기존과 동일)
router.post('/emailCheck', (req, res) => {
    const { Email } = req.body;
    const sql = 'SELECT COUNT(*) as count FROM T_USER WHERE ID = ?';
    db.query(sql, [Email], (err, results) => {
        if (err) return res.status(500).send('0');
        res.send(results[0].count === 0 ? '1' : '0');
    });
});

// 2. 회원가입 (bcrypt 암호화 적용)
router.post('/register', async (req, res) => {
    const { 이름, 성별, 생년월일, Email, Password, Phone, Alergy } = req.body;

    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const sql = `INSERT INTO T_USER (ID, PW, NAME, GENDER, BIRTHDATE, PHONE, ALERGY) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [Email, hashedPassword, 이름, 성별, 생년월일, Phone, Alergy || '0'];

        db.query(sql, values, (err, result) => {
            if (err) return res.send('0');
            res.send('1');
        });
    } catch (error) {
        res.status(500).send('0');
    }
});

// 3. 로그인 (bcrypt 검증 및 세션 생성)
router.post('/login', (req, res) => {
    const { 아이디, 비밀번호 } = req.body;
    const sql = 'SELECT * FROM T_USER WHERE ID = ?';

    db.query(sql, [아이디], async (err, results) => {
        if (err) return res.status(500).send('0');
        if (results.length === 0) return res.send('0'); // 아이디 없음

        const user = results[0];

        // DB에 저장된 암호화 비밀번호와 입력된 비밀번호 비교
        const isMatch = await bcrypt.compare(비밀번호, user.PW);

        if (isMatch) {
            // 로그인 성공 시 세션에 유저 정보 저장
            // req.session.user = {
            //     idx: user.USER_IDX,
            //     id: user.ID,
            //     name: user.NAME
            // };
            
            // 세션 저장 후 응답
            // req.session.save(() => {
            //     res.send('1');
            // });
            res.send('1');
        } else {
            res.send('0'); // 비밀번호 불일치
        }
    });
});

// 4. 로그아웃 (추가 기능)
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.send('1');
    });
});

module.exports = router;