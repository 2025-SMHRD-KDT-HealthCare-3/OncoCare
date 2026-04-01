const express = require('express');
const router = express.Router();
const conn = require('../config/database');

/**
 * 9. 일일 기록 및 선택된 식단 조회 (userDaily)
 */
/**
 * [조회] 오늘의 식단 기록 조회
 * 
 */
router.get('/getDailyDiet', async (req, res) => {
    try {
        const { user_idx, date } = req.query;
        const sql = `
            SELECT 
                A.diet_idx, B.recipe_name, A.meal_type, 
                A.diet_feedback, A.diet_rating
            FROM t_diet A
            JOIN t_recipe B ON A.recipe_idx = B.recipe_idx
            WHERE A.user_idx = ? AND A.select_date = ?
        `;
        const [results] = await conn.query(sql, [user_idx, date]);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('0');
    }
});

/**
 * [삭제] 식단 기록 삭제
 * 
 */
router.post('/deleteDiet', async (req, res) => {
    try {
        const { diet_idx } = req.body;
        const sql = `DELETE FROM t_diet WHERE diet_idx = ?`;
        await conn.query(sql, [diet_idx]);
        res.send('1');
    } catch (err) {
        res.send('0');
    }
});

/**
 * [조회] 오늘의 배변 기록 조회
 * 
 */
router.get('/getBowelLog', async (req, res) => {
    try {
        const { user_idx, date } = req.query;
        const sql = `
            SELECT 
                bowel_idx, 
                DATE_FORMAT(bowel_at, '%H:%i') AS bowel_time, 
                bowel_status
            FROM t_bowel_log
            WHERE user_idx = ? AND DATE(bowel_at) = ?
            ORDER BY bowel_at ASC
        `;
        const [results] = await conn.query(sql, [user_idx, date]);
        res.json(results);
    } catch (err) {
        res.status(500).send('0');
    }
});

/**
 * [삭제] 배변 기록 삭제
 *
 */
router.post('/deleteBowelLog', async (req, res) => {
    try {
        const { bowel_idx } = req.body;
        const sql = `DELETE FROM t_bowel_log WHERE bowel_idx = ?`;
        await conn.query(sql, [bowel_idx]);
        res.send('1');
    } catch (err) {
        res.send('0');
    }
});

/**
 * [조회] 오늘의 컨디션 조회
 *
 */
router.get('/getCondition', async (req, res) => {
    try {
        const { user_idx, date } = req.query;
        const sql = `
            SELECT 
                condition_idx, condition_score, water_intake, 
                stomach_pain, stomach_score
            FROM t_condition
            WHERE user_idx = ? AND DATE(created_at) = ?
        `;
        const [results] = await conn.query(sql, [user_idx, date]);
        res.json(results[0] || {});
    } catch (err) {
        res.status(500).send('0');
    }
});

/**
 * [삭제] 컨디션 기록 삭제 (초기화)
 * 
 */
router.post('/deleteCondition', async (req, res) => {
    try {
        const { condition_idx } = req.body;
        const sql = `DELETE FROM t_condition WHERE condition_idx = ?`;
        await conn.query(sql, [condition_idx]);
        res.send('1');
    } catch (err) {
        res.send('0');
    }
});




/**
 * 10. 일일 기록 저장 및 수정 (userDailySave)
 */

/*
 * 일일 컨디션 및 수분 섭취 저장/수정
 */
router.post('/saveCondition', async (req, res) => {
    try {
        const { user_idx, condition_score, water_intake, stomach_pain, pain_level } = req.body;

        const finalStomachScore = (stomach_pain === 'N') ? 0 : (pain_level || 0);

        const checkSql = `
            SELECT condition_idx FROM t_condition 
            WHERE user_idx = ? AND DATE(created_at) = CURDATE()
        `;
        const [existing] = await conn.query(checkSql, [user_idx]);

        if (existing.length > 0) {
            const updateSql = `
                UPDATE t_condition SET 
                    condition_score = ?, 
                    water_intake = ?, 
                    stomach_pain = ?, 
                    stomach_score = ?
                WHERE condition_idx = ?
            `;
            await conn.query(updateSql, [
                condition_score, water_intake, stomach_pain, finalStomachScore, existing[0].condition_idx
            ]);
        } else {
            const insertSql = `
                INSERT INTO t_condition (user_idx, condition_score, water_intake, stomach_pain, stomach_score, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            await conn.query(insertSql, [user_idx, condition_score, water_intake, stomach_pain, finalStomachScore]);
        }

        res.send('1');
    } catch (err) {
        console.error("컨디션 저장 에러:", err);
        res.send('0');
    }
});

/**
 * 배변 기록 등록
 */
router.post('/saveBowelLog', async (req, res) => {
    try {

        const { user_idx, bowel_status, bowel_at } = req.body; 

        if (!user_idx || !bowel_status) return res.send('0');

        let finalAt = null;

        if (bowel_at) { 
            const now = new Date();
            const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
            const dateStr = kstDate.toISOString().split('T')[0];
            
            finalAt = `${dateStr} ${bowel_at}:00`; 
        }

        const sql = `
            INSERT INTO t_bowel_log (user_idx, bowel_status, bowel_at, created_at)
            VALUES (?, ?, ?, NOW())
        `;

        await conn.query(sql, [user_idx, bowel_status, finalAt]);
        res.send('1');

    } catch (err) {
        console.error("배변 로그 저장 에러:", err);
        res.send('0');
    }
});

module.exports = router;