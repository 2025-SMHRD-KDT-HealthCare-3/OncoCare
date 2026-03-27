import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import axios from 'axios'
import '../css/root.css'
import '../css/RecipeDetail.css'

const RecipeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [liked, setLiked] = useState(false)
  const [openSection, setOpenSection] = useState('ingredients')

  useEffect(() => {
    axios.get(`http://localhost:3000/recipe/detail?${id}`)
      .then(res => setRecipe(res.data))
      .catch(err => console.error('레시피 조회 실패:', err))
  }, [id])

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const handleSelectDiet = async () => {
    try {
      await axios.post('http://localhost:3000/diet/select', { recipeId: id })
      alert('식단이 선택되었습니다!')
      navigate('/Main')
    } catch (err) {
      console.error('식단 선택 실패:', err)
      alert('식단 선택에 실패했습니다.')
    }
  }

  return (
    <div className="page-layout">
      <MainHeader />
      <div className="recipe-detail-container main-content">
        <button className="recipe-detail-back" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>

        <div className="recipe-detail-layout">
          {/* 왼쪽: 이미지 */}
          <div className="recipe-detail-image-section">
            <button
              className={`recipe-heart-btn ${liked ? 'liked' : ''}`}
              onClick={() => setLiked(!liked)}
            >
              ♥
            </button>
            {recipe?.image_url
              ? <img src={recipe.image_url} alt={recipe.name} className="recipe-detail-img" />
              : <div className="recipe-detail-img-placeholder" />
            }
          </div>

          {/* 오른쪽: 정보 */}
          <div className="recipe-detail-info">
            <h1 className="recipe-detail-title">{recipe?.name || 'Recipe Name'}</h1>
            <p className="recipe-detail-desc">{recipe?.description || ''}</p>

            {/* 아코디언 */}
            <div className="recipe-accordion">
              {/* 재료 */}
              <div className="recipe-accordion-item">
                <button
                  className="recipe-accordion-header"
                  onClick={() => toggleSection('ingredients')}
                >
                  <span>재료</span>
                  <span>{openSection === 'ingredients' ? '∧' : '∨'}</span>
                </button>
                {openSection === 'ingredients' && (
                  <div className="recipe-accordion-body">
                    {recipe?.ingredients?.length > 0
                      ? <ul>{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                      : <p>재료 정보가 없습니다.</p>
                    }
                  </div>
                )}
              </div>

              {/* 조리방법 */}
              <div className="recipe-accordion-item">
                <button
                  className="recipe-accordion-header"
                  onClick={() => toggleSection('steps')}
                >
                  <span>조리방법</span>
                  <span>{openSection === 'steps' ? '∧' : '∨'}</span>
                </button>
                {openSection === 'steps' && (
                  <div className="recipe-accordion-body">
                    {recipe?.steps?.length > 0
                      ? <ol>{recipe.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
                      : <p>조리방법 정보가 없습니다.</p>
                    }
                  </div>
                )}
              </div>

              {/* 영양정보 */}
              <div className="recipe-accordion-item">
                <button
                  className="recipe-accordion-header"
                  onClick={() => toggleSection('nutrition')}
                >
                  <span>영양정보</span>
                  <span>{openSection === 'nutrition' ? '∧' : '∨'}</span>
                </button>
                {openSection === 'nutrition' && (
                  <div className="recipe-accordion-body">
                    {recipe?.nutrition ? (
                      <div className="nutrition-grid">
                        <div className="nutrition-item">
                          <span>칼로리</span>
                          <span>{recipe.nutrition.calories} kcal</span>
                        </div>
                        <div className="nutrition-item">
                          <span>단백질</span>
                          <span>{recipe.nutrition.protein} g</span>
                        </div>
                        <div className="nutrition-item">
                          <span>지방</span>
                          <span>{recipe.nutrition.fat} g</span>
                        </div>
                        <div className="nutrition-item">
                          <span>탄수화물</span>
                          <span>{recipe.nutrition.carbs} g</span>
                        </div>
                      </div>
                    ) : (
                      <p>영양 정보가 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button className="recipe-select-btn" onClick={handleSelectDiet}>
              식단선택
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail
