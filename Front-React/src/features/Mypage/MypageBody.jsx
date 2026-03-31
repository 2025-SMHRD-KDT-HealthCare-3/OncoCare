import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './MypageBody.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../public/root.css'

const MypageBody = () => {
  const navigate = useNavigate()

  return (
    <div className='main-content'>
        <div className="mypage-wrapper">

            <div className="fridge-hero">
                <h1 className="fridge-hero-title">My Page</h1>
                <p className="fridge-hero-sub">나의 정보를 관리하세요.</p>
            </div>
        {/* ── 프로필 관리 ── */}
        <section className="mypage-section">
            <h2 className="mypage-section-title">프로필 관리</h2>
            <p className="mypage-section-sub">내 정보를 확인하고 수정할 수 있어요.</p>

            <div className="mypage-card-row">
            {/* 개인정보 */}
            <div className="mypage-info-card" onClick={() => navigate('/PersonalInfo')} style={{ cursor: 'pointer' }}>
                <h5 className="mypage-info-title">개인정보</h5>
                <p className="mypage-info-desc">이름, 이메일, 연락처 등 기본 정보를 관리합니다.</p>
            </div>

            {/* 건강정보 */}
            <div className="mypage-info-card" onClick={() => navigate('/HealthInfo')} style={{ cursor: 'pointer' }}>
                <h5 className="mypage-info-title">건강정보</h5>
                <p className="mypage-info-desc">암 종류, 치료 단계, 체중 등 건강 관련 정보를 관리합니다.</p>
            </div>
            </div>
        </section>

        {/* ── 건강 데이터 리포트 ── */}
        <section className="mypage-section">
            <h2 className="mypage-section-title">건강 데이터 리포트</h2>
            <p className="mypage-section-sub">나의 건강 기록을 한눈에 확인하세요.</p>

            {/* 일일 레포트 */}
            <div className="mypage-report-card">
            <div className="mypage-report-img-placeholder" />
            <div className="mypage-report-content">
                <h5 className="mypage-info-title">주간 레포트</h5>
                <p className="mypage-info-desc">이번주의 식단, 배변, 컨디션 기록을 요약해서 보여줍니다.</p>
                <button
                className="btn mypage-report-btn"
                onClick={() => navigate('/Report')}
                >
                바로가기
                </button>
            </div>
            </div>

            {/* 월간 레포트 */}
            <div className="mypage-report-card">
            <div className="mypage-report-img-placeholder" />
            <div className="mypage-report-content">
                <h5 className="mypage-info-title">월간 레포트</h5>
                <p className="mypage-info-desc">한 달간의 건강 데이터를 통계로 확인할 수 있습니다.</p>
                <button
                className="btn mypage-report-btn"
                onClick={() => navigate('/Report#monthly')}
                >
                바로가기
                </button>
            </div>
            </div>
        </section>

        </div>
    </div>
  )
}

export default MypageBody
