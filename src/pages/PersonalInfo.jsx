import MainHeader from '../components/MainHeader'
import RegisterBody from '../components/RegisterBody'

const PersonalInfo = () => {
  return (
    <div className="page-layout">
      <MainHeader />
      <RegisterBody mode="edit" />
    </div>
  )
}

export default PersonalInfo
