import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import axios from 'axios'
import '../css/root.css'
import '../css/IngredientForm.css'

const CATEGORIES = ['채소', '과일', '육류', '해산물', '유제품', '곡류', '양념/소스', '기타']
const STORAGE_TYPES = ['냉장', '냉동', '실온']

const IngredientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [storageType, setStorageType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    axios.get(`http://localhost:3000/ingredient/${id}`)
      .then(res => {
        setName(res.data.name || '')
        setCategory(res.data.category || '')
        setStorageType(res.data.storageType || '')
        setQuantity(res.data.quantity || '')
      })
      .catch(err => console.error('식재료 조회 실패:', err))
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { alert('식재료 이름을 입력해주세요.'); return }
    if (!category) { alert('종류를 선택해주세요.'); return }
    if (!storageType) { alert('보관 형태를 선택해주세요.'); return }
    if (!quantity.trim()) { alert('수량을 입력해주세요.'); return }

    const payload = { name, category, storageType, quantity }

    try {
      if (isEdit) {
        await axios.put(`http://localhost:3000/ingredient/${id}`, payload)
        alert('식재료가 수정되었습니다!')
      } else {
        await axios.post('http://localhost:3000/ingredient', payload)
        alert('식재료가 등록되었습니다!')
      }
      navigate('/Fridge')
    } catch (err) {
      console.error('식재료 저장 실패:', err)
      alert('저장에 실패했습니다.')
    }
  }

  return (
    <div className="page-layout main-content">
      <MainHeader />
      <div className="ingredient-form-container main-content">
        <button className="ingredient-form-back" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>

        <div className="ingredient-form-layout">
          {/* 왼쪽: 이미지 */}
          <div className="ingredient-form-image-section">
            <button
              className={`ingredient-heart-btn ${liked ? 'liked' : ''}`}
              type="button"
              onClick={() => setLiked(!liked)}
            >
              ♥
            </button>
            <div className="ingredient-form-img-placeholder" />
          </div>

          {/* 오른쪽: 폼 */}
          <form className="ingredient-form-info" onSubmit={handleSubmit}>
            <h1 className="ingredient-form-title">식재료 생성/수정</h1>

            {/* 식재료 이름 */}
            <div className="ingredient-form-group">
              <label className="ingredient-form-label">식재료 이름</label>
              <input
                type="text"
                className="ingredient-form-input"
                placeholder="Value"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* 종류(카테고리) */}
            <div className="ingredient-form-group">
              <label className="ingredient-form-label">종류(카테고리)</label>
              <div className="ingredient-select-wrapper">
                <select
                  className="ingredient-form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Value</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 보관 형태 */}
            <div className="ingredient-form-group">
              <label className="ingredient-form-label">보관 형태</label>
              <div className="ingredient-select-wrapper">
                <select
                  className="ingredient-form-select"
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                >
                  <option value="">Value</option>
                  {STORAGE_TYPES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 수량 */}
            <div className="ingredient-form-group">
              <label className="ingredient-form-label">수량(g, ml, 개)</label>
              <input
                type="text"
                className="ingredient-form-input"
                placeholder="Value"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <button type="submit" className="ingredient-submit-btn">
              식재료 생성/수정
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default IngredientForm
