import { useState, useEffect } from 'react'
import axios from 'axios'
import './DailyReport.css'
import { useToast } from '../../context/ToastContext'

const EMOJIS = ['😞', '😟', '😐', '😊', '😄']

const DailyDiet = ({
  selectedDiets, setSelectedDiets,
  savedDietFeedbacks,
  onSave
}) => {
  const { showToast, showConfirm } = useToast()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [dietData, setDietData] = useState({})
  const [savedSet, setSavedSet] = useState(new Set())

  useEffect(() => {
    if (savedDietFeedbacks && Object.keys(savedDietFeedbacks).length > 0) {
      setDietData(savedDietFeedbacks)
      setSavedSet(new Set(Object.keys(savedDietFeedbacks).map(String)))
    }
  }, [savedDietFeedbacks])

  const getCurrentData = (diet_idx) => dietData[diet_idx] || { feedback: '', rating: 0 }

  const setFeedback = (diet_idx, value) =>
    setDietData(prev => ({ ...prev, [diet_idx]: { ...getCurrentData(diet_idx), feedback: value } }))

  const setRating = (diet_idx, value) =>
    setDietData(prev => ({ ...prev, [diet_idx]: { ...getCurrentData(diet_idx), rating: value } }))

  const handleDelete = async (diet) => {
    const ok = await showConfirm('삭제 확인', `"${diet.recipe_name}" 식단을 삭제할까요?`)
    if (!ok) return
    try {
      const res = await axios.post('http://localhost:3000/api/diet/unClickRecipe', { diet_idx: diet.diet_idx })
      if (res.data == 1 || res.data === '1') {
        const updated = selectedDiets.filter(d => d.diet_idx !== diet.diet_idx)
        setSelectedDiets(updated)
        setSelectedIdx(0)
      } else {
        showToast('오류', '삭제에 실패했습니다.', 'danger')
      }
    } catch (err) {
      console.error('삭제 실패:', err)
      showToast('오류', '삭제에 실패했습니다.', 'danger')
    }
  }

  const handleSave = async (diet_idx, feedback, rating) => {
    await onSave(diet_idx, feedback, rating)
    setSavedSet(prev => new Set([...prev, String(diet_idx)]))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  const selectedDiet = selectedDiets?.[selectedIdx]

  // 저장된 식단 목록 (savedSet에 있는 것들)
  const savedDietItems = (selectedDiets || []).filter(d => savedSet.has(String(d.diet_idx)))

  return (
    <div className="dr-card">
      <h2 className="dr-card-title">🍽 영양 피드백</h2>
      <span className="dr-section-label">오늘의 식단을 평가해주세요</span>

      {!selectedDiets || selectedDiets.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: '14px' }}>오늘 선택한 식단이 없습니다.</div>
      ) : (
        <>
          <div className="dr-meal-tabs">
            {selectedDiets.map((diet, i) => (
              <div key={i} className={`dr-meal-tab ${selectedIdx === i ? 'active' : ''}`}>
                <button className="dr-meal-tab-btn" onClick={() => setSelectedIdx(i)}>
                  {diet.meal_type || `${i + 1}번째 끼니`}
                </button>
                <button className="dr-meal-tab-del" onClick={() => handleDelete(diet)} title="식단 삭제">
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="dr-recipe-row">
            <div className="dr-recipe-img-box" />
            <div className="dr-recipe-meta">
              <p className="dr-recipe-type-label">{selectedDiet?.meal_type} 추천</p>
              <p className="dr-recipe-name">{selectedDiet?.recipe_name || '오늘의 식단'}</p>
              <p className="dr-recipe-date">{formatDate(selectedDiet?.select_date)}</p>
            </div>
          </div>

          {selectedDiet && (() => {
            const { feedback, rating } = getCurrentData(selectedDiet.diet_idx)
            return (
              <>
                <div className="dr-rating-header">
                  <span className="dr-rating-q">식사 후 어떠셨나요?</span>
                </div>
                <div className="dr-emoji-row">
                  {EMOJIS.map((emoji, i) => {
                    const star = i + 1
                    return (
                      <button
                        key={star}
                        className={`dr-emoji-btn ${star <= (hovered || rating) ? 'active' : ''}`}
                        onClick={() => setRating(selectedDiet.diet_idx, star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                      >
                        {emoji}
                      </button>
                    )
                  })}
                </div>

                <div className="dr-field-label">✏ 소화 메모</div>
                <textarea
                  className="dr-textarea"
                  rows={3}
                  placeholder="식사 후 느낌을 자유롭게 적어주세요..."
                  value={feedback}
                  onChange={(e) => setFeedback(selectedDiet.diet_idx, e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="dr-save-btn"
                    onClick={() => handleSave(selectedDiet.diet_idx, feedback, rating)}
                  >
                    저장
                  </button>
                </div>
              </>
            )
          })()}

          {/* 저장된 기록 목록 */}
          {savedDietItems.length > 0 && (
            <div className="dr-saved-list">
              <span className="dr-saved-list-label">저장된 식단 기록</span>
              {savedDietItems.map((diet) => {
                const { feedback, rating } = getCurrentData(diet.diet_idx)
                return (
                  <div key={diet.diet_idx} className="dr-saved-item">
                    <span className="dr-saved-meal-type">{diet.meal_type || '끼니'}</span>
                    <span className="dr-saved-emoji">{rating > 0 ? EMOJIS[rating - 1] : '—'}</span>
                    <span className="dr-saved-feedback">{feedback || '메모 없음'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DailyDiet
