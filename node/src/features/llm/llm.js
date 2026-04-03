const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const asyncWrap = require('../../middleware/asyncWrap');

/*
 * [식단 추천] FastAPI에서 생성된 식단(레시피) 결과 수신 및 저장
 * POST /ai/diet
 */
router.post('/diet', asyncWrap(async (req, res) => {
    // t_recipe 테이블 스키마에 맞춰 FastAPI에서 보내주는 데이터 수신
    const { user_idx, recipes, missing_ingredients } = req.body;

    console.log(`[FastAPI -> Node] 레시피 목록 수신 (User: ${user_idx}, 개수: ${recipes ? recipes.length : 0})`);

    // 유효성 검사 (필수 값이 다 들어왔는지 체크)
    if (!user_idx || !recipes || !Array.isArray(recipes) || recipes.length === 0) {
        throw new Error("레시피 저장에 필요한 데이터가 누락되었습니다.");
    }

    const sql = `
        INSERT INTO t_recipe 
        (user_idx, recipe_name, main_ingredients, cooking_method, nutrition_info, recipe_category)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // 💡 배열로 받은 7개의 레시피를 순회하며 DB에 모두 저장
    const insertedIds = [];
    for (const recipe of recipes) {
        const [result] = await conn.query(sql, [
            user_idx, 
            recipe.recipe_name, 
            recipe.main_ingredients,
            recipe.cooking_method, 
            recipe.nutrition_info, 
            recipe.recipe_category
        ]);
        insertedIds.push(result.insertId);
    }

    // 💡 [추가] 부족한 식재료 안내 메시지가 있다면 t_alert 테이블에 알림으로 저장
    if (missing_ingredients && missing_ingredients.trim() !== "") {
        const alertSql = `
            INSERT INTO t_alert
            (user_idx, alert_type, alert_msg, sent_at, received_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        const now = new Date();
        await conn.query(alertSql, [
            user_idx,
            '부족한 식재료',       // 알림 유형
            missing_ingredients, // 알림 메시지
            now,                 // 발신 시간
            now                  // 수신 시간 (즉시 수신으로 가정)
        ]);
        console.log(`[알림 저장 완료] User ${user_idx}에게 부족한 식재료 알림을 저장했습니다.`);
    }

    res.json({ 
        success: true, 
        message: "7개의 추천 레시피가 성공적으로 저장되었습니다.",
        missing_ingredients: missing_ingredients, // 💡 AI가 파악한 부족한 식재료 안내 메시지 전달
        recipe_idxs: insertedIds // 생성된 7개 레시피의 PK 배열 반환
    });
}));

/*
 * [일일 레포트] FastAPI에서 생성된 결과 수신 및 저장
 * POST /ai/report/daily
 */
router.post('/report/daily', asyncWrap(async (req, res) => {
    const { 
        user_idx, report_date, report_score, 
        report_diet, report_bowel, report_condition, report_comment 
    } = req.body;

    console.log(`[FastAPI -> Node] 일일 레포트 수신 (User: ${user_idx}, Date: ${report_date})`);

    const sql = `
        INSERT INTO t_daily_report 
        (user_idx, report_date, report_score, report_diet, report_bowel, report_condition, report_comment)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        report_score = VALUES(report_score),
        report_diet = VALUES(report_diet),
        report_bowel = VALUES(report_bowel),
        report_condition = VALUES(report_condition),
        report_comment = VALUES(report_comment)
    `;

    await conn.query(sql, [
        user_idx, report_date, report_score, 
        report_diet, report_bowel, report_condition, report_comment
    ]);

    res.json({ success: true, message: "일일 레포트 저장 완료" });
}));

/*
 * [주간 레포트] FastAPI에서 생성된 결과 수신 및 저장
 * POST /ai/report/weekly
 */
router.post('/report/weekly', asyncWrap(async (req, res) => {
    const { 
        user_idx, start_date, end_date, report_week_label, 
        report_title, report_score, report_score_list, report_score_list_comment,
        report_diet, report_bowel, report_condition, report_comment
    } = req.body;

    console.log(`[FastAPI -> Node] 주간 레포트 수신 (User: ${user_idx}, Start: ${start_date})`);

    const sql = `
        INSERT INTO t_weekly_report 
        (user_idx, start_date, end_date, report_week_label, report_title, report_score, report_score_list, report_score_list_comment, report_diet, report_bowel, report_condition, report_comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        report_week_label = VALUES(report_week_label),
        report_title = VALUES(report_title),
        report_score = VALUES(report_score),
        report_score_list = VALUES(report_score_list),
        report_score_list_comment = VALUES(report_score_list_comment),
        report_diet = VALUES(report_diet),
        report_bowel = VALUES(report_bowel),
        report_condition = VALUES(report_condition),
        report_comment = VALUES(report_comment)
    `;

    await conn.query(sql, [
        user_idx, start_date, end_date, report_week_label, report_title, 
        report_score, report_score_list, report_score_list_comment,
        report_diet, report_bowel, report_condition, report_comment
    ]);

    res.json({ success: true, message: "주간 레포트 저장 완료" });
}));

/*
 * [월간 레포트] FastAPI에서 생성된 결과 수신 및 저장
 * POST /ai/report/monthly
 */
router.post('/report/monthly', asyncWrap(async (req, res) => {
    const { 
        user_idx, report_month, report_month_label, report_title,
        report_score, report_score_list, report_score_list_comment, 
        report_diet, report_bowel, report_condition, report_comment 
    } = req.body;

    console.log(`[FastAPI -> Node] 월간 레포트 수신 (User: ${user_idx}, Month: ${report_month})`);

    const sql = `
        INSERT INTO t_monthly_report 
        (user_idx, report_month, report_month_label, report_title, report_score, report_score_list, report_score_list_comment, report_diet, report_bowel, report_condition, report_comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        report_month_label = VALUES(report_month_label),
        report_title = VALUES(report_title),
        report_score = VALUES(report_score),
        report_score_list = VALUES(report_score_list),
        report_score_list_comment = VALUES(report_score_list_comment),
        report_diet = VALUES(report_diet),
        report_bowel = VALUES(report_bowel),
        report_condition = VALUES(report_condition),
        report_comment = VALUES(report_comment)
    `;

    await conn.query(sql, [
        user_idx, report_month, report_month_label, report_title,
        report_score, report_score_list, report_score_list_comment, 
        report_diet, report_bowel, report_condition, report_comment
    ]);

    res.json({ success: true, message: "월간 레포트 저장 완료" });
}));

/*
  * [식재료 이미지 분석 결과 저장] FastAPI에서 감지한 식재료 목록 수신 및 벌크 저장
 * POST /ai/ingredient/bulk
 */
router.post('/ingredient/bulk', asyncWrap(async (req, res) => {
    const { user_idx, ingredients } = req.body;

    console.log(`[FastAPI -> Node] 감지된 식재료 목록 수신 (User: ${user_idx}, 개수: ${ingredients ? ingredients.length : 0})`);

    if (!user_idx || !ingredients || !Array.isArray(ingredients)) {
        throw new Error("식재료 저장에 필요한 데이터가 누락되었습니다.");
    }

    if (ingredients.length === 0) {
        return res.json({ success: true, message: "저장할 식재료가 없습니다.", inserted_ids: [] });
    }

    const checkSql = `SELECT ingre_idx FROM t_ingredient WHERE user_idx = ? AND ingre_name = ?`;
    const updateSql = `UPDATE t_ingredient SET cnt = cnt + ? WHERE ingre_idx = ?`;
    const insertSql = `
        INSERT INTO t_ingredient 
        (user_idx, ingre_name, ingre_type, ingre_storage, cnt)
        VALUES (?, ?, ?, ?, ?)
    `;

    const insertedIds = [];
    for (const item of ingredients) {
        // 1. 이미 냉장고에 해당 이름의 식재료가 있는지 검사
        const [rows] = await conn.query(checkSql, [user_idx, item.ingre_name]);

        if (rows.length > 0) {
            // 2. 존재한다면 개수(cnt)를 기존 값에 누적(+) 업데이트
            const existingIdx = rows[0].ingre_idx;
            await conn.query(updateSql, [item.cnt, existingIdx]);
            insertedIds.push(existingIdx);
        } else {
            // 3. 존재하지 않는다면 새 행(row)으로 삽입
            const [result] = await conn.query(insertSql, [
                user_idx, item.ingre_name, item.ingre_type, item.ingre_storage, item.cnt
            ]);
            insertedIds.push(result.insertId);
        }
    }

    res.json({ success: true, message: `${ingredients.length}개의 식재료가 성공적으로 저장(또는 누적)되었습니다.`, inserted_ids: insertedIds });
}));

/*
 * [식단 추천용 데이터 제공] FastAPI가 건강 프로필 & 냉장고 재고를 가져감
 * GET /ai/data/for-diet?user_idx=1
 */
router.get('/data/for-diet', asyncWrap(async (req, res) => {
    const { user_idx } = req.query;
    if (!user_idx) throw new Error("user_idx가 필요합니다.");

    // 1-1. 등록된 건강 프로필 1건 및 유저 기본 정보(나이, 성별) 조회 (t_user JOIN)
    const profileSql = `
        SELECT u.gender, u.birthdate,
               h.height, h.weight, h.cancer_stage, h.surgery_date, h.discharge_date, 
               h.stoma_status, h.chemo_status, h.allergy, h.meals_per_day 
        FROM t_health_profile h
        JOIN t_user u ON h.user_idx = u.user_idx
        WHERE h.user_idx = ? 
    `;
    const [profileRows] = await conn.query(profileSql, [user_idx]);

    // 1-2. 현재 사용자가 보유한 식재료 목록 전체 조회
    const ingredientSql = `
        SELECT ingre_name, ingre_type, ingre_storage, cnt 
        FROM t_ingredient 
        WHERE user_idx = ?
    `;
    const [ingredientRows] = await conn.query(ingredientSql, [user_idx]);

    // 1-3. 어제의 컨디션 및 식단 피드백(평점) 조회 추가
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y_year = yesterday.getFullYear();
    const y_month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const y_day = String(yesterday.getDate()).padStart(2, '0');
    const yesterday_str = `${y_year}-${y_month}-${y_day}`;

    const condSql = `
        SELECT condition_score, sleep_score, water_intake, stomach_pain, stomach_score 
        FROM t_condition 
        WHERE user_idx = ? AND DATE(created_at) = ?
    `;
    const [condRows] = await conn.query(condSql, [user_idx, yesterday_str]);

    const dietSql = `
        SELECT d.meal_type, d.diet_feedback, d.diet_rating, r.recipe_name, r.main_ingredients, r.cooking_method
        FROM t_diet d
        JOIN t_recipe r ON d.recipe_idx = r.recipe_idx
        WHERE d.user_idx = ? AND ? BETWEEN d.select_date AND d.end_date
    `;
    const [dietRows] = await conn.query(dietSql, [user_idx, yesterday_str]);

    res.json({
        success: true,
        health_profile: profileRows.length > 0 ? profileRows[0] : null,
        ingredients: ingredientRows,
        yesterday_condition: condRows.length > 0 ? condRows[0] : null,
        yesterday_diet: dietRows
    });
}));

/*
 * [일일 레포트 생성용 데이터 제공] 당일 컨디션, 배변 기록, 섭취 식단(레시피 포함)
 * GET /ai/data/for-report?user_idx=1&target_date=2026-03-25
 */
router.get('/data/for-report', asyncWrap(async (req, res) => {
    const { user_idx, target_date } = req.query;
    if (!user_idx || !target_date) {
        throw new Error("user_idx와 target_date가 필요합니다.");
    }

    // 2-1. 당일 컨디션 조회
    const conditionSql = `
        SELECT condition_score, sleep_score, water_intake, stomach_pain, stomach_score 
        FROM t_condition 
        WHERE user_idx = ? AND DATE(created_at) = ?
    `;
    const [conditionRows] = await conn.query(conditionSql, [user_idx, target_date]);

    // 2-2. 당일 배변 기록 조회 (하루에 여러 번 할 수 있으므로 전체 목록)
    const bowelSql = `
        SELECT bowel_status, bowel_at as bowel_time
        FROM t_bowel_log 
        WHERE user_idx = ? AND DATE(created_at) = ?
        ORDER BY created_at ASC
    `;
    const [bowelRows] = await conn.query(bowelSql, [user_idx, target_date]);

    // 2-3. 당일 섭취한 식단 및 레시피 정보 (핵심: t_recipe JOIN)
    // start_date와 end_date 사이에 target_date가 포함되는 식단, 혹은 당일 등록된 식단
    const dietSql = `
        SELECT d.meal_type, d.diet_feedback, d.diet_rating, 
               r.recipe_name, r.main_ingredients, r.cooking_method, r.nutrition_info, r.recipe_category
        FROM t_diet d
        JOIN t_recipe r ON d.recipe_idx = r.recipe_idx
        WHERE d.user_idx = ? 
          AND ? BETWEEN d.select_date AND d.end_date
    `;
    const [dietRows] = await conn.query(dietSql, [user_idx, target_date]);

    // AI에게 넘겨줄 종합 데이터 조립
    res.json({
        success: true,
        target_date: target_date,
        condition: conditionRows.length > 0 ? conditionRows[0] : null,
        bowel_logs: bowelRows, // 빈 배열일 수도 있음 (배변을 안 한 경우)
        diets: dietRows // 오늘 먹은 식단과 영양정보 리스트
    });
}));

/*
 * [주간 레포트 생성용 데이터 제공] 일정 날짜를 주면 해당 주차 데이터 전체 제공
 * GET /ai/data/for-weekly-report?user_idx=1&target_date=2026-03-25
 */
router.get('/data/for-weekly-report', asyncWrap(async (req, res) => {
    const { user_idx, target_date } = req.query;
    if (!user_idx || !target_date) {
        throw new Error("user_idx와 target_date가 필요합니다.");
    }

    // 1. target_date가 속한 주의 '월요일'과 '일요일' 날짜 계산
    const d = new Date(target_date);
    const dayOfWeek = d.getDay(); // 0: 일, 1: 월 ... 6: 토
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const mondayObj = new Date(d);
    mondayObj.setDate(d.getDate() - diffToMonday);

    const sundayObj = new Date(mondayObj);
    sundayObj.setDate(mondayObj.getDate() + 6);

    // 💡 [핵심 수정됨] 안전한 YYYY-MM-DD 변환 함수 (타임존 오류 방지)
    const formatYYYYMMDD = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const start_date = formatYYYYMMDD(mondayObj); // 계산된 월요일 날짜
    const end_date = formatYYYYMMDD(sundayObj);   // 계산된 일요일 날짜

    // 2. 월~일 기간 내의 데이터 조회 (월요일 기록이 없으면 화요일부터 알아서 가져옴)
    const sql = `
        SELECT report_date, report_score, report_diet, report_bowel, report_condition, report_comment
        FROM t_daily_report
        WHERE user_idx = ? AND report_date BETWEEN ? AND ?
        ORDER BY report_date ASC
    `;
    const [dailyReports] = await conn.query(sql, [user_idx, start_date, end_date]);

    res.json({
        success: true,
        period: `${start_date} ~ ${end_date}`,
        daily_reports: dailyReports // 작성된 일일 레포트만 배열로 반환
    });
}));

/*
 * [월간 레포트 생성용 데이터 제공] 달(Month) 숫자만 주면 해당 월 데이터 제공
 * GET /ai/data/for-monthly-report?user_idx=1&month=3
 */
router.get('/data/for-monthly-report', asyncWrap(async (req, res) => {
    const { user_idx, month } = req.query;
    if (!user_idx || !month) {
        throw new Error("user_idx와 month(예: 3)가 필요합니다.");
    }

    // 연도 구분 없이 3월만 가져오면 내년 데이터와 섞일 수 있으므로, 현재 연도 추출
    const currentYear = new Date().getFullYear(); 

    // MySQL의 YEAR()와 MONTH() 함수를 사용하여 필터링
    const sql = `
        SELECT report_week_label, report_title, report_score, 
               report_diet, report_bowel, report_condition, report_comment
        FROM t_weekly_report
        WHERE user_idx = ? 
          AND YEAR(start_date) = ? 
          AND MONTH(start_date) = ?
        ORDER BY start_date ASC
    `;
    const [weeklyReports] = await conn.query(sql, [user_idx, currentYear, month]);

    res.json({
        success: true,
        target_year_month: `${currentYear}년 ${month}월`,
        weekly_reports: weeklyReports
    });
}));

/*
 * [전체 유저 목록 제공] 스케줄러에서 모든 유저를 대상으로 실행하기 위함
 * GET /ai/data/all-users
 */
router.get('/data/all-users', asyncWrap(async (req, res) => {
    const sql = `SELECT user_idx FROM t_user`;
    const [rows] = await conn.query(sql);
    const userList = rows.map(row => row.user_idx); // [1, 2, 3, ...] 형태로 변환
    res.json({ success: true, users: userList });
}));

module.exports = router;