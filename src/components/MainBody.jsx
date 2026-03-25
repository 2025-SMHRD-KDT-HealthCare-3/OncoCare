import React from 'react'
import { useState } from 'react'
import '../css/MainBody.css'
import '../css/root.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'

const MainBody = () => {

    const [selectedDate, setSelectedDate] = useState(new Date())


  return (
    <div className="main-content two-column-wrapper">


            {/* 왼쪽 - 패널 */}
      <div className="panel-box">
        {selectedDate ? (
          <>
            <h5 className="panel-date">
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h5>
            <p className="panel-content">날짜를 선택했어요!</p>
            {/* 나중에 리포트 내용 여기에 */}
          </>
        ) : (
          <div className="panel-placeholder">
            <p>날짜를 선택하면</p>
            <p>내용이 표시됩니다</p>
          </div>
        )}
      </div>

      {/* 오른쪽 - 미니 캘린더 */}
      <div className="calendar-box">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          locale={ko}
          inline  // ← 항상 열려있게
          calendarClassName="custom-calendar"
        />
      </div>

    </div>
  )
}

export default MainBody