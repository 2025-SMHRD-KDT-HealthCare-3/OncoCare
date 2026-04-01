/**
 * [User & Health Feature]
 * 사용자 정보 수정(비밀번호 포함), 건강 프로필 조회 및 저장
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * [회원정보 수정 (비밀번호 변경 포함)]
 *
 */
router.post('/update', async (req, res, next) => {
    try {
        const { user_idx, name, password, confirmPassword, phone } = req.body;

        if (password && password !== confirmPassword) {
            const error = new Error("비밀번호가 일치하지 않습니다.");
            error.status = 400;
            throw error;
        }

        let sql = `UPDATE t_user SET name = ?, phone = ?`;
        let params = [name, phone];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            sql += `, pw = ?`;
            params.push(hashedPassword);
        }

        sql += ` WHERE user_idx = ?`;
        params.push(user_idx);

        await conn.query(sql, params);
        res.send('1'); 
    } catch (err) {
        next(err);
    }
});

/**
 * [건강정보 조회]
 * 
 */
router.get('/health', async (req, res, next) => {
    try {
        const { user_idx } = req.query;
        const sql = `SELECT * FROM t_health_profile WHERE user_idx = ?`;
        const [results] = await conn.query(sql, [user_idx]);

        res.json(results.length > 0 ? results[0] : '0');
    } catch (err) {
        next(err);
    }
});

/**
 * [건강정보 저장/수정]
 * 
 */
router.post('/health/register', async (req, res, next) => {
    try {
        const { 
            user_idx, height, weight, cancer_stage, surgery_date, 
            discharge_date, stoma_status, chemo_status, allergy, meals_per_day 
        } = req.body;

        const v_height = (height && !isNaN(height)) ? parseFloat(height) : 0.0;
        const v_weight = (weight && !isNaN(weight)) ? parseFloat(weight) : 0.0;
        const v_stage = cancer_stage || '0';
        const v_meals = (meals_per_day && !isNaN(meals_per_day)) ? parseInt(meals_per_day) : 3;
        
        const today = new Date().toISOString().split('T')[0];
        const v_surgery = surgery_date || today;
        const v_discharge = discharge_date || today;

        const v_stoma = stoma_status === 'Y' ? 'Y' : 'N';
        const v_chemo = chemo_status === 'Y' ? 'Y' : 'N';
        const v_allergy = allergy || "";

        const checkSql = `SELECT user_idx FROM t_health_profile WHERE user_idx = ?`;
        const [existing] = await conn.query(checkSql, [user_idx]);

        if (existing.length > 0) {

            const updateSql = `
                UPDATE t_health_profile 
                SET HEIGHT=?, WEIGHT=?, CANCER_STAGE=?, SURGERY_DATE=?, 
                    DISCHARGE_DATE=?, STOMA_STATUS=?, CHEMO_STATUS=?, ALLERGY=?, MEALS_PER_DAY=? 
                WHERE USER_IDX=?
            `;
            await conn.query(updateSql, [
                v_height, v_weight, v_stage, v_surgery, 
                v_discharge, v_stoma, v_chemo, v_allergy, v_meals, user_idx
            ]);
        } else {

            const insertSql = `
                INSERT INTO t_health_profile (
                    USER_IDX, HEIGHT, WEIGHT, CANCER_STAGE, SURGERY_DATE, 
                    DISCHARGE_DATE, STOMA_STATUS, CHEMO_STATUS, ALLERGY, MEALS_PER_DAY
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await conn.query(insertSql, [
                user_idx, v_height, v_weight, v_stage, v_surgery, 
                v_discharge, v_stoma, v_chemo, v_allergy, v_meals
            ]);
        }
        res.send('1');
    } catch (err) {
        next(err);
    }
});

module.exports = router;