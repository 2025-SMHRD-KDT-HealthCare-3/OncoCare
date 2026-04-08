import { useEffect, useState, useMemo, useRef } from 'react'
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
  const [generating, setGenerating] = useState(false)
  const timerRef = useRef(null)

  const getDietList = async (uid, date) => {
    try {
      const url = date
        ? `http://localhost:3000/api/diet/dietList/${uid}?date=${date}`
        : `http://localhost:3000/api/diet/dietList/${uid}`
      const response = await axios.get(url)
      const noData = !response.data || response.data === '0' || response.data === 0
        || (Array.isArray(response.data) && response.data.length === 0)
      if (noData) { setRecipes([]); return null }
      setRecipes(Array.isArray(response.data) ? response.data : [])
      return response.data
    } catch (error) {
      console.error('추천 식단 조회 에러:', error)
      return null
    }
  }

  const handleRefresh = async () => {
    if (!user_idx || generating) return
    // 클릭 시각 기록 (MySQL 형식: YYYY-MM-DD HH:MM:SS, 서버 로컬 기준)
    const now = new Date()
    const since = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    // 기존 레시피 즉시 비우고 로딩 상태로 전환
    setRecipes([])
    setGenerating(true)
    showToast('알림', 'AI가 맞춤 식단을 생성하고 있습니다. 1분 후 자동으로 불러옵니다.', 'info')
    try {
      await axios.post(`http://localhost:8000/generate-diet/${user_idx}`)
      // 1분 후 since 이후 생성된 레시피 조회
      timerRef.current = setTimeout(async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/diet/dietList/${user_idx}?since=${encodeURIComponent(since)}`
          )
          const noData = !response.data || response.data === '0' || response.data === 0
            || (Array.isArray(response.data) && response.data.length === 0)
          if (!noData) {
            setRecipes(Array.isArray(response.data) ? response.data : [])
          } else {
            showToast('알림', '식단 생성이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.', 'warning')
          }
        } catch {
          showToast('오류', '식단을 불러오는 데 실패했습니다.', 'error')
        }
        setGenerating(false)
      }, 60000)
    } catch (err) {
      console.error('식단 생성 요청 실패:', err)
      showToast('오류', '식단 생성 요청에 실패했습니다.', 'error')
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (user_idx) getDietList(user_idx, selectedDate)
  }, [user_idx, selectedDate])

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

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
          <button className="recipe-new-btn" onClick={handleRefresh} disabled={generating}>
            {generating ? '⏳ 생성 중...' : '+ 새로고침'}
          </button>
        </div>
      </div>

      {generating ? (
        <div className="recipe-empty">
          <div className="recipe-empty-spinner" />
          <p className="recipe-empty-title">AI가 맞춤 식단을 생성하고 있어요</p>
          <span className="recipe-empty-sub">약 30초 후 자동으로 불러옵니다</span>
        </div>
      ) : recipes.length === 0 ? (
        <div className="recipe-empty">
          <p className="recipe-empty-title">이 날짜의 추천 식단이 없습니다</p>
          <span className="recipe-empty-sub">새로고침 버튼을 눌러 오늘의 맞춤 식단을 생성해보세요</span>
        </div>
      ) : (
        <>
          {featured && <FeaturedCard recipe={featured} />}
          {rest.length > 0 && (
            <div className="recipe-grid">
              {rest.map((recipe) => (
                <RecipeGridCard key={recipe.recipe_idx} recipe={recipe} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default MainRecipe
