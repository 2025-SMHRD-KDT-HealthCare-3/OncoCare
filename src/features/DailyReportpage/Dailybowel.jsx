import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './DailyReport.css'

const bristolLabels = {
  1: '1형 - 분리된 딱딱한 덩어리 (심한 변비)',
  2: '2형 - 울퉁불퉁한 소시지 모양 (경한 변비)',
  3: '3형 - 표면에 균열 있는 소시지 모양 (정상)',
  4: '4형 - 부드럽고 매끄러운 소시지 모양 (정상)',
  5: '5형 - 경계가 뚜렷한 부드러운 덩어리 (섬유질 부족)',
  6: '6형 - 경계가 불분명한 푹신한 덩어리 (경한 설사)',
  7: '7형 - 고형물 없는 액체 (심한 설사)',
}

const DailyBowel = () => {
  const [datetime, setDatetime] = useState('')
  const [bristolType, setBristolType] = useState(4)

  const handleSave = () => {
    // TODO: axios.post로 백엔드 저장 연결
    console.log({ datetime, bristolType })
    alert('저장되었습니다.')
  }

  return (
    <div className="daily-diet-card">
      <h2 className="daily-section-title">배변일지 등록</h2>
      <span className="daily-section-sub">배변 시간과 형태를 기록해주세요.</span>

      {/* 배변 일시 */}
      <div className="daily-diet-comment">
        <span className="daily-diet-label">배변 일시</span>
        <input
          type="datetime-local"
          className="form-control"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
        />
      </div>

      {/* 브리스톨 배변 척도 슬라이더 */}
      <div className="daily-diet-comment" style={{ marginTop: '16px' }}>
        <span className="daily-diet-label">배변 형태 (브리스톨 척도)</span>
        <input
          type="range"
          className="form-range"
          min={1}
          max={7}
          step={1}
          value={bristolType}
          onChange={(e) => setBristolType(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => <span key={n}>{n}</span>)}
        </div>
        <div className="form-control" style={{ marginTop: '8px', background: '#f8f9fa', color: '#333', fontSize: '14px' }}>
          {bristolLabels[bristolType]}
        </div>
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

export default DailyBowel
