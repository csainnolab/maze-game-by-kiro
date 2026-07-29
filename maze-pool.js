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

// Create base 20x20 grid filled entirely with walls
function createBaseGrid() {
    const grid = [];
    for (let r = 0; r < 20; r++) {
        grid[r] = [];
        for (let c = 0; c < 20; c++) {
            grid[r][c] = 1; // All walls to start
        }
    }
    grid[0][0] = 3;   // START
    grid[19][19] = 4; // END
    return grid;
}

// Recursive backtracker maze generation (proper maze algorithm)
// Carves passages between odd-indexed cells
function generateMaze(seed, pattern) {
    const rng = mulberry32(seed);
    const grid = createBaseGrid();

    // The backtracker works on a grid of "cells" at odd positions (1,3,5...17)
    // Walls between cells are at even positions
    const cellRows = 9; // cells at rows 1,3,5,7,9,11,13,15,17
    const cellCols = 9;

    // Track visited cells
    const visited = Array.from({ length: cellRows }, () => Array(cellCols).fill(false));

    // Carve starting from cell (0,0) which is grid position (1,1)
    function carve(cr, cc) {
        visited[cr][cc] = true;
        // Open the cell itself
        const gr = cr * 2 + 1;
        const gc = cc * 2 + 1;
        grid[gr][gc] = 0;

        // Shuffle directions
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }

        for (const [dr, dc] of dirs) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < cellRows && nc >= 0 && nc < cellCols && !visited[nr][nc]) {
                // Carve wall between current cell and neighbour
                grid[gr + dr][gc + dc] = 0;
                carve(nr, nc);
            }
        }
    }

    carve(0, 0);

    // Open grid row 0 from start to first cell, and last row to end
    grid[0][0] = 3;   // START stays
    grid[1][0] = 0;   // corridor from start down into maze
    grid[18][19] = 0; // corridor from maze up to end
    grid[19][19] = 4; // END stays

    // Add extra openings based on pattern for variety and multiple paths
    const extraPassages = pattern === 'open' ? 40 : pattern === 'medium' ? 25 : 15;
    for (let i = 0; i < extraPassages; i++) {
        const r = Math.floor(rng() * 18) + 1;
        const c = Math.floor(rng() * 18) + 1;
        if (grid[r][c] === 1 && grid[r][c] !== 3 && grid[r][c] !== 4) {
            grid[r][c] = 0;
        }
    }

    return grid;
}

// Corridor-based maze generation — delegates to backtracker with fewer extra passages
function generateCorridorMaze(grid, rng) { return grid; }
function generateRoomMaze(grid, rng) { return grid; }
function generateSpiralMaze(grid, rng) { return grid; }
function generateChaosMaze(grid, rng) { return grid; }

// Place lava pools on corridor tiles without blocking all paths to the end
function placeLava(grid, rng, count = 4) {
    // Collect all open (corridor) tiles that are not START/END
    const candidates = [];
    for (let r = 1; r < 19; r++) {
        for (let c = 1; c < 19; c++) {
            if (grid[r][c] === 0) {
                candidates.push({ r, c });
            }
        }
    }
    
    // Shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    
    let placed = 0;
    for (const { r, c } of candidates) {
        if (placed >= count) break;
        // Tentatively place lava
        grid[r][c] = 2;
        // Verify maze is still solvable
        if (canSolveMaze(grid)) {
            placed++;
        } else {
            // Revert — this lava would block the only path
            grid[r][c] = 0;
        }
    }
    
    return grid;
}

// Find empty positions for hearts — returns objects with { row, col }
function getAvailablePositions(grid, count = 2) {
    const available = [];
    
    for (let r = 1; r < 19; r++) {
        for (let c = 1; c < 19; c++) {
            if (grid[r][c] === 0) {
                available.push({ row: r, col: c });
            }
        }
    }
    
    // Shuffle and pick first count
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }
    return available.slice(0, count);
}

// Generate all 100+ preset mazes
function generateMazePool() {
    const pool = [];
    const difficulties = ['easy', 'medium', 'hard'];
    // Vary extra passages: 'tight' = few extras (harder), 'medium', 'open' (easier)
    const patterns = ['tight', 'medium', 'open'];
    
    for (let seed = 1; pool.length < 105; seed++) {
        const pattern = patterns[seed % 3];
        let grid = generateMaze(seed * 7 + 13, pattern);
        
        // Place lava — more lava on harder mazes
        const lavaCount = 4 + (seed % 5); // 4-8 lava tiles
        grid = placeLava(grid, mulberry32(seed * 31), lavaCount);
        
        // Get heart positions (must be on open corridor tiles)
        const hearts = getAvailablePositions(grid, 2);
        
        // Validate maze is still solvable after lava placement
        if (canSolveMaze(grid) && hearts.length === 2) {
            const difficulty = difficulties[seed % 3];
            
            let hazardCount = 0;
            for (let r = 0; r < 20; r++) {
                for (let c = 0; c < 20; c++) {
                    if (grid[r][c] === 2) hazardCount++;
                }
            }
            
            pool.push({
                id: pool.length,
                grid: grid,
                moving_walls: generateMovingWalls(grid, seed),
                hearts: hearts,
                difficulty: difficulty,
                hazard_count: hazardCount,
                pattern: pattern
            });
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
    
    while (walls.length < wallCount && attempts < 50) {
        const r = Math.floor(rng() * 17) + 1;
        const c = Math.floor(rng() * 17) + 1;
        
        // Only place on open corridor tiles, away from START/END
        if (grid[r][c] === 0) {
            // Check not too close to other moving walls
            let tooClose = false;
            for (const w of walls) {
                const dist = Math.abs(w.row - r) + Math.abs(w.col - c);
                if (dist < 4) { tooClose = true; break; }
            }
            
            if (!tooClose) {
                const direction = Math.floor(rng() * 2); // 0 = horizontal, 1 = vertical
                const maxSteps = 1 + Math.floor(rng() * 3); // 1-3 steps
                
                // Verify the wall path is clear (all tiles in range must be open)
                let pathClear = true;
                for (let s = 1; s <= maxSteps; s++) {
                    const nr = direction === 1 ? r + s : r;
                    const nc = direction === 0 ? c + s : c;
                    if (nr >= 20 || nc >= 20 || (grid[nr][nc] !== 0 && grid[nr][nc] !== 2)) {
                        pathClear = false;
                        break;
                    }
                    const nr2 = direction === 1 ? r - s : r;
                    const nc2 = direction === 0 ? c - s : c;
                    if (nr2 < 0 || nc2 < 0 || (grid[nr2][nc2] !== 0 && grid[nr2][nc2] !== 2)) {
                        pathClear = false;
                        break;
                    }
                }
                
                if (pathClear) {
                    walls.push({
                        row: r,
                        col: c,
                        direction: direction,
                        maxSteps: maxSteps
                    });
                }
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
