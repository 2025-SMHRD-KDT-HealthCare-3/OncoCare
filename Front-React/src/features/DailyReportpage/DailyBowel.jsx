import './DailyReport.css'

const bristolLabels = {
  1: '분리된 딱딱한 덩어리 (심한 변비)',
  2: '울퉁불퉁한 소시지 모양 (경한 변비)',
  3: '표면에 균열 있는 소시지 모양 (정상)',
  4: '부드럽고 매끄러운 소시지 모양 (정상)',
  5: '경계가 뚜렷한 부드러운 덩어리 (섬유질 부족)',
  6: '경계가 불분명한 푹신한 덩어리 (경한 설사)',
  7: '고형물 없는 액체 (심한 설사)',
}

const DailyBowel = ({
  defecationTime, setDefecationTime,
  defecationType, setDefecationType,
  bowelList,
  onSave,
  onDelete
}) => {
  return (
    <div className="dr-card">
      <h2 className="dr-card-title">📊 Digestive Log</h2>

      <span className="dr-bristol-section-label">Bristol Stool Scale</span>
      <div className="dr-bristol-row">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            className={`dr-bristol-btn ${defecationType === n ? 'active' : ''}`}
            onClick={() => setDefecationType(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="dr-bristol-desc">
        "{bristolLabels[defecationType]}"
      </div>

      <div className="dr-form-row">
        <div className="dr-form-group">
          <label className="dr-form-label">Time</label>
          <input
            type="time"
            className="dr-form-input"
            step="1800"
            value={defecationTime}
            onChange={(e) => setDefecationTime(e.target.value)}
          />
        </div>
      </div>

      <button className="dr-save-btn full" onClick={onSave}>
        저장
      </button>

      {bowelList && bowelList.length > 0 && (
        <div className="dr-bowel-list">
          <span className="dr-bowel-list-label">Observations</span>
          {bowelList.map((item) => (
            <div key={item.bowel_idx} className="dr-bowel-item">
              <span className="dr-bowel-time">{item.bowel_time}</span>
              <span className="dr-bowel-status">{item.bowel_status}</span>
              <button
                className="dr-bowel-del"
                onClick={() => onDelete(item.bowel_idx)}
                title="삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DailyBowel
