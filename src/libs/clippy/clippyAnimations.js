// Clippy animation definitions for sprite-based system

// Idle animations that play randomly
export const IDLE_ANIMATIONS = [
  'IdleFingerTap',
  'IdleHeadScratch',
  'IdleRopePile',
  'IdleSideToSide',
  'LookDown',
  'LookDownLeft',
  'LookDownRight',
  'LookLeft',
  'LookRight',
  'LookUp',
  'LookUpLeft',
  'LookUpRight'
];

// Messages Clippy can say
export const CLIPPY_MESSAGES = [
  {
    text: "Hi! I'm Clippy! Click on me to see what I can do!",
    animation: 'Wave',
    type: 'welcome'
  },
  {
    text: "Looking for something? Check out the Projects folder!",
    animation: 'GestureLeft',
    type: 'tip'
  },
  {
    text: "Did you know? This entire interface was custom-built with vanilla JavaScript!",
    animation: 'Explain',
    type: 'fact'
  },
  {
    text: "Want to learn more about Ahmad? Try the About Me icon!",
    animation: 'GestureRight',
    type: 'tip'
  },
  {
    text: "Great job exploring! You're really getting the hang of this!",
    animation: 'Congratulate',
    type: 'praise'
  },
  {
    text: "I'm thinking... there's so much cool stuff here to explore!",
    animation: 'Thinking',
    type: 'idle'
  },
  {
    text: "This Windows XP interface brings back memories, doesn't it?",
    animation: 'GetWizardy',
    type: 'fact'
  },
  {
    text: "Need help? Just click on me anytime!",
    animation: 'GetAttention',
    type: 'tip'
  },
  {
    text: "Wow, you're navigating like a pro!",
    animation: 'Congratulate',
    type: 'praise'
  },
  {
    text: "Check out the resume for all the details!",
    animation: 'Explain',
    type: 'tip'
  }
];

export function getRandomIdleAnimation(currentAnimation = '') {
  const available = IDLE_ANIMATIONS.filter(name => name !== currentAnimation);
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export function getRandomMessage(type = null) {
  const messages = type
    ? CLIPPY_MESSAGES.filter(m => m.type === type)
    : CLIPPY_MESSAGES;
  return messages[Math.floor(Math.random() * messages.length)];
}
