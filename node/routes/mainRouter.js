const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * 5. 사용자 맞춤 추천 식단 리스트 출력 (7개)
 * GET /main/dietList/:user_idx
 */
router.get('/dietList/:user_idx', (req, res) => {
    const user_idx = req.params.user_idx;

    // [STEP 1] 우선 건강 프로필(T_HEALTH_PROFILE)이 있는지 확인
    const profileSql = 'SELECT * FROM t_health_profile WHERE user_idx = ?';

    db.query(profileSql, [user_idx], (err, profile) => {
        if (err) return res.status(500).send('0');

        // 정보가 없는 초기 상황이면 리액트에서 "정보 입력" UI를 띄우도록 신호 보냄
        if (profile.length === 0) {
            return res.json({ status: 'no_profile', message: '사용자 정보가 없습니다.' });
        }

        // [STEP 2] 정보가 있다면 추천 식단 7개 가져오기
        // (is_selected: 오늘 이미 선택한 레시피인지 확인하는 서브쿼리 포함)
        const recipeSql = `
            SELECT 
                r.recipe_idx, 
                r.recipe_name, 
                r.recipe_category,
                (SELECT COUNT(*) FROM t_diet d 
                 WHERE d.recipe_idx = r.recipe_idx 
                 AND d.user_idx = ? 
                 AND DATE(d.created_at) = CURDATE()) as is_selected
            FROM t_recipe r
            ORDER BY RAND() 
            LIMIT 7
        `;

        db.query(recipeSql, [user_idx], (err, recipes) => {
            if (err) return res.status(500).send('0');
            res.json({ status: 'success', data: recipes });
        });
    });
});

/**
 * 6. 레시피 식단 선택 (저장)
 * POST /main/clickRecipe
 */
router.post('/clickRecipe', (req, res) => {
    const { user_idx, recipe_idx } = req.body;

    // T_DIET 테이블에 오늘 날짜로 기록 추가
    // start_date, end_date는 일단 오늘 날짜로 저장
    const sql = `
        INSERT INTO t_diet (user_idx, recipe_idx, start_date, end_date, created_at)
        VALUES (?, ?, CURDATE(), CURDATE(), NOW())
    `;

    db.query(sql, [user_idx, recipe_idx], (err, result) => {
        if (err) {
            console.error('식단 선택 에러:', err);
            return res.send('0');
        }
        res.send('1'); // 성공
    });
});

/**
 * 7. 레시피 식단 선택 취소 (삭제)
 * POST /main/unClickRecipe
 */
router.post('/unClickRecipe', (req, res) => {
    const { user_idx, recipe_idx } = req.body;

    // 오늘 날짜(CURDATE)에 선택했던 해당 레시피 기록만 삭제
    const sql = `
        DELETE FROM t_diet 
        WHERE user_idx = ? 
        AND recipe_idx = ? 
        AND DATE(created_at) = CURDATE()
    `;

    db.query(sql, [user_idx, recipe_idx], (err, result) => {
        if (err) {
            console.error('식단 취소 에러:', err);
            return res.send('0');
        }
        res.send('1'); // 성공
    });
});

module.exports = router;