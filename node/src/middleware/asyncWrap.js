/* 라우터의 에러를 공통 에러 핸들러로 자동 전달하는 미들웨어 */

const asyncWrap = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncWrap;