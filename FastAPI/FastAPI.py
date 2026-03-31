import os
import json
import httpx
from datetime import datetime

# FastAPI 관련
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, Field

# 스케줄러 관련 (필요시 사용)
from apscheduler.schedulers.background import BackgroundScheduler

# LangChain 관련
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.callbacks.manager import get_openai_callback
# 기존 모듈 임포트 아래에 추가
from vector_search import get_relevant_medical_guides # 외부 파일에서 검색 함수 불러오기

# =========================================================================
# ⚙️ 1. 환경 설정 및 앱 초기화
# =========================================================================
load_dotenv()
app = FastAPI()
scheduler = BackgroundScheduler()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NODE_SERVER_URL = "http://localhost:3000/api"

# 모델 초기화
llm = ChatOpenAI(
    model="gpt-4o-mini", 
    openai_api_key=OPENAI_API_KEY,
    temperature=0.7 # 창의성과 안정성의 밸런스
)

# [추가됨] 서버 누적 토큰/비용 추적기
class GlobalTokenTracker:
    total_tokens: int = 0
    total_cost: float = 0.0

tracker = GlobalTokenTracker()


# =========================================================================
# 🧠 2. LangChain 파이프라인 (스키마 및 프롬프트 체인 설정)
# =========================================================================

# -------------------------------------------------------------------------
# [2-1] 식단 추천 (Diet) - RAG (벡터 검색) 적용 버전
# -------------------------------------------------------------------------
class RecipeRecommendation(BaseModel):
    recipe_name: str = Field(description="레시피 이름 (예: 저염식 연어 양배추 찜)")
    cooking_method: str = Field(description="상세한 조리법 (줄바꿈으로 구분)")
    nutrition_info: str = Field(description="영양 정보 요약 (예: 단백질 25g, 식이섬유 10g)")
    recipe_category: str = Field(description="카테고리 (예: 건강식, 한식, 일품요리)")

diet_parser = JsonOutputParser(pydantic_object=RecipeRecommendation)

# 💡 프롬프트 업데이트: retrieved_documents 변수 추가 및 안전성 강제 지시
diet_prompt = PromptTemplate(
    template="""당신은 대장암/장루 환자를 위한 전문 임상 영양사 셰프입니다.
주어진 환자의 건강 프로필, 보유 식재료, 그리고 검증된 의학/영양 가이드를 활용하여 1끼 맞춤형 레시피를 추천해주세요.

[환자 건강 프로필]
{health_profile}

[보유 중인 식재료]
{ingredients}

[💡 검색된 대장암 영양 가이드 및 검증된 레시피 (전문 서적 발췌)]
{retrieved_documents}

주의사항 (매우 중요):
1. 임의로 요리법을 창작하지 마세요. 반드시 [검색된 대장암 영양 가이드 및 검증된 레시피]의 내용을 최우선으로 반영하여 소화에 무리가 없는 조리법(다지기, 푹 끓이기 등)을 구성하세요.
2. 대장암 기수, 수술/퇴원 일자, 장루 여부 등을 종합적으로 고려하세요.
3. 알레르기(alergy)가 있는 식재료는 절대 사용하면 안 됩니다.
4. 보유 중인 식재료를 최대한 활용하되, 필수적인 기본 양념류는 있다고 가정해도 됩니다.

{format_instructions}""",
    input_variables=["health_profile", "ingredients", "retrieved_documents"],
    partial_variables={"format_instructions": diet_parser.get_format_instructions()},
)
diet_chain = diet_prompt | llm | diet_parser

# -------------------------------------------------------------------------
# [2-2] 일일 레포트 (Daily) - 건강 프로필 주입 완료
# -------------------------------------------------------------------------
class DailyReportOut(BaseModel):
    report_score: int = Field(description="일일 건강 점수 (0~100점)")
    report_diet: str = Field(description="식단 요약 (예: 식이섬유를 잘 챙겨 드셨네요)")
    report_bowel: str = Field(description="배변 요약 (예: 배변 활동이 원활했습니다)")
    report_condition: str = Field(description="컨디션 요약 (예: 수면이 부족해 피로도가 높습니다)")
    report_comment: str = Field(description="종합 AI 코멘트 1줄 (다정하고 격려하는 말투)")

daily_parser = JsonOutputParser(pydantic_object=DailyReportOut)
daily_prompt = PromptTemplate(
    template="""당신은 대장암/장루 환자를 케어하는 다정하고 세심한 AI 건강 비서입니다.
오늘 하루 동안 환자가 기록한 컨디션, 배변, 식단 데이터와 환자의 기본 건강 상태를 분석하여 일일 레포트를 작성해주세요.

[환자 건강 프로필]
{health_profile}

[오늘의 기록]
- 컨디션: {condition}
- 배변 기록: {bowel_logs}
- 섭취 식단: {diets}

주의사항 (매우 중요):
1. 장루/대장암 환자 특성(수술일, 장루 여부 등)을 반영하여, 배변 양상이 일반인과 다를 수 있음을 인지하고 수분 섭취와 식단이 미친 영향을 분석하세요.
2. 절대 의학적 진단이나 직접적인 처방을 내리지 마세요. ("~일 수 있습니다", "~하시는 것을 권장합니다" 형태 사용)
3. 코멘트는 이모지를 적절히 섞어 오늘 하루 수고했다는 따뜻하고 친근한 격려를 1줄로 남겨주세요.

{format_instructions}""",
    input_variables=["health_profile", "condition", "bowel_logs", "diets"],
    partial_variables={"format_instructions": daily_parser.get_format_instructions()},
)
daily_chain = daily_prompt | llm | daily_parser

# -------------------------------------------------------------------------
# [2-3] 주간 레포트 (Weekly) - 건강 프로필 주입 완료
# -------------------------------------------------------------------------
class WeeklyReportOut(BaseModel):
    report_week_label: str = Field(description="UI 표시용 주차 (예: 26년 3월 4주차)")
    report_title: str = Field(description="주간 타이틀 15자 이내 (예: 수면 부족 경고등 🚨)")
    report_score: int = Field(description="주간 평균 점수 (0~100점)")
    report_diet: str = Field(description="식단 요약 및 인사이트 (데이터 간의 상관관계 포함)")
    report_bowel: str = Field(description="배변 요약 및 인사이트 (데이터 간의 상관관계 포함)")
    report_condition: str = Field(description="컨디션 요약 및 인사이트 (데이터 간의 상관관계 포함)")

weekly_parser = JsonOutputParser(pydantic_object=WeeklyReportOut)
weekly_prompt = PromptTemplate(
    template="""당신은 환자의 일주일치 데이터를 분석하여 날카로운 인사이트를 찾아내는 전문 데이터 분석가 겸 건강 코치입니다.
일주일 동안 작성된 '일일 레포트 목록'과 환자의 '건강 프로필'을 바탕으로 주간 레포트를 작성해주세요.

[환자 건강 프로필]
{health_profile}

[이번 주 일일 레포트 목록]
{daily_reports}

[분석 타겟 기간]
{period}

주의사항 (매우 중요):
1. 단순 요약이 아닌 데이터 간의 상관관계를 반드시 발견해서 적어주세요. (예: "단백질 위주 식단을 한 화, 수요일에 피로도가 현저히 낮았습니다.")
2. 환자의 현재 기수나 수술/항암 상태를 인지한 상태에서 무리가 되지 않는 선의 조언을 도출하세요.
3. report_week_label은 [분석 타겟 기간]을 바탕으로 'YY년 M월 W주차' 형식으로 만들어주세요.
4. report_title은 이번 주 전체 상태를 가장 잘 요약하는 센스 있고 흥미로운 제목(이모지 1~2개 포함)을 15자 이내로 달아주세요.

{format_instructions}""",
    input_variables=["health_profile", "daily_reports", "period"],
    partial_variables={"format_instructions": weekly_parser.get_format_instructions()},
)
weekly_chain = weekly_prompt | llm | weekly_parser

# -------------------------------------------------------------------------
# [2-4] 월간 레포트 (Monthly) - 건강 프로필 주입 완료
# -------------------------------------------------------------------------
class MonthlyReportOut(BaseModel):
    report_score: int = Field(description="월간 평균 점수 (0~100점)")
    report_diet: str = Field(description="식단 요약 및 긍정적 변화 (장기적 관점)")
    report_bowel: str = Field(description="배변 요약 및 긍정적 변화 (장기적 관점)")
    report_condition: str = Field(description="컨디션 요약 및 긍정적 변화 (장기적 관점)")
    report_comment: str = Field(description="강력한 동기부여와 폭풍 칭찬 위주의 종합 코멘트 (3~4줄)")

monthly_parser = JsonOutputParser(pydantic_object=MonthlyReportOut)
monthly_prompt = PromptTemplate(
    template="""당신은 환자의 장기적인 회복과 습관 형성을 돕고 멘탈을 케어하는 최고의 웰니스 코치입니다.
한 달 동안의 '주간 레포트 요약본'과 환자의 '기본 건강 상태'를 바탕으로 월간 레포트를 작성해주세요.

[환자 건강 프로필]
{health_profile}

[이번 달 주간 레포트 목록]
{weekly_reports}

주의사항 (매우 중요):
1. 대장암 수술 및 항암/장루 관리라는 힘든 과정을 겪고 있는 환자입니다. 수술/퇴원 일자를 고려해 시간이 지남에 따라 얼마나 잘 회복하고 있는지 의미를 부여하고 크게 칭찬해주세요.
2. 첫째 주와 마지막 주를 비교하여, 배변이나 컨디션 점수가 어떻게 안정화되고 있는지 거시적인 트렌드를 짚어주세요.
3. report_comment는 환자가 질병에 지치지 않고 건강 관리를 할 수 있도록 진심이 담긴 강력한 동기부여와 폭풍 칭찬을 3~4줄로 꽉 채워 작성해주세요.

{format_instructions}""",
    input_variables=["health_profile", "weekly_reports"],
    partial_variables={"format_instructions": monthly_parser.get_format_instructions()},
)
monthly_chain = monthly_prompt | llm | monthly_parser


# =========================================================================
# 🚀 3. API 라우터 (엔드포인트)
# =========================================================================

@app.get("/")
def read_root():
    return {"status": "AI Report Server is running", "total_tokens_used": tracker.total_tokens}

# --- 식단 추천 ---
@app.post("/generate-diet/{user_idx}")
async def generate_diet(user_idx: int, background_tasks: BackgroundTasks):
    async def process_diet_recommendation(uid: int):
        async with httpx.AsyncClient() as client:
            try:
                print(f"\n[식단 추천 시작] User {uid} 데이터 가져오는 중...")
                fetch_res = await client.get(f"{NODE_SERVER_URL}/data/for-diet?user_idx={uid}")
                fetch_data = fetch_res.json()
                
                if not fetch_data.get("success"):
                    return print(f"데이터 조회 실패: {fetch_data}")

                health_profile = fetch_data.get("health_profile", {})
                ingredients = fetch_data.get("ingredients", [])

                if not health_profile:
                    return print(f"User {uid}의 건강 프로필이 없습니다.")

                # 💡 [핵심 추가] 외부 Python 파일의 벡터 DB 검색 로직 실행
                print(f"[벡터 DB 검색 중...] 전문 서적 1.txt, 2.txt에서 가이드 추출 중...")
                retrieved_docs = await get_relevant_medical_guides(health_profile, ingredients)

                print(f"[AI 분석 중...] User {uid} 맞춤형 레시피 생성 중...")
                with get_openai_callback() as cb:
                    # 💡 ainvoke에 retrieved_documents 변수 추가 전달
                    ai_result = await diet_chain.ainvoke({
                        "health_profile": json.dumps(health_profile, ensure_ascii=False),
                        "ingredients": json.dumps(ingredients, ensure_ascii=False),
                        "retrieved_documents": retrieved_docs
                    })
                    
                    tracker.total_tokens += cb.total_tokens
                    tracker.total_cost += cb.total_cost
                    print(f"--- [이번 요청] Token Usage ---\n{cb}")
                    print(f"=== [서버 누적 총합] Total Tokens: {tracker.total_tokens} | Total Cost: ${tracker.total_cost:.4f} ===")

                payload = { "user_idx": uid, **ai_result }
                print(f"[Node.js로 전송 중...] User {uid} 레시피 저장 요청")
                post_res = await client.post(f"{NODE_SERVER_URL}/diet", json=payload)
                print(f"저장 결과: {post_res.json()}")

            except Exception as e:
                print(f"식단 추천 처리 중 에러 발생: {e}")

    background_tasks.add_task(process_diet_recommendation, user_idx)
    return {"success": True, "message": f"User {user_idx}의 RAG 기반 식단 추천 파이프라인이 시작되었습니다."}

# --- 일일 레포트 ---
@app.post("/generate-daily-report/{user_idx}")
async def generate_daily_report(user_idx: int, target_date: str, background_tasks: BackgroundTasks):
    async def process_daily(uid: int, date: str):
        async with httpx.AsyncClient() as client:
            try:
                print(f"\n[일일 레포트] User {uid} 데이터 로드 중 ({date})")
                # 1. 레포트용 데이터 로드
                res = await client.get(f"{NODE_SERVER_URL}/data/for-report?user_idx={uid}&target_date={date}")
                data = res.json()
                if not data.get("success"):
                    return print(f"일일 데이터 조회 실패: {data}")
                
                # 2. 💡 건강 프로필 로드 (추가됨)
                profile_res = await client.get(f"{NODE_SERVER_URL}/data/for-diet?user_idx={uid}")
                health_profile = profile_res.json().get("health_profile", {})
                    
                print(f"[AI 분석 중...] User {uid} 일일 레포트 작성 중")
                with get_openai_callback() as cb:
                    ai_result = await daily_chain.ainvoke({
                        "health_profile": json.dumps(health_profile, ensure_ascii=False),
                        "condition": json.dumps(data.get("condition"), ensure_ascii=False),
                        "bowel_logs": json.dumps(data.get("bowel_logs"), ensure_ascii=False),
                        "diets": json.dumps(data.get("diets"), ensure_ascii=False)
                    })
                    
                    tracker.total_tokens += cb.total_tokens
                    tracker.total_cost += cb.total_cost
                    print(f"--- [이번 요청] Token Usage ---\n{cb}")
                    print(f"=== [서버 누적 총합] Total Tokens: {tracker.total_tokens} | Total Cost: ${tracker.total_cost:.4f} ===")

                payload = { "user_idx": uid, "report_date": date, **ai_result }
                post_res = await client.post(f"{NODE_SERVER_URL}/report/daily", json=payload)
                print(f"[저장 완료] 일일 레포트: {post_res.json()}")

            except Exception as e:
                print(f"일일 레포트 생성 에러: {e}")

    background_tasks.add_task(process_daily, user_idx, target_date)
    return {"success": True, "message": f"User {user_idx}의 {target_date} 일일 레포트 생성이 시작되었습니다."}

# --- 주간 레포트 ---
@app.post("/generate-weekly-report/{user_idx}")
async def generate_weekly_report(user_idx: int, target_date: str, background_tasks: BackgroundTasks):
    async def process_weekly(uid: int, date: str):
        async with httpx.AsyncClient() as client:
            try:
                print(f"\n[주간 레포트] User {uid} 데이터 로드 중 (기준일: {date})")
                # 1. 주간 데이터 로드
                res = await client.get(f"{NODE_SERVER_URL}/data/for-weekly-report?user_idx={uid}&target_date={date}")
                data = res.json()
                if not data.get("success") or not data.get("daily_reports"):
                    return print(f"주간 데이터가 부족하거나 조회에 실패했습니다.")
                
                # 2. 💡 건강 프로필 로드 (추가됨)
                profile_res = await client.get(f"{NODE_SERVER_URL}/data/for-diet?user_idx={uid}")
                health_profile = profile_res.json().get("health_profile", {})
                    
                period_str = data.get("period") 
                start_date, end_date = period_str.split(" ~ ")

                print(f"[AI 분석 중...] User {uid} 주간 레포트 작성 중")
                with get_openai_callback() as cb:
                    ai_result = await weekly_chain.ainvoke({
                        "health_profile": json.dumps(health_profile, ensure_ascii=False),
                        "daily_reports": json.dumps(data.get("daily_reports"), ensure_ascii=False),
                        "period": period_str
                    })
                    
                    tracker.total_tokens += cb.total_tokens
                    tracker.total_cost += cb.total_cost
                    print(f"--- [이번 요청] Token Usage ---\n{cb}")
                    print(f"=== [서버 누적 총합] Total Tokens: {tracker.total_tokens} | Total Cost: ${tracker.total_cost:.4f} ===")

                payload = { "user_idx": uid, "start_date": start_date, "end_date": end_date, **ai_result }
                post_res = await client.post(f"{NODE_SERVER_URL}/report/weekly", json=payload)
                print(f"[저장 완료] 주간 레포트: {post_res.json()}")

            except Exception as e:
                print(f"주간 레포트 생성 에러: {e}")

    background_tasks.add_task(process_weekly, user_idx, target_date)
    return {"success": True, "message": f"User {user_idx}의 주간 레포트 생성이 시작되었습니다."}

# --- 월간 레포트 ---
@app.post("/generate-monthly-report/{user_idx}")
async def generate_monthly_report(user_idx: int, month: int, background_tasks: BackgroundTasks):
    async def process_monthly(uid: int, target_month: int):
        async with httpx.AsyncClient() as client:
            try:
                print(f"\n[월간 레포트] User {uid} 데이터 로드 중 ({target_month}월)")
                # 1. 월간 데이터 로드
                res = await client.get(f"{NODE_SERVER_URL}/data/for-monthly-report?user_idx={uid}&month={target_month}")
                data = res.json()
                if not data.get("success") or not data.get("weekly_reports"):
                    return print(f"월간 데이터가 부족하거나 조회에 실패했습니다.")
                
                # 2. 💡 건강 프로필 로드 (추가됨)
                profile_res = await client.get(f"{NODE_SERVER_URL}/data/for-diet?user_idx={uid}")
                health_profile = profile_res.json().get("health_profile", {})

                current_year = datetime.now().year
                report_month_str = f"{current_year}-{str(target_month).zfill(2)}"

                print(f"[AI 분석 중...] User {uid} 월간 레포트 작성 중")
                with get_openai_callback() as cb:
                    ai_result = await monthly_chain.ainvoke({
                        "health_profile": json.dumps(health_profile, ensure_ascii=False),
                        "weekly_reports": json.dumps(data.get("weekly_reports"), ensure_ascii=False)
                    })
                    
                    tracker.total_tokens += cb.total_tokens
                    tracker.total_cost += cb.total_cost
                    print(f"--- [이번 요청] Token Usage ---\n{cb}")
                    print(f"=== [서버 누적 총합] Total Tokens: {tracker.total_tokens} | Total Cost: ${tracker.total_cost:.4f} ===")

                payload = { "user_idx": uid, "report_month": report_month_str, **ai_result }
                post_res = await client.post(f"{NODE_SERVER_URL}/report/monthly", json=payload)
                print(f"[저장 완료] 월간 레포트: {post_res.json()}")

            except Exception as e:
                print(f"월간 레포트 생성 에러: {e}")

    background_tasks.add_task(process_monthly, user_idx, month)
    return {"success": True, "message": f"User {user_idx}의 {month}월 월간 레포트 생성이 시작되었습니다."}