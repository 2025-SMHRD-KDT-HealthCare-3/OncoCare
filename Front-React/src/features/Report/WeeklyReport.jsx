import './Report.css'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

const formatDate = (dateStr) => dateStr?.split('T')[0]

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

const ScoreLineChart = ({ scores }) => {
  if (!scores || scores.length === 0) return null

  const W = 420
  const H = 120
  const padX = 28
  const padY = 16
  const innerW = W - padX * 2
  const innerH = H - padY * 2

  const min = Math.max(0, Math.min(...scores) - 10)
  const max = Math.min(100, Math.max(...scores) + 10)

  const toX = (i) => padX + (i / (scores.length - 1)) * innerW
  const toY = (v) => padY + innerH - ((v - min) / (max - min)) * innerH

  const points = scores.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const areaPoints = [
    `${toX(0)},${H - padY}`,
    ...scores.map((v, i) => `${toX(i)},${toY(v)}`),
    `${toX(scores.length - 1)},${H - padY}`,
  ].join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="score-line-chart-svg">
      {/* area fill */}
      <polygon points={areaPoints} fill="rgba(10,138,52,0.08)" />

      {/* grid lines */}
      {[0, 0.5, 1].map((t) => {
        const y = padY + innerH * (1 - t)
        return (
          <line
            key={t}
            x1={padX} y1={y} x2={W - padX} y2={y}
            stroke="#e5e7df" strokeWidth="1"
          />
        )
      })}

      {/* line */}
      <polyline
        points={points}
        fill="none"
        stroke="#0a8a34"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* dots + score labels */}
      {scores.map((v, i) => (
        <g key={i}>
          <circle
            cx={toX(i)} cy={toY(v)} r="5"
            fill="#fff" stroke="#0a8a34" strokeWidth="2.5"
          />
          <text
            x={toX(i)} y={toY(v) - 9}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#0a8a34"
          >
            {v}
          </text>
        </g>
      ))}

      {/* day labels */}
      {scores.map((_, i) => (
        <text
          key={i}
          x={toX(i)} y={H + 16}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#aaa"
        >
          {DAY_LABELS[i] ?? i + 1}
        </text>
      ))}
    </svg>
  )
}

const WeeklyReport = ({ data }) => {
  const score = data?.report_score ?? 0
  const scores = parseScoreList(data?.report_score_list)

  const periodText =
    data?.start_date && data?.end_date
      ? `${formatDate(data.start_date)} ~ ${formatDate(data.end_date)}`
      : data?.report_week_label || '이번 주 회복 데이터 요약'

  return (
    <div className="report-view">
      {/* 헤더 */}
      <div className="report-header-block">
        <span className="report-view-badge weekly">주간 인사이트</span>
        <h2>{data?.report_title || '주간 건강 리포트'}</h2>
        <p>{periodText}</p>
      </div>

      {/* 상단: 점수 링 + 라인차트 */}
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
          {data?.report_week_label && (
            <div className="weekly-label-badge">{data.report_week_label}</div>
          )}
        </section>

        <section className="glass-card weekly-chart-card">
          <p className="mini-title">이번 주 일별 점수</p>
          {scores.length > 0 ? (
            <ScoreLineChart scores={scores} />
          ) : (
            <div className="report-empty-state" style={{ minHeight: 140 }}>
              <p>점수 기록이 없습니다.</p>
            </div>
          )}
          {scores.length > 0 && (
            <div className="score-list-stat-row">
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

      {/* 하단: 식단 / 배변 / 컨디션 텍스트 카드 */}
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
            아직 주간 리포트가 없습니다.<br />
            위의 <strong>주간 레포트 생성</strong> 버튼을 눌러 생성해보세요.
          </p>
        </div>
      )}
    </div>
  )
}

export default WeeklyReport
