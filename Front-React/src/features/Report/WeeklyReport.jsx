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

const WeeklyReport = ({ data }) => {
  const score = data?.report_score ?? 0
  const diet = parseField(data?.report_diet)
  const bowel = parseField(data?.report_bowel)
  const condition = parseField(data?.report_condition)

  const periodText =
    data?.start_date && data?.end_date
      ? `${formatDate(data.start_date)} - ${formatDate(data.end_date)}`
      : data?.report_week_label || '이번 주 회복 데이터 요약'

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
                <strong>{score || '—'}%</strong>
                <span>우수</span>
              </div>
            </div>
          </div>

          <div className="soft-message-box">
            <p>
              {data?.report_comment ||
                '기록이 꾸준히 쌓일수록 회복 흐름을 더 정확히 파악할 수 있어요.'}
            </p>
          </div>
        </section>

        <section className="glass-card weekly-highlight-card">
          <span className="mini-title">이번 주 분석</span>
          <h3>7일간 꾸준한 기록 달성</h3>
          <p>
            매일 회복 데이터를 기록하여 의미 있는 주간 패턴을 만들어가고 있습니다.
          </p>

          <div className="metric-chip-grid">
            <div className="metric-chip">
              <span>평균 수면</span>
              <strong>7시간 45분</strong>
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
              <strong>{diet?.score ?? 92}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${diet?.score ?? 92}%` }}
              />
            </div>
          </div>

          <div className="mini-stat-grid">
            <div className="mini-stat-card">
              <span>단백질 섭취</span>
              <strong>{diet?.value || '65g / 목표 달성'}</strong>
            </div>
            <div className="mini-stat-card">
              <span>식이섬유 섭취</span>
              <strong>{bowel?.value || '28g / 적정 수준'}</strong>
            </div>
          </div>

          <div className="insight-pill-row">
            <span className="insight-pill green">
              {diet?.insight || '이번 주 소화 편의성이 개선되었습니다'}
            </span>
          </div>
        </section>

        <section className="glass-card report-feature-card">
          <h3>배변 및 컨디션 추이</h3>

          <div className="trend-box">
            <div className="trend-header">
              <span>브리스톨 척도 (평균)</span>
              <strong>4형</strong>
            </div>

            <div className="trend-badge-line">
              <span className="trend-badge active">
                {bowel?.score ?? '정상'}
              </span>
            </div>

            <p className="trend-copy">
              {bowel?.summary || '현재 배변 패턴은 비교적 안정적으로 유지되고 있어요.'}
            </p>
          </div>

          <div className="trend-mini-grid">
            <div>
              <span>피로도</span>
              <strong>2.4 / 10</strong>
            </div>
            <div>
              <span>통증</span>
              <strong>1.2 / 10</strong>
            </div>
          </div>

          <div className="bar-sparkline">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="report-note-inline">
            {condition?.summary ||
              '지난주보다 피로감이 감소하고 전반적인 컨디션이 안정적으로 유지되고 있습니다.'}
          </div>
        </section>
      </div>
    </div>
  )
}

export default WeeklyReport
