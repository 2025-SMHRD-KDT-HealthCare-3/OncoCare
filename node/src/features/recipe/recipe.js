/**
 * [Recipe Feature]
 * 특정 레시피의 상세 정보(재료, 조리법, 영양정보) 조회
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');

/**
 * [레시피 상세 정보 조회]
 */
router.get('/detail', async (req, res, next) => {
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
        next(err);
    }
});

module.exports = router;