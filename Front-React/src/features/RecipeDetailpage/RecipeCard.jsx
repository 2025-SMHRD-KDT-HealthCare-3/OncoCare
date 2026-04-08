import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Mainpage/MainRecipe.css'
import { getCategoryImage } from '../../utils/categoryImageMap'

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate()
  const img = useMemo(
    () => getCategoryImage(recipe?.recipe_category, recipe?.recipe_name),
    [recipe?.recipe_category, recipe?.recipe_name]
  )

  return (
    <div className="recipe-card" onDoubleClick={() => navigate(`/RecipeDetail/${recipe.recipe_idx}`)}>
      <div className="recipe-card-img">
        <img src={img} alt={recipe?.recipe_name || 'Recipe'} className="recipe-card-image" />
      </div>
      <p className="recipe-card-name">{recipe?.recipe_name || 'Recipe'}</p>
    </div>
  )
}

export default RecipeCard
