# 🥗 OncoCare (온코케어)
> **AI 기반 대장암 환자 맞춤 식단 가이드 및 건강관리 시스템**

OncoCare는 대장암 환자들이 퇴원 후 일상에서 겪는 식단 관리의 어려움을 해결하기 위해 기획된 헬스케어 플랫폼입니다. 수술 직후 장이 예민한 시기부터 회복기까지, 환자의 현재 상태와 **냉장고에 있는 실제 식재료**를 기반으로 안전한 맞춤형 식단을 AI가 추천합니다.

## 👥 팀원 및 역할 (OncoCare)
| 이름 | 역할 | 담당 업무 |
|:---:|:---|:---|
| **한민성** | **PM** | 프로젝트 매니징, 건강 기록(관리) 시스템 구현 |
| **송정인** | **Front-end** | React 기반 UI/UX 및 클라이언트 로직 개발 |
| **이현솔** | **Back-end** | Node.js 기반 서버 API 설계 및 비즈니스 로직 구현 |
| **이나영** | **AI 모델링** | 식재료 객체 인식 모델(YOLO) 학습 및 데이터셋 관리 |
| **박윤정** | **DB 설계** | MySQL 데이터베이스 모델링 및 쿼리 최적화 |

## 🛠 기술 스택
- **Frontend:** React
- **Backend:** Node.js (Express)
- **AI Server:** FastAPI (Python)
- **Database:** MySQL
- **AI Model:** YOLO (식재료 객체 인식)
- **GPU 권장:** NVIDIA RTX 5060 Ti 16GB 이상 (모델 추론 및 학습 최적화)

## ✨ 핵심 기능
1. **📸 스마트 냉장고**: YOLO 기반 식재료 자동 인식 및 재고 관리
2. **🍽 맞춤 식단 추천**: 환자 상태(BMI, 회복기) + 보유 재료 기반 레시피 추천
3. **📝 건강 기록**: 수분, 수면, 복통, 배변 상태 등 일일 컨디션 추적
4. **📊 AI 리포트**: 주간/월간 단위의 AI 분석 건강 솔루션 제공

---
- **주의사항:** OpenAI API, MySQL는 별도의 구성필요

# 🚀 프로젝트 실행 가이드 (FastAPI + Node.js + React)

이 프로젝트는 총 3개의 파트(FastAPI 백엔드, Node.js 백엔드, React 프론트엔드)로 구성되어 있습니다. 코드를 처음 다운로드(Pull/Clone) 받으신 후, 아래의 순서대로 각 환경을 세팅하고 실행해 주세요.

## 🟩 1. Node.js 서버 설정 및 실행 (경로: `oncocare/node`)

Node.js 서버는 `/node` 폴더 내에 위치해 있습니다. 새로운 터미널을 열고 아래 순서대로 진행해 주세요.

### 1-1. 폴더 이동 및 패키지 설치
\`\`\`bash
cd node
npm install
\`\`\`

### 1-2. Node.js 서버 실행
\`\`\`bash
npm start
\`\`\`
* 서버가 켜지면 터미널에 표시되는 포트(예: `http://localhost:3000`)에서 정상 작동을 확인할 수 있습니다.

---

## ⚛️ 2. React 프론트엔드 설정 및 실행 (경로: `oncocare`)

React 프론트엔드는 `/Front-React` 폴더 내에 위치해 있습니다. 새로운 터미널을 열고 아래 순서대로 진행해 주세요.

### 2-1. 폴더 이동 및 패키지 설치
\`\`\`bash
cd Front-React
npm install
\`\`\`

### 2-2. React 실행
\`\`\`bash
npm start
\`\`\`
* 실행이 완료되면 브라우저가 자동으로 열리거나, 터미널에 안내된 로컬 주소(예: `http://localhost:3000` 또는 `http://localhost:5173`)를 통해 화면을 확인할 수 있습니다.

---

## 🐍 3. FastAPI 서버 설정 및 실행 (경로: `/FastAPI`)
해당 파일로 먼저 들어간뒤 설정
\`\`\`bash
cd FastAPI
\`\`\`

### 3-1. 가상 환경(Virtual Environment) 생성
`FastAPI` 폴더 안으로 이동한 상태에서 아래 명령어를 입력하여 독립된 파이썬 환경을 만듭니다.
\`\`\`bash
python -m venv venv
\`\`\`

### 3-2. 가상 환경 활성화 (접속)
운영체제에 맞게 가상 환경을 실행합니다. 터미널 경로 앞에 `(venv)`가 생겼는지 확인하세요.
* **Windows:**
  \`\`\`bash
  venv\Scripts\activate
  \`\`\`
* **Mac / Linux:**
  \`\`\`bash
  source venv/bin/activate
  \`\`\`

### 3-3. 필수 라이브러리 설치
가상 환경이 켜진 상태에서, `requirements.txt`에 명시된 패키지들을 한 번에 설치합니다.
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 3-4. FastAPI 서버 실행
모든 세팅이 끝났다면, 아래 명령어를 통해 FastAPI 서버를 실행합니다. (반드시 `(venv)` 상태에서 실행)
\`\`\`bash
uvicorn FastAPI:app --reload --port 8000
\`\`\`
* `--reload` 옵션: 코드를 수정하면 서버가 자동으로 재시작됩니다.
* 브라우저에서 `http://localhost:8000` 으로 접속하여 정상 작동을 확인할 수 있습니다.

### 3-5. 가상 환경 비활성화
가상 환경을 종료하려면 아래 명령어를 입력합니다.
\`\`\`bash
deactivate
\`\`\`

---