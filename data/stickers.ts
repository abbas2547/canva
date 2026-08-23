export interface StickerItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

export interface StickerCategory {
  id: string;
  name: string;
  stickers: StickerItem[];
}

export const stickerCategories: StickerCategory[] = [
  {
    id: "faces",
    name: "Smileys & Faces",
    stickers: [
      { id: "s-grin", name: "Grin", category: "faces", emoji: "😀" },
      { id: "s-lol", name: "LOL", category: "faces", emoji: "😂" },
      { id: "s-wink", name: "Wink", category: "faces", emoji: "😉" },
      { id: "s-heart-eyes", name: "Heart Eyes", category: "faces", emoji: "😍" },
      { id: "s-kiss", name: "Kiss", category: "faces", emoji: "😘" },
      { id: "s-think", name: "Thinking", category: "faces", emoji: "🤔" },
      { id: "s-smirk", name: "Smirk", category: "faces", emoji: "😏" },
      { id: "s-unamused", name: "Unamused", category: "faces", emoji: "😒" },
      { id: "s-sweat", name: "Sweat", category: "faces", emoji: "😅" },
      { id: "s-cry", name: "Cry", category: "faces", emoji: "😢" },
      { id: "s-scream", name: "Scream", category: "faces", emoji: "😱" },
      { id: "s-cringe", name: "Cringe", category: "faces", emoji: "😬" },
      { id: "s-nervous", name: "Nervous", category: "faces", emoji: "😰" },
      { id: "s-sleepy", name: "Sleepy", category: "faces", emoji: "😴" },
      { id: "s-sunglasses", name: "Cool", category: "faces", emoji: "😎" },
      { id: "s-nerd", name: "Nerd", category: "faces", emoji: "🤓" },
    ],
  },
  {
    id: "gestures",
    name: "Hands & Gestures",
    stickers: [
      { id: "g-wave", name: "Wave", category: "gestures", emoji: "👋" },
      { id: "g-ok", name: "OK", category: "gestures", emoji: "👌" },
      { id: "g-thumbs-up", name: "Thumbs Up", category: "gestures", emoji: "👍" },
      { id: "g-thumbs-down", name: "Thumbs Down", category: "gestures", emoji: "👎" },
      { id: "g-clap", name: "Clap", category: "gestures", emoji: "👏" },
      { id: "g-pray", name: "Pray", category: "gestures", emoji: "🙏" },
      { id: "g-muscle", name: "Muscle", category: "gestures", emoji: "💪" },
      { id: "g-punch", name: "Punch", category: "gestures", emoji: "👊" },
      { id: "g-fist", name: "Fist", category: "gestures", emoji: "✊" },
      { id: "g-peace", name: "Peace", category: "gestures", emoji: "✌️" },
      { id: "g-point-up", name: "Point Up", category: "gestures", emoji: "☝️" },
      { id: "g-point-down", name: "Point Down", category: "gestures", emoji: "👇" },
      { id: "g-call-me", name: "Call Me", category: "gestures", emoji: "🤙" },
      { id: "g-love", name: "Love", category: "gestures", emoji: "🤟" },
    ],
  },
  {
    id: "celebration",
    name: "Celebration",
    stickers: [
      { id: "c-party", name: "Party", category: "celebration", emoji: "🎉" },
      { id: "c-confetti", name: "Confetti", category: "celebration", emoji: "🎊" },
      { id: "c-tada", name: "Tada", category: "celebration", emoji: "🥳" },
      { id: "c-gift", name: "Gift", category: "celebration", emoji: "🎁" },
      { id: "c-balloon", name: "Balloon", category: "celebration", emoji: "🎈" },
      { id: "c-cake", name: "Cake", category: "celebration", emoji: "🎂" },
      { id: "c-champagne", name: "Champagne", category: "celebration", emoji: "🥂" },
      { id: "c-fireworks", name: "Fireworks", category: "celebration", emoji: "🎆" },
      { id: "c-star", name: "Star", category: "celebration", emoji: "⭐" },
      { id: "c-sparkles", name: "Sparkles", category: "celebration", emoji: "✨" },
      { id: "c-crown", name: "Crown", category: "celebration", emoji: "👑" },
      { id: "c-trophy", name: "Trophy", category: "celebration", emoji: "🏆" },
    ],
  },
  {
    id: "nature",
    name: "Nature & Weather",
    stickers: [
      { id: "n-sun", name: "Sun", category: "nature", emoji: "☀️" },
      { id: "n-cloud", name: "Cloud", category: "nature", emoji: "☁️" },
      { id: "n-rain", name: "Rain", category: "nature", emoji: "🌧️" },
      { id: "n-snow", name: "Snow", category: "nature", emoji: "❄️" },
      { id: "n-lightning", name: "Lightning", category: "nature", emoji: "⚡" },
      { id: "n-rainbow", name: "Rainbow", category: "nature", emoji: "🌈" },
      { id: "n-fire", name: "Fire", category: "nature", emoji: "🔥" },
      { id: "n-water", name: "Water", category: "nature", emoji: "💧" },
      { id: "n-leaf", name: "Leaf", category: "nature", emoji: "🍃" },
      { id: "n-flower", name: "Flower", category: "nature", emoji: "🌸" },
      { id: "n-snowflake", name: "Snowflake", category: "nature", emoji: "❄️" },
      { id: "n-tornado", name: "Tornado", category: "nature", emoji: "🌪️" },
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    stickers: [
      { id: "f-coffee", name: "Coffee", category: "food", emoji: "☕" },
      { id: "f-pizza", name: "Pizza", category: "food", emoji: "🍕" },
      { id: "f-burger", name: "Burger", category: "food", emoji: "🍔" },
      { id: "f-taco", name: "Taco", category: "food", emoji: "🌮" },
      { id: "f-sushi", name: "Sushi", category: "food", emoji: "🍣" },
      { id: "f-ice-cream", name: "Ice Cream", category: "food", emoji: "🍦" },
      { id: "f-cake", name: "Cake", category: "food", emoji: "🍰" },
      { id: "f-donut", name: "Donut", category: "food", emoji: "🍩" },
      { id: "f-cookie", name: "Cookie", category: "food", emoji: "🍪" },
      { id: "f-candy", name: "Candy", category: "food", emoji: "🍬" },
      { id: "f-watermelon", name: "Watermelon", category: "food", emoji: "🍉" },
      { id: "f-apple", name: "Apple", category: "food", emoji: "🍎" },
    ],
  },
  {
    id: "objects",
    name: "Objects",
    stickers: [
      { id: "o-bulb", name: "Light Bulb", category: "objects", emoji: "💡" },
      { id: "o-rocket", name: "Rocket", category: "objects", emoji: "🚀" },
      { id: "o-diamond", name: "Diamond", category: "objects", emoji: "💎" },
      { id: "o-magic-wand", name: "Magic Wand", category: "objects", emoji: "🪄" },
      { id: "o-key", name: "Key", category: "objects", emoji: "🔑" },
      { id: "o-lock", name: "Lock", category: "objects", emoji: "🔒" },
      { id: "o-camera", name: "Camera", category: "objects", emoji: "📷" },
      { id: "o-phone", name: "Phone", category: "objects", emoji: "📱" },
      { id: "o-laptop", name: "Laptop", category: "objects", emoji: "💻" },
      { id: "o-headphones", name: "Headphones", category: "objects", emoji: "🎧" },
      { id: "o-microphone", name: "Microphone", category: "objects", emoji: "🎤" },
      { id: "o-palette", name: "Palette", category: "objects", emoji: "🎨" },
    ],
  },
];

export function getAllStickers(): StickerItem[] {
  return stickerCategories.flatMap((cat) => cat.stickers);
}

export function getStickersByCategory(categoryId: string): StickerItem[] {
  const category = stickerCategories.find((c) => c.id === categoryId);
  return category ? category.stickers : [];
}
