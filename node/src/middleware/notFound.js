// 404 미들웨어

module.exports = (req, res, next) => {
    const err = new Error(`찾을 수 없는 페이지입니다: ${req.originalUrl}`);
    err.status = 404;
    next(err);
};