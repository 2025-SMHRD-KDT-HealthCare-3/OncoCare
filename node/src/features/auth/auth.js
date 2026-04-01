/*
 * [Auth Feature]
 * 회원가입, 이메일 중복체크, 로그인/로그아웃 및 세션 관리, 유저 프로필 조회 및 정보 수정 관리
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const bcrypt = require('bcrypt');
const asyncWrap = require('../../middleware/asyncWrap');
const saltRounds = 10; 

/*
 * [이메일 중복 체크]
 */
router.post('/emailCheck', asyncWrap(async (req, res) => {
    const { email } = req.body;
    

    if (!email) {
        const error = new Error("이메일을 입력해주세요.");
        error.status = 400;
        throw error;
    }

    const sql = 'SELECT COUNT(*) as count FROM t_user WHERE id = ?';
    const [results] = await conn.query(sql, [email]);
    res.send(results[0].count === 0 ? '1' : '0');
}));


/*
 * [회원가입]
 */
router.post('/register', asyncWrap(async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        const error = new Error("이메일, 비밀번호, 이름은 필수 입력 사항입니다.");
        error.status = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { gender, birthdate, phone } = req.body;
    const mappedGender = gender ? gender.charAt(0).toUpperCase() : 'M';
    const formattedBirthdate = (birthdate && birthdate !== "") ? birthdate : "1900-01-01";

    const sql = `INSERT INTO t_user (id, pw, name, gender, birthdate, phone) VALUES (?, ?, ?, ?, ?, ?)`;
    await conn.query(sql, [email, hashedPassword, name, mappedGender, formattedBirthdate, phone]);
    res.send('1');
}));

/*
 * [로그인]
 */
router.post('/login', asyncWrap(async (req, res, next) => {
    const { id, pw } = req.body; 

    if (!id || !pw) {
        const error = new Error("아이디와 비밀번호를 모두 입력해주세요.");
        error.status = 400;
        throw error;
    }

    const sql = 'SELECT * FROM t_user WHERE id = ?';
    const [results] = await conn.query(sql, [id]);

    if (results.length === 0) return res.send('0');

    const user = results[0];
    const isMatch = await bcrypt.compare(pw, user.pw);

    if (isMatch) {
        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = { user_idx: user.user_idx, id: user.id, name: user.name };
            res.json({ result: '1', user_idx: user.user_idx, user_name: user.name });
        });
    } else {
        res.send('0'); 
    }
}));

module.exports = router;