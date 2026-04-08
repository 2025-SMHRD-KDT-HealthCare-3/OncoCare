/*
 * [Report Feature]
 * 일일/주간/월간 단위의 건강 및 식단 레포트와 AI 코멘트 제공
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [메인페이지 달력용 AI 코멘트 단건 조회]
 */
router.get('/comment', asyncWrap(async (req, res) => {
    const { day, user_idx } = req.query;

    if (!user_idx || !day) {
        const error = new Error("사용자 정보와 날짜 정보가 필요합니다.");
        error.status = 400;
        throw error;
    }

    const sql = `
        SELECT report_comment 
        FROM t_daily_report 
        WHERE user_idx = ? AND DATE(report_date) = ?
    `;
    const [results] = await conn.query(sql, [user_idx, day]);
    res.json(results.length > 0 ? results[0] : '0');
}));

/*
 * [일일 레포트 상세 조회]
 */
router.get('/detail', asyncWrap(async (req, res) => {
    const { day, user_idx } = req.query;

    if (!user_idx || !day) {
        const error = new Error("조회할 사용자 정보와 날짜가 누락되었습니다.");
        error.status = 400;
        throw error;
    }

    const sql = `
        SELECT report_idx, user_idx, report_date, report_score, 
               report_diet, report_bowel, report_condition, report_comment 
        FROM t_daily_report 
        WHERE user_idx = ? AND DATE(report_date) = ?
    `;
    const [results] = await conn.query(sql, [user_idx, day]);
    res.json(results.length > 0 ? results[0] : '0');
}));

/*
 * [주간 레포트 상세 조회]
 */
router.get('/weekly', asyncWrap(async (req, res) => {
    const { user_idx, day } = req.query;
    if (!user_idx) {
        const err = new Error('user_idx가 필요합니다.');
        err.status = 400;
        throw err;
    }
    const targetDate = day ? new Date(day) : new Date();
    const dayOfWeek = targetDate.getDay(); 
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const mondayObj = new Date(targetDate);
    mondayObj.setDate(targetDate.getDate() - diffToMonday);
    const start_date = mondayObj.toISOString().split('T')[0];

    const sql = `
        SELECT report_idx, user_idx, start_date, end_date,
               report_week_label, report_title, report_score,
               report_score_list, report_score_list_comment,
               report_diet, report_bowel, report_condition, report_comment
        FROM t_weekly_report
        WHERE user_idx = ? AND DATE(start_date) = ?
    `;
    const [results] = await conn.query(sql, [user_idx, start_date]);
    res.json(results.length > 0 ? results[0] : '0');
}));

/*
 * [월간 레포트 상세 조회]
 */
router.get('/monthly', asyncWrap(async (req, res) => {
    const { user_idx, month } = req.query;
    if (!user_idx) {
        const err = new Error('user_idx가 필요합니다.');
        err.status = 400;
        throw err;
    }

    let targetMonth = month || new Date().toISOString().slice(0, 7);

    const sql = `
        SELECT report_idx, user_idx, report_month, report_month_label,
               report_title, report_score,
               report_score_list, report_score_list_comment,
               report_diet, report_bowel, report_condition, report_comment
        FROM t_monthly_report
        WHERE user_idx = ? AND report_month = ?
    `;
    const [results] = await conn.query(sql, [user_idx, targetMonth]);
    res.json(results.length > 0 ? results[0] : '0');
}));

module.exports = router;