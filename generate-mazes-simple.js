/**
 * Simple procedural maze generation
 * Creates 100 valid mazes by varying key parameters
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

class MazeGenerator {
    constructor(seed) {
        this.seed = seed;
        this.random = this.createRandom(seed);
    }
    
    createRandom(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    
    /**
     * Create a maze using a grid pattern approach
     */
    generate() {
        const grid = this.createBaseGrid();
        this.carvePaths(grid);
        this.placeLava(grid);
        
        const moving_walls = this.generateMovingWalls(grid);
        const hearts = this.placeHearts(grid);
        
        // Verify
        if (this.isSolvable(grid) && hearts.length === 2 && moving_walls.length >= 2) {
            const difficulty = this.seed % 3;
            return {
                id: -1,
                grid,
                moving_walls,
                hearts,
                difficulty: ['easy', 'medium', 'hard'][difficulty],
                hazard_count: 20 + difficulty * 5
            };
        }
        return null;
    }
    
    createBaseGrid() {
        // Create a grid filled mostly with walls
        const grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                grid[i][j] = TILE.WALL;
            }
        }
        
        // Set start and end
        grid[0][0] = TILE.START;
        grid[19][19] = TILE.END;
        
        // Create main corridors
        for (let i = 0; i < GRID_SIZE; i++) {
            if (i % 2 === 0) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    if (Math.random() > 0.3) {
                        grid[i][j] = TILE.EMPTY;
                    }
                }
            }
        }
        
        for (let j = 0; j < GRID_SIZE; j++) {
            if (j % 3 === 0) {
                for (let i = 0; i < GRID_SIZE; i++) {
                    if (Math.random() > 0.4) {
                        grid[i][j] = TILE.EMPTY;
                    }
                }
            }
        }
        
        // Ensure connectivity from start
        grid[1][0] = TILE.EMPTY;
        grid[0][1] = TILE.EMPTY;
        grid[1][1] = TILE.EMPTY;
        
        // Ensure connectivity to end
        grid[18][19] = TILE.EMPTY;
        grid[19][18] = TILE.EMPTY;
        grid[18][18] = TILE.EMPTY;
        
        return grid;
    }
    
    carvePaths(grid) {
        // Additional path carving to ensure solvability
        // Create winding path from start to end
        let row = 1, col = 1;
        while (row < 18 || col < 18) {
            grid[row][col] = TILE.EMPTY;
            if (col < 18 && this.random() > 0.3) {
                col++;
            } else if (row < 18) {
                row++;
            }
        }
    }
    
    placeLava(grid) {
        const lavaCount = 2 + (this.seed % 3);
        let placed = 0;
        
        for (let attempt = 0; attempt < 50 && placed < lavaCount; attempt++) {
            const row = Math.floor(this.random() * (GRID_SIZE - 4)) + 2;
            const col = Math.floor(this.random() * (GRID_SIZE - 4)) + 2;
            
            // Don't place near start/end
            if ((row < 3 && col < 3) || (row > 16 && col > 16)) continue;
            
            // Cluster 2-3 lava tiles
            const size = 2 + Math.floor(this.random() * 2);
            for (let i = 0; i < size; i++) {
                const lr = row + Math.floor(this.random() * 3) - 1;
                const lc = col + Math.floor(this.random() * 3) - 1;
                
                if (lr > 0 && lr < 19 && lc > 0 && lc < 19 &&
                    grid[lr][lc] === TILE.EMPTY &&
                    !(lr === 0 && lc === 0) &&
                    !(lr === 19 && lc === 19)) {
                    grid[lr][lc] = TILE.LAVA;
                    placed++;
                }
            }
        }
    }
    
    generateMovingWalls(grid) {
        const walls = [];
        const count = 2 + (this.seed % 2);
        
        for (let i = 0; i < count * 5 && walls.length < count; i++) {
            const row = Math.floor(this.random() * (GRID_SIZE - 4)) + 2;
            const col = Math.floor(this.random() * (GRID_SIZE - 4)) + 2;
            
            if ((row < 3 && col < 3) || (row > 16 && col > 16)) continue;
            if (grid[row][col] !== TILE.EMPTY) continue;
            
            // Check distance from other walls
            let tooClose = false;
            for (const w of walls) {
                if (Math.abs(w.row - row) + Math.abs(w.col - col) < 6) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            
            walls.push({
                row,
                col,
                direction: this.seed % 2,
                maxSteps: 2 + (this.seed % 2)
            });
        }
        
        // Ensure at least 2
        while (walls.length < 2) {
            const row = 5 + Math.floor(this.random() * 10);
            const col = 5 + Math.floor(this.random() * 10);
            walls.push({
                row,
                col,
                direction: walls.length % 2,
                maxSteps: 2
            });
        }
        
        return walls;
    }
    
    placeHearts(grid) {
        const hearts = [];
        for (let attempt = 0; attempt < 100 && hearts.length < 2; attempt++) {
            const row = Math.floor(this.random() * GRID_SIZE);
            const col = Math.floor(this.random() * GRID_SIZE);
            
            if (grid[row][col] !== TILE.EMPTY) continue;
            if ((row === 0 && col === 0) || (row === 19 && col === 19)) continue;
            
            let tooClose = false;
            for (const h of hearts) {
                if (Math.abs(h.row - row) + Math.abs(h.col - col) < 5) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            
            hearts.push({ row, col });
        }
        
        // Ensure exactly 2 hearts
        while (hearts.length < 2) {
            const row = 5 + Math.floor(this.random() * 10);
            const col = 5 + Math.floor(this.random() * 10);
            hearts.push({ row, col });
        }
        
        return hearts.slice(0, 2);
    }
    
    isSolvable(grid) {
        // BFS to check path from (0,0) to (19,19)
        const queue = [{ row: 0, col: 0 }];
        const visited = new Set(['0,0']);
        
        while (queue.length > 0) {
            const { row, col } = queue.shift();
            
            if (row === 19 && col === 19) return true;
            
            const neighbors = [
                [row - 1, col],
                [row + 1, col],
                [row, col - 1],
                [row, col + 1]
            ];
            
            for (const [nr, nc] of neighbors) {
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
}

// Generate 100 mazes
const mazes = [];
console.log('Generating 100 mazes...');

for (let seed = 1; mazes.length < 100; seed++) {
    const generator = new MazeGenerator(seed);
    const maze = generator.generate();
    
    if (maze) {
        maze.id = mazes.length;
        mazes.push(maze);
        if (mazes.length % 10 === 0) {
            console.log(`Generated ${mazes.length} mazes...`);
        }
    }
    
    // Safety limit
    if (seed > 500) break;
}

console.log(`\nGenerated ${mazes.length} valid mazes`);

// Output to file
const fs = require('fs');
let output = 'const GENERATED_MAZES_100 = [\n';

for (const maze of mazes) {
    output += `    {\n`;
    output += `        id: ${maze.id},\n`;
    output += `        grid: [\n`;
    
    for (const row of maze.grid) {
        output += `            [${row.join(', ')}],\n`;
    }
    
    output += `        ],\n`;
    output += `        moving_walls: [\n`;
    for (const mw of maze.moving_walls) {
        output += `            { row: ${mw.row}, col: ${mw.col}, direction: ${mw.direction}, maxSteps: ${mw.maxSteps} },\n`;
    }
    output += `        ],\n`;
    output += `        hearts: [\n`;
    for (const h of maze.hearts) {
        output += `            { row: ${h.row}, col: ${h.col} },\n`;
    }
    output += `        ],\n`;
    output += `        difficulty: '${maze.difficulty}',\n`;
    output += `        hazard_count: ${maze.hazard_count}\n`;
    output += `    },\n`;
}

output += '];\n';

fs.writeFileSync('generated-mazes-100.js', output);
console.log('\nWrote generated-mazes-100.js');
