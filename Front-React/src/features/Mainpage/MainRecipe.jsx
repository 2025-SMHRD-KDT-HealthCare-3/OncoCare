import { useEffect, useState } from 'react'
import axios from 'axios'
import './MainRecipe.css'

const categoryImageMap = {
  '죽/스프':    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
  '밥류':       'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
  '국/탕류':    'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
  '반찬류':     'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80',
  '면류':       'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80',
  '단백질요리': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80',
  '샐러드':     'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  '과일':       'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80',
  '간식':       'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  '음료':       'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
}

const categoryBadge = {
  '죽/스프': 'Soft Texture',
  '밥류': 'Low Residue',
  '국/탕류': 'Anti-Nausea',
  '반찬류': 'Balanced',
  '면류': 'Easy Digest',
  '단백질요리': 'High Protein',
  '샐러드': 'Anti-Oxidant',
  '과일': 'Vitamin Rich',
  '간식': 'Light Snack',
  '음료': 'Hydration',
}

const categoryDesc = {
  '죽/스프': 'A velvety, smooth texture that is exceptionally gentle on the digestive tract. Helps naturally soothe post-treatment nausea.',
  '밥류': 'A foundational recovery meal using refined grains to minimize bowel movement frequency.',
  '국/탕류': 'Warm and soothing broth to ease digestion and provide comforting nourishment during recovery.',
  '반찬류': 'Carefully prepared side dish to support recovery and maintain balanced nutrition.',
  '면류': 'Soft noodles in a gentle broth, easy on the digestive system for sensitive stomachs.',
  '단백질요리': 'High-quality lean protein to support tissue repair without taxing the colon.',
  '샐러드': 'Fresh vegetables with antioxidants to support the immune system during recovery.',
  '과일': 'Naturally sweet and vitamin-rich to support energy and healing throughout the day.',
  '간식': 'A light, nourishing snack to maintain energy levels between meals.',
  '음료': 'Hydrating and gentle on the stomach for optimal recovery support.',
}

const categoryNutrition = {
  '죽/스프':     { protein: 8,  fiber: 2, kcal: 240 },
  '밥류':        { protein: 12, fiber: 3, kcal: 350 },
  '국/탕류':     { protein: 10, fiber: 2, kcal: 180 },
  '반찬류':      { protein: 8,  fiber: 4, kcal: 150 },
  '면류':        { protein: 9,  fiber: 2, kcal: 320 },
  '단백질요리':  { protein: 22, fiber: 1, kcal: 280 },
  '샐러드':      { protein: 6,  fiber: 5, kcal: 120 },
  '과일':        { protein: 2,  fiber: 4, kcal: 90  },
  '간식':        { protein: 4,  fiber: 2, kcal: 160 },
  '음료':        { protein: 2,  fiber: 1, kcal: 80  },
}

const categoryTime = {
  '죽/스프': '20 mins', '밥류': '30 mins', '국/탕류': '35 mins',
  '반찬류': '15 mins', '면류': '20 mins', '단백질요리': '25 mins',
  '샐러드': '10 mins', '과일': '5 mins', '간식': '10 mins', '음료': '5 mins',
}

const getCategoryByName = (name = '') => {
  if (name.includes('죽') || name.includes('미음') || name.includes('스프') || name.includes('푸딩')) return '죽/스프'
  if (name.includes('국') || name.includes('탕')) return '국/탕류'
  if (name.includes('밥')) return '밥류'
  if (name.includes('면') || name.includes('우동') || name.includes('국수')) return '면류'
  if (name.includes('샐러드')) return '샐러드'
  if (name.includes('사과') || name.includes('바나나') || name.includes('과일')) return '과일'
  if (name.includes('두부') || name.includes('계란') || name.includes('생선') || name.includes('닭')) return '단백질요리'
  return '반찬류'
}

const MainRecipe = ({ user_idx }) => {
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')

  const getDietList = async (user_idx) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/diet/dietList/${user_idx}`)
      if (response.data === '0') {
        alert('건강 정보를 먼저 입력해주세요.')
        return
      }
      setRecipes(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('추천 식단 조회 에러:', error)
    }
  }

  useEffect(() => {
    if (user_idx) getDietList(user_idx)
  }, [user_idx])

  const filtered = recipes.filter((r) =>
    r.recipe_name?.toLowerCase().includes(search.toLowerCase())
  )

  const [featured, ...rest] = filtered

  return (
    <section className="recipe-section">
      <div className="recipe-header-row">
        <div>
          <h2 className="recipe-title">Top Picks For You</h2>
          <p className="recipe-subtitle">Nutrient-dense, easy-to-digest suggestions</p>
        </div>
        <div className="recipe-actions">
          <div className="recipe-search-box">
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="recipe-search-input"
            />
            <span className="recipe-search-icon">🔍</span>
          </div>
          <button className="recipe-new-btn" onClick={() => getDietList(user_idx)}>
            + New
          </button>
        </div>
      </div>

      {featured && (() => {
        const cat = getCategoryByName(featured.recipe_name)
        const img = categoryImageMap[cat]
        const { protein, fiber, kcal } = categoryNutrition[cat] || { protein: 8, fiber: 2, kcal: 240 }
        return (
          <div
            className="recipe-featured"
            onDoubleClick={() => window.location.href = `/RecipeDetail/${featured.recipe_idx}`}
          >
            <div className="recipe-featured-image-wrap">
              {img
                ? <img src={img} alt={featured.recipe_name} className="recipe-featured-image" />
                : <div className="recipe-featured-placeholder">🍽</div>
              }
            </div>
            <div className="recipe-featured-content">
              <div className="recipe-featured-meta">
                <span className="recipe-recommended-badge">HIGHLY RECOMMENDED</span>
                <span className="recipe-time-badge">⏱ {categoryTime[cat] || '20 mins'}</span>
              </div>
              <h3 className="recipe-featured-title">{featured.recipe_name}</h3>
              <p className="recipe-featured-desc">{categoryDesc[cat]}</p>
              <div className="recipe-stats-row">
                <div className="recipe-stat">
                  <span className="recipe-stat-label">PROTEIN</span>
                  <strong className="recipe-stat-value">{protein}g</strong>
                </div>
                <div className="recipe-stat">
                  <span className="recipe-stat-label">FIBER</span>
                  <strong className="recipe-stat-value">{fiber}g</strong>
                </div>
                <div className="recipe-stat">
                  <span className="recipe-stat-label">KCAL</span>
                  <strong className="recipe-stat-value">{kcal}</strong>
                </div>
              </div>
              <button
                className="recipe-detail-btn"
                onClick={() => window.location.href = `/RecipeDetail/${featured.recipe_idx}`}
              >
                📋 Recipe Details
              </button>
            </div>
          </div>
        )
      })()}

      {rest.length > 0 && (
        <div className="recipe-grid">
          {rest.map((recipe) => {
            const cat = getCategoryByName(recipe.recipe_name)
            const img = categoryImageMap[cat]
            const { protein, kcal } = categoryNutrition[cat] || { protein: 8, kcal: 240 }
            return (
              <div
                className="recipe-card-shell"
                key={recipe.recipe_idx}
                onDoubleClick={() => window.location.href = `/RecipeDetail/${recipe.recipe_idx}`}
              >
                <div className="recipe-card-image-area">
                  {img
                    ? <img src={img} alt={recipe.recipe_name} className="recipe-card-image" />
                    : <div className="recipe-card-placeholder">🍽</div>
                  }
                  <span className="recipe-card-badge">{categoryBadge[cat]}</span>
                </div>
                <div className="recipe-card-content">
                  <h4 className="recipe-card-title">{recipe.recipe_name}</h4>
                  <p className="recipe-card-desc">{categoryDesc[cat]}</p>
                  <div className="recipe-card-footer">
                    <span className="recipe-card-stats">
                      <strong>{kcal}</strong> Kcal &nbsp; <strong>{protein}g</strong> Protein
                    </span>
                    <span
                      className="recipe-card-link"
                      onClick={() => window.location.href = `/RecipeDetail/${recipe.recipe_idx}`}
                    >
                      Recipe ›
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default MainRecipe
