import './Report.css'

const parseField = (field) => {
  if (!field) return null
  if (typeof field === 'object') return field
  try {
    return JSON.parse(field)
  } catch {
    return { summary: field }
  }
}

const formatDate = (dateStr) => dateStr?.split('T')[0]

const getScoreLabel = (score) => {
  if (score >= 80) return '우수'
  if (score >= 60) return '양호'
  if (score >= 40) return '보통'
  return '주의'
}

const WeeklyReport = ({ data }) => {
  const score = data?.report_score ?? 0
  const diet = parseField(data?.report_diet)
  const bowel = parseField(data?.report_bowel)
  const condition = parseField(data?.report_condition)

  const periodText =
    data?.start_date && data?.end_date
      ? `${formatDate(data.start_date)} ~ ${formatDate(data.end_date)}`
      : data?.report_week_label || '이번 주 회복 데이터 요약'

  const highlightTitle = diet?.summary || condition?.summary || '이번 주 회복 데이터를 분석했습니다.'

  return (
    <div className="report-view">
      <div className="report-header-block">
        <span className="report-view-badge weekly">주간 인사이트</span>
        <h2>주간 건강 리포트</h2>
        <p>{periodText}</p>
      </div>

      <div className="weekly-dashboard-grid">
        <section className="glass-card score-ring-card">
          <p className="mini-title">종합 건강 점수</p>

          <div className="score-ring-wrap">
            <div
              className="score-ring"
              style={{
                background: `conic-gradient(#0a8a34 ${score * 3.6}deg, #e5e7df 0deg)`,
              }}
            >
              <div className="score-ring-inner">
                <strong>{data ? `${score}%` : '—'}</strong>
                <span>{data ? getScoreLabel(score) : '—'}</span>
              </div>
            </div>
          </div>

          <div className="soft-message-box">
            <p>{data?.report_comment || '기록이 꾸준히 쌓일수록 회복 흐름을 더 정확히 파악할 수 있어요.'}</p>
          </div>
        </section>

        <section className="glass-card weekly-highlight-card">
          <span className="mini-title">이번 주 분석</span>
          <h3>{data ? highlightTitle : '리포트를 생성하면 분석 결과가 표시됩니다.'}</h3>

          <div className="metric-chip-grid">
            <div className="metric-chip">
              <span>식단 점수</span>
              <strong>{diet?.score != null ? `${diet.score}점` : '—'}</strong>
            </div>
            <div className="metric-chip">
              <span>배변 상태</span>
              <strong>{bowel?.score != null ? `${bowel.score}형` : '—'}</strong>
            </div>
            <div className="metric-chip">
              <span>컨디션</span>
              <strong>{condition?.score != null ? `${condition.score}점` : '—'}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="weekly-lower-grid">
        <section className="glass-card report-feature-card">
          <div className="feature-image fake-food-image" />
          <h3>영양 섭취 요약</h3>

          <div className="progress-row">
            <div className="progress-label-line">
              <span>식단 준수율</span>
              <strong>{diet?.score != null ? `${diet.score}%` : '—'}</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${diet?.score ?? 0}%` }}
              />
            </div>
          </div>

          <div className="mini-stat-grid">
            <div className="mini-stat-card">
              <span>단백질 섭취</span>
              <strong>{diet?.value || '—'}</strong>
            </div>
            <div className="mini-stat-card">
              <span>식이섬유 섭취</span>
              <strong>{bowel?.value || '—'}</strong>
            </div>
          </div>

          {diet?.insight && (
            <div className="insight-pill-row">
              <span className="insight-pill green">{diet.insight}</span>
            </div>
          )}
        </section>

        <section className="glass-card report-feature-card">
          <h3>배변 및 컨디션 추이</h3>

          <div className="trend-box">
            <div className="trend-header">
              <span>브리스톨 척도 (평균)</span>
              <strong>{bowel?.score != null ? `${bowel.score}형` : '—'}</strong>
            </div>

            <div className="trend-badge-line">
              <span className="trend-badge active">
                {bowel?.status || '—'}
              </span>
            </div>

            <p className="trend-copy">
              {bowel?.summary || '—'}
            </p>
          </div>

          <div className="trend-mini-grid">
            <div>
              <span>피로도</span>
              <strong>{condition?.fatigue != null ? `${condition.fatigue} / 10` : '—'}</strong>
            </div>
            <div>
              <span>통증</span>
              <strong>{condition?.pain != null ? `${condition.pain} / 10` : '—'}</strong>
            </div>
          </div>

          {condition?.summary && (
            <div className="report-note-inline">{condition.summary}</div>
          )}
        </section>
      </div>
    </div>
  )
}

export default WeeklyReport
