const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [미읽음 알림 조회] received_at이 NULL인 알림 반환
 * GET /alert?user_idx=1
 */
router.get('/', asyncWrap(async (req, res) => {
    const { user_idx } = req.query;
    if (!user_idx) return res.json([]);

    const [rows] = await conn.query(
        `SELECT alert_idx, alert_type, alert_msg, sent_at
         FROM t_alert
         WHERE user_idx = ? AND received_at IS NULL
         ORDER BY sent_at DESC`,
        [user_idx]
    );
    res.json(rows);
}));

/*
 * [알림 읽음 처리] 해당 유저의 미읽음 알림 전체 received_at 설정
 * POST /alert/read  body: { user_idx }
 */
router.post('/read', asyncWrap(async (req, res) => {
    const { user_idx } = req.body;
    if (!user_idx) return res.json(0);

    const [result] = await conn.query(
        `UPDATE t_alert SET received_at = NOW()
         WHERE user_idx = ? AND received_at IS NULL`,
        [user_idx]
    );
    res.json(result.affectedRows);
}));

module.exports = router;
