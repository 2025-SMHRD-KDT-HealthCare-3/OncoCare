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

  const [userInfo, setUserInfo]       = useState(null)
  const [healthInfo, setHealthInfo]   = useState(null)
  const [weeklyData, setWeeklyData]   = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)

  useEffect(() => {
    if (!user_idx) return

    axios.get(`http://localhost:3000/api/auth/profile?user_idx=${user_idx}`)
      .then(res => { if (res.data && res.data !== '0') setUserInfo(res.data) })
      .catch(() => {})

    axios.get(`http://localhost:3000/api/user/health?user_idx=${user_idx}`)
      .then(res => { if (res.data && res.data !== '0') setHealthInfo(res.data) })
      .catch(() => {})

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
      <div className="mp-content">

        {/* ── 페이지 헤더 ── */}
        <div className="fr-hero-card">
          <div className="fr-hero-card-body">
            <h1 className="fr-hero-title">Health Profile</h1>
            <p className="fr-hero-sub">
              나의 건강정보를 기록하고 관리합니다.
            </p>
          </div>
        </div>

        {/* ── 상단 2열: 프로필 + 건강 정보 ── */}
        <div className="mp-top-grid">

          {/* 프로필 카드 */}
          <div className="mp-profile-card">
            <div className="mp-profile-top">
              <div className="mp-avatar">👤</div>
              <div className="mp-profile-meta">
                <h2 className="mp-profile-name">{userInfo?.name || '사용자'}</h2>
                <span className="mp-profile-since">OncoCare 회원</span>
              </div>
              <button className="mp-edit-pill" onClick={() => navigate('/PersonalInfo')}>
                ✏ Edit
              </button>
            </div>
            <div className="mp-profile-divider" />
            <div className="mp-profile-rows">
              <div className="mp-profile-row">
                <span className="mp-row-label">이메일</span>
                <span className="mp-row-value">{userInfo?.email || '-'}</span>
              </div>
            </div>
          </div>

          {/* 건강 정보 카드 */}
          <div className="mp-health-card">
            <div className="mp-health-top">
              <div className="mp-health-icon-box">📋</div>
              <h2 className="mp-health-card-title">건강 정보</h2>
              <button className="mp-edit-pill" onClick={() => navigate('/HealthInfo')}>
                ✏ Edit
              </button>
            </div>
            <div className="mp-stats-grid">
              <div className="mp-stat-box">
                <span className="mp-stat-lbl">대장암 기수</span>
                <span className="mp-stat-val mp-stat-green">
                  {healthInfo?.cancer_stage || healthInfo?.CANCER_STAGE || '-'}
                </span>
              </div>
              <div className="mp-stat-box">
                <span className="mp-stat-lbl">장루 여부</span>
                <span className="mp-stat-val mp-stat-green">
                  {(() => {
                    const v = healthInfo?.stoma_status || healthInfo?.STOMA_STATUS
                    if (!healthInfo) return '-'
                    return v === 'Y' ? '있음' : '없음'
                  })()}
                </span>
              </div>
              <div className="mp-stat-box">
                <span className="mp-stat-lbl">체중</span>
                <span className="mp-stat-val">
                  {(healthInfo?.weight || healthInfo?.WEIGHT)
                    ? `${healthInfo.weight ?? healthInfo.WEIGHT} kg`
                    : '-'}
                </span>
              </div>
              <div className="mp-stat-box">
                <span className="mp-stat-lbl">알레르기</span>
                <span className="mp-stat-val">
                  {healthInfo?.allergy || healthInfo?.ALLERGY || '없음'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── 건강 리포트 섹션 ── */}
        <div className="mp-section">
          <div className="mp-section-top">
            <h2 className="mp-section-title">Health Data Reports</h2>
          </div>

          {/* 주간 리포트 */}
          <div className="mp-report-row">
            <div className="mp-report-icon mp-icon-green-bg">
              <span>📊</span>
            </div>
            <div className="mp-report-body">
              <h3 className="mp-report-title">주간 건강 리포트</h3>
              <p className="mp-report-desc">
                {weekLabel || '이번 주'} · 식단, 배변, 컨디션 기록 요약
              </p>
            </div>
            <div className="mp-report-right">
              {weekScore !== null && (
                <div className="mp-score-mini">
                  <span className="mp-score-val">{weekScore}</span>
                  <span className="mp-score-lbl">SCORE</span>
                </div>
              )}
              <button className="mp-view-btn" onClick={() => navigate('/Report')}>
                View Report
              </button>
            </div>
          </div>

          {/* 월간 리포트 */}
          <div className="mp-report-row">
            <div className="mp-report-icon mp-icon-gray-bg">
              <span>📈</span>
            </div>
            <div className="mp-report-body">
              <h3 className="mp-report-title">월간 회복 분석</h3>
              <p className="mp-report-desc">
                {monthLabel || '이번 달'} · 한 달간 건강 데이터 통계
              </p>
            </div>
            <div className="mp-report-right">
              {monthScore !== null && (
                <div className="mp-score-mini">
                  <span className="mp-score-val">{monthScore}</span>
                  <span className="mp-score-lbl">SCORE</span>
                </div>
              )}
              <button className="mp-view-btn" onClick={() => navigate('/Report#monthly')}>
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* ── 인용구 카드 ── */}
        <div className="mp-quote-card">
          <p className="mp-quote-text">
            "자연 치유력은 우리 각자 안에 있는 가장 위대한 힘입니다."
          </p>
          <span className="mp-quote-author">— HIPPOCRATES</span>
        </div>

      </div>
    </div>
  )
}

export default MypageBody
