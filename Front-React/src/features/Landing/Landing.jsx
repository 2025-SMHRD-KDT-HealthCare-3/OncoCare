import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { ChevronRight } from 'lucide-react';
import oncoCareIcon from '../../assets/oncocare_icon.png';
import Footer from '../public/Footer';

/**
 * oncocare Landing Page Component
 * Design: Warm Minimalism with Human Touch
 * Target: Elderly colorectal cancer patients post-discharge
 */

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-container">
      {/* Header */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-header-content">
          <div className="landing-logo">
            <img src={oncoCareIcon} alt="oncocare logo" className="landing-logo-icon" />
            <h1 className="logo-text">OncoCare</h1>
          </div>

          <nav className="landing-nav">
            <a href="#features">기능</a>
            <a href="#how-it-works">사용 방법</a>
            <a href="#reports">리포트</a>
          </nav>

          <button className="landing-cta-button" onClick={() => navigate('/intro')}>시작하기</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          {/* Left Content */}
          <div className="landing-hero-text animate-fade-in">
            <h2 className="landing-hero-title">
              회복을 위한   <br /><span className="text-primary">당신만의 치유 공간</span>
            </h2>
            <p className="landing-hero-subtitle">
              냉장고 재고와 건강정보를 기반으로 맞춤형 식단을 추천받고, 
              <br />
              일일 피드백과 리포트로 회복 과정을 함께합니다.
            </p>

            <div className="landing-hero-buttons">
              <button className="landing-button primary" onClick={() => navigate('/intro')}>
                지금 시작하기
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="landing-trust-section">
              <p className="landing-trust-title">이런 분들을 위해 만들었습니다</p>
              <ul className="landing-trust-list">
                <li>
                  <div className="trust-dot"></div>
                  대장암 수술 후 식단 관리가 어려운 분
                </li>
                <li>
                  <div className="trust-dot"></div>
                  냉장고에 뭐가 있는지 잘 모르시는 분
                </li>
                <li>
                  <div className="trust-dot"></div>
                  회복 과정을 체계적으로 관리하고 싶으신 분
                </li>
              </ul>
            </div>
          </div>

          {/* Right Image */}
          <div className="landing-hero-image animate-fade-in-delayed">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448006131/m9ykw8pxoudomePpQokfJ3/hero-kitchen-jadzpL2y65CanXFpJu7z8i.webp"
              alt="건강한 냉장고 관리"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <h2>OncoCare의 주요 기능</h2>
          <p>간단한 입력으로 시작해서, 체계적인 관리까지. 모든 과정이 쉽고 편합니다.</p>
        </div>

        {/* Feature 1: Refrigerator */}
        <div className="landing-feature-item">
          <div className="landing-feature-image">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448006131/m9ykw8pxoudomePpQokfJ3/feature-refrigerator-eWBtGtWFdLhHpph8hdggjJ.webp"
              alt="냉장고 재고"
            />
          </div>
          <div className="landing-feature-text">
            <h3>냉장고 재고 등록</h3>
            <p>
              사진이나 수기로 냉장고 안의 음식을 간단하게 등록하세요. 어렵지 않습니다. 신선한 채소부터 단백질까지, 현재 가지고 있는 모든 음식을 한눈에 관리할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Feature 2: Health Information */}
        <div className="landing-feature-item reverse">
          <div className="landing-feature-text">
            <h3>건강정보 관리</h3>
            <p>
              현재 건강 상태, 식이 제한사항, 알레르기 등을 한 번만 등록하세요. 혈압, 복용 중인 약물, 의료 이력까지 모두 안전하게 보관되어 맞춤형 식단 추천에 활용됩니다.
            </p>
          </div>
          <div className="landing-feature-image">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448006131/m9ykw8pxoudomePpQokfJ3/feature-health-info-HcPo8SuNHKM5g4EtdP9jnx.webp"
              alt="건강정보 관리"
            />
          </div>
        </div>

        {/* Feature 3: Meal Recommendations */}
        <div className="landing-feature-item">
          <div className="landing-feature-image">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448006131/m9ykw8pxoudomePpQokfJ3/feature-meal-planning-8LVbP9S6VERKagY57FjJxh.webp"
              alt="식단 추천"
            />
          </div>
          <div className="landing-feature-text">
            <h3>맞춤형 식단 추천</h3>
            <p>
              냉장고 재고와 건강정보를 바탕으로 최적의 식단을 추천해드립니다. 영양 균형을 고려하면서도 현재 가진 음식으로 만들 수 있는 요리를 제안합니다.
            </p>
          </div>
        </div>

        {/* Feature 4: Daily Tracking */}
        <div className="landing-feature-item reverse">
          <div className="landing-feature-text">
            <h3>일일 기록 및 피드백</h3>
            <p>
              식단 준수, 배변 기록, 컨디션을 매일 기록하고 피드백을 받으세요. 작은 성취도 축하해주며, 회복 과정의 모든 순간을 함께합니다.
            </p>
          </div>
          <div className="landing-feature-image">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448006131/m9ykw8pxoudomePpQokfJ3/feature-daily-tracking-Kk6JXDbmU6LKpzWTreH64f.webp"
              alt="일일 기록"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-how-it-works">
        <div className="landing-section-header">
          <h2>사용 방법</h2>
          <p>4단계로 시작하는 건강한 식탁 관리</p>
        </div>

        <div className="landing-steps">
          {[
            { step: 1, title: '가입하기', description: '간단한 정보로 회원가입을 완료하세요.' },
            { step: 2, title: '건강정보 등록', description: '현재 건강 상태와 식이 제한사항을 입력하세요.' },
            { step: 3, title: '냉장고 등록', description: '냉장고 안의 음식을 사진이나 수기로 등록하세요.' },
            { step: 4, title: '식단 추천 받기', description: '맞춤형 식단 추천을 받고 매일 기록하세요.' },
          ].map((item) => (
            <div key={item.step} className="landing-step">
              <div className="step-number">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reports Section */}
      <section id="reports" className="landing-reports">
        <div className="landing-section-header">
          <h2>회복 과정을 한눈에</h2>
          <p>일일, 주간, 월간 리포트로 회복 과정을 체계적으로 관리하세요.</p>
        </div>

        {/* Large Report Preview */}
        <div className="landing-report-preview">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448006131/m9ykw8pxoudomePpQokfJ3/feature-daily-report-full-aWnniEWtpSC6jcD7bqrooF.webp"
            alt="리포트 미리보기"
          />
        </div>

        {/* Report Details */}
        <div className="landing-report-details">
          {[
            { title: '일일 리포트', description: '오늘의 식단 준수율, 배변 기록, 컨디션을 확인하세요.' },
            { title: '주간 리포트', description: '한 주간의 식단 준수 추이와 건강 지표를 분석합니다.' },
            { title: '월간 리포트', description: '한 달간의 회복 과정을 종합적으로 평가합니다.' },
          ].map((report, idx) => (
            <div key={idx} className="landing-report-card">
              <h3>{report.title}</h3>
              <p>{report.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <h2>지금 시작하세요</h2>
        <p>건강한 회복을 위해 oncocare와 함께하세요. 첫 번째 식단 추천은 지금 바로 받을 수 있습니다.</p>
        <button className="landing-button cta" onClick={() => navigate('/intro')}>
          무료로 시작하기
          <ChevronRight size={20} />
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
