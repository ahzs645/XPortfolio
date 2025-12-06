let countdownTimeout = null;
let screensaverInterval = null;

let currentName = null;
let currentTime = 1 * 1000 * 60;
let onUserActivity = null;

function createScreensaverContainer() {
    let ss = document.getElementById('screensaver');
    if (ss) ss.remove();

    ss = document.createElement('div');
    ss.id = 'screensaver';
    Object.assign(ss.style, {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#000'
    });
    document.body.appendChild(ss);
    return ss;
}

function createCanvas() {
    const container = document.getElementById('screensaver');
    const rect = container.getBoundingClientRect();

    const c = document.createElement('canvas');
    c.width = rect.width;
    c.height = rect.height;
    Object.assign(c.style, {
        width: '100%',
        height: '100%'
    });
    container.appendChild(c);
    return c;
}

function clearScreensaver() {
    clearInterval(screensaverInterval);
    screensaverInterval = null;

    clearTimeout(countdownTimeout);
    countdownTimeout = null;

    const ss = document.getElementById('screensaver');
    if (ss) ss.remove();

    document.removeEventListener('mousemove', onUserActivity);
    document.removeEventListener('keydown', onUserActivity);
}

function resetCountdown() {
    clearTimeout(countdownTimeout);
    countdownTimeout = setTimeout(showScreensaver, currentTime);
}

function showScreensaver() {
    if (!currentName || currentName.toLowerCase() === 'none') return;
    if (!screensavers[currentName]) return;
    if (document.getElementById('screensaver')) return;

    screensavers[currentName]();

    onUserActivity = () => {
        clearScreensaver();
        resetCountdown();
    };

    document.addEventListener('mousemove', onUserActivity);
    document.addEventListener('keydown', onUserActivity);
}

const screensavers = {
    windows: () => {
        const ss = createScreensaverContainer();
        const rect = ss.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const scale = Math.min(width / 1024, height / 768);

        const img = Object.assign(document.createElement('img'), {
            src: '/static/images/logo/white.png',
            style: 'position:absolute;'
        });
        ss.appendChild(img);

        img.width = Math.max(300 * scale, 1);
        img.height = Math.max(200 * scale, 1);

        let dx = 3 * scale, dy = 2 * scale;
        img.style.left = (width - img.width) / 2 + 'px';
        img.style.top = (height - img.height) / 2 + 'px';

        screensaverInterval = setInterval(() => {
            let x = parseFloat(img.style.left) + dx;
            let y = parseFloat(img.style.top) + dy;
            if (x <= 0 || x + img.width >= width) dx *= -1;
            if (y <= 0 || y + img.height >= height) dy *= -1;
            img.style.left = x + 'px';
            img.style.top = y + 'px';
        }, 16);
    },

    starfield: () => {
        createScreensaverContainer();
        const ss = createCanvas();
        const ctx = ss.getContext('2d');
        const width = ss.width;
        const height = ss.height;
        const scale = Math.min(width / 1024, height / 768);

        const stars = Array.from({ length: 300 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * width
        }));

        screensaverInterval = setInterval(() => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
            stars.forEach(s => {
                s.z -= 5 * scale;
                if (s.z <= 0) Object.assign(s, { x: Math.random() * width, y: Math.random() * height, z: width });
                const k = 128 / s.z;
                const px = (s.x - width / 2) * k + width / 2;
                const py = (s.y - height / 2) * k + height / 2;
                const size = Math.max((1 - s.z / width) * 3 * scale, 1);
                ctx.fillStyle = '#fff';
                ctx.fillRect(px, py, size, size);
            });
        }, 33);
    },

    mystify: () => {
        createScreensaverContainer();
        const ss = createCanvas();
        const ctx = ss.getContext('2d');
        const width = ss.width;
        const height = ss.height;
        const scale = Math.min(width / 1024, height / 768);

        const lines = Array.from({ length: 6 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            dx: (Math.random() - 0.5) * 4 * scale,
            dy: (Math.random() - 0.5) * 4 * scale
        }));

        screensaverInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            lines.forEach((l, i) => {
                l.x += l.dx; l.y += l.dy;
                if (l.x < 0 || l.x > width) l.dx *= -1;
                if (l.y < 0 || l.y > height) l.dy *= -1;
                const next = lines[(i + 1) % lines.length];
                ctx.moveTo(l.x, l.y);
                ctx.lineTo(next.x, next.y);
            });
            ctx.stroke();
        }, 50);
    },

    ribbons: () => {
        createScreensaverContainer();
        const ss = createCanvas();
        const ctx = ss.getContext('2d');
        const width = ss.width;
        const height = ss.height;
        const scale = Math.min(width / 1024, height / 768);

        const ribbons = Array.from({ length: 20 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            dx: (Math.random() - 0.5) * 2 * scale,
            dy: (Math.random() - 0.5) * 2 * scale,
            color: `hsl(${Math.random() * 360},80%,50%)`
        }));

        screensaverInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, width, height);
            ribbons.forEach(r => {
                r.x += r.dx; r.y += r.dy;
                if (r.x < 0 || r.x > width) r.dx *= -1;
                if (r.y < 0 || r.y > height) r.dy *= -1;
                ctx.strokeStyle = r.color;
                ctx.beginPath();
                const lineLength = Math.max(20 * scale, 1);
                ctx.moveTo(r.x, r.y);
                ctx.lineTo(r.x + r.dx * lineLength, r.y + r.dy * lineLength);
                ctx.stroke();
            });
        }, 33);
    },

    balls: () => {
        createScreensaverContainer();
        const ss = createCanvas();
        const ctx = ss.getContext('2d');
        const width = ss.width;
        const height = ss.height;
        const scale = Math.min(width / 1024, height / 768);

        const balls = Array.from({ length: 10 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            dx: (Math.random() - 0.5) * 6 * scale,
            dy: (Math.random() - 0.5) * 6 * scale,
            radius: Math.max((20 + Math.random() * 20) * scale, 1),
            color: `hsl(${Math.random() * 360}, 80%, 50%)`
        }));

        screensaverInterval = setInterval(() => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
            balls.forEach(b => {
                b.x += b.dx; b.y += b.dy;
                if (b.x - b.radius < 0 || b.x + b.radius > width) b.dx *= -1;
                if (b.y - b.radius < 0 || b.y + b.radius > height) b.dy *= -1;
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        }, 16);
    },

    matrix: () => {
        createScreensaverContainer();
        const ss = createCanvas();
        const ctx = ss.getContext('2d');
        const width = ss.width;
        const height = ss.height;
        const scale = Math.min(width / 1024, height / 768);

        const fontSize = Math.max(20 * scale, 1);
        const cols = Math.floor(width / fontSize);
        const drops = Array(cols).fill(0);

        screensaverInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#0F0';
            ctx.font = `${fontSize}px monospace`;
            drops.forEach((y, i) => {
                const text = String.fromCharCode(33 + Math.random() * 94);
                ctx.fillText(text, i * fontSize, y * fontSize);
                drops[i] = y * fontSize > height && Math.random() > 0.975 ? 0 : y + 1;
            });
        }, 50);
    },

    rain: () => {
        createScreensaverContainer();
        const ss = createCanvas();
        const ctx = ss.getContext('2d');
        const width = ss.width;
        const height = ss.height;
        const scale = Math.min(width / 1024, height / 768);

        const pixels = Array.from({ length: 100 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            dy: (2 + Math.random() * 4) * scale,
            color: `hsl(${Math.random() * 360}, 80%, 50%)`
        }));

        screensaverInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, width, height);
            pixels.forEach(p => {
                p.y += p.dy;
                if (p.y > height) p.y = 0;
                const pixelSize = Math.max(2 * scale, 1);
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, pixelSize, pixelSize);
            });
        }, 33);
    }
};

function getScreensaver(name, time) {
    if (name !== null) currentName = name;
    if (time !== null) currentTime = time * 1000 * 60;

    clearScreensaver();

    if (!currentName || currentName === '') return;

    onUserActivity = resetCountdown;
    document.addEventListener('mousemove', onUserActivity);
    document.addEventListener('keydown', onUserActivity);

    resetCountdown();
}

function previewScreensaver(name) {
    if (!name || name.toLowerCase() === 'none') return;
    if (!screensavers[name]) return;
    if (document.getElementById('screensaver')) return;

    screensavers[name]();

    onUserActivity = () => {
        clearScreensaver();
        resetCountdown();
    };
    document.addEventListener('mousemove', onUserActivity);
    document.addEventListener('keydown', onUserActivity);
}
