# OncoCare React 프론트엔드 정리

대장암 환자 건강 관리 앱 (OncoCare) 프론트엔드 구조 및 현황 정리

---

## 기술 스택

- React (Vite)
- React Router v6
- Axios (withCredentials: true — 세션 기반 인증)
- Bootstrap 5
- react-calendar

---

## 라우터 구조 (App.jsx)

| 경로 | 페이지 컴포넌트 | 설명 |
|------|---------------|------|
| `/` | Login | 로그인 |
| `/Register` | Register | 회원가입 |
| `/Main` | Main | 메인 (캘린더 + 오늘 요약) |
| `/MyPage` | MyPage | 마이페이지 |
| `/Fridge` | Fridge | 냉장고 인벤토리 |
| `/Report` | Report | 리포트 목록 |
| `/DailyReport/:date` | DailyReport | 일일 리포트 상세 |
| `/DailyReport/:date/DetailRecipe` | DetailRecipe | 레시피 상세 |
| `/HealthInfo` | HealthInfo | 건강정보 입력/수정 |
| `/PersonalInfo` | PersonalInfo | 개인정보 수정 |

---

## 페이지 & 컴포넌트 구조

```
pages/
  Login.jsx           → LoginHeader + LoginBody
  Register.jsx        → RegisterBody (mode 없음 = 'register')
  Main.jsx            → MainHeader + MainTop + MainBody(MainRecipe)
  MyPage.jsx          → MainHeader + MypageBody
  Fridge.jsx          → MainHeader + FridgeBody + RegisterIngredient
  Report.jsx          → (리포트 목록 페이지)
  DailyReport.jsx     → MainHeader + DailyReportBody
  DetailRecipe.jsx    → 레시피 상세
  HealthInfo.jsx      → MainHeader + HealthInfoBody
  PersonalInfo.jsx    → MainHeader + RegisterBody (mode="edit")

components/
  MainHeader.jsx      → 네비게이션 헤더 (유저명 표시, 로그아웃)
  MainTop.jsx         → 캘린더 + 일일 리포트 요약 패널
  MainBody.jsx        → 메인 콘텐츠 영역
  MainRecipe.jsx      → 오늘의 추천 식단 카드 그리드
  RecipeCard.jsx      → 레시피 카드 단일 컴포넌트
  MypageBody.jsx      → 프로필 관리 / 건강 데이터 리포트 섹션
  FridgeBody.jsx      → 냉장고 재료 카드 그리드
  RegisterIngredient.jsx → 식재료 등록 폼
  HealthInfoBody.jsx  → 건강정보 입력 폼 (기본 건강 + 식습관/알레르기)
  RegisterBody.jsx    → 회원가입 / 개인정보 수정 공용 폼 (mode prop)
  DailyReportBody.jsx → DailyDiet + DailyBowel + DailyCondition 묶음
  DailyDiet.jsx       → 식단 기록 (이미지 + 별점 + 코멘트)
  Dailybowel.jsx      → 배변일지 (날짜시간 + 브리스톨 척도 1~7 슬라이더)
  DailyCondition.jsx  → 컨디션 기록 (기분/피로 슬라이더, 수면, 수분, 복통 토글)
  LoginHeader.jsx     → 로그인 페이지 헤더
  LoginBody.jsx       → 로그인 폼

css/
  root.css            → 공통 변수, main-content 등 전역 스타일
  Header.css          → MainHeader 스타일
  MainTop.css         → 캘린더 + 패널 스타일
  MainRecipe.css      → 레시피 섹션 스타일 (RegisterIngredient 헤더도 공유)
  DailyReport.css     → DailyDiet, DailyBowel, DailyCondition 공유 스타일
  MypageBody.css      → 마이페이지 섹션 스타일
  Fridge.css          → 냉장고 페이지 스타일
  HealthInfo.css      → 건강정보 폼 스타일
  RegisterBody.css    → 회원가입/개인정보 수정 폼 스타일
  LoginBody.css       → 로그인 폼 스타일
```

---

## 주요 구현 사항

### 인증 / 세션
- Axios 전역: `axios.defaults.withCredentials = true`
- **MainHeader**: 마운트 시 `GET /user/check` 호출 → `res.data.name`으로 유저명 표시 (`{userName} 님`)
- **로그아웃**: `POST /user/logout` → 세션 삭제 후 `/` 리다이렉트

### RegisterBody (mode prop)
- `mode="register"` (기본): 회원가입 폼
- `mode="edit"`: 개인정보 수정 모드
  - 이메일 필드 read-only, 레이블 "Email (변경 불가)"
  - 이메일 중복 확인 버튼 숨김
  - 비밀번호 레이블 "새 비밀번호"
  - 제목 "개인정보 수정" / 로그인 링크 숨김
  - 제출 시 update() 함수 호출 (register 대신)

### MainTop (메인 캘린더 패널)
- 오른쪽: react-calendar (싱글클릭 날짜 선택, 더블클릭 → `/DailyReport/:date` 이동)
- 왼쪽 패널: 선택된 날짜의 일일 리포트 요약
  - 건강 점수 (1~100점) + 프로그레스 바
  - 식단 / 배변 / 컨디션 요약 항목
  - 한줄 코멘트 박스
  - "더블클릭하면 상세 리포트로 이동해요!" 힌트

### HealthInfoBody
- 기본 건강 정보: 키, 체중, 장루 여부, 항암 여부, 대장암 진단 기수, 수술/퇴원 날짜
- 식습관 정보: 하루 식사 횟수, 알레르기 항목 검색 + 체크박스 + 선택 태그 표시

### MainRecipe
- 마운트 시 레시피 목록 fetch
- 클라이언트 사이드 검색 필터
- "New" 버튼 클릭 시 새 레시피로 갱신
- 상단 4개: 4열 그리드 / 나머지: 2열 그리드

### FridgeBody
- 냉장고 재료 카드 3열 그리드
- 유통기한 임박 재료 warning 색상 표시
- `main-content` div로 감싸서 공통 레이아웃 적용

---

## 백엔드 연결 대기 중 (TODO 주석 위치)

아래 항목들은 프론트엔드 UI는 완성되어 있으나, 백엔드 API 연결이 아직 되지 않은 부분입니다.

| 파일 | TODO 내용 | 예상 API |
|------|----------|---------|
| `components/MainTop.jsx:33` | 선택 날짜 기준 일일 리포트 요약 조회 | `GET /report/daily?date=YYYY-MM-DD` |
| `components/RegisterBody.jsx:28` | 개인정보 수정 모드 진입 시 기존 정보 불러오기 | `GET /user/info` |
| `components/RegisterBody.jsx:111` | 개인정보 수정 저장 | `PUT /user/update` |
| `components/DailyDiet.jsx:11` | 식단 기록 저장 | `POST /daily/diet` |
| `components/Dailybowel.jsx:20` | 배변 기록 저장 | `POST /daily/bowel` |
| `components/DailyCondition.jsx:21` | 컨디션 기록 저장 | `POST /daily/condition` |
| `components/FridgeBody.jsx:7` | 냉장고 식재료 목록 불러오기 | `GET /fridge/list` |
| `components/HealthInfoBody.jsx:39` | 건강정보 저장 | `POST /user/health` |

---

## 앞으로 구현 예정

- [ ] MainTop 패널 → 실제 일일 리포트 데이터 연결 (`GET /report/daily?date=...`)
- [ ] PersonalInfo(RegisterBody edit mode) → 기존 정보 로드 + 수정 저장 API 연결
- [ ] DailyDiet / DailyBowel / DailyCondition 저장 버튼 → 각 POST API 연결
- [ ] FridgeBody 식재료 목록 → 백엔드에서 실데이터 fetch
- [ ] HealthInfoBody 저장 → 백엔드 연결
- [ ] MypageBody 주간(weekly) 리포트 요약 섹션 (UI 미구현)
- [ ] RecipeCard 더블클릭 → 레시피 상세 페이지 이동
- [ ] Report 페이지 내용 구현 (일일/월간 리포트 목록)

---

## 참고 사항

- 백엔드는 별도 관리 (Express + 세션)
- 세션 기반 인증 — localStorage 사용 안 함
- 공통 레이아웃 클래스: `main-content` (root.css에 정의)
- 레시피/식재료 헤더 스타일: `recipe-section-header` (MainRecipe.css) — RegisterIngredient도 동일 클래스 공유
