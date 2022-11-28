declare global {
    interface Document {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
    }

    interface HTMLElement {
        webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
        msRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
        mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
    }
}

export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getMobileOS() {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) {
        return "Android";
    }
    else if ((/iPad|iPhone|iPod/.test(ua)) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return "iOS";
    }
    return "Other";
}

export function isFirefox() {
    return navigator.userAgent.includes('Firefox');
}

export function isFullscreen() {
    return (
        document.fullscreenElement || /* Standard syntax */
        document.webkitFullscreenElement || /* Safari and Opera syntax */
        document.msFullscreenElement || /* IE11 syntax */
        document.mozFullScreenElement /* Firefox */
    ) != undefined;
}

export function enterFullscreen() {
    if (!isMobile() || getMobileOS() == 'iOS') {
        return;
    }
    _enterFullscreen();
}

function _enterFullscreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    }
}

export function exitFullscreen() {
    if (!isMobile() || getMobileOS() == 'iOS') {
        return;
    }
    _exitFullscreen();
}

function _exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    }
}

export function tryToggleFullscreen() {
    if (!isMobile() || getMobileOS() == 'iOS') {
        return;
    }
    if (isFullscreen())
        _exitFullscreen();
    else
        _enterFullscreen();
}

var firstTime = true;
var mylatesttap = 0;
export function doubleTapEnterFullscreen() {
    if (firstTime) {
        enterFullscreen();
        firstTime = false;
        return;
    }
    var now = performance.now();
    var timesince = now - mylatesttap;
    if ((timesince < 600) && (timesince > 0)) {
        enterFullscreen();
    }
    else {
        // too much time to be a doubletap
    }
    mylatesttap = now;
}
