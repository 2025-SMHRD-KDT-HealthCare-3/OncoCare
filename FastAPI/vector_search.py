import os
import glob
from dotenv import load_dotenv # 💡 추가됨: 환경 변수 로드 모듈
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 💡 추가됨: vector_search.py가 실행될 때도 .env 파일을 읽어서 API 키를 가져옵니다.
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 1. 임베딩 모델 준비 (API 키를 명시적으로 넣어줍니다)
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=OPENAI_API_KEY
)

# 2. 전역 벡터 DB 변수 (서버 시작할 때 한 번만 로드하기 위함)
vector_store = None

def init_vector_db():
    """서버가 켜질 때 1.txt, 2.txt를 읽어서 벡터 DB를 구성합니다."""
    global vector_store
    
    if vector_store is not None:
        return

    persist_dir = os.path.join(os.path.dirname(__file__), "chroma_db")
    
    # 이미 만들어진 벡터 DB가 있으면 디스크에서 불러옵니다 (API 비용 및 시간 절약)
    if os.path.exists(persist_dir) and os.listdir(persist_dir):
        print("📚 [Vector DB] 기존에 저장된 로컬 Chroma DB를 불러옵니다...")
        vector_store = Chroma(persist_directory=persist_dir, embedding_function=embeddings)
        print("✅ [Vector DB] 로드 완료!")
        return

    print("📚 [Vector DB] 대장암 영양 가이드 문서 로드 및 새로운 벡터 DB 생성 중...")
    
    docs = []
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    
    # data 폴더 안의 모든 .txt 파일 찾기
    txt_files = glob.glob(os.path.join(data_dir, "*.txt"))
    
    if not txt_files:
        print(f"⚠️ {data_dir} 폴더에 로드할 .txt 파일이 없습니다.")
        return
            
    for file_path in txt_files:
        try:
            loader = TextLoader(file_path, encoding="utf-8")
            docs.extend(loader.load())
            print(f" - {os.path.basename(file_path)} 로드 성공")
        except Exception as e:
            try:
                # UTF-8 로드 실패 시 Windows 기본 인코딩(CP949)으로 재시도
                loader = TextLoader(file_path, encoding="cp949")
                docs.extend(loader.load())
                print(f" - {os.path.basename(file_path)} 로드 성공 (CP949)")
            except Exception as e2:
                print(f" - {os.path.basename(file_path)} 로드 에러: {e2}")

    if not docs:
        print("⚠️ 로드할 문서가 없어 벡터 DB를 비워둡니다.")
        return

    # 문서를 1000글자씩 쪼개기 (문맥과 레시피를 충분히 담기 위해 크기 증가)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=150,
        separators=[
            "\n==================",           # 요리닥터 레시피 및 표 구분선
            "\n레시피 이름 :",                  # 식사 가이드 레시피 구분선
            "\nSTEP",                         # 식사 가이드 시기 구분
            "\n1. 퇴원", "\n2. 퇴원", "\n3. 퇴원", # 요리닥터 시기 구분
            "\n수술 후", "\n항암치료", "\n방사선치료", "\n장루", # 증상 및 치료 단계 구분
            "\nQ.",                           # 질의응답 (Q&A) 개별 파싱
            "\n부록",                          # 부록 섹션
            "\n1장", "\n2장", "\n3장", "\n4장", "\n5장", "\n6장", "\n7장", "\n8장", # 지식 가이드 챕터 구분
            "\n\n",                  # 일반 문단
            "\n",                    # 줄바꿈
            " "
        ]
    )   
    splits = text_splitter.split_documents(docs)
    
    # 쪼갠 문서를 ChromaDB에 임베딩하여 로컬 폴더(chroma_db)에 저장
    vector_store = Chroma.from_documents(
        documents=splits, 
        embedding=embeddings,
        persist_directory=persist_dir
    )
    print("✅ [Vector DB] 임베딩 및 디스크 저장 완료!")

async def get_relevant_medical_guides(health_profile: dict, ingredients: list) -> str:
    """환자 상태와 재료를 바탕으로 가장 연관성 높은 문서를 찾아옵니다."""
    global vector_store
    
    # DB가 아직 로드 안 되었다면 초기화 함수 실행
    if vector_store is None:
        init_vector_db()
        
    # 여전히 DB가 없다면 (파일이 없어서) 빈 텍스트 반환
    if vector_store is None:
        return "현재 등록된 참고 의학 가이드 서적이 없습니다."

    # 검색을 위한 키워드(Query) 생성
    stoma_status = health_profile.get("stoma_status", "정보없음")
    
    # 재료 목록이 딕셔너리 형태일 수 있으므로 안전하게 문자열로 변환
    if isinstance(ingredients, list):
        ingre_names = [ing.get('ingre_name', '') if isinstance(ing, dict) else str(ing) for ing in ingredients]
        ingre_str = ", ".join(ingre_names)
    else:
        ingre_str = str(ingredients)

    query = f"대장암 장루 여부: {stoma_status}. 다음 식재료를 사용한 조리 주의사항 및 추천 레시피: {ingre_str}"
    
    try:
        # 유사도 검색 (가장 관련성 높은 3개의 조각을 가져옴)
        results = vector_store.similarity_search(query, k=3)
        # 검색된 결과들을 하나의 문자열로 합쳐서 반환
        combined_text = "\n\n".join([doc.page_content for doc in results])
        return combined_text
    except Exception as e:
        print(f"벡터 검색 중 에러: {e}")
        return "의학 가이드 검색에 실패했습니다."

async def get_relevant_symptom_guides(health_profile: dict, report_type: str) -> str:
    """레포트 생성 시, 환자 프로필과 레포트 종류에 맞춰 연관성 높은 전문 의학/영양 가이드를 찾아옵니다."""
    global vector_store
    
    if vector_store is None:
        init_vector_db()
        
    if vector_store is None:
        return "현재 등록된 참고 의학 가이드 서적이 없습니다."

    stoma_status = health_profile.get("stoma_status", "정보없음")
    
    # 배변, 컨디션, 식단 관리에 대한 전문 지식을 찾기 위한 쿼리
    query = f"대장암 장루 여부: {stoma_status}. 환자의 {report_type} 상태 분석을 위한 대장암 회복, 증상 관리(배변, 복통, 변비, 설사 등), 컨디션 향상, 영양 및 식단 가이드 전문 지식"
    
    try:
        results = vector_store.similarity_search(query, k=3)
        combined_text = "\n\n".join([doc.page_content for doc in results])
        return combined_text
    except Exception as e:
        print(f"벡터 검색 중 에러: {e}")
        return "의학 가이드 검색에 실패했습니다."

# 💡 [추가됨] 이 스크립트를 직접 실행하면 서버를 켜지 않고도 즉시 벡터 DB를 생성합니다.
if __name__ == "__main__":
    init_vector_db()