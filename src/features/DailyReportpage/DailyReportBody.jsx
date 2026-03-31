import { useState, useEffect } from 'react'
import axios from 'axios'
import DailyDiet from './DailyDiet'
import DailyBowel from './DailyBowel'
import DailyCondition from './DailyCondition'

const DailyReportBody = () => {
  const user_idx = sessionStorage.getItem('user_idx')

  // 식단
  const [selectedDiets, setSelectedDiets] = useState([])
  const [savedDietFeedbacks, setSavedDietFeedbacks] = useState({})

  // 배변
  const [defecationTime, setDefecationTime] = useState('')
  const [defecationType, setDefecationType] = useState(4)
  const [bowelList, setBowelList] = useState([])

  // 컨디션
  const [condition, setCondition] = useState(3)
  const [sleepTime, setSleepTime] = useState('')
  const [waterIntake, setWaterIntake] = useState('')
  const [stomachPain, setStomachPain] = useState(false)
  const [painLevel, setPainLevel] = useState(1)
  const [conditionData, setConditionData] = useState(null)

  const fetchBowelList = () => {
    if (!user_idx) return
    axios.get(`http://localhost:3000/daily/getBowelLog?user_idx=${user_idx}`)
      .then(res => { if (Array.isArray(res.data)) setBowelList(res.data) })
      .catch(err => console.error('배변 기록 조회 실패:', err))
  }

  const fetchCondition = () => {
    if (!user_idx) return
    axios.get(`http://localhost:3000/daily/getCondition?user_idx=${user_idx}`)
      .then(res => {
        if (res.data && Object.keys(res.data).length > 0) {
          setConditionData(res.data)
          if (res.data.condition_score) setCondition(Number(res.data.condition_score))
          if (res.data.water_intake)   setWaterIntake(String(res.data.water_intake))
          setStomachPain(res.data.stomach_pain === 'Y')
          if (res.data.stomach_score)  setPainLevel(Number(res.data.stomach_score))
        }
      })
      .catch(err => console.error('컨디션 조회 실패:', err))
  }

  useEffect(() => {
    if (!user_idx) return

    // 식단 목록 (diet_idx, meal_type, select_date)
    axios.get(`http://localhost:3000/recipe/dailydiet?user_idx=${user_idx}`)
      .then(res => { if (Array.isArray(res.data)) setSelectedDiets(res.data) })
      .catch(err => console.error('식단 조회 실패:', err))

    // 식단 피드백/별점 (저장된 값 pre-fill용)
    axios.get(`http://localhost:3000/daily/getDailyDiet?user_idx=${user_idx}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          const map = {}
          res.data.forEach(d => {
            map[d.diet_idx] = { feedback: d.diet_feedback || '', rating: Number(d.diet_rating ?? d.rating) || 0 }
          })
          setSavedDietFeedbacks(map)
        }
      })
      .catch(err => console.error('식단 피드백 조회 실패:', err))

    fetchBowelList()
    fetchCondition()
  }, [])

  const handleDietSave = async (diet_idx, feedback, rating) => {
    if (!user_idx) { alert('로그인이 필요합니다.'); return }
    try {
      const res = await axios.post('http://localhost:3000/updateDiet', {
        diet_idx,
        diet_feedback: feedback || '',
        diet_rating: rating || 0,
      })
      if (res.data == 1 || res.data === '1') {
        alert('저장되었습니다.')
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('식단 저장 실패:', err)
      alert('저장에 실패했습니다.')
    }
  }

  const handleBowelSave = async () => {
    if (!user_idx) { alert('로그인이 필요합니다.'); return }
    if (!defecationTime) { alert('배변 시간을 입력해주세요.'); return }
    try {
      const res = await axios.post('http://localhost:3000/daily/saveBowelLog', {
        user_idx,
        bowel_status: String(defecationType),
        bowel_at: defecationTime,
      })
      if (res.data == 1 || res.data === '1') {
        setDefecationTime('')
        setDefecationType(4)
        fetchBowelList()
        alert('저장되었습니다.')
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('배변 저장 실패:', err)
      alert('저장에 실패했습니다.')
    }
  }

  const handleConditionSave = async () => {
    if (!user_idx) { alert('로그인이 필요합니다.'); return }
    try {
      const res = await axios.post('http://localhost:3000/daily/saveCondition', {
        user_idx,
        condition_score: condition || 3,
        sleep_score: sleepTime !== '' ? parseFloat(sleepTime) : 0,
        water_intake: waterIntake !== '' ? parseInt(waterIntake) : 0,
        stomach_pain: stomachPain ? 'Y' : 'N',
        pain_level: painLevel || 1,
      })
      if (res.data == 1 || res.data === '1') {
        fetchCondition()
        alert('저장되었습니다.')
      } else {
        alert('저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('컨디션 저장 실패:', err)
      alert('저장에 실패했습니다.')
    }
  }

  return (
    <div className='main-content'>
      <div className='daily-body'>
        <DailyDiet
          selectedDiets={selectedDiets}
          setSelectedDiets={setSelectedDiets}
          savedDietFeedbacks={savedDietFeedbacks}
          onSave={handleDietSave}
        />
        <DailyBowel
          defecationTime={defecationTime}
          setDefecationTime={setDefecationTime}
          defecationType={defecationType}
          setDefecationType={setDefecationType}
          bowelList={bowelList}
          onSave={handleBowelSave}
        />
        <DailyCondition
          condition={condition}
          setCondition={setCondition}
          sleepTime={sleepTime}
          setSleepTime={setSleepTime}
          waterIntake={waterIntake}
          setWaterIntake={setWaterIntake}
          stomachPain={stomachPain}
          setStomachPain={setStomachPain}
          painLevel={painLevel}
          setPainLevel={setPainLevel}
          conditionData={conditionData}
          onSave={handleConditionSave}
        />
      </div>
    </div>
  )
}

export default DailyReportBody
