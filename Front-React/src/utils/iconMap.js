export const ingredientIconMap = {
  백미: "🌾",
  현미: "🌾",
  귀리: "🌾",

  양배추: "🥬",
  감자: "🥔",
  당근: "🥕",
  브로콜리: "🥦",
  오이: "🥒",

  사과: "🍎",
  바나나: "🍌",

  계란: "🥚",
  두부: "⬜",

  소고기: "🥩",
  닭고기: "🍗",
};

export const categoryIconMap = {
  곡류: "🌾",
  육류: "🥩",
  채소: "🥬",
  과일: "🍎",
  기타: "📦",
};

export const getIngredientIcon = (name, category) => {
  return ingredientIconMap[name] || categoryIconMap[category] || "📦";
};