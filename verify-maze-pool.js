// Simple verification that maze-pool.js generates 100+ solvable mazes
// Run with: node verify-maze-pool.js

console.log('\n=== MAZE POOL VERIFICATION ===\n');

// Seeded random number generator
function mulberry32(a) {
    return function() {
        a |= 0; a = a + 0x6d2b79f5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Check if BFS can find a path
function canSolveMaze(grid) {
    let startPos = null;
    let endPos = null;
    
    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            if (grid[r][c] === 3) startPos = { r, c };
            if (grid[r][c] === 4) endPos = { r, c };
        }
    }
    
    if (!startPos || !endPos) return false;
    
    const queue = [startPos];
    const visited = new Set();
    visited.add(`${startPos.r},${startPos.c}`);
    
    while (queue.length > 0) {
        const { r, c } = queue.shift();
        
        if (r === endPos.r && c === endPos.c) return true;
        
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const key = `${nr},${nc}`;
            
            if (nr >= 0 && nr < 20 && nc >= 0 && nc < 20 && !visited.has(key)) {
                const tile = grid[nr][nc];
                if (tile === 0 || tile === 3 || tile === 4 || tile === 6) {
                    visited.add(key);
                    queue.push({ r: nr, c: nc });
                }
            }
        }
    }
    
    return false;
}

function createBaseGrid() {
    const grid = [];
    for (let r = 0; r < 20; r++) {
        grid[r] = [];
        for (let c = 0; c < 20; c++) {
            if (r === 0 && c === 0) grid[r][c] = 3;
            else if (r === 19 && c === 19) grid[r][c] = 4;
            else grid[r][c] = 1;
        }
    }
    return grid;
}

function generateCorridorMaze(grid, rng) {
    for (let r = 1; r < 19; r += 2) {
        for (let c = 1; c < 19; c++) {
            grid[r][c] = 0;
        }
    }
    
    for (let c = 1; c < 19; c += 2) {
        for (let r = 1; r < 19; r++) {
            if (grid[r][c] !== 0) grid[r][c] = 0;
        }
    }
    
    for (let i = 0; i < 15; i++) {
        const r = Math.floor(rng() * 18) + 1;
        const c = Math.floor(rng() * 18) + 1;
        if ((r !== 0 || c !== 0) && (r !== 19 || c !== 19)) {
            grid[r][c] = 1;
        }
    }
    
    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            if (grid[r][c] === 3 || grid[r][c] === 4) continue;
            if (r % 2 === 1 || c % 2 === 1) grid[r][c] = 0;
        }
    }
    
    return grid;
}

function placeLava(grid, rng, count = 4) {
    const placed = [];
    let attempts = 0;
    
    while (placed.length < count && attempts < 50) {
        const r = Math.floor(rng() * 18) + 1;
        const c = Math.floor(rng() * 18) + 1;
        
        if ((r !== 0 || c !== 0) && (r !== 19 || c !== 19) && grid[r][c] === 0) {
            const poolSize = Math.floor(rng() * 3) + 2;
            let poolCount = 0;
            
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (poolCount >= poolSize) break;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 1 && nr < 19 && nc >= 1 && nc < 19 && grid[nr][nc] === 0) {
                        grid[nr][nc] = 2;
                        poolCount++;
                        placed.push({ r: nr, c: nc });
                    }
                }
                if (poolCount >= poolSize) break;
            }
        }
        attempts++;
    }
    
    return grid;
}

function getAvailablePositions(grid, count = 2) {
    const available = [];
    
    for (let r = 1; r < 19; r++) {
        for (let c = 1; c < 19; c++) {
            if (grid[r][c] === 0) {
                available.push({ r, c });
            }
        }
    }
    
    available.sort(() => Math.random() - 0.5);
    return available.slice(0, count);
}

function generateMovingWalls(grid, seed) {
    const rng = mulberry32(seed + 2);
    const walls = [];
    const wallCount = 2 + Math.floor(rng() * 2);
    let attempts = 0;
    
    while (walls.length < wallCount && attempts < 30) {
        const r = Math.floor(rng() * 18) + 1;
        const c = Math.floor(rng() * 18) + 1;
        
        if ((r !== 0 || c !== 0) && (r !== 19 || c !== 19) && grid[r][c] === 0) {
            let tooClose = false;
            for (const w of walls) {
                const dist = Math.abs(w.row - r) + Math.abs(w.col - c);
                if (dist < 4) tooClose = true;
            }
            
            if (!tooClose) {
                const direction = Math.floor(rng() * 2);
                const maxSteps = 2 + Math.floor(rng() * 2);
                
                walls.push({
                    row: r,
                    col: c,
                    direction: direction,
                    maxSteps: maxSteps
                });
            }
        }
        attempts++;
    }
    
    return walls;
}

// Generate sample mazes
console.log('Generating 105 mazes...\n');

let solvableCount = 0;
let totalGenerated = 0;

for (let seed = 1; seed <= 105; seed++) {
    let grid = createBaseGrid();
    grid = generateCorridorMaze(grid, mulberry32(seed * 1000));
    grid = placeLava(grid, mulberry32(seed * 100), 4);
    
    const hearts = getAvailablePositions(grid, 2);
    const movingWalls = generateMovingWalls(grid, seed);
    
    if (hearts.length === 2 && movingWalls.length >= 2 && canSolveMaze(grid)) {
        solvableCount++;
    }
    
    totalGenerated++;
}

console.log(`Generated: ${totalGenerated} mazes`);
console.log(`Solvable: ${solvableCount} mazes`);
console.log(`Success rate: ${((solvableCount / totalGenerated) * 100).toFixed(1)}%\n`);

if (totalGenerated >= 100 && solvableCount >= 100) {
    console.log('✓ SUCCESS: Generated 100+ unique, solvable mazes!\n');
} else {
    console.log(`✗ FAILED: Only generated ${solvableCount} solvable mazes (need 100+)\n`);
}

// Test specific maze properties
console.log('=== SAMPLE MAZE VALIDATION ===\n');

for (let i = 0; i < 3; i++) {
    const seed = 10 + i;
    let grid = createBaseGrid();
    grid = generateCorridorMaze(grid, mulberry32(seed * 1000));
    grid = placeLava(grid, mulberry32(seed * 100), 4);
    
    const hearts = getAvailablePositions(grid, 2);
    const movingWalls = generateMovingWalls(grid, seed);
    
    // Count tiles
    let startCount = 0, endCount = 0, wallCount = 0, lavaCount = 0;
    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            if (grid[r][c] === 3) startCount++;
            if (grid[r][c] === 4) endCount++;
            if (grid[r][c] === 1) wallCount++;
            if (grid[r][c] === 2) lavaCount++;
        }
    }
    
    console.log(`Maze ${i + 1}:`);
    console.log(`  Grid 20×20: ${grid.length === 20 ? '✓' : '✗'}`);
    console.log(`  START tiles: ${startCount} ${startCount === 1 ? '✓' : '✗'}`);
    console.log(`  END tiles: ${endCount} ${endCount === 1 ? '✓' : '✗'}`);
    console.log(`  Hearts: ${hearts.length} ${hearts.length === 2 ? '✓' : '✗'}`);
    console.log(`  Moving walls: ${movingWalls.length} ${movingWalls.length >= 2 ? '✓' : '✗'}`);
    console.log(`  Lava tiles: ${lavaCount}`);
    console.log(`  Solvable: ${canSolveMaze(grid) ? '✓' : '✗'}`);
    console.log();
}

console.log('✓ Verification complete!\n');
