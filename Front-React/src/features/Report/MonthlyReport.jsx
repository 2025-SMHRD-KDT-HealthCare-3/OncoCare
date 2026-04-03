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

  const sections = [
    {
      title: 'Nutrition Summary',
      summary: diet?.summary || '이번 주 식단 기록이 아직 충분하지 않습니다.',
      insight:
        diet?.insight || '식단을 꾸준히 기록하면 회복 패턴을 더 정확히 볼 수 있어요.',
      tone: 'green',
    },
    {
      title: 'Bowel & Condition Trends',
      summary: bowel?.summary || '배변 기록이 충분하지 않습니다.',
      insight:
        condition?.insight || '컨디션과 함께 기록하면 회복 흐름을 더 잘 파악할 수 있어요.',
      extra: condition?.summary || '컨디션 기록 없음',
      tone: 'neutral',
    },
  ]

  return (
    <div className="report-view">
      <div className="report-header-block">
        <span className="report-view-badge weekly">WEEKLY INSIGHT</span>
        <h2>Weekly Wellness Report</h2>
        <p>{periodText}</p>
      </div>

      <div className="weekly-dashboard-grid">
        <section className="glass-card score-ring-card">
          <p className="mini-title">Overall Wellness Score</p>

          <div className="score-ring-wrap">
            <div
              className="score-ring"
              style={{
                background: `conic-gradient(#0a8a34 ${score * 3.6}deg, #e5e7df 0deg)`,
              }}
            >
              <div className="score-ring-inner">
                <strong>{score || '—'}%</strong>
                <span>EXCELLENT</span>
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
          <span className="mini-title">NEW MILESTONE REACHED</span>
          <h3>Consistent Logging for 7 Days</h3>
          <p>
            You’ve tracked your daily recovery data and built a meaningful weekly pattern.
          </p>

          <div className="metric-chip-grid">
            <div className="metric-chip">
              <span>AVG SLEEP</span>
              <strong>7h 45m</strong>
            </div>
            <div className="metric-chip">
              <span>HEART RATE</span>
              <strong>68 bpm</strong>
            </div>
            <div className="metric-chip">
              <span>DAILY STEPS</span>
              <strong>4,200</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="weekly-lower-grid">
        <section className="glass-card report-feature-card">
          <div className="feature-image fake-food-image" />
          <h3>{sections[0].title}</h3>

          <div className="progress-row">
            <div className="progress-label-line">
              <span>Meal Adherence</span>
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
              <span>PROTEIN INTAKE</span>
              <strong>{diet?.value || '65g / target met'}</strong>
            </div>
            <div className="mini-stat-card">
              <span>FIBER INTAKE</span>
              <strong>{bowel?.value || '28g / gentle level'}</strong>
            </div>
          </div>

          <div className="insight-pill-row">
            <span className="insight-pill green">
              {diet?.insight || 'Digestive comfort improved this week'}
            </span>
          </div>
        </section>

        <section className="glass-card report-feature-card">
          <h3>{sections[1].title}</h3>

          <div className="trend-box">
            <div className="trend-header">
              <span>BRISTOL STOOL SCALE (AVG)</span>
              <strong>Type 4</strong>
            </div>

            <div className="trend-badge-line">
              <span className="trend-badge active">
                {bowel?.score ?? 'IDEAL'}
              </span>
            </div>

            <p className="trend-copy">
              {bowel?.summary || '현재 배변 패턴은 비교적 안정적으로 유지되고 있어요.'}
            </p>
          </div>

          <div className="trend-mini-grid">
            <div>
              <span>FATIGUE</span>
              <strong>2.4 / 10</strong>
            </div>
            <div>
              <span>PAIN</span>
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

      <div className="report-bottom-actions">
        <button type="button" className="ghost-action-btn">
          Previous Week
        </button>
        <button type="button" className="primary-action-btn">
          Schedule Review
        </button>
      </div>
    </div>
  )
}

export default WeeklyReport