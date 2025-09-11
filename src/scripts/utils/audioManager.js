let loginSound = null,
    logoffSound = null,
    balloonSound = null;
export function initializeSystemAudio() {
    loginSound = new Audio('./assets/sounds/login.wav'), logoffSound = new Audio('./assets/sounds/logoff.wav'), balloonSound = new Audio('./assets/sounds/balloon.wav'), [loginSound, logoffSound, balloonSound]['forEach'](_0x1bb069 => {
        _0x1bb069 && (_0x1bb069['preload'] = 'auto', _0x1bb069['load']());
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
        const _0x390447 = navigator['userAgent']['toLowerCase']()['includes']('firefox'),
            _0x424fb1 = _0x390447 ? 0x14 : 0x0;
        setTimeout(() => {
            balloonSound['play']()['catch'](() => {});
        }, _0x424fb1);
    } catch (_0x32c545) {}
}