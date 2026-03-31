import './Report.css'

const parseField = (field) => {
  if (!field) return null
  if (typeof field === 'object') return field
  try { return JSON.parse(field) } catch { return { summary: field } }
}

const WeeklyReport = ({ data }) => {
  const score = data?.report_score ?? null
  const scoreWidth = score !== null ? `${score}%` : '0%'

  const diet = parseField(data?.report_diet)
  const bowel = parseField(data?.report_bowel)
  const condition = parseField(data?.report_condition)

  const insights = [
    {
      icon: '🍽️',
      title: '식단',
      summary: diet?.summary || '기록 없음',
      insight: diet?.insight || '이번 주 식단 데이터가 없습니다. 매일 기록해보세요!',
    },
    {
      icon: '🚽',
      title: '배변',
      summary: bowel?.summary || '기록 없음',
      insight: bowel?.insight || '배변일지를 꾸준히 기록하면 건강 패턴을 파악할 수 있어요.',
    },
    {
      icon: '💪',
      title: '컨디션',
      summary: condition?.summary || '기록 없음',
      insight: condition?.insight || '컨디션 기록이 없습니다. 매일 체크해보세요!',
    },
  ]
  const formatDate = (dateStr) => dateStr?.split('T')[0]

  const periodText = data?.start_date && data?.end_date? `${formatDate(data.start_date)} ~ ${formatDate(data.end_date)}`
  : data?.report_week_label || '기록된 날짜 범위가 표시됩니다'

  return (
    <div className="report-section">
      {/* 헤더 */}
      <div className="report-section-header">
        <span className="report-section-badge">WEEKLY</span>
        <h2 className="report-section-title">주간 리포트</h2>
        <p className="report-section-period">{periodText}</p>
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
