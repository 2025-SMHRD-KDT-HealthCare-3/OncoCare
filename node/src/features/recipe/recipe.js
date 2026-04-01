/*
 * [Recipe Feature]
 * 특정 레시피의 상세 정보 조회
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [레시피 상세 정보 조회]
 */
router.get('/detail', asyncWrap(async (req, res) => {
    const recipe_idx = req.query.recipe_idx;
    
    if (!recipe_idx) {
        const error = new Error("레시피 번호가 필요합니다.");
        error.status = 400;
        throw error;
    }

    const sql = `
        SELECT recipe_name, main_ingredients, recipe_category, cooking_method, nutrition_info 
        FROM t_recipe
        WHERE recipe_idx = ?
    `;

    const [results] = await conn.query(sql, [recipe_idx]);
    res.json(results.length > 0 ? results[0] : '0');
}));

module.exports = router;