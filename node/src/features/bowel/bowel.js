/*
 * [Bowel Feature]
 * 사용자의 배변 기록 조회, 저장 및 삭제 관리
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [오늘의 배변 기록 조회]
 */
router.get('/log', asyncWrap(async (req, res) => {
    const { user_idx, date } = req.query;

    if (!user_idx || !date) {
        const error = new Error("사용자 식별 번호와 날짜가 필요합니다.");
        error.status = 400;
        throw error;
    }

    const sql = `
        SELECT bowel_idx, DATE_FORMAT(bowel_at, '%H:%i') AS bowel_time, bowel_status
        FROM t_bowel_log
        WHERE user_idx = ? AND DATE(bowel_at) = ?
        ORDER BY bowel_at ASC
    `;
    const [results] = await conn.query(sql, [user_idx, date]);
    res.json(results);
}));

/*
 * [배변 기록 저장]
 */
router.post('/save', asyncWrap(async (req, res) => {
    const { user_idx, bowel_status, bowel_at } = req.body; 
    
    if (!user_idx || !bowel_status) {
        const error = new Error("사용자 정보와 배변 상태는 필수 입력 항목입니다.");
        error.status = 400;
        throw error;
    }

    let finalAt = null;
    if (bowel_at) { 
        const now = new Date();
        const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const dateStr = kstDate.toISOString().split('T')[0];
        finalAt = `${dateStr} ${bowel_at}:00`; 
    }

    const sql = `INSERT INTO t_bowel_log (user_idx, bowel_status, bowel_at, created_at) VALUES (?, ?, ?, NOW())`;
    await conn.query(sql, [user_idx, bowel_status, finalAt]);
    res.send('1');
}));

/*
 * [배변 기록 삭제]
 */
router.post('/delete', asyncWrap(async (req, res) => {
    const { bowel_idx } = req.body;

    if (!bowel_idx) {
        const error = new Error("삭제할 기록의 번호가 없습니다.");
        error.status = 400;
        throw error;
    }

    await conn.query(`DELETE FROM t_bowel_log WHERE bowel_idx = ?`, [bowel_idx]);
    res.send('1');
}));

module.exports = router;