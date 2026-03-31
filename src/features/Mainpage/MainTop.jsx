import React, {useState} from 'react'
import './MainTop.css'
import '../public/root.css'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useNavigate } from 'react-router-dom'

const MainTop = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const nav = useNavigate();

  // 더블클릭시 리포트 이동
  const dateDoubleClick = (date) => {
    const dateform = date.toISOString().split('T')[0]  // 2024-03-25 형식
    nav(`/DailyReport/${dateform}`);
  }


  return (
    <div className="main-content two-column-wrapper">
            {/* 왼쪽 - 패널 */}
      <div className="panel-box">
        {selectedDate ? (
          <>
            <h5 className="panel-date">
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h5>

            {/* TODO: 선택 날짜 기준으로 axios.get('/report/daily?date=...') 연결 */}
            {/* 건강 점수 */}
            <div className="panel-score-row">
              <span className="panel-score-label">건강 점수</span>
              <span className="panel-score-value">— 점 <span className="panel-score-max">/ 100</span></span>
            </div>
            <div className="panel-score-bar-bg">
              <div className="panel-score-bar" style={{ width: '0%' }} />
            </div>

            {/* 요약 항목들 */}
            <div className="panel-summary-list">
              <div className="panel-summary-item">
                <span className="panel-summary-icon">🍽️</span>
                <div>
                  <p className="panel-summary-title">식단</p>
                  <p className="panel-summary-desc">기록 없음</p>
                </div>
              </div>
              <div className="panel-summary-item">
                <span className="panel-summary-icon">🚽</span>
                <div>
                  <p className="panel-summary-title">배변</p>
                  <p className="panel-summary-desc">기록 없음</p>
                </div>
              </div>
              <div className="panel-summary-item">
                <span className="panel-summary-icon">💪</span>
                <div>
                  <p className="panel-summary-title">컨디션</p>
                  <p className="panel-summary-desc">기록 없음</p>
                </div>
              </div>
            </div>

            {/* 한줄 코멘트 */}
            <div className="panel-comment">
              <p className="panel-comment-text">💬 오늘의 기록을 입력해보세요.</p>
            </div>

            <p className="panel-hint">더블클릭하면 상세 리포트로 이동해요!</p>
          </>
        ) : (
          <div className="panel-placeholder">
            <p>날짜를 선택하면</p>
            <p>내용이 표시됩니다</p>
          </div>
        )}
      </div>

      {/* 오른쪽 - 미니 캘린더 */}
      <div className="calendar-box">
        <Calendar
          onChange={setSelectedDate}       // 싱글클릭 → 날짜 선택
          onClickDay={(date, event) => {
                if (event.detail === 2) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  const dateform = `${year}-${month}-${day}`
                  nav(`/DailyReport/${dateform}`)
                }
              }}      // 더블클릭 대신 싱글클릭으로 이동
          value={selectedDate}
          locale="en-US"
          formatDay={(locale, date) => date.getDate()}
          calendarType="gregory"
        />
      </div>

    </div>
  )
}

export default MainTop