import React, { useState } from 'react'
import { BsCamera, BsPencil } from 'react-icons/bs'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Fridge.css'
import '../public/root.css'

// TODO: axios로 백엔드에서 식재료 목록 받아오기
const dummyIngredients = [
  { id: 1, name: '식재료1', desc: '유통기한: 2026-04-01', warning: false },
  { id: 2, name: '식재료2', desc: '유통기한이 임박합니다', warning: true },
  { id: 3, name: '식재료3', desc: '유통기한: 2026-05-10', warning: false },
  { id: 4, name: '식재료4', desc: '유통기한: 2026-04-20', warning: false },
  { id: 5, name: '식재료5', desc: '유통기한: 2026-03-30', warning: false },
  { id: 6, name: '식재료6', desc: '유통기한: 2026-06-01', warning: false },
]

const FridgeBody = () => {
  const [ingredients] = useState(dummyIngredients)

  return (
    <div className="main-content">
      {/* 히어로 배너 */}
      <div className="fridge-hero">
        <h1 className="fridge-hero-title">냉장고 인벤토리</h1>
        <p className="fridge-hero-sub">나의 냉장고 속 식재료를 관리하세요.</p>
      </div>

      <div className="fridge-content">
        {/* 섹션 헤더 */}
        <div className="fridge-section-header">
          <h2 className="fridge-section-title">냉장고 인벤토리</h2>
          <p className="fridge-section-sub">현재 보유 중인 식재료 목록이에요.</p>
        </div>

        {/* 식재료 카드 그리드 */}
        <div className="fridge-grid">
          {ingredients.map((item) => (
            <div key={item.id} className="fridge-card">
              <div className="fridge-card-img-placeholder" />
              <div className="fridge-card-info">
                <h5 className="fridge-card-name">{item.name}</h5>
                <p className={`fridge-card-desc ${item.warning ? 'warning' : ''}`}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default FridgeBody
