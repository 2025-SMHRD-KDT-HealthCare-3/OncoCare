import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../public/Sidebar'
import axios from 'axios'
import '../public/root.css'
import './IngredientForm.css'
import Footer from '../public/Footer'

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
    axios.get(`http://localhost:3000/api/ingredient/detail?ingre_idx=${id}`)
      .then(res => {
        if (!res.data || res.data === '0') return
        setName(res.data.ingre_name || '')
        setCategory(res.data.ingre_type || '')
        setStorageType(res.data.ingre_storage || '')
        setQuantity(res.data.cnt || '')
      })
      .catch(err => console.error('식재료 조회 실패:', err))
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { alert('식재료 이름을 입력해주세요.'); return }
    if (!category) { alert('종류를 선택해주세요.'); return }
    if (!storageType) { alert('보관 형태를 선택해주세요.'); return }
    if (!quantity.trim()) { alert('수량을 입력해주세요.'); return }

    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) { alert('로그인이 필요합니다.'); return }

    try {
      if (isEdit) {
        const payload = { ingre_idx: id, user_idx, ingre_name: name, ingre_type: category, ingre_storage: storageType, cnt: quantity }
        const res = await axios.post('http://localhost:3000/api/ingredient/update', payload)
        if (res.data == '1') {
          alert('식재료가 수정되었습니다!')
        } else {
          alert('식재료 수정에 실패했습니다.')
          return
        }
      } else {
        const payload = { user_idx, name, type: category, storage: storageType, cnt: quantity }
        const res = await axios.post('http://localhost:3000/api/ingredient/register', payload)
        if (res.data == '1') {
          alert('식재료가 등록되었습니다!')
        } else {
          alert('식재료 등록에 실패했습니다.')
          return
        }
      }
      navigate('/Fridge')
    } catch (err) {
      console.error('식재료 저장 실패:', err)
      alert('저장에 실패했습니다.')
    }
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area main-content">
        <div className="ingredient-form-container">
          <button className="ingredient-form-back" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>

          <div className="ingredient-form-layout">
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

            <form className="ingredient-form-info" onSubmit={handleSubmit}>
              <h1 className="ingredient-form-title">식재료 생성/수정</h1>

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

              <div className="ingredient-form-group">
                <label className="ingredient-form-label">수량(g, ml, 개)</label>
                <input
                  type="number"
                  className="ingredient-form-input"
                  placeholder="Value"
                  value={quantity}
                  min="0"
                  max="10000"
                  step="0.1"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '') { setQuantity(''); return }
                    if (parseFloat(val) > 10000) return
                    if (/^\d+(\.\d{2,})$/.test(val)) return
                    setQuantity(val)
                  }}
                />
              </div>

              <button type="submit" className="ingredient-submit-btn">
                식재료 생성/수정
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default IngredientForm
