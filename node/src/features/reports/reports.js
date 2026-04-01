/**
 * [Report Feature]
 * 일일/주간/월간 단위의 건강 및 식단 레포트와 AI 코멘트 제공
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');

/**
 * [메인페이지 달력용 AI 코멘트 단건 조회]
 */

router.get('/comment', async (req, res, next) => {
    try {
        const { day, user_idx } = req.query;
        const sql = `
            SELECT report_comment 
            FROM t_daily_report 
            WHERE user_idx = ? AND DATE(report_date) = ?
        `;
        const [results] = await conn.query(sql, [user_idx, day]);
        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        next(err);
    }
});

/**
 * [일일 레포트 상세 조회]
 */

router.get('/detail', async (req, res, next) => {
    try {
        const { day, user_idx } = req.query;
        const sql = `
            SELECT report_idx, user_idx, report_date, report_score, 
                   report_diet, report_bowel, report_condition, report_comment 
            FROM t_daily_report 
            WHERE user_idx = ? AND DATE(report_date) = ?
        `;
        const [results] = await conn.query(sql, [user_idx, day]);
        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        next(err);
    }
});

/**
 * [주간 레포트 상세 조회]
 */

router.get('/weekly', async (req, res, next) => {
    try {
        const { user_idx, day } = req.query;
        if (!user_idx) return res.status(400).send('user_idx가 필요합니다.');

        const targetDate = day ? new Date(day) : new Date();
        const dayOfWeek = targetDate.getDay(); 
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const mondayObj = new Date(targetDate);
        mondayObj.setDate(targetDate.getDate() - diffToMonday);
        
        const start_date = mondayObj.toISOString().split('T')[0];

        const sql = `
            SELECT report_idx, user_idx, start_date, end_date, 
                   report_week_label, report_title, report_score, 
                   report_diet, report_bowel, report_condition 
            FROM t_weekly_report 
            WHERE user_idx = ? AND DATE(start_date) = ?
        `;
        const [results] = await conn.query(sql, [user_idx, start_date]);
        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        next(err);
    }
});

/**
 * [월간 레포트 상세 조회]
 */

router.get('/monthly', async (req, res, next) => {
    try {
        const { user_idx, month } = req.query;
        if (!user_idx) return res.status(400).send('user_idx가 필요합니다.');

        let targetMonth = month || new Date().toISOString().slice(0, 7);

        const sql = `
            SELECT report_idx, user_idx, report_month, report_score, 
                   report_diet, report_bowel, report_condition, report_comment 
            FROM t_monthly_report 
            WHERE user_idx = ? AND report_month = ?
        `;
        const [results] = await conn.query(sql, [user_idx, targetMonth]);
        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        next(err);
    }
});

module.exports = router;