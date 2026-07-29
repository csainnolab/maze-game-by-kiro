// Maze Pool - Collection of 100+ preset 20x20 mazes
// Each maze is generated with validated solvability via BFS

// Helper function: Check if BFS can find a path from START (3) to END (4)
function canSolveMaze(grid) {
    let startPos = null;
    let endPos = null;
    
    // Find start and end positions
    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            if (grid[r][c] === 3) startPos = { r, c };
            if (grid[r][c] === 4) endPos = { r, c };
        }
    }
    
    if (!startPos || !endPos) return false;
    
    // BFS to find path
    const queue = [startPos];
    const visited = new Set();
    visited.add(`${startPos.r},${startPos.c}`);
    
    while (queue.length > 0) {
        const { r, c } = queue.shift();
        
        if (r === endPos.r && c === endPos.c) return true;
        
        // Check all 4 directions
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const key = `${nr},${nc}`;
            
            // Check bounds and if not visited
            if (nr >= 0 && nr < 20 && nc >= 0 && nc < 20 && !visited.has(key)) {
                const tile = grid[nr][nc];
                // Walkable tiles: EMPTY (0), START (3), END (4), HEART (6)
                // NOT walkable: WALL (1), LAVA (2), MOVING_WALL (5)
                if (tile === 0 || tile === 3 || tile === 4 || tile === 6) {
                    visited.add(key);
                    queue.push({ r: nr, c: nc });
                }
            }
        }
    }
    
    return false;
}

// Maze generation templates with different patterns
function generateMaze(seed, pattern) {
    const rng = mulberry32(seed);
    let grid = createBaseGrid();
    
    // Apply pattern-specific generation
    switch (pattern) {
        case 'corridors':
            grid = generateCorridorMaze(grid, rng);
            break;
        case 'rooms':
            grid = generateRoomMaze(grid, rng);
            break;
        case 'spiral':
            grid = generateSpiralMaze(grid, rng);
            break;
        case 'chaos':
            grid = generateChaosMaze(grid, rng);
            break;
        default:
            grid = generateCorridorMaze(grid, rng);
    }
    
    return grid;
}

// Seeded random number generator (Mulberry32)
function mulberry32(a) {
    return function() {
        a |= 0; a = a + 0x6d2b79f5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Create base 20x20 grid with START at (0,0) and END at (19,19)
function createBaseGrid() {
    const grid = [];
    for (let r = 0; r < 20; r++) {
        grid[r] = [];
        for (let c = 0; c < 20; c++) {
            if (r === 0 && c === 0) grid[r][c] = 3; // START
            else if (r === 19 && c === 19) grid[r][c] = 4; // END
            else grid[r][c] = 1; // Default to WALL
        }
    }
    return grid;
}

// Corridor-based maze generation
function generateCorridorMaze(grid, rng) {
    // Create horizontal and vertical corridors
    for (let r = 1; r < 19; r += 2) {
        for (let c = 1; c < 19; c++) {
            grid[r][c] = 0; // EMPTY
        }
    }
    
    for (let c = 1; c < 19; c += 2) {
        for (let r = 1; r < 19; r++) {
            if (grid[r][c] !== 0) grid[r][c] = 0; // EMPTY
        }
    }
    
    // Add some walls for variation
    for (let i = 0; i < 15; i++) {
        const r = Math.floor(rng() * 18) + 1;
        const c = Math.floor(rng() * 18) + 1;
        if ((r !== 0 || c !== 0) && (r !== 19 || c !== 19)) {
            grid[r][c] = 1; // Add wall
        }
    }
    
    // Ensure corridor connectivity
    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            if (grid[r][c] === 3 || grid[r][c] === 4) continue;
            if (r % 2 === 1 || c % 2 === 1) grid[r][c] = 0;
        }
    }
    
    return grid;
}

// Room-based maze generation
function generateRoomMaze(grid, rng) {
    // Create 5x5 rooms with walls between them
    for (let roomR = 0; roomR < 5; roomR++) {
        for (let roomC = 0; roomC < 5; roomC++) {
            const baseR = roomR * 4;
            const baseC = roomC * 4;
            
            // Fill room with empty space
            for (let r = baseR + 1; r < Math.min(baseR + 4, 20); r++) {
                for (let c = baseC + 1; c < Math.min(baseC + 4, 20); c++) {
                    if ((r !== 0 || c !== 0) && (r !== 19 || c !== 19)) {
                        grid[r][c] = 0;
                    }
                }
            }
        }
    }
    
    // Create passages between rooms
    for (let roomR = 0; roomR < 4; roomR++) {
        for (let roomC = 0; roomC < 4; roomC++) {
            // Vertical passage
            if (rng() > 0.3) {
                const r = roomR * 4 + 2;
                const c = roomC * 4 + 4;
                if (c < 20) grid[r][c] = 0;
            }
            // Horizontal passage
            if (rng() > 0.3) {
                const r = roomR * 4 + 4;
                const c = roomC * 4 + 2;
                if (r < 20) grid[r][c] = 0;
            }
        }
    }
    
    return grid;
}

// Spiral-based maze generation
function generateSpiralMaze(grid, rng) {
    let r = 1, c = 1;
    let dr = 0, dc = 1;
    let steps = 1;
    let stepCount = 0;
    let turns = 0;
    
    while (r < 19 && c < 19) {
        grid[r][c] = 0; // EMPTY
        
        r += dr;
        c += dc;
        stepCount++;
        
        if (stepCount === steps) {
            stepCount = 0;
            turns++;
            
            // Rotate direction: right -> down -> left -> up
            const temp = dr;
            dr = dc;
            dc = -temp;
            
            if (turns % 2 === 0) steps++;
        }
        
        if (r < 0 || r >= 20 || c < 0 || c >= 20) break;
    }
    
    // Fill in surrounding space
    for (let rr = 1; rr < 19; rr += 2) {
        for (let cc = 1; cc < 19; cc += 2) {
            grid[rr][cc] = 0;
        }
    }
    
    return grid;
}

// Chaotic maze generation (random paths)
function generateChaosMaze(grid, rng) {
    // Create multiple random paths from start to end
    const paths = 3;
    
    for (let path = 0; path < paths; path++) {
        let r = 0, c = 0;
        
        while (r < 19 || c < 19) {
            grid[r][c] = 0; // EMPTY
            
            // Bias toward target but allow random detours
            const moveToward = rng() > 0.4;
            if (moveToward) {
                if (r < 19 && rng() > 0.5) r++;
                else if (c < 19) c++;
            } else {
                if (r > 0 && rng() > 0.5) r--;
                else if (c > 0) c--;
            }
            
            // Clamp to grid
            r = Math.max(0, Math.min(19, r));
            c = Math.max(0, Math.min(19, c));
        }
    }
    
    grid[0][0] = 3; // START
    grid[19][19] = 4; // END
    
    return grid;
}

// Place lava pools randomly on the maze
function placeLava(grid, rng, count = 4) {
    const placed = [];
    let attempts = 0;
    
    while (placed.length < count && attempts < 50) {
        const r = Math.floor(rng() * 18) + 1;
        const c = Math.floor(rng() * 18) + 1;
        
        if ((r !== 0 || c !== 0) && (r !== 19 || c !== 19) && grid[r][c] === 0) {
            // Create 2-4 cell lava pool
            const poolSize = Math.floor(rng() * 3) + 2;
            let poolCount = 0;
            
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (poolCount >= poolSize) break;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 1 && nr < 19 && nc >= 1 && nc < 19 && grid[nr][nc] === 0) {
                        grid[nr][nc] = 2; // LAVA
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

// Find empty positions for hearts (away from walls and lava)
function getAvailablePositions(grid, count = 2) {
    const available = [];
    
    for (let r = 1; r < 19; r++) {
        for (let c = 1; c < 19; c++) {
            if (grid[r][c] === 0) {
                available.push({ r, c });
            }
        }
    }
    
    // Shuffle and pick first count
    available.sort(() => Math.random() - 0.5);
    return available.slice(0, count);
}

// Generate all 100+ preset mazes
function generateMazePool() {
    const pool = [];
    const patterns = ['corridors', 'rooms', 'spiral', 'chaos'];
    const difficulties = ['easy', 'medium', 'hard'];
    let id = 0;
    
    for (let seed = 1; seed <= 105 && id < 105; seed++) {
        for (let pIdx = 0; pIdx < patterns.length && id < 105; pIdx++) {
            const pattern = patterns[pIdx];
            let grid = generateMaze(seed * 1000 + pIdx, pattern);
            
            // Place lava
            const lavaCounts = [3, 4, 5, 6];
            const lavaCount = lavaCounts[Math.floor(seed % 4)];
            grid = placeLava(grid, mulberry32(seed * 100 + pIdx), lavaCount);
            
            // Get heart positions
            const hearts = getAvailablePositions(grid, 2);
            
            // Validate maze
            if (canSolveMaze(grid) && hearts.length === 2) {
                // Calculate difficulty
                let difficulty = difficulties[Math.floor(seed % 3)];
                
                // Count hazards for metadata
                let hazardCount = 0;
                for (let r = 0; r < 20; r++) {
                    for (let c = 0; c < 20; c++) {
                        if (grid[r][c] === 2) hazardCount++; // Count LAVA
                    }
                }
                
                const maze = {
                    id: id,
                    grid: grid,
                    moving_walls: generateMovingWalls(grid, seed),
                    hearts: hearts,
                    difficulty: difficulty,
                    hazard_count: hazardCount,
                    pattern: pattern
                };
                
                pool.push(maze);
                id++;
            }
        }
    }
    
    // Fill in any remaining slots if needed
    while (pool.length < 100) {
        const seed = pool.length + 1000;
        const pattern = patterns[pool.length % 4];
        let grid = generateMaze(seed, pattern);
        grid = placeLava(grid, mulberry32(seed + 1), 4 + (pool.length % 3));
        const hearts = getAvailablePositions(grid, 2);
        
        if (canSolveMaze(grid) && hearts.length === 2) {
            let hazardCount = 0;
            for (let r = 0; r < 20; r++) {
                for (let c = 0; c < 20; c++) {
                    if (grid[r][c] === 2) hazardCount++;
                }
            }
            
            const maze = {
                id: pool.length,
                grid: grid,
                moving_walls: generateMovingWalls(grid, seed),
                hearts: hearts,
                difficulty: difficulties[pool.length % 3],
                hazard_count: hazardCount,
                pattern: pattern
            };
            
            pool.push(maze);
        }
    }
    
    return pool;
}

// Generate moving wall definitions for a maze
function generateMovingWalls(grid, seed) {
    const rng = mulberry32(seed + 2);
    const walls = [];
    const wallCount = 2 + Math.floor(rng() * 2); // 2-3 moving walls
    let attempts = 0;
    
    while (walls.length < wallCount && attempts < 30) {
        const r = Math.floor(rng() * 18) + 1;
        const c = Math.floor(rng() * 18) + 1;
        
        // Check if position is valid (not START, END, or already a wall)
        if ((r !== 0 || c !== 0) && (r !== 19 || c !== 19) && grid[r][c] === 0) {
            // Check not too close to other moving walls
            let tooClose = false;
            for (const w of walls) {
                const dist = Math.abs(w.row - r) + Math.abs(w.col - c);
                if (dist < 4) tooClose = true;
            }
            
            if (!tooClose) {
                const direction = Math.floor(rng() * 2); // 0 = horizontal, 1 = vertical
                const maxSteps = 2 + Math.floor(rng() * 2); // 2-3 steps
                
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

// Initialize the maze pool with 100+ mazes
const MAZE_POOL = generateMazePool();

// Validate maze structure
function validateMaze(maze) {
    const errors = [];
    
    // Check if grid is 20x20
    if (!maze.grid || maze.grid.length !== 20) {
        errors.push('Grid must have 20 rows');
        return errors;
    }
    
    for (let i = 0; i < 20; i++) {
        if (maze.grid[i].length !== 20) {
            errors.push(`Row ${i} does not have 20 columns`);
        }
    }
    
    // Check for START and END tiles
    let startCount = 0;
    let endCount = 0;
    let heartCount = 0;
    let movingWallCount = 0;
    
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
            const tile = maze.grid[row][col];
            if (tile === 3) startCount++;
            if (tile === 4) endCount++;
            if (tile === 6) heartCount++;
        }
    }
    
    if (startCount !== 1) errors.push(`Expected 1 START tile, found ${startCount}`);
    if (endCount !== 1) errors.push(`Expected 1 END tile, found ${endCount}`);
    
    // Check moving walls
    if (maze.moving_walls.length < 2 || maze.moving_walls.length > 3) {
        errors.push(`Expected 2-3 moving walls, found ${maze.moving_walls.length}`);
    }
    
    // Check hearts array
    if (maze.hearts.length !== 2) {
        errors.push(`Expected 2 hearts in hearts array, found ${maze.hearts.length}`);
    }
    
    // Check solvability
    if (!canSolveMaze(maze.grid)) {
        errors.push('Maze is not solvable');
    }
    
    return errors;
}

// Validate all mazes in pool
function validateMazePool() {
    console.log('Validating maze pool with', MAZE_POOL.length, 'mazes...');
    let validCount = 0;
    let invalidCount = 0;
    
    for (const maze of MAZE_POOL) {
        const errors = validateMaze(maze);
        if (errors.length === 0) {
            validCount++;
        } else {
            invalidCount++;
            console.error(`Maze ${maze.id} validation errors:`, errors);
        }
    }
    
    console.log(`Maze pool validation complete: ${validCount} valid, ${invalidCount} invalid (${MAZE_POOL.length} total)`);
    return invalidCount === 0;
}

// Get maze by index
function getMazeById(index) {
    if (index < 0 || index >= MAZE_POOL.length) {
        console.error(`Invalid maze index: ${index}`);
        return MAZE_POOL[0];
    }
    return MAZE_POOL[index];
}

// Get total maze count
function getMazeCount() {
    return MAZE_POOL.length;
}

// Run validation immediately
if (typeof validateMazePool === 'function') {
    validateMazePool();
}
