// const express = require('express');
// const router = express.Router();
// const conn = require('../config/database');

// /**
//  * 14-1. 메인페이지 달력용 AI 코멘트 단건 조회
//  * GET /report/comment?day=2026-03-24&user_idx=1
//  */
// router.get('/comment', async (req, res) => {
//     try {
//         const { day, user_idx } = req.query;

//         const sql = `
//             SELECT report_comment 
//             FROM t_daily_report 
//             WHERE user_idx = ? AND DATE(report_date) = ?
//         `;

//         const [results] = await conn.query(sql, [user_idx, day]);

//         // 데이터가 존재하면 코멘트 객체만 반환, 없으면 문자열 '0' 반환
//         res.json(results.length > 0 ? results[0] : '0');

//     } catch (err) {
//         console.error("AI 코멘트 조회 에러:", err);
//         res.status(500).send('0');
//     }
// });

// /**
//  * 14-2. 일일 레포트 전체 세부 내용 조회
//  * GET /report/detail?day=2026-03-24&user_idx=1
//  */
// router.get('/detail', async (req, res) => {
//     try {
//         const { day, user_idx } = req.query;

//         const sql = `
//             SELECT 
//                 report_idx, user_idx, report_date, report_score, 
//                 report_diet, report_bowel, report_condition, report_comment 
//             FROM t_daily_report 
//             WHERE user_idx = ? AND DATE(report_date) = ?
//         `;

//         const [results] = await conn.query(sql, [user_idx, day]);

//         res.json(results.length > 0 ? results[0] : '0');

//     } catch (err) {
//         console.error("일일 레포트 상세 조회 에러:", err);
//         res.status(500).send('0');
//     }
// });

// /**
//  * 14-3. 주간 레포트 전체 세부 내용 조회
//  * GET /report/weekly?user_idx=1 (기본: 이번 주 레포트)
//  * GET /report/weekly?user_idx=1&day=2026-03-11 (선택: 과거 특정 주차 레포트)
//  */
// router.get('/weekly', async (req, res) => {
//     try {
//         const { user_idx, day } = req.query;

//         if (!user_idx) {
//             return res.status(400).send('user_idx가 필요합니다.');
//         }

//         // 💡 핵심: day가 넘어오면 그 날짜를, 안 넘어오면 '오늘(new Date())'을 기준으로 잡음
//         const targetDate = day ? new Date(day) : new Date();

//         // 1. targetDate 기준 해당 주의 '월요일' 날짜 계산
//         const dayOfWeek = targetDate.getDay(); // 0: 일, 1: 월, ... 6: 토
//         const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
//         const mondayObj = new Date(targetDate);
//         mondayObj.setDate(targetDate.getDate() - diffToMonday);
        
//         // 타임존 문제 방지를 위해 로컬 시간 기준으로 YYYY-MM-DD 문자열 생성
//         const year = mondayObj.getFullYear();
//         const month = String(mondayObj.getMonth() + 1).padStart(2, '0');
//         const date = String(mondayObj.getDate()).padStart(2, '0');
//         const start_date = `${year}-${month}-${date}`;

//         // 2. 계산된 월요일(start_date)을 기준으로 DB 조회
//         const sql = `
//             SELECT 
//                 report_idx, user_idx, start_date, end_date, 
//                 report_week_label, report_title, report_score, 
//                 report_diet, report_bowel, report_condition 
//             FROM t_weekly_report 
//             WHERE user_idx = ? AND DATE(start_date) = ?
//         `;

//         const [results] = await conn.query(sql, [user_idx, start_date]);

//         // 데이터가 존재하면 객체 반환, 없으면 문자열 '0' 반환
//         res.json(results.length > 0 ? results[0] : '0');

//     } catch (err) {
//         console.error("주간 레포트 상세 조회 에러:", err);
//         res.status(500).send('0');
//     }
// });

// /**
//  * 14-4. 월간 레포트 전체 세부 내용 조회 (수정됨)
//  * GET /report/monthly?user_idx=1 (기본: 이번 달 레포트)
//  * GET /report/monthly?user_idx=1&month=2026-02 (선택: 과거 특정 월 레포트)
//  */
// router.get('/monthly', async (req, res) => {
//     try {
//         const { user_idx, month } = req.query;

//         if (!user_idx) {
//             return res.status(400).send('user_idx가 필요합니다.');
//         }

//         let targetMonth = month;

//         // 💡 핵심: 프론트에서 month(YYYY-MM)를 보내지 않으면 '이번 달'로 자동 세팅
//         if (!targetMonth) {
//             const now = new Date();
//             const year = now.getFullYear();
//             // getMonth()는 0부터 시작하므로 +1, 한 자리 수일 경우 앞에 '0'을 붙여줌 (예: 3 -> '03')
//             const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
//             targetMonth = `${year}-${currentMonth}`; // 결과: '2026-03'
//         }

//         // report_month는 varchar(7)이므로 바로 일치 여부를 검색
//         const sql = `
//             SELECT 
//                 report_idx, user_idx, report_month, report_score, 
//                 report_diet, report_bowel, report_condition, report_comment 
//             FROM t_monthly_report 
//             WHERE user_idx = ? AND report_month = ?
//         `;

//         const [results] = await conn.query(sql, [user_idx, targetMonth]);

//         res.json(results.length > 0 ? results[0] : '0');

//     } catch (err) {
//         console.error("월간 레포트 상세 조회 에러:", err);
//         res.status(500).send('0');
//     }
// });

// module.exports = router;