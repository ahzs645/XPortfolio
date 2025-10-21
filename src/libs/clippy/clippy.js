import { getRandomIdleAnimation, getRandomMessage } from './clippyAnimations.js';
import ClippySprite from './clippySprite.js';

class Clippy {
  constructor() {
    this.container = null;
    this.spriteElement = null;
    this.balloon = null;
    this.sprite = new ClippySprite();
    this.currentAnimation = 'RestPose';
    this.idleTimeout = null;
    this.balloonTimeout = null;
    this.isVisible = false;
    this.isReady = false;
    this.IDLE_WAIT_TIME = 8000; // Wait 8 seconds between idle animations
    this.status = 'hidden'; // hidden, showing, idle
  }

  async init() {
    // Load animation data
    const loaded = await this.sprite.loadAnimations();
    if (!loaded) {
      console.error('Failed to load Clippy animations');
      return;
    }

    this.isReady = true;
    this.createClippyElement();
    this.createBalloon();
    this.attachEventListeners();
  }

  createClippyElement() {
    // Create Clippy container
    this.container = document.createElement('div');
    this.container.id = 'clippy-container';
    this.container.className = 'clippy-container';

    // Create sprite element (uses background-image for sprite sheet)
    this.spriteElement = document.createElement('div');
    this.spriteElement.id = 'clippy-sprite';
    this.spriteElement.className = 'clippy-sprite';

    this.container.appendChild(this.spriteElement);
    document.body.appendChild(this.container);

    // Show the rest pose initially
    this.sprite.showFrame(this.spriteElement, 'RestPose', 0);
  }

  createBalloon() {
    // Create balloon container
    this.balloon = document.createElement('div');
    this.balloon.id = 'clippy-balloon';
    this.balloon.className = 'clippy-balloon';
    this.balloon.style.display = 'none';

    const balloonHTML = `
      <div class="balloon">
        <button class="balloon__close" aria-label="Close"></button>
        <div class="balloon__header">
          <img decoding="async" loading="lazy" class="balloon__header__img" src="assets/gui/desktop/about.webp" alt="clippy">
          <span class="balloon__header__text" style="font-weight: bold;">Clippy the Assistant</span>
        </div>
        <p class="balloon__text__first clippy-message" style="padding: 0 8px 0 2px;">
          Hi! I'm Clippy!
        </p>
        <div class="balloon-pointer-anchor" style="position:absolute;bottom:-19px;left:40px;width:0;height:0;"></div>
      </div>
    `;

    this.balloon.innerHTML = balloonHTML;
    document.body.appendChild(this.balloon);

    // Close button handler
    const closeBtn = this.balloon.querySelector('.balloon__close');
    closeBtn.addEventListener('click', () => this.hideBalloon());
  }

  attachEventListeners() {
    // Click on Clippy to show random trick/message
    this.container.addEventListener('click', () => {
      this.showRandomMessage();
    });
  }

  show() {
    if (this.status !== 'hidden' || !this.isReady) return;

    this.status = 'showing';
    this.playAnimation('Show', () => {
      this.status = 'idle';
      this.startIdleAnimations();

      // Show welcome message after appearing
      setTimeout(() => {
        this.showMessage(getRandomMessage('welcome'));
      }, 500);
    });
  }

  hide() {
    this.status = 'hidden';
    this.stopIdleAnimations();
    this.hideBalloon();
    this.playAnimation('Hide');
  }

  playAnimation(animationName, onComplete = null) {
    if (!this.isReady) return;

    this.currentAnimation = animationName;
    this.sprite.playAnimation(this.spriteElement, animationName, () => {
      // Return to rest pose after animation
      if (this.status === 'idle') {
        this.sprite.showFrame(this.spriteElement, 'RestPose', 0);
      }
      if (onComplete) onComplete();
    });
  }

  startIdleAnimations() {
    if (this.status !== 'idle') return;

    const playRandomIdle = () => {
      if (this.status !== 'idle') return;

      const randomAnimationName = getRandomIdleAnimation(this.currentAnimation);

      this.playAnimation(randomAnimationName, () => {
        // Schedule next idle animation
        this.idleTimeout = setTimeout(playRandomIdle, this.IDLE_WAIT_TIME);
      });
    };

    // Start first idle animation after initial wait
    this.idleTimeout = setTimeout(playRandomIdle, this.IDLE_WAIT_TIME);
  }

  stopIdleAnimations() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    this.sprite.stopAnimation();
  }

  showMessage(messageData) {
    const { text, animation } = messageData;

    // Play animation
    if (animation) {
      this.playAnimation(animation);
    }

    // Update balloon text
    const messageElement = this.balloon.querySelector('.clippy-message');
    messageElement.textContent = text;

    // Position balloon above Clippy
    this.positionBalloon();

    // Show balloon
    this.balloon.style.display = 'block';

    // Auto-hide after 8 seconds
    if (this.balloonTimeout) {
      clearTimeout(this.balloonTimeout);
    }
    this.balloonTimeout = setTimeout(() => {
      this.hideBalloon();
    }, 8000);
  }

  showRandomMessage() {
    const message = getRandomMessage();
    this.showMessage(message);
  }

  hideBalloon() {
    this.balloon.style.display = 'none';
    if (this.balloonTimeout) {
      clearTimeout(this.balloonTimeout);
      this.balloonTimeout = null;
    }
  }

  positionBalloon() {
    // Get Clippy's position
    const clippyRect = this.container.getBoundingClientRect();
    const balloonElement = this.balloon.querySelector('.balloon');
    const balloonHeight = balloonElement ? balloonElement.offsetHeight : 100;

    // Position balloon above and to the left, closer to Clippy's top-left
    this.balloon.style.left = `${clippyRect.left - 30}px`; // Much closer to Clippy's left edge
    this.balloon.style.top = `${clippyRect.top - balloonHeight - 20}px`; // Just above Clippy with small gap
  }

  // Public method to trigger specific animations
  doTrick(animationName) {
    if (this.isReady) {
      this.playAnimation(animationName);
    }
  }

  // Public method to show message with specific text
  say(text, animationName = 'Explain') {
    this.showMessage({ text, animation: animationName });
  }

  // Get list of available animations
  getAnimations() {
    return this.sprite.getAvailableAnimations();
  }
}

// Create singleton instance
const clippy = new Clippy();

export default clippy;
