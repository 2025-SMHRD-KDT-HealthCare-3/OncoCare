import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import introVideo from '../../assets/oncocare_start.mp4'
import './Intro.css'

const Intro = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/Auth')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  const handleVideoEnd = () => {
    navigate('/Auth')
  }

  return (
    <div className="intro-wrapper">
      <video
        ref={videoRef}
        className="intro-video"
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      />
      <button className="intro-skip-btn" onClick={() => navigate('/Auth')}>
        건너뛰기 ›
      </button>
    </div>
  )
}

export default Intro
