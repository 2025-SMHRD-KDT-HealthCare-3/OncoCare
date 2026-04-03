import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Toast, ToastContainer, Modal, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [confirm, setConfirm] = useState(null)
  const resolveRef = useRef(null)

  const showToast = useCallback((title, message, variant = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const showConfirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setConfirm({ title, message })
    })
  }, [])

  const handleConfirmClose = (result) => {
    setConfirm(null)
    resolveRef.current?.(result)
    resolveRef.current = null
  }

  const variantStyle = (variant) => {
    const map = {
      success: { bg: '#f0faf2', border: '#b7dfc1', icon: '🌿', titleColor: '#1a4a2e' },
      danger:  { bg: '#fff5f5', border: '#f5c6cb', icon: '⚠️', titleColor: '#842029' },
      warning: { bg: '#fffbf0', border: '#ffeeba', icon: '📢', titleColor: '#856404' },
      info:    { bg: '#f0f7ff', border: '#b8daff', icon: '💬', titleColor: '#0c5460' },
    }
    return map[variant] || map.info
  }

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* ── Toast 알림 ── */}
      <ToastContainer
        position="bottom-end"
        className="p-3"
        style={{ zIndex: 9999, position: 'fixed' }}
      >
        {toasts.map(({ id, title, message, variant }) => {
          const s = variantStyle(variant)
          return (
            <Toast
              key={id}
              show
              onClose={() => setToasts(prev => prev.filter(t => t.id !== id))}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: '16px',
                minWidth: '280px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}
            >
              <Toast.Header
                closeButton
                style={{
                  background: 'transparent',
                  border: 'none',
                  paddingBottom: '4px',
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '8px' }}>{s.icon}</span>
                <strong style={{ color: s.titleColor, fontSize: '15px', flex: 1 }}>{title}</strong>
              </Toast.Header>
              <Toast.Body style={{ color: '#333', fontSize: '14px', paddingTop: '0' }}>
                {message}
              </Toast.Body>
            </Toast>
          )
        })}
      </ToastContainer>

      {/* ── Confirm 모달 ── */}
      <Modal
        show={!!confirm}
        onHide={() => handleConfirmClose(false)}
        centered
        size="sm"
      >
        <Modal.Body style={{ padding: '28px 24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌿</div>
          <h5 style={{ fontWeight: 800, color: '#1a4a2e', marginBottom: '10px' }}>
            {confirm?.title}
          </h5>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '0' }}>
            {confirm?.message}
          </p>
        </Modal.Body>
        <Modal.Footer style={{ border: 'none', justifyContent: 'space-between', padding: '8px 24px 20px' }}>
          <Button
            variant="link"
            onClick={() => handleConfirmClose(false)}
            style={{ color: '#888', fontWeight: 700, textDecoration: 'none' }}
          >
            닫기
          </Button>
          <Button
            onClick={() => handleConfirmClose(true)}
            style={{
              background: '#2a5c1e',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 28px',
              fontWeight: 700,
            }}
          >
            확인
          </Button>
        </Modal.Footer>
      </Modal>
    </ToastContext.Provider>
  )
}
