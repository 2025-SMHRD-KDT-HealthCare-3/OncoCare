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