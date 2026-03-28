/**
 * FLAPPY BIRD 1:1 CLONE | Elite Physics Core
 * Recreating https://flappy-clone--meqdad1.replit.app/
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const mainMenu = document.getElementById('main-menu');
const gameOverMenu = document.getElementById('game-over');
const scoreBox = document.getElementById('score-box');
const goText = document.getElementById('go-text');
const skinNameDisplay = document.getElementById('skin-name');
const skinIconDisplay = document.getElementById('skin-icon');

// SFX
const flapSfx = document.getElementById('flap-sfx');
const scoreSfx = document.getElementById('score-sfx');
const dieSfx = document.getElementById('die-sfx');

// --- GAME CONSTANTS ---
const WIDTH = 480;
const HEIGHT = 720;
canvas.width = WIDTH;
canvas.height = HEIGHT;

let score = 0;
let bestScore = localStorage.getItem('flappy-best') || 0;
let isStarted = false;
let isGameOver = false;
let frameCount = 0;
let mode = 'endless'; // endless, levels
let currentLevel = 0;
const MAX_LEVELS = 10;
const PIPES_PER_LEVEL = 10;

// --- SKINS (11 Variant 1:1 List) ---
const SKINS = [
    { name: "SUNNY", icon: "🐤", primary: "#ffff00" },
    { name: "RUBY", icon: "🐦", primary: "#ff0000" },
    { name: "SKY", icon: "🐦", primary: "#00d4ff" },
    { name: "FOREST", icon: "🐦", primary: "#00ff88" },
    { name: "GHOST", icon: "👻", primary: "#ffffff" },
    { name: "COSMIC", icon: "🦄", primary: "#ff00ff" },
    { name: "SHADOW", icon: "🦇", primary: "#444444" },
    { name: "COW", icon: "🐮", primary: "#ffffff" },
    { name: "FROG", icon: "🐸", primary: "#00ff00" },
    { name: "MONKEY", icon: "🐵", primary: "#cd853f" },
    { name: "PIRATE", icon: "🦜", primary: "#ffcc00" }
];
let currentSkinIndex = 0;

// --- CORE GAME OBJECTS ---
class Bird {
    constructor() {
        this.reset();
        this.size = 36;
    }

    reset() {
        this.x = WIDTH / 3;
        this.y = HEIGHT / 2;
        this.velocity = 0;
        this.rotation = 0;
        this.dead = false;
    }

    flap() {
        if (this.dead) return;
        this.velocity = -8.5;
        this.rotation = -0.4;
        flapSfx.currentTime = 0;
        flapSfx.play().catch(() => {});
    }

    update() {
        this.velocity += 0.45; // Gravity
        this.y += this.velocity;

        if (this.velocity < 0) {
            this.rotation = Math.max(-0.4, this.rotation - 0.2);
        } else {
            this.rotation = Math.min(Math.PI / 2, this.rotation + 0.1);
        }

        if (this.y < 0) { this.y = 0; this.velocity = 0; }
        if (this.y + 20 > HEIGHT) { this.die(); }
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.velocity = 5;
        this.rotation = Math.PI / 2;
        dieSfx.play().catch(() => {});
        gameOver();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(SKINS[currentSkinIndex].icon, 0, 0);
        
        ctx.restore();
    }
}

class Pipe {
    constructor(x) {
        this.x = x;
        this.width = 80;
        this.gap = 180;
        this.topHeight = Math.random() * (HEIGHT - this.gap - 200) + 100;
        this.passed = false;
    }

    update() {
        this.x -= 3.5;
    }

    draw() {
        // Classic Green Pipes with Shading
        ctx.fillStyle = "#2e7d32"; // Darker Green
        ctx.strokeStyle = "#1b5e20";
        ctx.lineWidth = 3;

        // Top Pipe
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.strokeRect(this.x, -5, this.width, this.topHeight + 5);
        // Top Lip
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x - 5, this.topHeight - 30, this.width + 10, 30);
        ctx.strokeRect(this.x - 5, this.topHeight - 30, this.width + 10, 30);

        // Bottom Pipe
        const bottomY = this.topHeight + this.gap;
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(this.x, bottomY, this.width, HEIGHT - bottomY);
        ctx.strokeRect(this.x, bottomY, this.width, HEIGHT - bottomY + 5);
        // Bottom Lip
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x - 5, bottomY, this.width + 10, 30);
        ctx.strokeRect(this.x - 5, bottomY, this.width + 10, 30);
    }
}

const bird = new Bird();
let pipes = [];

// --- UI HANDLERS ---
function setSkin(index) {
    currentSkinIndex = index;
    skinNameDisplay.innerText = SKINS[currentSkinIndex].name;
    skinIconDisplay.innerText = SKINS[currentSkinIndex].icon;
}

function nextSkin() {
    setSkin((currentSkinIndex + 1) % SKINS.length);
}

function prevSkin() {
    setSkin((currentSkinIndex - 1 + SKINS.length) % SKINS.length);
}

function setMode(m) {
    mode = m;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('level-status').style.display = m === 'levels' ? 'block' : 'none';
}

function showMenu() {
    gameOverMenu.style.display = 'none';
    mainMenu.style.display = 'block';
    isStarted = false;
    isGameOver = false;
    pipes = [];
    bird.reset();
}

function startGame() {
    isStarted = true;
    isGameOver = false;
    score = 0;
    bird.reset();
    pipes = [new Pipe(WIDTH + 200)];
    mainMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    scoreBox.style.display = 'none';
    goText.style.display = 'none';
    
    if (mode === 'levels') {
        document.getElementById('level-status').innerText = `${currentLevel} / ${MAX_LEVELS} COMPLETED`;
    }
}

function gameOver() {
    isGameOver = true;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappy-best', bestScore);
    }
    
    document.getElementById('final-score').innerText = score;
    document.getElementById('best-score').innerText = bestScore;
    
    gameOverMenu.style.display = 'block';
    scoreBox.style.display = 'block';
    goText.style.display = 'block';
}

// --- MAIN LOOP ---
function update() {
    if (!isStarted || isGameOver) return;
    frameCount++;

    bird.update();

    if (frameCount % 90 === 0) {
        pipes.push(new Pipe(WIDTH));
    }

    pipes.forEach((pipe, i) => {
        pipe.update();
        
        // Collision (1:1 Clinical Detection)
        const hitBoxDist = 14;
        if (bird.x + hitBoxDist > pipe.x && bird.x - hitBoxDist < pipe.x + pipe.width) {
            if (bird.y - hitBoxDist < pipe.topHeight || 
                bird.y + hitBoxDist > pipe.topHeight + pipe.gap) {
                bird.die();
            }
        }

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score++;
            pipe.passed = true;
            scoreSfx.currentTime = 0;
            scoreSfx.play().catch(() => {});
            
            if (mode === 'levels' && score >= PIPES_PER_LEVEL) {
                 currentLevel++;
                 bird.die(); // Complete level is like winning/dying reset
            }
        }

        if (pipe.x + pipe.width < 0) pipes.splice(i, 1);
    });
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // 1:1 Parallax Night Sky Gradient is handled by CSS Canvas background
    // Draw Ground
    ctx.fillStyle = "#228b22";
    ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);
    ctx.strokeStyle = "#1b5e20";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT - 20);
    ctx.lineTo(WIDTH, HEIGHT - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    pipes.forEach(p => p.draw());
    bird.draw();

    // 1:1 In-game Score display
    if (isStarted && !isGameOver) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 60px Inter";
        ctx.textAlign = "center";
        ctx.fillText(score, WIDTH/2, 100);
    }

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

// --- INPUT ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!isStarted && !isGameOver) { /* No jump on menu */ }
        else if (isGameOver) { /* No jump on dead */ }
        else bird.flap();
    }
});

canvas.addEventListener('mousedown', () => {
    if (isStarted && !isGameOver) bird.flap();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isStarted && !isGameOver) bird.flap();
}, { passive: false });

draw();
