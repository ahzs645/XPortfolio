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

// Config settings - loaded from clippy.config.json
export let CLIPPY_CONFIG = {
  messageTagWeights: {
    normal: 95,
    unhinged: 5
  },
  settings: {
    enableUnhingedMessages: true
  }
};

// Load config from JSON file
export async function loadConfig() {
  try {
    const response = await fetch('./clippy.config.json');
    if (!response.ok) {
      console.warn('Config not found, using defaults');
      return CLIPPY_CONFIG;
    }
    const data = await response.json();
    CLIPPY_CONFIG = {
      messageTagWeights: data.messageTagWeights || CLIPPY_CONFIG.messageTagWeights,
      settings: data.settings || CLIPPY_CONFIG.settings
    };
    console.log('Loaded Clippy config:', CLIPPY_CONFIG);
    return CLIPPY_CONFIG;
  } catch (error) {
    console.warn('Error loading config, using defaults:', error);
    return CLIPPY_CONFIG;
  }
}

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
        type: 'welcome',
        tag: 'normal'
      },
      {
        text: "Need help? Just click on me anytime!",
        animation: 'GetAttention',
        type: 'tip',
        tag: 'normal'
      }
    ];
    return CLIPPY_MESSAGES;
  }
}

// Select a random tag based on weighted probabilities
function getWeightedRandomTag() {
  const weights = CLIPPY_CONFIG.messageTagWeights;
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  let random = Math.random() * totalWeight;

  for (const [tag, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      // Check if unhinged messages are disabled
      if (tag === 'unhinged' && !CLIPPY_CONFIG.settings.enableUnhingedMessages) {
        return 'normal';
      }
      return tag;
    }
  }

  return 'normal'; // Fallback
}

export function getRandomIdleAnimation(currentAnimation = '') {
  const available = IDLE_ANIMATIONS.filter(name => name !== currentAnimation);
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export function getRandomMessage(type = null) {
  // First, select a tag based on weighted probabilities
  const selectedTag = getWeightedRandomTag();

  // Filter messages by type (if specified) and selected tag
  let messages = CLIPPY_MESSAGES;

  if (type) {
    messages = messages.filter(m => m.type === type);
  }

  // Filter by tag
  const taggedMessages = messages.filter(m => m.tag === selectedTag);

  // If no messages found for this tag, fall back to all messages of the type
  const finalMessages = taggedMessages.length > 0 ? taggedMessages : messages;

  return finalMessages[Math.floor(Math.random() * finalMessages.length)];
}
