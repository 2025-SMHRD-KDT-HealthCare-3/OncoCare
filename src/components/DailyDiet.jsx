import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

const DailyDiet = () => {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  const handleSave = () => {
    // TODO: axios.post로 백엔드 저장 연결
    console.log({ rating, comment })
    alert('저장되었습니다.')
  }

  return (
    <div className="daily-diet-card">
      {/* 레시피 이미지 & 이름 자리 (추후 연결) */}
      <div className="daily-diet-recipe-placeholder">
        <div className="daily-diet-img-placeholder" />
        <h4 className="daily-diet-name">레시피 이름</h4>
      </div>

      {/* 별점 */}
      <div className="daily-diet-rating">
        <span className="daily-diet-label">오늘의 식단 평가</span>
        <div className="daily-diet-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`daily-diet-star ${star <= (hovered || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* 코멘트 */}
      <div className="daily-diet-comment">
        <span className="daily-diet-label">코멘트</span>
        <textarea
          className="form-control"
          rows={3}
          placeholder="오늘 식단에 대한 메모를 남겨보세요."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {/* 저장 버튼 */}
      <button
        className="btn daily-diet-save-btn"
        onClick={handleSave}
      >
        저장
      </button>
    </div>
  )
}

export default DailyDiet
