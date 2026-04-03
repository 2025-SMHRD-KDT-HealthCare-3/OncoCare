import { useState, useEffect } from 'react'
import axios from 'axios'
import DailyDiet from './DailyDiet'
import DailyBowel from './DailyBowel'
import DailyCondition from './DailyCondition'
import { useToast } from '../../context/ToastContext'

const bristolLabels = {
  1: '1형 - 분리된 딱딱한 덩어리 (심한 변비)',
  2: '2형 - 울퉁불퉁한 소시지 모양 (경한 변비)',
  3: '3형 - 표면에 균열 있는 소시지 모양 (정상)',
  4: '4형 - 부드럽고 매끄러운 소시지 모양 (정상)',
  5: '5형 - 경계가 뚜렷한 부드러운 덩어리 (섬유질 부족)',
  6: '6형 - 경계가 불분명한 푹신한 덩어리 (경한 설사)',
  7: '7형 - 고형물 없는 액체 (심한 설사)',
}

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const DailyReportBody = ({ date }) => {
  const { showToast, showConfirm } = useToast()
  const user_idx = sessionStorage.getItem('user_idx')
  const targetDate = date || today()

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
    axios.get(`http://localhost:3000/api/bowel/log?user_idx=${user_idx}&date=${targetDate}`)
      .then(res => { if (Array.isArray(res.data)) setBowelList(res.data) })
      .catch(err => console.error('배변 기록 조회 실패:', err))
  }

  const fetchCondition = () => {
    if (!user_idx) return
    axios.get(`http://localhost:3000/api/condition?user_idx=${user_idx}&date=${targetDate}`)
      .then(res => {
        if (res.data && Object.keys(res.data).length > 0) {
          setConditionData(res.data)
          if (res.data.condition_score) setCondition(Number(res.data.condition_score))
          if (res.data.sleep_score)    setSleepTime(String(res.data.sleep_score))
          if (res.data.water_intake)   setWaterIntake(String(res.data.water_intake))
          setStomachPain(res.data.stomach_pain === 'Y')
          if (res.data.stomach_score)  setPainLevel(Number(res.data.stomach_score))
        } else {
          setConditionData(null)
        }
      })
      .catch(err => console.error('컨디션 조회 실패:', err))
  }

  useEffect(() => {
    if (!user_idx) return

    axios.get(`http://localhost:3000/api/diet/dailydiet?user_idx=${user_idx}&date=${targetDate}`)
      .then(res => { if (Array.isArray(res.data)) setSelectedDiets(res.data) })
      .catch(err => console.error('식단 조회 실패:', err))

    axios.get(`http://localhost:3000/api/diet/getDailyDiet?user_idx=${user_idx}&date=${targetDate}`)
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
  }, [targetDate])

  const handleDietSave = async (diet_idx, feedback, rating) => {
    if (!user_idx) { showToast('알림', '로그인이 필요합니다.', 'warning'); return }
    try {
      const res = await axios.post('http://localhost:3000/api/diet/updateDiet', {
        diet_idx,
        diet_feedback: feedback || '',
        diet_rating: rating || 0,
      })
      if (res.data == 1 || res.data === '1') {
        showToast('저장 완료', '저장되었습니다.', 'success')
      } else {
        showToast('오류', '저장에 실패했습니다.', 'danger')
      }
    } catch (err) {
      console.error('식단 저장 실패:', err)
      showToast('오류', '저장에 실패했습니다.', 'danger')
    }
  }

  const handleBowelDelete = async (bowel_idx) => {
    const ok = await showConfirm('삭제 확인', '배변 기록을 삭제할까요?')
    if (!ok) return
    try {
      const res = await axios.post('http://localhost:3000/api/bowel/delete', { bowel_idx })
      if (res.data == 1 || res.data === '1') {
        fetchBowelList()
      } else {
        showToast('오류', '삭제에 실패했습니다.', 'danger')
      }
    } catch (err) {
      console.error('배변 삭제 실패:', err)
      showToast('오류', '삭제에 실패했습니다.', 'danger')
    }
  }

  const handleBowelSave = async () => {
    if (!user_idx) { showToast('알림', '로그인이 필요합니다.', 'warning'); return }
    if (!defecationTime) { showToast('알림', '배변 시간을 입력해주세요.', 'warning'); return }
    try {
      const res = await axios.post('http://localhost:3000/api/bowel/save', {
        user_idx,
        bowel_status: bristolLabels[defecationType],
        bowel_at: defecationTime,
        date: targetDate,
      })
      if (res.data == 1 || res.data === '1') {
        setDefecationTime('')
        setDefecationType(4)
        fetchBowelList()
        showToast('저장 완료', '저장되었습니다.', 'success')
      } else {
        showToast('오류', '저장에 실패했습니다.', 'danger')
      }
    } catch (err) {
      console.error('배변 저장 실패:', err)
      showToast('오류', '저장에 실패했습니다.', 'danger')
    }
  }

  const handleConditionSave = async () => {
    if (!user_idx) { showToast('알림', '로그인이 필요합니다.', 'warning'); return }
    try {
      const res = await axios.post('http://localhost:3000/api/condition/save', {
        user_idx,
        condition_score: condition || 3,
        sleep_score: sleepTime !== '' ? parseFloat(sleepTime) : 0,
        water_intake: waterIntake !== '' ? parseInt(waterIntake) : 0,
        stomach_pain: stomachPain ? 'Y' : 'N',
        pain_level: painLevel || 1,
        date: targetDate,
      })
      if (res.data == 1 || res.data === '1') {
        fetchCondition()
        showToast('저장 완료', '저장되었습니다.', 'success')
      } else {
        showToast('오류', '저장에 실패했습니다.', 'danger')
      }
    } catch (err) {
      console.error('컨디션 저장 실패:', err)
      showToast('오류', '저장에 실패했습니다.', 'danger')
    }
  }

  return (
    <div className="daily-log-container">
      <div className="daily-log-left">
        <DailyDiet
          selectedDiets={selectedDiets}
          setSelectedDiets={setSelectedDiets}
          savedDietFeedbacks={savedDietFeedbacks}
          onSave={handleDietSave}
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
      <div className="daily-log-right">
        <DailyBowel
          defecationTime={defecationTime}
          setDefecationTime={setDefecationTime}
          defecationType={defecationType}
          setDefecationType={setDefecationType}
          bowelList={bowelList}
          onSave={handleBowelSave}
          onDelete={handleBowelDelete}
        />
      </div>
    </div>
  )
}

export default DailyReportBody
