const express = require('express');
const router = express.Router();
const conn = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * 11. 회원정보 수정 (비밀번호 변경 포함)
 * POST /register/userUpdate
 */
router.post('/userUpdate', async (req, res) => {
    try {
        const { user_idx, name, password, confirmPassword, phone } = req.body;

        // 1. 새 비밀번호 입력 시 일치 여부 확인
        if (password && password !== confirmPassword) {
            return res.status(400).send('비밀번호가 일치하지 않습니다.');
        }

        let sql = `UPDATE t_user SET user_name = ?, user_phone = ?`;
        let params = [name, phone];

        // 2. 비밀번호도 수정하는 경우 암호화하여 추가
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            sql += `, pw = ?`;
            params.push(hashedPassword);
        }

        sql += ` WHERE user_idx = ?`;
        params.push(user_idx);

        await conn.query(sql, params);
        res.send('1'); 
    } catch (err) {
        console.error(err);
        res.send('0');
    }
});

/**
 * 12. 건강정보 조회
 */
router.get('/healthSelect', async (req, res) => {
    try {
        const { user_idx } = req.query;
        const sql = `SELECT * FROM t_health_profile WHERE user_idx = ?`;
        const [results] = await conn.query(sql, [user_idx]);
        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        res.status(500).send('0');
    }
});

/**
 * 13. 건강정보 저장/수정 (UPSERT)
 */
router.post('/registerHealth', async (req, res) => {
    try {
        const { user_idx, height, weight, cancer_stage, surgery_date, discharge_date, stoma_status, chemo_status, meals_per_day } = req.body;
        const checkSql = `SELECT user_idx FROM t_health_profile WHERE user_idx = ?`;
        const [existing] = await conn.query(checkSql, [user_idx]);

        if (existing.length > 0) {
            const updateSql = `UPDATE t_health_profile SET height=?, weight=?, cancer_stage=?, surgery_date=?, discharge_date=?, stoma_status=?, chemo_status=?, meals_per_day=? WHERE user_idx=?`;
            await conn.query(updateSql, [height, weight, cancer_stage, surgery_date, discharge_date, stoma_status, chemo_status, meals_per_day, user_idx]);
        } else {
            const insertSql = `INSERT INTO t_health_profile (user_idx, height, weight, cancer_stage, surgery_date, discharge_date, stoma_status, chemo_status, meals_per_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await conn.query(insertSql, [user_idx, height, weight, cancer_stage, surgery_date, discharge_date, stoma_status, chemo_status, meals_per_day]);
        }
        res.send('1');
    } catch (err) {
        res.send('0');
    }
});

module.exports = router;