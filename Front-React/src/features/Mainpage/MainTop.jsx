import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './MainTop.css'
import '../public/root.css'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useNavigate } from 'react-router-dom'

const toLocalDateString = (date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const parseSummary = (raw) => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {}
  return raw
}

const MainTop = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDateStr, setSelectedDateStr] = useState(toLocalDateString(new Date()))
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const user_idx = sessionStorage.getItem('user_idx')

  useEffect(() => {
    if (!user_idx || !selectedDateStr) return
    setLoading(true)
    setReportData(null)
    axios.get(`http://localhost:3000/api/report/detail?day=${selectedDateStr}&user_idx=${user_idx}`)
      .then(res => {
        setReportData(res.data && res.data !== '0' ? res.data : null)
      })
      .catch(() => setReportData(null))
      .finally(() => setLoading(false))
  }, [selectedDateStr, user_idx])

  const score = reportData?.report_score ?? null
  const diet = parseSummary(reportData?.report_diet)
  const bowel = parseSummary(reportData?.report_bowel)
  const condition = parseSummary(reportData?.report_condition)
  const comment = reportData?.report_comment ?? null

  const getSummaryText = (val) => {
    if (!val) return '기록 없음'
    if (typeof val === 'string') return val
    // JSON 객체인 경우 insight 또는 summary 필드 우선
    return val.insight || val.summary || val.status || JSON.stringify(val)
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

            {loading ? (
              <p style={{ color: '#aaa', fontSize: '0.95rem' }}>불러오는 중...</p>
            ) : (
              <>
                {/* 건강 점수 */}
                <div className="panel-score-row">
                  <span className="panel-score-label">건강 점수</span>
                  <span className="panel-score-value">
                    {score !== null ? score : '—'} 점{' '}
                    <span className="panel-score-max">/ 100</span>
                  </span>
                </div>
                <div className="panel-score-bar-bg">
                  <div className="panel-score-bar" style={{ width: score !== null ? `${score}%` : '0%' }} />
                </div>

                {/* 요약 항목들 */}
                <div className="panel-summary-list">
                  <div className="panel-summary-item">
                    <span className="panel-summary-icon">🍽️</span>
                    <div>
                      <p className="panel-summary-title">식단</p>
                      <p className="panel-summary-desc">{getSummaryText(diet)}</p>
                    </div>
                  </div>
                  <div className="panel-summary-item">
                    <span className="panel-summary-icon">🚽</span>
                    <div>
                      <p className="panel-summary-title">배변</p>
                      <p className="panel-summary-desc">{getSummaryText(bowel)}</p>
                    </div>
                  </div>
                  <div className="panel-summary-item">
                    <span className="panel-summary-icon">💪</span>
                    <div>
                      <p className="panel-summary-title">컨디션</p>
                      <p className="panel-summary-desc">{getSummaryText(condition)}</p>
                    </div>
                  </div>
                </div>

                {/* 한줄 코멘트 */}
                <div className="panel-comment">
                  <p className="panel-comment-text">
                    {comment ? `💬 ${comment}` : '💬 해당 날짜의 기록이 없습니다.'}
                  </p>
                </div>
              </>
            )}

            
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
          onChange={(date) => { setSelectedDate(date); setSelectedDateStr(toLocalDateString(date)) }}
          onClickDay={(date, event) => {
            if (event.detail === 2) {
              const dateform = toLocalDateString(date)
              nav(`/DailyReport/${dateform}`)
            }
          }}
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
