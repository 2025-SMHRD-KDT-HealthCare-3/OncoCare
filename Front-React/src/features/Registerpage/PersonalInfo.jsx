import MainHeader from '../public/MainHeader'
import RegisterBody from './RegisterBody'
import Footer from '../public/Footer'

const PersonalInfo = () => {
  return (
    <div className="page-layout">
      <MainHeader />
      <RegisterBody mode="edit" />
      <Footer></Footer>
    </div>
  )
}

export default PersonalInfo
