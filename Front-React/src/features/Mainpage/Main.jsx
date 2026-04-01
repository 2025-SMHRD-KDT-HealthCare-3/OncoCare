import MainBody from './MainBody'
import Sidebar from '../public/Sidebar'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Footer from '../public/Footer'
import '../public/root.css'

const Main = () => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content-area">
        <MainBody />
        <Footer />
      </div>
    </div>
  )
}

export default Main
