import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Fridge.css'
import '../public/root.css'

const categoryIcon = {
  '채소': '🥬', '야채': '🥬',
  '과일': '🍎',
  '단백질': '🥩', '육류': '🥩', '어류': '🐟',
  '유제품': '🥛',
  '곡물': '🌾', '탄수화물': '🌾',
  '기타': '📦',
}

const getIcon = (type) => categoryIcon[type] || '📦'

const FridgeBody = () => {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState([])

  useEffect(() => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return
    axios.get(`http://localhost:3000/api/ingredient?user_idx=${user_idx}`)
      .then(res => { if (Array.isArray(res.data)) setIngredients(res.data) })
      .catch(err => console.error('식재료 조회 실패:', err))
  }, [])

  // ingre_type별로 그룹핑
  const grouped = ingredients.reduce((acc, item) => {
    const key = item.ingre_type || '기타'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const categories = Object.keys(grouped)

  return (
    <div className="fr-page">
      {/* ── 히어로 배너 ── */}
      <div className="fr-hero">
        <div className="fr-hero-text">
          <h1 className="fr-hero-title">냉장고 인벤토리</h1>
          <p className="fr-hero-sub">신선하고 건강한 식재료로 냉장고를 채워 회복을 도와드립니다.</p>
          <div className="fr-hero-btns">
            <button className="fr-hero-btn fr-hero-btn-outline">
              <span>📷</span> Scan Receipt
            </button>
            <button className="fr-hero-btn fr-hero-btn-outline" onClick={() => navigate('/IngredientForm')}>
              <span>＋</span> Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* ── Current Inventory ── */}
      <div className="fr-body">
        <div className="fr-inventory-header">
          <h2 className="fr-inventory-title">Current Inventory</h2>
          <div className="fr-inventory-actions">
            <span className="fr-action-icon">☰</span>
            <span className="fr-action-icon">🔍</span>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="fr-empty">
            <p>등록된 식재료가 없습니다.</p>
            <button className="fr-add-first-btn" onClick={() => navigate('/IngredientForm')}>
              + 첫 식재료 등록하기
            </button>
          </div>
        ) : (
          <div className="fr-columns">
            {categories.map((cat) => (
              <div key={cat} className="fr-col-card">
                {/* 카테고리 헤더 */}
                <div className="fr-col-header">
                  <div className="fr-col-icon-wrap">
                    <span className="fr-col-icon">{getIcon(cat)}</span>
                  </div>
                  <span className="fr-col-name">{cat}</span>
                  <span className="fr-col-badge">{grouped[cat].length} items</span>
                </div>

                {/* 아이템 목록 */}
                <div className="fr-item-list">
                  {grouped[cat].map((item) => (
                    <div
                      key={item.ingre_idx}
                      className="fr-item"
                      onDoubleClick={() => navigate(`/IngredientForm/${item.ingre_idx}`)}
                    >
                      <div className="fr-item-img" />
                      <div className="fr-item-info">
                        <span className="fr-item-name">{item.ingre_name}</span>
                        <span className="fr-item-meta">
                          {item.ingre_storage} · {item.cnt}개
                        </span>
                      </div>
                      {item.cnt <= 1 && (
                        <span className="fr-item-urgent">LOW</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 카테고리에 추가 링크 */}
                <button
                  className="fr-col-add-btn"
                  onClick={() => navigate('/IngredientForm')}
                >
                  + {cat}에 추가
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FridgeBody
