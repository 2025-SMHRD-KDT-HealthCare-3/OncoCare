const express = require('express');
const router = express.Router();
const conn = require('../config/database');


/**
 * 5. 사용자 맞춤 추천 식단 리스트 출력 (중복 제거, 최신순 7개)
 * GET /recipe/dietList/:user_idx
 */
router.get('/dietList/:user_idx', async (req, res) => {
    // URL 파라미터에서 user_idx 추출
    const { user_idx } = req.params;

    try {
        // [STEP 1] 우선 건강 프로필(t_health_profile)이 있는지 확인
        const profileSql = 'SELECT user_idx FROM t_health_profile WHERE user_idx = ?';
        const [profile] = await conn.query(profileSql, [user_idx]);

        // 프로필 정보가 없는 초기 상황이면 '0' 반환 (리액트에서 정보 입력창 띄우기용)
        if (profile.length === 0) {
            console.log(`사용자(${user_idx})의 건강 프로필이 없습니다.`);
            return res.send('0');
        }

        // [STEP 2] 프로필이 있다면, '해당 유저'의 레시피 중 중복 없는 최신 7개 추출
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

        // 주의: user_idx 파라미터를 반드시 배열에 담아 전달해야 합니다.
        const [recipes] = await conn.query(recipeSql, [user_idx]);

        // 결과가 1개라도 있으면 데이터를 보내고, 아예 없으면 '0'을 보냅니다.
        if (recipes.length > 0) {
            res.json(recipes);
        } else {
            res.send('0');
        }

    } catch (err) {
        console.error("추천 식단 조회 중 서버 에러:", err);
        // 서버 에러 시에도 리액트가 멈추지 않도록 '0'을 보냅니다.
        res.status(500).send('0');
    }
});


/**
 * 6. 레시피 식단 선택 (저장)
 */
router.post('/clickRecipe', async (req, res) => {
    try {
        const { user_idx, recipe_idx, meal_type } = req.body;

        const sql = `
            INSERT INTO t_diet (
                user_idx, 
                recipe_idx, 
                meal_type, 
                select_date, 
                end_date, 
                diet_feedback,
                diet_rating,
                created_at
            )
            VALUES (?, ?, ?, CURDATE(), CURDATE(), ?, ?, NOW())
        `;

        await conn.query(sql, [user_idx, recipe_idx, meal_type, '', 0]);
        
        res.send('1');
    } catch (err) {
        console.error('식단 저장 에러:', err);
        res.send('0');
    }
});

/**
 * 7. 레시피 식단 선택 취소 (삭제)
 * POST /main/unClickRecipe
 */
router.post('/unClickRecipe', async (req, res) => {
    try {
        const { user_idx, recipe_idx } = req.body;
        const sql = `
            DELETE FROM t_diet 
            WHERE user_idx = ? 
            AND recipe_idx = ? 
            AND DATE(created_at) = CURDATE()
        `;
        await conn.connect.query(sql, [user_idx, recipe_idx]);
        res.send('1'); // 성공
    } catch (err) {
        console.error('식단 취소 에러:', err);
        res.send('0'); // 실패
    }
});

/**
 * 식단 피드백 및 평점 수정 (updateDiet)
 * POST /main/updateDiet
 */
router.post('/updateDiet', async (req, res) => {

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
            console.log(`✅ 식단 수정 완료: ID ${diet_idx}`);
            res.send('1');
        } else {
            res.send('0');
        }

    } catch (err) {
        console.error('❌ 식단 수정 에러:', err);
        res.send('0');
    }
});

module.exports = router;