import os
import json
import httpx
import cv2
import numpy as np
from datetime import datetime

# FastAPI 관련
from fastapi import FastAPI, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

# LangChain 및 AI 모델 관련
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.callbacks.manager import get_openai_callback
from ultralytics import YOLO
# 기존 모듈 임포트 아래에 추가
from vector_search import get_relevant_medical_guides # 외부 파일에서 검색 함수 불러오기

# =========================================================================
# ⚙️ 1. 환경 설정 및 앱 초기화
# =========================================================================
load_dotenv()
app = FastAPI()

# 💡 CORS 미들웨어 설정 추가 (프론트엔드에서 API 호출 시 발생하는 차단 에러 방지)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NODE_SERVER_URL = os.getenv("NODE_SERVER_URL", "http://localhost:3000/ai")

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
    main_ingredients: str = Field(description="레시피 재료 (예: 불린 쌀 30g, 흑임자 20g, 연두부 60g, 물 300ml, 우유(또는 영양보충음료) 100ml, 소금 1g)")
    cooking_method: str = Field(description="상세한 조리법 (예: 1. 감자를 얇게 썬다.\n2. 육수에 넣는다.\n3. 푹 익을 때까지 끓인다.)")
    nutrition_info: str = Field(description="영양 정보 요약 (예: 열량: 265 kcal, 탄수화물: 23g, 단백질: 12g, 지방: 15g, 섬유소: 1g). 만약 검색된 가이드에 정확한 영양 정보가 없다면, 일반적인 식재료 데이터를 바탕으로 추정하여 빠짐없이 작성해주세요.")
    recipe_category: str = Field(description="카테고리 (반드시 '죽/스프', '밥류', '국/탕류', '반찬류', '면류', '단백질요리', '샐러드', '과일', '간식', '음료' 중 하나만 출력할 것. 성격이 딱 맞지 않아도 가장 비슷한 카테고리로 억지로라도 매칭하세요.)")

# 💡 7개의 레시피를 리스트(배열) 형태로 받기 위한 상위 모델 추가
class RecipeList(BaseModel):
    missing_ingredients: str = Field(description="추천 레시피를 위해 추가로 구매해야 할 부족한 식재료 안내 메시지 (부족한 식재료가 없다면 '없음'이라고 적지 말고 반드시 빈 문자열('') 사용)")
    recipes: List[RecipeRecommendation] = Field(description="추천 레시피 7개 목록")

diet_parser = JsonOutputParser(pydantic_object=RecipeList)

# 💡 프롬프트 업데이트: retrieved_documents 변수 추가 및 안전성 강제 지시
diet_prompt = PromptTemplate(
    template="""당신은 대장암/장루 환자를 위한 전문 임상 영양사 셰프입니다.
주어진 환자의 건강 프로필, 주요 식재료, 그리고 검증된 의학/영양 가이드를 활용해서 총 7끼(7개)의 맞춤형 레시피를 추천해주세요.

[환자 건강 프로필]
{health_profile}

[보유 중인 식재료]
{ingredients}

[어제 환자 상태 및 식단 피드백]
{yesterday_record}

[💡 검색된 대장암 영양 가이드 및 검증된 레시피 (전문 서적 발췌)]
{retrieved_documents}

주의사항 (매우 중요):
1. [어제 환자 상태 및 식단 피드백]을 분석하세요. 어제 복통(stomach_pain)이 있었거나 컨디션이 나빴다면, 임의로 판단하지 말고 반드시 [검색된 대장암 영양 가이드 및 검증된 레시피]의 지침을 참고하여 해당 증상에 맞는 안전한 식재료와 조리법으로 대처하세요. 어제 식단 평점(rating)이 낮았다면 비슷한 조리법은 피하세요.
2. 임의로 요리법을 창작하지 마세요. 모든 식단 구성은 반드시 [검색된 대장암 영양 가이드 및 검증된 레시피]의 내용을 최우선으로 반영해야 합니다.
3. 대장암 기수, 수술/퇴원 일자, 장루 여부 등을 종합적으로 고려하세요.
4. 알레르기(allergy)가 있는 식재료는 절대 사용하면 안 됩니다.
5. 보유 중인 식재료를 최대한 활용하되, 필수적인 기본 양념류는 있다고 가정해도 됩니다.
6. 추천한 7개의 레시피를 만들기 위해 필요한 식재료 중, [보유 중인 식재료]에 없는 항목들을 파악하여 missing_ingredients에 알려주세요. (예: "레시피를 위해 닭가슴살, 브로콜리가 추가로 필요해요!") 만약 부족한 식재료가 전혀 없다면 "없음" 등의 단어를 절대 쓰지 말고 반드시 빈 문자열("")로만 작성해주세요.
7. 반드시 정확히 7개의 레시피를 작성하되, 환자가 식사에 흥미를 잃지 않도록 죽/스프, 국/탕, 반찬, 간식 등 다양한 카테고리가 골고루 포함되도록 구성하세요.

{format_instructions}""",
    input_variables=["health_profile", "ingredients", "yesterday_record", "retrieved_documents"],
    partial_variables={"format_instructions": diet_parser.get_format_instructions()},
)
diet_chain = diet_prompt | llm | diet_parser

# -------------------------------------------------------------------------
# [2-2] 일일 레포트 (Daily) - 건강 프로필 주입 완료
# -------------------------------------------------------------------------
class DailyReportOut(BaseModel):
    report_score: int = Field(description="오늘의 종합 건강 점수 (0~100점). 제공된 '섭취 식단', '배변 기록', '컨디션' 3가지 데이터를 종합적으로 평가하여 점수를 산정하세요.")
    report_diet: str = Field(description="오늘 섭취한 식단에 대한 요약 및 평가 (1~2문장). 빈 배열([])이 넘어왔다면 '오늘 등록된 식단 기록이 없습니다.'라고 작성하세요.")
    report_bowel: str = Field(description="오늘의 배변 기록에 대한 요약 및 평가 (1~2문장). 빈 배열([])이 넘어왔다면 '오늘 등록된 배변 기록이 없습니다.'라고 작성하세요.")
    report_condition: str = Field(description="오늘의 컨디션(수면, 통증 등)에 대한 요약 및 평가 (1~2문장). null값이 넘어왔다면 '오늘 등록된 컨디션 기록이 없습니다.'라고 작성하세요.")
    report_comment: str = Field(description="오늘 하루를 마무리하는 종합 AI 코멘트 (이모지 포함, 다정하고 격려하는 말투로 1줄)")

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
3. 기록이 비어있는(null 또는 []) 항목이 있다면 절대 지어내지 말고 정확히 "오늘 등록된 기록이 없습니다."라고 안내하세요.
4. 오늘의 종합 건강 점수(report_score)는 식단, 배변, 컨디션 3가지 데이터를 종합하여 0~100점으로 산정하세요. 긍정적인 기록(예: 높은 식단 평점, 정상 배변, 통증 없음)은 점수를 높이고, 부정적인 기록(예: 낮은 식단 평점, 복통 발생, 설사)은 점수를 낮추세요. 단, 사용자가 기록을 누락한 항목(null 또는 빈 배열)은 점수 계산에서 제외하여, 기록된 데이터만으로 객관적인 점수를 매겨야 합니다.
5. 식단을 평가할 때는 섭취한 요리뿐만 아니라, 환자가 직접 남긴 특이식 피드백(diet_feedback)과 평점(diet_rating)을 적극적으로 반영하여 공감해주세요.
6. 코멘트는 이모지를 적절히 섞어 오늘 하루 수고했다는 따뜻하고 친근한 격려를 1줄로 남겨주세요.

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
    report_score: int = Field(description="주간 평균 점수 (0~100점). 제공된 '일일 레포트'들의 점수를 평균 내어 산정하세요.")
    report_score_list : str = Field(description="일일 점수 리스트 (예: '80, 85, 90, 70, 88, 92, 100' 처럼 콤마로 구분된 문자열로 작성)")
    report_score_list_comment: str = Field(description="일일 점수 리스트의 추이에 대한 한줄 요약")
    report_diet: str = Field(description="식단 요약 및 인사이트 (데이터 간의 상관관계 포함)")
    report_bowel: str = Field(description="배변 요약 및 인사이트 (데이터 간의 상관관계 포함)")
    report_condition: str = Field(description="컨디션 요약 및 인사이트 (데이터 간의 상관관계 포함)")
    report_comment: str = Field(description="강력한 동기부여와 폭풍 칭찬 위주의 종합 코멘트 (3~4줄)")

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
1. 주간 점수(report_score)는 임의로 지어내지 말고, 넘겨받은 [이번 주 일일 레포트 목록]에 있는 각 날짜의 점수들을 수학적으로 평균 내어 산정하세요. 만약 목록이 아예 비어있다면 0점으로 처리하세요.
2. 일주일 중 기록이 없는 날짜가 있다면 상상하지 말고, 기록된 날짜들의 데이터만으로 분석하되 종합 코멘트에 "기록이 빠진 날이 있어 아쉽다"는 격려를 추가하세요. 만약 이번 주에 등록된 일일 레포트가 단 하나도 없다면, 모든 분석 내용을 지어내지 말고 "이번 주 등록된 일일 레포트가 없습니다."라고 안내하세요.
3. 점수가 가장 높았던 날과 낮았던 날의 요인을 식단, 배변, 컨디션 간의 상관관계로 분석하여 깊이 있는 인사이트를 도출하세요. (예: "수분 섭취가 적었던 목요일에 배변 점수가 낮아졌습니다.")
4. 환자의 현재 기수나 수술/항암 상태를 인지한 상태에서 무리가 되지 않는 선의 조언을 도출하세요.
5. report_week_label은 [분석 타겟 기간]을 바탕으로 'YY년 M월 W주차' 형식으로 만들어주세요.
6. report_title은 이번 주 전체 상태를 가장 잘 요약하는 센스 있고 흥미로운 제목(이모지 1~2개 포함)을 15자 이내로 달아주세요.

{format_instructions}""",
    input_variables=["health_profile", "daily_reports", "period"],
    partial_variables={"format_instructions": weekly_parser.get_format_instructions()},
)
weekly_chain = weekly_prompt | llm | weekly_parser

# -------------------------------------------------------------------------
# [2-4] 월간 레포트 (Monthly) - 건강 프로필 주입 완료
# -------------------------------------------------------------------------
class MonthlyReportOut(BaseModel):
    report_week_label: str = Field(description="UI 표시용 월 라벨 (예: 26년 3월)")
    report_title: str = Field(description="월간 타이틀 15자 이내 (예: 한 달간의 놀라운 기적 🎉)")
    report_score: int = Field(description="월간 평균 점수 (0~100점). 제공된 '주간 레포트'들의 점수를 평균 내어 산정하세요.")
    report_score_list : str = Field(description="주간 점수 리스트 (예: '80, 85, 90, 95' 처럼 각 주차의 점수를 콤마로 구분하여 문자열로 작성)")
    report_score_list_comment: str = Field(description="주간 점수 리스트의 추이에 대한 한줄 요약")
    report_diet: str = Field(description="식단 요약 및 긍정적 변화 (장기적 관점)")
    report_bowel: str = Field(description="배변 요약 및 긍정적 변화 (장기적 관점)")
    report_condition: str = Field(description="컨디션 요약 및 긍정적 변화 (장기적 관점)")
    report_comment: str = Field(description="강력한 동기부여와 폭풍 칭찬 위주의 종합 코멘트 (3~4줄)")

monthly_parser = JsonOutputParser(pydantic_object=MonthlyReportOut)
monthly_prompt = PromptTemplate(
    template="""당신은 환자의 장기적인 회복과 습관 형성을 돕고 멘탈을 케어하는 최고의 웰니스 코치입니다.
한 달 동안의 '주간 레포트 요약본'과 환자의 '기본 건강 상태'를 바탕으로 월간 레포트를 작성해주세요.

[분석 타겟 연월]
{target_month}

[환자 건강 프로필]
{health_profile}

[이번 달 주간 레포트 목록]
{weekly_reports}

주의사항 (매우 중요):
1. 월간 점수(report_score)는 임의로 지어내지 말고, 넘겨받은 [이번 달 주간 레포트 목록]에 있는 주차별 점수들을 수학적으로 평균 내어 산정하세요. 만약 목록이 아예 비어있다면 0점으로 처리하세요.
2. 한 달 중 기록이 없는 주차가 있다면 상상하지 말고, 기록된 주차의 데이터만으로 분석하세요. 만약 이번 달에 등록된 주간 레포트가 단 하나도 없다면, 모든 분석 내용을 지어내지 말고 "이번 달 등록된 주간 레포트가 없습니다."라고 안내하세요.
3. 대장암 수술 및 항암/장루 관리라는 힘든 과정을 겪고 있는 환자입니다. 수술/퇴원 일자를 고려해 시간이 지남에 따라 얼마나 잘 회복하고 있는지 의미를 부여하고 크게 칭찬해주세요.
4. 첫째 주와 마지막 주를 비교하여, 배변이나 컨디션 점수가 어떻게 안정화되고 있는지 거시적인 트렌드를 짚어주세요.
5. report_comment는 환자가 질병에 지치지 않고 건강 관리를 할 수 있도록 진심이 담긴 강력한 동기부여와 폭풍 칭찬을 3~4줄로 꽉 채워 작성해주세요.
6. report_week_label은 'YY년 M월' 형식으로 만들어주세요.
7. report_title은 한 달간의 변화를 가장 잘 보여주는 센스 있는 제목(이모지 1~2개 포함)을 15자 이내로 달아주세요.

{format_instructions}""",
    input_variables=["health_profile", "weekly_reports", "target_month"],
    partial_variables={"format_instructions": monthly_parser.get_format_instructions()},
)
monthly_chain = monthly_prompt | llm | monthly_parser

# -------------------------------------------------------------------------
# [2-5] 식재료 이미지 분석 (YOLO Vision)
# -------------------------------------------------------------------------
# YOLO 모델 로드 (서버 시작 시 메모리에 1번만 로드)
# 💡 직접 학습시킨 식재료 탐지 모델이 있다면 'yolov8n.pt' 대신 'best.pt' 등으로 경로를 수정하세요.
try:
    yolo_model = YOLO("best11.pt")
except Exception as e:
    print(f"YOLO 모델 로드 실패: {e}")
    yolo_model = None

# YOLO 영문 클래스명을 한글 DB 스키마에 맞게 매핑하는 사전 (원하시는 대로 커스텀하세요)
CLASS_MAPPING = {
    # 🍎 과일 / 견과
    "apple": {"name": "사과", "type": "과일", "storage": "냉장"},
    "strawberry": {"name": "딸기", "type": "과일", "storage": "냉장"},
    "banana": {"name": "바나나", "type": "과일", "storage": "실온"},
    "pear_raw": {"name": "배", "type": "과일", "storage": "냉장"},
    "tomato": {"name": "토마토", "type": "채소", "storage": "냉장"},
    "almond": {"name": "아몬드", "type": "기타", "storage": "실온"},
    "walnut": {"name": "호두", "type": "기타", "storage": "실온"},
    "peanut_raw": {"name": "땅콩", "type": "기타", "storage": "실온"},
    
    # 🥬 채소
    "eggplant": {"name": "가지", "type": "채소", "storage": "냉장"},
    "garlic": {"name": "마늘", "type": "채소", "storage": "실온"},
    "garlic chives": {"name": "부추", "type": "채소", "storage": "냉장"},
    "napa cabbage": {"name": "배추", "type": "채소", "storage": "냉장"},
    "oyster mushroom": {"name": "느타리버섯", "type": "채소", "storage": "냉장"},
    "perilla leaves": {"name": "깻잎", "type": "채소", "storage": "냉장"},
    "shiitake mushroom": {"name": "표고버섯", "type": "채소", "storage": "냉장"},
    "green_chili_pepper": {"name": "청양고추", "type": "채소", "storage": "냉장"},
    "red_cabbage": {"name": "적양배추", "type": "채소", "storage": "냉장"},
    "red_chili_pepper": {"name": "홍고추", "type": "채소", "storage": "냉장"},
    "bell pepper": {"name": "파프리카", "type": "채소", "storage": "냉장"},
    "carrot": {"name": "당근", "type": "채소", "storage": "냉장"},
    "green onion": {"name": "대파", "type": "채소", "storage": "냉장"},
    "kabocha_squash": {"name": "단호박", "type": "채소", "storage": "실온"},
    "bokchoy": {"name": "청경채", "type": "채소", "storage": "냉장"},
    "broccoli": {"name": "브로콜리", "type": "채소", "storage": "냉장"},
    "chicory": {"name": "치커리", "type": "채소", "storage": "냉장"},
    "daikon_radish": {"name": "무", "type": "채소", "storage": "냉장"},
    "deodeokroot": {"name": "더덕", "type": "채소", "storage": "냉장"},
    "ginger_raw": {"name": "생강", "type": "채소", "storage": "냉장"},
    "mallow_leaves_raw": {"name": "아욱", "type": "채소", "storage": "냉장"},
    "mung_bean_sprouts_raw": {"name": "숙주나물", "type": "채소", "storage": "냉장"},
    "spinach": {"name": "시금치", "type": "채소", "storage": "냉장"},
    "tofdeodeok_root": {"name": "더덕", "type": "채소", "storage": "냉장"},
    
    # 🥩 육류 / 해산물
    "beef": {"name": "소고기", "type": "육류", "storage": "냉동"},
    "chicken": {"name": "닭고기", "type": "육류", "storage": "냉동"},
    "pork": {"name": "돼지고기", "type": "육류", "storage": "냉동"},
    "abalone": {"name": "전복", "type": "해산물", "storage": "냉동"},
    "crab_meat": {"name": "게맛살", "type": "해산물", "storage": "냉장"},
    "cutlassfish": {"name": "갈치", "type": "해산물", "storage": "냉동"},
    "fish": {"name": "생선", "type": "해산물", "storage": "냉동"},
    "pollack roe": {"name": "명란젓", "type": "해산물", "storage": "냉장"},
    "shellfish": {"name": "조개", "type": "해산물", "storage": "냉장"},
    "shrimp": {"name": "새우", "type": "해산물", "storage": "냉동"},
    
    # 🥛 유제품 / 곡류 / 기타
    "butter": {"name": "버터", "type": "유제품", "storage": "냉장"},
    "cheese": {"name": "치즈", "type": "유제품", "storage": "냉장"},
    "milk": {"name": "우유", "type": "유제품", "storage": "냉장"},
    "egg": {"name": "계란", "type": "기타", "storage": "냉장"},
    "mung bean": {"name": "녹두", "type": "곡류", "storage": "실온"},
    "black_bean": {"name": "검은콩", "type": "곡류", "storage": "실온"},
    "sesame seeds": {"name": "참깨", "type": "양념/소스", "storage": "실온"},
    "tofu_raw": {"name": "두부", "type": "기타", "storage": "냉장"},
    
    "default": {"name": "미분류 식재료", "type": "기타", "storage": "냉장"}
}

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

                # Node.js에서 넘어온 어제 기록 조합
                y_cond = fetch_data.get("yesterday_condition", {})
                y_diet = fetch_data.get("yesterday_diet", [])
                yesterday_record_str = f"- 어제 컨디션: {y_cond}\n- 어제 식단 피드백(평점 및 코멘트): {y_diet}"

                # 💡 [핵심 추가] 외부 Python 파일의 벡터 DB 검색 로직 실행
                print(f"[벡터 DB 검색 중...] 전문 서적 1.txt, 2.txt에서 가이드 추출 중...")
                retrieved_docs = await get_relevant_medical_guides(health_profile, ingredients)

                # 💡 [안정성 강화] 벡터 DB 검색 실패 시(파일 부재 등) LLM 호출 중단
                if "검색에 실패했습니다" in retrieved_docs or "참고 의학 가이드 서적이 없습니다" in retrieved_docs:
                    print(f"⚠️ 벡터 DB 검색 실패 또는 DB 부재로 식단 추천을 취소합니다: {retrieved_docs}")
                    return

                print(f"[AI 분석 중...] User {uid} 맞춤형 레시피 생성 중...")
                with get_openai_callback() as cb:
                    # 💡 ainvoke에 retrieved_documents 변수 추가 전달
                    ai_result = await diet_chain.ainvoke({
                        "health_profile": json.dumps(health_profile, ensure_ascii=False),
                        "ingredients": json.dumps(ingredients, ensure_ascii=False),
                        "yesterday_record": yesterday_record_str,
                        "retrieved_documents": retrieved_docs
                    })
                    
                    tracker.total_tokens += cb.total_tokens
                    tracker.total_cost += cb.total_cost
                    print(f"--- [이번 요청] Token Usage ---\n{cb}")
                    print(f"=== [서버 누적 총합] Total Tokens: {tracker.total_tokens} | Total Cost: ${tracker.total_cost:.4f} ===")

                # 💡 이제 ai_result는 여러 개의 레시피를 포함하는 {"recipes": [...]} 형태가 됩니다.
                payload = { 
                    "user_idx": uid, 
                    "recipes": ai_result.get("recipes", []),
                    "missing_ingredients": ai_result.get("missing_ingredients", "") 
                }
                print(f"[Node.js로 전송 중...] User {uid} 레시피 저장 요청")
                post_res = await client.post(f"{NODE_SERVER_URL}/diet", json=payload)
                print(f"저장 결과: {post_res.json()}")

            except httpx.ConnectError as e:
                print(f"Node.js 서버({NODE_SERVER_URL}) 연결에 실패했습니다: {e}")
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
                res.raise_for_status() # 💡 200 OK가 아니면 에러 발생
                data = res.json()

                if not data.get("success"):
                    return print(f"일일 데이터 조회 실패: {data}")

                condition = data.get("condition")
                bowel_logs = data.get("bowel_logs")
                diets = data.get("diets")
                
                # 💡 [비용 절감 최적화] 당일 기록이 아예 없다면 LLM 호출 및 DB 저장을 생략하고 즉시 종료
                if not condition and (not bowel_logs or len(bowel_logs) == 0) and (not diets or len(diets) == 0):
                    print(f"[{date}] User {uid}의 기록이 전혀 없어 레포트 생성을 취소합니다. (API 비용 및 DB 낭비 방지)")
                    return
                
                # 2. 💡 건강 프로필 로드 (추가됨)
                profile_res = await client.get(f"{NODE_SERVER_URL}/data/for-diet?user_idx={uid}")
                profile_res.raise_for_status()
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

            except httpx.HTTPStatusError as e:
                print(f"Node.js 데이터 조회 실패 (상태 코드: {e.response.status_code}): {e.response.text}")
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
                res.raise_for_status()
                data = res.json()
                if not data.get("success") or not data.get("daily_reports"):
                    return print(f"주간 데이터가 부족하거나 조회에 실패했습니다.")
                
                # 2. 💡 건강 프로필 로드 (추가됨)
                profile_res = await client.get(f"{NODE_SERVER_URL}/data/for-diet?user_idx={uid}")
                profile_res.raise_for_status()
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

            except httpx.HTTPStatusError as e:
                print(f"Node.js 데이터 조회 실패 (상태 코드: {e.response.status_code}): {e.response.text}")
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
                res.raise_for_status()
                data = res.json()
                if not data.get("success") or not data.get("weekly_reports"):
                    return print(f"월간 데이터가 부족하거나 조회에 실패했습니다.")
                
                # 2. 💡 건강 프로필 로드 (추가됨)
                profile_res = await client.get(f"{NODE_SERVER_URL}/data/for-diet?user_idx={uid}")
                profile_res.raise_for_status()
                health_profile = profile_res.json().get("health_profile", {})

                current_year = datetime.now().year
                report_month_str = f"{current_year}-{str(target_month).zfill(2)}"

                print(f"[AI 분석 중...] User {uid} 월간 레포트 작성 중")
                with get_openai_callback() as cb:
                    ai_result = await monthly_chain.ainvoke({
                        "health_profile": json.dumps(health_profile, ensure_ascii=False),
                        "weekly_reports": json.dumps(data.get("weekly_reports"), ensure_ascii=False),
                        "target_month": data.get("target_year_month", f"{target_month}월")
                    })
                    
                    tracker.total_tokens += cb.total_tokens
                    tracker.total_cost += cb.total_cost
                    print(f"--- [이번 요청] Token Usage ---\n{cb}")
                    print(f"=== [서버 누적 총합] Total Tokens: {tracker.total_tokens} | Total Cost: ${tracker.total_cost:.4f} ===")

                payload = { "user_idx": uid, "report_month": report_month_str, **ai_result }
                post_res = await client.post(f"{NODE_SERVER_URL}/report/monthly", json=payload)
                print(f"[저장 완료] 월간 레포트: {post_res.json()}")

            except httpx.HTTPStatusError as e:
                print(f"Node.js 데이터 조회 실패 (상태 코드: {e.response.status_code}): {e.response.text}")
            except Exception as e:
                print(f"월간 레포트 생성 에러: {e}")

    background_tasks.add_task(process_monthly, user_idx, month)
    return {"success": True, "message": f"User {user_idx}의 {month}월 월간 레포트 생성이 시작되었습니다."}

# --- 식재료 사진 분석 (YOLO) ---
@app.post("/analyze-fridge-image/{user_idx}")
async def analyze_fridge_image(user_idx: int, file: UploadFile = File(...)):
    try:
        print(f"\n[식재료 이미지 분석] User {user_idx} 이미지 1장 수신 완료: {file.filename}")
        
        if yolo_model is None:
            return {"success": False, "message": "YOLO 모델이 로드되지 않아 분석할 수 없습니다."}

        image_bytes = await file.read()
        # 바이트 배열을 numpy 배열로 변환 후 OpenCV 이미지로 디코딩
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"success": False, "message": "이미지 디코딩에 실패했습니다."}

        print(f"[AI 분석 중...] YOLO 모델로 식재료 탐지 중...")
        # YOLO 추론 (conf=0.25는 25% 이상 확신하는 객체만 감지한다는 뜻입니다)
        results = yolo_model(img, conf=0.25)
        
        # 탐지된 객체 카운팅 (딕셔너리에 누적)
        detected_counts = {}
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                class_name = yolo_model.names[cls_id]
                detected_counts[class_name] = detected_counts.get(class_name, 0) + 1
                
        # React로 반환할 심플한 데이터 조립 (이름과 개수만)
        react_ingredients = []
        for name, count in detected_counts.items():
            name_lower = name.lower()
            
            mapping_info = CLASS_MAPPING.get(name_lower, CLASS_MAPPING["default"])
            korean_name = mapping_info["name"] if mapping_info["name"] != "미분류 식재료" else name
            
            react_ingredients.append({
                "name": korean_name,
                "count": count
            })
            
        print(f"[최종 추출 완료] 감지된 식재료 목록: {react_ingredients}")
        
        # 💡 [사용자 검수] DB에 바로 저장하지 않고, React 프론트엔드로 분석 결과만 반환합니다.
        return {
            "success": True, 
            "message": f"{len(react_ingredients)}종류의 식재료가 감지되었습니다.", 
            "ingredients": react_ingredients
        }

    except Exception as e:
        print(f"식재료 이미지 분석 중 에러 발생: {e}")
        return {"success": False, "message": "이미지 분석 중 오류가 발생했습니다."}

# --- 사용자 검수 후 식재료 최종 저장 ---
class ValidatedIngredient(BaseModel):
    name: str
    count: int

class SaveIngredientsRequest(BaseModel):
    ingredients: List[ValidatedIngredient]

@app.post("/save-ingredients/{user_idx}")
async def save_ingredients(user_idx: int, request: SaveIngredientsRequest):
    try:
        # 1. 카운트가 0보다 큰 식재료만 필터링 (0이면 제외)
        valid_ingredients = [item for item in request.ingredients if item.count > 0]
        
        if not valid_ingredients:
            return {"success": True, "message": "저장할 식재료가 없습니다 (모두 개수가 0개입니다)."}

        # 2. 이름(name)을 기반으로 type과 storage 역추적 (Node.js DB 스키마 맞춤)
        db_ingredients = []
        for item in valid_ingredients:
            ingre_type = "기타"
            ingre_storage = "냉장"
            
            for key, val in CLASS_MAPPING.items():
                if val["name"] == item.name:
                    ingre_type = val["type"]
                    ingre_storage = val["storage"]
                    break
            
            db_ingredients.append({
                "ingre_name": item.name,
                "ingre_type": ingre_type,
                "ingre_storage": ingre_storage,
                "cnt": float(item.count)
            })
            
        # 3. Node.js 서버로 한 번에 벌크 저장 전송
        async with httpx.AsyncClient() as client:
            payload = { "user_idx": user_idx, "ingredients": db_ingredients }
            post_res = await client.post(f"{NODE_SERVER_URL}/ingredient/bulk", json=payload)
            post_res.raise_for_status()
            print(f"[검수 후 저장 완료] User {user_idx}의 식재료 {len(db_ingredients)}개 저장: {post_res.json()}")
        print(f"[검수 후 저장 시뮬레이션] User {user_idx}의 식재료 저장 요청됨: {db_ingredients}")
            
        return {"success": True, "message": f"{len(db_ingredients)}개의 식재료가 성공적으로 냉장고에 저장되었습니다."}

    except Exception as e:
        print(f"식재료 저장 중 에러 발생: {e}")
        return {"success": False, "message": "식재료 저장 중 오류가 발생했습니다."}
    
