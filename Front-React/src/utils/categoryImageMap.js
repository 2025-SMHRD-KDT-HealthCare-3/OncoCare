const categoryImageMap = {
  '죽/스프': [
    'https://images.pexels.com/photos/32835478/pexels-photo-32835478.jpeg',
    'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    'https://images.pexels.com/photos/19870705/pexels-photo-19870705.jpeg',
  ],

  '밥류': [
    'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg',
    'https://images.pexels.com/photos/8956665/pexels-photo-8956665.jpeg',
    'https://images.pexels.com/photos/28503583/pexels-photo-28503583.jpeg',
  ],

  '국/탕류': [
    'https://images.pexels.com/photos/8995036/pexels-photo-8995036.jpeg',
    'https://images.pexels.com/photos/15568732/pexels-photo-15568732.jpeg',
    'https://images.pexels.com/photos/4985530/pexels-photo-4985530.jpeg',
  ],

  '반찬류': [
    'https://images.pexels.com/photos/6919802/pexels-photo-6919802.jpeg',
    'https://images.pexels.com/photos/13774715/pexels-photo-13774715.jpeg',
    'https://images.pexels.com/photos/2781540/pexels-photo-2781540.jpeg',
  ],

  '면류': [
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    'https://images.pexels.com/photos/8980451/pexels-photo-8980451.jpeg',
    'https://images.pexels.com/photos/31637825/pexels-photo-31637825.jpeg',
  ],

  '단백질요리': [
    'https://images.pexels.com/photos/17026887/pexels-photo-17026887.jpeg',
    'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg',
    'https://images.pexels.com/photos/36593628/pexels-photo-36593628.jpeg',
  ],

  '샐러드': [
    'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg',
    'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg',
    'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
  ],

  '과일': [
    'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
    'https://images.pexels.com/photos/247685/pexels-photo-247685.png',
    'https://images.pexels.com/photos/4113820/pexels-photo-4113820.jpeg',
  ],

  '간식': [
    'https://images.pexels.com/photos/17202145/pexels-photo-17202145.jpeg',
    'https://images.pexels.com/photos/34636899/pexels-photo-34636899.jpeg',
    'https://images.pexels.com/photos/30265685/pexels-photo-30265685.jpeg',
  ],

  '음료': [
    'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    'https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg',
    'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg',
  ],

  '찜류': [
    'https://images.pexels.com/photos/7491882/pexels-photo-7491882.jpeg',
    'https://images.pexels.com/photos/31415420/pexels-photo-31415420.jpeg',
    'https://images.pexels.com/photos/19092936/pexels-photo-19092936.jpeg',
  ],
}

export const categoryBadge = {
  '죽/스프': '부드러운 식감',
  '밥류': '저잔사 식단',
  '국/탕류': '편안한 국물',
  '반찬류': '균형 잡힌 반찬',
  '면류': '소화가 쉬운 면',
  '단백질요리': '고단백 회복식',
  '샐러드': '신선한 채소식',
  '과일': '비타민 보충',
  '간식': '가벼운 간식',
  '음료': '수분 보충',
  '찜류': '부드러운 찜요리',
}

export const categoryDesc = {
  '죽/스프': '부드럽고 촉촉한 식감으로 소화기관에 부담을 덜어주는 회복식입니다.',
  '밥류': '자극이 적은 곡물 중심 식사로 장에 부담을 줄이며 안정적으로 에너지를 보충합니다.',
  '국/탕류': '따뜻한 국물과 부드러운 재료로 편안하게 섭취할 수 있는 회복 식단입니다.',
  '반찬류': '회복기에 필요한 영양 균형을 고려해 부담 없이 곁들일 수 있는 반찬입니다.',
  '면류': '부드러운 면과 순한 구성으로 예민한 장 상태에서도 비교적 편하게 먹을 수 있습니다.',
  '단백질요리': '회복과 조직 재생에 필요한 단백질을 충분히 보충할 수 있도록 구성한 식단입니다.',
  '샐러드': '신선한 채소를 중심으로 비타민과 항산화 영양소를 보충할 수 있는 메뉴입니다.',
  '과일': '자연스러운 단맛과 비타민으로 하루 에너지와 회복을 돕는 가벼운 식품입니다.',
  '간식': '끼니 사이 허기를 덜고 에너지를 보충할 수 있도록 가볍게 구성한 간식입니다.',
  '음료': '수분 보충에 도움이 되며 속을 편안하게 해주는 순한 음료입니다.',
  '찜류': '촉촉하고 부드럽게 익혀 소화가 편하고 회복기에 부담이 적은 조리 방식의 메뉴입니다.',
}


/** 레시피 이름으로 카테고리 추론 */
export const getCategoryByName = (name = '') => {
  if (
    name.includes('죽') ||
    name.includes('미음') ||
    name.includes('스프') ||
    name.includes('푸딩')
  ) return '죽/스프'

  if (name.includes('국') || name.includes('탕')) return '국/탕류'
  if (name.includes('찜')) return '찜류'
  if (name.includes('밥')) return '밥류'
  if (name.includes('면') || name.includes('우동') || name.includes('국수')) return '면류'
  if (name.includes('샐러드')) return '샐러드'
  if (name.includes('사과') || name.includes('바나나') || name.includes('과일')) return '과일'

  if (
    name.includes('두부') ||
    name.includes('계란') ||
    name.includes('생선') ||
    name.includes('닭') ||
    name.includes('소고기') ||
    name.includes('돼지고기')
  ) return '단백질요리'

  if (
    name.includes('주스') ||
    name.includes('차') ||
    name.includes('스무디') ||
    name.includes('음료')
  ) return '음료'

  if (
    name.includes('쿠키') ||
    name.includes('빵') ||
    name.includes('요거트') ||
    name.includes('간식')
  ) return '간식'

  return '반찬류'
}

/** 배열에서 랜덤 이미지 1장 반환 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

/** 카테고리 → 랜덤 이미지 URL 반환 (없으면 이름으로 추론) */
export const getCategoryImage = (category, recipeName = '') => {
  const resolvedCategory =
    categoryImageMap[category]
      ? category
      : getCategoryByName(recipeName)

  const images =
    categoryImageMap[resolvedCategory] ||
    categoryImageMap['반찬류']

  return pickRandom(images)
}

export default categoryImageMap