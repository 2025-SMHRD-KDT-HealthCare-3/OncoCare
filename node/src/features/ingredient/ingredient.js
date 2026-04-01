/**
 * [Ingredient Feature]
 * 식재료 리스트 조회, 상세 확인, 등록, 수정 및 삭제
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');

/**
 * [내 식재료 리스트 조회]
 */
router.get('/', async (req, res, next) => {
    try {
        const user_idx = req.query.user_idx;
        const sql = `SELECT * FROM t_ingredient WHERE user_idx = ? ORDER BY created_at DESC`;
        const [results] = await conn.query(sql, [user_idx]);
        res.json(results);
    } catch (err) {
        next(err);
    }
});

/**
 * [식재료 상세 정보 조회]
 */
router.get('/detail', async (req, res, next) => {
    try {
        const ingre_idx = req.query.ingre_idx;
        const sql = `
            SELECT ingre_name, ingre_type, ingre_storage, cnt 
            FROM t_ingredient 
            WHERE ingre_idx = ?
        `;
        const [results] = await conn.query(sql, [ingre_idx]);
        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        next(err);
    }
});

/**
 * [식재료 직접 등록]
 */
router.post('/register', async (req, res, next) => {
    try {
        const { user_idx, name, type, storage, cnt } = req.body;
        const sql = `
            INSERT INTO t_ingredient (user_idx, ingre_name, ingre_type, ingre_storage, cnt)
            VALUES (?, ?, ?, ?, ?)
        `;
        await conn.query(sql, [user_idx, name, type, storage, cnt]);
        res.send('1');
    } catch (err) {
        next(err);
    }
});

/**
 * [식재료 삭제]
 */
router.post('/delete', async (req, res, next) => {
    try {
        const { ingre_idx, user_idx } = req.body;

        if (!ingre_idx || !user_idx) {
            return res.send('0');
        }

        const sql = `DELETE FROM t_ingredient WHERE ingre_idx = ? AND user_idx = ?`;
        const [result] = await conn.query(sql, [ingre_idx, user_idx]);

        if (result.affectedRows > 0) {
            res.send('1'); 
        } else {
            res.send('0'); 
        }
    } catch (err) {
        next(err);
    }
});

/**
 * [식재료 수정]
 */
router.post('/update', async (req, res, next) => {
    try {
        const { ingre_idx, user_idx, ingre_name, ingre_type, ingre_storage, cnt } = req.body;

        if (!ingre_idx || !user_idx) {
            return res.send('0');
        }
        
        const sql = `
            UPDATE t_ingredient 
            SET ingre_name = ?, ingre_type = ?, ingre_storage = ?, cnt = ?
            WHERE ingre_idx = ? AND user_idx = ?
        `;

        const [result] = await conn.query(sql, [ingre_name, ingre_type, ingre_storage, cnt, ingre_idx, user_idx]);

        if (result.affectedRows > 0) {
            res.send('1');
        } else {
            res.send('0');
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;