import { useState } from 'react'
import './DailyReport.css'

const conditionLabels = {
  1: '통증 심함 / 거의 누워있음 / 식사 어려움',
  1.5: '통증 있음 / 조금 움직이지만 힘듦 / 식사 매우 적음',
  2: '통증 있음 / 집 안 이동 가능 / 소화 불편 큼',
  2.5: '통증 줄어듦 / 간단한 활동 가능 / 식사 조금 가능',
  3: '일상생활 가능 / 가벼운 산책 가능 / 소화는 아직 불안정',
  3.5: '비교적 안정 / 활동 증가 / 배변·소화 점점 정상화',
  4: '통증 거의 없음 / 식사 안정 / 활동 자유로움',
  4.5: '거의 정상 / 피로만 약간 있음',
  5: '완전히 정상 상태 / 불편 없음',
}

const getConditionBadge = (val) => {
  if (val <= 2) return 'high'
  if (val <= 3) return 'moderate'
  return 'minimal'
}

const getConditionBadgeLabel = (val) => {
  if (val <= 2) return '심함'
  if (val <= 3) return '보통'
  if (val <= 4) return '양호'
  return '좋음'
}

const getPainBadge = (val) => {
  if (val >= 4) return 'high'
  if (val >= 3) return 'moderate'
  return 'minimal'
}

const getPainBadgeLabel = (val) => {
  if (val >= 4) return '심한 통증'
  if (val >= 3) return '보통'
  if (val >= 2) return '약한 통증'
  return '미미함'
}

const DailyCondition = ({
  condition, setCondition,
  sleepTime, setSleepTime,
  waterIntake, setWaterIntake,
  stomachPain, setStomachPain,
  painLevel, setPainLevel,
  conditionData,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false)

  if (conditionData && !isEditing) {
    return (
      <div className="dr-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 className="dr-card-title">💪 Physical Vitality</h2>
          <button className="dr-cancel-btn" onClick={() => setIsEditing(true)}>수정</button>
        </div>
        <span className="dr-section-label">오늘 저장된 컨디션 기록입니다</span>

        <div className="dr-info-row">
          <span className="dr-info-label">기분 / 피로도</span>
          <span className="dr-info-value">{conditionData.condition_score}단계 — {conditionLabels[conditionData.condition_score] || ''}</span>
        </div>
        <div className="dr-info-row">
          <span className="dr-info-label">물 섭취량</span>
          <span className="dr-info-value">{conditionData.water_intake} ml</span>
        </div>
        <div className="dr-info-row">
          <span className="dr-info-label">복통 여부</span>
          <span className={`dr-info-value ${conditionData.stomach_pain === 'Y' ? 'danger' : ''}`}>
            {conditionData.stomach_pain === 'Y' ? `있음 — 통증 ${conditionData.stomach_score}단계` : '없음'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="dr-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h2 className="dr-card-title">💪 Physical Vitality</h2>
        {conditionData && (
          <button className="dr-cancel-btn" onClick={() => setIsEditing(false)}>취소</button>
        )}
      </div>
      <span className="dr-section-label">오늘의 컨디션을 기록해주세요</span>

      <div className="dr-vitality-grid">
        {/* 기분/피로도 */}
        <div className="dr-vitality-sub">
          <div className="dr-vitality-sub-title">피로도</div>
          <span className={`dr-vitality-badge ${getConditionBadge(condition)}`}>
            {getConditionBadgeLabel(condition)}
          </span>
          <input
            type="range"
            className="dr-slider"
            min={1} max={5} step={0.5}
            value={condition}
            onChange={(e) => setCondition(Number(e.target.value))}
          />
          <div className="dr-slider-labels">
            <span>매우 피곤</span>
            <span>활력 있음</span>
          </div>
        </div>

        {/* 복통 */}
        <div className="dr-vitality-sub">
          <div className="dr-vitality-sub-title">복통 / 불편감</div>
          <span className={`dr-vitality-badge ${stomachPain ? getPainBadge(painLevel) : 'minimal'}`}>
            {stomachPain ? getPainBadgeLabel(painLevel) : '없음'}
          </span>
          <input
            type="range"
            className="dr-slider"
            min={1} max={5} step={1}
            value={stomachPain ? painLevel : 1}
            onChange={(e) => {
              setStomachPain(true)
              setPainLevel(Number(e.target.value))
            }}
          />
          <div className="dr-slider-labels">
            <span>통증 없음</span>
            <span>심한 통증</span>
          </div>
        </div>
      </div>

      <div className="dr-form-row">
        <div className="dr-form-group">
          <label className="dr-form-label">수면 시간 (h)</label>
          <input
            type="number"
            className="dr-form-input"
            min={0} max={24} step={0.5}
            placeholder="예: 7.5"
            value={sleepTime}
            onChange={(e) => {
              const val = e.target.value
              if (val === '') { setSleepTime(''); return }
              const num = parseFloat(val)
              if (num > 24) return
              setSleepTime(val)
            }}
          />
        </div>
        <div className="dr-form-group">
          <label className="dr-form-label">물 섭취량 (ml)</label>
          <input
            type="number"
            className="dr-form-input"
            min={0} max={9999} step={1}
            placeholder="예: 1500"
            value={waterIntake}
            onChange={(e) => {
              const val = e.target.value
              if (val === '') { setWaterIntake(''); return }
              if (val.includes('.')) return
              if (parseInt(val) >= 10000) return
              setWaterIntake(val)
            }}
          />
        </div>
      </div>

      <div className="dr-toggle-row">
        <span className="dr-form-label">복통 여부</span>
        <div className="form-check form-switch" style={{ margin: 0 }}>
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={stomachPain}
            onChange={(e) => setStomachPain(e.target.checked)}
          />
        </div>
        <span style={{ fontSize: '13px', color: stomachPain ? '#e74c3c' : '#8a9189', fontWeight: 600 }}>
          {stomachPain ? '있음' : '없음'}
        </span>
      </div>

      <button
        className="dr-save-btn full"
        onClick={() => { onSave(); setIsEditing(false) }}
      >
        저장
      </button>
    </div>
  )
}

export default DailyCondition
