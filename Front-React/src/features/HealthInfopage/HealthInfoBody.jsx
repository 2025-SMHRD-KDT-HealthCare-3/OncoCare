import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import './HealthInfo.css'
import { useToast } from '../../context/ToastContext'

const ALL_ALLERGENS = [
  '우유', '달걀', '밀', '글루텐', '유당',
  '대두(콩)', '땅콩', '견과류', '잣',
  '새우', '게', '조개', '홍합', '전복', '굴',
  '오징어', '고등어', '연어', '참치',
  '닭고기', '돼지고기', '소고기',
  '복숭아', '토마토', '키위', '바나나', '사과',
  '메밀', '아황산염', '셀러리', '겨자', '참깨'
]

const MEAL_OPTIONS = ['1끼', '2끼', '3끼', '4끼', '5끼', '6끼']

const HealthInfoBody = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [hasOstomy, setHasOstomy] = useState(false)
  const [hasChemo, setHasChemo] = useState(false)
  const [diagnosisStage, setDiagnosisStage] = useState('')
  const [surgeryDate, setSurgeryDate] = useState('')
  const [dischargeDate, setDischargeDate] = useState('')

  const [mealCount, setMealCount] = useState('')

  // 알러지
  const [allergySearch, setAllergySearch] = useState('')
  const [selectedAllergens, setSelectedAllergens] = useState([])
  const [customAllergyInput, setCustomAllergyInput] = useState('')

  const filteredAllergens = ALL_ALLERGENS.filter((a) => a.includes(allergySearch))

  const toggleAllergen = (allergen) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    )
  }

  const addCustomAllergy = () => {
    const term = customAllergyInput.trim()
    if (!term) return
    if (!selectedAllergens.includes(term)) {
      setSelectedAllergens(prev => [...prev, term])
    }
    setCustomAllergyInput('')
  }

  useEffect(() => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return

    axios
      .get(`http://localhost:3000/api/user/health?user_idx=${user_idx}`)
      .then((res) => {
        const d = res.data
        if (!d) return

        if (d.height) setHeight(d.height)
        if (d.weight) setWeight(d.weight)
        if (d.cancer_stage) setDiagnosisStage(String(d.cancer_stage))
        if (d.surgery_date) setSurgeryDate(String(d.surgery_date).split('T')[0])
        if (d.discharge_date) setDischargeDate(String(d.discharge_date).split('T')[0])

        setHasOstomy(d.stoma_status === 'Y' || d.stoma_status === 1)
        setHasChemo(d.chemo_status === 'Y' || d.chemo_status === 1)

        if (d.meals_per_day) {
          const val = String(d.meals_per_day)
          // 끼니 수 파싱
          const mealMatch = val.match(/([1-6])끼/)
          if (mealMatch) {
            setMealCount(`${mealMatch[1]}끼`)
          } else {
            // 이전 숫자 형식 호환
            const n = parseInt(val)
            if (n >= 1 && n <= 6) setMealCount(`${n}끼`)
          }
        }

        if (d.allergy) {
          setSelectedAllergens(d.allergy.split(',').filter(a => a))
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) { showToast('알림', '로그인이 필요합니다.', 'warning'); return }

    const mealStr = mealCount

    try {
      const response = await axios.post('http://localhost:3000/api/user/health/register', {
        user_idx,
        height,
        weight,
        cancer_stage: diagnosisStage,
        surgery_date: surgeryDate,
        discharge_date: dischargeDate,
        stoma_status: hasOstomy ? 'Y' : 'N',
        chemo_status: hasChemo ? 'Y' : 'N',
        allergy: selectedAllergens.join(','),
        meals_per_day: mealStr,
      })

      if (response.data == '1') {
        showToast('저장 완료', '저장되었습니다.', 'success')
        navigate('/MyPage')
      } else {
        showToast('오류', '저장에 실패했습니다.', 'danger')
      }
    } catch (error) {
      console.error(error)
      showToast('오류', '서버 통신 중 오류가 발생했습니다.', 'danger')
    }
  }

  const handleNumberChange = (setter) => (e) => {
    const val = e.target.value
    if (val === '') { setter(''); return }
    if (parseFloat(val) > 999) return
    if (/^\d+(\.\d{2,})$/.test(val)) return
    setter(val)
  }

  return (
    <div className="main-content">
      <div className="health-profile-page">
        <div className="health-profile-shell">

          <div className="fr-hero-card">
            <div className="fr-hero-card-body">
              <h1 className="fr-hero-title">Health Profile</h1>
              <p className="fr-hero-sub">나의 건강정보를 기록하고 관리합니다.</p>
            </div>
          </div>

          {/* ── 신체 정보 ── */}
          <section className="profile-section">
            <div className="section-heading">
              <span className="section-icon">●</span>
              <h2>신체 정보</h2>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <label className="profile-label">신장</label>
                <div className="metric-input-wrap">
                  <input type="number" className="profile-input metric-input"
                    placeholder="175" value={height} min="0" max="999" step="0.1"
                    onChange={handleNumberChange(setHeight)} />
                  <span className="metric-unit">cm</span>
                </div>
              </div>
              <div className="metric-card">
                <label className="profile-label">체중</label>
                <div className="metric-input-wrap">
                  <input type="number" className="profile-input metric-input"
                    placeholder="72" value={weight} min="0" max="999" step="0.1"
                    onChange={handleNumberChange(setWeight)} />
                  <span className="metric-unit">kg</span>
                </div>
              </div>
            </div>

            <div className="toggle-card">
              <div className="toggle-copy"><h3>장루 여부</h3><p>장루가 있으신가요?</p></div>
              <label className="custom-switch">
                <input type="checkbox" checked={hasOstomy} onChange={e => setHasOstomy(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>

            <div className="toggle-card">
              <div className="toggle-copy"><h3>항암치료 여부</h3><p>현재 항암치료 중이신가요?</p></div>
              <label className="custom-switch">
                <input type="checkbox" checked={hasChemo} onChange={e => setHasChemo(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>

            <div className="toggle-card">
              <div className="toggle-copy"><h3>대장암 기수</h3></div>
              <select className="profile-select stage-select" value={diagnosisStage}
                onChange={e => setDiagnosisStage(e.target.value)}>
                <option value="">선택</option>
                <option value="1기">1기</option>
                <option value="2기">2기</option>
                <option value="3기">3기</option>
                <option value="4기">4기</option>
              </select>
            </div>
          </section>

          {/* ── 치료 일정 ── */}
          <section className="profile-section">
            <div className="section-heading">
              <span className="section-icon">✦</span>
              <h2>치료 일정</h2>
            </div>
            <div className="metric-grid">
              <div className="metric-card">
                <label className="profile-label">수술날짜</label>
                <input type="date" className="profile-input" value={surgeryDate}
                  onChange={e => setSurgeryDate(e.target.value)} />
              </div>
              <div className="metric-card">
                <label className="profile-label">퇴원날짜</label>
                <input type="date" className="profile-input" value={dischargeDate}
                  onChange={e => setDischargeDate(e.target.value)} />
              </div>
            </div>
          </section>

          {/* ── 식사 정보 ── */}
          <section className="profile-section">
            <div className="section-heading">
              <span className="section-icon">◧</span>
              <h2>식사 정보</h2>
            </div>

            {/* 끼니 수 */}
            <div className="option-card">
              <label className="profile-label">하루 끼니 수</label>
              <p className="option-hint">하루에 몇 끼를 드시나요? (간식 제외)</p>
              <div className="pill-group">
                {MEAL_OPTIONS.map(opt => (
                  <button key={opt} type="button"
                    className={`pill-btn ${mealCount === opt ? 'active' : ''}`}
                    onClick={() => setMealCount(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 알러지 */}
            <div className="option-card">
              <label className="profile-label">알러지 식품 &amp; 기피 식품</label>

              {selectedAllergens.length > 0 && (
                <div className="selected-tags">
                  {selectedAllergens.map(a => (
                    <span key={a} className="selected-tag">
                      {a}
                      <button type="button" onClick={() => toggleAllergen(a)}>×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* 목록 검색 */}
              <div className="search-box">
                <input type="text" className="profile-input allergy-search-input"
                  placeholder="목록에서 검색 (예: 우유, 견과류)"
                  value={allergySearch}
                  onChange={e => setAllergySearch(e.target.value)} />
              </div>

              <div className="allergy-list-modern">
                {filteredAllergens.map(allergen => (
                  <label key={allergen} className="allergy-check-item">
                    <input type="checkbox"
                      checked={selectedAllergens.includes(allergen)}
                      onChange={() => toggleAllergen(allergen)} />
                    <span>{allergen}</span>
                  </label>
                ))}
                {filteredAllergens.length === 0 && allergySearch.trim() && (
                  <p className="allergy-no-result">목록에 없는 항목입니다. 아래에서 직접 추가하세요.</p>
                )}
              </div>

              {/* 직접 입력 */}
              <div className="allergy-direct-row">
                <input type="text" className="profile-input allergy-direct-input"
                  placeholder="목록에 없으면 직접 입력 (예: 녹두, 호두)"
                  value={customAllergyInput}
                  onChange={e => setCustomAllergyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy() } }} />
                <button type="button" className="allergy-direct-add-btn" onClick={addCustomAllergy}>
                  + 추가
                </button>
              </div>
            </div>
          </section>

          <div className="save-row">
            <button className="save-btn" onClick={handleSubmit}>저장</button>
          </div>

          <p className="privacy-note">
            당신의 건강 정보는 안전하게 저장되며, 절대 외부에 공유되지 않습니다. 이 정보는 개인 맞춤형 식단과 영양 가이드를 제공하는 데에만 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HealthInfoBody
