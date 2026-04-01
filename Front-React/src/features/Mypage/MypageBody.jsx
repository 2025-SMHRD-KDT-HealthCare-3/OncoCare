import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './MypageBody.css'
import '../public/root.css'

const getWeekOfMonth = (dateStr) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  return Math.ceil((date.getDate() + firstDay) / 7)
}

const formatMonthLabel = (dateStr) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

const formatWeekLabel = (dateStr) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const week = getWeekOfMonth(dateStr)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${week}째 주`
}

const MypageBody = () => {
  const navigate = useNavigate()
  const user_idx = sessionStorage.getItem('user_idx')

  const [weeklyData, setWeeklyData] = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)

  useEffect(() => {
    if (!user_idx) return

    axios.get(`http://localhost:3000/api/report/weekly?user_idx=${user_idx}`)
      .then(res => { if (res.data && res.data !== '0') setWeeklyData(res.data) })
      .catch(() => {})

    axios.get(`http://localhost:3000/api/report/monthly?user_idx=${user_idx}`)
      .then(res => { if (res.data && res.data !== '0') setMonthlyData(res.data) })
      .catch(() => {})
  }, [user_idx])

  const weekLabel  = formatWeekLabel(weeklyData?.start_date)
  const monthLabel = formatMonthLabel(monthlyData?.report_date || monthlyData?.start_date)
  const weekScore  = weeklyData?.report_score ?? null
  const monthScore = monthlyData?.report_score ?? null

  return (
    <div className="mp-page">
      {/* 헤더 */}
      <div className="mp-header">
        <h1 className="mp-title">My Page</h1>
        <p className="mp-subtitle">나의 정보를 관리하고 건강 기록을 확인하세요.</p>
      </div>

      <div className="mp-body">
        {/* ── 프로필 2열 카드 ── */}
        <div className="mp-card-grid">
          <div className="mp-info-card" onClick={() => navigate('/PersonalInfo')}>
            <div className="mp-icon-box mp-icon-green">👤</div>
            <h3 className="mp-card-title">개인정보</h3>
            <p className="mp-card-desc">이름, 이메일, 연락처 등 기본 정보를 관리합니다.</p>
            <button className="mp-btn mp-btn-solid" onClick={(e) => { e.stopPropagation(); navigate('/PersonalInfo') }}>
              정보 수정
            </button>
          </div>

          <div className="mp-info-card" onClick={() => navigate('/HealthInfo')}>
            <div className="mp-icon-box mp-icon-red">📋</div>
            <h3 className="mp-card-title">건강정보</h3>
            <p className="mp-card-desc">암 종류, 치료 단계, 체중 등 건강 관련 정보를 관리합니다.</p>
            <button className="mp-btn mp-btn-outline" onClick={(e) => { e.stopPropagation(); navigate('/HealthInfo') }}>
              기록 관리
            </button>
          </div>
        </div>

        {/* ── 건강 데이터 리포트 ── */}
        <div className="mp-section">
          <h2 className="mp-section-title">Health Data Reports</h2>

          {/* 주간 레포트 */}
          <div className="mp-report-card">
            <div className="mp-report-left">
              <div className="mp-report-meta">
                <span className="mp-badge mp-badge-green">ACTIVE CYCLE</span>
                <span className="mp-report-date">{weekLabel || '이번 주'}</span>
              </div>
              <h3 className="mp-report-title">주간 레포트</h3>
              <p className="mp-report-desc">이번 주의 식단, 배변, 컨디션 기록을 요약해서 보여줍니다.</p>
            </div>
            <div className="mp-report-right">
              {weekScore !== null && (
                <div className="mp-score-box">
                  <span className="mp-score-value mp-score-green">{weekScore}</span>
                  <span className="mp-score-label">WELLNESS SCORE</span>
                </div>
              )}
              <button className="mp-btn mp-btn-solid" onClick={() => navigate('/Report')}>
                바로가기
              </button>
            </div>
          </div>

          {/* 월간 레포트 */}
          <div className="mp-report-card">
            <div className="mp-report-left">
              <div className="mp-report-meta">
                <span className="mp-badge mp-badge-pink">LONG TERM</span>
                <span className="mp-report-date">{monthLabel || '이번 달'}</span>
              </div>
              <h3 className="mp-report-title">월간 레포트</h3>
              <p className="mp-report-desc">한 달간의 건강 데이터를 통계로 확인할 수 있습니다.</p>
            </div>
            <div className="mp-report-right">
              {monthScore !== null && (
                <div className="mp-score-box">
                  <span className="mp-score-value mp-score-green">{monthScore}</span>
                  <span className="mp-score-label">WELLNESS SCORE</span>
                </div>
              )}
              <button className="mp-btn mp-btn-dark" onClick={() => navigate('/Report#monthly')}>
                바로가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MypageBody
