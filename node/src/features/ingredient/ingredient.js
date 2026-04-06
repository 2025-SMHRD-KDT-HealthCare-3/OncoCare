const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [식재료 목록 조회]
 *
 */
router.get('/', asyncWrap(async (req, res) => {
    const { user_idx } = req.query;
    if (!user_idx) throw new Error("사용자 번호 누락");

    const sql = `SELECT * FROM t_ingredient WHERE user_idx = ?`;
    const [results] = await conn.query(sql, [user_idx]);
    res.json(results);
}));

/*
 * [식재료 상세 조회]
 *
 */
router.get('/detail', asyncWrap(async (req, res) => {
    const { ingre_idx } = req.query;
    if (!ingre_idx) throw new Error("식재료 번호 누락");

    const sql = `SELECT * FROM t_ingredient WHERE ingre_idx = ?`;
    const [results] = await conn.query(sql, [ingre_idx]);
    res.json(results[0] || '0');
}));

/*
 * [식재료 등록]
 * 
 */
router.post('/register', asyncWrap(async (req, res) => {
    const { user_idx, name, type, storage, cnt, unit } = req.body;
    const sql = `
        INSERT INTO t_ingredient (user_idx, ingre_name, ingre_type, ingre_storage, cnt, ingre_unit) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await conn.query(sql, [user_idx, name, type, storage, cnt, unit || '개']);
    res.send('1');
}));

/*
 * [식재료 수정]
 *
 */
router.post('/update', asyncWrap(async (req, res) => {
    const { ingre_idx, ingre_name, ingre_type, ingre_storage, cnt, ingre_unit } = req.body;
    const sql = `
        UPDATE t_ingredient 
        SET ingre_name = ?, ingre_type = ?, ingre_storage = ?, cnt = ?, ingre_unit = ? 
        WHERE ingre_idx = ?
    `;
    await conn.query(sql, [ingre_name, ingre_type, ingre_storage, cnt, ingre_unit || '개', ingre_idx]);
    res.send('1');
}));
/*
 * [식재료 삭제]
 *
 */
router.post('/delete', asyncWrap(async (req, res) => {
    const { ingre_idx } = req.body;

    if (!ingre_idx) {
        const err = new Error("삭제할 식재료 번호가 누락되었습니다.");
        err.status = 400;
        throw err;
    }

    const sql = `DELETE FROM t_ingredient WHERE ingre_idx = ?`;
    const [result] = await conn.query(sql, [ingre_idx]);

    if (result.affectedRows > 0) {
        res.send('1');
    } else {
        res.send('0');
    }
}));

module.exports = router;