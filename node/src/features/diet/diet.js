/**
 * [Diet Feature]
 * 식단 추천 리스트 조회, 식단 선택(저장), 취소, 피드백 수정
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');

/**
 * [사용자 맞춤 추천 식단 리스트 출력]
 */
router.get('/dietList/:user_idx', async (req, res, next) => {
    const { user_idx } = req.params;

    try {
        const profileSql = 'SELECT user_idx FROM t_health_profile WHERE user_idx = ?';
        const [profile] = await conn.query(profileSql, [user_idx]);

        if (profile.length === 0) {
            return res.send('0');
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

        if (recipes.length > 0) {
            res.json(recipes);
        } else {
            res.send('0');
        }
    } catch (err) {
        next(err);
    }
});

/**
 * [레시피 식단 선택 (저장)]
 */
router.post('/clickRecipe', async (req, res, next) => {
    try {
        const { user_idx, recipe_idx, meal_type } = req.body;

        if (!user_idx || !recipe_idx) {
            const error = new Error("user_idx와 recipe_idx는 필수입니다.");
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
        res.send('1');
    } catch (err) {
        next(err);
    }
});

/**
 * [레시피 식단 선택 취소 (삭제)]
 */
router.post('/unClickRecipe', async (req, res, next) => {
    try {
        const { diet_idx } = req.body;

        if (!diet_idx) {
            return res.send('0');
        }

        const sql = `DELETE FROM t_diet WHERE diet_idx = ?`;
        const [result] = await conn.query(sql, [diet_idx]);

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
 * [식단 피드백 및 평점 수정]
 */
router.post('/updateDiet', async (req, res, next) => {
    try {
        const { diet_idx, diet_feedback, diet_rating } = req.body;

        if (!diet_idx) {
            return res.send('0');
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
 * [일일 식단 조회]
 * 
 */
router.get('/dailydiet', async (req, res, next) => {
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
        next(err);
    }
});

/**
 * [오늘의 식단 기록 조회]
 */
router.get('/getDailyDiet', async (req, res, next) => {
    try {
        const { user_idx, date } = req.query;
        const sql = `
            SELECT A.diet_idx, B.recipe_name, A.meal_type, A.diet_feedback, A.diet_rating
            FROM t_diet A
            JOIN t_recipe B ON A.recipe_idx = B.recipe_idx
            WHERE A.user_idx = ? AND A.select_date = ?
        `;
        const [results] = await conn.query(sql, [user_idx, date]);
        res.json(results);
    } catch (err) {
        next(err);
    }
});

/**
 * [식단 기록 삭제]
 */
router.post('/deleteDiet', async (req, res, next) => {
    try {
        const { diet_idx } = req.body;
        await conn.query(`DELETE FROM t_diet WHERE diet_idx = ?`, [diet_idx]);
        res.send('1');
    } catch (err) {
        next(err);
    }
});

module.exports = router;