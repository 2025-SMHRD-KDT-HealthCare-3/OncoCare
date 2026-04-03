import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../public/Sidebar'
import axios from 'axios'
import '../public/root.css'
import './IngredientForm.css'
import Footer from '../public/Footer'
import deco from '../../assets/ingredient_page_footer_1.jpg'

const CATEGORIES = ['채소', '과일', '육류', '해산물', '유제품', '곡류', '양념/소스', '기타']
const STORAGE_TYPES = ['냉장', '냉동', '실온']
const UNITS = ['g', 'ml', '개', 'kg', 'L']

const IngredientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [storageType, setStorageType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')

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
    if (!quantity.toString().trim()) { alert('수량을 입력해주세요.'); return }

    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) { alert('로그인이 필요합니다.'); return }

    try {
      if (isEdit) {
        const payload = { ingre_idx: id, user_idx, ingre_name: name, ingre_type: category, ingre_storage: storageType, cnt: quantity }
        const res = await axios.post('http://localhost:3000/api/ingredient/update', payload)
        if (res.data == '1') { alert('식재료가 수정되었습니다!') }
        else { alert('식재료 수정에 실패했습니다.'); return }
      } else {
        const payload = { user_idx, name, type: category, storage: storageType, cnt: quantity }
        const res = await axios.post('http://localhost:3000/api/ingredient/register', payload)
        if (res.data == '1') { alert('식재료가 등록되었습니다!') }
        else { alert('식재료 등록에 실패했습니다.'); return }
      }
      navigate('/Fridge')
    } catch (err) {
      console.error('식재료 저장 실패:', err)
      alert('저장에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('식재료를 삭제하시겠습니까?')) return
    const user_idx = sessionStorage.getItem('user_idx')
    try {
      const res = await axios.post('http://localhost:3000/api/ingredient/delete', { ingre_idx: id, user_idx })
      if (res.data == '1') { alert('삭제되었습니다.'); navigate('/Fridge') }
      else { alert('삭제에 실패했습니다.') }
    } catch (err) {
      console.error('삭제 실패:', err)
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <div className="main-content">
          <div className="fr-hero-card">
            <div className="fr-hero-card-body">
              <h1 className="fr-hero-title">
                {isEdit ? '식재료 수정' : '식재료 등록'}
              </h1>
              <p className="fr-hero-sub">
                {isEdit
                  ? '식재료 정보를 수정하고 냉장고를 관리하세요.'
                  : '새로운 식재료를 등록하고 냉장고를 채워보세요.'}
              </p>
            </div>
          </div>
        </div>
        <div className="if-page">

          {/* ── 폼 카드 ── */}
          <div className="if-form-card">
            <form onSubmit={handleSubmit}>

              {/* 식재료 이름 */}
              <div className="if-field">
                <label className="if-label">Ingredient Name</label>
                <input
                  className="if-input"
                  type="text"
                  placeholder="e.g. Organic Chamomile"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* 카테고리 + 보관 형태 */}
              <div className="if-row">
                <div className="if-field">
                  <label className="if-label">Category</label>
                  <div className="if-select-wrap">
                    <select
                      className="if-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span className="if-select-arrow">⌄</span>
                  </div>
                </div>
                <div className="if-field">
                  <label className="if-label">Storage Type</label>
                  <div className="if-select-wrap">
                    <select
                      className="if-select"
                      value={storageType}
                      onChange={(e) => setStorageType(e.target.value)}
                    >
                      <option value="">Select Storage</option>
                      {STORAGE_TYPES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="if-select-arrow">⌄</span>
                  </div>
                </div>
              </div>

              {/* 수량 */}
              <div className="if-field">
                <label className="if-label">Quantity</label>
                <div className="if-qty-row">
                  <input
                    className="if-input if-qty-input"
                    type="number"
                    placeholder="0.00"
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
                  <div className="if-select-wrap if-unit-wrap">
                    <select
                      className="if-select"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <span className="if-select-arrow">⌄</span>
                  </div>
                </div>
              </div>

              {/* Stock Reminder */}
              <div className="if-reminder">
                <div className="if-reminder-icon">ℹ</div>
                <div className="if-reminder-body">
                  <span className="if-reminder-title">STOCK REMINDER</span>
                  <p className="if-reminder-text">
                    재고가 초기 등록 수량의 20%에 도달하면 자동으로 알림을 보내드립니다.
                  </p>
                </div>
              </div>

              {/* 버튼 */}
              <div className="if-btn-row">
                <button type="submit" className="if-save-btn">
                  {isEdit ? 'Save Changes' : 'Register Ingredient'}
                </button>
                <button type="button" className="if-cancel-btn" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>

            </form>

            {isEdit && (
              <button type="button" className="if-remove-btn" onClick={handleDelete}>
                🗑 REMOVE INGREDIENT
              </button>
            )}
          </div>

          {/* ── 하단 장식 이미지 ── */}
          <div className="if-deco-row">
            <img src={deco} alt="Decoration" className="if-deco-img" />
          </div>

        </div>{/* if-page */}
        <Footer />
      </div>
    </div>
  )
}

export default IngredientForm
