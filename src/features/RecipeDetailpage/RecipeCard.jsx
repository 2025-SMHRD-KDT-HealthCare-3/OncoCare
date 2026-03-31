import { useNavigate } from 'react-router-dom'
import '../Mainpage/MainRecipe.css'

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate()

  const clickRecipe = async (user_idx, recipe_idx) => {
    try {
        const response = await axios.post('http://localhost:3000/main/clickRecipe', {
            user_idx: user_idx,
            recipe_idx: recipe_idx
        });
        if (response.data == '1') {
            alert('식단이 추가되었습니다.');
        } else {
            alert('식단 추가 실패');
        }
    } catch (error) {
        console.error('식단 선택 에러:', error);
    }

  }

  return (
    <div className="recipe-card" onDoubleClick={clickRecipe}>
      <div className="recipe-card-img">
        {recipe?.image_url
          ? <img src={recipe.image_url} alt={recipe.name} />
          : <div className="recipe-card-img-placeholder" />
        }
      </div>
      <p className="recipe-card-name">{recipe?.name || 'Recipe'}</p>
    </div>
  )
}

export default RecipeCard
