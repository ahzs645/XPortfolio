let loginSound = null,
    logoffSound = null,
    balloonSound = null;
export function initializeSystemAudio() {
    loginSound = new Audio('./assets/sounds/login.wav'), logoffSound = new Audio('./assets/sounds/logoff.wav'), balloonSound = new Audio('./assets/sounds/balloon.wav'), [loginSound, logoffSound, balloonSound]['forEach'](sound => {
        sound && (sound['preload'] = 'auto', sound['load']());
    });
}
export function getBalloonSound() {
    return balloonSound;
}
export function getLoginSound() {
    return loginSound;
}
export function getLogoffSound() {
    return logoffSound;
}
export function playBalloonSound() {
    if (!balloonSound) return;
    try {
        balloonSound['pause'](), balloonSound['currentTime'] = 0x0, balloonSound['volume'] = 0x1;
        const isFirefox = navigator['userAgent']['toLowerCase']()['includes']('firefox'),
            delay = isFirefox ? 0x14 : 0x0;
        setTimeout(() => {
            balloonSound['play']()['catch'](() => {});
        }, delay);
    } catch (err) {}
}