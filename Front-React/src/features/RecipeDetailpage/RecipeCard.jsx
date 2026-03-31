import { useNavigate } from 'react-router-dom'
import '../Mainpage/MainRecipe.css'

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate()

  return (
    <div className="recipe-card" onDoubleClick={() => navigate(`/RecipeDetail/${recipe.recipe_idx}`)}>
      <div className="recipe-card-img">
        {recipe?.image_url
          ? <img src={recipe.image_url} alt={recipe.name} />
          : <div className="recipe-card-img-placeholder" />
        }
      </div>
      <p className="recipe-card-name">{recipe?.recipe_name || 'Recipe'}</p>
    </div>
  )
}

export default RecipeCard
