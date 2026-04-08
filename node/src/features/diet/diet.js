/*
 * [Diet Feature]
 * 식단 추천 리스트 조회, 식단 선택(저장), 취소, 피드백 수정
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [사용자 맞춤 추천 식단 리스트 출력]
 */
router.get('/dietList/:user_idx', asyncWrap(async (req, res) => {
    const { user_idx } = req.params;
    const { date, since } = req.query;
    // since: 이 시각 이후 생성된 레시피만 반환 (새로고침 신규 배치용)

    if (!user_idx) {
        const error = new Error("사용자 번호가 유효하지 않습니다.");
        error.status = 400;
        throw error;
    }

    const profileSql = 'SELECT user_idx FROM t_health_profile WHERE user_idx = ?';
    const [profile] = await conn.query(profileSql, [user_idx]);

    if (profile.length === 0) {
        return res.send('0');
    }

    let recipes = [];

    // since가 있으면: 해당 시각 이후 생성된 최신 7개 반환
    if (since) {
        const sinceSql = `
            SELECT recipe_idx, recipe_name, recipe_category, nutrition_info
            FROM t_recipe
            WHERE user_idx = ?
            AND created_at > ?
            ORDER BY created_at DESC
            LIMIT 7
        `;
        [recipes] = await conn.query(sinceSql, [user_idx, since]);
    }
    // 날짜가 지정된 경우: 해당 날짜에 생성된 추천 레시피 조회
    else if (date) {
        const dateSql = `
            SELECT
                MAX(recipe_idx) as recipe_idx,
                recipe_name,
                MAX(recipe_category) as recipe_category,
                MAX(nutrition_info) as nutrition_info
            FROM t_recipe
            WHERE user_idx = ?
            AND DATE(created_at) = ?
            GROUP BY recipe_name
            ORDER BY MAX(created_at) DESC
            LIMIT 7
        `;
        [recipes] = await conn.query(dateSql, [user_idx, date]);
    }


    if (recipes.length > 0) {
        res.json(recipes);
    } else {
        res.send('0');
    }
}));

/*
 * [레시피 식단 선택 (저장)]
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

    // 💡 [식재료 차감 로직 추가] 식단이 확정되면 냉장고에서 해당 재료 차감
    try {
        // 1. 선택한 레시피의 차감용 식재료 배열 데이터 가져오기
        const [recipeRows] = await conn.query('SELECT deduct_ingredients FROM t_recipe WHERE recipe_idx = ?', [recipe_idx]);
        if (recipeRows.length > 0 && recipeRows[0].deduct_ingredients) {
            const deductList = JSON.parse(recipeRows[0].deduct_ingredients);

            // 2. 사용자의 냉장고에서 해당 식재료 찾아 정확한 수량만큼 차감
            for (const item of deductList) {
                const [ingreRows] = await conn.query(
                    'SELECT ingre_idx, cnt FROM t_ingredient WHERE user_idx = ? AND ingre_name = ?',
                    [user_idx, item.name]
                );
                
                if (ingreRows.length > 0) {
                    const ingre = ingreRows[0];
                    const newCnt = parseFloat(ingre.cnt) - parseFloat(item.amount);
                    
                    if (newCnt > 0) {
                        await conn.query('UPDATE t_ingredient SET cnt = ? WHERE ingre_idx = ?', [newCnt, ingre.ingre_idx]);
                    } else {
                        await conn.query('DELETE FROM t_ingredient WHERE ingre_idx = ?', [ingre.ingre_idx]);
                    }
                }
            }
        }
    } catch (err) {
        console.error("[식재료 차감 에러]", err);
        // 차감에 실패해도 식단 선택 자체는 유지되도록 에러를 던지지 않음
    }

    res.send('1');
}));

/*
 * [레시피 식단 선택 취소 (삭제)]
 */
router.post('/unClickRecipe', asyncWrap(async (req, res) => {
    const { diet_idx } = req.body;
    
    if (!diet_idx) {
        const error = new Error("취소할 식단 기록 번호가 없습니다.");
        error.status = 400;
        throw error;
    }

    // 💡 1. 취소할 식단의 정보(user_idx, recipe_idx) 먼저 조회
    const [dietRows] = await conn.query('SELECT user_idx, recipe_idx FROM t_diet WHERE diet_idx = ?', [diet_idx]);
    
    if (dietRows.length > 0) {
        const { user_idx, recipe_idx } = dietRows[0];
        
        // 💡 2. 식재료 복구(+) 로직
        try {
            const [recipeRows] = await conn.query('SELECT deduct_ingredients FROM t_recipe WHERE recipe_idx = ?', [recipe_idx]);
            if (recipeRows.length > 0 && recipeRows[0].deduct_ingredients) {
                const deductList = JSON.parse(recipeRows[0].deduct_ingredients);
                
                for (const item of deductList) {
                    const [ingreRows] = await conn.query('SELECT ingre_idx FROM t_ingredient WHERE user_idx = ? AND ingre_name = ?', [user_idx, item.name]);
                    
                    if (ingreRows.length > 0) {
                        // 냉장고에 항목이 아직 남아있다면 수량 원상복구(+)
                        await conn.query('UPDATE t_ingredient SET cnt = cnt + ? WHERE ingre_idx = ?', [parseFloat(item.amount), ingreRows[0].ingre_idx]);
                    } else {
                        // 차감 시 0이 되어 삭제되었다면 새로 생성하여 복구
                        await conn.query(`
                            INSERT INTO t_ingredient (user_idx, ingre_name, ingre_type, ingre_storage, cnt, ingre_unit)
                            VALUES (?, ?, '기타', '냉장', ?, ?)
                        `, [user_idx, item.name, parseFloat(item.amount), item.unit || '개']);
                    }
                }
            }
        } catch (err) {
            console.error("[식재료 복구 에러]", err);
        }

        // 💡 3. 식단 기록 최종 삭제
        const sql = `DELETE FROM t_diet WHERE diet_idx = ?`;
        await conn.query(sql, [diet_idx]);
        
        res.send('1');
    } else {
        res.send('0');
    }
}));

/*
 * [식단 피드백 및 평점 수정]
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

    if (result.affectedRows > 0) {
        res.send('1');
    } else {
        res.send('0');
    }
}));

/*
 * [일일 식단 조회]
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
    res.json(results.length > 0 ? results : []);
}));

/*
 * [오늘의 식단 기록 조회]
 */
router.get('/getDailyDiet', asyncWrap(async (req, res) => {
    const { user_idx, date } = req.query;

    if (!user_idx || !date) {
        const error = new Error("사용자 정보와 조회 날짜가 필요합니다.");
        error.status = 400;
        throw error;
    }

    const sql = `
        SELECT A.diet_idx, B.recipe_name, A.meal_type, A.diet_feedback, A.diet_rating
        FROM t_diet A
        JOIN t_recipe B ON A.recipe_idx = B.recipe_idx
        WHERE A.user_idx = ? AND A.select_date = ?
    `;
    const [results] = await conn.query(sql, [user_idx, date]);
    res.json(results);
}));

/*
 * [식단 기록 삭제]
 */
router.post('/deleteDiet', asyncWrap(async (req, res) => {
    const { diet_idx } = req.body;

    if (!diet_idx) {
        const error = new Error("삭제할 식단 기록 번호가 없습니다.");
        error.status = 400;
        throw error;
    }

    // 💡 취소(/unClickRecipe)와 동일하게 식재료 원상복구(+) 로직 적용
    const [dietRows] = await conn.query('SELECT user_idx, recipe_idx FROM t_diet WHERE diet_idx = ?', [diet_idx]);
    
    if (dietRows.length > 0) {
        const { user_idx, recipe_idx } = dietRows[0];
        try {
            const [recipeRows] = await conn.query('SELECT deduct_ingredients FROM t_recipe WHERE recipe_idx = ?', [recipe_idx]);
            if (recipeRows.length > 0 && recipeRows[0].deduct_ingredients) {
                const deductList = JSON.parse(recipeRows[0].deduct_ingredients);
                for (const item of deductList) {
                    const [ingreRows] = await conn.query('SELECT ingre_idx FROM t_ingredient WHERE user_idx = ? AND ingre_name = ?', [user_idx, item.name]);
                    if (ingreRows.length > 0) {
                        await conn.query('UPDATE t_ingredient SET cnt = cnt + ? WHERE ingre_idx = ?', [parseFloat(item.amount), ingreRows[0].ingre_idx]);
                    } else {
                        await conn.query(`
                            INSERT INTO t_ingredient (user_idx, ingre_name, ingre_type, ingre_storage, cnt, ingre_unit)
                            VALUES (?, ?, '기타', '냉장', ?, ?)
                        `, [user_idx, item.name, parseFloat(item.amount), item.unit || '개']);
                    }
                }
            }
        } catch (err) {
            console.error("[식재료 복구 에러]", err);
        }
        await conn.query(`DELETE FROM t_diet WHERE diet_idx = ?`, [diet_idx]);
        res.send('1');
    } else {
        res.send('0');
    }
}));

module.exports = router;