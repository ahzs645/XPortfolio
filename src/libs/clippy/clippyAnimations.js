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

// Messages Clippy can say - loaded from messages.json
export let CLIPPY_MESSAGES = [];

// Load messages from JSON file
export async function loadMessages() {
  try {
    const response = await fetch('./assets/clippy/messages.json');
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`);
    }
    const data = await response.json();
    CLIPPY_MESSAGES = data.messages || [];
    console.log(`Loaded ${CLIPPY_MESSAGES.length} Clippy messages`);
    return CLIPPY_MESSAGES;
  } catch (error) {
    console.error('Error loading Clippy messages:', error);
    // Fallback to default messages if JSON fails to load
    CLIPPY_MESSAGES = [
      {
        text: "Hi! I'm Clippy! Click on me to see what I can do!",
        animation: 'Wave',
        type: 'welcome'
      },
      {
        text: "Need help? Just click on me anytime!",
        animation: 'GetAttention',
        type: 'tip'
      }
    ];
    return CLIPPY_MESSAGES;
  }
}

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
