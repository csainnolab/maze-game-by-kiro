/* ============================
   MAZE RUNNER - GAME LOGIC
   ============================ */

// Tile type constants
const TILE = {
    EMPTY: 0,
    WALL: 1,
    LAVA: 2,
    START: 3,
    END: 4,
    MOVING_WALL: 5,
    HEART: 6
};

// Game state constants
const GAME_STATE = {
    READY: 'READY',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    DEAD: 'DEAD',
    WON: 'WON'
};

// Game configuration
const CONFIG = {
    GRID_SIZE: 20,
    TILE_SIZE: 40,
    MOVING_WALL_INTERVAL: 750
};

// Game instance
const game = {
    state: GAME_STATE.READY,
    level: null,
    player: null,
    attempts: 1,
    timer: {
        elapsed: 0,
        started: false,
        intervalId: null
    },
    input: {
        pressed: {}
    },
    movingWalls: [],
    hearts: [],
    lastMoveTime: 0,
    moveDelay: 120,
    canvas: null,
    ctx: null,
    lastDamageSource: null,  // Track damage source for death messages
    currentMazeIndex: 0,      // Current maze index from pool
    previousMazeIndex: -1     // Previous maze to prevent immediate repeats
};

// ============================
// LEVEL DESIGN
// ============================

const LEVEL = [
    [3, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 2, 2, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4]
];

// Manually place hearts in the level at row 7 col 4 and row 15 col 4
// We'll need to update the level initialization to set these
const HEARTS_POSITIONS = [
    { row: 7, col: 4 },
    { row: 15, col: 4 }
];

// Moving walls definition: [row, col, direction, maxSteps]
// direction: 0=horizontal, 1=vertical
const MOVING_WALLS_DEF = [
    { row: 7, col: 10, direction: 0, maxSteps: 3 },   // Horizontal moving wall
    { row: 12, col: 10, direction: 1, maxSteps: 2 },  // Vertical moving wall
    { row: 15, col: 8, direction: 0, maxSteps: 2 }    // Horizontal moving wall
];

// ============================
// INITIALIZATION
// ============================

function init() {
    setupCanvas();
    
    // Validate maze pool before starting
    if (!validateMazePool()) {
        console.error('Maze pool validation failed. Some mazes may be invalid.');
    }
    
    setupLevel();
    setupMovingWalls();
    setupEventListeners();
    validateLevel();
    updateMazeDisplay();
    render();
}

function setupCanvas() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = CONFIG.GRID_SIZE * CONFIG.TILE_SIZE;
    game.canvas.height = CONFIG.GRID_SIZE * CONFIG.TILE_SIZE;
}

function setupLevel() {
    // Select a new maze from the pool
    const maze = selectMaze();
    
    if (!validateLevelStructure(maze.grid)) {
        console.error('Invalid maze structure');
        return;
    }

    // Copy maze grid
    game.level = maze.grid.map(row => [...row]);
    
    // Initialize hearts array from maze
    game.hearts = maze.hearts.map(h => ({...h}));
    
    // Initialize moving walls from maze
    game.movingWalls = maze.moving_walls.map(def => ({
        ...def,
        step: 0,
        direction_step: 1
    }));
    
    // Find player start position
    game.player = findTile(TILE.START);

    if (!game.player) {
        console.error('No start position found');
    }

    // Initialize player health to 5
    game.player.health = 5;
    
    updateHealthDisplay();
}

function setupMovingWalls() {
    game.movingWalls = MOVING_WALLS_DEF.map(def => ({
        ...def,
        step: 0,
        direction_step: 1
    }));
}

function setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Direction buttons
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const direction = btn.dataset.direction;
            handleMovement(direction);
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const direction = btn.dataset.direction;
                handleMovement(direction);
            }
        });
    });

    // Action buttons
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('restartBtn').addEventListener('click', restart);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('restartDeadBtn').addEventListener('click', restart);
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
}

// ============================
// KEYBOARD AND INPUT HANDLING
// ============================

function handleKeyDown(e) {
    const key = e.key.toUpperCase();

    if (key === 'W' || key === 'ARROWUP') {
        e.preventDefault();
        handleMovement('UP');
    } else if (key === 'S' || key === 'ARROWDOWN') {
        e.preventDefault();
        handleMovement('DOWN');
    } else if (key === 'A' || key === 'ARROWLEFT') {
        e.preventDefault();
        handleMovement('LEFT');
    } else if (key === 'D' || key === 'ARROWRIGHT') {
        e.preventDefault();
        handleMovement('RIGHT');
    } else if (key === 'R') {
        e.preventDefault();
        restart();
    } else if (key === 'ESCAPE') {
        e.preventDefault();
        togglePause();
    }

    game.input.pressed[key] = true;
}

function handleKeyUp(e) {
    const key = e.key.toUpperCase();
    game.input.pressed[key] = false;
}

// ============================
// MOVEMENT AND COLLISION
// ============================

function handleMovement(direction) {
    if (game.state === GAME_STATE.READY) {
        startGame();
    }

    if (game.state !== GAME_STATE.PLAYING) {
        return;
    }

    const now = Date.now();
    if (now - game.lastMoveTime < game.moveDelay) {
        return;
    }

    const { row, col } = game.player;
    let newRow = row;
    let newCol = col;

    switch (direction) {
        case 'UP':
            newRow = Math.max(0, row - 1);
            break;
        case 'DOWN':
            newRow = Math.min(CONFIG.GRID_SIZE - 1, row + 1);
            break;
        case 'LEFT':
            newCol = Math.max(0, col - 1);
            break;
        case 'RIGHT':
            newCol = Math.min(CONFIG.GRID_SIZE - 1, col + 1);
            break;
    }

    if (canMove(newRow, newCol)) {
        game.player = { row: newRow, col: newCol };
        game.lastMoveTime = now;

        checkCollisions();
        render();
    }
}

function canMove(row, col) {
    if (row < 0 || row >= CONFIG.GRID_SIZE || col < 0 || col >= CONFIG.GRID_SIZE) {
        return false;
    }

    const tile = game.level[row][col];

    // Cannot move into walls or lava
    if (tile === TILE.WALL || tile === TILE.LAVA) {
        return false;
    }

    // Can move into moving wall tile - collision will be handled separately
    return true;
}

function checkCollisions() {
    const { row, col } = game.player;
    const tile = game.level[row][col];

    // Check lava collision
    if (tile === TILE.LAVA) {
        applyDamage(1, 'lava');
        return;
    }

    // Check moving wall collision
    for (const mw of game.movingWalls) {
        if (mw.row === row && mw.col === col) {
            // Player collided with moving wall - apply damage and bounce back
            bouncePlayerBack(mw);
            applyDamage(1, 'moving_wall');
            return;
        }
    }

    // Check heart collision
    if (tile === TILE.HEART) {
        collectHeart(row, col);
    }

    // Check win condition
    if (tile === TILE.END) {
        win();
    }
}

function applyDamage(amount, source) {
    game.player.health -= amount;
    game.lastDamageSource = source;
    updateHealthDisplay();

    // Check if health reaches 0
    if (game.player.health <= 0) {
        const deathMessage = source === 'lava' ? 'Burned by lava!' : 'Crushed by a moving wall!';
        kill(deathMessage);
    }
}

function bouncePlayerBack(wall) {
    const { row, col } = game.player;
    const { direction } = wall;
    
    let bumpRow = row;
    let bumpCol = col;
    
    if (direction === 0) {
        // Horizontal moving wall: bump UP or DOWN
        // Determine which direction based on wall's current position relative to origin
        const originalCol = MOVING_WALLS_DEF.find(def => 
            def.row === wall.row && def.direction === 0
        ).col;
        
        // If wall moved right, bump player down; if wall moved left, bump player up
        if (wall.col > originalCol) {
            // Wall moved right, bump player down
            bumpRow = Math.min(row + 1, CONFIG.GRID_SIZE - 1);
        } else {
            // Wall moved left, bump player up
            bumpRow = Math.max(row - 1, 0);
        }
    } else {
        // Vertical moving wall: bump LEFT or RIGHT
        // Determine which direction based on wall's current position relative to origin
        const originalRow = MOVING_WALLS_DEF.find(def => 
            def.col === wall.col && def.direction === 1
        ).row;
        
        // If wall moved down, bump player right; if wall moved up, bump player left
        if (wall.row > originalRow) {
            // Wall moved down, bump player right
            bumpCol = Math.min(col + 1, CONFIG.GRID_SIZE - 1);
        } else {
            // Wall moved up, bump player left
            bumpCol = Math.max(col - 1, 0);
        }
    }
    
    // Move player to bumped position if it's a valid tile (not a wall or lava)
    const bumpTile = game.level[bumpRow][bumpCol];
    if (bumpTile !== TILE.WALL && bumpTile !== TILE.LAVA) {
        game.player.row = bumpRow;
        game.player.col = bumpCol;
    }
}

function collectHeart(row, col) {
    // Remove heart from hearts array
    game.hearts = game.hearts.filter(h => !(h.row === row && h.col === col));
    
    // Increase player health (capped at 5)
    game.player.health = Math.min(game.player.health + 1, 5);
    
    // Update health display
    updateHealthDisplay();
    
    // Remove heart from level (replace with EMPTY)
    game.level[row][col] = TILE.EMPTY;
    
    // TODO: Display "+1 Health" feedback animation
}

// ============================
// TIMER MANAGEMENT
// ============================

function startTimer() {
    if (game.timer.started) {
        return;
    }

    game.timer.started = true;
    game.timer.elapsed = 0;

    game.timer.intervalId = setInterval(() => {
        game.timer.elapsed += 16; // ~60fps
        updateTimerDisplay();
    }, 16);
}

function stopTimer() {
    if (game.timer.intervalId) {
        clearInterval(game.timer.intervalId);
        game.timer.intervalId = null;
    }
    game.timer.started = false;
}

function updateTimerDisplay() {
    const total = Math.floor(game.timer.elapsed);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const milliseconds = total % 1000;

    const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(Math.floor(milliseconds / 10)).padStart(2, '0')}`;
    document.getElementById('timer').textContent = timerStr;
}

// ============================
// MOVING WALLS
// ============================

function updateMovingWalls() {
    for (const mw of game.movingWalls) {
        mw.step += mw.direction_step;

        if (mw.step > mw.maxSteps || mw.step < 0) {
            mw.direction_step *= -1;
            mw.step += mw.direction_step;
        }

        if (mw.direction === 0) {
            // Horizontal movement
            mw.col = MOVING_WALLS_DEF.find(def => 
                def.row === mw.row && 
                def.col === MOVING_WALLS_DEF.find(d => d.row === mw.row && d.direction === 0).col
            ).col + mw.step;
        } else {
            // Vertical movement
            mw.row = MOVING_WALLS_DEF.find(def => 
                def.col === mw.col && 
                def.direction === 1
            ).row + mw.step;
        }
    }

    // Check if moving wall collides with player
    if (game.state === GAME_STATE.PLAYING) {
        checkCollisions();
    }
}

// ============================
// GAME STATE MANAGEMENT
// ============================

function startGame() {
    game.state = GAME_STATE.PLAYING;
    startTimer();
    startMovingWallsAnimation();
}

function startMovingWallsAnimation() {
    setInterval(() => {
        if (game.state === GAME_STATE.PLAYING) {
            updateMovingWalls();
            render();
        }
    }, CONFIG.MOVING_WALL_INTERVAL);
}

function togglePause() {
    if (game.state === GAME_STATE.PLAYING) {
        game.state = GAME_STATE.PAUSED;
        stopTimer();
        showOverlay('pauseOverlay');
    } else if (game.state === GAME_STATE.PAUSED) {
        game.state = GAME_STATE.PLAYING;
        startTimer();
        hideOverlay('pauseOverlay');
        render();
    }
}

function restart() {
    // Close all overlays
    hideOverlay('pauseOverlay');
    hideOverlay('deadOverlay');
    hideOverlay('winOverlay');

    // Reset game state
    stopTimer();
    game.state = GAME_STATE.READY;
    game.timer.elapsed = 0;
    game.attempts += 1;
    updateAttemptsDisplay();

    setupLevel();
    setupMovingWalls();
    updateTimerDisplay();
    updateHealthDisplay();
    render();
}

function playAgain() {
    hideOverlay('winOverlay');
    stopTimer();
    game.state = GAME_STATE.READY;
    game.timer.elapsed = 0;
    game.attempts = 1;
    updateAttemptsDisplay();

    setupLevel();
    setupMovingWalls();
    updateTimerDisplay();
    updateHealthDisplay();
    render();
}

function kill(reason) {
    game.state = GAME_STATE.DEAD;
    stopTimer();
    document.getElementById('deathMessage').textContent = reason;
    showOverlay('deadOverlay');
}

function win() {
    game.state = GAME_STATE.WON;
    stopTimer();

    const time = formatTime(game.timer.elapsed);
    document.getElementById('winStats').textContent = `Time: ${time} | Attempts: ${game.attempts}`;
    showOverlay('winOverlay');
}

function updateAttemptsDisplay() {
    document.getElementById('attempts').textContent = game.attempts;
}

// ============================
// RENDERING
// ============================

function render() {
    clearCanvas();
    drawTiles();
    drawMovingWalls();
    drawPlayer();
}

function clearCanvas() {
    game.ctx.fillStyle = '#1A1F3A';
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
}

function drawTiles() {
    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            const tile = game.level[row][col];
            const x = col * CONFIG.TILE_SIZE;
            const y = row * CONFIG.TILE_SIZE;

            switch (tile) {
                case TILE.EMPTY:
                    drawTile(x, y, '#1A1F3A', '#2D3A4F');
                    break;
                case TILE.WALL:
                    drawTile(x, y, '#2D1B4E', '#4A2E6E');
                    break;
                case TILE.LAVA:
                    drawLava(x, y);
                    break;
                case TILE.START:
                    drawTile(x, y, '#4CAF50', '#66BB6A');
                    break;
                case TILE.END:
                    drawTile(x, y, '#FFD700', '#FFEB3B');
                    break;
                case TILE.HEART:
                    drawHeart(x, y);
                    break;
            }
        }
    }
}

function drawTile(x, y, color, highlight) {
    game.ctx.fillStyle = color;
    game.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    game.ctx.strokeStyle = highlight;
    game.ctx.lineWidth = 1;
    game.ctx.strokeRect(x + 0.5, y + 0.5, CONFIG.TILE_SIZE - 1, CONFIG.TILE_SIZE - 1);
}

function drawLava(x, y) {
    game.ctx.fillStyle = '#FF5722';
    game.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    
    // Add lava animation effect
    game.ctx.fillStyle = '#FF7043';
    for (let i = 0; i < 3; i++) {
        const offsetX = Math.sin(Date.now() / 100 + i) * 2;
        const offsetY = Math.cos(Date.now() / 100 + i) * 2;
        game.ctx.fillRect(x + 5 + offsetX, y + 5 + offsetY, 5, 5);
    }

    game.ctx.strokeStyle = '#FB5607';
    game.ctx.lineWidth = 1;
    game.ctx.strokeRect(x + 0.5, y + 0.5, CONFIG.TILE_SIZE - 1, CONFIG.TILE_SIZE - 1);
}

function drawHeart(x, y) {
    // Draw golden/yellow heart tile
    game.ctx.fillStyle = '#FFD700';
    game.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    
    // Add heart animation effect (pulse)
    const pulseIntensity = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    game.ctx.fillStyle = `rgba(255, 215, 0, ${pulseIntensity})`;
    game.ctx.fillRect(x + 4, y + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8);
    
    // Draw heart symbol in the center
    game.ctx.fillStyle = '#FF1744';
    const cx = x + CONFIG.TILE_SIZE / 2;
    const cy = y + CONFIG.TILE_SIZE / 2;
    const size = 6;
    
    // Simple heart shape
    game.ctx.beginPath();
    game.ctx.moveTo(cx, cy + size);
    game.ctx.bezierCurveTo(cx - size, cy - size/2, cx - size, cy - size, cx - size/2, cy - size);
    game.ctx.bezierCurveTo(cx - size/2, cy - size, cx, cy, cx, cy);
    game.ctx.bezierCurveTo(cx, cy, cx + size/2, cy - size, cx + size/2, cy - size);
    game.ctx.bezierCurveTo(cx + size, cy - size, cx + size, cy - size/2, cx, cy + size);
    game.ctx.fill();
    
    game.ctx.strokeStyle = '#FFEB3B';
    game.ctx.lineWidth = 1;
    game.ctx.strokeRect(x + 0.5, y + 0.5, CONFIG.TILE_SIZE - 1, CONFIG.TILE_SIZE - 1);
}

function drawMovingWalls() {
    for (const mw of game.movingWalls) {
        const x = mw.col * CONFIG.TILE_SIZE;
        const y = mw.row * CONFIG.TILE_SIZE;

        game.ctx.fillStyle = '#9C27B0';
        game.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // Add pulse effect
        const pulseIntensity = Math.sin(Date.now() / 150) * 0.3 + 0.7;
        game.ctx.fillStyle = `rgba(156, 39, 176, ${pulseIntensity})`;
        game.ctx.fillRect(x + 3, y + 3, CONFIG.TILE_SIZE - 6, CONFIG.TILE_SIZE - 6);

        game.ctx.strokeStyle = '#E91E63';
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(x + 0.5, y + 0.5, CONFIG.TILE_SIZE - 1, CONFIG.TILE_SIZE - 1);
    }
}

function drawPlayer() {
    const x = game.player.col * CONFIG.TILE_SIZE;
    const y = game.player.row * CONFIG.TILE_SIZE;

    game.ctx.fillStyle = '#00D9FF';
    game.ctx.fillRect(x + 4, y + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8);

    game.ctx.strokeStyle = '#00B8CC';
    game.ctx.lineWidth = 2;
    game.ctx.strokeRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);

    // Draw player eyes for character
    game.ctx.fillStyle = '#000';
    game.ctx.fillRect(x + 10, y + 10, 4, 4);
    game.ctx.fillRect(x + 26, y + 10, 4, 4);
}

// ============================
// LEVEL VALIDATION
// ============================

function validateLevel() {
    const errors = [];

    if (!validateLevelStructure(game.level)) {
        errors.push('Invalid level structure');
    }

    if (!hasStartAndEnd()) {
        errors.push('Level must have START and END');
    }

    if (!movingWallsAdjacent()) {
        errors.push('Moving walls must be adjacent to empty or walkable tiles');
    }

    if (!hasPathToEnd()) {
        errors.push('No valid path from START to END');
    }

    if (errors.length > 0) {
        console.error('Level validation errors:', errors);
    }
}

function validateLevelStructure(level) {
    if (!Array.isArray(level) || level.length !== CONFIG.GRID_SIZE) {
        return false;
    }

    for (const row of level) {
        if (!Array.isArray(row) || row.length !== CONFIG.GRID_SIZE) {
            return false;
        }
        for (const tile of row) {
            if (tile < 0 || tile > 6) {
                return false;
            }
        }
    }

    return true;
}

function selectMaze() {
    // Select a random maze that's not the same as the previous one
    let randomIndex = Math.floor(Math.random() * MAZE_POOL.length);
    
    // Ensure we don't repeat the previous maze
    while (randomIndex === game.previousMazeIndex && MAZE_POOL.length > 1) {
        randomIndex = Math.floor(Math.random() * MAZE_POOL.length);
    }
    
    game.currentMazeIndex = randomIndex;
    return getMazeById(randomIndex);
}

function hasStartAndEnd() {
    let hasStart = false;
    let hasEnd = false;

    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            if (game.level[row][col] === TILE.START) hasStart = true;
            if (game.level[row][col] === TILE.END) hasEnd = true;
        }
    }

    return hasStart && hasEnd;
}

function movingWallsAdjacent() {
    for (const mw of MOVING_WALLS_DEF) {
        const { row, col } = mw;
        if (game.level[row][col] !== TILE.EMPTY) {
            return false;
        }
    }
    return true;
}

function hasPathToEnd() {
    const start = findTile(TILE.START);
    const end = findTile(TILE.END);

    if (!start || !end) return false;

    const queue = [start];
    const visited = new Set();
    visited.add(`${start.row},${start.col}`);

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.row === end.row && current.col === end.col) {
            return true;
        }

        const directions = [
            { row: current.row - 1, col: current.col },
            { row: current.row + 1, col: current.col },
            { row: current.row, col: current.col - 1 },
            { row: current.row, col: current.col + 1 }
        ];

        for (const next of directions) {
            const key = `${next.row},${next.col}`;

            if (visited.has(key)) continue;
            if (next.row < 0 || next.row >= CONFIG.GRID_SIZE) continue;
            if (next.col < 0 || next.col >= CONFIG.GRID_SIZE) continue;

            const tile = game.level[next.row][next.col];
            if (tile === TILE.WALL || tile === TILE.LAVA) continue;

            visited.add(key);
            queue.push(next);
        }
    }

    return false;
}

function findTile(tileType) {
    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            if (game.level[row][col] === tileType) {
                return { row, col };
            }
        }
    }
    return null;
}

// ============================
// HEALTH DISPLAY
// ============================

function updateHealthDisplay() {
    const health = game.player.health;
    const healthElement = document.getElementById('health');
    
    // Build heart display: N filled hearts + (5-N) empty hearts
    let hearts = '';
    for (let i = 0; i < 5; i++) {
        if (i < health) {
            hearts += '❤️';  // Filled heart
        } else {
            hearts += '🤍';  // Empty heart
        }
    }
    healthElement.textContent = hearts;
}

// ============================
// MAZE DISPLAY
// ============================

function updateMazeDisplay() {
    const mazeElement = document.getElementById('mazeCounter');
    if (mazeElement) {
        const totalMazes = MAZE_POOL ? MAZE_POOL.length : 1;
        const currentMaze = game.currentMazeIndex + 1;
        mazeElement.textContent = `Maze ${currentMaze} of ${totalMazes}`;
    }
}

// ============================
// UI UTILITIES
// ============================

function showOverlay(id) {
    const overlay = document.getElementById(id);
    overlay.classList.add('active');
}

function hideOverlay(id) {
    const overlay = document.getElementById(id);
    overlay.classList.remove('active');
}

function formatTime(ms) {
    const total = Math.floor(ms);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const milliseconds = total % 1000;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(Math.floor(milliseconds / 10)).padStart(2, '0')}`;
}

// ============================
// START THE GAME
// ============================

window.addEventListener('DOMContentLoaded', init);
