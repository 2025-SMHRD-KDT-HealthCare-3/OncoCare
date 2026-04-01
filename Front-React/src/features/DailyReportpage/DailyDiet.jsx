import { useState, useEffect } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import './DailyReport.css'

const DailyDiet = ({
  selectedDiets, setSelectedDiets,
  savedDietFeedbacks,
  onSave
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [dietData, setDietData] = useState({})

  // 저장된 피드백/별점으로 초기화
  useEffect(() => {
    if (savedDietFeedbacks && Object.keys(savedDietFeedbacks).length > 0) {
      setDietData(savedDietFeedbacks)
    }
  }, [savedDietFeedbacks])

  const getCurrentData = (diet_idx) => dietData[diet_idx] || { feedback: '', rating: 0 }

  const setFeedback = (diet_idx, value) =>
    setDietData(prev => ({ ...prev, [diet_idx]: { ...getCurrentData(diet_idx), feedback: value } }))

  const setRating = (diet_idx, value) =>
    setDietData(prev => ({ ...prev, [diet_idx]: { ...getCurrentData(diet_idx), rating: value } }))

  const handleDelete = async (diet) => {
    if (!window.confirm(`"${diet.recipe_name}" 식단을 삭제할까요?`)) return
    try {
      const res = await axios.post('http://localhost:3000/api/diet/unClickRecipe', { diet_idx: diet.diet_idx })
      if (res.data == 1 || res.data === '1') {
        const updated = selectedDiets.filter(d => d.diet_idx !== diet.diet_idx)
        setSelectedDiets(updated)
        setSelectedIdx(0)
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('삭제 실패:', err)
      alert('삭제에 실패했습니다.')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const selectedDiet = selectedDiets?.[selectedIdx]

  return (
    <div className="daily-diet-card">
      <h2 className="daily-section-title">식단은 어떠셨나요?</h2>
      <span className="daily-section-sub">오늘의 식단을 평가해주세요.</span>

      {!selectedDiets || selectedDiets.length === 0 ? (
        <div style={{ marginTop: '20px', color: '#aaa', fontSize: '14px' }}>
          오늘 선택한 식단이 없습니다.
        </div>
      ) : (
        <>
          {/* 끼니 탭 */}
          <div className="daily-meal-tabs">
            {selectedDiets.map((diet, i) => (
              <div key={i} className={`daily-meal-tab-wrap ${selectedIdx === i ? 'active' : ''}`}>
                <button className="daily-meal-tab-label" onClick={() => setSelectedIdx(i)}>
                  {diet.meal_type || `${i + 1}번째 끼니`}
                </button>
                <button className="daily-meal-tab-delete" onClick={() => handleDelete(diet)} title="식단 삭제">
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="daily-diet-inner">
            {/* 왼쪽: 이미지 + 정보 */}
            <div className="daily-diet-recipe-placeholder">
              <div className="daily-diet-img-placeholder" />
              <div className="daily-meal-type-badge">{selectedDiet?.meal_type}</div>
              <h4 className="daily-diet-name">{selectedDiet?.recipe_name || '오늘의 식단'}</h4>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                {formatDate(selectedDiet?.select_date)}
              </div>
            </div>

            {/* 오른쪽: 평가 */}
            {selectedDiet && (() => {
              const { feedback, rating } = getCurrentData(selectedDiet.diet_idx)
              return (
                <div className="daily-diet-comment">
                  <span className="daily-diet-label">오늘 식단 별점</span>
                  <div className="daily-diet-stars" style={{ marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`daily-diet-star ${star <= (hovered || rating) ? 'active' : ''}`}
                        onClick={() => setRating(selectedDiet.diet_idx, star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="daily-diet-label">식단에 대하여..</span>
                  <textarea
                    className="form-control"
                    rows={5}
                    placeholder="오늘 식단에 대한 메모를 남겨보세요."
                    value={feedback}
                    onChange={(e) => setFeedback(selectedDiet.diet_idx, e.target.value)}
                  />
                  <button
                    className="btn daily-diet-save-btn"
                    onClick={() => onSave(selectedDiet.diet_idx, feedback, rating)}
                  >
                    저장
                  </button>
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}

export default DailyDiet
