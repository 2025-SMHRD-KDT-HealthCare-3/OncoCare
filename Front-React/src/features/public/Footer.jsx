import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand-area">
          <div className="footer-brand">OncoCare</div>
          <div className="footer-brand-tagline">대장암 환자를 위한 맞춤 식단 플랫폼</div>
          <div className="footer-badge">
            <span>✦</span>
            <span>치유의 성소</span>
          </div>
        </div>

        <div className="footer-section">
          <div className="footer-section-title">문의</div>
          <p className="footer-text">
            oncocare@support.kr<br />
            평일 09:00 – 18:00
          </p>
        </div>

        <div className="footer-section">
          <div className="footer-section-title">서비스</div>
          <a className="footer-link" href="/HealthInfo">건강정보 관리</a>
          <a className="footer-link" href="/Main">식단 추천</a>
          <a className="footer-link" href="/Report">리포트</a>
        </div>

      </div>

      <div className="footer-bottom">
        <span className="footer-copy">© 2025 OncoCare. 모든 권리 보유.</span>
        <div className="footer-meta-links">
          <a className="footer-meta-link" href="#">개인정보처리방침</a>
          <a className="footer-meta-link" href="#">이용약관</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
