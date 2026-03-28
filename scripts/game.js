/**
 * FLAPPY BIRD 1:1 CLONE | Elite Physics Core
 * Hyper-Upgrade: 100 Levels + Dynamic Themes + High-Fidelity Birds
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const mainMenu = document.getElementById('main-menu');
const gameOverMenu = document.getElementById('game-over');
const scoreBox = document.getElementById('score-box');
const goText = document.getElementById('go-text');
const skinNameDisplay = document.getElementById('skin-name');
const skinPreviewCanvas = document.getElementById('skinPreview');
const skinPreviewCtx = skinPreviewCanvas ? skinPreviewCanvas.getContext('2d') : null;
const skinCountDisplay = document.getElementById('skin-count');

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
let mode = 'endless'; 
let currentLevel = 0;
const MAX_LEVELS = 100;
const PIPES_PER_LEVEL = 10;

// --- THEME SYSTEM ---
const THEMES = [
    { name: "CLASSIC", top: "#0a0a2a", mid: "#ff8c00", bot: "#5d4037", pipe: "#2e7d32", lip: "#4caf50" },
    { name: "DESERT", top: "#87ceeb", mid: "#ffd700", bot: "#d2b48c", pipe: "#8b4513", lip: "#a0522d" },
    { name: "NEON", top: "#000000", mid: "#4b0082", bot: "#000000", pipe: "#ff00ff", lip: "#00d4ff" },
    { name: "GHOST", top: "#1a1a1b", mid: "#424242", bot: "#1a1a1b", pipe: "#616161", lip: "#9e9e9e" },
    { name: "OCEAN", top: "#01579b", mid: "#03a9f4", bot: "#0277bd", pipe: "#0d47a1", lip: "#29b6f6" }
];
let currentTheme = THEMES[0];

// --- SKINS (11 Variant High-Fidelity List) ---
const SKINS = [
    { name: "SUNNY", color: "#ffff00", beak: "#ff6600", accessory: null },
    { name: "RUBY", color: "#ff0000", beak: "#cc0000", accessory: "hair" },
    { name: "SKY", color: "#00d4ff", beak: "#ffcc00", accessory: null },
    { name: "FOREST", color: "#00ff88", beak: "#ff6600", accessory: "leaf" },
    { name: "GHOST", color: "#ffffff", beak: "rgba(0,0,0,0)", accessory: "halo" },
    { name: "COSMIC", color: "#ff00ff", beak: "#ffff00", accessory: "star" },
    { name: "SHADOW", color: "#222222", beak: "#ff0000", accessory: "crown" },
    { name: "MONKEY", color: "#8b4513", beak: "#d2b48c", accessory: "ears" },
    { name: "SWAN", color: "#f0f0f0", beak: "#ffa500", accessory: "neck" },
    { name: "DUCK", color: "#ffff00", beak: "#ffa500", accessory: "cap" },
    { name: "PIRATE", color: "#ffcc00", beak: "#ff6600", accessory: "hat" }
];
let currentSkinIndex = 0;

// --- SHARED RENDERERS ---
function drawBirdStatic(ctx, skin, x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    // Body
    ctx.fillStyle = skin.color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beak
    ctx.fillStyle = skin.beak;
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(24, 7);
    ctx.lineTo(12, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(8, -5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(10, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Accessory
    if (skin.accessory === "crown") {
        ctx.fillStyle = "#ffd700";
        ctx.beginPath(); ctx.moveTo(-10, -15); ctx.lineTo(-15, -25); ctx.lineTo(-10, -22); ctx.lineTo(-5, -28); ctx.lineTo(0, -22); ctx.lineTo(5, -25); ctx.lineTo(0, -15); ctx.closePath();
        ctx.fill(); ctx.stroke();
    } else if (skin.accessory === "hat") {
        ctx.fillStyle = "#000"; ctx.fillRect(-15, -20, 30, 5); ctx.fillRect(-10, -35, 20, 15);
    } else if (skin.accessory === "halo") {
        ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -30, 15, 5, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (skin.accessory === "leaf") {
        ctx.fillStyle = "#00ff00"; ctx.beginPath(); ctx.ellipse(0, -15, 10, 5, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (skin.accessory === "ears") {
        ctx.fillStyle = skin.color;
        ctx.beginPath(); ctx.arc(-15, -5, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(15, -5, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }

    ctx.restore();
}

function drawSkinPreview() {
    if (!skinPreviewCtx) return;
    skinPreviewCtx.clearRect(0, 0, 60, 60);
    drawBirdStatic(skinPreviewCtx, SKINS[currentSkinIndex], 30, 35);
}

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
        this.velocity += 0.45; 
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
        drawBirdStatic(ctx, SKINS[currentSkinIndex], 0, 0);
        ctx.restore();
    }
}

class Pipe {
    constructor(x) {
        this.x = x;
        this.width = 80;
        this.gap = 200;
        this.topHeight = Math.random() * (HEIGHT - this.gap - 250) + 120;
        this.passed = false;
    }

    update() {
        this.x -= 3.2;
    }

    draw() {
        ctx.fillStyle = currentTheme.pipe;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;

        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.strokeRect(this.x, -5, this.width, this.topHeight + 5);
        ctx.fillStyle = currentTheme.lip;
        ctx.fillRect(this.x - 5, this.topHeight - 30, this.width + 10, 30);
        ctx.strokeRect(this.x - 5, this.topHeight - 30, this.width + 10, 30);

        const bottomY = this.topHeight + this.gap;
        ctx.fillStyle = currentTheme.pipe;
        ctx.fillRect(this.x, bottomY, this.width, HEIGHT - bottomY);
        ctx.strokeRect(this.x, bottomY, this.width, HEIGHT - bottomY + 5);
        ctx.fillStyle = currentTheme.lip;
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
    skinCountDisplay.innerText = `${currentSkinIndex + 1} / ${SKINS.length}`;
    drawSkinPreview();
}

function nextSkin() { setSkin((currentSkinIndex + 1) % SKINS.length); }
function prevSkin() { setSkin((currentSkinIndex - 1 + SKINS.length) % SKINS.length); }

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
    
    currentTheme = THEMES[0];
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

    if (frameCount % 240 === 0) { // Hyper-Spaced Metaphorical '5 Feet' Gap
        pipes.push(new Pipe(WIDTH));
    }

    pipes.forEach((pipe, i) => {
        pipe.update();
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
            
            // THEME ROTATION
            currentTheme = THEMES[Math.floor(score / 10) % THEMES.length];
            
            if (mode === 'levels' && score >= PIPES_PER_LEVEL) {
                 currentLevel++;
                 bird.die(); 
            }
        }
        if (pipe.x + pipe.width < 0) pipes.splice(i, 1);
    });
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, currentTheme.top);
    sky.addColorStop(0.6, currentTheme.mid);
    sky.addColorStop(1, currentTheme.bot);
    ctx.fillStyle = sky;
    ctx.fillRect(0,0, WIDTH, HEIGHT);
    
    ctx.fillStyle = currentTheme.bot;
    ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(0, HEIGHT - 20); ctx.lineTo(WIDTH, HEIGHT - 20); ctx.stroke();
    ctx.setLineDash([]);

    pipes.forEach(p => p.draw());
    bird.draw();

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
        if (!isStarted && !isGameOver) { /* Start on Menu? Handle in btn */ }
        else if (isGameOver) { /* Handle in btn */ }
        else bird.flap();
    }
});

canvas.addEventListener('mousedown', () => { if (isStarted && !isGameOver) bird.flap(); });
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isStarted && !isGameOver) bird.flap();
}, { passive: false });

drawSkinPreview();
draw();
