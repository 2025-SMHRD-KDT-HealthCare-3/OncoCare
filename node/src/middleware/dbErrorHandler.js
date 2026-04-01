/*
 * [DB Error Handler Middleware]
 * 데이터베이스 관련 에러
 */

const dbErrorHandler = (err) => {
    let statusCode = err.status || 500;
    let errorMessage = err.message;

    if (err.code) {
        console.error(`[DB ERROR DETECTED]: ${err.code} (${err.errno})`);
        
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                statusCode = 409;
                errorMessage = "이미 등록된 정보입니다. 다시 확인해 주세요.";
                break;
            case 'ER_BAD_FIELD_ERROR':
                statusCode = 500;
                errorMessage = "데이터베이스 구조 오류가 발생했습니다. 관리자에게 문의하세요.";
                break;
            case 'ECONNREFUSED':
                statusCode = 503;
                errorMessage = "데이터베이스 서버에 접속할 수 없습니다.";
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                statusCode = 400;
                errorMessage = "연결된 상위 데이터가 존재하지 않습니다.";
                break;
            default:
                break;
        }
    }

    return { statusCode, errorMessage };
};

module.exports = dbErrorHandler;