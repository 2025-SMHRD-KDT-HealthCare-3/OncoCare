const express = require('express');
const router = express.Router();

const mainRouter = require('./main/main');
const userRouter = require('./user/user');
const recipeRouter = require('./recipe/recipe');
const authRouter = require('./auth/auth');
const dietRouter = require('./diet/diet');
const reportRouter = require('./reports/reports');
const ingredientRouter = require('./ingredient/ingredient');
const bowelRouter = require('./bowel/bowel');
const conditionRouter = require('./condition/condition');
// const llmRouter = require('./llm/llm');

router.use('/main', mainRouter);
router.use('/user', userRouter);
router.use('/auth', authRouter);
router.use('/recipe', recipeRouter);
router.use('/diet', dietRouter);
router.use('/report', reportRouter);
router.use('/ingredient', ingredientRouter);
router.use('/bowel', bowelRouter);
router.use('/condition', conditionRouter);
// router.use('/ai', llmRouter);

module.exports = router;