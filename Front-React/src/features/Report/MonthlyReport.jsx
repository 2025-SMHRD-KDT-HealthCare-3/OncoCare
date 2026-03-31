import './Report.css'

const parseField = (field) => {
  if (!field) return null
  if (typeof field === 'object') return field
  try { return JSON.parse(field) } catch { return { summary: field } }
}

const MonthlyReport = ({ data, prevData }) => {
  const score = data?.report_score ?? null
  const prevScore = prevData?.report_score ?? null
  const scoreWidth = score !== null ? `${score}%` : '0%'

  const scoreDiff = score !== null && prevScore !== null ? score - prevScore : null
  const diffClass = scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : ''
  const diffText = scoreDiff !== null
    ? `${scoreDiff > 0 ? '▲' : '▼'} ${Math.abs(scoreDiff)}점`
    : '—'

  const diet = parseField(data?.report_diet)
  const bowel = parseField(data?.report_bowel)
  const condition = parseField(data?.report_condition)

  const prevDiet = parseField(prevData?.report_diet)
  const prevBowel = parseField(prevData?.report_bowel)
  const prevCondition = parseField(prevData?.report_condition)

  const calcChange = (cur, prev) => {
    if (cur == null || prev == null) return { text: '—', cls: '' }
    const diff = cur - prev
    if (diff === 0) return { text: '변화 없음', cls: '' }
    return { text: `${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}`, cls: diff > 0 ? 'up' : 'down' }
  }

  const sections = [
    {
      icon: '🍽️',
      title: '식단',
      summary: diet?.summary || '이번 달 식단 기록이 없습니다.',
      insight: diet?.insight || '꾸준한 식단 기록이 건강 관리의 첫걸음이에요.',
      thisMonth: diet?.score ?? diet?.value ?? (diet?.summary ? '기록 있음' : '—'),
      lastMonth: prevDiet?.score ?? prevDiet?.value ?? (prevDiet?.summary ? '기록 있음' : '—'),
      ...calcChange(diet?.score, prevDiet?.score),
    },
    {
      icon: '🚽',
      title: '배변',
      summary: bowel?.summary || '이번 달 배변일지 기록이 없습니다.',
      insight: bowel?.insight || '배변 패턴을 기록하면 장 건강 변화를 한눈에 확인할 수 있어요.',
      thisMonth: bowel?.score ?? bowel?.value ?? (bowel?.summary ? '기록 있음' : '—'),
      lastMonth: prevBowel?.score ?? prevBowel?.value ?? (prevBowel?.summary ? '기록 있음' : '—'),
      ...calcChange(bowel?.score, prevBowel?.score),
    },
    {
      icon: '💪',
      title: '컨디션',
      summary: condition?.summary || '이번 달 컨디션 기록이 없습니다.',
      insight: condition?.insight || '매일 컨디션을 체크하면 회복 추이를 확인할 수 있어요.',
      thisMonth: condition?.score ?? condition?.value ?? (condition?.summary ? '기록 있음' : '—'),
      lastMonth: prevCondition?.score ?? prevCondition?.value ?? (prevCondition?.summary ? '기록 있음' : '—'),
      ...calcChange(condition?.score, prevCondition?.score),
    },
  ]

  const periodText = data?.report_month || '해당 월의 데이터가 표시됩니다'

  return (
    <div className="report-section">
      {/* 헤더 */}
      <div className="report-section-header">
        <span className="report-section-badge">MONTHLY</span>
        <h2 className="report-section-title">월간 리포트</h2>
        <p className="report-section-period">{periodText}</p>
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
                <p className={`report-compare-cell-value ${item.cls}`}>{item.text}</p>
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
        <p className="report-comment-text">
          {data?.report_comment || '데이터가 쌓이면 이달의 건강 총평과 칭찬 메시지가 여기에 표시됩니다.'}
        </p>
      </div>
    </div>
  )
}

export default MonthlyReport
