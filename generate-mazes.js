/**
 * Procedural maze generation algorithm
 * Generates 100+ unique 20x20 mazes with varied difficulty
 */

const GRID_SIZE = 20;
const TILE = {
    EMPTY: 0,
    WALL: 1,
    LAVA: 2,
    START: 3,
    END: 4,
    MOVING_WALL: 5,
    HEART: 6
};

/**
 * Generate a single procedural maze
 * Uses a hybrid approach: recursive backtracking for maze structure + manual adjustments
 */
function generateSingleMaze(seed) {
    // Use seed for reproducibility
    const random = seededRandom(seed);
    
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(TILE.WALL));
    
    // Carve passages using recursive backtracking
    const visited = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
    carveMaze(grid, visited, 1, 1, random);
    
    // Place START at (0, 0)
    grid[0][0] = TILE.START;
    
    // Place END at (19, 19)
    grid[19][19] = TILE.END;
    
    // Place lava sections
    const difficulty = seed % 3; // 0=easy, 1=medium, 2=hard
    const lavaCount = 2 + difficulty;
    for (let i = 0; i < lavaCount; i++) {
        placeLavaSection(grid, random);
    }
    
    // Generate moving walls (2-3)
    const movingWallCount = 2 + Math.floor(random() * 2);
    const moving_walls = [];
    for (let i = 0; i < movingWallCount; i++) {
        const mw = placeMovingWall(grid, random, moving_walls);
        if (mw) moving_walls.push(mw);
    }
    
    // Generate hearts (always 2)
    const hearts = [];
    placeHearts(grid, hearts, random);
    
    // Validate maze before returning
    if (!validateGeneratedMaze(grid, moving_walls, hearts)) {
        return null;
    }
    
    return {
        grid,
        moving_walls,
        hearts,
        difficulty: ['easy', 'medium', 'hard'][difficulty],
        hazard_count: lavaCount * 4 + movingWallCount
    };
}

/**
 * Seeded random number generator for reproducibility
 */
function seededRandom(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

/**
 * Recursive backtracking maze carving algorithm
 */
function carveMaze(grid, visited, row, col, random) {
    visited[row][col] = true;
    grid[row][col] = TILE.EMPTY;
    
    // Directions: UP, RIGHT, DOWN, LEFT
    const directions = [
        { dr: -2, dc: 0 },
        { dr: 0, dc: 2 },
        { dr: 2, dc: 0 },
        { dr: 0, dc: -2 }
    ];
    
    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    for (const { dr, dc } of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow > 0 && newRow < GRID_SIZE - 1 && newCol > 0 && newCol < GRID_SIZE - 1 && !visited[newRow][newCol]) {
            // Carve wall between current and next
            grid[row + dr / 2][col + dc / 2] = TILE.EMPTY;
            carveMaze(grid, visited, newRow, newCol, random);
        }
    }
}

/**
 * Place a lava section (2-4 tiles clustered together)
 */
function placeLavaSection(grid, random) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 20) {
        const row = Math.floor(random() * (GRID_SIZE - 4)) + 2;
        const col = Math.floor(random() * (GRID_SIZE - 4)) + 2;
        
        // Check if location is empty and not near start/end
        if (grid[row][col] === TILE.EMPTY && 
            !(row < 3 && col < 3) && 
            !(row > 16 && col > 16)) {
            
            // Place 2-4 lava tiles in a cluster
            const size = 2 + Math.floor(random() * 3);
            for (let i = 0; i < size && i < 4; i++) {
                const lavRow = row + Math.floor(random() * 3) - 1;
                const lavCol = col + Math.floor(random() * 3) - 1;
                
                if (lavRow > 0 && lavRow < GRID_SIZE - 1 && 
                    lavCol > 0 && lavCol < GRID_SIZE - 1 &&
                    grid[lavRow][lavCol] === TILE.EMPTY &&
                    !(lavRow === 0 && lavCol === 0) &&
                    !(lavRow === 19 && lavCol === 19)) {
                    grid[lavRow][lavCol] = TILE.LAVA;
                }
            }
            placed = true;
        }
        attempts++;
    }
}

/**
 * Place a moving wall at an empty location
 */
function placeMovingWall(grid, random, existingWalls) {
    let attempts = 0;
    
    while (attempts < 20) {
        const row = Math.floor(random() * (GRID_SIZE - 4)) + 2;
        const col = Math.floor(random() * (GRID_SIZE - 4)) + 2;
        
        // Check if location is empty and not near start/end
        if (grid[row][col] === TILE.EMPTY && 
            !(row < 3 && col < 3) && 
            !(row > 16 && col > 16)) {
            
            // Check not too close to other moving walls
            let tooClose = false;
            for (const mw of existingWalls) {
                const dist = Math.abs(mw.row - row) + Math.abs(mw.col - col);
                if (dist < 5) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                const direction = Math.floor(random() * 2); // 0=horizontal, 1=vertical
                const maxSteps = 2 + Math.floor(random() * 2); // 2-3 steps
                
                return {
                    row,
                    col,
                    direction,
                    maxSteps
                };
            }
        }
        attempts++;
    }
    
    return null;
}

/**
 * Place exactly 2 heart collectibles
 */
function placeHearts(grid, hearts, random) {
    let placed = 0;
    const attempts = 100;
    let attemptCount = 0;
    
    while (placed < 2 && attemptCount < attempts) {
        const row = Math.floor(random() * GRID_SIZE);
        const col = Math.floor(random() * GRID_SIZE);
        
        // Check if location is valid (empty, not start/end, not too close to other hearts)
        if (grid[row][col] === TILE.EMPTY &&
            !(row === 0 && col === 0) &&
            !(row === 19 && col === 19)) {
            
            // Check not too close to other hearts
            let tooClose = false;
            for (const h of hearts) {
                const dist = Math.abs(h.row - row) + Math.abs(h.col - col);
                if (dist < 4) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                hearts.push({ row, col });
                placed++;
            }
        }
        attemptCount++;
    }
}

/**
 * Validate that generated maze has a path from start to end
 */
function validateGeneratedMaze(grid, movingWalls, hearts) {
    // Check grid is 20x20
    if (grid.length !== GRID_SIZE) return false;
    for (const row of grid) {
        if (row.length !== GRID_SIZE) return false;
    }
    
    // Check for START and END
    let hasStart = false;
    let hasEnd = false;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === TILE.START) hasStart = true;
            if (grid[row][col] === TILE.END) hasEnd = true;
        }
    }
    
    if (!hasStart || !hasEnd) return false;
    
    // Check moving walls count
    if (movingWalls.length < 2 || movingWalls.length > 3) return false;
    
    // Check hearts count
    if (hearts.length !== 2) return false;
    
    // Check maze is solvable using BFS
    return isMazeSolvable(grid);
}

/**
 * BFS to check if maze is solvable
 */
function isMazeSolvable(grid) {
    let start = null;
    let end = null;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === TILE.START) start = { row, col };
            if (grid[row][col] === TILE.END) end = { row, col };
        }
    }
    
    if (!start || !end) return false;
    
    const queue = [start];
    const visited = new Set([`${start.row},${start.col}`]);
    
    while (queue.length > 0) {
        const { row, col } = queue.shift();
        
        if (row === end.row && col === end.col) return true;
        
        const neighbors = [
            { row: row - 1, col },
            { row: row + 1, col },
            { row, col: col - 1 },
            { row, col: col + 1 }
        ];
        
        for (const { row: nr, col: nc } of neighbors) {
            if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
            
            const key = `${nr},${nc}`;
            if (visited.has(key)) continue;
            
            const tile = grid[nr][nc];
            if (tile === TILE.WALL || tile === TILE.LAVA) continue;
            
            visited.add(key);
            queue.push({ row: nr, col: nc });
        }
    }
    
    return false;
}

/**
 * Generate all 100+ mazes
 */
function generateAllMazes() {
    const mazes = [];
    let id = 0;
    let failedCount = 0;
    
    // Generate 120 attempts to get 100 valid mazes
    for (let seed = 1; seed <= 150 && mazes.length < 100; seed++) {
        const maze = generateSingleMaze(seed);
        if (maze) {
            maze.id = mazes.length;
            mazes.push(maze);
            console.log(`Generated maze ${mazes.length}/100 (seed: ${seed})`);
        } else {
            failedCount++;
        }
    }
    
    console.log(`\nGeneration complete: ${mazes.length} valid mazes, ${failedCount} failed`);
    return mazes;
}

// Generate and output mazes
const generatedMazes = generateAllMazes();

// Output JavaScript code
console.log('\n// Generated mazes - copy this into maze-pool.js');
console.log('const GENERATED_MAZES = [');

for (const maze of generatedMazes) {
    console.log(`    {`);
    console.log(`        id: ${maze.id},`);
    console.log(`        grid: [`);
    for (const row of maze.grid) {
        console.log(`            [${row.join(', ')}],`);
    }
    console.log(`        ],`);
    console.log(`        moving_walls: [`);
    for (const mw of maze.moving_walls) {
        console.log(`            { row: ${mw.row}, col: ${mw.col}, direction: ${mw.direction}, maxSteps: ${mw.maxSteps} },`);
    }
    console.log(`        ],`);
    console.log(`        hearts: [`);
    for (const h of maze.hearts) {
        console.log(`            { row: ${h.row}, col: ${h.col} },`);
    }
    console.log(`        ],`);
    console.log(`        difficulty: '${maze.difficulty}',`);
    console.log(`        hazard_count: ${maze.hazard_count}`);
    console.log(`    },`);
}

console.log(`];`);
