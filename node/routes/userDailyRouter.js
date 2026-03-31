const express = require('express');
const router = express.Router();
const conn = require('../config/database');

/**
 * 9. 일일 기록 및 선택된 식단 조회 (userDaily)
 * GET /daily/userDaily?day=2026-03-24&user_idx=1
 */
router.get('/userDaily', async (req, res) => {
    try {
        const { day, user_idx } = req.query;

        // 1. 해당 날짜에 선택된 식단(레시피) 목록 가져오기 (UI 상단의 '오늘의 식단' 카드용)
        const dietSql = `
            SELECT r.recipe_idx, r.recipe_name, r.recipe_category
            FROM t_diet d
            JOIN t_recipe r ON d.recipe_idx = r.recipe_idx
            WHERE d.user_idx = ? AND DATE(d.created_at) = ?
        `;
        const [dietRows] = await conn.query(dietSql, [user_idx, day]);

        // 2. 해당 날짜의 건강/상태 일일 기록 가져오기 (UI 하단의 슬라이더, 텍스트 유지용)
        const recordSql = `
            SELECT 
                diet_feedback, rating, defecation_list, 
                condition_score, sleep_time, water_intake, 
                stomach_pain, pain_level 
            FROM t_daily_record 
            WHERE user_idx = ? AND DATE(record_date) = ?
        `;
        const [recordRows] = await conn.query(recordSql, [user_idx, day]);

        let dailyRecord = recordRows.length > 0 ? recordRows[0] : null;

        // 배변 기록이 문자열로 저장되어 있다면 배열로 변환하여 리액트에 전달
        if (dailyRecord && dailyRecord.defecation_list) {
            try {
                dailyRecord.defecation_list = JSON.parse(dailyRecord.defecation_list);
            } catch (e) {
                dailyRecord.defecation_list = []; // 파싱 실패 시 빈 배열
            }
        } else if (dailyRecord) {
            dailyRecord.defecation_list = [];
        }

        // 선택된 식단 배열과 일일 기록 객체를 한 번에 묶어서 반환
        res.json({
            selectedDiets: dietRows, // 이 배열의 길이만큼 리액트에서 map()으로 카드를 렌더링합니다.
            dailyRecord: dailyRecord
        });

    } catch (err) {
        console.error("일일 기록 조회 에러:", err);
        res.status(500).json({ error: '서버 에러' });
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
        const { user_idx, bowel_status } = req.body;

        if (!user_idx || !bowel_status) {
            return res.send('0');
        }

        const sql = `
            INSERT INTO t_bowel_log (user_idx, bowel_status, created_at)
            VALUES (?, ?, NOW())
        `;

        await conn.query(sql, [user_idx, bowel_status]);
        res.send('1');
    } catch (err) {
        console.error("배변 로그 저장 에러:", err);
        res.send('0');
    }
});

module.exports = router;