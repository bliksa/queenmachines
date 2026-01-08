// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const GROUND_Y = 350;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const MAX_HEALTH = 100;
const ROUND_TIME = 99;

// Game State
let gameState = {
    paused: false,
    round: 1,
    timer: ROUND_TIME,
    player1Wins: 0,
    player2Wins: 0
};

// Animation states
const ANIMATIONS = {
    IDLE: 'idle',
    WALK_FORWARD: 'walk_forward',
    WALK_BACKWARD: 'walk_backward',
    JUMP: 'jump',
    CROUCH: 'crouch',
    PUNCH: 'punch',
    KICK: 'kick',
    BLOCK: 'block',
    HIT: 'hit'
};

// Fighter Class
class Fighter {
    constructor(x, y, playerNumber) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
        this.velocityY = 0;
        this.velocityX = 0;
        this.health = MAX_HEALTH;
        this.playerNumber = playerNumber;
        this.facingRight = playerNumber === 1;
        
        // Animation
        this.currentAnimation = ANIMATIONS.IDLE;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 10; // frames to wait before next animation frame
        
        // State flags
        this.isJumping = false;
        this.isCrouching = false;
        this.isBlocking = false;
        this.isAttacking = false;
        this.isHit = false;
        
        // Attack properties
        this.attackCooldown = 0;
        this.attackDuration = 0;
        this.hitCooldown = 0;
        
        // Colors for placeholder visualization
        this.color = playerNumber === 1 ? '#ff0000' : '#0000ff';
    }
    
    update(keys, opponent) {
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.attackDuration > 0) {
            this.attackDuration--;
            if (this.attackDuration === 0) {
                this.isAttacking = false;
                this.currentAnimation = ANIMATIONS.IDLE;
            }
        }
        if (this.hitCooldown > 0) {
            this.hitCooldown--;
            if (this.hitCooldown === 0) {
                this.isHit = false;
                this.currentAnimation = ANIMATIONS.IDLE;
            }
        }
        
        // Skip input if hit or attacking
        if (this.isHit || this.attackDuration > 0) {
            this.applyPhysics();
            this.updateAnimation();
            return;
        }
        
        // Update facing direction
        if (opponent.x > this.x) {
            this.facingRight = true;
        } else {
            this.facingRight = false;
        }
        
        // Reset velocityX
        this.velocityX = 0;
        
        // Handle input
        const controls = this.playerNumber === 1 ? 
            {left: 'a', right: 'd', up: 'w', down: 's', punch: 'j', kick: 'k', block: 'l'} :
            {left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', 
             punch: 'End', kick: 'ArrowDown', block: 'PageDown'}; // Num1, Num2, Num3
        
        // Blocking
        if (keys[controls.block]) {
            this.isBlocking = true;
            this.currentAnimation = ANIMATIONS.BLOCK;
        } else {
            this.isBlocking = false;
        }
        
        // Crouching
        if (keys[controls.down] && !this.isJumping && !this.isBlocking) {
            this.isCrouching = true;
            this.currentAnimation = ANIMATIONS.CROUCH;
        } else {
            this.isCrouching = false;
        }
        
        // Movement
        if (!this.isBlocking && !this.isCrouching && !this.isAttacking) {
            if (keys[controls.left]) {
                this.velocityX = -MOVE_SPEED;
                this.currentAnimation = this.facingRight ? ANIMATIONS.WALK_BACKWARD : ANIMATIONS.WALK_FORWARD;
            } else if (keys[controls.right]) {
                this.velocityX = MOVE_SPEED;
                this.currentAnimation = this.facingRight ? ANIMATIONS.WALK_FORWARD : ANIMATIONS.WALK_BACKWARD;
            } else if (!this.isJumping && this.currentAnimation !== ANIMATIONS.BLOCK && 
                       this.currentAnimation !== ANIMATIONS.CROUCH) {
                this.currentAnimation = ANIMATIONS.IDLE;
            }
        }
        
        // Jumping
        if (keys[controls.up] && !this.isJumping && !this.isCrouching) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
            this.currentAnimation = ANIMATIONS.JUMP;
        }
        
        // Attacks
        if (keys[controls.punch] && this.attackCooldown === 0 && !this.isJumping) {
            this.attack(ANIMATIONS.PUNCH, opponent);
        } else if (keys[controls.kick] && this.attackCooldown === 0 && !this.isJumping) {
            this.attack(ANIMATIONS.KICK, opponent);
        }
        
        this.applyPhysics();
        this.updateAnimation();
    }
    
    applyPhysics() {
        // Apply gravity
        this.velocityY += GRAVITY;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Ground collision
        if (this.y >= GROUND_Y) {
            this.y = GROUND_Y;
            this.velocityY = 0;
            this.isJumping = false;
            if (this.currentAnimation === ANIMATIONS.JUMP && !this.isHit && this.attackDuration === 0) {
                this.currentAnimation = ANIMATIONS.IDLE;
            }
        }
        
        // Boundary collision
        if (this.x < 0) this.x = 0;
        if (this.x > GAME_WIDTH - this.width) this.x = GAME_WIDTH - this.width;
    }
    
    attack(attackType, opponent) {
        this.isAttacking = true;
        this.currentAnimation = attackType;
        this.attackCooldown = 30;
        this.attackDuration = 15;
        this.animationFrame = 0;
        
        // Check if attack hits
        const damage = attackType === ANIMATIONS.PUNCH ? 5 : 8;
        const range = attackType === ANIMATIONS.PUNCH ? 80 : 90;
        
        const distance = Math.abs(this.x - opponent.x);
        const inRange = distance < range;
        const facingOpponent = (this.facingRight && opponent.x > this.x) || 
                               (!this.facingRight && opponent.x < this.x);
        
        if (inRange && facingOpponent && this.attackDuration > 5) {
            opponent.takeHit(damage);
        }
    }
    
    takeHit(damage) {
        if (this.isBlocking) {
            damage = Math.floor(damage / 3); // Blocking reduces damage
        }
        
        if (!this.isHit) {
            this.health -= damage;
            if (this.health < 0) this.health = 0;
            
            if (!this.isBlocking) {
                this.isHit = true;
                this.hitCooldown = 20;
                this.currentAnimation = ANIMATIONS.HIT;
                this.animationFrame = 0;
                
                // Knockback
                this.velocityX = this.facingRight ? -3 : 3;
            }
            
            // Update health bar
            const healthBar = document.getElementById(`health-bar-p${this.playerNumber}`);
            healthBar.style.width = this.health + '%';
        }
    }
    
    updateAnimation() {
        this.animationTimer++;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            
            // Reset animation frame based on animation type
            const maxFrames = {
                [ANIMATIONS.IDLE]: 4,
                [ANIMATIONS.WALK_FORWARD]: 6,
                [ANIMATIONS.WALK_BACKWARD]: 6,
                [ANIMATIONS.JUMP]: 3,
                [ANIMATIONS.CROUCH]: 1,
                [ANIMATIONS.PUNCH]: 3,
                [ANIMATIONS.KICK]: 4,
                [ANIMATIONS.BLOCK]: 1,
                [ANIMATIONS.HIT]: 2
            };
            
            if (this.animationFrame >= maxFrames[this.currentAnimation]) {
                this.animationFrame = 0;
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Flip sprite if facing left
        if (!this.facingRight) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.x, this.y);
        }
        
        // Draw placeholder sprite (colored square with text)
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.width, this.height);
        
        // Draw sprite filename text
        ctx.fillStyle = '#fff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        
        const spriteFilename = `p${this.playerNumber}_${this.currentAnimation}_${this.animationFrame}.png`;
        
        // Split filename for better display
        ctx.fillText(`P${this.playerNumber}`, this.width/2, 20);
        ctx.fillText(this.currentAnimation, this.width/2, 35);
        ctx.fillText(`frame ${this.animationFrame}`, this.width/2, 50);
        
        // Draw attack hitbox when attacking
        if (this.isAttacking && this.attackDuration > 5) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            const range = this.currentAnimation === ANIMATIONS.PUNCH ? 80 : 90;
            ctx.fillRect(this.width, this.height/3, range - this.width, this.height/3);
        }
        
        ctx.restore();
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityY = 0;
        this.velocityX = 0;
        this.health = MAX_HEALTH;
        this.currentAnimation = ANIMATIONS.IDLE;
        this.animationFrame = 0;
        this.isJumping = false;
        this.isCrouching = false;
        this.isBlocking = false;
        this.isAttacking = false;
        this.isHit = false;
        this.attackCooldown = 0;
        this.attackDuration = 0;
        this.hitCooldown = 0;
        
        const healthBar = document.getElementById(`health-bar-p${this.playerNumber}`);
        healthBar.style.width = '100%';
    }
}

// Initialize fighters
const player1 = new Fighter(150, GROUND_Y, 1);
const player2 = new Fighter(600, GROUND_Y, 2);

// Keyboard input
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Prevent default for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game timer
let timerInterval;

function startTimer() {
    gameState.timer = ROUND_TIME;
    document.getElementById('timer').textContent = gameState.timer;
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameState.paused) {
            gameState.timer--;
            document.getElementById('timer').textContent = gameState.timer;
            
            if (gameState.timer <= 0) {
                endRound('timeout');
            }
        }
    }, 1000);
}

// Show message
function showMessage(text, duration = 2000) {
    const messageEl = document.getElementById('game-message');
    messageEl.textContent = text;
    messageEl.classList.add('show');
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, duration);
}

// End round
function endRound(reason) {
    gameState.paused = true;
    clearInterval(timerInterval);
    
    let winner;
    if (reason === 'timeout') {
        winner = player1.health > player2.health ? 1 : 
                 player2.health > player1.health ? 2 : 0;
    } else if (player1.health <= 0) {
        winner = 2;
    } else if (player2.health <= 0) {
        winner = 1;
    }
    
    if (winner === 1) {
        gameState.player1Wins++;
        showMessage('PLAYER 1 WINS!', 3000);
    } else if (winner === 2) {
        gameState.player2Wins++;
        showMessage('PLAYER 2 WINS!', 3000);
    } else {
        showMessage('DRAW!', 3000);
    }
    
    // Check if match is over (best of 3)
    setTimeout(() => {
        if (gameState.player1Wins === 2) {
            showMessage('PLAYER 1 WINS THE MATCH!', 5000);
            setTimeout(resetMatch, 5000);
        } else if (gameState.player2Wins === 2) {
            showMessage('PLAYER 2 WINS THE MATCH!', 5000);
            setTimeout(resetMatch, 5000);
        } else {
            nextRound();
        }
    }, 3000);
}

// Next round
function nextRound() {
    gameState.round++;
    document.getElementById('round-text').textContent = `ROUND ${gameState.round}`;
    
    player1.reset(150, GROUND_Y);
    player2.reset(600, GROUND_Y);
    
    showMessage('FIGHT!', 2000);
    gameState.paused = false;
    startTimer();
}

// Reset match
function resetMatch() {
    gameState.round = 1;
    gameState.player1Wins = 0;
    gameState.player2Wins = 0;
    document.getElementById('round-text').textContent = 'ROUND 1';
    
    player1.reset(150, GROUND_Y);
    player2.reset(600, GROUND_Y);
    
    showMessage('FIGHT!', 2000);
    gameState.paused = false;
    startTimer();
}

// Draw background
function drawBackground() {
    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT * 0.7);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#f0e68c');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.7);
    
    // Ground
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT * 0.7, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#8b7355');
    groundGradient.addColorStop(1, '#654321');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT * 0.7, GAME_WIDTH, GAME_HEIGHT * 0.3);
    
    // Ground line
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + player1.height);
    ctx.lineTo(GAME_WIDTH, GROUND_Y + player1.height);
    ctx.stroke();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    drawBackground();
    
    if (!gameState.paused) {
        // Update fighters
        player1.update(keys, player2);
        player2.update(keys, player1);
        
        // Check for KO
        if (player1.health <= 0 || player2.health <= 0) {
            endRound('ko');
        }
    }
    
    // Draw fighters
    player1.draw(ctx);
    player2.draw(ctx);
    
    requestAnimationFrame(gameLoop);
}

// Start game
showMessage('ROUND 1 - FIGHT!', 2000);
startTimer();
gameLoop();
