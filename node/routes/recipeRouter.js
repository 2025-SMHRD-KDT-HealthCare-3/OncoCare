const express = require('express');
const router = express.Router();
const conn = require('../config/database');

/**
 * 8. 레시피 상세 정보 조회 (detailRecipe)
 *
 */
router.get('/detail', async (req, res) => {
    try {
        const recipe_idx = req.query.recipe_idx;
        
        const sql = `
            SELECT recipe_name, main_ingredients, recipe_category, cooking_method, nutrition_info 
            FROM t_recipe
            WHERE recipe_idx = ?
        `;

        const [results] = await conn.query(sql, [recipe_idx]);
        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        console.error('레시피 상세 조회 에러:', err);
        res.status(500).send('0');
    }
});

/**
 * 15. 내 식재료 리스트 조회 (ingredient)
 * 
 */
router.get('/ingredient', async (req, res) => {
    try {
        const user_idx = req.query.user_idx;

        const sql = `SELECT * FROM t_ingredient WHERE user_idx = ? ORDER BY created_at DESC`;

        const [results] = await conn.query(sql, [user_idx]);
        
        console.log("요청받은 ID:", user_idx);
        res.json(results);
    } catch (err) {
        console.error("DB 조회 중 에러 발생:", err);
        res.status(500).json({ message: "서버 에러", error: err.message });
    }
});

/**
 * 16. 식재료 상세 정보 조회 (detailIngredient)
 * 
 */
router.get('/ingredient/detail', async (req, res) => {
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
        console.error('식재료 상세 조회 에러:', err);
        res.status(500).send('0');
    }
});

/**
 * 17. 식재료 직접 등록 (registerIngredient)
 *
 */
router.post('/ingredient/register', async (req, res) => {
    try {
        const { user_idx, name, type, storage, cnt } = req.body;
        const sql = `
            INSERT INTO t_ingredient (user_idx, ingre_name, ingre_type, ingre_storage, cnt)
            VALUES (?, ?, ?, ?, ?)
        `;

        await conn.query(sql, [user_idx, name, type, storage, cnt]);
        res.send('1');
    } catch (err) {
        console.error('식재료 등록 에러:', err);
        res.send('0');
    }
});

// 14. 일일 식단 조회
router.get('/dailydiet', async (req, res) => {
    try {
        const { user_idx, date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const sql = `
            SELECT
                A.diet_idx,
                A.recipe_idx,
                B.recipe_name,
                A.meal_type,
                A.select_date
            FROM t_diet A
            JOIN t_recipe B ON A.recipe_idx = B.recipe_idx
            WHERE A.user_idx = ?
                AND A.select_date = ?
        `;

        const [results] = await conn.query(sql, [user_idx, targetDate]);

        res.json(results.length > 0 ? results : []);
    } catch (err) {
        console.error('일일 식단 조회 에러:', err);
        res.status(500).send('0');
    }
});

/**
 * [식재료 삭제]
 * 
 */
router.post('/ingredient/delete', async (req, res) => {
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
        console.error('식재료 삭제 에러:', err);
        res.send('0');
    }
});

/**
 * [식재료 수정]
 *
 */
router.post('/ingredient/update', async (req, res) => {
    try {
        const { 
            ingre_idx, 
            user_idx,
            ingre_name, 
            ingre_type, 
            ingre_storage, 
            cnt 
        } = req.body;

        if (!ingre_idx || !user_idx) {
            return res.send('0');
        }
        const sql = `
            UPDATE t_ingredient 
            SET 
                ingre_name = ?, 
                ingre_type = ?, 
                ingre_storage = ?, 
                cnt = ?
            WHERE ingre_idx = ? AND user_idx = ?
        `;

        const [result] = await conn.query(sql, [
            ingre_name,
            ingre_type,
            ingre_storage,
            cnt, 
            ingre_idx,
            user_idx
        ]);

        if (result.affectedRows > 0) {
            res.send('1');
        } else {
            res.send('0');
        }
    } catch (err) {
        console.error('식재료 수정 에러:', err);
        res.send('0');
    }
});



module.exports = router;