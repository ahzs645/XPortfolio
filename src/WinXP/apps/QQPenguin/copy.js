// English-first copy catalog. Keeping UI and extracted-SWF text together makes
// another locale a catalog change instead of a component rewrite.
export const QQ_PET_EN = Object.freeze({
  login: {
    title: 'QQ Pet Login',
    petName: 'QQ Pet',
    remember: 'Remember my choice',
    confirm: 'OK',
  },
  menu: [
    { id: 'feed', label: 'Feed', icon: 'weishi', animation: 'feed' },
    { id: 'clean', label: 'Bathe', icon: 'xizao', animation: 'clean' },
    { id: 'medicine', label: 'Medicine', icon: 'kanbing', animation: 'medicine' },
    { id: 'study', label: 'Study', icon: 'xuexi', animation: 'study' },
    { id: 'play', label: 'Work', icon: 'dagong', animation: 'work' },
  ],
  bubble: {
    greeting: "Hi! I'm here!\nDid you miss me?\nHehe.",
    chuckle: 'Hehe~',
    bathed: 'That bath felt great~',
    worked: 'I earned some money!',
    studied: 'Study hard and improve every day!',
    ate: (itemName) => `The ${itemName} was delicious!`,
    medicine: 'I feel much better after taking medicine~',
    praise: 'Good pet!',
    laugh: 'Haha',
  },
  detail: {
    chooseFood: 'Choose a food:',
    chooseMedicine: 'Choose medicine:',
    foods: [
      { id: 'ice-cream', name: 'Ice Cream', value: 15, image: '/games/qqpenguin/assets/icecream.png' },
      { id: 'mooncake', name: 'Mooncake', value: 25, image: '/games/qqpenguin/assets/mooncake.png' },
    ],
    medicine: {
      name: 'Cold Medicine',
      value: 20,
      image: '/games/qqpenguin/assets/riyongping.png',
    },
    vipLink: 'Activate Pink Diamond',
    vipSuffix: ' and enjoy exclusive VIP benefits.',
  },
  /**
   * Future converted SWFs can add values here as:
   * `{ scene: { variables: { fieldName: "…" }, characters: { 42: "…" } } }`.
   * The current QQ Pet animation packs contain no extracted text fields.
   */
  swfText: {},
});

export function translateQqPetSwfText(text, context) {
  const scene = QQ_PET_EN.swfText[context.scene];
  if (!scene) return undefined;
  if (context.variableName && scene.variables?.[context.variableName] !== undefined) {
    return scene.variables[context.variableName];
  }
  return scene.characters?.[context.characterId] ?? scene.strings?.[text];
}
