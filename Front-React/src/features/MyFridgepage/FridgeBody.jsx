import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Fridge.css'
import '../public/root.css'
import { getIngredientIcon, categoryIconMap } from '../../utils/iconMap'
import RegisterIngredient from '../public/RegisterIngredient'

const getCategoryIcon = (type) => categoryIconMap[type] || '📦'
const FRESH_TYPES = ['채소', '야채', '과일']

const FridgeBody = () => {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState([])

  const fetchIngredients = () => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return
    axios.get(`http://localhost:3000/api/ingredient?user_idx=${user_idx}`)
      .then(res => { if (Array.isArray(res.data)) setIngredients(res.data) })
      .catch(err => console.error('식재료 조회 실패:', err))
  }

  useEffect(() => {
    fetchIngredients()
  }, [])

  const grouped = ingredients.reduce((acc, item) => {
    const key = item.ingre_type || '기타'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const categories = Object.keys(grouped)
  const lowStock = ingredients.filter(i => Number(i.cnt) <= 1)
  const freshItems = [
    ...ingredients.filter(i => FRESH_TYPES.includes(i.ingre_type)),
    ...ingredients.filter(i => !FRESH_TYPES.includes(i.ingre_type)),
  ].slice(0, 8)

  return (
    <div className="fr-page">
      <div className="fr-content">

        {/* ── Hero Card ── */}
        <div className="fr-hero-card">
          <div className="fr-hero-card-body">
            <h1 className="fr-hero-title">나의 냉장고</h1>
            <p className="fr-hero-sub">
              신선하고 건강한 식재료로 냉장고를 채워 회복을 도와드립니다.
            </p>
          </div>
        </div>

        {/* ── Empty State ── */}
        {ingredients.length === 0 ? (
          <div className="fr-empty">
            <span className="fr-empty-icon">🥗</span>
            <p>등록된 식재료가 없습니다.</p>
            <button className="fr-empty-btn" onClick={() => navigate('/IngredientForm')}>
              + 첫 식재료 등록하기
            </button>
          </div>
        ) : (
          <div className="fr-main">

            {/* ── Top: Harvest Card (full width) ── */}
            <div className="fr-harvest-card">
                <div className="fr-harvest-header">
                  <div className="fr-harvest-icon-wrap">🌱</div>
                  <div className="fr-harvest-info">
                    <h3 className="fr-harvest-title">신선 식재료</h3>
                    <p className="fr-harvest-sub">채소 및 신선 재료 현황</p>
                  </div>
                  <button
                    className="fr-harvest-add-btn"
                    onClick={() => navigate('/IngredientForm')}
                  >
                    + 신선 식재료 추가
                  </button>
                </div>

                <div className="fr-harvest-grid">
                  {freshItems.map((item) => (
                    <div
                      key={item.ingre_idx}
                      className="fr-harvest-item"
                      onDoubleClick={() => navigate(`/IngredientForm/${item.ingre_idx}`)}
                    >
                      <div className="fr-harvest-img">
                        <span>{getIngredientIcon(item.ingre_name, item.ingre_type)}</span>
                      </div>
                      <div className="fr-harvest-item-info">
                        <span className="fr-harvest-item-name">{item.ingre_name}</span>
                        <span className={`fr-harvest-status ${Number(item.cnt) <= 1 ? 'fr-harvest-warn' : 'fr-harvest-ok'}`}>
                          {Number(item.cnt) <= 1 ? '재고 부족' : `${item.cnt}개 남음`}
                        </span>
                      </div>
                    </div>
                  ))}
                  {freshItems.length === 0 && (
                    <div className="fr-harvest-empty">신선 재료가 없습니다</div>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="fr-stats-bar">
                  <div className="fr-stat">
                    <span className="fr-stat-num">{ingredients.length}</span>
                    <span className="fr-stat-label">전체 식재료</span>
                  </div>
                  <div className="fr-stat-divider" />
                  <div className="fr-stat">
                    <span className={`fr-stat-num${lowStock.length > 0 ? ' fr-stat-warn' : ''}`}>
                      {lowStock.length}
                    </span>
                    <span className="fr-stat-label">재고 부족</span>
                  </div>
                  <div className="fr-stat-divider" />
                  <div className="fr-stat">
                    <span className="fr-stat-num">{categories.length}</span>
                    <span className="fr-stat-label">분류</span>
                  </div>
                </div>
            </div>

            {/* ── Bottom: Category Cards (3-col grid) ── */}
            <div className="fr-cat-grid">
              {categories.map((cat) => (
                <div key={cat} className="fr-cat-card">
                  <div className="fr-cat-header">
                    <div className="fr-cat-icon-wrap">
                      <span>{getCategoryIcon(cat)}</span>
                    </div>
                    <span className="fr-cat-name">{cat}</span>
                    <button
                      className="fr-cat-add-btn"
                      onClick={() => navigate(`/IngredientForm?category=${encodeURIComponent(cat)}`)}
                    >
                      + 추가
                    </button>
                  </div>
                  <div className="fr-cat-items">
                    {grouped[cat].map((item) => (
                      <div
                        key={item.ingre_idx}
                        className="fr-cat-item"
                        onDoubleClick={() => navigate(`/IngredientForm/${item.ingre_idx}`)}
                      >
                        <div className="fr-cat-item-info">
                          <span className="fr-cat-item-name">
                            {getIngredientIcon(item.ingre_name, item.ingre_type)} {item.ingre_name}
                          </span>
                          <span className="fr-cat-item-meta">
                            {item.cnt}개 · {item.ingre_storage}
                          </span>
                        </div>
                        <span className={`fr-status-badge ${Number(item.cnt) <= 1 ? 'fr-badge-low' : 'fr-badge-ok'}`}>
                          {Number(item.cnt) <= 1 ? '부족' : '신선'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
      <RegisterIngredient onSaveSuccess={fetchIngredients} />
    </div>
  )
}

export default FridgeBody
