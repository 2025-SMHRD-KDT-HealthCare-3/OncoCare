import './ReportLoading.css'

const ReportLoading = ({ message = '리포트를 생성하고 있습니다...' }) => {
  return (
    <div className="report-loading-overlay">
      <div className="report-loading-box">
        <div className="report-loading-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>
        <p className="report-loading-title">{message}</p>
        <p className="report-loading-sub">AI가 데이터를 분석 중입니다. 잠시만 기다려주세요.</p>
        <div className="report-loading-bar">
          <div className="report-loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}

export default ReportLoading
