/**
 * [Condition Feature]
 * 일일 컨디션 조회, 저장 및 수정
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');

/**
 * [컨디션 조회]
 */

router.get('/', async (req, res, next) => {
    try {
        const { user_idx, date } = req.query;
        const sql = `
            SELECT condition_idx, condition_score, water_intake, stomach_pain, stomach_score, sleep_score
            FROM t_condition
            WHERE user_idx = ? AND DATE(created_at) = ?
        `;
        const [results] = await conn.query(sql, [user_idx, date]);
        res.json(results[0] || {});
    } catch (err) {
        next(err);
    }
});

/**
 * [컨디션 저장/수정]
 */

router.post('/save', async (req, res, next) => {
    try {
        const { user_idx, condition_score, sleep_score, water_intake, stomach_pain, pain_level } = req.body;
        const finalStomachScore = (stomach_pain === 'N') ? 0 : (pain_level || 0);
        
        const [existing] = await conn.query(`SELECT condition_idx FROM t_condition WHERE user_idx = ? AND DATE(created_at) = CURDATE()`, [user_idx]);

        if (existing.length > 0) {
            const updateSql = `
                UPDATE t_condition SET condition_score=?, water_intake=?, stomach_pain=?, stomach_score=?, sleep_score=?
                WHERE condition_idx=?
            `;
            await conn.query(updateSql, [condition_score || 0, water_intake || 0, stomach_pain || 'N', finalStomachScore, sleep_score || 0, existing[0].condition_idx]);
        } else {
            const insertSql = `
                INSERT INTO t_condition (user_idx, condition_score, water_intake, stomach_pain, stomach_score, sleep_score, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;
            await conn.query(insertSql, [user_idx, condition_score || 0, water_intake || 0, stomach_pain || 'N', finalStomachScore, sleep_score || 0]);
        }
        res.send('1');
    } catch (err) {
        next(err);
    }
});

/**
 * [컨디션 삭제]
 */

router.post('/delete', async (req, res, next) => {
    try {
        const { condition_idx } = req.body;
        await conn.query(`DELETE FROM t_condition WHERE condition_idx = ?`, [condition_idx]);
        res.send('1');
    } catch (err) {
        next(err);
    }
});

module.exports = router;