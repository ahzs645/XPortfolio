// Clippy sprite sheet animation system
const SPRITE_SHEET_URL = './assets/clippy/map.png';
const ANIMATIONS_DATA_URL = './assets/clippy/animations.json';
const FRAME_WIDTH = 124;
const FRAME_HEIGHT = 93;

class ClippySprite {
  constructor() {
    this.animationsData = null;
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    this.isPlaying = false;
    this.onAnimationComplete = null;
  }

  async loadAnimations() {
    try {
      const response = await fetch(ANIMATIONS_DATA_URL);
      this.animationsData = await response.json();
      return true;
    } catch (error) {
      console.error('Failed to load animations data:', error);
      return false;
    }
  }

  getAnimation(name) {
    if (!this.animationsData) return null;
    return this.animationsData.find(anim => anim.Name === name);
  }

  calculateTotalDuration(animationName) {
    const animation = this.getAnimation(animationName);
    if (!animation) return 0;
    return animation.Frames.reduce((total, frame) => total + frame.Duration, 0);
  }

  playAnimation(element, animationName, onComplete = null) {
    const animation = this.getAnimation(animationName);
    if (!animation) {
      console.warn(`Animation "${animationName}" not found`);
      if (onComplete) onComplete();
      return;
    }

    if (!animation.Frames || animation.Frames.length === 0) {
      console.warn(`Animation "${animationName}" has no frames`);
      if (onComplete) onComplete();
      return;
    }

    // Stop any existing animation
    this.stopAnimation();

    this.currentAnimation = animation;
    this.currentFrameIndex = 0;
    this.lastFrameTime = performance.now();
    this.onAnimationComplete = onComplete;
    this.isPlaying = true;

    // Set up the sprite sheet background
    element.style.backgroundImage = `url(${SPRITE_SHEET_URL})`;
    element.style.backgroundRepeat = 'no-repeat';
    element.style.width = `${FRAME_WIDTH}px`;
    element.style.height = `${FRAME_HEIGHT}px`;
    element.style.imageRendering = 'crisp-edges';
    element.style.imageRendering = '-webkit-optimize-contrast';

    // Show first frame immediately
    this.updateFrame(element);

    // Start the animation loop
    this.animate(element);
  }

  animate(element) {
    if (!this.isPlaying || !this.currentAnimation) return;

    const currentTime = performance.now();

    // Bounds check
    if (this.currentFrameIndex >= this.currentAnimation.Frames.length) {
      this.stopAnimation();
      if (this.onAnimationComplete) {
        this.onAnimationComplete();
      }
      return;
    }

    const currentFrame = this.currentAnimation.Frames[this.currentFrameIndex];
    if (!currentFrame) {
      console.error('Invalid frame index:', this.currentFrameIndex);
      this.stopAnimation();
      return;
    }

    const frameDuration = currentFrame.Duration;

    // Check if it's time to move to the next frame
    if (currentTime - this.lastFrameTime >= frameDuration) {
      this.currentFrameIndex++;

      // Check if animation is complete
      if (this.currentFrameIndex >= this.currentAnimation.Frames.length) {
        this.stopAnimation();
        if (this.onAnimationComplete) {
          this.onAnimationComplete();
        }
        return;
      }

      this.lastFrameTime = currentTime;
    }

    // Update the sprite position
    this.updateFrame(element);

    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate(element));
  }

  updateFrame(element) {
    if (!this.currentAnimation) return;

    const frame = this.currentAnimation.Frames[this.currentFrameIndex];
    if (!frame) {
      console.error('Frame is null at index:', this.currentFrameIndex);
      return;
    }

    // Handle null ImagesOffsets (means use default position 0,0)
    const offsets = frame.ImagesOffsets || { Column: 0, Row: 0 };

    const offsetX = -offsets.Column * FRAME_WIDTH;
    const offsetY = -offsets.Row * FRAME_HEIGHT;

    element.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
  }

  stopAnimation() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  showFrame(element, animationName, frameIndex = 0) {
    const animation = this.getAnimation(animationName);
    if (!animation || frameIndex >= animation.Frames.length) return;

    const frame = animation.Frames[frameIndex];
    const offsetX = -frame.ImagesOffsets.Column * FRAME_WIDTH;
    const offsetY = -frame.ImagesOffsets.Row * FRAME_HEIGHT;

    element.style.backgroundImage = `url(${SPRITE_SHEET_URL})`;
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    element.style.width = `${FRAME_WIDTH}px`;
    element.style.height = `${FRAME_HEIGHT}px`;
    element.style.imageRendering = 'crisp-edges';
    element.style.imageRendering = '-webkit-optimize-contrast';
  }

  getAvailableAnimations() {
    if (!this.animationsData) return [];
    return this.animationsData.map(anim => anim.Name);
  }
}

export default ClippySprite;
