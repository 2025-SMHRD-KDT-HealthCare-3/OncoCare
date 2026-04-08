import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../../context/ToastContext'
import '../public/root.css'
import './RecipeDetail.css'
import { getCategoryImage, getCategoryByName, categoryBadge } from '../../utils/categoryImageMap'

const RecipeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const { showToast } = useToast()
  const [liked, setLiked] = useState(false)
  const [mealsPerDay, setMealsPerDay] = useState(3)
  const [mealType, setMealType] = useState('')

  const recipeImage = useMemo(
    () => getCategoryImage(recipe?.recipe_category, recipe?.recipe_name),
    [recipe?.recipe_category, recipe?.recipe_name]
  )

  const recipeBadge = useMemo(() => {
    const cat = recipe?.recipe_category || getCategoryByName(recipe?.recipe_name || '')
    return categoryBadge[cat] || '회복식'
  }, [recipe?.recipe_category, recipe?.recipe_name])

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/recipe/detail?recipe_idx=${id}`)
      .then((res) => setRecipe(res.data))
      .catch((err) => console.error('레시피 조회 실패:', err))
  }, [id])

  useEffect(() => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return

    axios
      .get(`http://localhost:3000/api/user/health?user_idx=${user_idx}`)
      .then((res) => {
        if (res.data?.meals_per_day) {
          setMealsPerDay(Number(res.data.meals_per_day))
        }
      })
      .catch(() => {})
  }, [])

  const mealLabels = [
    '첫번째끼',
    '두번째끼',
    '세번째끼',
    '네번째끼',
    '다섯번째끼',
    '여섯번째끼',
  ]

  const handleSelectDiet = async () => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) {
      showToast('알림', '로그인이 필요합니다.', 'warning')
      return
    }
    if (!mealType) {
      showToast('알림', '몇 번째 끼니인지 선택해주세요.', 'warning')
      return
    }

    try {
      const res = await axios.post('http://localhost:3000/api/diet/clickRecipe', {
        user_idx,
        recipe_idx: id,
        meal_type: mealType,
      })

      if (res.data == 1 || res.data === '1') {
        showToast('선택 완료', '식단이 선택되었습니다!', 'success')
        navigate('/Main')
      } else {
        showToast('오류', '식단 선택에 실패했습니다.', 'danger')
      }
    } catch (err) {
      console.error('식단 선택 실패:', err)
      showToast('오류', '식단 선택에 실패했습니다.', 'danger')
    }
  }

  const nutritionList = useMemo(() => {
    if (!recipe?.nutrition_info) {
      return [
        { label: '칼로리', value: '-' },
        { label: '단백질', value: '-' },
        { label: '식이섬유', value: '-' },
        { label: '나트륨', value: '-' },
      ]
    }

    if (typeof recipe.nutrition_info === 'string') {
      const lines = recipe.nutrition_info
        .split(/\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)

      const mapped = lines.map((line) => {
        const parts = line.split(':')
        if (parts.length >= 2) {
          return {
            label: parts[0].trim(),
            value: parts.slice(1).join(':').trim(),
          }
        }
        return { label: line, value: '' }
      })

      return mapped.length
        ? mapped
        : [
            { label: 'Calories', value: recipe.nutrition_info },
          ]
    }

    return [
      { label: '칼로리', value: '-' },
      { label: '단백질', value: '-' },
      { label: '식이섬유', value: '-' },
      { label: '나트륨', value: '-' },
    ]
  }, [recipe])

  const ingredientsList = useMemo(() => {
    if (!recipe?.main_ingredients) return []
    return String(recipe.main_ingredients)
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
  }, [recipe])

  const cookingSteps = useMemo(() => {
    if (!recipe?.cooking_method) return []

    const raw = String(recipe.cooking_method)

    // "1. 내용 2. 내용 3. 내용" 형식
    const byNumber = raw.split(/\s*\d+\.\s+/).map(s => s.trim()).filter(Boolean)
    if (byNumber.length > 1) return byNumber

    // 줄바꿈 형식
    const byLine = raw.split(/\r?\n/).map(s => s.trim().replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
    if (byLine.length > 1) return byLine

    return [raw.trim()]
  }, [recipe])

  return (
    <div className="main-content recipe-modern-page">
      <div className="recipe-modern-container">
        <button className="recipe-modern-back" onClick={() => navigate(-1)}>
          ← 뒤로 가기
        </button>

        <div className="recipe-modern-top">
          <div className="recipe-hero-card">
            <div className="recipe-badge">{recipeBadge}</div>

            <button
              type="button"
              className={`recipe-favorite-btn ${liked ? 'liked' : ''}`}
              onClick={() => setLiked(!liked)}
              aria-label="favorite"
            >
              ♥
            </button>

            <img
              src={recipeImage}
              alt={recipe?.recipe_name || 'recipe'}
              className="recipe-hero-image"
            />
          </div>

          <aside className="recipe-nutrition-panel">
            <h3>영양 정보</h3>

            <div className="nutrition-modern-list">
              {nutritionList.map((item, index) => (
                <div className="nutrition-modern-item" key={`${item.label}-${index}`}>
                  <span>{item.label}</span>
                  <strong>{item.value || '-'}</strong>
                </div>
              ))}
            </div>

            <div className="nutrition-note-box">
              소화를 돕는 재료로 구성되어 회복과 균형 잡힌 식단을 유지합니다.
            </div>
          </aside>
        </div>

        <div className="recipe-title-area">
          <h1>{recipe?.recipe_name || '레시피 이름'}</h1>
          <p>
            {recipe?.recipe_category ||
              '대장암 회복기에 적합한 부드럽고 소화가 쉬운 식단입니다.'}
          </p>
        </div>

        <div className="recipe-modern-bottom">
          <section className="ingredients-panel">
            <h2>재료</h2>

            <div className="ingredients-list-modern">
              {ingredientsList.length > 0 ? (
                ingredientsList.map((item, index) => (
                  <div className="ingredient-row" key={`${item}-${index}`}>
                    <span className="ingredient-bullet">•</span>
                    <span className="ingredient-text">{item}</span>
                  </div>
                ))
              ) : (
                <p className="empty-copy">재료 정보가 없습니다.</p>
              )}
            </div>
          </section>

          <section className="cooking-panel">
            <h2>조리 방법</h2>

            <div className="cooking-steps">
              {cookingSteps.length > 0 ? (
                cookingSteps.map((step, index) => (
                  <div className="cooking-step" key={`${step}-${index}`}>
                    <div className="step-number">{index + 1}</div>
                    <div className="step-copy">
                      <p>{step}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-copy">조리방법 정보가 없습니다.</p>
              )}
            </div>
          </section>
        </div>

        <div className="recipe-action-box">
          <div className="recipe-meal-select-modern">
            <label>몇 번째 끼니에 넣을까요?</label>
            <div className="recipe-meal-options-modern">
              {mealLabels.slice(0, mealsPerDay).map((label, i) => (
                <button
                  key={i}
                  type="button"
                  className={`recipe-meal-chip ${
                    mealType === label ? 'selected' : ''
                  }`}
                  onClick={() => setMealType(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="recipe-action-buttons">
            <button className="recipe-primary-btn" onClick={handleSelectDiet}>
              오늘의 식단으로 선택
            </button>
            <button
              type="button"
              className="recipe-secondary-btn"
              onClick={() => setLiked(!liked)}
            >
              즐겨찾기에 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail