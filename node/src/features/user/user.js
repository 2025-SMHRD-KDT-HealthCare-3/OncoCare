/*
 * [User & Health Feature]
 * 사용자 정보 수정, 건강 프로필 조회 및 저장
 */

const express = require('express');
const router = express.Router();
const conn = require('../../../config/database');
const bcrypt = require('bcrypt');
const asyncWrap = require('../../middleware/asyncWrap');
const saltRounds = 10;

/*
 * [회원정보 수정 (비밀번호 변경 포함)]
 */
router.post('/update', asyncWrap(async (req, res) => {
    const { user_idx, name, password, confirmPassword, phone } = req.body;

    if (!user_idx) {
        const error = new Error("사용자 식별 정보가 누락되었습니다.");
        error.status = 400;
        throw error;
    }

    if (password && password !== confirmPassword) {
        const error = new Error("비밀번호가 일치하지 않습니다.");
        error.status = 400;
        throw error;
    }

    const queryParts = ["name = ?", "phone = ?"];
    const params = [name, phone];

    if (password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        queryParts.push("pw = ?");
        params.push(hashedPassword);
    }

    const sql = `UPDATE t_user SET ${queryParts.join(', ')} WHERE user_idx = ?`;
    params.push(user_idx);

    // 5. DB 실행
    await conn.query(sql, params);
    res.send('1'); 
}));

/*
 * [건강정보 조회]
 */
router.get('/health', asyncWrap(async (req, res) => {
    const { user_idx } = req.query;

    if (!user_idx) {
        const error = new Error("조회할 사용자 번호가 없습니다.");
        error.status = 400;
        throw error;
    }

    const sql = `SELECT * FROM t_health_profile WHERE user_idx = ?`;
    const [results] = await conn.query(sql, [user_idx]);

    res.json(results.length > 0 ? results[0] : '0');
}));

/**
 * 
 * 
 */
const toNum = (val, def, isInt = false) => {
    const n = isInt ? parseInt(val) : parseFloat(val);
    return (val !== undefined && val !== null && val !== '' && !isNaN(n)) ? n : def;
};

const toYN = (val) => (val === 'Y' ? 'Y' : 'N');

const toDate = (val) => val || new Date().toISOString().split('T')[0];

/*
 * [건강정보 저장/수정]
 */
router.post('/health/register', asyncWrap(async (req, res) => {
    const { 
        user_idx, height, weight, cancer_stage, surgery_date, 
        discharge_date, stoma_status, chemo_status, allergy, meals_per_day 
    } = req.body;

    if (!user_idx) {
        const error = new Error("사용자 식별 정보는 필수입니다.");
        error.status = 400;
        throw error;
    }

    const profile = {
        height: toNum(height, 0.0),
        weight: toNum(weight, 0.0),
        stage: cancer_stage || '0',
        meals: toNum(meals_per_day, 3, true),
        surgery: toDate(surgery_date),
        discharge: toDate(discharge_date),
        stoma: toYN(stoma_status),
        chemo: toYN(chemo_status),
        allergy: allergy || ""
    };

    const checkSql = `SELECT user_idx FROM t_health_profile WHERE user_idx = ?`;
    const [existing] = await conn.query(checkSql, [user_idx]);

    const commonParams = [
        profile.height, profile.weight, profile.stage, profile.surgery, 
        profile.discharge, profile.stoma, profile.chemo, profile.allergy, profile.meals
    ];

    if (existing.length > 0) {
        const updateSql = `
            UPDATE t_health_profile 
            SET HEIGHT=?, WEIGHT=?, CANCER_STAGE=?, SURGERY_DATE=?, 
                DISCHARGE_DATE=?, STOMA_STATUS=?, CHEMO_STATUS=?, ALLERGY=?, MEALS_PER_DAY=? 
            WHERE USER_IDX=?
        `;
        await conn.query(updateSql, [...commonParams, user_idx]);
    } else {
        const insertSql = `
            INSERT INTO t_health_profile (
                HEIGHT, WEIGHT, CANCER_STAGE, SURGERY_DATE, 
                DISCHARGE_DATE, STOMA_STATUS, CHEMO_STATUS, ALLERGY, MEALS_PER_DAY, USER_IDX
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await conn.query(insertSql, [...commonParams, user_idx]);
    }

    res.send('1');
}));

module.exports = router;