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
   <section className="dashboard-top">
      <div className="dashboard-grid">
        <div className="calendar-card">
          <div className="section-card-header">
            <h3>Activity Calendar</h3>
          </div>

          <Calendar
            onChange={(date) => {
              setSelectedDate(date)
              setSelectedDateStr(toLocalDateString(date))
            }}
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

        <div className="wellness-card">
          <div className="section-card-header">
            <div>
              <h3>Daily Wellness</h3>
              <span className="status-badge">STABLE</span>
            </div>
          </div>

          {loading ? (
            <p className="loading-text">불러오는 중...</p>
          ) : (
            <>
              <div className="wellness-score-wrap">
                <div className="wellness-score-circle">
                  <div className="wellness-score-inner">
                    <strong>{score !== null ? score : '—'}</strong>
                    <span>Score</span>
                  </div>
                </div>
              </div>

              <div className="wellness-summary-grid">
                <div className="summary-box">
                  <p className="summary-label">식단</p>
                  <p className="summary-value">{getSummaryText(diet)}</p>
                </div>
                <div className="summary-box">
                  <p className="summary-label">배변</p>
                  <p className="summary-value">{getSummaryText(bowel)}</p>
                </div>
                <div className="summary-box full">
                  <p className="summary-label">컨디션</p>
                  <p className="summary-value">{getSummaryText(condition)}</p>
                </div>
              </div>

              <div className="wellness-comment">
                {comment ? `💬 ${comment}` : '💬 해당 날짜의 기록이 없습니다.'}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default MainTop
