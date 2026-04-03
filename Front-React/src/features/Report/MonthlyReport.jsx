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

const MonthlyReport = ({ data, prevData }) => {
  const score     = data?.report_score ?? 0
  const prevScore = prevData?.report_score ?? 0
  const diff      = score - prevScore

  const diet      = parseField(data?.report_diet)
  const bowel     = parseField(data?.report_bowel)
  const condition = parseField(data?.report_condition)

  const monthLabel = data?.report_month
    ? `${data.report_month}월 회복 리포트`
    : data?.report_week_label || '이번 달 회복 데이터 요약'

  return (
    <div className="report-view">
      <div className="report-header-block">
        <span className="report-view-badge monthly">월간 인사이트</span>
        <h2>월간 건강 리포트</h2>
        <p>{monthLabel}</p>
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
                '꾸준한 기록과 관리로 회복이 진행되고 있습니다.'}
            </p>
          </div>
        </section>

        <section className="glass-card weekly-highlight-card">
          <span className="mini-title">전월 대비</span>
          <h3>
            {diff > 0
              ? `지난달보다 ${diff}점 향상되었습니다`
              : diff < 0
              ? `지난달보다 ${Math.abs(diff)}점 하락했습니다`
              : '지난달과 동일한 수준을 유지했습니다'}
          </h3>
          <p>
            이번 달의 식단, 배변, 컨디션 데이터를 종합 분석한 결과입니다.
          </p>

          <div className="metric-chip-grid">
            <div className="metric-chip">
              <span>이번달 점수</span>
              <strong>{score || '—'}점</strong>
            </div>
            <div className="metric-chip">
              <span>지난달 점수</span>
              <strong>{prevScore || '—'}점</strong>
            </div>
            <div className="metric-chip">
              <span>변화</span>
              <strong style={{ color: diff >= 0 ? '#0a8a34' : '#c0392b' }}>
                {diff > 0 ? `+${diff}` : diff}점
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className="weekly-lower-grid">
        <section className="glass-card report-feature-card">
          <div className="feature-image fake-food-image" />
          <h3>이번 달 영양 섭취</h3>

          <div className="progress-row">
            <div className="progress-label-line">
              <span>식단 준수율</span>
              <strong>{diet?.score ?? 0}%</strong>
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
              <span>식단 요약</span>
              <strong>{diet?.summary || '기록 없음'}</strong>
            </div>
            <div className="mini-stat-card">
              <span>식단 인사이트</span>
              <strong>{diet?.insight || '기록 없음'}</strong>
            </div>
          </div>
        </section>

        <section className="glass-card report-feature-card">
          <h3>배변 및 컨디션 추이</h3>

          <div className="trend-box">
            <div className="trend-header">
              <span>브리스톨 척도 (평균)</span>
              <strong>{bowel?.score ? `${bowel.score}형` : '4형'}</strong>
            </div>

            <div className="trend-badge-line">
              <span className="trend-badge active">
                {bowel?.status ?? '정상'}
              </span>
            </div>

            <p className="trend-copy">
              {bowel?.summary || '이번 달 배변 패턴을 분석한 데이터가 없습니다.'}
            </p>
          </div>

          <div className="trend-mini-grid">
            <div>
              <span>컨디션</span>
              <strong>{condition?.score ?? '—'} / 5</strong>
            </div>
            <div>
              <span>통증 여부</span>
              <strong>{condition?.pain ?? '정보 없음'}</strong>
            </div>
          </div>

          <div className="report-note-inline">
            {condition?.summary ||
              '이번 달 전반적인 컨디션 데이터를 확인할 수 없습니다.'}
          </div>
        </section>
      </div>
    </div>
  )
}

export default MonthlyReport
