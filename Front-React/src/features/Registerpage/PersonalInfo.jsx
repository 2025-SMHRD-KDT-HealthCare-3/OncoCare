import Sidebar from '../public/Sidebar'
import RegisterBody from './RegisterBody'
import Footer from '../public/Footer'

const PersonalInfo = () => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <RegisterBody mode="edit" />
        <Footer />
      </div>
    </div>
  )
}

export default PersonalInfo
