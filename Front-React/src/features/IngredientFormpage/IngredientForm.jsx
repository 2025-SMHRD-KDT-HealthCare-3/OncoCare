import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../public/Sidebar'
import axios from 'axios'
import { useToast } from '../../context/ToastContext'
import '../public/root.css'
import './IngredientForm.css'
import Footer from '../public/Footer'
import deco from '../../assets/ingredient_page_footer_1.jpg'

const CATEGORIES = ['채소', '과일', '육류', '해산물', '유제품', '곡류', '양념/소스', '기타']
const STORAGE_TYPES = ['냉장', '냉동', '실온']
const UNIT_TYPES = ['개', 'g', 'ml', '팩', '모', '뿌리', '장', '마리']

const IngredientForm = () => {
  const { showToast, showConfirm } = useToast()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [name, setName] = useState('')
  const [category, setCategory] = useState(() => searchParams.get('category') || '')
  const [storageType, setStorageType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('개') // 기본 단위 '개'

  useEffect(() => {
    if (!isEdit) return
    axios.get(`http://localhost:3000/api/ingredient/detail?ingre_idx=${id}`)
      .then(res => {
        if (!res.data || res.data === '0') return
        setName(res.data.ingre_name || '')
        setCategory(res.data.ingre_type || '')
        setStorageType(res.data.ingre_storage || '')
        setQuantity(res.data.cnt || '')
        setUnit(res.data.ingre_unit || '개') // DB에서 단위도 가져오기
      })
      .catch(err => console.error('식재료 조회 실패:', err))
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { showToast('알림', '식재료 이름을 입력해주세요.', 'warning'); return }
    if (!category) { showToast('알림', '종류를 선택해주세요.', 'warning'); return }
    if (!storageType) { showToast('알림', '보관 형태를 선택해주세요.', 'warning'); return }
    if (!quantity.toString().trim()) { showToast('알림', '수량을 입력해주세요.', 'warning'); return }

    const user_idx = sessionStorage.getItem('user_idx')
    if (!user_idx) { showToast('알림', '로그인이 필요합니다.', 'warning'); return }

    try {
      if (isEdit) {
        const payload = { ingre_idx: id, user_idx, ingre_name: name, ingre_type: category, ingre_storage: storageType, cnt: parseFloat(quantity), ingre_unit: unit }
        const res = await axios.post('http://localhost:3000/api/ingredient/update', payload)
        if (res.data == '1') { showToast('수정 완료', '식재료가 수정되었습니다!', 'success') }
        else { showToast('오류', '식재료 수정에 실패했습니다.', 'danger'); return }
      } else {
        const payload = { user_idx, name, type: category, storage: storageType, cnt: parseFloat(quantity), unit: unit }
        const res = await axios.post('http://localhost:3000/api/ingredient/register', payload)
        if (res.data == '1') { showToast('등록 완료', '식재료가 등록되었습니다!', 'success') }
        else { showToast('오류', '식재료 등록에 실패했습니다.', 'danger'); return }
      }
      navigate('/Fridge')
    } catch (err) {
      console.error('식재료 저장 실패:', err)
      showToast('오류', '저장에 실패했습니다.', 'danger')
    }
  }

  const handleDelete = async () => {
    const ok = await showConfirm('삭제 확인', '식재료를 삭제하시겠습니까?')
    if (!ok) return
    const user_idx = sessionStorage.getItem('user_idx')
    try {
      const res = await axios.post('http://localhost:3000/api/ingredient/delete', { ingre_idx: id, user_idx })
      if (res.data == '1') { showToast('삭제 완료', '삭제되었습니다.', 'success'); navigate('/Fridge') }
      else { showToast('오류', '삭제에 실패했습니다.', 'danger') }
    } catch (err) {
      console.error('삭제 실패:', err)
      showToast('오류', '삭제에 실패했습니다.', 'danger')
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
                <label className="if-label">식재료 이름</label>
                <input
                  className="if-input"
                  type="text"
                  placeholder="예: 유기농 캐모마일"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* 카테고리 + 보관 형태 */}
              <div className="if-row">
                <div className="if-field">
                  <label className="if-label">카테고리</label>
                  <div className="if-select-wrap">
                    <select
                      className="if-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">카테고리 선택</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span className="if-select-arrow">⌄</span>
                  </div>
                </div>
                <div className="if-field">
                  <label className="if-label">보관 형태</label>
                  <div className="if-select-wrap">
                    <select
                      className="if-select"
                      value={storageType}
                      onChange={(e) => setStorageType(e.target.value)}
                    >
                      <option value="">보관 형태 선택</option>
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
                <label className="if-label">수량</label>
                <div className="if-qty-row">
                  <input
                    className="if-input if-qty-input"
                    type="number"
                    placeholder="0"
                    value={quantity}
                    min="0"
                    max="10000"
                  step="0.1"
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '') { setQuantity(''); return }
                      if (parseFloat(val) > 10000) return
                      setQuantity(val)
                    }}
                  />
                  <div className="if-select-wrap if-unit-wrap">
                  <select className="if-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    {UNIT_TYPES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  </div>
                </div>
              </div>

              {/* Stock Reminder */}
              <div className="if-reminder">
                <div className="if-reminder-icon">ℹ</div>
                <div className="if-reminder-body">
                  <span className="if-reminder-title">재고 알림</span>
                  <p className="if-reminder-text">
                    재고가 없으면 자동으로 알림을 보내드립니다.
                  </p>
                </div>
              </div>

              {/* 버튼 */}
              <div className="if-btn-row">
                <button type="submit" className="if-save-btn">
                  {isEdit ? '변경 저장' : '식재료 등록'}
                </button>
                <button type="button" className="if-cancel-btn" onClick={() => navigate(-1)}>
                  취소
                </button>
              </div>

            </form>

            {isEdit && (
              <button type="button" className="if-remove-btn" onClick={handleDelete}>
                🗑 식재료 삭제
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
