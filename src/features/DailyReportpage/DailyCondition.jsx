import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './DailyReport.css'

const conditionLabels = {
  1: '통증 심함 / 거의 누워있음 / 식사 어려움',
  1.5 : '통증 있음 / 조금 움직이지만 힘듦 / 식사 매우 적음',
  2: '통증 있음 / 집 안 이동 가능 / 소화 불편 큼',
  2.5 : '통증 줄어듦 / 간단한 활동 가능 / 식사 조금 가능',
  3: '일상생활 가능 / 가벼운 산책 가능 / 소화는 아직 불안정',
  3.5: '비교적 안정 / 활동 증가 / 배변·소화 점점 정상화',
  4: '통증 거의 없음 / 식사 안정 / 활동 자유로움',
  4.5 : '거의 정상 / 피로만 약간 있음',
  5: '완전히 정상 상태 / 불편 없음',
}

const DailyCondition = () => {
  const [condition, setCondition] = useState(3)
  const [sleepHours, setSleepHours] = useState('')
  const [waterMl, setWaterMl] = useState('')
  const [hasPain, setHasPain] = useState(false)
  const [painLevel, setPainLevel] = useState(1)

  const handleSave = () => {
    // TODO: axios.post로 백엔드 저장 연결
    console.log({ condition, sleepHours, waterMl, hasPain, painLevel: hasPain ? painLevel : null })
    alert('저장되었습니다.')
  }

  return (
    <div className="daily-diet-card">
      <h2 className="daily-section-title">컨디션 기록</h2>
      <span className="daily-section-sub">오늘의 컨디션을 기록해주세요.</span>

      {/* 기분/피로도 */}
      <div className="daily-diet-comment">
        <span className="daily-diet-label">기분 / 피로도</span>
        <input
          type="range"
          className="form-range"
          min={1}
          max={5}
          step={0.5}
          value={condition}
          onChange={(e) => setCondition(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
          {[1,1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((n) => <span key={n}>{n}</span>)}
        </div>
        <div className="form-control" style={{ marginTop: '8px', background: '#f8f9fa', color: '#333', fontSize: '14px' }}>
          {condition}단계 — {conditionLabels[condition]}
        </div>
      </div>

      {/* 수면시간 */}
      <div className="daily-diet-comment" style={{ marginTop: '16px' }}>
        <span className="daily-diet-label">수면 시간 (시간)</span>
        <input
          type="number"
          className="form-control"
          min={0}
          max={24}
          step={0.5}
          placeholder="예: 7.5"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
        />
      </div>

      {/* 물 섭취량 */}
      <div className="daily-diet-comment" style={{ marginTop: '16px' }}>
        <span className="daily-diet-label">물 섭취량 (ml)</span>
        <input
          type="number"
          className="form-control"
          min={0}
          step={200}
          placeholder="예: 1500"
          value={waterMl}
          onChange={(e) => setWaterMl(e.target.value)}
        />
      </div>

      {/* 복통 여부 토글 */}
      <div className="daily-diet-comment" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="daily-diet-label" style={{ marginBottom: 0 }}>복통 여부</span>
          <div className="form-check form-switch" style={{ margin: 0 }}>
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={hasPain}
              onChange={(e) => setHasPain(e.target.checked)}
            />
          </div>
          <span style={{ fontSize: '14px', color: hasPain ? '#e74c3c' : '#888' }}>
            {hasPain ? '있음' : '없음'}
          </span>
        </div>

        {/* 통증 정도 (토글 열릴 때만 표시) */}
        {hasPain && (
          <div style={{ marginTop: '12px' }}>
            <span className="daily-diet-label">통증 정도 (1~5)</span>
            <input
              type="range"
              className="form-range"
              min={1}
              max={5}
              step={1}
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
            </div>
            <div className="form-control" style={{ marginTop: '8px', background: '#fff0f0', color: '#c0392b', fontSize: '14px' }}>
              통증 {painLevel}단계
            </div>
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <button
        className="btn daily-diet-save-btn"
        onClick={handleSave}
        style={{ marginTop: '16px' }}
      >
        저장
      </button>
    </div>
  )
}

export default DailyCondition
