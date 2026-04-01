import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../public/Sidebar'
import axios from 'axios'
import '../public/root.css'
import './RecipeDetail.css'
import Footer from '../public/Footer'

const RecipeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [liked, setLiked] = useState(false)
  const [openSection, setOpenSection] = useState('cooking')
  const [mealsPerDay, setMealsPerDay] = useState(3)
  const [mealType, setMealType] = useState('')

  useEffect(() => {
    axios.get(`http://localhost:3000/api/recipe/detail?recipe_idx=${id}`)
      .then(res => setRecipe(res.data))
      .catch(err => console.error('레시피 조회 실패:', err))
  }, [id])

  useEffect(() => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return
    axios.get(`http://localhost:3000/api/user/health?user_idx=${user_idx}`)
      .then(res => {
        if (res.data?.meals_per_day) {
          setMealsPerDay(Number(res.data.meals_per_day))
        }
      })
      .catch(() => {})
  }, [])

  const toggleSection = (section) => {
    setOpenSection(prev => (prev === section ? null : section))
  }

  const mealLabels = ['첫번째끼', '두번째끼', '세번째끼', '네번째끼', '다섯번째끼', '여섯번째끼']

  const handleSelectDiet = async () => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) { alert('로그인이 필요합니다.'); return }
    if (!mealType) { alert('몇 번째 끼니인지 선택해주세요.'); return }
    try {
      const res = await axios.post('http://localhost:3000/api/diet/clickRecipe', {
        user_idx,
        recipe_idx: id,
        meal_type: mealType
      })
      if (res.data == 1 || res.data === '1') {
        alert('식단이 선택되었습니다!')
        navigate('/Main')
      } else {
        alert('식단 선택에 실패했습니다.')
      }
    } catch (err) {
      console.error('식단 선택 실패:', err)
      alert('식단 선택에 실패했습니다.')
    }
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area main-content">
        <div className="recipe-detail-container">
          <button className="recipe-detail-back" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>

          <div className="recipe-detail-layout">
            <div className="recipe-detail-image-section">
              <button
                className={`recipe-heart-btn ${liked ? 'liked' : ''}`}
                onClick={() => setLiked(!liked)}
              >
                ♥
              </button>
              <div className="recipe-detail-img-placeholder" />
            </div>

            <div className="recipe-detail-info">
              <h1 className="recipe-detail-title">{recipe?.recipe_name || 'Recipe Name'}</h1>
              <p className="recipe-detail-desc">{recipe?.recipe_category || ''}</p>

              <div className="recipe-accordion">

                <div className="recipe-accordion-item">
                  <button
                    className="recipe-accordion-header"
                    onClick={() => toggleSection('ingredients')}
                  >
                    <span>사용 재료</span>
                    <span>{openSection === 'ingredients' ? '∧' : '∨'}</span>
                  </button>
                  {openSection === 'ingredients' && (
                    <div className="recipe-accordion-body">
                      {recipe?.main_ingredients
                        ? <p>{recipe.main_ingredients}</p>
                        : <p>재료 정보가 없습니다.</p>
                      }
                    </div>
                  )}
                </div>

                <div className="recipe-accordion-item">
                  <button
                    className="recipe-accordion-header"
                    onClick={() => toggleSection('cooking')}
                  >
                    <span>조리방법</span>
                    <span>{openSection === 'cooking' ? '∧' : '∨'}</span>
                  </button>
                  {openSection === 'cooking' && (
                    <div className="recipe-accordion-body">
                      {recipe?.cooking_method
                        ? <p>{recipe.cooking_method}</p>
                        : <p>조리방법 정보가 없습니다.</p>
                      }
                    </div>
                  )}
                </div>

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
                      {recipe?.nutrition_info
                        ? <p>{recipe.nutrition_info}</p>
                        : <p>영양 정보가 없습니다.</p>
                      }
                    </div>
                  )}
                </div>
              </div>

              <div className="recipe-meal-select">
                <label className="recipe-meal-label">몇 번째 끼니?</label>
                <div className="recipe-meal-options">
                  {mealLabels.slice(0, mealsPerDay).map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`recipe-meal-btn ${mealType === label ? 'selected' : ''}`}
                      onClick={() => setMealType(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="recipe-select-btn" onClick={handleSelectDiet}>
                식단선택
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default RecipeDetail
