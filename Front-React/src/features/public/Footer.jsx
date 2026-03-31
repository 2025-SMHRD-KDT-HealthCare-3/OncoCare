import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-brand">OncoCare</div>
        <div className="footer-section-title">contact</div>
        <p className="footer-text">
          이메일: oncocare@support.kr<br />
          운영시간: 평일 09:00 – 18:00 / 주말·공휴일 휴무
        </p>
      </div>

      <div className="footer-right">
        <div className="footer-section-title">서비스</div>
        <a className="footer-link" href="/HealthInfo">건강정보 관리</a>
        <a className="footer-link" href="/Main">식단 추천</a>
        <a className="footer-link" href="/Report">리포트</a>
      </div>
    </footer>
  )
}

export default Footer
