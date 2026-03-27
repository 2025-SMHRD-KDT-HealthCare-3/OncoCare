import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/DailyReport.css'

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
      <h2 className="daily-section-title">식단은 어떠셨나요?</h2>
      <span className="daily-section-sub">오늘의 식단을 평가해주세요.</span>

      <div className="daily-diet-inner">
        {/* 왼쪽: 이미지 + 별점 */}
        <div className="daily-diet-recipe-placeholder">
          <div className="daily-diet-img-placeholder" />
          <h4 className="daily-diet-name">오늘의 식단</h4>
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

        {/* 오른쪽: 코멘트 */}
        <div className="daily-diet-comment">
          <span className="daily-diet-label">식단에 대하여..</span>
          <textarea
            className="form-control"
            rows={6}
            placeholder="오늘 식단에 대한 메모를 남겨보세요."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn daily-diet-save-btn" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyDiet
