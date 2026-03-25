import os
import json
import asyncio
import httpx
from datetime import datetime
from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.callbacks.manager import get_openai_callback

app = FastAPI()
scheduler = BackgroundScheduler()

# 환경 변수 및 설정
os.environ["OPENAI_API_KEY"] = "your_openai_api_key_here"
NODE_SERVER_URL = "http://localhost:3000/api/reports" # Node.js 서버 주소

# 모델 초기화
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
parser = JsonOutputParser()

# --- [비동기 분석 로직] ---
async def process_and_send_report(user_idx, report_type, current_data, prev_data=None):
    """
    LangChain으로 분석 후 Node.js API를 호출하여 저장합니다.
    """
    with get_openai_callback() as cb:
        # 1. 프롬프트 템플릿 정의 (이전 대화에서 정한 가이드 반영)
        template = """
        당신은 건강 페이스메이커입니다. 아래 데이터를 분석하여 JSON 형식으로 출력하세요.
        유저ID: {user_idx}
        이번 기간 데이터: {current_data}
        이전 기간 데이터: {prev_data}
        
        [출력 JSON 포맷]
        {{
            "report_score": 0~100점 사이 정수,
            "report_title": "재치있는 타이틀",
            "report_diet": "식단 분석 요약",
            "report_bowel": "배변 분석 요약",
            "report_condition": "컨디션 분석 요약",
            "report_comment": "사용자에게 주는 따뜻한 격려"
        }}
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["user_idx", "current_data", "prev_data"]
        )
        
        # 2. AI 실행 (비동기)
        chain = prompt | llm | parser
        ai_result = await chain.ainvoke({
            "user_idx": user_idx,
            "current_data": current_data,
            "prev_data": prev_data if prev_data else "첫 기록입니다."
        })

        # 3. Node.js 서버로 결과 전송 (Axios 역할)
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{NODE_SERVER_URL}/{report_type}", # /weekly 또는 /monthly
                    json={
                        "user_idx": user_idx,
                        "ai_report": ai_result,
                        "token_usage": cb.total_tokens
                    },
                    timeout=30.0
                )
                print(f"User {user_idx} 리포트 전송 성공: {response.status_code}")
            except Exception as e:
                print(f"Node.js 전송 실패: {e}")

# --- [스케줄러 작업] ---
def run_weekly_batch():
    """스케줄러는 동기 방식으로 동작하므로 내부에서 비동기 루프를 실행합니다."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    # 예시: 실제로는 Node.js에서 분석 대상 유저 리스트를 가져와야 합니다.
    # 여기서는 간단히 로직만 태웁니다.
    print(f"[{datetime.now()}] 주간 리포트 배치 시작...")
    
    # 임시 유저 데이터 (실제로는 API로 받아올 것)
    test_users = [{"idx": 1, "data": "이번주 사과 3개 먹음, 쾌변함"}]
    
    for user in test_users:
        loop.run_until_complete(
            process_and_send_report(user['idx'], "weekly", user['data'])
        )
    loop.close()

# --- [FastAPI 이벤트 설정] ---
@app.on_event("startup")
def startup_event():
    # 매주 월요일 새벽 3시에 실행
    scheduler.add_job(run_weekly_batch, 'cron', day_of_week='mon', hour=3)
    scheduler.start()
    print("스케줄러 시작됨")

@app.get("/")
def read_root():
    return {"status": "AI Report Server is running"}