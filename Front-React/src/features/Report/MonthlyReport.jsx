import './Report.css'

const getScoreLabel = (score) => {
  if (score >= 80) return '우수'
  if (score >= 60) return '양호'
  if (score >= 40) return '보통'
  return '주의'
}

const parseScoreList = (raw) => {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n))
}

const WeeklyBarChart = ({ scores }) => {
  if (!scores || scores.length === 0) return null

  const max = 100
  const barColors = ['#c5dfc9', '#9ecba4', '#6db87b', '#3da358', '#0a8a34']

  return (
    <div className="monthly-bar-chart">
      {scores.map((score, i) => (
        <div key={i} className="monthly-bar-col">
          <span className="monthly-bar-score">{score}</span>
          <div className="monthly-bar-track">
            <div
              className="monthly-bar-fill"
              style={{
                height: `${(score / max) * 100}%`,
                background: barColors[i] ?? '#0a8a34',
              }}
            />
          </div>
          <span className="monthly-bar-label">{i + 1}주</span>
        </div>
      ))}
    </div>
  )
}

const MonthlyReport = ({ data, prevData }) => {
  const score     = data?.report_score ?? 0
  const prevScore = prevData?.report_score ?? null
  const diff      = prevScore != null ? score - prevScore : null
  const scores    = parseScoreList(data?.report_score_list)

  const periodLabel = data?.report_month_label || data?.report_month || '이번 달'

  return (
    <div className="report-view">
      {/* 헤더 */}
      <div className="report-header-block">
        <span className="report-view-badge monthly">월간 인사이트</span>
        <h2>{data?.report_title || '월간 건강 리포트'}</h2>
        <p>{periodLabel} 회복 데이터 요약</p>
      </div>

      {/* 상단: 점수 링 + 주간별 바 차트 */}
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
                <strong>{data ? score : '—'}</strong>
                <span>{data ? getScoreLabel(score) : '—'}</span>
              </div>
            </div>
          </div>

          {/* 전월 대비 */}
          <div className="monthly-diff-chips">
            <div className="score-stat-chip">
              <span>이번 달</span>
              <strong style={{ color: '#0a8a34' }}>{data ? score : '—'}</strong>
            </div>
            <div className="score-stat-chip">
              <span>지난 달</span>
              <strong>{prevScore ?? '—'}</strong>
            </div>
            <div className="score-stat-chip">
              <span>변화</span>
              <strong style={{ color: diff == null ? 'inherit' : diff >= 0 ? '#0a8a34' : '#c0392b' }}>
                {diff == null ? '—' : diff > 0 ? `+${diff}` : `${diff}`}
              </strong>
            </div>
          </div>
        </section>

        <section className="glass-card weekly-chart-card">
          <p className="mini-title">주간별 점수 추이</p>
          {scores.length > 0 ? (
            <>
              <WeeklyBarChart scores={scores} />
              {data?.report_score_list_comment && (
                <p className="monthly-chart-comment">{data.report_score_list_comment}</p>
              )}
              <div className="score-list-stat-row" style={{ marginTop: 14 }}>
                <div className="score-stat-chip">
                  <span>최고</span>
                  <strong>{Math.max(...scores)}</strong>
                </div>
                <div className="score-stat-chip">
                  <span>최저</span>
                  <strong>{Math.min(...scores)}</strong>
                </div>
                <div className="score-stat-chip">
                  <span>평균</span>
                  <strong>{Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="report-empty-state" style={{ minHeight: 140 }}>
              <p>점수 기록이 없습니다.</p>
            </div>
          )}
        </section>
      </div>

      {/* 종합 코멘트 */}
      {data?.report_comment && (
        <div className="weekly-comment-box">
          <span className="weekly-comment-icon">💬</span>
          <p>{data.report_comment}</p>
        </div>
      )}

      {/* 식단 / 배변 / 컨디션 텍스트 카드 */}
      <div className="weekly-text-grid">
        <section className="glass-card weekly-text-card">
          <div className="weekly-text-card-header">
            <span className="weekly-text-icon">🥗</span>
            <h3>식단</h3>
          </div>
          <p>{data?.report_diet || '기록 없음'}</p>
        </section>

        <section className="glass-card weekly-text-card">
          <div className="weekly-text-card-header">
            <span className="weekly-text-icon">🚽</span>
            <h3>배변</h3>
          </div>
          <p>{data?.report_bowel || '기록 없음'}</p>
        </section>

        <section className="glass-card weekly-text-card">
          <div className="weekly-text-card-header">
            <span className="weekly-text-icon">💪</span>
            <h3>컨디션</h3>
          </div>
          <p>{data?.report_condition || '기록 없음'}</p>
        </section>
      </div>

      {!data && (
        <div className="report-empty-state">
          <p>
            아직 월간 리포트가 없습니다.<br />
            위의 <strong>월간 레포트 생성</strong> 버튼을 눌러 생성해보세요.
          </p>
        </div>
      )}
    </div>
  )
}

export default MonthlyReport
