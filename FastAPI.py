from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Node.js 서버(localhost:3000)에서 오는 요청을 허용하기 위한 CORS 설정
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # GET, POST 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

@app.get("/")
def read_root():
    return {"message": "FastAPI 서버가 정상적으로 실행 중입니다."}

# Node.js에서 데이터를 요청할 테스트용 엔드포인트
@app.get("/api/test")
def test_connection():
    return {
        "status": "success",
        "data": "FastAPI에서 보낸 데이터입니다!"
    }