/**
 * TUNG TUNG SAHUR BIRD | Elite Ramadan Physics Core V1.0
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const mainMenu = document.getElementById('main-menu');
const tungSound = document.getElementById('tung-sound');

// --- GAME CONSTANTS ---
const WIDTH = 480;
const HEIGHT = 720;
canvas.width = WIDTH;
canvas.height = HEIGHT;

let score = 0;
let isStarted = false;
let isGameOver = false;
let frameCount = 0;

// --- SAHUR CONFIG ---
const CONFIG = {
    jump: -8.5,
    gravity: 0.48,
    gap: 170,
    speed: 3
};

// --- CORE GAME OBJECTS ---
class Bird {
    constructor() {
        this.reset();
        this.size = 40;
    }

    reset() {
        this.x = WIDTH / 4;
        this.y = HEIGHT / 2;
        this.velocity = 0;
        this.rotation = 0;
        this.dead = false;
    }

    flap() {
        if (this.dead) return;
        this.velocity = CONFIG.jump;
        this.rotation = -0.4;
        
        // Play "TUNG" Drum Sound
        tungSound.currentTime = 0;
        tungSound.play().catch(() => {});
        
        // Pulse HUD
        const pulses = document.querySelectorAll('.drum-pulse');
        pulses.forEach(p => p.classList.add('active'));
        setTimeout(() => pulses.forEach(p => p.classList.remove('active')), 200);
    }

    update() {
        this.velocity += CONFIG.gravity;
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
        gameOver();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // --- SAHUR BIRD RENDERING (Custom Sahur Drummer Style) ---
        // Body (Moonlit Purple)
        ctx.fillStyle = "#2b1055";
        ctx.strokeStyle = "#f1c40f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // The Drum (The "Kentongan" or Sahur Drum)
        ctx.fillStyle = "#f1c40f";
        ctx.fillRect(10, 5, 10, 20); // The golden drum
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(10, 5, 10, 20);
        
        // Eye (Waking up vibe)
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(10, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(12, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Wing
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

class Pipe {
    constructor(x) {
        this.x = x;
        this.width = 80;
        this.gap = CONFIG.gap - (score * 0.2);
        this.gap = Math.max(this.gap, 140);
        
        this.topHeight = Math.random() * (HEIGHT - this.gap - 100) + 50;
        this.passed = false;
    }

    update() {
        this.x -= CONFIG.speed + (score * 0.05);
    }

    draw() {
        // --- SAHUR MOSQUE OBSTACLES (Silhouettes) ---
        ctx.fillStyle = "#080808";
        ctx.strokeStyle = "rgba(241, 196, 15, 0.2)";
        ctx.lineWidth = 3;
        
        // Top Minaret
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.strokeRect(this.x, -10, this.width, this.topHeight + 10);
        
        // Bottom Minaret
        const bottomY = this.topHeight + this.gap;
        ctx.fillRect(this.x, bottomY, this.width, HEIGHT - bottomY);
        ctx.strokeRect(this.x, bottomY, this.width, HEIGHT - bottomY + 10);
        
        // Top Crescent on Minaret
        if (frameCount % 60 === 0) {
            ctx.fillStyle = "#f1c40f";
            ctx.font = "20px Arial";
            ctx.fillText("🌙", this.x + 20, this.topHeight + 20);
        }
    }
}

const bird = new Bird();
let pipes = [];

// --- ACTION HANDLERS ---
function startGame() {
    isStarted = true;
    isGameOver = false;
    score = 0;
    bird.reset();
    pipes = [new Pipe(WIDTH + 200)];
    scoreDisplay.innerText = "0";
    scoreDisplay.style.opacity = "1";
    mainMenu.style.display = "none";
}

function gameOver() {
    isGameOver = true;
    scoreDisplay.style.opacity = "0.5";
    mainMenu.style.display = "block";
    const title = document.querySelector('h1');
    const subtitle = document.querySelector('#subtitle');
    
    title.innerText = "SAHUR OVER";
    subtitle.innerText = `SCORE: ${score} HOUSEHOLDS WOKEN`;
}

// --- MAIN LOOP ---
function update() {
    if (!isStarted || isGameOver) return;
    frameCount++;

    bird.update();

    if (frameCount % 100 === 0) {
        pipes.push(new Pipe(WIDTH));
    }

    pipes.forEach((pipe, i) => {
        pipe.update();
        
        // Collision
        const buffer = 15;
        if (bird.x + bird.size/2 - buffer > pipe.x && 
            bird.x - bird.size/2 + buffer < pipe.x + pipe.width) {
            if (bird.y - buffer < pipe.topHeight || 
                bird.y + buffer > pipe.topHeight + pipe.gap) {
                bird.die();
            }
        }

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score++;
            pipe.passed = true;
            scoreDisplay.innerText = score;
        }

        if (pipe.x + pipe.width < 0) pipes.splice(i, 1);
    });
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Ramadan Background (Night Sky)
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#0a0a1a");
    sky.addColorStop(1, "#2b1055");
    ctx.fillStyle = sky;
    ctx.fillRect(0,0, WIDTH, HEIGHT);
    
    // Moon
    ctx.font = "100px Arial";
    ctx.fillStyle = "rgba(241, 196, 15, 0.4)";
    ctx.fillText("🌙", WIDTH - 120, 150);

    // Stars
    ctx.fillStyle = "#fff";
    for(let i=0; i<30; i++) {
        const x = (i * 137) % WIDTH;
        const y = (i * 159) % HEIGHT;
        const o = Math.sin(frameCount/20 + i) * 0.5 + 0.5;
        ctx.globalAlpha = o;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;

    pipes.forEach(p => p.draw());
    bird.draw();

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

// --- INPUT ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!isStarted || isGameOver) startGame();
        else bird.flap();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isStarted || isGameOver) startGame();
    else bird.flap();
}, { passive: false });

draw();
