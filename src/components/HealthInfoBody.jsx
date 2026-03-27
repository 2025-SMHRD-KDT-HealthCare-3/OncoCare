import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/HealthInfo.css'

const ALL_ALLERGENS = [
  '우유', '달걀', '밀', '대두(콩)', '땅콩', '견과류',
  '새우', '게', '오징어', '복숭아', '토마토', '닭고기',
  '돼지고기', '소고기', '메밀', '아황산염', '잣', '고등어',
]

const HealthInfoBody = () => {
  // 기본 건강 정보
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [hasOstomy, setHasOstomy] = useState(false)
  const [hasChemo, setHasChemo] = useState(false)
  const [diagnosisStage, setDiagnosisStage] = useState('')
  const [surgeryDate, setSurgeryDate] = useState('')
  const [dischargeDate, setDischargeDate] = useState('')

  // 식습관 정보
  const [mealsPerDay, setMealsPerDay] = useState('')
  const [allergySearch, setAllergySearch] = useState('')
  const [selectedAllergens, setSelectedAllergens] = useState([])

  const filteredAllergens = ALL_ALLERGENS.filter((a) =>
    a.includes(allergySearch)
  )

  const toggleAllergen = (allergen) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    )
  }

  const handleSubmit = () => {
    // TODO: axios.post로 백엔드 저장 연결
    console.log({
      height, weight, hasOstomy, hasChemo,
      diagnosisStage, surgeryDate, dischargeDate,
      mealsPerDay, selectedAllergens,
    })
    alert('저장되었습니다.')
  }

  return (
    <div className='main-content'>
        <div className="healthinfo-wrapper">
        <div className="healthinfo-box">

        {/* ── 기본 건강 정보 ── */}
        <section className="healthinfo-section">
            <h2 className="healthinfo-section-title">기본 건강 정보</h2>

            {/* 키 / 체중 */}
            <div className="healthinfo-row">
            <div className="healthinfo-field">
                <label className="healthinfo-label">키 (cm)</label>
                <input
                type="number"
                className="form-control"
                placeholder="Value"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                />
            </div>
            <div className="healthinfo-field">
                <label className="healthinfo-label">체중 (kg)</label>
                <input
                type="number"
                className="form-control"
                placeholder="Value"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                />
            </div>
            </div>

            {/* 장루 여부 / 항암 여부 */}
            <div className="healthinfo-row" style={{ marginTop: '24px' }}>
            <div className="healthinfo-toggle-group">
                <span className="healthinfo-label">장루 여부</span>
                <div className="form-check form-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={hasOstomy}
                    onChange={(e) => setHasOstomy(e.target.checked)}
                />
                </div>
                <span className="healthinfo-toggle-desc">
                {hasOstomy ? '있음' : '없음'}
                </span>
            </div>
            <div className="healthinfo-toggle-group">
                <span className="healthinfo-label">항암 여부</span>
                <div className="form-check form-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={hasChemo}
                    onChange={(e) => setHasChemo(e.target.checked)}
                />
                </div>
                <span className="healthinfo-toggle-desc">
                {hasChemo ? '받는 중' : '받지 않음'}
                </span>
            </div>
            </div>

            {/* 대장암 진단 기수 / 수술 날짜 / 퇴원 날짜 */}
            <div className="healthinfo-row three-col" style={{ marginTop: '24px' }}>
            <div className="healthinfo-field">
                <label className="healthinfo-label">대장암 진단 기수</label>
                <select
                className="form-select"
                value={diagnosisStage}
                onChange={(e) => setDiagnosisStage(e.target.value)}
                >
                <option value="">선택</option>
                <option value="1">1기</option>
                <option value="2">2기</option>
                <option value="3">3기</option>
                <option value="4">4기</option>
                </select>
            </div>
            <div className="healthinfo-field">
                <label className="healthinfo-label">수술 날짜</label>
                <input
                type="date"
                className="form-control"
                value={surgeryDate}
                onChange={(e) => setSurgeryDate(e.target.value)}
                />
            </div>
            <div className="healthinfo-field">
                <label className="healthinfo-label">퇴원 날짜</label>
                <input
                type="date"
                className="form-control"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                />
            </div>
            </div>
        </section>

        {/* ── 식습관 정보 ── */}
        <section className="healthinfo-section">
            <h2 className="healthinfo-section-title">식습관 정보</h2>

            <div className="healthinfo-row align-start">
            {/* 하루 식사 횟수 */}
            <div className="healthinfo-field">
                <label className="healthinfo-label">하루 식사 횟수</label>
                <select
                className="form-select"
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(e.target.value)}
                >
                <option value="">선택</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}회</option>
                ))}
                </select>
            </div>

            {/* 알레르기 검색 + 체크리스트 */}
            <div className="healthinfo-field">
                <label className="healthinfo-label">알레르기</label>
                <div className="allergy-search-box">
                <input
                    type="text"
                    className="form-control"
                    placeholder="검색"
                    value={allergySearch}
                    onChange={(e) => setAllergySearch(e.target.value)}
                />
                <span className="allergy-search-icon">🔍</span>
                </div>

                {selectedAllergens.length > 0 && (
                <div className="allergy-tags">
                    {selectedAllergens.map((a) => (
                    <span key={a} className="allergy-tag">
                        {a}
                        <button onClick={() => toggleAllergen(a)}>×</button>
                    </span>
                    ))}
                </div>
                )}

                <div className="allergy-list">
                {filteredAllergens.map((allergen) => (
                    <div key={allergen} className="form-check allergy-item">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`allergy-${allergen}`}
                        checked={selectedAllergens.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                    />
                    <label className="form-check-label" htmlFor={`allergy-${allergen}`}>
                        {allergen}
                    </label>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </section>

        {/* ── 제출 버튼 ── */}
        <div className="healthinfo-submit-row">
            <button className="btn healthinfo-submit-btn" onClick={handleSubmit}>
            제출
            </button>
        </div>

        </div>
        </div>
    </div>
  )
}

export default HealthInfoBody
