import { useEffect, useState } from 'react'
import axios from 'axios'
import RecipeCard from './RecipeCard'

const MainRecipe = ({ mealsPerDay }) => {
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/recipe/recommend?count=${mealsPerDay}`
        )
        setRecipes(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchRecipes()
  }, [mealsPerDay])

  return (
    <div className="recipe-section">
      <h3>오늘의 추천 식단</h3>
      <p className="recipe-subtitle">더블클릭하면 레시피를 볼 수 있어요!</p>
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}

export default MainRecipe