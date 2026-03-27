import { useEffect, useState } from 'react'
import axios from 'axios'
import RecipeCard from './RecipeCard'
import '../css/MainRecipe.css'

const MainRecipe = ({ user_idx }) => {
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')

const getDietList = async (user_idx) => {
    try {
        const response = await axios.get(`http://localhost:3000/dietList/${user_idx}`);
        if (response.data === '0') {
            console.log("건강 프로필이 없거나 레시피가 없습니다.");
            alert('건강 정보를 먼저 입력해주세요.')
            return; // 프론트에서 프로필 입력창을 띄우는 로직 처리, 
        }
        setRecipes(response.data); // 레시피 리스트 배열 반환
    } catch (error) {
        console.error("추천 식단 조회 에러:", error);
    }
};


  useEffect(() => {
    if (user_idx) getDietList(user_idx)
  }, [user_idx])

  const filtered = recipes.filter((r) =>
    r.recipe_name?.includes(search)
  )

  // 4개 / 나머지로 분리
  const topRow = filtered.slice(0, 4)
  const bottomRow = filtered.slice(4)

  return (
    <div className="recipe-section">
      {/* 헤더 */}
      <div className="recipe-section-header">
        <div>
          <h2 className="recipe-section-title">추천 식단</h2>
          <p className="recipe-section-sub">더블클릭하면 레시피를 볼 수 있어요!</p>
        </div>
      </div>

      {/* 검색 + New 버튼 */}
      <div className="recipe-toolbar">
        <div className="recipe-search-box">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="recipe-search-input"
          />
          <span className="recipe-search-icon">🔍</span>
        </div>
        <button className="recipe-new-btn" onClick={() => getDietList(user_idx)}>
          ✓ New
        </button>
      </div>

      {/* 카드 그리드 */}
      <div className="recipe-grid-top">
        {topRow.map((recipes) => (
          <RecipeCard key={recipes.recipe_idx} recipe={recipes} />
        ))}
      </div>

      {bottomRow.length > 0 && (
        <div className="recipe-grid-bottom">
          {bottomRow.map((recipes) => (
            <RecipeCard key={recipes.recipe_idx} recipe={recipes} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MainRecipe
