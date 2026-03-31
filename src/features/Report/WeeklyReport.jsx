import React from 'react'
import './Report.css'

// TODO: props로 weeklyData 받아서 실데이터 연결
const WeeklyReport = () => {
  const score = null  // TODO: weeklyData.score
  const scoreWidth = score ? `${score}%` : '0%'

  const insights = [
    {
      icon: '🍽️',
      title: '식단',
      summary: '기록 없음',
      insight: '이번 주 식단 데이터가 없습니다. 매일 기록해보세요!',
    },
    {
      icon: '🚽',
      title: '배변',
      summary: '기록 없음',
      insight: '배변일지를 꾸준히 기록하면 건강 패턴을 파악할 수 있어요.',
    },
    {
      icon: '💪',
      title: '컨디션',
      summary: '기록 없음',
      insight: '컨디션 기록이 없습니다. 매일 체크해보세요!',
    },
  ]

  return (
    <div className="report-section">
      {/* 헤더 */}
      <div className="report-section-header">
        <span className="report-section-badge">WEEKLY</span>
        <h2 className="report-section-title">주간 리포트</h2>
        {/* TODO: 실제 날짜 범위로 교체 */}
        <p className="report-section-period">기록된 날짜 범위가 표시됩니다</p>
      </div>

      {/* 주간 건강 점수 */}
      <div className="report-score-card">
        <div className="report-score-row">
          <span className="report-score-label">주간 건강 점수</span>
          <span className="report-score-value">
            {score !== null ? score : '—'}
            <span className="report-score-max"> / 100</span>
          </span>
        </div>
        <div className="report-score-bar-bg">
          <div className="report-score-bar" style={{ width: scoreWidth }} />
        </div>
      </div>

      {/* 식단 / 배변 / 컨디션 인사이트 */}
      <div className="report-insight-grid">
        {insights.map((item) => (
          <div key={item.title} className="report-insight-card">
            <div className="report-insight-card-header">
              <span className="report-insight-icon">{item.icon}</span>
              <p className="report-insight-title">{item.title} 요약</p>
            </div>
            <p className="report-insight-summary">{item.summary}</p>
            <div className="report-insight-box">
              <p className="report-insight-text">💡 {item.insight}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklyReport
