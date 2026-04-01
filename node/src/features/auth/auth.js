/**
 * [Auth Feature]
 * 회원가입, 이메일 중복체크, 로그인/로그아웃 및 세션 관리, 유저 프로필 조회 및 정보 수정 관리
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

// [이메일 중복 체크]
router.post('/emailCheck', async (req, res, next) => {
    const { email } = req.body;
    const sql = 'SELECT COUNT(*) as count FROM t_user WHERE id = ?';
    try {
        const [results] = await conn.query(sql, [email]);
        if (results[0].count === 0) {
            res.send('1');
        } else {
            res.send('0');
        }
    } catch (err) {
        next(err);
    }
});

// [회원가입]
router.post('/register', async (req, res, next) => {
    const { email, password, name, gender, birthdate, phone } = req.body;

    try {
        if (!email || !password) {
            const error = new Error("이메일과 비밀번호는 필수입니다.");
            error.status = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const mappedGender = gender ? gender.charAt(0).toUpperCase() : 'M';
        const formattedBirthdate = (birthdate && birthdate !== "") ? birthdate : "1900-01-01";

        const sql = `INSERT INTO t_user (id, pw, name, gender, birthdate, phone) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        await conn.query(sql, [
            email, 
            hashedPassword, 
            name, 
            mappedGender, 
            formattedBirthdate, 
            phone
        ]);
        res.send('1');
    } catch (err) {
        next(err);
    }
});

// [로그인]
router.post('/login', async (req, res, next) => {

    const { id, pw } = req.body; 
    const sql = 'SELECT * FROM t_user WHERE id = ?';

    try {
        const [results] = await conn.query(sql, [id]);

        if (results.length === 0) return res.send('0');

        const user = results[0];
        const isMatch = await bcrypt.compare(pw, user.pw);

        if (isMatch) {
            req.session.regenerate((err) => {
                if (err) return next(err);

                req.session.user = {
                    user_idx: user.user_idx,
                    id: user.id,
                    name: user.name
                };

                res.json({ 
                    result: '1',
                    user_idx: user.user_idx,
                    user_name: user.name
                });
            });
        } else {
            res.send('0'); 
        }
    } catch (err) {
        next(err);
    }
});

// [세션 로그인 유지 확인]
router.get('/check', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, name: req.session.user.name });
    } else {
        res.json({ loggedIn: false });
    }
});

// [로그아웃]
router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        
        res.clearCookie('connect.sid'); 
        res.send('1');
    });
});

/**
 * [유저 상세 정보 조회]
 * 
 */
router.get('/profile', async (req, res, next) => {
    try {
        const { user_idx } = req.query;
        if (!user_idx) return res.status(400).send('0');

        const sql = `
            SELECT id as email, name, gender, 
                   DATE_FORMAT(birthdate, '%Y-%m-%d') as birth, 
                   phone 
            FROM t_user 
            WHERE user_idx = ?
        `;
        const [results] = await conn.query(sql, [user_idx]);

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.send('0');
        }
    } catch (err) {
        next(err);
    }
});

/**
 * [유저 정보 수정]
 *
 */

router.post('/update', async (req, res, next) => {
    try {
        const { user_idx, name, gender, birth, phone, password } = req.body;

        if (!user_idx) return res.send('0');

        let sql = `
            UPDATE t_user 
            SET name = ?, gender = ?, birthdate = ?, phone = ?
        `;
        let params = [name, gender, birth, phone];

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            sql += `, pw = ? `;
            params.push(hashedPassword);
        }

        sql += ` WHERE user_idx = ?`;
        params.push(user_idx);

        const [result] = await conn.query(sql, params);

        if (result.affectedRows > 0) {
            res.send('1');
        } else {
            res.send('0');
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;