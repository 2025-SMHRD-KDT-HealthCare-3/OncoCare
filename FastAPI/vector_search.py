import os
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

    print("📚 [Vector DB] 대장암 영양 가이드 문서 로드 중...")
    
    docs = []
    # 상대경로 : FastAPIdata\canner_knowlege.txt, FastAPIdata\canner_knowlege.txt 파일이 폴더에 있는지 확인하고 로드합니다.
    # 수정 필요
    for file_name in ["1.txt", "2.txt"]:
        if os.path.exists(file_name):
            try:
                # 텍스트 파일 읽기 (인코딩 에러 방지용 utf-8)
                loader = TextLoader(file_name, encoding="utf-8")
                docs.extend(loader.load())
                print(f" - {file_name} 로드 성공")
            except Exception as e:
                print(f" - {file_name} 로드 에러: {e}")
        else:
            print(f" - ⚠️ {file_name} 파일이 없습니다. (나중에 추가해주세요)")
            
    # 파일이 하나도 없으면 그냥 종료 (에러 방지)
    if not docs:
        print("⚠️ 로드할 문서가 없어 벡터 DB를 비워둡니다.")
        return

    # 문서를 500글자씩 쪼개기 (문맥 유지를 위해 50글자씩 겹치게 설정)
    # 레시피 떄문에 글자수 더 늘려야 될지도
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)
    
    # 쪼갠 문서를 ChromaDB에 임베딩하여 저장 (메모리상에 띄움)
    vector_store = Chroma.from_documents(documents=splits, embedding=embeddings)
    print("✅ [Vector DB] 임베딩 및 로드 완료!")

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