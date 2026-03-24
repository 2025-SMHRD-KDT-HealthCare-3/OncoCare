const express = require('express');
const router = express.Router();
const conn = require('../config/database');

/**
 * 14-1. 메인페이지 달력용 AI 코멘트 단건 조회
 * GET /report/comment?day=2026-03-24&user_idx=1
 */
router.get('/comment', async (req, res) => {
    try {
        const { day, user_idx } = req.query;

        const sql = `
            SELECT report_comment 
            FROM t_daily_report 
            WHERE user_idx = ? AND DATE(report_date) = ?
        `;

        const [results] = await conn.query(sql, [user_idx, day]);

        // 데이터가 존재하면 코멘트 객체만 반환, 없으면 문자열 '0' 반환
        res.json(results.length > 0 ? results[0] : '0');

    } catch (err) {
        console.error("AI 코멘트 조회 에러:", err);
        res.status(500).send('0');
    }
});

/**
 * 14-2. 일일 레포트 전체 세부 내용 조회
 * GET /report/detail?day=2026-03-24&user_idx=1
 */
router.get('/detail', async (req, res) => {
    try {
        const { day, user_idx } = req.query;

        const sql = `
            SELECT 
                report_idx, user_idx, report_date, report_score, 
                report_diet, report_bowel, report_condition, report_comment 
            FROM t_daily_report 
            WHERE user_idx = ? AND DATE(report_date) = ?
        `;

        const [results] = await conn.query(sql, [user_idx, day]);

        res.json(results.length > 0 ? results[0] : '0');

    } catch (err) {
        console.error("일일 레포트 상세 조회 에러:", err);
        res.status(500).send('0');
    }
});

module.exports = router;