const express = require('express');
const router = express.Router();
const conn = require('../config/database'); // DB 연결 모듈 경로에 맞게 수정해주세요

// =========================================================================
// 1. [식단 추천] FastAPI에서 생성된 식단 결과 수신 및 저장
// POST /api/diet
// =========================================================================
// =========================================================================
// 1. [식단 추천] FastAPI에서 생성된 식단(레시피) 결과 수신 및 저장
// POST /api/diet
// =========================================================================
router.post('/diet', async (req, res) => {
    try {
        // t_recipe 테이블 스키마에 맞춰 FastAPI에서 보내주는 데이터 수신
        const { 
            user_idx, 
            recipe_name, 
            cooking_method, 
            nutrition_info, 
            recipe_category 
        } = req.body;

        console.log(`[FastAPI -> Node] 레시피 수신 (User: ${user_idx}, Recipe: ${recipe_name})`);

        // 유효성 검사 (필수 값이 다 들어왔는지 체크)
        if (!user_idx || !recipe_name || !cooking_method || !nutrition_info || !recipe_category) {
            return res.status(400).json({ success: false, message: "레시피 저장에 필요한 데이터가 누락되었습니다." });
        }

        const sql = `
            INSERT INTO t_recipe 
            (user_idx, recipe_name, cooking_method, nutrition_info, recipe_category)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        // DB에 INSERT 실행
        const [result] = await conn.query(sql, [
            user_idx, 
            recipe_name, 
            cooking_method, 
            nutrition_info, 
            recipe_category
        ]);

        res.json({ 
            success: true, 
            message: "추천 레시피가 성공적으로 저장되었습니다.",
            recipe_idx: result.insertId // 방금 생성된 레시피의 식별자(PK)를 반환해주면 유용합니다.
        });

    } catch (err) {
        console.error("레시피 저장 에러:", err);
        res.status(500).json({ success: false, message: "레시피 저장 중 서버 에러 발생" });
    }
});

// =========================================================================
// 2. [일일 레포트] FastAPI에서 생성된 결과 수신 및 저장
// POST /api/report/daily
// =========================================================================
router.post('/report/daily', async (req, res) => {
    try {
        const { 
            user_idx, report_date, report_score, report_diet, 
            report_bowel, report_condition, report_comment 
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
            user_idx, report_date, report_score, report_diet, 
            report_bowel, report_condition, report_comment
        ]);

        res.json({ success: true, message: "일일 레포트 저장 완료" });
    } catch (err) {
        console.error("일일 레포트 저장 에러:", err);
        res.status(500).json({ success: false, message: "일일 레포트 저장 실패" });
    }
});

// =========================================================================
// 3. [주간 레포트] FastAPI에서 생성된 결과 수신 및 저장
// POST /api/report/weekly
// =========================================================================
router.post('/report/weekly', async (req, res) => {
    try {
        const { 
            user_idx, start_date, end_date, report_week_label, 
            report_title, report_score, report_diet, report_bowel, report_condition 
        } = req.body;

        console.log(`[FastAPI -> Node] 주간 레포트 수신 (User: ${user_idx}, Start: ${start_date})`);

        const sql = `
            INSERT INTO t_weekly_report 
            (user_idx, start_date, end_date, report_week_label, report_title, report_score, report_diet, report_bowel, report_condition)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            report_week_label = VALUES(report_week_label),
            report_title = VALUES(report_title),
            report_score = VALUES(report_score),
            report_diet = VALUES(report_diet),
            report_bowel = VALUES(report_bowel),
            report_condition = VALUES(report_condition)
        `;

        await conn.query(sql, [
            user_idx, start_date, end_date, report_week_label, report_title, 
            report_score, report_diet, report_bowel, report_condition
        ]);

        res.json({ success: true, message: "주간 레포트 저장 완료" });
    } catch (err) {
        console.error("주간 레포트 저장 에러:", err);
        res.status(500).json({ success: false, message: "주간 레포트 저장 실패" });
    }
});

// =========================================================================
// 4. [월간 레포트] FastAPI에서 생성된 결과 수신 및 저장
// POST /api/report/monthly
// =========================================================================
router.post('/report/monthly', async (req, res) => {
    try {
        const { 
            user_idx, report_month, report_score, report_diet, 
            report_bowel, report_condition, report_comment 
        } = req.body;

        console.log(`[FastAPI -> Node] 월간 레포트 수신 (User: ${user_idx}, Month: ${report_month})`);

        const sql = `
            INSERT INTO t_monthly_report 
            (user_idx, report_month, report_score, report_diet, report_bowel, report_condition, report_comment)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            report_score = VALUES(report_score),
            report_diet = VALUES(report_diet),
            report_bowel = VALUES(report_bowel),
            report_condition = VALUES(report_condition),
            report_comment = VALUES(report_comment)
        `;

        await conn.query(sql, [
            user_idx, report_month, report_score, report_diet, 
            report_bowel, report_condition, report_comment
        ]);

        res.json({ success: true, message: "월간 레포트 저장 완료" });
    } catch (err) {
        console.error("월간 레포트 저장 에러:", err);
        res.status(500).json({ success: false, message: "월간 레포트 저장 실패" });
    }
});

// =========================================================================
// 1. [식단 추천용 데이터 제공] FastAPI가 건강 프로필 & 냉장고 재고를 가져감
// GET /api/data/for-diet?user_idx=1
// =========================================================================
router.get('/for-diet', async (req, res) => {
    try {
        const { user_idx } = req.query;
        if (!user_idx) return res.status(400).send('user_idx가 필요합니다.');

        // 1-1. 등록된 건강 프로필 1건 조회
        const profileSql = `
            SELECT height, weight, cancer_stage, surgery_date, discharge_date, 
                   stoma_status, chemo_status, alergy, meals_per_day 
            FROM t_health_profile 
            WHERE user_idx = ? 
        `;
        const [profileRows] = await conn.query(profileSql, [user_idx]);

        // 1-2. 현재 사용자가 보유한 식재료 목록 전체 조회
        const ingredientSql = `
            SELECT ingre_name, ingre_type, ingre_storage, cnt 
            FROM t_ingredient 
            WHERE user_idx = ?
        `;
        const [ingredientRows] = await conn.query(ingredientSql, [user_idx]);

        res.json({
            success: true,
            health_profile: profileRows.length > 0 ? profileRows[0] : null,
            ingredients: ingredientRows
        });

    } catch (err) {
        console.error("식단 추천 데이터 조회 에러:", err);
        res.status(500).json({ success: false, message: "서버 에러" });
    }
});

// =========================================================================
// 2. [일일 레포트 생성용 데이터 제공] 당일 컨디션, 배변 기록, 섭취 식단(레시피 포함)
// GET /api/data/for-report?user_idx=1&target_date=2026-03-25
// =========================================================================
router.get('/for-report', async (req, res) => {
    try {
        const { user_idx, target_date } = req.query;
        if (!user_idx || !target_date) {
            return res.status(400).send('user_idx와 target_date가 필요합니다.');
        }

        // 2-1. 당일 컨디션 조회
        const conditionSql = `
            SELECT condition_score, sleep_score, water_intake, stomach_pain 
            FROM t_condition 
            WHERE user_idx = ? AND DATE(created_at) = ?
        `;
        const [conditionRows] = await conn.query(conditionSql, [user_idx, target_date]);

        // 2-2. 당일 배변 기록 조회 (하루에 여러 번 할 수 있으므로 전체 목록)
        const bowelSql = `
            SELECT bowel_status, TIME(created_at) as bowel_time
            FROM t_bowel_log 
            WHERE user_idx = ? AND DATE(created_at) = ?
            ORDER BY created_at ASC
        `;
        const [bowelRows] = await conn.query(bowelSql, [user_idx, target_date]);

        // 2-3. 당일 섭취한 식단 및 레시피 정보 (핵심: t_recipe JOIN)
        // start_date와 end_date 사이에 target_date가 포함되는 식단, 혹은 당일 등록된 식단
        const dietSql = `
            SELECT d.diet_feedback, d.diet_rating, 
                   r.recipe_name, r.cooking_method, r.nutrition_info, r.recipe_category
            FROM t_diet d
            JOIN t_recipe r ON d.recipe_idx = r.recipe_idx
            WHERE d.user_idx = ? 
              AND ? BETWEEN d.start_date AND d.end_date
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

    } catch (err) {
        console.error("레포트 생성 데이터 조회 에러:", err);
        res.status(500).json({ success: false, message: "서버 에러" });
    }
});

// =========================================================================
// 3. [주간 레포트 생성용 데이터 제공] 일정 날짜를 주면 해당 주차 데이터 전체 제공
// GET /api/data/for-weekly-report?user_idx=1&target_date=2026-03-25
// =========================================================================
router.get('/for-weekly-report', async (req, res) => {
    try {
        const { user_idx, target_date } = req.query;
        if (!user_idx || !target_date) {
            return res.status(400).send('user_idx와 target_date가 필요합니다.');
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
            SELECT report_date, report_score, report_diet, report_bowel, report_condition
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

    } catch (err) {
        console.error("주간 레포트 데이터 조회 에러:", err);
        res.status(500).json({ success: false, message: "서버 에러" });
    }
});

// =========================================================================
// 4. [월간 레포트 생성용 데이터 제공] 달(Month) 숫자만 주면 해당 월 데이터 제공
// GET /api/data/for-monthly-report?user_idx=1&month=3
// =========================================================================
router.get('/for-monthly-report', async (req, res) => {
    try {
        const { user_idx, month } = req.query;
        if (!user_idx || !month) {
            return res.status(400).send('user_idx와 month(예: 3)가 필요합니다.');
        }

        // 연도 구분 없이 3월만 가져오면 내년 데이터와 섞일 수 있으므로, 현재 연도 추출
        const currentYear = new Date().getFullYear(); 

        // MySQL의 YEAR()와 MONTH() 함수를 사용하여 필터링
        const sql = `
            SELECT report_week_label, report_title, report_score, 
                   report_diet, report_bowel, report_condition
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

    } catch (err) {
        console.error("월간 레포트 데이터 조회 에러:", err);
        res.status(500).json({ success: false, message: "서버 에러" });
    }
});

module.exports = router;