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

const getMonthLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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
  const [activeStartDate, setActiveStartDate] = useState(new Date())
  const [recordDates, setRecordDates] = useState(new Set())
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const user_idx = sessionStorage.getItem('user_idx')

  const handlePrevMonth = () => {
    const d = new Date(activeStartDate)
    d.setMonth(d.getMonth() - 1)
    setActiveStartDate(d)
  }

  const handleNextMonth = () => {
    const d = new Date(activeStartDate)
    d.setMonth(d.getMonth() + 1)
    setActiveStartDate(d)
  }

  useEffect(() => {
    if (!user_idx || !selectedDateStr) return
    setLoading(true)
    setReportData(null)
    axios.get(`http://localhost:3000/api/report/detail?day=${selectedDateStr}&user_idx=${user_idx}`)
      .then(res => {
        const data = res.data && res.data !== '0' ? res.data : null
        setReportData(data)
        if (data) {
          setRecordDates(prev => new Set([...prev, selectedDateStr]))
        }
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
          <div className="cal-card-header">
            <h3 className="cal-title">
              <span className="cal-icon">📅</span> Activity Calendar
            </h3>
            <div className="cal-nav-controls">
              <button className="cal-nav-btn" onClick={handlePrevMonth}>‹</button>
              <span className="cal-nav-label">{getMonthLabel(activeStartDate)}</span>
              <button className="cal-nav-btn" onClick={handleNextMonth}>›</button>
            </div>
          </div>

          <Calendar
            showNavigation={false}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate: d }) => d && setActiveStartDate(d)}
            onChange={(date) => {
              setSelectedDate(date)
              setSelectedDateStr(toLocalDateString(date))
            }}
            onClickDay={(date, event) => {
              if (event.detail === 2) {
                nav(`/DailyReport/${toLocalDateString(date)}`)
              }
            }}
            value={selectedDate}
            locale="en-US"
            formatDay={(locale, date) => date.getDate()}
            calendarType="gregory"
            tileContent={({ date, view }) => {
              if (view !== 'month') return null
              const ds = toLocalDateString(date)
              return recordDates.has(ds)
                ? <span className="cal-dot" />
                : null
            }}
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
