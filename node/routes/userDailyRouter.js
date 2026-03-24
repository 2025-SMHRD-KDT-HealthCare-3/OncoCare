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
 * POST /daily/userDailySave
 * 배변 기록은 기존 기록에 추가(Append) 방식으로 동작합니다.
 */
router.post('/userDailySave', async (req, res) => {
    try {
        const { 
            day, user_idx, diet_feedback, rating, 
            new_defecation_time, new_defecation_type, // 새로 추가할 배변 기록 1건
            condition_score, sleep_time, water_intake, stomach_pain, pain_level 
        } = req.body;

        // 기존 기록이 있는지 확인하고 기존 배변 리스트를 가져옵니다.
        const checkSql = `SELECT record_idx, defecation_list FROM t_daily_record WHERE user_idx = ? AND DATE(record_date) = ?`;
        const [existing] = await conn.query(checkSql, [user_idx, day]);

        let currentDefecationList = [];

        // 기존 기록이 있다면 배변 리스트를 파싱하여 복구합니다.
        if (existing.length > 0 && existing[0].defecation_list) {
            try {
                currentDefecationList = JSON.parse(existing[0].defecation_list);
            } catch (e) {
                currentDefecationList = [];
            }
        }

        // 사용자가 새로운 배변 시간을 입력했다면 기존 배열에 추가합니다.
        if (new_defecation_time && new_defecation_type) {
            currentDefecationList.push({
                time: new_defecation_time,
                type: new_defecation_type
            });
        }

        // 누적된 배변 배열을 다시 문자열로 변환하여 DB에 저장할 준비를 합니다.
        const defecation_str = JSON.stringify(currentDefecationList);

        if (existing.length > 0) {
            // 기록이 이미 존재하면 UPDATE
            const updateSql = `
                UPDATE t_daily_record SET 
                    diet_feedback = ?, rating = ?, defecation_list = ?, 
                    condition_score = ?, sleep_time = ?, water_intake = ?, 
                    stomach_pain = ?, pain_level = ?
                WHERE user_idx = ? AND DATE(record_date) = ?
            `;
            await conn.query(updateSql, [
                diet_feedback, rating, defecation_str, 
                condition_score, sleep_time, water_intake, 
                stomach_pain, pain_level, user_idx, day
            ]);
        } else {
            // 기록이 없다면 INSERT
            const insertSql = `
                INSERT INTO t_daily_record (
                    user_idx, record_date, diet_feedback, rating, 
                    defecation_list, condition_score, sleep_time, 
                    water_intake, stomach_pain, pain_level
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await conn.query(insertSql, [
                user_idx, day, diet_feedback, rating, 
                defecation_str, condition_score, sleep_time, 
                water_intake, stomach_pain, pain_level
            ]);
        }

        res.send('1'); // 성공

    } catch (err) {
        console.error("일일 기록 저장 에러:", err);
        res.send('0'); // 실패
    }
});

module.exports = router;