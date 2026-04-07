import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import './MainRecipe.css'
import { useToast } from '../../context/ToastContext'
import {
  getCategoryByName,
  getCategoryImage,
  categoryBadge,
  categoryDesc,
  categoryNutrition,
  categoryTime,
} from '../../utils/categoryImageMap'

/* 피처드 카드 — useMemo로 이미지 고정 */
const FeaturedCard = ({ recipe }) => {
  const cat = getCategoryByName(recipe.recipe_name)
  const img = useMemo(() => getCategoryImage(cat), [cat])
  const { protein, fiber, kcal } = categoryNutrition[cat] || { protein: 8, fiber: 2, kcal: 240 }
  return (
    <div
      className="recipe-featured"
      onDoubleClick={() => window.location.href = `/RecipeDetail/${recipe.recipe_idx}`}
    >
      <div className="recipe-featured-image-wrap">
        <img src={img} alt={recipe.recipe_name} className="recipe-featured-image" />
      </div>
      <div className="recipe-featured-content">
        <div className="recipe-featured-meta">
          <span className="recipe-recommended-badge">추천 메뉴</span>
          <span className="recipe-time-badge">⏱ {categoryTime[cat] || '20 mins'}</span>
        </div>
        <h3 className="recipe-featured-title">{recipe.recipe_name}</h3>
        <p className="recipe-featured-desc">{categoryDesc[cat]}</p>
        <div className="recipe-stats-row">
          <div className="recipe-stat">
            <span className="recipe-stat-label">단백질</span>
            <strong className="recipe-stat-value">{protein}g</strong>
          </div>
          <div className="recipe-stat">
            <span className="recipe-stat-label">식이섬유</span>
            <strong className="recipe-stat-value">{fiber}g</strong>
          </div>
          <div className="recipe-stat">
            <span className="recipe-stat-label">칼로리</span>
            <strong className="recipe-stat-value">{kcal}</strong>
          </div>
        </div>
        <button
          className="recipe-detail-btn"
          onClick={() => window.location.href = `/RecipeDetail/${recipe.recipe_idx}`}
        >
          📋 레시피 상세보기
        </button>
      </div>
    </div>
  )
}

/* 그리드 카드 — useMemo로 이미지 고정 */
const RecipeGridCard = ({ recipe }) => {
  const cat = getCategoryByName(recipe.recipe_name)
  const img = useMemo(() => getCategoryImage(cat), [cat])
  const { protein, kcal } = categoryNutrition[cat] || { protein: 8, kcal: 240 }
  return (
    <div
      className="recipe-card-shell"
      onDoubleClick={() => window.location.href = `/RecipeDetail/${recipe.recipe_idx}`}
    >
      <div className="recipe-card-image-area">
        <img src={img} alt={recipe.recipe_name} className="recipe-card-image" />
        <span className="recipe-card-badge">{categoryBadge[cat]}</span>
      </div>
      <div className="recipe-card-content">
        <h4 className="recipe-card-title">{recipe.recipe_name}</h4>
        <p className="recipe-card-desc">{categoryDesc[cat]}</p>
        <div className="recipe-card-footer">
          <span className="recipe-card-stats">
            <strong>{kcal}</strong> kcal &nbsp; <strong>{protein}g</strong> 단백질
          </span>
          <span
            className="recipe-card-link"
            onClick={() => window.location.href = `/RecipeDetail/${recipe.recipe_idx}`}
          >
            레시피 ›
          </span>
        </div>
      </div>
    </div>
  )
}

const MainRecipe = ({ user_idx, selectedDate }) => {
  const { showToast } = useToast()
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')

  const getDietList = async (uid, date) => {
    try {
      const url = date
        ? `http://localhost:3000/api/diet/dietList/${uid}?date=${date}`
        : `http://localhost:3000/api/diet/dietList/${uid}`
      const response = await axios.get(url)
      if (response.data === '0') {
        showToast('알림', '건강 정보를 먼저 입력해주세요.', 'warning')
        return
      }
      setRecipes(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('추천 식단 조회 에러:', error)
    }
  }

  useEffect(() => {
    if (user_idx) getDietList(user_idx, selectedDate)
  }, [user_idx, selectedDate])

  const filtered = recipes.filter((r) =>
    r.recipe_name?.toLowerCase().includes(search.toLowerCase())
  )

  const [featured, ...rest] = filtered

  return (
    <section className="recipe-section">
      <div className="recipe-header-row">
        <div>
          <h2 className="recipe-title">추천 식단</h2>
          <p className="recipe-subtitle">소화가 편하고 회복에 도움이 되는 맞춤 식단</p>
        </div>
        <div className="recipe-actions">
          <div className="recipe-search-box">
            <input
              type="text"
              placeholder="레시피 검색중..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="recipe-search-input"
            />
            <span className="recipe-search-icon">🔍</span>
          </div>
          <button className="recipe-new-btn" onClick={() => getDietList(user_idx, selectedDate)}>
            + 새로고침
          </button>
        </div>
      </div>

      {featured && <FeaturedCard recipe={featured} />}

      {rest.length > 0 && (
        <div className="recipe-grid">
          {rest.map((recipe) => (
            <RecipeGridCard key={recipe.recipe_idx} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  )
}

export default MainRecipe
