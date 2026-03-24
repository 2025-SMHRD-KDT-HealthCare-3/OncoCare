const express = require('express');
const router = express.Router();
const conn = require('../config/database');

/**
 * 8. 레시피 상세 정보 조회 (detailRecipe)
 * GET /recipe/detail?recipe_idx=1
 */
router.get('/detail', async (req, res) => {
    try {
        // req.params 대신 req.query를 사용합니다.
        const recipe_idx = req.query.recipe_idx;
        
        const sql = `
            SELECT recipe_name, recipe_category, cooking_method, nutrition_info 
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
 * GET /recipe/ingredient?user_idx=1
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
 * GET /recipe/ingredient/detail?ingre_idx=1
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
 * POST /recipe/ingredient/register
 * (등록은 보안과 데이터 양 때문에 POST 방식을 유지하는 것이 정석입니다.)
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

module.exports = router;