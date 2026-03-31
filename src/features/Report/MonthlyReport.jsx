import React from 'react'
import './Report.css'

// TODO: props로 monthlyData 받아서 실데이터 연결
const MonthlyReport = () => {
  const score = null        // TODO: monthlyData.score
  const prevScore = null    // TODO: monthlyData.prevScore
  const scoreWidth = score ? `${score}%` : '0%'

  const scoreDiff = score !== null && prevScore !== null ? score - prevScore : null
  const diffClass = scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : ''
  const diffText = scoreDiff !== null
    ? `${scoreDiff > 0 ? '▲' : '▼'} ${Math.abs(scoreDiff)}점`
    : '—'

  const sections = [
    {
      icon: '🍽️',
      title: '식단',
      summary: '이번 달 식단 기록이 없습니다.',
      insight: '꾸준한 식단 기록이 건강 관리의 첫걸음이에요.',
      thisMonth: '—',
      lastMonth: '—',
      change: '—',
      changeClass: '',
    },
    {
      icon: '🚽',
      title: '배변',
      summary: '이번 달 배변일지 기록이 없습니다.',
      insight: '배변 패턴을 기록하면 장 건강 변화를 한눈에 확인할 수 있어요.',
      thisMonth: '—',
      lastMonth: '—',
      change: '—',
      changeClass: '',
    },
    {
      icon: '💪',
      title: '컨디션',
      summary: '이번 달 컨디션 기록이 없습니다.',
      insight: '매일 컨디션을 체크하면 회복 추이를 확인할 수 있어요.',
      thisMonth: '—',
      lastMonth: '—',
      change: '—',
      changeClass: '',
    },
  ]

  return (
    <div className="report-section">
      {/* 헤더 */}
      <div className="report-section-header">
        <span className="report-section-badge">MONTHLY</span>
        <h2 className="report-section-title">월간 리포트</h2>
        {/* TODO: 실제 연월로 교체 */}
        <p className="report-section-period">해당 월의 데이터가 표시됩니다</p>
      </div>

      {/* 월간 건강 점수 */}
      <div className="report-score-card">
        <div className="report-score-row">
          <span className="report-score-label">월간 건강 점수</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <span className="report-score-value">
              {score !== null ? score : '—'}
              <span className="report-score-max"> / 100</span>
            </span>
            <span className={`report-compare ${diffClass}`}>
              전월 대비 {diffText}
            </span>
          </div>
        </div>
        <div className="report-score-bar-bg">
          <div className="report-score-bar" style={{ width: scoreWidth }} />
        </div>
      </div>

      {/* 식단 / 배변 / 컨디션 — 전월 비교 + 인사이트 */}
      <div className="report-insight-grid">
        {sections.map((item) => (
          <div key={item.title} className="report-insight-card">
            <div className="report-insight-card-header">
              <span className="report-insight-icon">{item.icon}</span>
              <p className="report-insight-title">{item.title} 요약</p>
            </div>
            <p className="report-insight-summary">{item.summary}</p>

            {/* 전월 비교 */}
            <div className="report-compare-row">
              <div className="report-compare-cell">
                <p className="report-compare-cell-label">이번 달</p>
                <p className="report-compare-cell-value">{item.thisMonth}</p>
              </div>
              <div className="report-compare-cell">
                <p className="report-compare-cell-label">지난 달</p>
                <p className="report-compare-cell-value">{item.lastMonth}</p>
              </div>
              <div className="report-compare-cell">
                <p className="report-compare-cell-label">변화</p>
                <p className={`report-compare-cell-value ${item.changeClass}`}>{item.change}</p>
              </div>
            </div>

            {/* 인사이트 */}
            <div className="report-insight-box">
              <p className="report-insight-text">💡 {item.insight}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 이달의 칭찬 코멘트 */}
      <div className="report-comment-box">
        <div className="report-comment-emoji">🌿</div>
        <p className="report-comment-title">이달의 한마디</p>
        {/* TODO: 실제 코멘트 데이터 연결 */}
        <p className="report-comment-text">
          데이터가 쌓이면 이달의 건강 총평과 칭찬 메시지가 여기에 표시됩니다.
        </p>
      </div>
    </div>
  )
}

export default MonthlyReport
