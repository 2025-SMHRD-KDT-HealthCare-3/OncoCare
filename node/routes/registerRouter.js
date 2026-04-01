// const express = require('express');
// const router = express.Router();
// const conn = require('../config/database');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

// /**
//  * 11. 회원정보 수정 (비밀번호 변경 포함)
//  * POST /register/userUpdate
//  */
// router.post('/userUpdate', async (req, res) => {
//     try {
//         const { user_idx, name, password, confirmPassword, phone } = req.body;

//         // 1. 새 비밀번호 입력 시 일치 여부 확인
//         if (password && password !== confirmPassword) {
//             return res.status(400).send('비밀번호가 일치하지 않습니다.');
//         }

//         let sql = `UPDATE t_user SET user_name = ?, user_phone = ?`;
//         let params = [name, phone];

//         // 2. 비밀번호도 수정하는 경우 암호화하여 추가
//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, saltRounds);
//             sql += `, pw = ?`;
//             params.push(hashedPassword);
//         }

//         sql += ` WHERE user_idx = ?`;
//         params.push(user_idx);

//         await conn.query(sql, params);
//         res.send('1'); 
//     } catch (err) {
//         console.error(err);
//         res.send('0');
//     }
// });

// /**
//  * 12. 건강정보 조회
//  */
// router.get('/healthSelect', async (req, res) => {
//     try {
//         const { user_idx } = req.query;
//         const sql = `SELECT * FROM t_health_profile WHERE user_idx = ?`;
//         const [results] = await conn.query(sql, [user_idx]);
//         res.json(results.length > 0 ? results[0] : '0');
//     } catch (err) {
//         res.status(500).send('0');
//     }
// });


// /**
//  * 13. 건강정보 저장/수정 (UPSERT)
//  */
// router.post('/registerHealth', async (req, res) => {
//     try {
//         const { 
//             user_idx, height, weight, cancer_stage, surgery_date, 
//             discharge_date, stoma_status, chemo_status, allergy, meals_per_day 
//         } = req.body;

//         // 1. NOT NULL 제약 조건에 따른 기본값 처리
//         const v_height = (height && !isNaN(height)) ? parseFloat(height) : 0.0;
//         const v_weight = (weight && !isNaN(weight)) ? parseFloat(weight) : 0.0;
//         const v_stage = cancer_stage || '0'; // VARCHAR(50)
//         const v_meals = (meals_per_day && !isNaN(meals_per_day)) ? parseInt(meals_per_day) : 3;
        
//         // 2. 날짜 처리 (DATE 형식은 반드시 YYYY-MM-DD 형태)
//         const today = new Date().toISOString().split('T')[0];
//         const v_surgery = surgery_date || today;
//         const v_discharge = discharge_date || today;

//         // 3. 상태값 처리 (CHAR(1) - 'Y' 또는 'N')
//         const v_stoma = stoma_status === 'Y' ? 'Y' : 'N';
//         const v_chemo = chemo_status === 'Y' ? 'Y' : 'N';

//         // 4. 알러지 처리 (TEXT NOT NULL이므로 빈 값일 경우 빈 문자열로 처리)
//         const v_allergy = allergy || "";

//         const checkSql = `SELECT user_idx FROM t_health_profile WHERE user_idx = ?`;
//         const [existing] = await conn.query(checkSql, [user_idx]);

//         if (existing.length > 0) {
//             const updateSql = `
//                 UPDATE t_health_profile 
//                 SET HEIGHT=?, WEIGHT=?, CANCER_STAGE=?, SURGERY_DATE=?, 
//                     DISCHARGE_DATE=?, STOMA_STATUS=?, CHEMO_STATUS=?, ALLERGY=?, MEALS_PER_DAY=? 
//                 WHERE USER_IDX=?
//             `;
//             await conn.query(updateSql, [
//                 v_height, v_weight, v_stage, v_surgery, 
//                 v_discharge, v_stoma, v_chemo, v_allergy, v_meals, user_idx
//             ]);
//         } else {
//             const insertSql = `
//                 INSERT INTO t_health_profile (
//                     USER_IDX, HEIGHT, WEIGHT, CANCER_STAGE, SURGERY_DATE, 
//                     DISCHARGE_DATE, STOMA_STATUS, CHEMO_STATUS, ALLERGY, MEALS_PER_DAY
//                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;
//             await conn.query(insertSql, [
//                 user_idx, v_height, v_weight, v_stage, v_surgery, 
//                 v_discharge, v_stoma, v_chemo, v_allergy, v_meals
//             ]);
//         }
//         res.send('1');
//     } catch (err) {
//         // 실제 에러 내용을 로그로 출력하여 원인을 파악합니다.
//         console.error("❌ 데이터베이스 작업 중 오류:", err.sqlMessage || err.message);
//         res.send('0');
//     }
// });
// module.exports = router;