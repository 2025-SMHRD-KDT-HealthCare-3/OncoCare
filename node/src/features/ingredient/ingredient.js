/*
 * [Diet Feature]
 * 식단 추천, 선택/취소, 피드백 관리, 일일 식단 조회 및 식재료 목록 조회
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [사용자 맞춤 추천 식단 리스트 출력]
 * GET /api/diet/dietList/:user_idx
 */
router.get('/dietList/:user_idx', asyncWrap(async (req, res) => {
    const { user_idx } = req.params;

    if (!user_idx) {
        const error = new Error("사용자 번호가 유효하지 않습니다.");
        error.status = 400;
        throw error;
    }

    const profileSql = 'SELECT user_idx FROM t_health_profile WHERE user_idx = ?';
    const [profile] = await conn.query(profileSql, [user_idx]);

    if (profile.length === 0) {
        return res.json({ result: '0', message: '건강 프로필이 존재하지 않습니다.' });
    }

    const recipeSql = `
        SELECT 
            MAX(recipe_idx) as recipe_idx, 
            recipe_name, 
            MAX(recipe_category) as recipe_category
        FROM t_recipe
        WHERE user_idx = ?
        GROUP BY recipe_name
        ORDER BY MAX(created_at) DESC
        LIMIT 7
    `;

    const [recipes] = await conn.query(recipeSql, [user_idx]);

    res.json(recipes.length > 0 ? recipes : []);
}));

/*
 * [레시피 식단 선택 (저장)]
 * POST /api/diet/clickRecipe
 */
router.post('/clickRecipe', asyncWrap(async (req, res) => {
    const { user_idx, recipe_idx, meal_type } = req.body;

    if (!user_idx || !recipe_idx || !meal_type) {
        const error = new Error("사용자 정보, 레시피 번호, 식사 유형은 필수입니다.");
        error.status = 400;
        throw error;
    }

    const sql = `
        INSERT INTO t_diet (
            user_idx, recipe_idx, meal_type, 
            select_date, end_date, diet_feedback, diet_rating, created_at
        )
        VALUES (?, ?, ?, CURDATE(), CURDATE(), ?, ?, NOW())
    `;

    await conn.query(sql, [user_idx, recipe_idx, meal_type, '', 0]);
    res.json({ result: '1' });
}));

/*
 * [레시피 식단 선택 취소 (삭제)]
 * POST /api/diet/unClickRecipe
 */
router.post('/unClickRecipe', asyncWrap(async (req, res) => {
    const { diet_idx } = req.body;
    
    if (!diet_idx) {
        const error = new Error("취소할 식단 기록 번호가 없습니다.");
        error.status = 400;
        throw error;
    }

    const sql = `DELETE FROM t_diet WHERE diet_idx = ?`;
    const [result] = await conn.query(sql, [diet_idx]);

    res.json({ result: result.affectedRows > 0 ? '1' : '0' });
}));

/*
 * [식단 피드백 및 평점 수정]
 * POST /api/diet/updateDiet
 */
router.post('/updateDiet', asyncWrap(async (req, res) => {
    const { diet_idx, diet_feedback, diet_rating } = req.body;
    
    if (!diet_idx) {
        const error = new Error("수정할 식단 기록 번호가 필요합니다.");
        error.status = 400;
        throw error;
    }

    const sql = `
        UPDATE t_diet 
        SET 
            diet_feedback = ?, 
            diet_rating = ?,
            end_date = CURDATE()
        WHERE diet_idx = ?
    `;

    const [result] = await conn.query(sql, [diet_feedback, diet_rating, diet_idx]);

    res.json({ result: result.affectedRows > 0 ? '1' : '0' });
}));

/*
 * [일일 식단 조회]
 * GET /api/diet/dailydiet
 */
router.get('/dailydiet', asyncWrap(async (req, res) => {
    const { user_idx, date } = req.query;

    if (!user_idx) {
        const error = new Error("사용자 식별 정보가 필요합니다.");
        error.status = 400;
        throw error;
    }

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
    res.json(results);
}));

/**
 * [식단 기록 삭제]
 * POST /api/diet/deleteDiet
 */
router.post('/deleteDiet', asyncWrap(async (req, res) => {
    const { diet_idx } = req.body;

    if (!diet_idx) {
        const error = new Error("삭제할 식단 기록 번호가 없습니다.");
        error.status = 400;
        throw error;
    }

    const [result] = await conn.query(`DELETE FROM t_diet WHERE diet_idx = ?`, [diet_idx]);
    res.json({ result: result.affectedRows > 0 ? '1' : '0' });
}));

/**
 * [식재료 목록 조회]
 * GET /api/diet/ingredients
 */
router.get('/ingredients', asyncWrap(async (req, res) => {
    const { user_idx } = req.query;

    if (!user_idx) {
        const err = new Error("사용자 식별 번호가 필요합니다.");
        err.status = 400;
        throw err;
    }

    const sql = `SELECT * FROM t_ingredient WHERE user_idx = ?`;
    const [results] = await conn.query(sql, [user_idx]);

    res.json(results);
}));

module.exports = router;