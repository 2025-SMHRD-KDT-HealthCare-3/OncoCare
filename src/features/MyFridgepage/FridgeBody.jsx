import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Fridge.css'
import '../public/root.css'

const FridgeBody = () => {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState([])

  useEffect(() => {
    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) return
    axios.get(`http://localhost:3000/recipe/ingredient?user_idx=${user_idx}`)
      .then(res => { if (Array.isArray(res.data)) setIngredients(res.data) })
      .catch(err => console.error('식재료 조회 실패:', err))
  }, [])

  return (
    <div className="main-content">
      {/* 히어로 배너 */}
      <div className="fridge-hero">
        <h1 className="fridge-hero-title">냉장고 인벤토리</h1>
        <p className="fridge-hero-sub">나의 냉장고 속 식재료를 관리하세요.</p>
      </div>

      <div className="fridge-content">
        {/* 섹션 헤더 */}
        <div className="fridge-section-header">
          <h2 className="fridge-section-title">냉장고 인벤토리</h2>
          <p className="fridge-section-sub">현재 보유 중인 식재료 목록이에요.</p>
        </div>

        {/* 식재료 카드 그리드 */}
        <div className="fridge-grid">
          {ingredients.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '14px' }}>등록된 식재료가 없습니다.</p>
          ) : (
            ingredients.map((item) => (
              <div key={item.ingre_idx} className="fridge-card" onDoubleClick={() => navigate(`/IngredientForm/${item.ingre_idx}`)} style={{ cursor: 'pointer' }}>
                <div className="fridge-card-img-placeholder" />
                <div className="fridge-card-info">
                  <h5 className="fridge-card-name">{item.ingre_name}</h5>
                  <p className="fridge-card-desc">
                    {item.ingre_type} · {item.ingre_storage} · {item.cnt}개
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default FridgeBody
