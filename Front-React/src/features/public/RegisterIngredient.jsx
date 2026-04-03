import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast, ToastContainer } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './RegisterIngredient.css'
import '../Mainpage/MainRecipe.css'
import FridgeImageUploadModal from './FridgeImageUpload'

const RegisterIngredient = ({ onSaveSuccess }) => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState({ show: false, title: '', message: '', variant: 'success' })

  const showToast = (title, message, variant = 'success') => {
    setToast({ show: true, title, message, variant })
  }

  const user_idx = sessionStorage.getItem('user_idx') || 1

  return (
    <section className="ingredient-section">
      <div className="ingredient-header">
        <h3 className="ingredient-title">식재료 생성</h3>
        <p className="ingredient-subtitle">
          Register your ingredients to receive personalized meal recommendations.
        </p>
      </div>

      <div className="ingredient-action-list">
        <button className="ingredient-action primary" onClick={() => setShowModal(true)}>
          <span className="ingredient-action-icon">📷</span>
          <span>식재료 스캔</span>
        </button>

        <button
          className="ingredient-action secondary"
          onClick={() => navigate('/IngredientForm')}
        >
          <span className="ingredient-action-icon">✏️</span>
          <span>수동 입력</span>
        </button>
      </div>

      <FridgeImageUploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        user_idx={user_idx}
        showToast={showToast}
        onSaveSuccess={onSaveSuccess}
      />

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'success' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </section>
  )
}

export default RegisterIngredient
